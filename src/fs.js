"use strict";
var FileSystem;
(function (FileSystem) {
    let FileType;
    (function (FileType) {
        FileType[FileType["Directory"] = 0] = "Directory";
        FileType[FileType["File"] = 1] = "File";
    })(FileType || (FileType = {}));
    function setUrl(path) {
        path = path.replace(/\/\/+/g, "/");
        history.pushState("", "", "/explorer" + path);
        document.querySelector("title").innerText = "File Explorer | " + path;
    }
    async function readDirectory(path) {
        let entries = await request("/files.php?dir=" + path);
        let folders = entries.filter(e => e.type == FileType.Directory);
        let files = entries.filter(e => e.type == FileType.File);
        let sorter = (a, b) => {
            let aName = a.path.toLowerCase();
            let bName = b.path.toLowerCase();
            if (aName > bName)
                return 1;
            else if (aName < bName)
                return -1;
            else
                return 0;
        };
        folders.sort(sorter);
        files.sort(sorter);
        entries = folders.concat(files);
        return entries.map(e => {
            var entry;
            if (e.type == FileType.Directory)
                entry = new DirectoryEntry(e.path);
            else if (e.type == FileType.File)
                entry = new FileEntry(e.path);
            else
                return;
            entry.physicalPath = e.physicalPath;
            entry.icon = e.icon;
            entry.type = e.type;
            if (entry.isFile()) {
                entry.size = e.size;
                if (entries.length <= 50 && entry.isImage()) {
                    entry.setIconToPreview();
                }
            }
            return entry;
        });
    }
    FileSystem.readDirectory = readDirectory;
    async function request(path, data = {}, method = "POST") {
        data || (data = {});
        switch (method) {
            case "FORM-GET":
            case "FORM-POST":
                method = method.substring(5);
                let form = document.createElement("form");
                form.hidden = true;
                document.body.append(form);
                form.action = path;
                form.method = method;
                for (const key in data) {
                    let value = data[key];
                    if (Array.isArray(value)) {
                        for (let i = 0; i < value.length; i++) {
                            const v = value[i];
                            const inp = document.createElement("input");
                            inp.name = key + "[]";
                            inp.value = v;
                            form.append(inp);
                        }
                    }
                    else if (typeof value == "string") {
                        const inp = document.createElement("input");
                        inp.name = key;
                        inp.value = value;
                        form.append(inp);
                    }
                    form.submit();
                    form.remove();
                }
                return {};
            default: {
                const fd = new FormData();
                for (const key in data) {
                    let value = data[key];
                    if (Array.isArray(value)) {
                        for (let i = 0; i < value.length; i++) {
                            const v = value[i];
                            fd.append(key + "[]", v);
                        }
                    }
                    else {
                        fd.append(key, value);
                    }
                }
                const res = await fetch(path, {
                    body: fd,
                    method: method
                });
                return await res.json();
            }
        }
    }
    FileSystem.request = request;
    class Entry {
        constructor(path, type) {
            this.path = path;
            this.type = type;
            this.element = document.createElement("div");
            this.treeElement = document.createElement("div");
            this.path = this.path.replace(/\/\/+/g, "/");
            this.treeElement.entry = this;
            this.treeElement.classList.add("treeEntryElement");
            this.element.entry = this;
            this.element.classList.add("entryElement");
            this.element.draggable = true;
        }
        static deselectAll() {
            document.querySelectorAll(".entryElement[selected]").forEach(e => e.entry.selected = false);
        }
        getName() {
            return this.path.split("/").pop();
        }
        setDetails() {
            let entryinfo = document.getElementById("entryinfo");
            function br() { return document.createElement("br"); }
            function hr() { return document.createElement("hr"); }
            entryinfo.innerHTML = "";
            if (this.isDirectory()) {
                let self = this;
                let newFolder = document.createElement("button");
                newFolder.innerText = "New Folder";
                newFolder.addEventListener("click", () => {
                    self.newFolder();
                });
                let folderInput = document.createElement("input");
                folderInput.type = "file";
                folderInput.multiple = true;
                let folderUploadButton = document.createElement("button");
                folderUploadButton.innerText = "Upload folder";
                folderUploadButton.addEventListener("click", () => {
                    folderInput.click();
                });
                folderInput.toggleAttribute("webkitdirectory", true);
                folderInput.addEventListener("change", async (e) => {
                    let files = FileSystem.fileListToArray(folderInput.files);
                    let maxFiles = 5;
                    let len = Math.ceil(files.length / maxFiles);
                    let totalFiles = files.length;
                    for (let i = 0; i < len; i++) {
                        const bulk = files.splice(0, maxFiles);
                        console.log(i + "/" + len);
                        console.log(bulk);
                        await FileSystem.currentDirectory.uploadFile(bulk, percent => `Uploading ${totalFiles} files...\n${(((100 / len) * i) + (percent / len)).toFixed(2)}%`);
                    }
                    FileSystem.currentDirectory.open();
                });
                let fileInput = document.createElement("input");
                fileInput.type = "file";
                fileInput.multiple = true;
                let fileUploadButton = document.createElement("button");
                fileUploadButton.innerText = "Upload files";
                fileUploadButton.addEventListener("click", () => {
                    fileInput.click();
                });
                // fileInput.toggleAttribute("webkitdirectory", true);
                fileInput.addEventListener("change", async (e) => {
                    let files = FileSystem.fileListToArray(fileInput.files);
                    let maxFiles = 5;
                    let len = Math.ceil(files.length / maxFiles);
                    let totalFiles = files.length;
                    for (let i = 0; i < len; i++) {
                        const bulk = files.splice(0, maxFiles);
                        console.log(i + "/" + len);
                        console.log(bulk);
                        await FileSystem.currentDirectory.uploadFile(bulk, percent => `Uploading ${totalFiles} files...\n${(((100 / len) * i) + (percent / len)).toFixed(2)}%`);
                    }
                    FileSystem.currentDirectory.open();
                });
                entryinfo.append(newFolder, hr(), fileUploadButton, br(), folderUploadButton, hr());
            }
            if (this.path != "/") {
                let deleteEntry = document.createElement("button");
                deleteEntry.innerText = "Delete";
                deleteEntry.addEventListener("click", () => {
                    if (confirm("Are you sure you want to delete \"" + this.getName() + "\"")) {
                        this.delete();
                    }
                });
                let renameEntry = document.createElement("button");
                renameEntry.innerText = "Rename";
                renameEntry.addEventListener("click", () => {
                    this.rename();
                });
                entryinfo.append(br(), renameEntry, br(), deleteEntry, hr());
                if (this.isDirectory()) {
                    this.read().then(es => {
                        entryinfo.append(hr(), `Items: ${es.length}`);
                    });
                }
            }
            entryinfo.append("Full Path: " + this.path, hr(), "Name: " + this.getName(), hr());
            if (this.isFile()) {
                entryinfo.append("Size: " + this.parseSize(), hr());
                let ext = this.getExt();
                function isExtType(exts) {
                    return exts.indexOf(ext.toLowerCase()) != -1;
                }
                if (this.isImage()) {
                    // Editor
                    let img = document.createElement("img");
                    img.src = this.view();
                    img.classList.add("previewimage");
                    entryinfo.append(img, hr());
                }
                if (isExtType([
                    "json",
                    "ts",
                    "js",
                    "txt"
                ])) {
                    // Editor
                    let openInEditor = document.createElement("button");
                    openInEditor.innerText = "Open in editor...";
                    let self = this;
                    openInEditor.addEventListener("click", () => {
                        self.openInEditor();
                    });
                    entryinfo.append(openInEditor, hr());
                }
            }
            setTimeout(() => {
                let selected = Entry.getSelectedEntries();
                let deleteSelected = document.createElement("button");
                deleteSelected.innerText = "Delete selected";
                deleteSelected.addEventListener("click", async () => {
                    // let selected = FileSystem.Entry.getSelectedEntries();
                    if (selected.length > 0 && confirm(`Are you sure you want to delete ${selected.length} files?`)) {
                        await FileSystem.Entry.bulkDelete(selected);
                        setTimeout(() => {
                            FileSystem.currentDirectory.open();
                        }, 0);
                    }
                });
                let zipSeleted = document.createElement("button");
                let zipText = "Zip & download selected";
                zipSeleted.innerText = zipText;
                zipSeleted.addEventListener("click", async () => {
                    zipSeleted.innerHTML = "";
                    zipSeleted.append(loadingSpinner());
                    // let selected = FileSystem.Entry.getSelectedEntries();
                    let allFiles = [];
                    async function addFilestoZip(files) {
                        for (let i = 0; i < files.length; i++) {
                            const file = files[i];
                            if (file.element.isConnected) {
                                file.element.innerHTML = "";
                                file.element.append(loadingSpinner());
                            }
                            if (file.isFile()) {
                                allFiles.push(file);
                            }
                            else if (file.isDirectory()) {
                                await addFilestoZip(await file.read());
                            }
                        }
                        console.log(allFiles.length);
                    }
                    await addFilestoZip(selected);
                    await zip(allFiles).then(console.log);
                    zipSeleted.innerText = zipText;
                    selected.forEach(file => {
                        if (file.element.isConnected) {
                            file.updateElement();
                        }
                    });
                });
                let sizeValues = selected.filter(e => e.isFile()).map(e => e.size);
                sizeValues.unshift(0);
                let totalSize = FileEntry.parseSize(sizeValues.reduce((p, c) => p + c));
                if (selected.length > 1) {
                    entryinfo.append(`Selected: ${selected.length} items`, br(), `Selected size: ${totalSize}`, hr(), zipSeleted, deleteSelected);
                }
                else if (selected.length == 1 && selected[0].isDirectory()) {
                    entryinfo.append(zipSeleted);
                }
                else if (selected.length == 1 && selected[0].isFile()) {
                    let openButton = document.createElement("button");
                    openButton.innerText = "Open";
                    openButton.addEventListener("click", async () => {
                        window.open(selected[0].view(), "_blank");
                    });
                    entryinfo.append(openButton);
                }
            }, 0);
        }
        isFile() {
            return this instanceof FileEntry;
        }
        isDirectory() {
            return this instanceof DirectoryEntry;
        }
        get selected() {
            return this.element.hasAttribute("selected");
        }
        ;
        set selected(v) {
            this.element.toggleAttribute("selected", v);
        }
        ;
        static getCurrentEntries() {
            return [...document.querySelectorAll(".entryElement")].map(e => e.entry);
        }
        static getSelectedEntries() {
            return [...document.querySelectorAll(".entryElement[selected]")].map(e => e.entry);
        }
        static async bulkDelete(bulk) {
            // let fc = document.querySelector("#filecontainer");
            // fc.innerHTML = "";
            // fc.appendChild(FileSystem.loadingSpinner());
            for (let i = 0; i < bulk.length; i++) {
                const file = bulk[i];
                if (file.isDirectory() && (await file.read()).length > 0) {
                    if (confirm("One or more folders are not empty and all contents will be delete from inside of them, are you sure you want to delete these folder(s)?")) {
                        break;
                    }
                    else {
                        return;
                    }
                }
            }
            for (let i = 0; i < bulk.length; i++) {
                const e = bulk[i];
                e.element.innerHTML = "";
                e.element.appendChild(FileSystem.loadingSpinner());
                await e.delete(true, true);
            }
        }
        async rename(newName, skipReload = false) {
            if (this.path == "/") {
                alert("You cannot rename the root folder.");
                return { success: false, reason: "You cannot rename the root folder." };
            }
            if (!newName) {
                modal((m, cm) => {
                    let div = document.createElement("div");
                    let p = document.createElement("p");
                    p.innerText = "Renaming \"" + this.getName() + "\"...";
                    let nameInput = document.createElement("input");
                    nameInput.value = this.getName();
                    let ext = "";
                    if (this.isFile())
                        ext = this.getExt();
                    setTimeout(() => {
                        nameInput.focus();
                        nameInput.setSelectionRange(0, this.getName().length - (ext ? ext.length + 1 : 0));
                        nameInput.style.fontSize = "24px";
                        nameInput.style.width = "100%";
                    }, 0);
                    let create = document.createElement("button");
                    create.innerText = "Rename";
                    create.addEventListener("click", async () => {
                        let name = nameInput.value.trim();
                        if (name != "") {
                            cm();
                            return await request("/operators/rename.php", {
                                "target": this.path,
                                "newname": name
                            }).then(res => {
                                if (res.success) {
                                    if (skipReload != true)
                                        FileSystem.currentDirectory.open();
                                }
                                else {
                                    alert(res.reason);
                                }
                                return res;
                            });
                        }
                    });
                    nameInput.addEventListener("keydown", e => {
                        if (e.key == "Enter") {
                            e.preventDefault();
                            create.click();
                        }
                        else if (e.key == "Escape") {
                            e.stopPropagation();
                            e.preventDefault();
                            cancel.click();
                        }
                    });
                    let cancel = document.createElement("button");
                    cancel.innerText = "Cancel";
                    cancel.addEventListener("click", () => cm());
                    div.append(p, nameInput, document.createElement("br"), create, cancel);
                    return div;
                });
            }
            else {
                return await request("/operators/rename.php", {
                    "target": this.path,
                    "newname": newName
                }).then(res => {
                    if (res.success) {
                        if (skipReload != true)
                            FileSystem.currentDirectory.open();
                    }
                    else {
                        alert(res.reason);
                    }
                    return res;
                });
            }
        }
        async move(newPath, skipReload = false) {
            if (this.path == "/") {
                alert("You cannot move the root folder.");
                return { success: false, reason: "You cannot move the root folder." };
            }
            if (!newPath) {
                modal((m, cm) => {
                    let div = document.createElement("div");
                    let p = document.createElement("p");
                    p.innerText = "Moving \"" + this.getName() + "\"...";
                    let nameInput = document.createElement("input");
                    nameInput.value = this.getName();
                    let ext = "";
                    if (this.isFile())
                        ext = this.getExt();
                    setTimeout(() => {
                        nameInput.focus();
                        nameInput.setSelectionRange(0, this.getName().length - (ext ? ext.length + 1 : 0));
                        nameInput.style.fontSize = "24px";
                        nameInput.style.width = "100%";
                    }, 0);
                    let create = document.createElement("button");
                    create.innerText = "Move";
                    create.addEventListener("click", async () => {
                        let name = nameInput.value.trim();
                        if (name != "") {
                            cm();
                            return await request("/operators/move.php", {
                                "target": this.path,
                                "newname": name
                            }).then(res => {
                                if (res.success) {
                                    if (skipReload != true)
                                        FileSystem.currentDirectory.open();
                                }
                                else {
                                    alert(res.reason);
                                }
                                return res;
                            });
                        }
                    });
                    nameInput.addEventListener("keydown", e => {
                        if (e.key == "Enter") {
                            e.preventDefault();
                            create.click();
                        }
                        else if (e.key == "Escape") {
                            e.stopPropagation();
                            e.preventDefault();
                            cancel.click();
                        }
                    });
                    let cancel = document.createElement("button");
                    cancel.innerText = "Cancel";
                    cancel.addEventListener("click", () => cm());
                    div.append(p, nameInput, document.createElement("br"), create, cancel);
                    return div;
                });
            }
            else {
                return await request("/operators/move.php", {
                    "target": this.path,
                    "newpath": newPath
                }).then(res => {
                    if (res.success) {
                        if (skipReload != true)
                            FileSystem.currentDirectory.open();
                    }
                    else {
                        alert(res.reason);
                    }
                    return res;
                });
            }
        }
        async delete(skipReload = false, forceFolders = false) {
            if (this.path == "/") {
                alert("You cannot delete the root folder.");
                return { success: false, reason: "You cannot delete the root folder." };
            }
            if (this.isDirectory() && (await this.read()).length > 0) {
                if (forceFolders || confirm("\"" + this.getName() + "\" folder is not empty and all contents will be delete from inside of it, are you sure you want to delete this folder?")) {
                    async function removeFilesAndFolders(files) {
                        for (let i = 0; i < files.length; i++) {
                            const file = files[i];
                            if (file.isDirectory()) {
                                await removeFilesAndFolders(await file.read());
                            }
                            await file.delete(true);
                        }
                    }
                    await removeFilesAndFolders(await this.read());
                }
                else
                    return;
                // return alert("You cannot delete folder \""+ this.getName() +"\", as it is not empty.");
            }
            return await request("/operators/delete.php", {
                "target": this.path
            }).then(res => {
                if (res.success) {
                    if (this.element.isConnected)
                        this.element.remove();
                    if (this.treeElement.isConnected)
                        this.treeElement.remove();
                    if (skipReload != true)
                        this.parent.open();
                }
                else {
                    alert(res.reason);
                }
                return res;
            });
        }
    }
    FileSystem.Entry = Entry;
    class DirectoryEntry extends Entry {
        constructor(path) {
            super(path, FileType.Directory);
            this.entries = [];
            this.updateElement();
            let dragDropCallback = async (et, e) => {
                if (et == "dragenter" || et == "dragover" || et == "dragleave") {
                    e.stopPropagation();
                    e.preventDefault();
                }
                let target = e.target;
                while (!target.entry && target.parentElement) {
                    target = target.parentElement;
                }
                if (et == "drop") {
                    e.stopPropagation();
                    e.preventDefault();
                    let selected;
                    if (target.entry && target.entry.isDirectory()) {
                        let files = FileSystem.fileListToArray(e.dataTransfer.files);
                        if (files.length > 0) {
                            let maxFiles = 5;
                            let len = Math.ceil(files.length / maxFiles);
                            let totalFiles = files.length;
                            for (let i = 0; i < len; i++) {
                                const bulk = files.splice(0, maxFiles);
                                console.log(i + "/" + len);
                                console.log(bulk);
                                await target.entry.uploadFile(bulk, percent => `Uploading ${totalFiles} files...\n${(((100 / len) * i) + (percent / len)).toFixed(2)}%`);
                            }
                            if (len > 0)
                                target.entry.open();
                        }
                        else if (target && target.entry && ((selected = Entry.getSelectedEntries()) || true) && selected.findIndex(s => s.path == target.entry.path) == -1) {
                            if (selected.length > 0) {
                                for (let i = 0; i < selected.length; i++) {
                                    const s = selected[i];
                                    console.log(`Moving "${s.path}" to "${target.entry.path}/${s.getName()}"`);
                                    await s.move(target.entry.path + "/" + s.getName());
                                }
                                FileSystem.currentDirectory.open();
                            }
                            else {
                                console.log(e);
                            }
                        }
                    }
                    document.querySelectorAll("[hover]").forEach(e => e.toggleAttribute("hover", false));
                }
                if (et == "dragenter")
                    target.toggleAttribute("hover", true);
                else if (et == "dragleave")
                    target.toggleAttribute("hover", false);
            };
            detectDragDrop(this.treeElement, dragDropCallback);
            detectDragDrop(this.element, dragDropCallback);
        }
        async newFolder(name) {
            if (!name) {
                modal((m, cm) => {
                    let div = document.createElement("div");
                    let p = document.createElement("p");
                    p.innerText = "Creating new folder in \"" + this.path + "\"";
                    let nameInput = document.createElement("input");
                    nameInput.value = "New Folder";
                    setTimeout(() => {
                        nameInput.focus();
                        nameInput.setSelectionRange(0, "New Folder".length);
                        nameInput.style.fontSize = "24px";
                        nameInput.style.width = "100%";
                    }, 0);
                    let create = document.createElement("button");
                    create.innerText = "Create";
                    create.classList.add("green");
                    create.addEventListener("click", () => {
                        let name = nameInput.value.trim();
                        if (name != "") {
                            if (this.entries.findIndex(e => e.getName() == name) != -1) {
                                alert("This name already exists in this folder");
                                return;
                            }
                            request("/operators/mkdir.php", {
                                "target": this.path,
                                "name": name
                            }).then(async () => {
                                await this.open();
                                // (this.entries.find(e => e.getName() == name) as DirectoryEntry).open()
                            });
                            cm();
                        }
                    });
                    nameInput.addEventListener("keydown", e => {
                        if (e.key == "Enter") {
                            e.preventDefault();
                            create.click();
                        }
                        else if (e.key == "Escape") {
                            e.stopPropagation();
                            e.preventDefault();
                            cancel.click();
                        }
                    });
                    let cancel = document.createElement("button");
                    cancel.innerText = "Cancel";
                    cancel.classList.add("red");
                    cancel.addEventListener("click", () => cm());
                    div.append(p, nameInput, document.createElement("br"), create, cancel);
                    return div;
                });
            }
            else {
                request("/operators/mkdir.php", {
                    "target": this.path,
                    "name": name
                }).then(() => this.open());
            }
        }
        uploadFile(files, message) {
            let resolve;
            let promise = new Promise(res => resolve = res);
            if (files.length == 0)
                return;
            let data = new FormData();
            data.append("dir", this.path);
            files.forEach(async (f) => {
                data.append("fileToUpload[]", f);
                data.append("fileName[]", f.webkitRelativePath ? f.webkitRelativePath : f.name);
            });
            let httpReq = new XMLHttpRequest();
            httpReq.open('POST', '/upload.php');
            let closeModal;
            let p;
            modal((m, cm) => {
                closeModal = cm;
                p = document.createElement("p");
                return p;
            });
            // upload progress event
            httpReq.upload.addEventListener('progress', function (e) {
                // upload progress as percentage
                let percent_completed = (e.loaded / e.total) * 100;
                p.innerText = (typeof message == "function") ? message(percent_completed, e.loaded, e.total) : "Uploading... " + percent_completed.toFixed(2) + "%";
                if (typeof message == "string")
                    p.append(document.createElement("hr"), message);
            });
            // request finished event
            httpReq.addEventListener('load', (e) => {
                try {
                    closeModal();
                    let res = JSON.parse(httpReq.response);
                    console.log(res);
                    if (!res.success) {
                        alert(res.reason);
                    }
                    resolve(res);
                }
                catch (error) {
                    console.error(httpReq.response);
                    resolve({ success: false, reason: "Catch went off." });
                }
            });
            // send POST request to server
            httpReq.send(data);
            return promise;
        }
        updateElement() {
            // Tree Entry
            {
                this.treeElement.innerHTML = "";
                const treeDiv = document.createElement("div");
                treeDiv.classList.add("treeEntryItem");
                treeDiv.addEventListener("dblclick", e => {
                    this.open();
                    treeEntriesContainer.toggleAttribute("collapsed", false);
                });
                treeDiv.addEventListener("click", e => {
                    this.setDetails();
                });
                treeDiv.addEventListener("contextmenu", e => {
                    e.preventDefault();
                    if (this.entries.length == 0) {
                        this.open(true);
                        this.setDetails();
                    }
                    else
                        treeEntriesContainer.toggleAttribute("collapsed");
                });
                this.treeElement.appendChild(treeDiv);
                setTimeout(() => {
                    const icon = document.createElement("img");
                    icon.src = this.icon;
                    treeDiv.appendChild(icon);
                    const p = document.createElement("p");
                    p.innerText = this.getName();
                    treeDiv.appendChild(p);
                }, 0);
                const treeEntriesContainer = document.createElement("div");
                treeEntriesContainer.classList.add("treeEntriesContainer");
                this.treeElement.appendChild(treeEntriesContainer);
                this.entries.forEach(e => {
                    treeEntriesContainer.appendChild(e.treeElement);
                });
            }
            // Explorer Entry
            {
                this.element.innerHTML = "";
                const div = document.createElement("div");
                div.classList.add("entryItem");
                div.addEventListener("dblclick", e => {
                    this.open();
                });
                div.addEventListener("contextmenu", e => {
                    e.preventDefault();
                    this.selected = e.ctrlKey ? !this.selected : true;
                    this.setDetails();
                });
                div.addEventListener("click", e => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (!e.ctrlKey)
                        FileSystem.Entry.deselectAll();
                    if (!e.altKey)
                        this.selected = e.ctrlKey ? !this.selected : true;
                    this.setDetails();
                    // let entries = FileSystem.Entry.getCurrentEntries();
                    // let selectedEntries = FileSystem.Entry.getSelectedEntries();
                    // if (selectedEntries.length > 0 && e.altKey && e.ctrlKey) {
                    //   let firstId = entries.findIndex(e => e.path == selectedEntries[0].path);
                    //   let lastId = entries.findIndex(e => e.path == selectedEntries[selectedEntries.length - 1].path);
                    //   let curId = entries.findIndex(e => e.path == this.path);
                    //   if (e.ctrlKey && e.altKey) {
                    //     entries.forEach((entry, i) => {
                    //       if ((firstId < curId && i > firstId && i <= curId) || (lastId > curId && i >= curId && i < lastId)) {
                    //         entry.selected = !entry.selected;
                    //       }
                    //     });
                    //   }
                    // }
                });
                div.addEventListener("touchstart", e => {
                    if (e.touches.length == 2) {
                        this.selected = !this.selected;
                        this.setDetails();
                    }
                });
                this.element.appendChild(div);
                setTimeout(() => {
                    const icon = document.createElement("img");
                    icon.src = this.icon;
                    div.appendChild(icon);
                    const p = document.createElement("p");
                    p.innerText = this.getName();
                    div.appendChild(p);
                }, 0);
            }
        }
        /**
         * Returns all entries of this folder.
         */
        async read() {
            return await readDirectory(this.path);
        }
        async open(stayInFolder = false) {
            let go = !stayInFolder;
            if (go) {
                setUrl(this.path);
                FileSystem.currentDirectory = this;
            }
            if (this.entries.length == 0) {
                this.treeElement.innerHTML = "";
                this.treeElement.appendChild(loadingSpinner());
            }
            let fileContainer = document.getElementById("filecontainer");
            if (go) {
                fileContainer.innerHTML = "";
                fileContainer.appendChild(loadingSpinner());
            }
            const entries = await this.read();
            if (go)
                fileContainer.innerHTML = "";
            let difference = false;
            for (let i = 0; i < entries.length; i++) {
                const e = entries[i];
                const thisE = this.entries[i];
                if (e.getName() == "..") {
                    entries.splice(i--, 1);
                    continue;
                }
                e.parent = this;
                if (go) {
                    fileContainer.appendChild(e.element);
                }
                if (!thisE
                    || e.path != thisE.path
                    || e.type != thisE.type) {
                    difference = true;
                }
            }
            if (difference || entries.length == 0) {
                this.entries = entries;
                this.updateElement();
            }
            this.setDetails();
            return this.entries;
        }
    }
    FileSystem.DirectoryEntry = DirectoryEntry;
    class FileEntry extends Entry {
        constructor(path) {
            super(path, FileType.File);
            this.previewImage = null;
            this.updateElement();
        }
        /**
         * Get view URL
         */
        view() {
            return "/view/" + btoa(this.path);
        }
        async open() {
            if (this.isImage() || this.isVideo()) {
                modalPreviewMedia(this);
                return;
            }
            location.href = this.view();
        }
        static parseSize(size) {
            // In bytes originally.
            let out = "";
            if (size < 1024)
                out = size + " Bytes";
            else if (size < Math.pow(1024, 2))
                out = (size / 1024).toFixed(2) + " Kb";
            else if (size < Math.pow(1024, 3))
                out = (size / Math.pow(1024, 2)).toFixed(2) + " Mb";
            else if (size < Math.pow(1024, 4))
                out = (size / Math.pow(1024, 3)).toFixed(2) + " Gb";
            else
                out = (size / Math.pow(1024, 4)) + " Tb";
            return out;
        }
        parseSize() {
            return FileEntry.parseSize(this.size);
        }
        setIconToPreview() {
            let _img = document.createElement("img");
            _img.src = this.view();
            _img.addEventListener("load", () => {
                this.previewImage = this.view();
                this.updateElement();
            });
        }
        getExt() {
            let extParts = this.getName().split(".");
            return extParts.length > 1 ? extParts.pop() : "";
        }
        isImage() {
            return [
                "apng",
                "avif",
                "gif",
                "ico",
                "jpg",
                "jpeg",
                "jfif",
                "pjpeg",
                "pjg",
                "png",
                "svg",
                "webp",
            ].indexOf(this.getExt().toLowerCase()) != -1;
        }
        isVideo() {
            return [
                "mp4"
            ].indexOf(this.getExt().toLowerCase()) != -1;
        }
        isAudio() {
            return [
                "mp3"
            ].indexOf(this.getExt().toLowerCase()) != -1;
        }
        openInEditor() {
            let lang = this.getExt();
            if (lang == "js")
                lang = "javascript";
            if (lang == "ts")
                lang = "typescript";
            modalIntegratedCode(this, lang);
            // location.href = "/editor?file=" + this.path;
        }
        updateElement() {
            // Tree Entry
            {
                this.treeElement.innerHTML = "";
                const treeDiv = document.createElement("div");
                treeDiv.classList.add("treeEntryItem");
                treeDiv.addEventListener("dblclick", e => {
                    this.open();
                });
                treeDiv.addEventListener("click", e => {
                    this.setDetails();
                });
                treeDiv.addEventListener("contextmenu", e => {
                    e.preventDefault();
                    this.open();
                });
                this.treeElement.appendChild(treeDiv);
                setTimeout(() => {
                    const icon = document.createElement("img");
                    icon.src = this.icon;
                    treeDiv.appendChild(icon);
                    const p = document.createElement("p");
                    p.innerText = this.getName();
                    treeDiv.appendChild(p);
                }, 0);
            }
            // Explorer Entry
            {
                this.element.innerHTML = "";
                const div = document.createElement("div");
                div.classList.add("entryItem");
                div.addEventListener("dblclick", e => {
                    this.open();
                });
                div.addEventListener("contextmenu", e => {
                    e.preventDefault();
                    this.selected = e.ctrlKey ? !this.selected : true;
                    this.setDetails();
                });
                div.addEventListener("click", e => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (!this.previewImage && this.isImage())
                        this.setIconToPreview();
                    if (!e.ctrlKey)
                        FileSystem.Entry.deselectAll();
                    if (!e.altKey)
                        this.selected = e.ctrlKey ? !this.selected : true;
                    this.setDetails();
                    // let entries = FileSystem.Entry.getCurrentEntries();
                    // let selectedEntries = FileSystem.Entry.getSelectedEntries();
                    // if (selectedEntries.length > 0) {
                    //   let firstId = entries.findIndex(e => e.path == selectedEntries[0].path);
                    //   let lastId = entries.findIndex(e => e.path == selectedEntries[selectedEntries.length - 1].path);
                    //   let curId = entries.findIndex(e => e.path == this.path);
                    //   if (e.ctrlKey && e.altKey) {
                    //     entries.forEach((entry, i) => {
                    //       if ((firstId < curId && i > firstId && i <= curId) || (lastId > curId && i >= curId && i < lastId)) {
                    //         entry.selected = !entry.selected;
                    //       }
                    //     });
                    //   }
                    // }
                });
                div.addEventListener("touchstart", e => {
                    if (e.touches.length == 2) {
                        this.selected = !this.selected;
                        this.setDetails();
                    }
                });
                this.element.appendChild(div);
                setTimeout(() => {
                    const icon = document.createElement("img");
                    icon.src = this.previewImage ? this.previewImage : this.icon;
                    div.appendChild(icon);
                    const p = document.createElement("p");
                    p.innerText = this.getName();
                    div.appendChild(p);
                }, 0);
            }
        }
    }
    FileSystem.FileEntry = FileEntry;
    function loadingSpinner() {
        let div = document.createElement("div");
        div.classList.add("lds-spinner");
        div.innerHTML = '<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>';
        return div;
    }
    FileSystem.loadingSpinner = loadingSpinner;
    function traverseDirectory(entry) {
        let reader = entry.createReader();
        // Resolved when the entire directory is traversed
        return new Promise((resolveDirectory) => {
            var iteration_attempts = [];
            (function read_entries() {
                // According to the FileSystem API spec, readEntries() must be called until
                // it calls the callback with an empty array.  Seriously??
                reader.readEntries((entries) => {
                    if (!entries.length) {
                        // Done iterating this particular directory
                        resolveDirectory(Promise.all(iteration_attempts));
                    }
                    else {
                        // Add a list of promises for each directory entry.  If the entry is itself 
                        // a directory, then that promise won't resolve until it is fully traversed.
                        iteration_attempts.push(Promise.all(entries.map((entry) => {
                            if (entry.isFile) {
                                // DO SOMETHING WITH FILES
                                return entry;
                            }
                            else {
                                // DO SOMETHING WITH DIRECTORIES
                                return traverseDirectory(entry);
                            }
                        })));
                        // Try calling readEntries() again for the same dir, according to spec
                        read_entries();
                    }
                }, (err) => {
                    if (err)
                        console.error(err);
                });
            })();
        });
    }
    FileSystem.traverseDirectory = traverseDirectory;
    function fileListToArray(fileList) {
        let files = [];
        for (let i = 0; i < fileList.length; i++) {
            const file = fileList[i];
            files.push(file);
        }
        return files;
    }
    FileSystem.fileListToArray = fileListToArray;
    function zip(entries) {
        // return request("/object.php", {
        return request("/operators/zip.php", {
            targets: entries.map(e => e.path)
        }, "FORM-POST");
    }
    FileSystem.zip = zip;
})(FileSystem || (FileSystem = {}));

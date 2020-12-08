"use strict";
var FileSystem;
(function (FileSystem) {
    let FileType;
    (function (FileType) {
        FileType[FileType["Directory"] = 0] = "Directory";
        FileType[FileType["File"] = 1] = "File";
    })(FileType || (FileType = {}));
    function setUrl(path) {
        history.pushState("", "", "/explorer" + path);
        document.querySelector("title").innerText = "File Explorer | " + path;
    }
    async function readDirectory(path) {
        const entries = await request("/files.php?dir=" + path);
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
                if (entry.isImage()) {
                    let _img = document.createElement("img");
                    _img.src = "/" + entry.physicalPath;
                    _img.addEventListener("load", () => {
                        entry.icon = "/" + entry.physicalPath;
                        entry.updateElement();
                    });
                }
            }
            return entry;
        });
    }
    FileSystem.readDirectory = readDirectory;
    async function request(path, data = {}) {
        data || (data = {});
        const fd = new FormData();
        for (const key in data) {
            fd.append(key, data[key]);
        }
        const res = await fetch(path, {
            body: fd,
            method: "POST"
        });
        return await res.json();
    }
    class Entry {
        constructor(path, type) {
            this.path = path;
            this.type = type;
            this.element = document.createElement("div");
            this.treeElement = document.createElement("div");
            this.treeElement.entry = this;
            this.treeElement.classList.add("treeEntryElement");
            this.element.entry = this;
            this.element.classList.add("entryElement");
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
                entryinfo.append(newFolder);
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
                    entryinfo.append(`Files: ${this.entries.length > 0 ? this.entries.length : "Load folder to display.."}`, hr());
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
                    img.src = "/" + this.physicalPath;
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
                    let selected = FileSystem.Entry.getSelectedEntries();
                    if (selected.length > 0 && confirm(`Are you sure you want to delete ${selected.length} files?`)) {
                        await FileSystem.Entry.bulkDelete(selected);
                        setTimeout(() => {
                            FileSystem.currentDirectory.open();
                        }, 0);
                    }
                });
                if (selected.length > 1) {
                    entryinfo.append(`Selected: ${selected.length} items`, br(), `Selected size: ${FileEntry.parseSize(selected.filter(e => e.isFile()).map(e => e.size).reduce((p, c) => p + c))}`, hr(), deleteSelected);
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
            let fc = document.querySelector("#filecontainer");
            fc.innerHTML = "";
            fc.appendChild(FileSystem.loadingSpinner());
            for (let i = 0; i < bulk.length; i++) {
                const e = bulk[i];
                await e.delete(true);
            }
        }
        async rename(newName, skipReload = false) {
            if (this.path == "/") {
                alert("You cannot rename the root folder.");
                return { success: false, reason: "You cannot rename the root folder." };
            }
            if (!name) {
                modal((m, cm) => {
                    let div = document.createElement("div");
                    let p = document.createElement("p");
                    p.innerText = "Renaming \"" + this.getName() + "\"...";
                    let nameInput = document.createElement("input");
                    setTimeout(() => {
                        nameInput.focus();
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
        async delete(skipReload = false) {
            if (this.path == "/") {
                alert("You cannot delete the root folder.");
                return { success: false, reason: "You cannot delete the root folder." };
            }
            if (this.isDirectory() && this.entries.length > 0) {
                return alert("You cannot delete folder \"" + this.getName() + "\", as it is not empty.");
            }
            return await request("/operators/delete.php", {
                "target": this.path
            }).then(res => {
                if (res.success) {
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
        }
        async newFolder(name) {
            if (!name) {
                modal((m, cm) => {
                    let div = document.createElement("div");
                    let p = document.createElement("p");
                    p.innerText = "Creating new folder in \"" + this.path + "\"";
                    let nameInput = document.createElement("input");
                    setTimeout(() => {
                        nameInput.focus();
                    }, 0);
                    let create = document.createElement("button");
                    create.innerText = "Create";
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
                                this.entries.find(e => e.getName() == name).open();
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
            data.append('dir', this.path);
            files.forEach(f => data.append('fileToUpload[]', f));
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
                p.innerText = "Uploading... " + percent_completed.toFixed(2) + "%";
                if (message)
                    p.append(document.createElement("hr"), message);
            });
            // request finished event
            httpReq.addEventListener('load', (e) => {
                closeModal();
                let res = JSON.parse(httpReq.response);
                if (!res.success) {
                    alert(res.reason);
                }
                resolve(res);
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
                        this.open();
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
                    this.open();
                });
                div.addEventListener("click", e => {
                    e.stopPropagation();
                    e.preventDefault();
                    this.setDetails();
                    if (!e.ctrlKey)
                        FileSystem.Entry.deselectAll();
                    this.selected = e.ctrlKey ? !this.selected : true;
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
        async open() {
            FileSystem.currentDirectory = this;
            setUrl(this.path);
            if (this.entries.length == 0) {
                this.treeElement.innerHTML = "";
                this.treeElement.appendChild(loadingSpinner());
            }
            let fileContainer = document.getElementById("filecontainer");
            fileContainer.innerHTML = "";
            fileContainer.appendChild(loadingSpinner());
            const entries = await readDirectory(this.path);
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
                fileContainer.appendChild(e.element);
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
            this.updateElement();
        }
        async open() {
            if (this.isImage()) {
                modalPreviewMedia(this);
                return;
            }
            location.href = "/" + this.physicalPath;
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
                    // e.preventDefault();
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
                    // e.preventDefault();
                });
                div.addEventListener("click", e => {
                    e.stopPropagation();
                    e.preventDefault();
                    this.setDetails();
                    if (!e.ctrlKey)
                        FileSystem.Entry.deselectAll();
                    this.selected = e.ctrlKey ? !this.selected : true;
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
})(FileSystem || (FileSystem = {}));

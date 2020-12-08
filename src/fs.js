"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    function readDirectory(path) {
        return __awaiter(this, void 0, void 0, function* () {
            const entries = yield get("/files.php?dir=" + path);
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
                return entry;
            });
        });
    }
    FileSystem.readDirectory = readDirectory;
    function get(path, data = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            data || (data = {});
            const fd = new FormData();
            for (const key in data) {
                fd.append(key, data[key]);
            }
            const res = yield fetch(path, {
                body: fd,
                method: "POST"
            });
            return yield res.json();
        });
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
        getName() {
            return this.path.split("/").pop();
        }
        setDetails() {
            let entryinfo = document.getElementById("entryinfo");
            entryinfo.innerHTML = "";
            entryinfo.append("Full Path: " + this.path, document.createElement("br"), document.createElement("br"), "Name: " + this.getName(), document.createElement("br"), document.createElement("br"));
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
        rename() {
            throw "Not yet implemented";
        }
        delete() {
            throw "Not yet implemented";
        }
    }
    FileSystem.Entry = Entry;
    class DirectoryEntry extends Entry {
        constructor(path) {
            super(path, FileType.Directory);
            this.entries = [];
            this.updateElement();
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
                treeDiv.addEventListener("contextmenu", e => {
                    e.preventDefault();
                    if (this.entries.length == 0) {
                        this.open();
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
                    this.setDetails();
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
        open() {
            return __awaiter(this, void 0, void 0, function* () {
                FileSystem.currentDirectory = this;
                setUrl(this.path);
                if (this.entries.length == 0) {
                    this.treeElement.innerHTML = "";
                    this.treeElement.appendChild(loadingSpinner());
                }
                let fileContainer = document.getElementById("filecontainer");
                fileContainer.innerHTML = "";
                fileContainer.appendChild(loadingSpinner());
                const entries = yield readDirectory(this.path);
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
            });
        }
    }
    FileSystem.DirectoryEntry = DirectoryEntry;
    class FileEntry extends Entry {
        constructor(path) {
            super(path, FileType.File);
            this.updateElement();
        }
        open() {
            return __awaiter(this, void 0, void 0, function* () {
                location.href = "/" + this.physicalPath;
            });
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
                    this.setDetails();
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
})(FileSystem || (FileSystem = {}));

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
        isFile() {
            return this instanceof FileEntry;
        }
        isDirectory() {
            return this instanceof DirectoryEntry;
        }
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
                    treeEntriesContainer.toggleAttribute("collapsed");
                });
                this.treeElement.appendChild(treeDiv);
                const p = document.createElement("p");
                p.innerText = this.path.split("/").pop();
                treeDiv.appendChild(p);
                const treeEntriesContainer = document.createElement("div");
                treeEntriesContainer.classList.add("treeEntriesContainer");
                this.treeElement.appendChild(treeEntriesContainer);
                this.entries.forEach(e => {
                    treeEntriesContainer.appendChild(e.treeElement);
                });
            }
            this.element.entry = this;
            // Explorer Entry
            {
            }
        }
        open() {
            return __awaiter(this, void 0, void 0, function* () {
                setUrl(this.path);
                const entries = yield readDirectory(this.path);
                let difference = false;
                for (let i = 0; i < entries.length; i++) {
                    const e = entries[i];
                    const thisE = this.entries[i];
                    if (!thisE
                        || e.path != thisE.path
                        || e.type != thisE.type) {
                        difference = true;
                        break;
                    }
                }
                if (difference) {
                    this.entries = entries;
                    this.updateElement();
                }
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
                const p = document.createElement("p");
                p.innerText = this.path.split("/").pop();
                treeDiv.appendChild(p);
            }
            this.element.entry = this;
            // Explorer Entry
            {
            }
        }
    }
    FileSystem.FileEntry = FileEntry;
})(FileSystem || (FileSystem = {}));

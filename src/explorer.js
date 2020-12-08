"use strict";
const dir = new FileSystem.DirectoryEntry("/");
dir.icon = "/src/icons/folder.png";
document.getElementById("filetree").appendChild(dir.treeElement);
const instantPath = location.pathname.substring("/explorer".length);
let _initialEntries = dir.open();
async function goToInstantPath(entriesPromise, segments) {
    let entries = await entriesPromise;
    segments.shift();
    for (let i = 0; i < entries.length; i++) {
        const e = entries[i];
        let item = e.path.split("/").pop();
        if (item == segments[0]) {
            if (e.isDirectory())
                goToInstantPath(e.open(), segments);
            else if (e.isFile())
                e.open();
        }
    }
}
;
// Shortcuts
addEventListener("keydown", async (e) => {
    const { ctrlKey, altKey, shiftKey, key } = e;
    if (key == "F2") {
        e.preventDefault();
        let selectedEntries = FileSystem.Entry.getSelectedEntries();
        if (selectedEntries.length == 1) {
            selectedEntries[0].rename();
        }
        else if (selectedEntries.length > 1) {
            alert("Can only rename one item at a time.");
        }
    }
    if (key.toLowerCase() == "n" && ctrlKey && altKey) {
        e.preventDefault();
        FileSystem.currentDirectory.newFolder();
    }
    if (key == "Backspace" && altKey) {
        e.preventDefault();
        let p = FileSystem.currentDirectory.parent;
        if (p)
            p.open();
    }
    if (key == "Delete") {
        e.preventDefault();
        let selected = FileSystem.Entry.getSelectedEntries();
        if (selected.length > 0 && confirm(`Are you sure you want to delete ${selected.length} files?`)) {
            await FileSystem.Entry.bulkDelete(selected);
            setTimeout(() => {
                FileSystem.currentDirectory.open();
            }, 0);
        }
    }
    if (key == "Escape") {
        if (!e.ctrlKey)
            FileSystem.Entry.deselectAll();
    }
    if (key.toLowerCase() == "a" && ctrlKey) {
        e.preventDefault();
        FileSystem.Entry.getCurrentEntries().forEach(e => e.selected = true);
    }
    if (key.toLowerCase() == "i" && ctrlKey) {
        e.preventDefault();
        FileSystem.Entry.getCurrentEntries().forEach(e => e.selected = !e.selected);
    }
});
addEventListener("mousedown", e => {
    const { ctrlKey, altKey, shiftKey, button } = e;
    if (button == 3) {
        e.preventDefault();
        let p = FileSystem.currentDirectory.parent;
        if (p)
            p.open();
    }
});
//#region Drag and Drop, Deselect
const filecontainer = document.getElementById("filecontainer");
filecontainer.addEventListener("dragover", e => {
    e.stopPropagation();
    e.preventDefault();
});
filecontainer.addEventListener("dragleave", e => {
    e.stopPropagation();
    e.preventDefault();
});
filecontainer.addEventListener("dragenter", e => {
    e.stopPropagation();
    e.preventDefault();
});
filecontainer.addEventListener("drop", async (e) => {
    e.stopPropagation();
    e.preventDefault();
    let fileList = e.dataTransfer.files;
    let files = [];
    for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        files.push(file);
    }
    let maxFiles = 5;
    let len = Math.ceil(files.length / maxFiles);
    for (let i = 0; i < len; i++) {
        const bulk = files.splice(0, maxFiles);
        console.log(i + "/" + len);
        console.log(bulk);
        await FileSystem.currentDirectory.uploadFile(bulk, (len > 1 ? "Bulk " + i + "/" + len : null));
    }
    FileSystem.currentDirectory.open();
});
filecontainer.addEventListener("click", e => {
    e.stopPropagation();
    e.preventDefault();
    if (!e.ctrlKey) {
        FileSystem.Entry.deselectAll();
        FileSystem.currentDirectory.setDetails();
    }
});
//#endregion
if (instantPath != "/") {
    goToInstantPath(_initialEntries, instantPath.split("/"));
}
class Style {
    static save() {
        setTimeout(() => {
            let list = {};
            for (let i = 0; i < Style.explorer.attributes.length; i++) {
                const a = Style.explorer.attributes[i];
                if (a.name.startsWith("explorer-style-")) {
                    list[a.name] = a.value;
                }
            }
            localStorage.setItem("explorer-style", JSON.stringify(list));
        }, 100);
    }
    static load() {
        let stylesString = localStorage.getItem("explorer-style");
        if (stylesString) {
            let styles = JSON.parse(stylesString);
            for (const key in styles) {
                if (Object.prototype.hasOwnProperty.call(styles, key)) {
                    Style.explorer.setAttribute(key, styles[key]);
                }
            }
        }
    }
    static set(attribute, value) {
        Style.save();
        Style.explorer.setAttribute("explorer-style-" + attribute, value);
    }
    static get(attribute) {
        Style.save();
        return Style.explorer.getAttribute("explorer-style-" + attribute);
    }
    static toggle(attribute, force) {
        Style.save();
        if (typeof force == "boolean")
            return Style.explorer.toggleAttribute("explorer-style-" + attribute, force);
        else
            return Style.explorer.toggleAttribute("explorer-style-" + attribute, force);
    }
    static get tree() {
        return Style.get("tree");
    }
    static set tree(v) {
        Style.set("tree", v);
    }
}
Style.explorer = document.getElementById("explorer");
Style.load();
function modal(element = document.createElement("div")) {
    let container = document.createElement("div");
    container.id = "__MODALPOPUP";
    container.style.left = "0";
    container.style.top = "0";
    container.style.width = "100vw";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.justifyContent = "center";
    container.style.alignItems = "center";
    container.style.position = "absolute";
    container.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    let content = document.createElement("div");
    content.style.width = "fit-content";
    content.style.height = "fit-content";
    content.style.boxSizing = "border-box";
    content.style.position = "relative";
    content.style.backgroundColor = "#2b2b2b";
    content.style.borderRadius = "20px";
    content.style.padding = "20px";
    container.appendChild(content);
    content.appendChild(typeof element == "function" ? element({
        content,
        container,
        id: "__MODALPOPUP"
    }, function () {
        container.remove();
    }) : element);
    document.body.appendChild(container);
    return {
        content,
        container,
        id: "__MODALPOPUP"
    };
}
function modalIntegratedCode(fileEntry, lang) {
    modal((m, cm) => {
        let div = document.createElement("div");
        let close = document.createElement("button");
        close.innerText = "Close";
        close.addEventListener("click", () => cm());
        let iframe = document.createElement("iframe");
        iframe.style.width = "80vw";
        iframe.style.height = "80vh";
        iframe.src = "/editor?file=" + fileEntry.path + "&lang=" + lang;
        div.append("Read-only editor", document.createElement("br"));
        div.appendChild(iframe);
        div.appendChild(document.createElement("br"));
        div.appendChild(close);
        return div;
    });
}
function modalPreviewMedia(fileEntry) {
    modal((m, cm) => {
        const entries = fileEntry.parent.entries.filter(e => e.isFile() && (
        // Filters
        e.isImage()));
        let mediaIndex = entries.findIndex(e => e.path == fileEntry.path);
        let div = document.createElement("div");
        let close = document.createElement("button");
        close.innerText = "Close";
        close.addEventListener("click", () => closeModal());
        m.container.addEventListener("click", () => closeModal()); // Close by clicking on background of modal.
        const swap = function (e) {
            e.preventDefault();
            if (e.key == "ArrowLeft") {
                closeModal();
                modalPreviewMedia(0 > --mediaIndex ? entries[entries.length - 1] : entries[mediaIndex]);
            }
            if (e.key == "ArrowRight") {
                closeModal();
                modalPreviewMedia(entries.length <= ++mediaIndex ? entries[0] : entries[mediaIndex]);
            }
        };
        const closeModal = () => {
            window.removeEventListener("keydown", swap);
            cm();
        };
        window.addEventListener("keydown", swap);
        let mediaContainer = document.createElement("div");
        if (fileEntry.isImage()) {
            let img = document.createElement("img");
            img.src = "/" + fileEntry.physicalPath;
            img.classList.add("largepreviewmedia");
            mediaContainer.appendChild(FileSystem.loadingSpinner());
            img.addEventListener("load", () => {
                mediaContainer.innerHTML = "";
                mediaContainer.appendChild(img);
                mediaContainer.append(document.createElement("br"), `${mediaIndex + 1}/${entries.length}`);
                detectSwipe(mediaContainer, (direction, e) => {
                    if (direction == "right") {
                        e.stopPropagation();
                        e.preventDefault();
                        closeModal();
                        modalPreviewMedia(0 > --mediaIndex ? entries[entries.length - 1] : entries[mediaIndex]);
                    }
                    if (direction == "left") {
                        e.stopPropagation();
                        e.preventDefault();
                        closeModal();
                        modalPreviewMedia(entries.length <= ++mediaIndex ? entries[0] : entries[mediaIndex]);
                    }
                });
            });
            div.addEventListener("click", e => {
                e.stopPropagation();
                e.preventDefault();
            });
        }
        div.appendChild(mediaContainer);
        div.appendChild(document.createElement("br"));
        div.appendChild(close);
        return div;
    });
}

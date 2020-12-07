"use strict";
var ac;
function fileListToArray(list) {
    const arr = [];
    for (let i = 0; i < list.length; i++) {
        const file = list[i];
        arr.push(file);
    }
    return arr;
}
function upload(e) {
    // if (document.querySelector<HTMLInputElement>("#fileSelector").value == "") {
    //   e.preventDefault();
    //   document.querySelector<HTMLElement>("#curFile").innerText = "Please select a file";
    // }
}
function addCustomDir() {
    let customDir = document.querySelector("#customDir");
    var dir = customDir.value;
    if (dir.trim() == "") {
        return;
    }
    const option = document.createElement("option");
    option.innerText = dir;
    option.value = dir;
    let directory = document.querySelector("#directory");
    directory.value = dir;
    if (directory.value == "") {
        directory.append(option);
        directory.value = dir;
        ac.completions.push(dir);
    }
    customDir.value = "";
}
class Path {
    /**
     * Corrects a path's ``\`` into ``/`` and double slashes will turn into singles. Removes irrelevant ``./``.
     * @param {string} path Path to correct
     */
    static correct(path) {
        path = path.replace(/\\+|\/\/+/g, "/");
        while (/\/\.\//g.test(path)) {
            path = path.replace(/\/\.\//g, "/");
        }
        return path;
    }
    static getFile(path) {
        path = Path.correct(path);
        return path.split("/").pop();
    }
}
function setLargePreviewImage(path, type = "image") {
    let img = document.querySelector("img#largeimagepreview");
    let video = document.querySelector("video#largevideopreviewelement");
    let source = document.querySelector("source#largevideopreview");
    if (type == "image") {
        img.src = path;
        img.hidden = false;
        source.src = "";
        video.hidden = source.hidden = true;
        video.pause();
    }
    if (type == "video") {
        img.src = "";
        img.hidden = true;
        source.src = path;
        video.hidden = source.hidden = false;
        setTimeout(() => {
            video.load();
            video.play();
        }, 10);
    }
}
function setCookie(name, value, reloadOnResponse = false) {
    fetch("/cookie.php?" + name + "=" + value).then(res => location.reload());
}
window.addEventListener("load", () => {
    // let directoryEntryElements = document.querySelectorAll<HTMLDivElement>(".directoryentry");
    let d = document.querySelector("#dropzone");
    window.addEventListener('dragenter', function () { }, false);
    window.addEventListener('dragleave', function () { }, false);
    window.addEventListener('dragover', function (event) {
        event.stopPropagation();
        1;
        event.preventDefault();
    }, false);
    window.addEventListener("drop", e => {
        e.preventDefault();
        let files = e.dataTransfer.files;
        if (files.length > 0) {
            document.querySelector("#fileSelector").files = files;
            document.querySelector("#fileuploadform").submit();
        }
    });
    // let aBs = folderActions.querySelectorAll<HTMLAnchorElement>(".actionbutton");
    // aBs.forEach(e => {
    // });
});
function folderActionButtonHandler(e) {
    const folderActions = document.querySelector("#folderactions");
    if (e.hasAttribute("for")) {
        let id = e.getAttribute("for");
        let box = folderActions.querySelector("#" + id);
        if (box) {
            box.toggleAttribute("hidden");
            let autofocus = box.querySelector("[focusonclick]");
            if (autofocus) {
                autofocus.focus();
                autofocus.setSelectionRange(0, autofocus.value.length);
            }
        }
    }
}
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
}
function renameModal(target) {
    modal((m, cm) => {
        const id = m.id;
        const form = document.createElement("form");
        const targetField = document.createElement("input");
        targetField.type = "hidden";
        targetField.value = target;
        targetField.name = "target";
        const newName = document.createElement("input");
        newName.name = "newname";
        newName.required = true;
        newName.value = target.split(/[\\\/]/).pop();
        newName.autocomplete = "off";
        const submit = document.createElement("button");
        submit.type = "submit";
        submit.innerText = "Rename";
        const cancel = document.createElement("button");
        cancel.innerText = "Cancel";
        cancel.addEventListener("click", cm);
        form.action = "/operators/rename.php";
        form.appendChild(targetField);
        form.appendChild(newName);
        form.appendChild(document.createElement("br"));
        form.appendChild(submit);
        form.appendChild(cancel);
        setTimeout(() => {
            newName.focus();
            let ext = newName.value.split(".").length > 1 ? newName.value.split(".").pop() : "";
            newName.setSelectionRange(0, newName.value.length - (ext ? ext.length + 1 : 0));
        }, 10);
        return form;
    });
}

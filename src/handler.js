var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var ac;
function fileListToArray(list) {
    var arr = [];
    for (var i = 0; i < list.length; i++) {
        var file = list[i];
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
    var customDir = document.querySelector("#customDir");
    var dir = customDir.value;
    if (dir.trim() == "") {
        return;
    }
    var option = document.createElement("option");
    option.innerText = dir;
    option.value = dir;
    var directory = document.querySelector("#directory");
    directory.value = dir;
    if (directory.value == "") {
        directory.append(option);
        directory.value = dir;
        ac.completions.push(dir);
    }
    customDir.value = "";
}
var Path = /** @class */ (function () {
    function Path() {
    }
    /**
     * Corrects a path's ``\`` into ``/`` and double slashes will turn into singles. Removes irrelevant ``./``.
     * @param {string} path Path to correct
     */
    Path.correct = function (path) {
        path = path.replace(/\\+|\/\/+/g, "/");
        while (/\/\.\//g.test(path)) {
            path = path.replace(/\/\.\//g, "/");
        }
        return path;
    };
    Path.getFile = function (path) {
        path = Path.correct(path);
        return path.split("/").pop();
    };
    return Path;
}());
var Entry = /** @class */ (function () {
    function Entry(element) {
        this.element = element;
    }
    return Entry;
}());
var DirectoryEntry = /** @class */ (function (_super) {
    __extends(DirectoryEntry, _super);
    function DirectoryEntry(element) {
        return _super.call(this, element) || this;
    }
    return DirectoryEntry;
}(Entry));
var FileEntry = /** @class */ (function (_super) {
    __extends(FileEntry, _super);
    function FileEntry(element) {
        return _super.call(this, element) || this;
    }
    return FileEntry;
}(Entry));
function setLargePreviewImage(path, type) {
    if (type === void 0) { type = "image"; }
    var img = document.querySelector("img#largeimagepreview");
    var video = document.querySelector("video#largevideopreviewelement");
    var source = document.querySelector("source#largevideopreview");
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
        setTimeout(function () {
            video.load();
            video.play();
        }, 10);
    }
}
function setCookie(name, value, reloadOnResponse) {
    if (reloadOnResponse === void 0) { reloadOnResponse = false; }
    fetch("/cookie.php?" + name + "=" + value).then(function (res) { return location.reload(); });
}
window.addEventListener("load", function () {
    // let directoryEntryElements = document.querySelectorAll<HTMLDivElement>(".directoryentry");
    var d = document.querySelector("#dropzone");
    window.addEventListener('dragenter', function () { }, false);
    window.addEventListener('dragleave', function () { }, false);
    window.addEventListener('dragover', function (event) {
        event.stopPropagation();
        1;
        event.preventDefault();
    }, false);
    window.addEventListener("drop", function (e) {
        e.preventDefault();
        document.querySelector("#fileSelector").files = e.dataTransfer.files;
        document.querySelector("#fileuploadform").submit();
    });
    // let aBs = folderActions.querySelectorAll<HTMLAnchorElement>(".actionbutton");
    // aBs.forEach(e => {
    // });
});
function folderActionButtonHandler(e) {
    var folderActions = document.querySelector("#folderactions");
    if (e.hasAttribute("for")) {
        var id = e.getAttribute("for");
        var box = folderActions.querySelector("#" + id);
        if (box) {
            box.toggleAttribute("hidden");
            var autofocus = box.querySelector("[focusonclick]");
            if (autofocus) {
                autofocus.focus();
                autofocus.setSelectionRange(0, autofocus.value.length);
            }
        }
    }
}
function modal(element) {
    if (element === void 0) { element = document.createElement("div"); }
    var container = document.createElement("div");
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
    var content = document.createElement("div");
    content.style.width = "fit-content";
    content.style.height = "fit-content";
    content.style.position = "relative";
    content.style.backgroundColor = "#2b2b2b";
    content.style.borderRadius = "20px";
    content.style.padding = "20px";
    container.appendChild(content);
    content.appendChild(typeof element == "function" ? element({
        content: content,
        container: container,
        id: "__MODALPOPUP"
    }, function () {
        container.remove();
    }) : element);
    document.body.appendChild(container);
}
function renameModal(target) {
    modal(function (m, cm) {
        var id = m.id;
        var form = document.createElement("form");
        var targetField = document.createElement("input");
        targetField.type = "hidden";
        targetField.value = target;
        targetField.name = "target";
        var newName = document.createElement("input");
        newName.name = "newname";
        newName.required = true;
        newName.value = target.split(/[\\\/]/).pop();
        newName.autocomplete = "off";
        var submit = document.createElement("button");
        submit.type = "submit";
        submit.innerText = "Rename";
        var cancel = document.createElement("button");
        cancel.innerText = "Cancel";
        cancel.addEventListener("click", cm);
        form.action = "/operators/rename.php";
        form.appendChild(targetField);
        form.appendChild(newName);
        form.appendChild(document.createElement("br"));
        form.appendChild(submit);
        form.appendChild(cancel);
        setTimeout(function () {
            newName.focus();
            var ext = newName.value.split(".").length > 1 ? newName.value.split(".").pop() : "";
            newName.setSelectionRange(0, newName.value.length - (ext ? ext.length + 1 : 0));
        }, 10);
        return form;
    });
}

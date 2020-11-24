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
document.querySelector("#fileSelector").addEventListener("change", function (e) {
    var object = e.target;
    if (object.value != "") {
        document.querySelector("#curFile").innerText = Path.getFile(object.value);
    }
    else {
        document.querySelector("#curFile").innerText = "No file selected";
    }
});
function upload(e) {
    if (document.querySelector("#fileSelector").value == "") {
        e.preventDefault();
        document.querySelector("#curFile").innerText = "Please select a file";
    }
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
function setCookie(name, value, reloadOnResponse) {
    if (reloadOnResponse === void 0) { reloadOnResponse = false; }
    fetch("/cookie.php?" + name + "=" + value).then(function (res) { return location.reload(); });
}
// window.addEventListener("load", () => {
//   let directoryEntryElements = document.querySelectorAll<HTMLDivElement>(".directoryentry");
// });

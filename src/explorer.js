"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const dir = new FileSystem.DirectoryEntry("/");
dir.icon = "/src/icons/folder.png";
document.getElementById("filetree").appendChild(dir.treeElement);
const instantPath = location.pathname.substring("/explorer".length);
let _initialEntries = dir.open();
function goToInstantPath(entriesPromise, segments) {
    return __awaiter(this, void 0, void 0, function* () {
        let entries = yield entriesPromise;
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
    });
}
;
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

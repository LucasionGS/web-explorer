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
document.getElementById("filetree").appendChild(dir.treeElement);
console.log();
const instantPath = location.pathname.substring("/explorer".length);
let _initialEntries = dir.open();
function goToInstantPath(entriesPromise, segments) {
    return __awaiter(this, void 0, void 0, function* () {
        let entries = yield entriesPromise;
        console.log(entries);
        segments.shift();
        console.log(segments);
        for (let i = 0; i < entries.length; i++) {
            const e = entries[i];
            let item = e.path.split("/").pop();
            if (item == segments[0]) {
                console.log(e.path);
                console.log("Match");
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

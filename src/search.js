"use strict";
function search(query) {
    const entries = document.querySelectorAll(".entry");
    entries.forEach(e => {
        let p = e.querySelector(".entryname p");
        if (!p || p.innerText == "..")
            return;
        e.hidden = !(p.innerText.toLowerCase().includes(query.toLowerCase()));
    });
}
function searchFromElementId(id) {
    search(document.getElementById(id).value);
}
;
addEventListener("keydown", e => {
    if (e.key.toLowerCase() == "f" && e.ctrlKey) {
        e.preventDefault();
        document.getElementById("searchbox").focus();
    }
});

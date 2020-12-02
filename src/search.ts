function search(query: string) {
  const entries = document.querySelectorAll<HTMLAnchorElement>(".entry");
  entries.forEach(e => {
    let p = e.querySelector<HTMLParagraphElement>(".entryname p");
    if (!p || p.innerText == "..") return;
    e.hidden = !(p.innerText.toLowerCase().includes(query.toLowerCase()));
  });
}

function searchFromElementId(id: string) {
  search((document.getElementById(id) as HTMLInputElement).value);
};

addEventListener("keydown", e => {
  if (e.key.toLowerCase() == "f" && e.ctrlKey) {
    e.preventDefault();
    document.getElementById("searchbox").focus();
  }
});
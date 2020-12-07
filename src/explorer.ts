const dir = new FileSystem.DirectoryEntry("/");
document.getElementById("filetree").appendChild(dir.treeElement);

console.log();
const instantPath = location.pathname.substring("/explorer".length);
let _initialEntries = dir.open();
async function goToInstantPath(entriesPromise: Promise<FileSystem.Entry[]>, segments: string[]) {
  let entries = await entriesPromise;
  console.log(entries);
  
  segments.shift();
  console.log(segments);
  
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    let item = e.path.split("/").pop();
    
    if (item == segments[0]) {
      console.log(e.path);
      console.log("Match");
      if (e.isDirectory()) goToInstantPath(e.open(), segments);
      else if (e.isFile()) e.open();
    }
  }
};

if (instantPath != "/") {
  goToInstantPath(_initialEntries, instantPath.split("/"));
}
const dir = new FileSystem.DirectoryEntry("/");
dir.icon = "/src/icons/folder.png";
document.getElementById("filetree").appendChild(dir.treeElement);
const instantPath = location.pathname.substring("/explorer".length);
let _initialEntries = dir.open();
async function goToInstantPath(entriesPromise: Promise<FileSystem.Entry[]>, segments: string[]) {
  let entries = await entriesPromise;
  
  segments.shift();
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    let item = e.path.split("/").pop();
    
    if (item == segments[0]) {
      if (e.isDirectory()) goToInstantPath(e.open(), segments);
      else if (e.isFile()) e.open();
    }
  }
};

if (instantPath != "/") {
  goToInstantPath(_initialEntries, instantPath.split("/"));
}

class Style {
  private static explorer = document.getElementById("explorer") as HTMLDivElement;
  private static save() {
    setTimeout(() => {
      let list: {[attr: string]: string} = {};
      for (let i = 0; i < Style.explorer.attributes.length; i++) {
        const a = Style.explorer.attributes[i];
        if (a.name.startsWith("explorer-style-")) {
          list[a.name] = a.value;
        }
      }
      localStorage.setItem("explorer-style", JSON.stringify(list));
    }, 100);
  }
  public static load() {
    let stylesString = localStorage.getItem("explorer-style");
    if (stylesString) {
      let styles: {[attr: string]: string} = JSON.parse(stylesString);
      for (const key in styles) {
        if (Object.prototype.hasOwnProperty.call(styles, key)) {
          Style.explorer.setAttribute(key, styles[key]);
        }
      }
    }
  }
  private static set(attribute: string, value: string) {
    Style.save();
    Style.explorer.setAttribute("explorer-style-" + attribute, value);
  }
  private static get(attribute: string) {
    Style.save();
    return Style.explorer.getAttribute("explorer-style-" + attribute);
  }
  private static toggle(attribute: string, force?: boolean) {
    Style.save();
    if (typeof force == "boolean") return Style.explorer.toggleAttribute("explorer-style-" + attribute, force);
    else return Style.explorer.toggleAttribute("explorer-style-" + attribute, force);
  }

  public static get tree(): string {
    return Style.get("tree");
  }
  public static set tree(v) {
    Style.set("tree", v);
  }
}

Style.load();
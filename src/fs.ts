namespace FileSystem {
  export var currentDirectory: DirectoryEntry;
  
  interface EntryElement extends HTMLDivElement {
    entry: Entry;
  }
  
  interface TreeEntryElement extends HTMLDivElement {
    entry: Entry;
  }

  interface Openable {
    open(): void;
  }

  enum FileType {
    Directory,
    File
  }

  function setUrl(path: string) {
    history.pushState("", "", "/explorer" + path);
    document.querySelector("title").innerText = "File Explorer | " + path;
  }

  export async function readDirectory(path: string) {
    const entries = await get<{
      "type": number,
      "path": string,
      "physicalPath": string,
      "icon": string,
    }[]>("/files.php?dir=" + path);
    
    return entries.map(e => {
      var entry: Entry;
      if (e.type == FileType.Directory) entry = new DirectoryEntry(e.path);
      else if (e.type == FileType.File) entry = new FileEntry(e.path);
      else return;

      entry.physicalPath = e.physicalPath;
      entry.icon = e.icon;
      entry.type = e.type;

      return entry;
    })
  }

  async function get<JSONResponse = any>(path: string, data: {[key: string]: string} = {}): Promise<JSONResponse> {
    data || (data = {});
    const fd = new FormData();
    for (const key in data) {
      fd.append(key, data[key]);
    }

    const res = await fetch(path, {
      body: fd,
      method: "POST"
    });
    return await res.json();
  }

  export class Entry
  {
    parent: this;
    constructor(public path: string, public type: FileType) {
      this.treeElement.entry = this;
      this.treeElement.classList.add("treeEntryElement");
      
      this.element.entry = this;
      this.element.classList.add("entryElement");
    }

    getName() {
      return this.path.split("/").pop()
    }

    setDetails() {
      let entryinfo = document.getElementById("entryinfo") as HTMLDivElement;

      entryinfo.innerHTML = "";
      entryinfo.append(
        "Full Path: " + this.path,
        document.createElement("br"),
        document.createElement("br"),
        "Name: " + this.getName(),
        document.createElement("br"),
        document.createElement("br"),
      );
    }
    
    isFile(): this is FileEntry {
      return this instanceof FileEntry;
    }
    
    isDirectory(): this is DirectoryEntry {
      return this instanceof DirectoryEntry;
    }

    public get selected() {
      return this.element.hasAttribute("selected");
    };
    
    public set selected(v) {
      this.element.toggleAttribute("selected", v);
    };

    rename() {
      throw "Not yet implemented";
    }
    
    delete() {
      throw "Not yet implemented";
    }

    public element: EntryElement = document.createElement("div") as EntryElement;
    public treeElement: TreeEntryElement = document.createElement("div") as TreeEntryElement;

    public physicalPath: string;
    public icon: string;
  }

  export class DirectoryEntry extends Entry implements Openable
  {
    constructor(path: string) {
      super(path, FileType.Directory);
      this.updateElement();
    }

    entries: Entry[] = [];

    updateElement() {
      // Tree Entry
      {
        this.treeElement.innerHTML = "";
        const treeDiv = document.createElement("div") as TreeEntryElement;
        treeDiv.classList.add("treeEntryItem");
        treeDiv.addEventListener("dblclick", e => {
          this.open();
          treeEntriesContainer.toggleAttribute("collapsed", false);
        });
        treeDiv.addEventListener("contextmenu", e => {
          e.preventDefault();
          if (this.entries.length == 0) {
            this.open();
          }
          else treeEntriesContainer.toggleAttribute("collapsed");
        });
        this.treeElement.appendChild(treeDiv);
        setTimeout(() => {
          const icon = document.createElement("img");
          icon.src = this.icon;
          treeDiv.appendChild(icon);
          const p = document.createElement("p");
          p.innerText = this.getName();
          treeDiv.appendChild(p);
        }, 0);
        


        const treeEntriesContainer = document.createElement("div");
        treeEntriesContainer.classList.add("treeEntriesContainer");
        this.treeElement.appendChild(treeEntriesContainer);

        this.entries.forEach(e => {
          treeEntriesContainer.appendChild(e.treeElement);
        });
      }

      // Explorer Entry
      {
        this.element.innerHTML = "";
        const div = document.createElement("div") as EntryElement;
        div.classList.add("entryItem");
        div.addEventListener("dblclick", e => {
          this.open();
        });
        div.addEventListener("contextmenu", e => {
          e.preventDefault();
          this.open();
        });
        div.addEventListener("click", e => {
          this.setDetails();
        });
        this.element.appendChild(div);
        setTimeout(() => {
          const icon = document.createElement("img");
          icon.src = this.icon;
          div.appendChild(icon);
          const p = document.createElement("p");
          p.innerText = this.getName();
          div.appendChild(p);
        }, 0);
      }
    }

    async open() {
      currentDirectory = this;
      setUrl(this.path);
      if (this.entries.length == 0) {
        this.treeElement.innerHTML = "";
        this.treeElement.appendChild(loadingSpinner());
      }
      let fileContainer = document.getElementById("filecontainer") as HTMLDivElement;
      fileContainer.innerHTML = "";
      fileContainer.appendChild(loadingSpinner());
      
      const entries = await readDirectory(this.path);
      fileContainer.innerHTML = "";
      let difference: boolean = false;
      for (let i = 0; i < entries.length; i++) {
        const e = entries[i];
        const thisE = this.entries[i];

        if (e.getName() == "..") {
          entries.splice(i--, 1);
          continue;
        }

        e.parent = this;
        fileContainer.appendChild(e.element);

        if (!thisE
          || e.path != thisE.path
          || e.type != thisE.type
        ) {
          difference = true;
        }
      }

      if (difference || entries.length == 0) {
        this.entries = entries;
        this.updateElement();
      }
      
      this.setDetails();
      
      return this.entries;
    }
  }

  export class FileEntry extends Entry implements Openable
  {
    constructor(path: string) {
      super(path, FileType.File);
      this.updateElement();
    }

    async open() {
      location.href = "/" + this.physicalPath;
    }

    updateElement() {
      // Tree Entry
      {
        this.treeElement.innerHTML = "";
        const treeDiv = document.createElement("div") as TreeEntryElement;
        treeDiv.classList.add("treeEntryItem");
        treeDiv.addEventListener("dblclick", e => {
          this.open();
        });
        treeDiv.addEventListener("contextmenu", e => {
          // e.preventDefault();
        });
        this.treeElement.appendChild(treeDiv);
        
        setTimeout(() => {
          const icon = document.createElement("img");
          icon.src = this.icon;
          treeDiv.appendChild(icon);
          const p = document.createElement("p");
          p.innerText = this.getName();
          treeDiv.appendChild(p);
        }, 0);
      }
      
      // Explorer Entry
      {
        this.element.innerHTML = "";
        const div = document.createElement("div") as EntryElement;
        div.classList.add("entryItem");
        div.addEventListener("dblclick", e => {
          this.open();
        });
        div.addEventListener("contextmenu", e => {
          // e.preventDefault();
        });
        div.addEventListener("click", e => {
          this.setDetails();
        });
        this.element.appendChild(div);

        setTimeout(() => {
          const icon = document.createElement("img");
          icon.src = this.icon;
          div.appendChild(icon);
          const p = document.createElement("p");
          p.innerText = this.getName();
          div.appendChild(p);
        }, 0);
      }
    }
  }

  export function loadingSpinner() {
    let div = document.createElement("div");
    div.classList.add("lds-spinner");
    div.innerHTML = '<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>';
    return div;
  }
}
namespace FileSystem {
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
    constructor(public path: string, public type: FileType) {
      this.treeElement.entry = this;
      this.treeElement.classList.add("treeEntryElement");
      
      this.element.entry = this;
      this.element.classList.add("entryElement");
    }
    
    isFile(): this is FileEntry {
      return this instanceof FileEntry;
    }
    
    isDirectory(): this is DirectoryEntry {
      return this instanceof DirectoryEntry;
    }

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
          treeEntriesContainer.toggleAttribute("collapsed");
        });
        this.treeElement.appendChild(treeDiv);
        const p = document.createElement("p");
        
        p.innerText = this.path.split("/").pop();
        treeDiv.appendChild(p);

        const treeEntriesContainer = document.createElement("div");
        treeEntriesContainer.classList.add("treeEntriesContainer");
        this.treeElement.appendChild(treeEntriesContainer);

        this.entries.forEach(e => {
          treeEntriesContainer.appendChild(e.treeElement);
        });
      }
      this.element.entry = this;

      // Explorer Entry
      {

      }
    }

    async open() {
      setUrl(this.path);
      const entries = await readDirectory(this.path);
      let difference: boolean = false;
      for (let i = 0; i < entries.length; i++) {
        const e = entries[i];
        const thisE = this.entries[i];
        if (!thisE
          || e.path != thisE.path
          || e.type != thisE.type
        ) {
          difference = true;
          break;
        }
      }

      if (difference) {
        this.entries = entries;
        this.updateElement();
      }

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
        const p = document.createElement("p");
        
        p.innerText = this.path.split("/").pop();
        treeDiv.appendChild(p);
      }
      this.element.entry = this;

      // Explorer Entry
      {

      }
    }
  }
}
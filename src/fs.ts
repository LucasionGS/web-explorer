namespace FileSystem {
  export var currentDirectory: DirectoryEntry;
  
  export interface EntryElement extends HTMLDivElement {
    entry: Entry;
  }
  
  export interface TreeEntryElement extends HTMLDivElement {
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
    const entries = await request<{
      "type": number,
      "path": string,
      "physicalPath": string,
      "icon": string,
      "size": number,
    }[]>("/files.php?dir=" + path);
    
    return entries.map(e => {
      var entry: Entry;
      if (e.type == FileType.Directory) entry = new DirectoryEntry(e.path);
      else if (e.type == FileType.File) entry = new FileEntry(e.path);
      else return;

      entry.physicalPath = e.physicalPath;
      entry.icon = e.icon;
      entry.type = e.type;
      
      if (entry.isFile()) {
        entry.size = e.size;
        
        if (entry.isImage()) {
          let _img = document.createElement("img");
          _img.src = "/" + entry.physicalPath;
          _img.addEventListener("load", () => {
            entry.icon = "/" + entry.physicalPath;
            (entry as FileEntry).updateElement();
          });
        }
      }

      return entry;
    })
  }

  async function request<JSONResponse = any>(path: string, data: {[key: string]: string | Blob} = {}): Promise<JSONResponse> {
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
    public static deselectAll() {
      document.querySelectorAll<EntryElement>(".entryElement[selected]").forEach(e => e.entry.selected = false);
    }
    parent: DirectoryEntry;
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
      function br() { return document.createElement("br"); }
      function hr() { return document.createElement("hr"); }
      entryinfo.innerHTML = "";

      if (this.isDirectory()) {
        let self = this;
        let newFolder = document.createElement("button");
        newFolder.innerText = "New Folder";
        newFolder.addEventListener("click", () => {
          self.newFolder();
        });

        entryinfo.append(
          newFolder,
        );
      }

      if (this.path != "/") {
        let deleteEntry = document.createElement("button");
        deleteEntry.innerText = "Delete";
        deleteEntry.addEventListener("click", () => {
          if (confirm("Are you sure you want to delete \""+ this.getName() +"\"")) {
            this.delete();
          }
        });
        
        let renameEntry = document.createElement("button");
        renameEntry.innerText = "Rename";
        renameEntry.addEventListener("click", () => {
          this.rename();
        });

        entryinfo.append(
          br(),
          renameEntry,
          br(),
          deleteEntry,
          hr(),
        );
        if (this.isDirectory()) {
          entryinfo.append(
            `Files: ${this.entries.length > 0 ? this.entries.length : "Load folder to display.."}`,
            hr(),
          )
        }
      }


      entryinfo.append(
        "Full Path: " + this.path,
        hr(),
        "Name: " + this.getName(),
        hr(),
      );

      if (this.isFile()) {
        entryinfo.append(
          "Size: " + this.parseSize(),
          hr()
        );
        let ext = this.getExt();
        function isExtType(exts: string[]) {
          return exts.indexOf(ext.toLowerCase()) != -1;
        }
        if (this.isImage()) {
          // Editor
          let img = document.createElement("img");
          img.src = "/" + this.physicalPath;
          img.classList.add("previewimage");
          entryinfo.append(img, hr());
        }
        if (isExtType([
          "json",
          "ts",
          "js",
          "txt"
        ])) {
          // Editor
          let openInEditor = document.createElement("button");
          openInEditor.innerText = "Open in editor..."
          let self = this;
          openInEditor.addEventListener("click", () => {
            self.openInEditor();
          });
          entryinfo.append(openInEditor, hr());
        }
      }

      setTimeout(() => {
        let selected = Entry.getSelectedEntries();
        let deleteSelected = document.createElement("button");
        deleteSelected.innerText = "Delete selected";
        deleteSelected.addEventListener("click", async () => {
          let selected = FileSystem.Entry.getSelectedEntries();
          if (selected.length > 0 && confirm(`Are you sure you want to delete ${selected.length} files?`)) {
            await FileSystem.Entry.bulkDelete(selected);

            setTimeout(() => {
              FileSystem.currentDirectory.open();
            }, 0);
          }
        });
        if (selected.length > 1) {
          entryinfo.append(
            `Selected: ${selected.length} items`,
            br(),
            `Selected size: ${FileEntry.parseSize((selected.filter(e => e.isFile()) as FileEntry[]).map(e => e.size).reduce((p, c) => p + c))}`,
            hr(),
            deleteSelected
          );
        }
      }, 0);
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

    public static getCurrentEntries() {
      return [...document.querySelectorAll<FileSystem.EntryElement>(".entryElement")].map(e => e.entry);
    }
    public static getSelectedEntries() {
      return [...document.querySelectorAll<FileSystem.EntryElement>(".entryElement[selected]")].map(e => e.entry);
    }

    public static async bulkDelete(bulk: Entry[]) {
      let fc = document.querySelector("#filecontainer");
      fc.innerHTML = "";
      fc.appendChild(FileSystem.loadingSpinner());
      for (let i = 0; i < bulk.length; i++) {
        const e = bulk[i];
        await e.delete(true);
      }
    }

    async rename(newName?: string, skipReload = false) {
      if (this.path == "/") {
        alert("You cannot rename the root folder.");
        return {success: false, reason: "You cannot rename the root folder."};
      }

      if (!name) {
        modal((m, cm) => {
          let div = document.createElement("div");
          let p = document.createElement("p");
          p.innerText = "Renaming \""+ this.getName() +"\"...";
          let nameInput = document.createElement("input");
          nameInput.value = this.getName();
          let ext = "";
          if (this.isFile()) ext = this.getExt();
          setTimeout(() => {
            nameInput.focus();
            nameInput.setSelectionRange(0, this.getName().length - (ext ? ext.length + 1 : 0))
            nameInput.style.fontSize = "24px";
            nameInput.style.width = "100%";
          }, 0);
          let create = document.createElement("button");
          create.innerText = "Rename";
          create.addEventListener("click", async () => {
            let name = nameInput.value.trim();
            if (name != "") {
              cm();
              return await request<{success: boolean, reason?: string}>("/operators/rename.php", {
                "target": this.path,
                "newname": name
              }).then(res => {
                if (res.success) {
                  if (skipReload != true) currentDirectory.open();
                }
                else {
                  alert(res.reason);
                }
        
                return res;
              });
            }
          });

          nameInput.addEventListener("keydown", e => {
            if (e.key == "Enter") {
              e.preventDefault();
              create.click();
            }
            else if (e.key == "Escape") {
              e.stopPropagation();
              e.preventDefault();
              cancel.click();
            }
          });
          
          let cancel = document.createElement("button");
          cancel.innerText = "Cancel";
          cancel.addEventListener("click", () => cm());
          
          div.append(
            p,
            nameInput,
            document.createElement("br"),
            create,
            cancel
          );

          return div;
        });
      }
      else {
        return await request<{success: boolean, reason?: string}>("/operators/rename.php", {
          "target": this.path,
          "newname": newName
        }).then(res => {
          if (res.success) {
            if (skipReload != true) currentDirectory.open();
          }
          else {
            alert(res.reason);
          }
  
          return res;
        });
      }
    }
    
    async delete(skipReload = false) {
      if (this.path == "/") {
        alert("You cannot delete the root folder.");
        return {success: false, reason: "You cannot delete the root folder."};
      }

      if (this.isDirectory() && this.entries.length > 0) {
        return alert("You cannot delete folder \""+ this.getName() +"\", as it is not empty.");
      }

      return await request<{success: boolean, reason?: string}>("/operators/delete.php", {
        "target": this.path
      }).then(res => {
        if (res.success) {
          if (skipReload != true) this.parent.open();
        }
        else {
          alert(res.reason);
        }

        return res;
      });
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

    async newFolder(name?: string) {
      if (!name) {
        modal((m, cm) => {
          let div = document.createElement("div");
          let p = document.createElement("p");
          p.innerText = "Creating new folder in \""+ this.path +"\"";
          let nameInput = document.createElement("input");
          setTimeout(() => {
            nameInput.focus();
          }, 0);
          let create = document.createElement("button");
          create.innerText = "Create";
          create.addEventListener("click", () => {
            let name = nameInput.value.trim();
            if (name != "") {
              if (this.entries.findIndex(e => e.getName() == name) != -1) {
                alert("This name already exists in this folder");
                return;
              }

              request("/operators/mkdir.php", {
                "target": this.path,
                "name": name
              }).then(async () => {
                await this.open();
                (this.entries.find(e => e.getName() == name) as DirectoryEntry).open()
              });
              cm();
            }
          });

          nameInput.addEventListener("keydown", e => {
            if (e.key == "Enter") {
              e.preventDefault();
              create.click();
            }
            else if (e.key == "Escape") {
              e.stopPropagation();
              e.preventDefault();
              cancel.click();
            }
          });
          
          let cancel = document.createElement("button");
          cancel.innerText = "Cancel";
          cancel.addEventListener("click", () => cm());
          
          div.append(
            p,
            nameInput,
            document.createElement("br"),
            create,
            cancel
          );

          return div;
        });
      }
      else {
        request("/operators/mkdir.php", {
          "target": this.path,
          "name": name
        }).then(() => this.open());
      }
    }

    uploadFile(files: Blob[], message?: string) {
      let resolve: (value?: {success: boolean; reason?: string; } | PromiseLike<{success: boolean; reason?: string; }>) => void;
      let promise = new Promise<{success: boolean, reason?: string}>(res => resolve = res);
      if (files.length == 0) return;
      let data = new FormData();
      data.append('dir', this.path);
      files.forEach(f => data.append('fileToUpload[]', f));

      let httpReq = new XMLHttpRequest();
      httpReq.open('POST', '/upload.php');

      let closeModal: () => void;
      let p: HTMLParagraphElement;
      modal((m, cm) => {
        closeModal = cm;

        p = document.createElement("p");
        return p;
      });

      // upload progress event
      httpReq.upload.addEventListener('progress', function(e) {
        // upload progress as percentage
        let percent_completed = (e.loaded / e.total) * 100;
        p.innerText = "Uploading... " + percent_completed.toFixed(2) + "%";
        if (message) p.append(document.createElement("hr"), message);
      });

      // request finished event
      httpReq.addEventListener('load', (e) => {
        try {
          closeModal();
          let res: {success: boolean, reason?: string} = JSON.parse(httpReq.response);
          if (!res.success) {
            alert(res.reason);
          }
          resolve(res);
        } catch (error) {
          console.error(httpReq.response);
          resolve({success: false, reason: "Catch went off."})
        }
      });

      // send POST request to server
      httpReq.send(data);

      return promise;
    }

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
        treeDiv.addEventListener("click", e => {
          this.setDetails();
        });
        treeDiv.addEventListener("contextmenu", e => {
          e.preventDefault();
          if (this.entries.length == 0) {
            this.open();
            this.setDetails();
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
          e.stopPropagation();
          e.preventDefault();
          this.setDetails();
          if (!e.ctrlKey) FileSystem.Entry.deselectAll();
          this.selected = e.ctrlKey ? !this.selected : true;
        });
        div.addEventListener("touchstart", e => {
          if (e.touches.length == 2) {
            this.selected = !this.selected;
            this.setDetails();
          }
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
      if (this.isImage()) {
        modalPreviewMedia(this);
        return;
      }
      location.href = "/" + this.physicalPath;
    }

    public size: number;

    public static parseSize(size: number) {
      // In bytes originally.
      let out = "";
      if (size < 1024) out = size + " Bytes"
      else if (size < Math.pow(1024, 2)) out = (size / 1024).toFixed(2) + " Kb"
      else if (size < Math.pow(1024, 3)) out = (size / Math.pow(1024, 2)).toFixed(2) + " Mb"
      else if (size < Math.pow(1024, 4)) out = (size / Math.pow(1024, 3)).toFixed(2) + " Gb"
      else out = (size / Math.pow(1024, 4)) + " Tb"
      return out;
    }

    public parseSize() {
      return FileEntry.parseSize(this.size);
    }

    getExt() {
      let extParts = this.getName().split(".");
      return extParts.length > 1 ? extParts.pop() : "";
    }

    isImage() {
      return [
        "apng",
        "avif",
        "gif",
        "ico",

        "jpg",
        "jpeg",
        "jfif",
        "pjpeg",
        "pjg",

        "png",
        "svg",
        "webp",
      ].indexOf(this.getExt().toLowerCase()) != -1;
    }

    openInEditor() {
      let lang = this.getExt();
      if (lang == "js") lang = "javascript";
      if (lang == "ts") lang = "typescript";
      modalIntegratedCode(this, lang);
      // location.href = "/editor?file=" + this.path;
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
        treeDiv.addEventListener("click", e => {
          this.setDetails();
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
          e.stopPropagation();
          e.preventDefault();
          this.setDetails();
          if (!e.ctrlKey) FileSystem.Entry.deselectAll();
          this.selected = e.ctrlKey ? !this.selected : true;
        });
        div.addEventListener("touchstart", e => {
          if (e.touches.length == 2) {
            this.selected = !this.selected;
            this.setDetails();
          }
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

  export function traverseDirectory(entry: any) {
    let reader = entry.createReader();
    // Resolved when the entire directory is traversed
    return new Promise((resolveDirectory) => {
      var iteration_attempts: any[] = [];
      (function read_entries() {
        // According to the FileSystem API spec, readEntries() must be called until
        // it calls the callback with an empty array.  Seriously??
        reader.readEntries((entries: any[]) => {
          if (!entries.length) {
            // Done iterating this particular directory
            resolveDirectory(Promise.all(iteration_attempts));
          } else {
            // Add a list of promises for each directory entry.  If the entry is itself 
            // a directory, then that promise won't resolve until it is fully traversed.
            iteration_attempts.push(Promise.all(entries.map((entry) => {
              if (entry.isFile) {
                // DO SOMETHING WITH FILES
                return entry;
              } else {
                // DO SOMETHING WITH DIRECTORIES
                return traverseDirectory(entry);
              }
            })));
            // Try calling readEntries() again for the same dir, according to spec
            read_entries();
          }
        }, (err: any) => {
          if (err) console.error(err);
        });
      })();
    });
  }
}
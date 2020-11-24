var ac: any;

document.querySelector<HTMLInputElement>("#fileSelector").addEventListener("change", function(e) {
  var object = e.target as HTMLInputElement;
  if (object.value != "") {
    document.querySelector<HTMLElement>("#curFile").innerText = Path.getFile(object.value);
  }
  else {
    document.querySelector<HTMLElement>("#curFile").innerText = "No file selected";
  }
});

function upload(e) {
  if (document.querySelector<HTMLInputElement>("#fileSelector").value == "") {
    e.preventDefault();
    document.querySelector<HTMLElement>("#curFile").innerText = "Please select a file";
  }
}

function addCustomDir()
{
  let customDir = document.querySelector<HTMLInputElement>("#customDir");
  var dir = customDir.value;
  if (dir.trim() == "") {return;}
  const option = document.createElement("option");
  option.innerText = dir;
  option.value = dir;
  let directory = document.querySelector<HTMLInputElement>("#directory");
  directory.value = dir;
  if (directory.value == "") {
    directory.append(option);
    directory.value = dir;
    ac.completions.push(dir);
  }
  customDir.value = "";
  
}
class Path
{
  /**
   * Corrects a path's ``\`` into ``/`` and double slashes will turn into singles. Removes irrelevant ``./``.
   * @param {string} path Path to correct
   */
  static correct(path: string) {
    path = path.replace(/\\+|\/\/+/g, "/");
    while (/\/\.\//g.test(path)) {
      path = path.replace(/\/\.\//g, "/");
    }

    return path;
  }

  static getFile(path: string) {
    path = Path.correct(path);
    return path.split("/").pop();
  }
}

class Entry
{
  path: string;

  constructor(public element: HTMLDivElement) {
    
  }
}

class DirectoryEntry extends Entry
{
  constructor(element: HTMLDivElement) {
    super(element);
  }
}

class FileEntry extends Entry
{
  constructor(element: HTMLDivElement) {
    super(element);
  }
}

function setCookie(name: string, value: any, reloadOnResponse = false) {
  fetch("/cookie.php?" + name + "=" + value).then(res => location.reload());
}

// window.addEventListener("load", () => {
//   let directoryEntryElements = document.querySelectorAll<HTMLDivElement>(".directoryentry");
// });
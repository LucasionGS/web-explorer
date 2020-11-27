var ac: any;

document.querySelector<HTMLInputElement>("#fileSelector").addEventListener("change", function(e) {
  var object = e.target as HTMLInputElement;
  if (object.value != "") {
    document.querySelector<HTMLElement>("#curFile").innerText = fileListToArray(object.files).map(file => Path.getFile(file.name)).join(", ");
    document.querySelector<HTMLFormElement>("#fileuploadform").submit();
  }
  else {
    document.querySelector<HTMLElement>("#curFile").innerText = "No file selected";
  }
});

function fileListToArray(list: FileList) {
  const arr: File[] = [];
  for (let i = 0; i < list.length; i++) {
    const file = list[i];
    arr.push(file);
  }

  return arr;
}

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

window.addEventListener("load", () => {
  // let directoryEntryElements = document.querySelectorAll<HTMLDivElement>(".directoryentry");

  let d = document.querySelector<HTMLDivElement>("#dropzone");

  d.addEventListener('dragenter', function (){}, false);
  d.addEventListener('dragleave', function (){}, false);
  d.addEventListener('dragover', function (event) {
    event.stopPropagation();1
    event.preventDefault();
  }, false);

  d.addEventListener("drop", e => {
    e.preventDefault();
    document.querySelector<HTMLInputElement>("#fileSelector").files = e.dataTransfer.files;
    document.querySelector<HTMLElement>("#curFile").innerText = fileListToArray(e.dataTransfer.files).map(file => Path.getFile(file.name)).join(", ");
    document.querySelector<HTMLFormElement>("#fileuploadform").submit();
  }, );

  d.addEventListener("click", () => {
    document.querySelector<HTMLInputElement>("#fileSelector").click();
  });
});

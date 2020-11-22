document.querySelector("#fileSelector").onchange = function(e) {
  var object = e.target;
  if (object.value != "") {
    document.querySelector("#curFile").innerText = Path.getFile(object.value);
  }
  else {
    document.querySelector("#curFile").innerText = "No file selected";
  }
};

function upload(e) {
  if (document.querySelector("#fileSelector").value == "") {
    e.preventDefault();
    document.querySelector("#curFile").innerText = "Please select a file";
  }
}

function addCustomDir()
{
  var dir = document.querySelector("#customDir").value;
  if (dir.trim() == "") {return;}
  const option = document.createElement("option");
  option.innerText = dir;
  option.value = dir;
  document.querySelector("#directory").value = dir;
  if (document.querySelector("#directory").value == "") {
    document.querySelector("#directory").append(option);
    document.querySelector("#directory").value = dir;
    ac.completions.push(dir);
  }
  document.querySelector("#customDir").value = "";
  
}
class Path
{
  /**
   * Corrects a path's ``\`` into ``/`` and double slashes will turn into singles. Removes irrelevant ``./``.
   * @param {string} path Path to correct
   */
  static correct(path) {
    path = path.replace(/\\+|\/\/+/g, "/");
    while (/\/\.\//g.test(path)) {
      path = path.replace(/\/\.\//g, "/");
    }

    return path;
  }

  static getFile(path) {
    path = Path.correct(path);
    return path.split("/").pop();
  }
}

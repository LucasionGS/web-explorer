<?php
require_once("./config.php");
$filesPath = $config["files"];
define("IS_DIR", 1);
define("IS_FILE", 2);
$_DIR = trim($_GET["dir"], "/");
$dir = $filesPath . "/" . $_DIR;
$dir = trim($dir, "/");
$dirSections = explode("/", $dir);

$files = [];
if (is_dir($dir)) {
  $files = array_slice(scandir($dir), 1);
}
else if (is_file($dir)) {
  $dirSections[0] = "download";
  $path = "/" . implode("/", $dirSections);
  return header("Location: $path");
}
else {
  // Doesn't exist
  $dirSections[0] = "explorer";
  array_pop($dirSections);
  $path = "/" . implode("/", $dirSections);
  return header("Location: $path");
}

class Entry
{
  public $path;
  public $icon = "/src/icons/unknown.png";
  public function __construct(string $path) {
    $this->path = $path;
  }

  public function getFullPath() {
    return "/explorer/" . $this->directory;
  }
}

interface InteractableEntry {
  function createElement();
}

class DirectoryEntry extends Entry implements InteractableEntry
{
  public function __construct(string $directoryPath) {
    $this->path = $directoryPath;
    $this->icon = "/src/icons/folder.png";
  }

  public function createElement() {
    $parts = explode("/", $this->path);
    $name = array_slice($parts, -1, 1)[0];
    $path = "/explorer/" . implode("/", array_slice($parts, 1));
    $icon = $this->icon;
    $data = "
    <a class=\"entrylink\" href=\"$path\">
      <div title=\"Click to open\" class=\"entry\">
        <img src=\"$icon\" class=\"entryicon\">
        <div class=\"entryname\">
          <p>$name</p>
        </div>
      </div>
    </a>";
    return $data;
  }
}

class FileEntry extends Entry implements InteractableEntry
{
  public function __construct(string $filePath) {
    $this->path = $filePath;
  }

  public function createElement() {
    $parts = explode("/", $this->path);
    $name = array_slice($parts, -1, 1)[0];
    $path = "/explorer/" . implode("/", array_slice($parts, 1));
    $icon = $this->icon;
    $data = "
    <a class=\"entrylink\" href=\"$path\">
      <div title=\"Click to download\" class=\"entry\">
        <img src=\"$icon\" class=\"entryicon\">
        <div class=\"entryname\">
          <p>$name</p>
        </div>
        ". (substr(mime_content_type($this->path), 0, 5) == "image" ? "<img class=\"previewimage\" src=\"$path\">" : "") ."
      </div>
    </a>";
    return $data;
  }
}

/**
 * @var (DirectoryEntry|FileEntry)[]
 */
$entries = [];

for ($i=0; $i < count($files); $i++) { 
  $file =  $dir . "/" .$files[$i];
  if (is_dir($file)) {
    array_push($entries, new DirectoryEntry($file));
  }
  else if (is_file($file)) {
    array_push($entries, new FileEntry($file));
  }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>File Manager<?php echo " | /" . $_DIR; ?></title>
  <link rel="stylesheet" href="/src/explorer.css">
  <link rel="stylesheet" href="/src/style.css">
  <script async src="/src/handler.js"></script>
  <script src="/src/autocomplete.js"></script>
</head>
<body>
  <div class="centercontainer">
    <div id="filecontainer">
      <?php
      for ($i=0; $i < count($entries); $i++) {
        $entry = $entries[$i];
        $data = $entry->createElement();
        echo $data;
      }
      ?>
    </div>
    <div id="uploadfile">
      <!-- <div id="dropzone">Upload to this folder...</div> -->
      <div class="uploadBox">
        <input type="text" id="customDir" onkeydown="if(event.keyCode == '13') {event.preventDefault(); addCustomDir();}"><button onclick="addCustomDir()">Add Directory</button>
        <form class="upload" method="POST" action="/upload.php" enctype="multipart/form-data">
          <input type="file" name="fileToUpload" id="fileSelector" hidden>
          <select name="dir" id="directory" style="min-width: 64px;">
            <option value="/">/</option>
            <?php
            function getDirContents($dir, &$results = array()){
              $files = scandir($dir);
              foreach($files as $key => $value){
                $path = ($dir.DIRECTORY_SEPARATOR.$value);
                if($value != "." && $value != ".." && is_dir($path)) {
                  getDirContents($path, $results);
                  $results[] = $path;
                }
              }
              return $results;
            }

            $files = getDirContents($filesPath . "/");
            for ($i = 0; $i < count($files); $i++) {
              $file = substr($files[$i], strlen($filesPath . "/"));
              echo '<option value="'.$file.'">'.$file.'</option>';
            }
            ?>
          </select>
          <br>
          <label id="curFile" onclick="document.querySelector('#fileSelector').click();">Click here to choose a file.</label>
          <br><br>
          <input onclick="upload(event)" type="submit" value="Upload" style="width:64px; height: 32px;">
        </form>
      </div>
      <script>
      <?php if(isset($_GET["dir"]) && $_GET["dir"] != "/") {
        echo "document.querySelector(\"#directory\").value = \"/".trim($_GET["dir"], "/")."\";";
        echo "document.querySelector(\"#customDir\").value = \"/".trim($_GET["dir"], "/")."/\";";
      } ?>
      var ac = new AutoComplete(document.querySelector("#customDir"));
      ac.completions = [
        <?php
        function PrintFiles($files)
        {
          global $filesPath;
          for ($i = 0; $i < count($files); $i++) { 
            $file = $files[$i];
              echo "\"".substr($file, strlen($filesPath . "/"))."\",";
          }
        }
        PrintFiles($files);
        ?>
      ];

      ac.caseSensitive = true;
      </script>
    </div>
  </div>
</body>
</html>
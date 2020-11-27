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
  $files = array_slice(scandir($dir), $_DIR != "" ? 1 : 2);
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

$icons = [
  "." =>    "/src/icons/unknown.png",

  // Media
  "avi" =>  "/src/icons/avi.png",
  "wav" =>  "/src/icons/wav.png",
  "jpg" =>  "/src/icons/jpg.png",
  "jpeg" =>  "/src/icons/jpg.png",
  "png" =>  "/src/icons/png.png",
  "psd" =>  "/src/icons/psd.png",
  "mov" =>  "/src/icons/mov.png",
  "mp3" =>  "/src/icons/mp3.png",

  // Coding
  "css" =>  "/src/icons/css.png",
  "dll" =>  "/src/icons/dll.png",
  
  // HTML
  "htm" =>  "/src/icons/htm.png",
  "html" => "/src/icons/html.png",
  
  // Compressed
  "zip" =>  "/src/icons/zip.png",
  
  // Other
  "eps" =>  "/src/icons/eps.png",
  "doc" =>  "/src/icons/doc.png",
  "pdf" =>  "/src/icons/pdf.png",
  "ppt" =>  "/src/icons/ppt.png",
  "txt" =>  "/src/icons/txt.png",
  "xls" =>  "/src/icons/xls.png",
];

class Entry
{
  // Folder == 0
  // File   == 1
  public $type = 0;
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
    $this->type = 0;
  }

  public function createElement() {
    global $filePath;
    $parts = explode("/", $this->path);
    $name = array_slice($parts, -1, 1)[0];
    $realPath = "/" . implode("/", array_slice($parts, 1));
    $path = "/explorer" . $realPath;
    $icon = $this->icon;
    $data = "
    <a class=\"entrylink\" href=\"$path\">
      <div title=\"Click to open\" class=\"entry directoryentry\">
        <img src=\"$icon\" class=\"entryicon\">
        <div class=\"entryname\">
          <p>$name</p>
        </div>
        <div class=\"actions\">
          <a onclick=\"if (confirm('Are you sure you want to delete $name?')) ''; else event.preventDefault();\" href=\"/operators/delete.php?target=$realPath\">
            <div class=\"actionbutton\">Delete</div>
          </a>
        </div>
      </div>
    </a>";
    return $data;
  }
}

class FileEntry extends Entry implements InteractableEntry
{
  public function __construct(string $filePath) {
    global $icons;
    $this->path = $filePath;
    $this->type = 1;
    $ext = pathinfo($filePath)['extension'];
    if ($icons[$ext] != null) {
      $this->icon = $icons[$ext];
    }
  }

  public function createElement() {
    global $filePath, $entries;
    $parts = explode("/", $this->path);
    $name = array_slice($parts, -1, 1)[0];
    $realPath = "/" . implode("/", array_slice($parts, 1));
    $path = "/explorer" . $realPath;
    $icon = $this->icon;
    $preview = "";
    $mimeType = mime_content_type($this->path);
    if ($_COOKIE["previewmedia"] == "1" && !($_COOKIE["limitpreviewunder100"] == "1" && count($entries) >= 100)) {
      if (substr($mimeType, 0, strlen("image")) == "image") {
        $preview = "<img class=\"previewimage\" src=\"$path\">";
      }
      if (substr($mimeType, 0, strlen("video")) == "video") {
        $preview = "<video class=\"previewimage\" controls><source src=\"$path\"></video>";
      }
    }
    $data = "
    <a class=\"entrylink\" href=\"$path\">
      <div title=\"Click to download\" class=\"entry fileentry\" mime=\"$mimeType\">
        <img src=\"$icon\" class=\"entryicon\">
        <div class=\"entryname\">
          <p>$name</p>
        </div>
        <div class=\"actions\">
          <a href=\"/operators/download.php?target=$realPath\">
            <div class=\"actionbutton\">Download</div>
          </a>
          <a onclick=\"if (confirm('Are you sure you want to delete $name?')) ''; else event.preventDefault();\" href=\"/operators/delete.php?target=$realPath\">
            <div class=\"actionbutton\">Delete</div>
          </a>
        </div>
        ". $preview ."
      </div>
    </a>";
    return $data;
  }
}

/**
 * @var (DirectoryEntry|FileEntry)[]
 */
$entries = [];
for ($i= ($files[0] == ".." ? 1 : 0); $i < count($files); $i++) {
  if ($files[$i] == ".") continue;
  $file = $dir . "/" .$files[$i];
  if (is_dir($file)) {
    array_push($entries, new DirectoryEntry($file));
  }
  else if (is_file($file)) {
    array_push($entries, new FileEntry($file));
  }
}
$total = $files[0] == ".." ? count($files) - 1 : count($files);

usort($entries, function($a, $b) {
  return strtolower($a->path) > strtolower($b->path);
});

usort($entries, function($a, $b) {
  return $a->type > $b->type;
});

if ($files[0] == "..") {
  array_unshift($entries, new DirectoryEntry(
    $dir . "/" .$files[0]
  ));
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
  <script src="/src/dropzone-5.7.0/dist/min/dropzone.min.js"></script>
  <script src="/src/autocomplete.js"></script>
  <script async src="/src/handler.js"></script>
</head>
<body>
  <div class="centercontainer">
    <div id="filecontainer">
      <div>
        <p>Found <?php echo $total; ?> files</p>
      </div>
      <?php
      for ($i=0; $i < count($entries); $i++) {
        $entry = $entries[$i];
        $data = $entry->createElement();
        echo $data;
      }
      ?>
    </div>
    <div id="uploadfile">
      <div class="uploadBox">
        <input type="text" id="customDir" onkeydown="if(event.keyCode == '13') {event.preventDefault(); addCustomDir();}"><button onclick="addCustomDir()">Add Directory</button>
        <form class="upload" id="fileuploadform" method="POST" action="/upload.php" enctype="multipart/form-data">
          <input type="file" name="fileToUpload[]" id="fileSelector" hidden multiple>
          <select name="dir" id="directory" style="max-width: 100%;">
            <option value="/">/</option>
            <?php
            function getDirContents($dir, &$results = array()) {
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
          <div id="dropzone">
          <p style="text-align: center; padding-top: calc(128px - 1em); padding-bottom: 128px;">
            Drag files here or click to select
          </p>
          </div>
          <br><br>
          <input onclick="upload(event)" id="uploadbutton" type="submit" value="Upload" style="width:64px; height: 32px;">
        </form>
      </div>
      <div style="margin: 20px;">
        <p>(Settings are only for pc users, apparently...)</p>
        <input type="checkbox" id="previewmedia" <?php echo $_COOKIE["previewmedia"] == "1" ? "checked" : ""; ?>
        onclick="setCookie('previewmedia', Number(this.checked), true)">
        <label for="previewmedia">Preview Media</label>
        <br>
        <input type="checkbox" id="limitpreviewunder100"
        <?php echo $_COOKIE["limitpreviewunder100"] == "1" ? "checked" : ""; ?>
        <?php echo $_COOKIE["previewmedia"] == "1" ? "" : "disabled"; ?>
        onclick="setCookie('limitpreviewunder100', Number(this.checked), true)">
        <label for="limitpreviewunder100">Limit Preview to under 100 files</label>
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
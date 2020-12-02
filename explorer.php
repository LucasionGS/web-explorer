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

function encodeFullUrl(string $url) {
  $fileParts = explode("/", $url);
  for ($i2=0; $i2 < count($fileParts); $i2++) {
    $fileParts[$i2] = rawurlencode($fileParts[$i2]);
  }

  $url = implode("/", $fileParts);
  return $url;
}

function decodeFullUrl(string $url) {
  $fileParts = explode("/", $url);
  for ($i2=0; $i2 < count($fileParts); $i2++) {
    $fileParts[$i2] = rawurldecode($fileParts[$i2]);
  }

  $url = implode("/", $fileParts);
  return $url;
}

if (is_dir($dir)) {
  $files = array_slice(scandir($dir), $_DIR != "" ? 1 : 2);
}
else if (is_file($dir)) {
  $dirSections[0] = "view";
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
  "avi" => "/src/icons/avi.png",
  "wav" => "/src/icons/wav.png",
  "jpg" => "/src/icons/jpg.png",
  "jpeg" => "/src/icons/jpg.png",
  "png" => "/src/icons/png.png",
  "psd" => "/src/icons/psd.png",
  "mov" => "/src/icons/mov.png",
  "mp3" => "/src/icons/mp3.png",

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
  public $decodedPath;
  public $icon = "/src/icons/unknown.png";
  public function __construct(string $path) {
    $this->path = encodeFullUrl($path);
    $this->decodedPath = $path;
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
    $this->path = encodeFullUrl($directoryPath);
    $this->decodedPath = $directoryPath;
    $this->icon = "/src/icons/folder.png";
    $this->type = 0;
  }

  public function createElement() {
    global $filePath;
    $parts = explode("/", $this->path);
    $decodedParts = explode("/", $this->decodedPath);
    $name = array_slice($parts, -1, 1)[0];
    $decodedName = array_slice($decodedParts, -1, 1)[0];
    $realPath = "/" . implode("/", array_slice($parts, 1));
    $decodedRealPath = "/" . implode("/", array_slice($decodedParts, 1));
    $path = "/explorer" . $realPath;
    $icon = $this->icon;
    $data = "
    <a class=\"entrylink\" href=\"$path\">
      <div title=\"Click to open\" class=\"entry directoryentry\" id=\"entry_$name\">
        <img src=\"$icon\" class=\"entryicon\">
        <div class=\"entryname\">
          <p>$decodedName</p>
        </div>
        " . ($name != ".." ?
        "<div class=\"actions\">
          <a href=\"#\" onclick=\"renameModal('$decodedRealPath')\">
            <div class=\"actionbutton\">Rename</div>
          </a>
          <a onclick=\"if (confirm('Are you sure you want to delete $decodedName?')) ''; else event.preventDefault();\" href=\"/operators/delete.php?target=$realPath\">
            <div class=\"actionbutton\">Delete</div>
          </a>
        </div>"
        : "") . "
      </div>
    </a>";
    return $data;
  }
}

class FileEntry extends Entry implements InteractableEntry
{
  public function __construct(string $filePath) {
    global $icons;
    $this->path = encodeFullUrl($filePath);
    $this->decodedPath = $filePath;
    $this->type = 1;
    $ext = pathinfo($filePath)['extension'];
    if ($icons[$ext] != null) {
      $this->icon = $icons[$ext];
    }
  }

  public function createElement() {
    global $filePath, $entries;
    $parts = explode("/", $this->path);
    $decodedParts = explode("/", $this->decodedPath);
    $name = array_slice($parts, -1, 1)[0];
    $decodedName = array_slice($decodedParts, -1, 1)[0];
    $realPath = "/" . implode("/", array_slice($parts, 1));
    $decodedRealPath = "/" . implode("/", array_slice($decodedParts, 1));
    $path = "/explorer" . $realPath;
    $icon = $this->icon;
    $preview = "";
    $mimeType = mime_content_type($this->decodedPath);
    if ($_COOKIE["previewmedia"] == "1" && !($_COOKIE["limitpreviewunder100"] == "1" && count($entries) >= 100)) {
      if (substr($mimeType, 0, strlen("image")) == "image") {
        $preview = "<img class=\"previewimage\" src=\"$path\">";
      }
      if (substr($mimeType, 0, strlen("video")) == "video") {
        $preview = "<video class=\"previewimage\" controls><source src=\"$path\"></video>";
      }
      if (substr($mimeType, 0, strlen("audio")) == "audio") {
        $preview = "<audio class=\"previewimage\" controls src=\"$path\"></audio>";
      }
    }
    
    $previewAction = "";
    if (substr($mimeType, 0, strlen("image")) == "image") {
      $previewAction = "<a href=\"#\" onclick=\"setLargePreviewImage('$path', 'image')\"><div class=\"actionbutton\">Preview</div></a>";
    }
    if (substr($mimeType, 0, strlen("video")) == "video" || substr($mimeType, 0, strlen("audio")) == "audio") {
      $previewAction = "<a href=\"#\" onclick=\"setLargePreviewImage('$path', 'video')\"><div class=\"actionbutton\">Preview</div></a>";
    }
    
    $data = "
    <a class=\"entrylink\" href=\"$path\">
      <div title=\"Click to download\" class=\"entry fileentry\" mime=\"$mimeType\" id=\"entry_$name\">
        <img src=\"$icon\" class=\"entryicon\">
        <div class=\"entryname\">
          <p>$decodedName</p>
        </div>
        <div class=\"actions\">
          " . $previewAction . "
          <a href=\"/download/$realPath\">
            <div class=\"actionbutton\">Download</div>
          </a>
          <a href=\"#\" onclick=\"renameModal('$decodedRealPath')\">
            <div class=\"actionbutton\">Rename</div>
          </a>
          <a onclick=\"if (confirm('Are you sure you want to delete $decodedName?')) ''; else event.preventDefault();\" href=\"/operators/delete.php?target=$realPath\">
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
for ($i = ($files[0] == ".." ? 1 : 0); $i < count($files); $i++) {
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
  <script src="/src/autocomplete.js"></script>
  <script async src="/src/handler.js"></script>
  <script async src="/src/search.js"></script>
</head>
<body>
  <div class="centercontainer">
    <div id="filecontainer">
      <div>
        <div id="folderactions">
          <input type="search" id="searchbox" placeholder="Search..." autocomplete="off" onsearch="searchFromElementId('searchbox')" oninput="searchFromElementId('searchbox')">
          <br>
          <button onclick="searchFromElementId('searchbox')">Search</button>

          <a class="actionbutton" href="#mkdir" for="newfolderaction" onclick="folderActionButtonHandler(this)">New Folder</a>
          <div class="actionfields" id="newfolderaction" hidden>
            <form action="/operators/mkdir">
              <input type="hidden" name="target" value="<?php echo $_DIR; ?>" required>
              <input placeholder="New Folder Name..." type="text" name="name" value="New Folder" required autocomplete="off" focusonclick>
              <input type="submit" value="Create folder">
            </form>
          </div>
        </div>
        <p>
          <?php echo "/" . $_DIR; ?>
          <br>
          Found <?php echo $total; ?> files
        </p>
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
      <div style="width: 100%; display: flex; justify-content: center;">
        <img id="largeimagepreview" hidden style="max-width: 100%;">
        <video style="width: 100%;" id="largevideopreviewelement" controls hidden>
          <source id="largevideopreview" hidden>
        </video>
      </div>
      <hr>
      <div class="uploadBox">
        <form class="upload" id="fileuploadform" method="POST" action="/upload.php" enctype="multipart/form-data">
          <input type="file" name="fileToUpload[]" id="fileSelector" onchange="document.querySelector('#fileuploadform').submit();" hidden multiple>
          <select name="dir" id="directory" style="max-width: 100%;" hidden>
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
          <div id="dropzone" onclick="document.querySelector('#fileSelector').click();">
            <p style="text-align: center;">
              Upload
              <br>
              Drag files here or click to select
            </p>
          </div>
        </form>
      </div>
      <div style="margin: 20px;">
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
      } ?>
      </script>
    </div>
  </div>
</body>
</html>
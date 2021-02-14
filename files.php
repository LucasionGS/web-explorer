<?php
require_once("./config.php");
$filesPath = $config["files"];
define("IS_DIR", 1);
define("IS_FILE", 2);
$_DIR = trim(isset($_REQUEST["dir"]) ? $_REQUEST["dir"] : "", "/");
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
  // $files = array_slice(scandir($dir), $_DIR != "" ? 1 : 2);
  $files = array_slice(scandir($dir), 2);
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
  "mp4" => "/src/icons/mp4.png",
  "mp3" => "/src/icons/mp3.png",

  // Coding
  "htm" =>  "/src/icons/htm.png",
  "html" => "/src/icons/html.png",
  "php" => "/src/icons/php.png",
  "css" =>  "/src/icons/css.png",
  "dll" =>  "/src/icons/dll.png",
  "json" =>  "/src/icons/json.png",
  
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
  public $physicalPath;
  public $icon = "/src/icons/unknown.png";
  public function __construct(string $path) {
    $this->physicalPath = encodeFullUrl($path);
    $this->path = $path;
  }

  public function getFullPath() {
    return "/explorer/" . $this->directory;
  }
}

interface InteractableEntry {
  function createElement();
}

class DirectoryEntry extends Entry
{
  public function __construct(string $directoryPath) {
    global $filesPath;
    $this->physicalPath = encodeFullUrl($directoryPath);
    $_t = explode("/", $directoryPath);
    $root = array_shift($_t);

    $this->path = "/" . implode("/", $_t);
    $this->path = "/" . substr(implode("/", $_t), max(0, strlen($filesPath) - strlen($root) - 1));
    $this->icon = "/src/icons/folder.png";
    $this->type = 0;
  }
}

class FileEntry extends Entry
{
  public function __construct(string $filePath) {
    global $icons, $filesPath;
    $this->physicalPath = encodeFullUrl($filePath);
    $_t = explode("/", $filePath);
    $root = array_shift($_t);
    
    $this->path = "/" . implode("/", $_t);
    $this->path = "/" . substr(implode("/", $_t), max(0, strlen($filesPath) - strlen($root) - 1));
    $this->type = 1;
    $this->size = filesize($filePath);
    $ext = pathinfo($filePath)['extension'];
    if ($icons[$ext] != null) {
      $this->icon = $icons[$ext];
    }
  }
  public $size;
}

/**
 * @var (DirectoryEntry|FileEntry)[]
 */
$entries = [];
for ($i = (isset($files[0]) && $files[0] == ".." ? 1 : 0); $i < count($files); $i++) {
  if ($files[$i] == ".") continue;
  $file = $dir . "/" .$files[$i];
  if (is_dir($file)) {
    array_push($entries, new DirectoryEntry($file));
  }
  else if (is_file($file)) {
    array_push($entries, new FileEntry($file));
  }
}
$total = isset($files[0]) && $files[0] == ".." ? count($files) - 1 : count($files);

// usort($entries, function($a, $b) {
//   return $a->type > $b->type;
// });

// usort($entries, function($a, $b) {
//   return strtolower($a->path) - strtolower($b->path);
// });


if (isset($files[0]) && $files[0] == "..") {
  array_unshift($entries, new DirectoryEntry(
    $dir . "/" .$files[0]
  ));
}

echo json_encode($entries);
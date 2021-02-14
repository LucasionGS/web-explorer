<?php
require_once("../config.php");
$files = $config["files"];
$targets = $_REQUEST["targets"];
$root = $_SERVER["DOCUMENT_ROOT"];

function generateRandomString($length = 6)
{
  $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  $charactersLength = strlen($characters);
  $randomString = '';
  for ($i = 0; $i < $length; $i++) {
    $randomString .= $characters[rand(0, $charactersLength - 1)];
  }
  return $randomString;
}

function commonPath($dirList) {
  $arr = array();
  foreach ($dirList as $i => $path) {
    $dirList[$i]  = explode('/', $path);
    unset($dirList[$i][0]);

    $arr[$i] = count($dirList[$i]);
  }

  $min = min($arr);

  for ($i = 0; $i < count($dirList); $i++) {
    while (count($dirList[$i]) > $min) {
      array_pop($dirList[$i]);
    }

    $dirList[$i] = '/' . implode('/', $dirList[$i]);
  }

  $dirList = array_unique($dirList);
  while (count($dirList) !== 1) {
    $dirList = array_map('dirname', $dirList);
    $dirList = array_unique($dirList);
  }
  reset($dirList);

  return current($dirList);
}

if (isset($targets)) {
  $commonPath = commonPath($targets);

  $zipName = "/tmp/" . generateRandomString() . ".zip";
  $zip = new ZipArchive();
  $error = $zip->open($zipName, ZipArchive::CREATE);
  for ($i = 0; $i < count($targets); $i++) {
    $t = $root . "/$files/" . $targets[$i];
    // echo $t;
    if (filetype($t) == "file") {
      $success = $zip->addFromString(trim(substr($targets[$i], strlen($commonPath)), "\\/"), file_get_contents($t));
      if (!$success) {
        echo "$t: Failed!<br>";
      }
    }
  }
  $zip->close();

  if (file_exists($zipName)) {
    // Download zip
    header("Content-Disposition: attachment; filename=\"" . basename($commonPath) . ".zip\"");
    header("Content-type: application/zip");
    header("Content-Length: " . filesize($zipName));
    header("Pragma: no-cache");
    header("Expires: 0");
    // header("Connection: close");
    readfile($zipName);
  } else {
    echo "Failed: $error <br>";
    print_r($targets);
  }
}

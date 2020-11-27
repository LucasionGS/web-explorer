<?php
$target = $_GET["target"];
$newname = $_GET["newname"];
$newPath = dirname($target) . "/$newname";

$root = $_SERVER["DOCUMENT_ROOT"];

if (isset($target) && isset($newname) && trim($newname) != "") {
  $target = $root . "/files/" . $target;
  $newPath = $root . "/files/" . $newPath;
  echo $target . "<br>";
  echo $newPath . "<br>";
  if (!file_exists($newPath)) {
    rename($target, $newPath);
  }
  else {
    echo "Already exists<br>";
  }
}
header("Location: " . $_SERVER["HTTP_REFERER"]);
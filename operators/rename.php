<?php
require_once("../config.php");
$files = $config["files"];
$target = $_REQUEST["target"];
$newname = $_REQUEST["newname"];
$newPath = dirname($target) . "/$newname";

$root = $_SERVER["DOCUMENT_ROOT"];

if (isset($target) && isset($newname) && trim($newname) != "") {
  $target = $root . "/$files/" . $target;
  $newPath = $root . "/$files/" . $newPath;
  if (!file_exists($newPath)) {
    $success = rename($target, $newPath);
    $reason = null;
  }
  else {
    $success = false;
    $reason = "Path already exists.";
  }
}

echo json_encode([
  "success" => $success,
  "reason" => $reason
]);
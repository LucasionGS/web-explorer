<?php
require_once("../config.php");
$files = $config["files"];
$target = $_REQUEST["target"];
$newPath = $_REQUEST["newpath"];

$root = $_SERVER["DOCUMENT_ROOT"];

if (isset($target) && isset($newPath) && trim($newPath) != "") {
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

require_once("./logToFile.php");
logToFile("Moved $target to $newPath | Success: $success");

echo json_encode([
  "success" => $success,
  "reason" => $reason
]);


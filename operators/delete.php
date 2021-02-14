<?php
require_once("../config.php");
$files = $config["files"];
$target = $_REQUEST["target"];

$root = $_SERVER["DOCUMENT_ROOT"];

if (isset($target)) {
  $target = $root . "/$files/" . $target;
  if (is_file($target)) {
    $success = unlink($target);
    $reason = !$success ? "Unable to remove file." : null;
  }
  else if (is_dir($target)) {
    $success = rmdir($target);
    $reason = !$success ? "Unable to remove folder." : null;
  }
}

require_once("./logToFile.php");
logToFile("Deleted $target | Success: $success");

echo json_encode([
  "success" => $success,
  "reason" => $reason
]);
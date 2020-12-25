<?php
require_once("../config.php");
$files = $config["files"];
$target = $_REQUEST["target"];
$name = $_REQUEST["name"];

$root = $_SERVER["DOCUMENT_ROOT"];
$path = $root . "/$files/" . $target;
if (isset($target)) {
  if (isset($name)) $path .= "/$name";
  if ($success = !is_dir($path)) {
    mkdir($path, 0777, true);
  }
}

require_once("./logToFile.php");
logToFile("Created directory $path | Success: $success");

echo json_encode([
  "success" => true,
  "path" => "/explorer/" . $target . "#entry_$name"
]);
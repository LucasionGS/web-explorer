<?php
require_once("../config.php");
$files = $config["files"];
$target = $_REQUEST["target"];
$name = $_REQUEST["name"];

$root = $_SERVER["DOCUMENT_ROOT"];

if (isset($target)) {
  $path = $root . "/$files/" . $target;
  if (isset($name)) $path .= "/$name";
  if (!is_dir($path)) {
    mkdir($path, 0777, true);
  }
}

echo json_encode([
  "success" => true,
  "path" => "/explorer/" . $target . "#entry_$name"
]);
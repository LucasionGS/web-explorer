<?php
$target = $_GET["target"];
$name = $_GET["name"];

$root = $_SERVER["DOCUMENT_ROOT"];

if (isset($target)) {
  $path = $root . "/files/" . $target;
  if (isset($name)) $path .= "/$name";
  if (!is_dir($path)) {
    mkdir($path, 0777, true);
  }
}
// header("Location: " . $_SERVER["HTTP_REFERER"]);
header("Location: /explorer/" . $target . "#entry_$name");
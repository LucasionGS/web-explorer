<?php
$target = $_GET["target"];
$newname = $_GET["newname"];

$root = $_SERVER["DOCUMENT_ROOT"];

if (isset($target)) {
  $path = $root . "/files/" . $target;
  if (!is_dir($path)) {
    mkdir($path, 0777, true);
  }
}
// header("Location: " . $_SERVER["HTTP_REFERER"]);
header("Location: /files/" . $target);
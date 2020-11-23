<?php
$target = $_GET["target"];
$newname = $_GET["newname"];

$root = $_SERVER["DOCUMENT_ROOT"];

if (isset($target)) {
  $target = $root . "/files/" . $target;
  if (is_file($target)) unlink($target);
  else if (is_dir($target)) rmdir($target);
}
header("Location: " . $_SERVER["HTTP_REFERER"]);
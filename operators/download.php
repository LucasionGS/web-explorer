<?php
$target = $_GET["target"];

$root = $_SERVER["DOCUMENT_ROOT"];

if (isset($target)) {
  $target = $root . "/files/" . trim($target, "/");
  // echo $target . "<br>";
  // echo basename($target) . "<br>";
  // echo filesize($target) . "<br>";
  // return;
  header("Content-Disposition: attachment; filename=\"" . basename($target) . "\"");
  header("Content-Type: application/octet-stream");
  header("Content-Length: " . filesize($target));
  header('Content-Transfer-Encoding: binary');
  header("Connection: close");
  if (file_exists($target)) readfile($target);
}

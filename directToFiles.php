<?php
require_once("./config.php");
$root = $_SERVER["DOCUMENT_ROOT"];
$path = $root . "/" . $config["files"] . "/" . base64_decode($_REQUEST["path"]);
if (file_exists($path)) {
  header("Content-Disposition: attachment; filename=\"" . basename($path) . "\"");
  header("Content-type: " . mime_content_type($path));
  header("Content-Length: " . filesize($path));
  header("Expires: 0");
  readfile($path);
}
else {
  header("HTTP/1.0 404 Not Found");
  die();
}
?>
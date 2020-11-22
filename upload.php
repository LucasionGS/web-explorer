<?php
require_once("./config.php");
$dir = $config["files"] . "/";
if (isset($_POST["dir"])) {
  $dir .= $_POST["dir"]."/";
}
else {
  return;
}

if (!is_dir($dir)) {
  mkdir($dir, 0777, true);
}
$name = $_FILES["fileToUpload"]["name"];
$size = $_FILES["fileToUpload"]["size"];
$t_name = $_FILES["fileToUpload"]["tmp_name"];

if (move_uploaded_file($_FILES["fileToUpload"]["tmp_name"], $dir.$name)) {
  echo 'Successfully uploaded.<br><a href="'.$dir.'">Go to File\'s Directory</a><br>';
  $gotoDir = substr($dir, strlen($config["files"] . "/"));
  while(substr($gotoDir, strlen($gotoDir)-1) == "/") {
    $gotoDir = substr($gotoDir, 0, -1);
  }
  // echo '<a href="./?path='.$gotoDir.'">Go to Upload page</a><br>';
  $header = "Location: /explorer" . $_POST["dir"];
  // echo $header;
  header($header);
}
else {
  echo 'Upload failed for some reason... <a href="./">Go to back to the upload page</a>';
}
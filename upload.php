<?php

// print_r($_FILES);
// return;

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

$success = true;

$count = 0;
$totalCount = count($_FILES["fileToUpload"]["name"]);
for ($i=0; $i < $totalCount; $i++) {
  $name = $_FILES["fileToUpload"]["name"][$i];
  // $size = $_FILES["fileToUpload"]["size"][$i];
  // $t_name = $_FILES["fileToUpload"]["tmp_name"][$i];
  if (move_uploaded_file($_FILES["fileToUpload"]["tmp_name"][$i], $dir.$name)) {
    $gotoDir = substr($dir, strlen($config["files"] . "/"));
    while(substr($gotoDir, strlen($gotoDir)-1) == "/") {
      $gotoDir = substr($gotoDir, 0, -1);
    }
    $success = true;
  }
  else {
    $success = false;
  }
}

echo json_encode([
  "success" => $success,
  "reason" => $success ? null : "Upload failed."
]);
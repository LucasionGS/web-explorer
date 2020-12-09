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

if (isset($_POST["fileName"])) {
  $fileName = $_POST["fileName"];
}

$success = true;

$count = 0;
$totalCount = count($_FILES["fileToUpload"]["name"]);
for ($i=0; $i < $totalCount; $i++) {
  $name = $_FILES["fileToUpload"]["name"][$i];

  if (isset($fileName) && isset($fileName[$i])) $name = $fileName[$i];

  if (!is_dir(dirname($dir.$name))) {
    mkdir(dirname($dir.$name), 0777, true);
  }
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
  "debug" => json_encode($_POST),
  "reason" => $success ? null : "Upload failed."
]);
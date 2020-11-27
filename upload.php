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
    echo 'Successfully uploaded.<br><a href="'.$dir.'">Go to File\'s Directory</a><br>';
    $gotoDir = substr($dir, strlen($config["files"] . "/"));
    while(substr($gotoDir, strlen($gotoDir)-1) == "/") {
      $gotoDir = substr($gotoDir, 0, -1);
    }
    // echo '<a href="./?path='.$gotoDir.'">Go to Upload page</a><br>';
    // echo $header;
  }
  else {
    $success = false;
  }
}

if ($success) {
  $header = "Location: /explorer/" . $_POST["dir"];
  header($header);
}
else
  echo 'Upload failed for a file some reason... <a href="./">Go to back to the upload page</a>';
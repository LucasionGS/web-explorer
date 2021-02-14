<?php
/**
 * Global configuration.
 */
$config = [
  # Root location of the files.
  "files" => "files"
];

$rootDir = $_SERVER["DOCUMENT_ROOT"];

# If you want multiple users with different root directories in $config["files"],
# add the file "userRoots.php" amd define an array called "$userRoots" with keys as the username and values as subfolder relative to $config["files"]
if (file_exists($rootDir . "/userRoots.php")) {
  require_once($rootDir . "/userRoots.php");
  if (isset($userRoots)) {
    foreach ($userRoots as $username => $root) {
      if ($_SERVER["PHP_AUTH_USER"] == $username) {
        $config["files"] .= "/" . trim($root, "/");

        // TESTING
        // $pathToTest = "";
        // echo $pathToTest = "index.php";
        // echo "<br>" . (file_exists($pathToTest) ? "true" : "false");
        // echo "<br>" . $pathToTest = $config["files"];
        // echo "<br>" . (is_dir     ($pathToTest) ? "true" : "false");
        // echo "<br>" . $pathToTest = $config["files"];
        // echo "<br>" . (is_writable($pathToTest) ? "true" : "false");
        
        if (!file_exists($config["files"])) mkdir($config["files"], 0777, true);
      }
    }
  }
}
?>
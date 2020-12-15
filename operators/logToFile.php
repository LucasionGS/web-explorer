<?php
function logToFile($message) {
  return file_put_contents("../logs.txt", $message . "\n", FILE_APPEND);
}
?>
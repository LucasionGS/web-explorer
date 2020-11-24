<?php
foreach ($_GET as $key => $value) {
  setcookie($key, $value);
  echo "Set $key to $value<br>";
}
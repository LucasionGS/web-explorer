<?php
require_once("./config.php");
header("Location: /" . $config["files"] . "/" . $_GET["path"]);
?>
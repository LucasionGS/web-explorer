<?php
require_once("./config.php");
$lang = isset($_GET["lang"]) ? $_GET["lang"] : "plaintext";
$file = isset($_GET["file"]) ? $config["files"] . "/" . $_GET["file"] : null;
$fileData = "";

if ($file != null && is_file($file)) {
  $fileData = file_get_contents($file);
  $fileData = str_replace("\\", "\\\\", $fileData);
  $fileData = str_replace("\r\n", "\\r\\n", $fileData);
  $fileData = str_replace("\n", "\\n", $fileData);
  $fileData = str_replace("\"", "\\\"", $fileData);
}
?>

<!DOCTYPE html>
<html>

<head>
  <meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>File Editor<?php echo " | /" . trim($_GET["dir"], "/"); ?></title>
  <link rel="stylesheet" href="/src/explorer.css">
  <link rel="stylesheet" href="/src/style.css">
</head>

<body style="margin: 0; padding: 0;">
  <div id="container" style="width: 100vw; height: 100vh;"></div>

  <!-- OR ANY OTHER AMD LOADER HERE INSTEAD OF loader.js -->
  <script src="../node_modules/monaco-editor/min/vs/loader.js"></script>
  <script>
    require.config({
      paths: {
        vs: '../node_modules/monaco-editor/min/vs'
      }
    });

    require(['vs/editor/editor.main'], function() {
      var editor = monaco.editor.create(document.getElementById('container'), {
        value: "<?php echo $fileData; ?>",
        language: '<?php echo $lang; ?>',
        theme: "vs-dark"
      });
    });
  </script>
</body>

</html>
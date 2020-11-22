<html>
<header>
  <link rel="stylesheet" href="./src/style.css">
  <script async src="./src/handler.js"></script>
  <script src="./src/autocomplete.js"></script>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</header>
<body>
  <div class="uploadBox">
    <input type="text" id="customDir" onkeydown="if(event.keyCode == '13') {event.preventDefault(); addCustomDir();}"><button onclick="addCustomDir()">Add Directory</button>
    <form class="upload" method="POST" action="upload.php" enctype="multipart/form-data">
      <input type="file" name="fileToUpload" id="fileSelector" hidden>
      <select name="dir" id="directory" style="min-width: 64px;">
        <option value="/">/</option>
        <?php
        function getDirContents($dir, &$results = array()){
          $files = scandir($dir);
          foreach($files as $key => $value){
            $path = ($dir.DIRECTORY_SEPARATOR.$value);
            if($value != "." && $value != ".." && is_dir($path)) {
              getDirContents($path, $results);
              $results[] = $path;
            }
          }
          return $results;
        }

        $files = getDirContents("./files/");
        for ($i = 0; $i < count($files); $i++) {
          $file = substr($files[$i], strlen("./files/"));
          echo '<option value="'.$file.'">'.$file.'</option>';
        }
        ?>
      </select>
      <br>
      <label id="curFile" onclick="document.querySelector('#fileSelector').click();">Click here to choose a file.</label>
      <br><br>
      <input onclick="upload(event)" type="submit" value="Upload" style="width:64px; height: 32px;">
    </form>
    <a href="./explorer">Go to files</a>
  </div>
  <script>
  <?php if(isset($_GET["path"])) echo "document.querySelector(\"#directory\").value = \"".$_GET["path"]."\";"; ?>
  var ac = new AutoComplete(document.querySelector("#customDir"));
  ac.completions = [
    <?php
    function PrintFiles($files)
    {
      for ($i = 0; $i < count($files); $i++) { 
        $file = $files[$i];
          echo "\"".substr($file, strlen("./files/"))."\",";
      }
    }
    PrintFiles($files);
    ?>
  ];

  ac.caseSensitive = true;
  </script>
</body>
</html>
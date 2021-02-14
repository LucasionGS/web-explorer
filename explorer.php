<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="/src/explorer.css">
  <link rel="stylesheet" href="/src/spinner.css">
  <script src="/src/utils.js"></script>
  <script src="/src/fs.js"></script>
  <script defer src="/src/explorer.js"></script>
  <title>File Explorer</title>
</head>
<body>
  <div id="explorer" explorer-style-tree="minimal">
    <div id="filetree"></div>
    <div id="filecontainer"></div>
    <div id="filedetails">
      <button id="back" onclick="if (FileSystem.currentDirectory.parent) FileSystem.currentDirectory.parent.open();">&LeftArrow;----------</button>
      <div id="entryinfo"></div>
      <p>Current User: <?php echo $_SERVER["PHP_AUTH_USER"]; ?></p>
    </div>
  </div>
</body>
</html>
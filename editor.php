<!DOCTYPE html>
<html>

<head>
  <meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>File Editor<?php echo " | /" . trim($_GET["dir"], "/"); ?></title>
  <link rel="stylesheet" href="/src/explorer.css">
  <link rel="stylesheet" href="/src/style.css">
</head>

<body>
  <h2>Monaco Editor Sample</h2>
  <div id="container" style="width: 800px; height: 600px; border: 1px solid grey"></div>

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
        value: ['function x() {', '\tconsole.log("Hello world!");', '}'].join('\n'),
        language: 'javascript',
        theme: "vs-dark"
      });
    });
  </script>
</body>

</html>
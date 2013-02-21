Package.describe({
  summary: "js files needed for a sharejs-based ace editor"
});

Package.on_use(function (api, where) {
  //it'd be nice to keep ace separate from sharejs and not include it her
  //but ace has to be loaded before share-ace.js can run
  api.add_files(['ace.js'], "client")
  api.add_files(['ace-config.js'], "client")
  api.add_files(['bcsocket-uncompressed.js'], "client")
  api.add_files(['share-uncompressed.js'], "client")
  api.add_files(['share-ace.js'], "client")
  api.add_files(['share-json.js'], "client")
  api.add_files(['share-text2-uncompressed.js'], "client")
});

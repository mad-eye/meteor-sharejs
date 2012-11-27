Package.describe({
  summary: "js files needed for a sharejs-based ace editor"
});

Package.on_use(function (api, where) {
  api.add_files(['ace.js'], "client")
  api.add_files(['bcsocket-uncompressed.js'], "client")
  api.add_files(['share.uncompressed.js'], "client")
  api.add_files(['share-ace.js'], "client")
});

const http = require('http'),
request = require('request'),
gitPatchAdditions = require('git-patch-additions'),
createHandler = require('github-webhook-handler'),
handler = createHandler({ path: '/', secret: 'myhashsecret' });
var Validator = require('jsonschema').Validator;
var v = new Validator();

http.createServer(function (req, res) {
  console.log('something');
  handler(req, res, function (err) {
    res.statusCode = 404
      res.end('no such location')
  })
}).listen(7777)

handler.on('error', function (err) {
  console.error('Error:', err.message)
})

handler.on('pull_request', function (event) {
  console.log('recieved pull request');
  var patch_url = event.payload.pull_request.patch_url;
  var repo_url = event.payload.pull_request.head.repo.url;
  request(patch_url, function (error, response, body) {
    var additions = gitPatchAdditions.get(body);
    var files_changed = [];
    additions.forEach(function(addition) {
      if(addition.file.endsWith('.json')) files_changed.push(addition.file);
    });
    files_changed = Array.from(new Set(files_changed));
    files_changed.forEach(function(changed_file) {
      var request_options = {
          uri: repo_url+'/contents/'+changed_file,
          headers: {'user-agent': 'node.js'}
      };
      request(request_options, function (error, response, body) {
        if (/^[\],:{}\s]*$/.test(body.replace(/\\["\\\/bfnrtu]/g, '@').
        replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
        replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
          console.log('the json is ok');
        }else{
          console.log('the json is not ok');
        }
        console.log(body);
      });
    });
    console.log(files_changed);
  });
})

console.log("listening on port 7777 for github webhook");

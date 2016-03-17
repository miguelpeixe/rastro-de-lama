var express = require('express');
var fs = require('fs');
var mime = require('mime');
var config = require('./config');

module.exports = function(bot) {

  var app = express();

  app.use('/', express.static(__dirname + '/client'));

  app.use('/assets', express.static(__dirname + '/bower_components'));

  var fileDir = 'files';

  function sendFile(res, path) {
    var type = mime.lookup(path);
    var charset = mime.charsets.lookup(type);
    var options = {
      dotfiles: 'deny',
      headers: {
        'x-timestamp': Date.now(),
        'x-sent': true
      }
    };
    res.contentType(type + (charset ? '; charset=' + charset : ''));
    res.sendFile(path, options);
  }

  app.get('/file/:fileId', function(req, res) {

    var filePath = __dirname + '/' + fileDir + '/' + req.params.fileId;

    fs.readFile(filePath, function(err, file) {
      if(!err) {
        sendFile(res, filePath);
      } else {
        bot.getFile({
          file_id: req.params.fileId,
          dir: './' + fileDir
        }).then(function(file) {
          fs.rename(__dirname + '/' + file.destination, filePath, function() {
            sendFile(res, filePath);
          });
        });
      }
    });
  });

  app.get('/*', function(req, res) {
  	res.sendFile(__dirname + '/client/index.html');
  });

  app.listen(process.env.PORT || 3000, function() {
    console.log('Listening on port ' + (process.env.PORT || 3000));
  });

  return app;
}

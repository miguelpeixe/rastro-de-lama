var express = require('express');
var expressLess = require('express-less');
var fs = require('fs');

var mime = require('mime');

var mmm = require('mmmagic');
var Magic = mmm.Magic;
var magic = new Magic(mmm.MAGIC_MIME_TYPE);

module.exports = function(config, dbRef, bot) {

  var app = express();

  app.use('/', express.static(__dirname + '/public'));

  app.use('/assets', express.static(__dirname + '/bower_components'));

  app.use('/styles', expressLess(__dirname + '/less', {compress: true}));

  var fileDir = 'files';

  function sendFile(res, path, ext) {

    magic.detectFile(path, function(err, result) {

      var type = '';

      if(!err)
        type = result;
      else
        type = mime.lookup(ext || path);

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

    });

  }

  app.get('/file/:fileId', function(req, res) {

    var id = req.params.fileId;
    var ext = '';

    if(req.params.fileId.indexOf('.') !== -1) {
      ext = id.slice(id.length-3);
      id = id.slice(0, -4);
    }

    var filePath = __dirname + '/' + fileDir + '/' + id;

    fs.readFile(filePath, function(err, file) {
      if(!err) {
        sendFile(res, filePath, ext);
      } else {
        bot.getFile({
          file_id: id,
          dir: './' + fileDir
        }).then(function(file) {
          fs.rename(__dirname + '/' + file.destination, filePath, function() {
            sendFile(res, filePath, ext);
          });
        });
      }
    });
  });

  app.get('/*', function(req, res) {
  	res.sendFile(__dirname + '/public/index.html');
  });

  app.listen(process.env.PORT || 3000, function() {
    console.log('Listening on port ' + (process.env.PORT || 3000));
  });

  return app;
}

var express = require('express');
var expressLess = require('express-less');
var assets = require('connect-assets');
var request = require('request');
var Q = require('q');
var fs = require('fs');
var cloudinary = require('cloudinary').v2;

var mime = require('mime');
var mmm = require('mmmagic');
var Magic = mmm.Magic;
var magic = new Magic(mmm.MAGIC_MIME_TYPE);

module.exports = function(config, fileRef, bot) {

  if(config.fileStore == 'cloudinary' && config.cloudinary) {
    cloudinary.config(config.cloudinary);
  }

  var app = express();

  app.engine('html', require('ejs').renderFile);

  app.use('/', express.static(__dirname + '/public'));

  // app.use('/assets', express.static(__dirname + '/bower_components'));

  app.use('/styles', expressLess(__dirname + '/less', {compress: true}));

  app.set('view engine', 'ejs');

  app.use(assets({
    paths: [
      'public/js',
      'bower_components'
    ],
    build: true,
    compress: true,
    gzip: true,
    sourceMaps: false
  }));

  var fileDir = 'files';

  function sendFile(res, path, ext) {
    magic.detectFile(path, function(err, result) {
      var type = '';
      if(!err)
        type = result;
      else
        type = mime.lookup(ext || path);
      var charset = mime.charsets.lookup(type);
      res.contentType(type + (charset ? '; charset=' + charset : ''));
      fs.createReadStream(path).pipe(res);
    });
  }

  var loading = {};

  function storeFile(id, url, filepath, ref, callback) {

    var deferred = Q.defer();

    /*
     * Local storage
     */
    if(config.fileStore == 'local') {
      var destination = fs.createWriteStream(filepath);
      request(url)
        .pipe(destination)
        .on('finish', function() {
          magic.detectFile(filepath, function(err, result) {
            var type = '';
            if(!err)
              type = result;
            else
              type = mime.lookup(ext || path);
            var charset = mime.charsets.lookup(type);
            var file = {
              id: id,
              url: '/download/' + id,
              store: 'local',
              mime: type,
              charset: charset || ''
            };
            ref.set(file);
            deferred.resolve(file);
            delete loading[id];
          });
        });
    /*
     * Cloudinary storage
     */
    } else if(config.fileStore == 'cloudinary' && config.cloudinary) {
      cloudinary.uploader.upload(url, {
        "resource_type": "auto"
      }, function(err, res) {
        if(err) {
          deferred.reject(err);
        } else {
          var file = {
            id: id,
            url: res.url,
            store: 'cloudinary',
            store_id: res.public_id,
            mime: res.resource_type + '/' + res.format
          }
          ref.set(file);
          deferred.resolve(file);
        }
        delete loading[id];
      });
    } else {
      deferred.reject({err: 'File storage configuration is missing or broken.'});
    }

    var promise = deferred.promise.nodeify(callback);

    loading[id] = promise;

    return promise;

  }

  app.get('/download/:fileId', function(req, res) {

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
      }
    });

  });

  function getFileUrl(req, file) {
    var ua = req.headers['user-agent'];
    if(
      ua.indexOf('Firefox') != -1 &&
      file.store == 'cloudinary' &&
      file.mime.indexOf('video') != -1
    ) {
      return cloudinary.url('dv7h71kmagjqagu8cre2.webm', {video_codec: 'vp8', resource_type: 'video'});
    } else {
      return file.url;
    }
  }

  app.get('/file/:fileId', function(req, res) {

    var id = req.params.fileId;
    var ext = '';

    if(req.params.fileId.indexOf('.') !== -1) {
      ext = id.slice(id.length-3);
      id = id.slice(0, -4);
    }

    var filePath = __dirname + '/' + fileDir + '/' + id;

    var ref = fileRef.child(id);

    ref.once('value', function(snapshot) {
      // Catch storing file
      if(loading[id]) {
        loading[id].then(function(file) {
          res.redirect(301, getFileUrl(req, file));
        }, function(err) {
          res.status(err.http_code).send(err.message);
        });
      // File already stored
      } else if(snapshot.exists()) {
        res.redirect(301, getFileUrl(req, snapshot.val()));
      // File not stored, store file and return url
      } else {
        bot.getFile({
          file_id: id
        }).then(function(file) {
          storeFile(id, file.url, filePath, ref).then(function(file) {
            res.redirect(301, file.url);
          }, function(err) {
            res.status(err.http_code).send(err.message);
          });
        });
      }
    });
  });

  app.get('/*', function(req, res) {
  	res.render(__dirname + '/public/index', {fbDatabase: config.fbDatabase});
  });

  app.listen(process.env.PORT || 3000, function() {
    console.log('Listening on port ' + (process.env.PORT || 3000));
  });

  return app;
}

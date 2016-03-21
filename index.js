var config = require('./config');
var Firebase = require('firebase');

var bot = require('./bot');
var server = require('./server');

var fbRef = new Firebase(config.fbDatabase);

fbRef.authWithCustomToken(config.fbToken, function() {

  server(
    config,
    fbRef.child('files'),
    bot(config, fbRef.child('messages'))
  );

});

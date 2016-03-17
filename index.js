var config = require('./config');
var Firebase = require('firebase');

var bot = require('./bot');
var server = require('./server');

var dbRef = new Firebase(config.fbDatabase);

dbRef.authWithCustomToken(config.fbToken, function() {

  server(
    config,
    dbRef,
    bot(config, dbRef)
  );

});

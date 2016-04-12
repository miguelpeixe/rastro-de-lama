var config = require('./config');
var Firebase = require('firebase');

var bot = require('./bot');
var server = require('./server');

var fbRef = new Firebase(config.fbDatabase);

fbRef.authWithCustomToken(config.fbToken, function() {

  // Force set reverse date on all data
  // fbRef.child('messages').on('child_added', function(snapshot, key) {
  //   snapshot.ref().child('reverse_date').set(-snapshot.val().date);
  // });
  // fbRef.child('public_messages').on('child_added', function(snapshot, key) {
  //   snapshot.ref().child('reverse_date').set(-snapshot.val().date);
  // });

  server(
    config,
    fbRef.child('messages'),
    fbRef.child('files'),
    bot(config, fbRef.child('messages'))
  );

});

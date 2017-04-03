var fs = require('fs');

var env = process.env;
var config = {
  "fbDatabase": env.FB_DATABASE,
  "fbToken": env.FB_TOKEN,
  "botToken": env.BOT_TOKEN,
  "groupId": env.GROUP_ID,
  "fileStore": env.FILE_STORE,
  "cloudinary": {
    "cloud_name": env.CLOUDINARY_CLOUD_NAME,
    "api_key": env.CLOUDINARY_API_KEY,
    "api_secret": env.CLOUDINARY_API_SECRET
  }
};
if(!config.fbDatabase && fs.existsSync('./config.json')) {
  config = require('./config');
}
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

var Bot = require('node-telegram-bot');
var Firebase = require('firebase');
var config = require('./config');

module.exports = function() {

  var dbRef = new Firebase(config.fbDatabase);

  var bot = new Bot({
    token: config.botToken
  });

  dbRef.authWithCustomToken(config.fbToken, function() {
    bot.on('message', function(message) {
      if(config.groupId) {
        if(message.chat.id == config.groupId) {
          dbRef.push(message);
        }
      } else {
        dbRef.push(message);
      }
    });
  });

  bot.start();

  return bot;

}

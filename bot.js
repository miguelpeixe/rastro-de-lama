var Bot = require('node-telegram-bot');

module.exports = function(config, dbRef) {

  var bot = new Bot({
    token: config.botToken
  });

  bot.on('message', function(message) {
    if(config.groupId) {
      if(message.chat.id == config.groupId) {
        dbRef.push(message);
      }
    } else {
      dbRef.push(message);
    }
  });

  bot.start();

  return bot;

}

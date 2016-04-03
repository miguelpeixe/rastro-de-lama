var Bot = require('node-telegram-bot');

module.exports = function(config, msgRef) {

  var bot = new Bot({
    token: config.botToken
  });

  bot.on('message', function(message) {
    if(
      !message.new_chat_participant &&
      !message.sticker
    ) {
      if(config.groupId) {
        if(message.chat.id == config.groupId) {
          msgRef.child(message.message_id).set(message);
        }
      } else {
        msgRef.child(message.message_id).set(message);
      }
    }
  });

  bot.start();

  return bot;

}

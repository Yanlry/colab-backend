const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [String],
  lastMessage: String,
});

const messageSchema = new mongoose.Schema({
  text: String,
  senderToken: String,
  recipientToken: String,
  date: { type: Date, default: Date.now },
  conversation: conversationSchema,
});

const Message = mongoose.model('Message', messageSchema);

module.exports = { Message };

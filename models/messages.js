const mongoose = require('mongoose');

const messagesSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  senderToken: {
    type: String,
    required: true
  },
  recipientToken: {
    type: String,
    required: true
  }
}, { timestamps: true });

const Message = mongoose.model('Message', messagesSchema);

module.exports = Message;

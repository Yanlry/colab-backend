const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  text: String,
  senderToken: String,
  recipientToken: String,
  conversationId: String,
  participants: [String],
  lastMessage: String, 
  date: { type: Date, default: Date.now },
});

// Ajouter un index sur 'conversationId' pour améliorer les performances
messageSchema.index({ conversationId: 1 });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;

const mongoose = require('mongoose');

const propositionCollabSchema = mongoose.Schema({
  annonce: { type: mongoose.Schema.Types.ObjectId, ref: 'annonces' },
  initiateur: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  cible: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  statut: String,
  conversationId: { type: String, unique: true }
});

const PropositionCollab = mongoose.model('propositioncollabs', propositionCollabSchema);

module.exports = PropositionCollab;
















const mongoose = require('mongoose');

const annoncesSchema = mongoose.Schema({
  type: String,
  title: String,
  ville: String,
  description: String,
  secteurActivite: [{ type: mongoose.Schema.Types.ObjectId, ref: 'activites' }],
  disponibilite: [String],
  tempsMax: String,
  experience: String,
  token: String,
  username: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  date: Date,
  latitude: Number, 
  longitude: Number 

})

const Annonce = mongoose.model('annonces', annoncesSchema);

module.exports = Annonce 

const mongoose = require('mongoose');
const uid2 = require('uid2');

const activitesSchema = mongoose.Schema({
  activite: String,
});

const Activite = mongoose.model('activites', activitesSchema);

module.exports = Activite;

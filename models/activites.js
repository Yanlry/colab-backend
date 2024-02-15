const mongoose = require('mongoose');

const activitesSchema = mongoose.Schema({
  activite: String,
});

const Activite = mongoose.model('activites', activitesSchema);

module.exports = Activite;

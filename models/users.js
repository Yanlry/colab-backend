const mongoose = require('mongoose');

const usersSchema = mongoose.Schema({
  username: String,
  password: String,
  email: String,
  phone: String,
  token: String,
  inscriptionDate: Date,
  bio: String,
  experience: String,


  jePeux: [{ type: mongoose.Schema.Types.ObjectId, ref: 'activites' }],
  jeVeux: [{ type: mongoose.Schema.Types.ObjectId, ref: 'activites' }],
});


const User = mongoose.model('users', usersSchema);

module.exports = User;



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

  teach: [{ type: mongoose.Schema.Types.ObjectId, ref: 'activites' }],
  learn: [{ type: mongoose.Schema.Types.ObjectId, ref: 'activites' }],
});


const User = mongoose.model('users', usersSchema);

module.exports = User;



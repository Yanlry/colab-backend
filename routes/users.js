var express = require('express');
var router = express.Router();

const User = require('../models/users');
const { checkBody } = require("../modules/checkBody");

const bcrypt = require('bcrypt');
const uid2 = require('uid2');





// Expression régulière pour valider l'e-mail
const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const phoneRegex = /^[0-9]{10}$/;

//Route qui gère l'inscription
router.post('/signup', (req, res) => {

  if (!checkBody(req.body, ["username", "password", "email", "sexe", "phone"])) {
    res.json({ result: false, error: "Champs manquants ou vides" });
    return;
  }
  if (!emailRegex.test(req.body.email)) {
    res.json({ result: false, error: "Format d'e-mail invalide" });
    return;
  }
  if (!phoneRegex.test(req.body.phone)) {
    res.json({ result: false, error: "Numéro de téléphone au mauvais format" });
    return;
  }
  User.findOne({ email: req.body.email })
    .then(data => {
      if (data !== null) {
        res.json({ result: false, error: "Un compte avec cet e-mail existe déjà" });
      } else {
        User.findOne({ username: req.body.username })
          .then(data => {
            if (data !== null) {
              res.json({ result: false, error: "Nom d'utilisateur déjà pris" });
            } else {
              const hashPassword = bcrypt.hashSync(req.body.password, 10);
              const newUser = new User({
                username: req.body.username,
                email: req.body.email,
                sexe: req.body.sexe,
                password: hashPassword,
                token: uid2(32),
                phone: req.body.phone,
              });
              newUser.save().then(newDoc => {
                res.json({ result: true, token: newDoc.token, username: newDoc.username, sexe: newDoc.sexe, phone: newDoc.phone });
              });
            }
          });
      }
    });
});


// Route qui gère la Connection
router.post('/signin', (req, res) => {

  if (!checkBody(req.body, ["email", "password"])) {
    res.json({ result: false, error: 'Champs manquants ou vides' })
    return;
  }
  User.findOne({ email: req.body.email }).then(data => {
    if (data && bcrypt.compareSync(req.body.password, data.password)) {
      res.json({ result: true, token: data.token, username: data.username });
    } else {
      res.json({ result: false, error: 'Utilisateur introuvable ou mot de passe incorrect' });
    }
  })
})


module.exports = router;

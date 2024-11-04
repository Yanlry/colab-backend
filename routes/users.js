var express = require("express");
var router = express.Router();

const User = require("../models/users");
const { checkBody } = require("../modules/checkBody");

const bcrypt = require("bcrypt");
const uid2 = require("uid2");

const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const phoneRegex = /^[0-9]{10}$/;

router.get("/profile/:token", (req, res) => {
  const { token } = req.params;

  User.findOne({ token })
    .then((user) => {
      if (!user) {
        res.json({ result: false, error: "Utilisateur non trouvé" });
      } else {
        res.json({
          result: true,
          profile: {
            username: user.username,
            phone: user.phone,
            bio: user.bio || "",
          },
        });
      }
    })
    .catch((error) => {
      console.error("Erreur lors de la récupération du profil:", error);
      res.json({
        result: false,
        error: "Erreur lors de la récupération du profil",
      });
    });
});

router.post("/signup", (req, res) => {
  if (!checkBody(req.body, ["username", "password", "email", "phone"])) {
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
  User.findOne({ email: req.body.email }).then((data) => {
    if (data !== null) {
      res.json({
        result: false,
        error: "Un compte avec cet e-mail existe déjà",
      });
    } else {
      User.findOne({ username: req.body.username }).then((data) => {
        if (data !== null) {
          res.json({ result: false, error: "Nom d'utilisateur déjà pris" });
        } else {
          const hashPassword = bcrypt.hashSync(req.body.password, 10);
          const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashPassword,
            token: uid2(32),
            phone: req.body.phone,
          });
          newUser.save().then((newDoc) => {
            res.json({
              result: true,
              token: newDoc.token,
              username: newDoc.username,
              phone: newDoc.phone,
            });
          });
        }
      });
    }
  });
});

router.post("/signin", (req, res) => {
  if (!checkBody(req.body, ["email", "password"])) {
    res.json({ result: false, error: "Champs manquants ou vides" });
    return;
  }
  User.findOne({ email: req.body.email }).then((data) => {
    if (data && bcrypt.compareSync(req.body.password, data.password)) {
      res.json({ result: true, token: data.token, username: data.username });
    } else {
      res.json({
        result: false,
        error: "Utilisateur introuvable ou mot de passe incorrect",
      });
    }
  });
});

router.put("/updateProfile", (req, res) => {
  const { token, username, phone, bio } = req.body;

  if (!checkBody(req.body, ["token", "username", "phone"])) {
    res.json({ result: false, error: "Champs manquants ou vides" });
    return;
  }

  if (!phoneRegex.test(phone)) {
    res.json({ result: false, error: "Numéro de téléphone au mauvais format" });
    return;
  }

  User.findOne({ token })
    .then((user) => {
      if (!user) {
        res.json({ result: false, error: "Utilisateur non trouvé" });
        return;
      }

      User.findOne({ username })
        .then((existingUser) => {
          if (existingUser && existingUser.token !== token) {
            res.json({ result: false, error: "Nom d'utilisateur déjà pris" });
          } else {
            user.username = username;
            user.phone = phone;
            user.bio = bio || user.bio;

            user
              .save()
              .then(() => {
                res.json({
                  result: true,
                  message: "Profil mis à jour avec succès",
                });
              })
              .catch((error) => {
                console.error(error);
                res.json({
                  result: false,
                  error: "Erreur lors de la mise à jour du profil",
                });
              });
          }
        })
        .catch((error) => {
          console.error(error);
          res.json({
            result: false,
            error: "Erreur lors de la vérification du nom d'utilisateur",
          });
        });
    })
    .catch((error) => {
      console.error(error);
      res.json({
        result: false,
        error: "Erreur lors de la recherche de l'utilisateur",
      });
    });
});

router.delete("/deleteProfile/:token", (req, res) => {
  const { token } = req.params;

  console.log(`Suppression du profil pour le token: ${token}`);

  User.findOneAndDelete({ token })
    .then((user) => {
      if (!user) {
        console.log("Utilisateur non trouvé");
        res.json({ result: false, error: "Utilisateur non trouvé" });
      } else {
        console.log("Utilisateur supprimé:", user);
        res.json({ result: true, message: "Profil supprimé avec succès" });
      }
    })
    .catch((error) => {
      console.error("Erreur lors de la suppression du profil:", error);
      res
        .status(500)
        .json({
          result: false,
          error: "Erreur lors de la suppression du profil",
        });
    });
});

module.exports = router;

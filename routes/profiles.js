var express = require("express");
var router = express.Router();

const Activite = require("../models/activites");
const User = require("../models/users");
const Annonce = require("../models/annonces");

router.get("/activites", (req, res) => {
  Activite.find()
    .lean()
    .select("activite")
    .then((activites) => {
      const activiteValues = activites.map((activite) => activite.activite);
      const responseObject = { activites: activiteValues };
      res.json(responseObject);
    });
});

router.get("/activites/:token", (req, res) => {
  User.findOne({ token: req.params.token })
    .populate("teach")
    .populate("learn")
    .then((user) => {
      if (!user) {
        return res
          .status(404)
          .json({ result: false, error: "Utilisateur introuvable" });
      }

      const selectedTeachActivities = user.teach.map(
        (activite) => activite.activite
      );
      const selectedLearnActivities = user.learn.map(
        (activite) => activite.activite
      );

      res.status(200).json({
        result: true,
        teach: selectedTeachActivities,
        learn: selectedLearnActivities,
      });
    })
    .catch((error) => {
      res.status(500).json({ result: false, error: error.message });
    });
});

router.post("/bio", (req, res) => {
  const token = req.body.token;
  const contenuBio = req.body.bio;
  User.findOneAndUpdate(
    { token: token },
    { bio: contenuBio },
    { new: true }
  ).then((data) => {
    if (!data) {
      return res.json({ erreur: "Utilisateur introuvable" });
    }
    return res.json({ message: "Bio mis à jour avec succès", bio: data.bio });
  });
});

router.post("/learn", (req, res) => {
  const token = req.body.token;

  User.findOne({ token })
    .then((user) => {
      if (!user) {
        return res.json({ result: false, error: "User not found" });
      }
      const activites = req.body.activites;
      const newActiviteIds = [];
      const promises = activites.map((activiteName) => {
        return Activite.findOne({ activite: activiteName }).then((activite) => {
          if (activite) {
            newActiviteIds.push(activite._id);
          }
        });
      });
      return Promise.all(promises)
        .then(() => {
          user.learn = newActiviteIds;
          return user.save();
        })
        .then(() => {
          return User.populate(user, { path: "learn", select: "activite" });
        })
        .then((data) => {
          const activites = data.learn.map((item) => item.activite);
          res.json({ result: true, user: activites });
        })
        .catch((error) => {
          res.json({ result: false, error: error.message });
        });
    })
    .catch((error) => {
      res.json({ result: false, error: error.message });
    });
});

router.post("/teach", (req, res) => {
  const token = req.body.token;
  User.findOne({ token }).then((user) => {
    if (!user) {
      return res.json({ result: false, error: "User not found" });
    }
    const activites = req.body.activites;
    const newActiviteIds = [];
    const promises = activites.map((activiteName) => {
      return Activite.findOne({ activite: activiteName }).then((activite) => {
        if (activite) {
          newActiviteIds.push(activite._id);
        }
      });
    });
    return Promise.all(promises)
      .then(() => {
        user.teach = newActiviteIds;
        return user.save();
      })
      .then(() => {
        return User.populate(user, { path: "teach", select: "activite" });
      })
      .then((data) => {
        const activites = data.teach.map((item) => item.activite);
        res.json({ result: true, user: activites });
      });
  });
});

router.post("/newActivite", (req, res) => {
  const { activite } = req.body;
  if (!activite) {
    return res.json({ result: false, error: "Le champ activite est requis" });
  }
  const nouvelleActivite = new Activite({ activite });
  nouvelleActivite.save().then((activiteEnregistree) => {
    res.json({ result: true, activite: activiteEnregistree });
  });
});

router.put("/learn", (req, res) => {
  const token = req.body.token;

  User.findOne({ token })
    .then((user) => {
      if (!user) {
        return res.json({ result: false, error: "User not found" });
      }
      const activites = req.body.activites;
      const newActiviteIds = [];
      const promises = activites.map((activiteName) => {
        return Activite.findOne({ activite: activiteName }).then((activite) => {
          if (activite) {
            newActiviteIds.push(activite._id);
          }
        });
      });
      return Promise.all(promises)
        .then(() => {
          user.learn = newActiviteIds;
          return user.save();
        })
        .then(() => {
          return User.populate(user, { path: "learn", select: "activite" });
        })
        .then((data) => {
          const activites = data.learn.map((item) => item.activite);
          res.json({ result: true, user: activites });
        })
        .catch((error) => {
          res.json({ result: false, error: error.message });
        });
    })
    .catch((error) => {
      res.json({ result: false, error: error.message });
    });
});

router.put("/teach", (req, res) => {
  const token = req.body.token;

  User.findOne({ token })
    .then((user) => {
      if (!user) {
        return res.json({ result: false, error: "User not found" });
      }
      const activites = req.body.activites;
      const newActiviteIds = [];
      const promises = activites.map((activiteName) => {
        return Activite.findOne({ activite: activiteName }).then((activite) => {
          if (activite) {
            newActiviteIds.push(activite._id);
          }
        });
      });
      return Promise.all(promises)
        .then(() => {
          user.teach = newActiviteIds;
          return user.save();
        })
        .then(() => {
          return User.populate(user, { path: "teach", select: "activite" });
        })
        .then((data) => {
          const activites = data.teach.map((item) => item.activite);
          res.json({ result: true, user: activites });
        })
        .catch((error) => {
          res.json({ result: false, error: error.message });
        });
    })
    .catch((error) => {
      res.json({ result: false, error: error.message });
    });
});

router.get("/users/:username", (req, res) => {
  const { username } = req.params;

  User.findOne({ username })
    .populate("teach", "activite")
    .populate("learn", "activite")
    .then((user) => {
      if (!user) {
        return res.json({ result: false, error: "Utilisateur non trouvé" });
      }

      Annonce.find({ username: user._id })
        .populate("secteurActivite", "activite")
        .then((annonces) => {
          const userData = {
            username: user.username,
            email: user.email,
            phone: user.phone,
            token: user.token,
            bio: user.bio,
            teach: user.teach.map((activity) => activity.activite),
            learn: user.learn.map((activity) => activity.activite),
            annonces: annonces.map((annonce) => ({
              id: annonce._id,
              type: annonce.type,
              title: annonce.title,
              description: annonce.description,
              programme: annonce.programme,
              image: annonce.image,
              secteurActivite: annonce.secteurActivite.map(
                (activite) => activite.activite
              ),
              mode: annonce.mode,
              disponibilite: annonce.disponibilite,
              tempsMax: annonce.tempsMax,
              experience: annonce.experience,
              date: annonce.date,
              token: annonce.token,
              latitude: annonce.latitude,
              longitude: annonce.longitude,
            })),
          };

          res.json({ result: true, user: userData });
        })
        .catch((error) => {
          console.error("Erreur lors de la récupération des annonces:", error);
          res.json({
            result: false,
            error: "Erreur lors de la récupération des annonces",
          });
        });
    })
    .catch((error) => {
      console.error("Erreur lors de la recherche de l'utilisateur:", error);
      res.json({
        result: false,
        error: "Erreur lors de la recherche de l'utilisateur",
      });
    });
});

module.exports = router;

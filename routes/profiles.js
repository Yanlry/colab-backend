var express = require('express');
var router = express.Router();

const Activite = require('../models/activites')
const User = require('../models/users')


router.post('/learn', (req, res) => {
    const token = req.body.token;

    User.findOne({ token })
        .then(user => {
            if (!user) {
                return res.json({ result: false, error: 'User not found' });
            }
            const activites = req.body.activites;
            const newActiviteIds = [];
            const promises = activites.map(activiteName => {
                return Activite.findOne({ activite: activiteName })
                    .then(activite => {
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
                    return User.populate(user, { path: 'learn', select: 'activite' });
                })
                .then(data => {
                    const activites = data.learn.map(item => item.activite);
                    res.json({ result: true, user: activites });
                })
                .catch(error => {
                    res.json({ result: false, error: error.message });
                });
        })
        .catch(error => {
            res.json({ result: false, error: error.message });
        });
});


router.post('/teach', (req, res) => {
    const token = req.body.token;
    User.findOne({ token })
        .then(user => {
            if (!user) {
                return res.json({ result: false, error: 'User not found' });
            }
            const activites = req.body.activites;
            const newActiviteIds = [];
            const promises = activites.map(activiteName => {
                return Activite.findOne({ activite: activiteName })
                    .then(activite => {
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
                    return User.populate(user, { path: 'teach', select: 'activite' });
                })
                .then(data => {
                    const activites = data.teach.map(item => item.activite);
                    res.json({ result: true, user: activites });
                })
        })

});

router.post('/bio', (req, res) => {
    const token = req.body.token;
    const contenuBio = req.body.bio;
    User.findOneAndUpdate({ token: token }, { bio: contenuBio }, { new: true })
        .then(data => {
            if (!data) {
                return res.json({ erreur: "Utilisateur introuvable" });
            }
            return res.json({ message: "Bio mis à jour avec succès", bio: data.bio });
        })
});

router.get('/activites', (req, res) => {
    Activite.find().lean().select('activite')
        .then(activites => {
            const activiteValues = activites.map(activite => activite.activite);
            const responseObject = { activites: activiteValues };
            res.json(responseObject);
        })
});

router.post('/newActivite', (req, res) => {
    const { activite } = req.body;
    if (!activite) {
        return res.json({ result: false, error: 'Le champ activite est requis' });
    }
    const nouvelleActivite = new Activite({ activite });
    nouvelleActivite.save()
        .then(activiteEnregistree => {
            res.json({ result: true, activite: activiteEnregistree});
        })
});


module.exports = router;
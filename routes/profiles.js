var express = require('express');
var router = express.Router();

const Activite = require('../models/activites')
const User = require('../models/users')


router.post('/jeVeux', (req, res) => {
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
                    user.jeVeux = newActiviteIds;
                    return user.save();
                })
                .then(() => {
                    return User.populate(user, { path: 'jeVeux', select: 'activite' });
                })
                .then(data => {
                    const activites = data.jeVeux.map(item => item.activite);
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


router.post('/jePeux', (req, res) => {
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
                    user.jePeux = newActiviteIds;
                    return user.save();
                })
                .then(() => {
                    return User.populate(user, { path: 'jePeux', select: 'activite' });
                })
                .then(data => {
                    const activites = data.jePeux.map(item => item.activite);
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




module.exports = router;












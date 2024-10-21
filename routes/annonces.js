var express = require('express');
var router = express.Router();

const User = require('../models/users');
const Annonce = require('../models/annonces');
const Activite = require('../models/activites');
const { checkBody } = require('../modules/checkBody');
const uid2 = require('uid2');


// ROUTE GET : Affiche toutes les annonces de type Offre et filtre en fonction des demandes de l'utilisateur
router.get('/enseigner/:token', (req, res) => {
    User.findOne({ token: req.params.token })
        .then(user => {
            if (!user) {
                return res.json({ result: false, error: 'Utilisateur introuvable' });
            }
            Annonce.find({
                type: 'Enseigner',
                username: { $ne: user._id }, 
                secteurActivite: { $in: user.learn } 
            })
                .populate({ path: 'secteurActivite', select: 'activite' })
                .populate('username', 'username') 
                .then(annonces => {
                    const formattedAnnonces = annonces.map(annonce => ({
                        type: annonce.type,
                        title: annonce.title,
                        description: annonce.description,
                        image: annonce.image,
                        secteurActivite: annonce.secteurActivite.map(activite => activite.activite),
                        disponibilite: annonce.disponibilite,
                        tempsMax: annonce.tempsMax,
                        experience: annonce.experience,
                        username: annonce.username.username,
                        date: annonce.date,
                        token: annonce.token,
                        latitude: annonce.latitude, 
                        longitude: annonce.longitude 
                    }));
                    res.json({ result: true, annonces: formattedAnnonces });
                })
                .catch(error => {
                    res.json({ result: false, error: error.message });
                });
        })
        .catch(error => {
            res.json({ result: false, error: error.message });
        });
});



// ROUTE GET : Affiche toutes les annonces de type Demande et filtre en fonction des demandes de l'utilisateur
router.get('/apprendre/:token', (req, res) => {
    User.findOne({ token: req.params.token })
        .then(user => {
            if (!user) {
                return res.json({ result: false, error: 'Utilisateur introuvable' });
            }

            Annonce.find({
                type: 'Apprendre',
                username: { $ne: user._id }, 
                secteurActivite: { $in: user.teach } 
            })
                .populate({ path: 'secteurActivite', select: 'activite' })
                .populate('username', 'username') 
                .then(annonces => {
                    const formattedAnnonces = annonces.map(annonce => ({
                        type: annonce.type,
                        title: annonce.title,
                        description: annonce.description,
                        image: annonce.image,
                        secteurActivite: annonce.secteurActivite.map(activite => activite.activite),
                        disponibilite: annonce.disponibilite,
                        tempsMax: annonce.tempsMax,
                        experience: annonce.experience,
                        username: annonce.username.username,
                        date: annonce.date,
                        token: annonce.token,
                        latitude: annonce.latitude, 
                        longitude: annonce.longitude 
                    }));
                    res.json({ result: true, annonces: formattedAnnonces });
                })
                .catch(error => {
                    res.json({ result: false, error: error.message });
                });
        })
        .catch(error => {
            res.json({ result: false, error: error.message });
        });
});


// ROUTE GET : Permet d'afficher toutes les annonces enregistrer en base données qui sont associer au token
router.get('/mesAnnonces/:token', (req, res) => {
    User.findOne({ token: req.params.token })
        .then(user => {
            if (!user) {
                res.json({ result: false, error: 'Utilisateur introuvable' });
                return;
            }
            Annonce.find({ username: user._id })
                .populate('secteurActivite')
                .lean()
                .then(data => {
                    for (const annonce of data) {
                        annonce.secteurActivite = annonce.secteurActivite.map(activite => activite.activite)
                        annonce.username = user.username
                    }
                    res.json({ result: true, annonces: data });
                })
        });
})

router.post('/publier/:token', (req, res) => {
    User.findOne({ token: req.params.token })
        .then(user => {
            if (!user) {
                res.json({ result: false, error: 'Utilisateur introuvable' });
                return;
            }

            const activites = req.body.secteurActivite;
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
                    const { type, title, description, tempsMax, experience, disponibilite, ville, latitude, longitude } = req.body;

                    const newAnnonce = new Annonce({
                        username: user._id,
                        token: uid2(32),
                        type: type,
                        title: title,
                        ville: ville,
                        description: description,
                        tempsMax: tempsMax,
                        experience: experience,
                        disponibilite: disponibilite, // Ce champ est maintenant un tableau
                        secteurActivite: newActiviteIds,
                        date: new Date(),
                        latitude: latitude, // Enregistrer la latitude
                        longitude: longitude // Enregistrer la longitude
                    });

                    return newAnnonce.save()
                        .then(newDoc => {
                            res.json({ result: true, annonce: newDoc });
                        })
                        .catch(error => {
                            res.json({ result: false, error: error.message });
                        });
                })
                .catch(error => {
                    res.json({ result: false, error: error.message });
                });
        });
});


// ROUTE DELETE : Permet de supprimer une annonces de l'utilisateur de la DB
router.delete('/supprime/:token', (req, res) => {
    if (!checkBody(req.body, ['annonceId'])) {
        res.json({ result: false, error: 'Champs vides ou manquants' });
        return;
    }
    User.findOne({ token: req.params.token })
        .then(user => {
            if (user === null) {
                res.json({ result: false, error: 'Utilisateur introuvable' });
                return;
            }
            Annonce.findById(req.body.annonceId)
                .then(annonce => {
                    if (!annonce) {
                        res.json({ result: false, error: 'Annonce introuvable' });
                        return;
                    }
                    if (!annonce.username.equals(user._id)) {
                        res.json({ result: false, error: 'Cette annonce ne peux pas etre supprimé par vous' });
                        return;
                    }
                    Annonce.deleteOne({ _id: req.body.annonceId })
                        .then(() => {
                            res.json({ result: true, message: 'Votre annonce a été supprimé' });
                        });
                })
        })
})

module.exports = router;





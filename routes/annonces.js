var express = require('express');
var router = express.Router();

const User = require('../models/users');
const Annonce = require('../models/annonces');
const Activite = require('../models/activites');
const { checkBody } = require('../modules/checkBody');
const uid2 = require('uid2');


// ROUTE GET : Affiche toutes les annonces de type "Apprendre" pour l'utilisateur, filtrées par secteur d'activité
router.get('/enseigner/:token', (req, res) => {
    const { token } = req.params;

    // Recherche de l'utilisateur par token
    User.findOne({ token })
        .then(user => {
            if (!user) {
                return res.json({ result: false, error: 'Utilisateur introuvable' });
            }

            // Affiche les secteurs d'activité de l'utilisateur pour le débogage
            console.log('Secteurs enseignés par l\'utilisateur:', user.teach);

            // Recherche des annonces de type "Apprendre" qui ne sont pas de cet utilisateur et correspondent aux secteurs d'activité
            Annonce.find({
                type: 'Enseigner',
                username: { $ne: user._id }, // Vérifie que l'annonce n'appartient pas à l'utilisateur
                secteurActivite: { $in: user.teach } // Filtre par secteurs d'activité
            })
                .populate({ path: 'secteurActivite', select: 'activite' }) // Récupère les noms des activités
                .populate('username', 'username') // Récupère le nom d'utilisateur
                .then(annonces => {
                    console.log('Annonces trouvées pour l\'utilisateur:', annonces);

                    // Formate les annonces pour l'envoi au frontend
                    const formattedAnnonces = annonces.map(annonce => ({
                        id: annonce._id,
                        type: annonce.type,
                        title: annonce.title,
                        description: annonce.description,
                        image: annonce.image,
                        secteurActivite: annonce.secteurActivite.map(activite => activite.activite),
                        disponibilite: annonce.disponibilite,
                        tempsMax: annonce.tempsMax,
                        experience: annonce.experience,
                        username: annonce.username?.username, // Utilise ?. pour éviter une erreur si username est null
                        date: annonce.date,
                        token: annonce.token,
                        latitude: annonce.latitude,
                        longitude: annonce.longitude
                    }));

                    res.json({ result: true, annonces: formattedAnnonces });
                })
                .catch(error => {
                    console.error('Erreur lors de la recherche des annonces:', error.message);
                    res.json({ result: false, error: error.message });
                });
        })
        .catch(error => {
            console.error('Erreur lors de la recherche de l\'utilisateur:', error.message);
            res.json({ result: false, error: error.message });
        });
});



// ROUTE GET : Affiche toutes les annonces de type "Apprendre" pour l'utilisateur, filtrées par secteur d'activité
router.get('/apprendre/:token', (req, res) => {
    const { token } = req.params;

    // Recherche de l'utilisateur par token
    User.findOne({ token })
        .then(user => {
            if (!user) {
                return res.json({ result: false, error: 'Utilisateur introuvable' });
            }

            // Affiche les secteurs d'activité de l'utilisateur pour le débogage
            console.log('Secteurs enseignés par l\'utilisateur:', user.teach);

            // Recherche des annonces de type "Apprendre" qui ne sont pas de cet utilisateur et correspondent aux secteurs d'activité
            Annonce.find({
                type: 'Apprendre',
                username: { $ne: user._id }, // Vérifie que l'annonce n'appartient pas à l'utilisateur
                secteurActivite: { $in: user.teach } // Filtre par secteurs d'activité
            })
                .populate({ path: 'secteurActivite', select: 'activite' }) // Récupère les noms des activités
                .populate('username', 'username') // Récupère le nom d'utilisateur
                .then(annonces => {
                    console.log('Annonces trouvées pour l\'utilisateur:', annonces);

                    // Formate les annonces pour l'envoi au frontend
                    const formattedAnnonces = annonces.map(annonce => ({
                        id: annonce._id,
                        type: annonce.type,
                        title: annonce.title,
                        description: annonce.description,
                        image: annonce.image,
                        secteurActivite: annonce.secteurActivite.map(activite => activite.activite),
                        disponibilite: annonce.disponibilite,
                        tempsMax: annonce.tempsMax,
                        experience: annonce.experience,
                        username: annonce.username?.username, // Utilise ?. pour éviter une erreur si username est null
                        date: annonce.date,
                        token: annonce.token,
                        latitude: annonce.latitude,
                        longitude: annonce.longitude
                    }));

                    res.json({ result: true, annonces: formattedAnnonces });
                })
                .catch(error => {
                    console.error('Erreur lors de la recherche des annonces:', error.message);
                    res.json({ result: false, error: error.message });
                });
        })
        .catch(error => {
            console.error('Erreur lors de la recherche de l\'utilisateur:', error.message);
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

router.get('/activites/:token', (req, res) => {
    User.findOne({ token: req.params.token })
        .populate('teach')
        .populate('learn')
        .then(user => {
            if (!user) {
                return res.status(404).json({ result: false, error: 'Utilisateur introuvable' });
            }

            const selectedTeachActivities = user.teach.map(activite => activite.activite);
            const selectedLearnActivities = user.learn.map(activite => activite.activite);

            res.status(200).json({
                result: true,
                teach: selectedTeachActivities,
                learn: selectedLearnActivities
            });
        })
        .catch(error => {
            res.status(500).json({ result: false, error: error.message });
        });
});

router.get('/annonces-localisation', (req, res) => {
    Annonce.find({}, 'title description latitude longitude ville type date secteurActivite token disponibilite tempsMax experience username')
        .populate('username', 'username') // Peuple le champ `username` pour récupérer uniquement `username`
        .populate('secteurActivite', 'activite') // Peuple `secteurActivite` pour récupérer `activite` dans chaque document de `activites`
        .then(annonces => {
            const formattedAnnonces = annonces.map(annonce => ({
                token:annonce.token,
                title: annonce.title,
                description: annonce.description,
                latitude: annonce.latitude,
                longitude: annonce.longitude,
                ville: annonce.ville,
                type: annonce.type,
                date: annonce.date,
                secteurActivite: annonce.secteurActivite.map(activity => activity.activite), // Utilise `activite` pour obtenir les noms des activités
                disponibilite: annonce.disponibilite,
                tempsMax: annonce.tempsMax,
                experience: annonce.experience,
                username: annonce.username ? annonce.username.username : "Utilisateur inconnu"
            }));
            res.json({ result: true, annonces: formattedAnnonces });
        })
        .catch(error => {
            res.json({ result: false, error: error.message });
        });
});


module.exports = router;





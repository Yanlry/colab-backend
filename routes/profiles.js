var express = require('express');
var router = express.Router();

const Activite = require('../models/activites')
const User = require('../models/users')
const Annonce = require('../models/annonces')

router.get('/activites', (req, res) => {
    Activite.find().lean().select('activite')
        .then(activites => {
            const activiteValues = activites.map(activite => activite.activite);
            const responseObject = { activites: activiteValues };
            res.json(responseObject);
        })
});

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

router.put('/learn', (req, res) => {
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
                    // Remplacement des activités "learn" par les nouvelles
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

router.put('/teach', (req, res) => {
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
                    // Remplacement des activités "teach" par les nouvelles
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
                .catch(error => {
                    res.json({ result: false, error: error.message });
                });
        })
        .catch(error => {
            res.json({ result: false, error: error.message });
        });
});

// Route pour récupérer le profil de l'utilisateur via son username
router.get('/user/profile/:username', (req, res) => {
    const { username } = req.params;
    console.log('Recherche de l\'utilisateur avec le nom:', username);

    if (!username) {
        return res.json({ result: false, error: 'Nom d’utilisateur non fourni' });
    }

    // Recherche de l'utilisateur par username
    User.findOne({ username })
        .then(user => {
            if (!user) {
                return res.json({ result: false, error: 'Utilisateur introuvable' });
            }

            // Rechercher une annonce spécifique associée à l'utilisateur, ici la plus récente
            Annonce.find({ user: user._id }).sort({ date: -1 }).limit(1)
                .then(annonces => {
                    if (!annonces || annonces.length === 0) {
                        return res.json({ result: false, error: 'Aucune annonce trouvée pour cet utilisateur' });
                    }

                    const annonce = annonces[0]; // Première annonce dans le tableau

                    // Créer l'objet userData avec les détails de l'annonce trouvée
                    const userData = {
                        username: user.username,
                        phone: user.phone,
                        email: user.email,
                        annonce: {
                            title: annonce.title,
                            description: annonce.description,
                            date: annonce.date,
                            type: annonce.type,
                        },
                    };

                    res.json({ result: true, user: userData });
                })
                .catch(error => {
                    console.error('Erreur lors de la récupération de l\'annonce:', error);
                    res.json({ result: false, error: 'Erreur lors de la récupération de l\'annonce' });
                });
        })
        .catch(error => {
            console.error('Erreur lors de la recherche de l\'utilisateur:', error);
            res.json({ result: false, error: 'Erreur lors de la recherche de l\'utilisateur' });
        });
});




// Route pour récupérer les informations d'un utilisateur spécifique via son username et ses annonces associées
router.get('/users/:username', (req, res) => {
    const { username } = req.params;

    // Recherche de l'utilisateur par username
    User.findOne({ username })
        .then(user => {
            if (!user) {
                return res.json({ result: false, error: 'Utilisateur non trouvé' });
            }

            // Utilisation de l'ID de l'utilisateur pour chercher les annonces associées
            Annonce.find({ username: user._id }) 
                .populate('secteurActivite', 'activite') // `username` ici fait référence à l'ID de l'utilisateur dans les annonces
                .then(annonces => {
                    // Structuration des données utilisateur avec les annonces associées
                    const userData = {
                        username: user.username,
                        email: user.email,
                        phone: user.phone,
                        token: user.token,
                        annonces: annonces.map(annonce => ({
                            title: annonce.title,
                            description: annonce.description,
                            date: annonce.date,
                            experience: annonce.experience,
                            disponibilite: annonce.disponibilite,
                            tempsMax: annonce.tempsMax,
                            secteurActivite: annonce.secteurActivite.map(activite => activite.activite),
                            type: annonce.type,
                        })),
                    };

                    res.json({ result: true, user: userData });
                })
                .catch(error => {
                    console.error('Erreur lors de la récupération des annonces:', error);
                    res.json({ result: false, error: 'Erreur lors de la récupération des annonces' });
                });
        })
        .catch(error => {
            console.error('Erreur lors de la recherche de l\'utilisateur:', error);
            res.json({ result: false, error: 'Erreur lors de la recherche de l\'utilisateur' });
        });
});



  
module.exports = router;


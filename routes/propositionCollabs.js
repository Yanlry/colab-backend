var express = require('express');
var router = express.Router();

const Annonce = require('../models/annonces');
const PropositionCollab = require('../models/propositionCollabs')
const User = require('../models/users');




//route qui va permettre d ajouter proposition de colabs
router.post('/propositions', (req, res) => {
  const { token, cible, initiateur } = req.body;

  User.findOne({ username: cible })
    .then(cible => {
      if (!cible) {
        return res.json({ result: false, error: 'Utilisateur cible non trouvé' });
      }
      User.findOne({ username: initiateur })
        .then(initiateur => {
          if (!initiateur) {
            return res.json({ result: false, error: 'Utilisateur initiateur non trouvé' });
          }
          Annonce.findOne({ token })
            .then(annonce => {
              if (!annonce) {
                return res.json({ result: false, error: 'Annonce non trouvée' });
              }
              PropositionCollab.findOne({ annonce: annonce._id, initiateur: initiateur._id })
                .then(existingProposition => {
                  if (existingProposition) {
                    return res.json({ result: false, message: 'Vous avez déjà fait une demande de collaboration pour cette annonce.' });
                  }
                  const proposition = new PropositionCollab({
                    annonce: annonce._id,
                    cible: cible._id,
                    initiateur: initiateur._id,
                    statut: 'en_attente'
                  });
                  proposition.save()
                    .then(savedProposition => {
                      res.json({ result: true, message: 'La demande de collaboration a été envoyée avec succès.', proposition: savedProposition });
                    })
                })
            })
        })
    })
});


//route qui affiche les offre ainsi que l'état de la proposition de colab 
router.post('/propositions/cible', (req, res) => {
  const { token } = req.body;

  User.findOne({ token })
    .then(user => {
      if (!user) {
        return res.json({ result: false, error: 'Utilisateur non trouvé' });
      }
      PropositionCollab.find({ cible: user._id })
        .populate({
          path: 'annonce',
          select: 'title'
        })
        .populate({
          path: 'initiateur',
          select: 'username phone'
        })
        .select('annonce initiateur statut')
        .then(propositionsCible => {
          const messages = propositionsCible.map(proposition => {
            let message;

            if (!proposition.initiateur) {
              message = `L'initiateur de la proposition n'existe plus en base de données.`;
            } else {
              const username = proposition.initiateur.username;
              const phone = proposition.initiateur.phone;
              let additionalMessage = '';

              if (proposition.statut === 'en_attente') {
                if (proposition.annonce) {
                  additionalMessage = `, annonce en question: ${proposition.annonce.title}`;
                } else {
                  additionalMessage = `, annonce en question: Vous avez supprimé l'annonce`;
                }
              } else if (proposition.statut === 'accepté') {
                additionalMessage = ` a propos de l'annonce: ${proposition.annonce ? proposition.annonce.title : 'Vous avez supprimé l\'annonce'}. Son numéro de téléphone a était ajouté la liste de contact,`;
              } else if (proposition.statut === 'refusé') {
                additionalMessage = `, annonce en question: ${proposition.annonce ? proposition.annonce.title : `, annonce en question: Vous avez supprimé l'annonce`}`;
              }

              if (proposition.statut === 'en_attente') {
                message = `Vous avez reçu une offre de collaboration de: ${username}${additionalMessage}`;
              } else if (proposition.statut === 'accepté') {
                message = `Bravo, vous pouvez maintenant collaborer avec ${username}${additionalMessage}`;
              } else if (proposition.statut === 'refusé') {
                message = `Vous avez refusé la proposition de collaboration de: ${username}${additionalMessage}`;
              }
            }
            return { message };
          });
          res.json({ result: true, isCible: true, messages: messages });
        })
    })
});


//route qui affiche les proposition ainsi que l'état de la proposition de colab 
router.post('/propositions/initiateur/', (req, res) => {
  const { token } = req.body;

  User.findOne({ token })
    .then(user => {
      if (!user) {
        return res.json({ result: false, error: 'Utilisateur non trouvé' });
      }
      PropositionCollab.find({ initiateur: user._id })
        .populate({
          path: 'annonce',
          select: 'title'
        })
        .populate({
          path: 'cible',
          select: 'username phone'
        })
        .select('annonce cible  statut')
        .then(propositionsInitiateur => {
          const messages = propositionsInitiateur.map(proposition => {
            let message;

            if (!proposition.cible) {
              message = `L'utilisateur cible de la proposition n'existe plus en base de données.`;
            } else {
              const cibleUsername = proposition.cible.username;
              const ciblePhone = proposition.cible.phone;
              let additionalMessage = '';

              if (proposition.statut === 'en_attente') {
                if (proposition.annonce) {
                  additionalMessage = `, pour l'annonce: ${proposition.annonce.title}, le statut de la demande de collaboration est: ${proposition.statut}`;
                } else {
                  additionalMessage = `, annonce en question: Annonce supprimé`;
                }
              } else if (proposition.statut === 'accepté') {
                additionalMessage = ` pour l'annonce: ${proposition.annonce ? proposition.annonce.title : 'Vous avez supprimé l\'annonce'}. Son numéro de téléphone a était ajouté a la liste de contact`;
              } else if (proposition.statut === 'refusé') {
                additionalMessage = ` pour l'annonce: ${proposition.annonce ? proposition.annonce.title : 'Une annonce qui n\'existe plus'}`;
              }

              if (proposition.statut === 'en_attente') {
                message = `Vous avez fait une demande de collaboration à: ${cibleUsername}${additionalMessage}`;
              } else if (proposition.statut === 'accepté') {
                message = `${cibleUsername} a accepté votre proposition de collaboration${additionalMessage}`;
              } else if (proposition.statut === 'refusé') {
                message = `${cibleUsername} a décliné votre proposition de collaboration${additionalMessage}`;
              }
            }
            return { message };
          });
          res.json({ result: true, isInitiateur: true, messages: messages });
        })
    })
});

//Modification des statuts de la proposition de collab 
router.put('/propositions/accept', (req, res) => {
  const { token } = req.body;

  User.findOne({ token })
    .then(user => {
      if (!user) {
        return res.json({ result: false, error: 'Utilisateur non trouvé' });
      }
      PropositionCollab.findOneAndUpdate(
        { cible: user._id, statut: 'en_attente' },
        { statut: 'accepté' }
      )
        .then(updatedProposition => {
          if (updatedProposition) {
            return res.json({ result: true, message: 'La proposition de collaboration a été acceptée avec succès' });
          }
          res.json({ result: false, error: 'Aucune proposition de collaboration en attente trouvée' });
        })
    })
});

router.put('/propositions/refuse', (req, res) => {
  const { token } = req.body;

  User.findOne({ token })
    .then(user => {
      if (!user) {
        return res.json({ result: false, error: 'Utilisateur non trouvé' });
      }
      PropositionCollab.findOneAndUpdate(
        { cible: user._id, statut: 'en_attente' },
        { statut: 'refusé' }
      )
        .then(updatedProposition => {
          if (updatedProposition) {
            return res.json({ result: true, message: 'La proposition de collaboration a été refusée avec succès' });
          }
          res.json({ result: false, error: 'Aucune proposition de collaboration en attente trouvée' });
        })
    })
});

router.post('/collaboration/contact', (req, res) => {
  const { token } = req.body;

  User.findOne({ token })
    .then(user => {
      if (!user) {
        return res.json({ result: false, error: 'Utilisateur non trouvé' });
      }
      PropositionCollab.find({
        $or: [
          { $and: [{ initiateur: user._id }, { statut: 'accepté' }] },
          { $and: [{ cible: user._id }, { statut: 'accepté' }] }
        ]
      })
        .populate({
          path: 'initiateur cible',
          select: 'username phone'
        })
        .select('initiateur cible')
        .then(collaborations => {
          const contacts = [];
          const addedUserIds = new Set();

          collaborations.forEach(collaboration => {
            let contactUser = null;

            if (collaboration.initiateur && collaboration.cible) {
              contactUser = collaboration.initiateur._id.equals(user._id)
                ? collaboration.cible
                : collaboration.initiateur;
            } else if (collaboration.initiateur) {
              contactUser = collaboration.initiateur;
            } else if (collaboration.cible) {
              contactUser = collaboration.cible;
            }

            if (contactUser && contactUser._id && !contactUser._id.equals(user._id)) {
              if (!addedUserIds.has(contactUser._id.toString())) {
                addedUserIds.add(contactUser._id.toString());

                contacts.push({
                  username: contactUser.username,
                  phone: contactUser.phone
                });
              }
            } else if (!contactUser) {
              contacts.push({
                username: "Cet utilisateur",
                phone: "a supprimé son compte Colab"
              });
            }
          });
          res.json({ result: true, contacts });
        })
    })
});


module.exports = router;
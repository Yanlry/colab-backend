var express = require('express');
var router = express.Router();

const Annonce = require('../models/annonces');
const PropositionCollab = require('../models/propositionCollabs')
const User = require('../models/users');
const { checkBody } = require("../modules/checkBody");

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
            // Correction : utilise `initiateur` au lieu de `initiator`
            const conversationId = `${annonce._id}_${initiateur._id}_${cible._id}`; 

            PropositionCollab.findOne({ annonce: annonce._id, initiateur: initiateur._id })
              .then(existingProposition => {
                if (existingProposition) {
                  return res.json({ result: false, message: 'Vous avez déjà fait une demande de collaboration pour cette annonce.' });
                }
                const proposition = new PropositionCollab({
                  annonce: annonce._id,
                  cible: cible._id,
                  initiateur: initiateur._id,
                  statut: 'en_attente',
                  conversationId,
                });
                proposition.save()
                  .then(savedProposition => {
                    res.json({ result: true, message: 'La demande de collaboration a été envoyée avec succès.', proposition: savedProposition });
                  });
              });
          });
      });
  });

});

/// Route qui affiche les offres ainsi que l'état de la proposition de collaboration 
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
        .select('_id annonce initiateur statut') // Inclure l'ID ici
        .then(propositionsCible => {
          console.log("Propositions Cible :", propositionsCible); // Log pour vérifier les données

          const messages = propositionsCible.map(proposition => {
            let message;

            if (!proposition.initiateur) {
              message = `L'initiateur de la proposition n'existe plus en base de données.`;
            } else {
              const username = proposition.initiateur.username;
              const phone = proposition.initiateur.phone;
              let additionalMessage = '';

              if (proposition.statut === 'en_attente') {
                additionalMessage = proposition.annonce 
                  ? `${proposition.annonce.title}.`
                  : `ANNONCE SUPPRIMÉ`;
              } else if (proposition.statut === 'accepté') {
                additionalMessage = `${proposition.annonce ? proposition.annonce.title : 'L\'annonce a étais supprimé'}.`;
              } else if (proposition.statut === 'refusé') {
                additionalMessage = `${proposition.annonce ? proposition.annonce.title : `Vous avez supprimé l'annonce`}`;
              }

              if (proposition.statut === 'en_attente') {
                message = `${username} aimerait entrer en contact avec vous pour : ${additionalMessage}`;
              } else if (proposition.statut === 'accepté') {
                message = `ACCEPTÉ ! ${username} vous attend dans l'onglet contact !`;
              } else if (proposition.statut === 'refusé') {
                message = `REFUSÉ ! ${username} a été averti de votre refus pour : ${additionalMessage}.`;
              }
            }

            // Inclure l'ID et le statut pour le frontend
            return { 
              _id: proposition._id, // Inclure l'ID ici
              message, 
              statut: proposition.statut 
            };
          });
          res.json({ result: true, isCible: true, messages: messages });
        })
    })
});

// Route qui affiche les propositions envoyées par l'utilisateur
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
        .select('_id annonce cible statut') // Inclure l'ID ici
        .then(propositionsInitiateur => {
          console.log("Propositions Initiateur :", propositionsInitiateur); // Log pour vérifier les données

          const messages = propositionsInitiateur.map(proposition => {
            let message;

            if (!proposition.cible) {
              message = `L'utilisateur cible de la proposition n'existe plus en base de données.`;
            } else {
              const cibleUsername = proposition.cible.username;
              const ciblePhone = proposition.cible.phone;
              let additionalMessage = '';

              if (proposition.statut === 'en_attente') {
                additionalMessage = proposition.annonce
                  ? ` ${proposition.annonce.title}.`
                  : `, annonce en question: Annonce supprimée`;
              } else if (proposition.statut === 'accepté') {
                additionalMessage = `${proposition.annonce ? proposition.annonce.title : 'Vous avez supprimé l\'annonce'}. Son numéro de téléphone a été ajouté à la liste de contacts.`;
              } else if (proposition.statut === 'refusé') {
                additionalMessage = `${proposition.annonce ? proposition.annonce.title : 'Une annonce qui n\'existe plus'}.`;
              }

              if (proposition.statut === 'en_attente') {
                message = `${cibleUsername} analyse votre demande pour :${additionalMessage}`;
              } else if (proposition.statut === 'accepté') {
                message = `ACCEPTÉ ! ${cibleUsername} vous attend dans l'onglet contact !`;
              } else if (proposition.statut === 'refusé') {
                message = `REFUSÉ ! ${cibleUsername} a décliné votre proposition pour : ${additionalMessage}`;
              }
            }

            // Inclure l'ID et le statut pour le frontend
            return {
              _id: proposition._id, // Inclure l'ID ici
              message,
              statut: proposition.statut
            };
          });
          res.json({ result: true, isInitiateur: true, messages: messages });
        })
    })
    .catch(error => {
      res.json({ result: false, error: error.message });
    });
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
          select: 'username phone token'
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
                  phone: contactUser.phone,
                  token: contactUser.token
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

router.delete('/collaboration/delete', (req, res) => {
  if (!checkBody(req.body, ['propositionCollabsId'])) {
    res.json({ result: false, error: 'Champs vides ou manquants' });
    return;
  }

  const { propositionCollabsId } = req.body;

  PropositionCollab.findByIdAndDelete(propositionCollabsId)
    .then(deletedCollaboration => {
      if (deletedCollaboration) {
        res.json({ result: true, message: 'La collaboration a été supprimée avec succès' });
      } else {
        res.json({ result: false, error: 'Collaboration non trouvée' });
      }
    })
    .catch(error => {
      console.error(error);
      res.json({ result: false, error: 'Erreur lors de la suppression de la collaboration' });
    });
});


module.exports = router;
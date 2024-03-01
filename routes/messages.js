const express = require('express');
var router = express.Router();

const { Message } = require('../models/messages'); // Assurez-vous d'ajuster le chemin si nécessaire

// Endpoint pour créer une nouvelle conversation
router.post('/', (req, res) => {
  const { senderToken, recipientToken, text } = req.body;

  // Créer un nouveau message avec le schéma de conversation imbriqué
  const newMessage = new Message({
    text,
    senderToken,
    recipientToken,
    conversation: {
      participants: [senderToken, recipientToken],
      lastMessage: text,
    },
  });

  newMessage.save()
    .then(savedMessage => {
      res.status(201).json({ success: true, message: 'Message enregistré avec succès.', savedMessage });
    })
    .catch(error => {
      console.error('Error saving message to the database:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    });
});

router.get('/conversation/:conversationId', (req, res) => {
  const conversationId = req.params.conversationId;

  Message.findOne({ 'conversation._id': conversationId })
    .then(message => {
      if (!message) {
        return res.status(404).json({ success: false, error: 'Conversation not found' });
      }

      const { participants } = message.conversation;
      const [senderToken, recipientToken] = participants;

      // Utilisez senderToken et recipientToken pour récupérer les messages associés
      Message.find({
        $or: [
          { $and: [{ senderToken }, { recipientToken }] },
          { $and: [{ senderToken: recipientToken }, { recipientToken: senderToken }] }
        ]
      })
      .sort({ date: 'asc' })
      .then(messages => {
        res.json({ success: true, messages });
      })
      .catch(error => {
        console.error('Error retrieving messages from the database:', error);
        res.status(500).json({ success: false, error: 'Error retrieving messages from the database' });
      });
    })
    .catch(error => {
      console.error('Error retrieving conversation from the database:', error);
      res.status(500).json({ success: false, error: 'Error retrieving conversation from the database' });
    });
});



router.get('/:destinataireToken/:senderToken', (req, res) => {
  const { destinataireToken, senderToken } = req.params;

  Message.find({
    $or: [
      { $and: [{ senderToken }, { recipientToken: destinataireToken }] },
      { $and: [{ senderToken: destinataireToken }, { recipientToken: senderToken }] }
    ]
  })
    .sort({ date: 'asc' })
    .then(messages => {
      res.json({ result: true, messages });
    })
    .catch(error => {
      console.error('Erreur lors de la récupération des messages:', error);
      res.json({ result: false, error: 'Erreur lors de la récupération des messages' });
    });
});



router.get('/conversations/:userToken', (req, res) => {
  const { userToken } = req.params;

  Message.find({
    $or: [
      { senderToken: userToken },
      { recipientToken: userToken }
    ]
  })
    .sort({ date: 'desc' })
    .then(messages => {
      console.log('Messages retrieved:', messages);

      // Utiliser distinct pour obtenir les participants uniques
      const participants = [...new Set(messages.flatMap(message => message.conversation.participants))];
      console.log('Participants retrieved:', participants);

      res.json({ result: true, participants });
    })
    .catch(error => {
      console.error('Erreur lors de la récupération des participants:', error);
      res.json({ result: false, error: 'Erreur lors de la récupération des participants' });
    });
});




module.exports = router;

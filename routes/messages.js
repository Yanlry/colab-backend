const express = require('express');
var router = express.Router();

const Message = require('../models/messages'); 

router.post('/', (req, res) => {
  const { senderToken, recipientToken, text } = req.body;

  const conversationId = senderToken + recipientToken;

  const newMessage = new Message({
    text,
    senderToken,
    recipientToken,
    conversationId,
    participants: [senderToken, recipientToken],
    lastMessage: text,
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

router.get('/:destinataireToken/:senderToken', (req, res) => {
  const { destinataireToken, senderToken } = req.params;

  const conversationId = senderToken + destinataireToken;

  Message.find({
    $or: [
      { conversationId },
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
      { 'senderToken': userToken },
      { 'recipientToken': userToken }
    ]
  })
    .sort({ date: 'desc' }) 
    .then(conversations => {
      res.json({ result: true, conversations });
    })
    .catch(error => {
      console.error('Erreur lors de la récupération des conversations:', error);
      res.json({ result: false, error: 'Erreur lors de la récupération des conversations' });
    });
});



module.exports = router;

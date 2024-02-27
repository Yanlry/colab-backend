const express = require('express');
var router = express.Router();

const Message = require('../models/messages');


// Endpoint pour créer un nouveau message
router.post('/', (req, res) => {
  const { text, senderToken, recipientToken } = req.body;
  const newMessage = new Message({ text, senderToken, recipientToken });

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

router.get('/messages/:userToken', (req, res) => {
  const { userToken } = req.params;

  Message.find({
    $or: [
      { senderToken: userToken },
      { recipientToken: userToken }
    ]
  })
    .sort({ date: 'desc' }) // Assurez-vous que le champ pour la date est correct
    .then(messages => {
      res.json({ result: true, messages });
    })
    .catch(error => {
      console.error('Erreur lors de la récupération des messages:', error);
      res.json({ result: false, error: 'Erreur lors de la récupération des messages' });
    });
});



module.exports = router;

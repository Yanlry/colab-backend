const express = require('express');
const router = express.Router();
const Message = require('../models/messages');

// Endpoint pour créer un nouveau message
router.post('/', async (req, res) => {
  try {
    const { text, senderToken, recipientToken } = req.body;
    const newMessage = new Message({ text, senderToken, recipientToken });
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint pour récupérer les messages d'une conversation entre deux utilisateurs
router.get('/messages/conversation/:senderToken/:recipientToken', async (req, res) => {
  try {
    const senderToken = req.params.senderToken;
    const recipientToken = req.params.recipientToken;

    console.log('Route atteinte avec senderToken:', senderToken, 'et recipientToken:', recipientToken);

    const conversationMessages = await Message.find({
      $or: [
        { senderToken, recipientToken },
        { senderToken: recipientToken, recipientToken: senderToken }
      ]
    });

    console.log('Messages récupérés avec succès:', conversationMessages);

    res.status(200).json(conversationMessages);
  } catch (error) {
    console.error('Erreur lors de la récupération des messages de la conversation :', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Endpoint pour récupérer les messages envoyés par un utilisateur
router.get('/messages/sent/:senderToken', async (req, res) => {
  try {
    const senderToken = req.params.senderToken;
    
    const sentMessages = await Message.find({ senderToken });

    res.status(200).json(sentMessages);
  } catch (error) {
    console.error('Erreur lors de la récupération des messages envoyés :', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint pour récupérer les messages reçus par un utilisateur
router.get('/messages/received/:recipientToken', async (req, res) => {
  try {
    const recipientToken = req.params.recipientToken;
    
    const receivedMessages = await Message.find({ recipientToken });

    res.status(200).json(receivedMessages);
  } catch (error) {
    console.error('Erreur lors de la récupération des messages reçus :', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;





module.exports = router;

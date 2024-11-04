const express = require('express');
var router = express.Router();

const Message = require('../models/messages'); 

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
      const messagesWithFlag = messages.map(message => ({
        ...message._doc,
        isNew: !message.isRead, 
      }));
      res.json({ result: true, messages: messagesWithFlag });
    })
    .catch(error => {
      console.error('Erreur lors de la récupération des messages:', error);
      res.json({ result: false, error: 'Erreur lors de la récupération des messages' });
    });
});

router.get('/conversations/unread/:token', (req, res) => {
  const { token } = req.params;

  Message.find({
    recipientToken: token,       
    isRead: false               
  })
  .then(messages => {
    
    const conversationIds = [...new Set(messages.map(message => message.conversationId))];

    if (conversationIds.length > 0) {
      res.json({ result: true, unreadConversations: conversationIds });
    } else {
      res.json({ result: false, unreadConversations: [] });
    }
  })
  .catch(error => {
    console.error('Erreur lors de la recherche des conversations avec des messages non lus:', error.message);
    res.json({ result: false, error: 'Erreur lors de la récupération des conversations avec des messages non lus' });
  });
});

router.post('/', (req, res) => {

  const { senderToken, recipientToken, text } = req.body;
  const sortedTokens = [senderToken, recipientToken].sort();
  const conversationId = sortedTokens.join('');

  const newMessage = new Message({
    text,
    senderToken,
    recipientToken,
    conversationId,
    participants: [senderToken, recipientToken],
    lastMessage: text,
    isRead: false, 
  });

  newMessage.save()
    .then(savedMessage => {
      res.status(201).json({ success: true, message: 'Message enregistré avec succès.', savedMessage });
    })
    .catch(error => {
      console.error('Erreur lors de l\'enregistrement du message dans la base de données:', error);
      res.status(500).json({ success: false, error: 'Erreur interne du serveur' });
    });
});

router.put('/read/:destinataireToken/:senderToken', (req, res) => {
  const { destinataireToken, senderToken } = req.params;

  Message.updateMany(
    { recipientToken: senderToken, senderToken: destinataireToken, isRead: false },
    { $set: { isRead: true } }
  )
    .then(() => {
      res.json({ result: true, message: 'Messages marqués comme lus' });
    })
    .catch(error => {
      console.error('Erreur lors de la mise à jour des messages comme lus:', error);
      res.json({ result: false, error: 'Erreur lors de la mise à jour des messages' });
    });
});


module.exports = router;

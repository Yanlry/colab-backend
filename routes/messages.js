const express = require('express');
var router = express.Router();

const Message = require('../models/messages');


// Endpoint pour créer un nouveau message
router.post('/', (req, res) => {
  const { text, senderToken, recipientToken } = req.body;
  console.log('Received message:', text, 'from sender:', senderToken, 'to recipient:', recipientToken);

  const newMessage = new Message({ text, senderToken, recipientToken});

  newMessage.save()
    .then(savedMessage => {
      console.log('Message saved to the database:', savedMessage);
      res.status(201).json(savedMessage);
    })
    .catch(error => {
      console.error('Error saving message to the database:', error);
      res.status(500).json({ error: 'Internal Server Error' });
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

  Conversation.find({
    $or: [
      { senderToken: userToken },
      { recipientToken: userToken }
    ]
  })
    .sort({ lastMessageDate: 'desc' }) // Assurez-vous que le champ pour la date du dernier message est correct
    .then(conversations => {
      res.json({ result: true, conversations });
    })
    .catch(error => {
      console.error('Erreur lors de la récupération des conversations:', error);
      res.json({ result: false, error: 'Erreur lors de la récupération des conversations' });
    });
});


// router.get('/messages/:destinataireToken/:senderToken', (req, res) => {
//   const { destinataireToken, senderToken } = req.params;

//   Message.find({
//     $or: [
//       { $and: [{ senderToken }, { recipientToken: destinataireToken }] },
//       { $and: [{ senderToken: destinataireToken }, { recipientToken: senderToken }] }
//     ]
//   })
//     .sort({ date: 'asc' })
//     .then(messages => {
//       res.json({ result: true, messages });
//     })
//     .catch(error => {
//       console.error('Erreur lors de la récupération des messages:', error);
//       res.json({ result: false, error: 'Erreur lors de la récupération des messages' });
//     });
// });



// // Endpoint pour créer un nouveau message
// router.post('/', async (req, res) => {
//   try {
//     const { text, senderToken, recipientToken } = req.body;
//     console.log('Received message:', text, 'from sender:', senderToken, 'to recipient:', recipientToken);

//     const newMessage = new Message({ text, senderToken, recipientToken });
//     await newMessage.save();
//     console.log('Message saved to the database:', newMessage);

//     res.status(201).json(newMessage);
//   } catch (error) {
//     console.error('Error in message route:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });


// // Endpoint pour récupérer les messages d'une conversation entre deux utilisateurs
// router.get('/messages/conversation/:senderToken/:recipientToken', async (req, res) => {
//   try {
//     const senderToken = req.params.senderToken;
//     const recipientToken = req.params.recipientToken;

//     console.log('Route atteinte avec senderToken:', senderToken, 'et recipientToken:', recipientToken);

//     const conversationMessages = await Message.find({
//       $or: [
//         { senderToken, recipientToken },
//         { senderToken: recipientToken, recipientToken: senderToken }
//       ]
//     });

//     console.log('Messages récupérés avec succès:', conversationMessages);

//     res.status(200).json(conversationMessages);
//   } catch (error) {
//     console.error('Erreur lors de la récupération des messages de la conversation :', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });


// router.get('/messages/sent/:senderToken', async (req, res) => {
//   try {
//     const senderToken = req.params.senderToken;
//     console.log('Sender Token:', senderToken);
    
//     const sentMessages = await Message.find({ senderToken });
//     console.log('Sent Messages:', sentMessages); 

//     res.status(200).json(sentMessages);
//   } catch (error) {
//     console.error('Erreur lors de la récupération des messages envoyés :', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });


// // Endpoint pour récupérer les messages reçus par un utilisateur
// router.get('/messages/received/:recipientToken', async (req, res) => {
//   try {
//     const recipientToken = req.params.recipientToken;
    
//     const receivedMessages = await Message.find({ recipientToken });

//     res.status(200).json(receivedMessages);
//   } catch (error) {
//     console.error('Erreur lors de la récupération des messages reçus :', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

module.exports = router;

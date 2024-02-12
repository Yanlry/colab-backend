var express = require('express');
var router = express.Router();

const mongoose = require('mongoose');

const Message = mongoose.model('Message', new mongoose.Schema({
  text: String,
  isUser: Boolean,
}));

// Endpoint pour créer un nouveau message
router.post('/', async (req, res) => {
  try {
    const newMessage = new Message(req.body);
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;

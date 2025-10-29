const Message = require('../models/Message');

exports.submitForm = async (req, res) => {
  try {
    const newMessage = new Message(req.body);
    await newMessage.save();
    res.status(200).send('✅ Message saved successfully!');
  } catch (error) {
    console.error(error);
    res.status(500).send('❌ Error saving message.');
  }
};
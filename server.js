// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const nodemailer = require('nodemailer');

// Initialize app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Define Schema & Model
const messageSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String
});

const Message = mongoose.model('Message', messageSchema);

// POST route — form submission
app.post('/submit', async (req, res) => {
  try {
    // Save to MongoDB
    const newMessage = new Message(req.body);
    await newMessage.save();

    // Send email notification
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.TO_EMAIL,
      subject: '📩 New Contact Form Message',
      text: `Name: ${req.body.name}\nEmail: ${req.body.email}\nMessage: ${req.body.message}`
    });

    console.log('✅ Email sent successfully');
    res.send('✅ Message saved and email sent successfully!');
  } catch (error) {
    console.error('❌ Error saving or emailing message:', error);
    res.status(500).send('❌ Error saving message or sending email.');
  }
});

// Serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
// ===============================
// True Prime Digital Contact Form API
// ===============================

// Import dependencies
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');

// Initialize app
dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Rate limiter to prevent spam
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 requests per minute
});
app.use(limiter);

// ===============================
// MongoDB Connection
// ===============================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// ===============================
// Email Transporter
// ===============================
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ===============================
// Serve Static Frontend
// ===============================
app.use(express.static(path.join(__dirname, 'public')));

// Root route (loads form)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ===============================
// Form Submission Route
// ===============================
app.post('/submit', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validate form
    if (!name || !email || !message) {
      return res.status(400).send('❌ All fields are required.');
    }

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.TO_EMAIL,
      subject: `New Contact Form Submission from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nMessage:\n${message}`,
    };

    await transporter.sendMail(mailOptions);

    console.log('📨 Email sent successfully');
    res.status(200).send('✅ Message sent successfully!');
  } catch (error) {
    console.error('❌ Error sending message:', error);
    res.status(500).send('❌ Failed to send message. Please try again later.');
  }
});

// ===============================
// Start Server
// ===============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
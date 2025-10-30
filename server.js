// server.js
import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();
const app = express();

// --- MIDDLEWARE ---
app.use(express.json());
app.use(cors({
  origin: ["https://contact-form-app-84vz.onrender.com", "http://localhost:3000"],
  methods: ["POST", "GET"],
}));

// --- MONGO CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// --- TEST ROUTE ---
app.get("/", (req, res) => {
  res.send("🚀 True Prime Digital Contact Form API is running successfully!");
});

// --- CONTACT ROUTE ---
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    console.log("📨 Form received:", name, email, message);

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"True Prime Digital" <${process.env.EMAIL_USER}>`,
      to: process.env.TO_EMAIL,
      subject: `New Contact Message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully!");
    res.status(200).json({ success: true, message: "Message sent successfully!" });

  } catch (error) {
    console.error("❌ Error sending message:", error.message);
    res.status(500).json({ success: false, message: "Server error. Please try again later." });
  }
});

// --- START SERVER ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
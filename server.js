// ===============================
// True Prime Digital Contact Form API
// ===============================

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

dotenv.config();
const app = express();

// ===============================
// Middleware
// ===============================
app.use(express.json());
app.use(cors());
app.use(helmet());

// Rate limiter (avoid spam)
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 requests per minute
});
app.use(limiter);

// ===============================
// MongoDB Connection
// ===============================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ===============================
// Root Route
// ===============================
app.get("/", (req, res) => {
  res.send("🚀 True Prime Digital Contact Form API is running successfully!");
});

// ===============================
// Contact Form Submission Route
// ===============================
app.post("/submit", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    console.log("📨 Form received:", { name, email, message });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.TO_EMAIL,
      subject: `📧 New Message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
    });

    console.log("✅ Email sent successfully!");
    res.status(200).send("✅ Message sent successfully!");
  } catch (error) {
    console.error("❌ Error sending message:", error);
    res.status(500).send("❌ Failed to send message. Please try again later.");
  }
});

// ===============================
// Start Server (Render Compatible)
// ===============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
// ===== IMPORTS =====
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import fetch from "node-fetch";
import mongoose from "mongoose";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import Contact from "./models/Contact.js"; // <-- new model import

// ===== CONFIG =====
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ===== CONNECT TO MONGODB =====
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ===== API ROUTE =====
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // 1️⃣ SAVE CONTACT IN MONGODB
    const newContact = new Contact({ name, email, message });
    await newContact.save();
    console.log("💾 Contact saved:", newContact);

    // 2️⃣ SEND EMAIL THROUGH BREVO
    const brevoRes = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: "True Prime Digital", email: process.env.TO_EMAIL },
        to: [{ email: process.env.TO_EMAIL }],
        subject: "📩 New Contact Form Message",
        htmlContent: `
          <h2>New Contact Message</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong> ${message}</p>
        `,
      }),
    });

    if (!brevoRes.ok) {
      const text = await brevoRes.text();
      console.error("❌ Email send failed:", text);
      return res.status(500).json({ success: false, error: "Email failed to send" });
    }

    res.status(200).json({ success: true, message: "Message sent successfully!" });
    console.log("✅ Email sent successfully via Brevo");

  } catch (error) {
    console.error("❌ Error saving contact:", error);
    res.status(500).json({ success: false, error: "Server error occurred" });
  }
});

// ===== FRONTEND ROUTE =====
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ===== START SERVER =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
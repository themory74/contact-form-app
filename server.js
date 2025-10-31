import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import fetch from "node-fetch";
import mongoose from "mongoose";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import Contact from "./models/Contact.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ===== CONNECT TO MONGODB =====
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ===== API ROUTE =====
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    console.log("🟢 New form received:", name, email);

    // Save to MongoDB
    const newContact = new Contact({ name, email, message });
    await newContact.save();
    console.log("💾 Contact saved to MongoDB:", newContact);

    // Send via Brevo API
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
          <h3>New Message Received</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong> ${message}</p>
        `,
      }),
    });

    if (!brevoRes.ok) {
      const text = await brevoRes.text();
      console.error("❌ Brevo email failed:", text);
      return res
        .status(500)
        .json({ success: false, error: "Email failed to send" });
    }

    console.log("✅ Email sent successfully via Brevo");
    res.status(200).json({ success: true, message: "Message sent successfully!" });
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
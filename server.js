import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import fetch from "node-fetch";
import mongoose from "mongoose";
import pkg from "pg";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const { Pool } = pkg;
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// --- PostgreSQL setup ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
pool.connect()
  .then(() => console.log("✅ Connected to PostgreSQL (Render)"))
  .catch((err) => console.error("❌ PostgreSQL Error:", err.message));

// --- MongoDB setup ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB Error:", err.message));

// --- MongoDB schema ---
const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  createdAt: { type: Date, default: Date.now },
});
const Contact = mongoose.model("Contact", contactSchema);

// --- POST route ---
app.post("/submit", async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message)
    return res.status(400).json({ success: false, message: "All fields required." });

  try {
    // Save to MongoDB
    const contact = await Contact.create({ name, email, message });
    console.log("✅ Saved to MongoDB:", contact.id);

    // Also store in PostgreSQL
    await pool.query(
      "INSERT INTO contacts (name, email, message, created_at) VALUES ($1, $2, $3, NOW())",
      [name, email, message]
    );
    console.log("✅ Logged to PostgreSQL");

    // Send email via Brevo
    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { email: "contact@trueprimedigital.com", name: "True Prime Digital" },
        to: [{ email: process.env.TO_EMAIL }],
        subject: "📩 New Contact Form Submission",
        htmlContent: `
          <h2>New message from ${name}</h2>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong><br>${message}</p>
        `,
      }),
    });
    console.log("📧 Email sent via Brevo");

    res.status(200).json({ success: true, message: "Form submitted successfully!" });
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ success: false, message: "Server error. Please try again later." });
  }
});

// --- Start server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
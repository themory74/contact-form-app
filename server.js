// ===============================================
// True Prime Digital - Full Backend (Final Version)
// MongoDB + PostgreSQL + Brevo + Frontend Serve
// ===============================================

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const { Pool } = require("pg");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

// ============ Middleware ============
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend from /public (index.html, form.js, css, etc.)
app.use(express.static(path.join(__dirname, "public")));

// ============ MongoDB Connection ============
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB Error:", err.message));

// ============ PostgreSQL Connection ============
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool
  .connect()
  .then(() => console.log("✅ PostgreSQL connected successfully"))
  .catch((err) => console.error("❌ PostgreSQL Error:", err.message));

// ============ MongoDB Schema ============
const Contact =
  mongoose.models.Contact ||
  mongoose.model(
    "Contact",
    new mongoose.Schema(
      {
        name: String,
        email: String,
        message: String,
        createdAt: { type: Date, default: Date.now },
      },
      { collection: "contacts" }
    )
  );

// ============ Brevo Email Function ============
async function sendEmail({ name, email, message }) {
  if (!process.env.BREVO_API_KEY) {
    console.log("⚠️ BREVO_API_KEY not set — skipping email send");
    return;
  }
  try {
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { name: "True Prime Digital", email: "contact@trueprimedigital.com" },
        to: [{ email: "contact@trueprimedigital.com" }], // change to your inbox
        subject: `New Contact Form Submission - ${name}`,
        htmlContent: `
          <h2>New Contact Submission</h2>
          <p><b>Name:</b> ${name}</p>
          <p><b>Email:</b> ${email}</p>
          <p><b>Message:</b><br/>${message}</p>
        `,
      },
      {
        headers: { "api-key": process.env.BREVO_API_KEY },
      }
    );
    console.log("📧 Email sent successfully via Brevo");
  } catch (err) {
    console.error("❌ Brevo Email Error:", err.message);
  }
}

// ============ Root Route ============
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ============ Health Check ============
app.get("/health", async (req, res) => {
  res.json({
    mongo: mongoose.connection.readyState === 1,
    postgres: !!pool,
    brevo: !!process.env.BREVO_API_KEY,
    time: new Date().toISOString(),
  });
});

// ============ Form Submission ============
app.post("/submit", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: "All fields are required." });
  }

  try {
    // Save to MongoDB
    const contact = new Contact({ name, email, message });
    await contact.save();
    console.log("💾 Saved to MongoDB");

    // Log to PostgreSQL
    await pool.query(
      "CREATE TABLE IF NOT EXISTS contacts (id SERIAL PRIMARY KEY, name TEXT, email TEXT, message TEXT, created_at TIMESTAMP DEFAULT NOW());"
    );
    await pool.query(
      "INSERT INTO contacts (name, email, message) VALUES ($1, $2, $3)",
      [name, email, message]
    );
    console.log("📊 Logged to PostgreSQL");

    // Send confirmation email
    await sendEmail({ name, email, message });

    res.status(200).json({ success: true, message: "Message received successfully." });
  } catch (error) {
    console.error("❌ Error handling submission:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error." });
  }
});

// ============ 404 + Error Handlers ============
app.use((req, res) => {
  res.status(404).json({ error: "Route not found." });
});

app.use((err, req, res, next) => {
  console.error("🔥 Global Error:", err.message);
  res.status(500).json({ error: "Internal Server Error" });
});

// ============ Start Server ============
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Graceful Shutdown
process.on("SIGINT", () => {
  console.log("⚠️  Shutting down...");
  mongoose.disconnect();
  pool.end();
  process.exit(0);
});
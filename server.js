// ===============================================================
// TRUE PRIME DIGITAL LLC - CONTACT FORM BACKEND (FINAL VERSION)
// Stack: Node.js + Express + MongoDB Atlas + Brevo Email
// Author: True Prime Digital LLC
// ===============================================================

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

// ===============================================================
// 🔧 MIDDLEWARE SETUP
// ===============================================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend from the /public folder (index.html, form.js, CSS)
app.use(express.static(path.join(__dirname, "public")));

console.log("🚀 Starting True Prime Digital backend...");
console.log("⏳ Connecting to databases...");

// ===============================================================
// 🌐 CONNECT TO MONGODB ATLAS
// ===============================================================
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  });

// ===============================================================
// 🧩 MONGOOSE SCHEMA & MODEL
// ===============================================================
const Contact =
  mongoose.models.Contact ||
  mongoose.model(
    "Contact",
    new mongoose.Schema(
      {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String },
        message: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
      { collection: "contacts" }
    )
  );

console.log("📁 MongoDB schema initialized.");

// ===============================================================
// ✉️ BREVO EMAIL FUNCTION
// ===============================================================
async function sendEmail({ name, email, phone, message }) {
  if (!process.env.BREVO_API_KEY) {
    console.log("⚠️ BREVO_API_KEY missing — skipping email send");
    return;
  }

  try {
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { name: "True Prime Digital", email: "contact@trueprimedigital.com" },
        to: [{ email: "contact@trueprimedigital.com" }],
        subject: `New Contact Form Submission - ${name}`,
        htmlContent: `
          <h2>New Contact Submission</h2>
          <p><b>Name:</b> ${name}</p>
          <p><b>Email:</b> ${email}</p>
          <p><b>Phone:</b> ${phone || "N/A"}</p>
          <p><b>Message:</b><br/>${message}</p>
          <hr/>
          <p style="font-size:0.8rem;opacity:0.7;">Sent automatically from True Prime Digital Contact Form</p>
        `,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("📧 Email sent successfully via Brevo");
  } catch (error) {
    console.error("❌ Brevo Email Error:", error.message);
  }
}

// ===============================================================
// 🏠 ROOT ROUTE
// ===============================================================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ===============================================================
// ❤️ HEALTH CHECK
// ===============================================================
app.get("/health", async (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  res.json({
    service: "True Prime Digital Contact API",
    mongo: mongoStatus,
    brevo: !!process.env.BREVO_API_KEY,
    time: new Date().toISOString(),
  });
});

// ===============================================================
// 📨 FORM SUBMISSION HANDLER
// ===============================================================
app.post("/submit", async (req, res) => {
  const { name, email, phone, message } = req.body;

  // Basic validation
  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: "All required fields must be filled.",
    });
  }

  try {
    // Save to MongoDB
    const contact = new Contact({ name, email, phone, message });
    await contact.save();
    console.log(`💾 Saved new contact: ${name} (${email})`);

    // Send email notification
    await sendEmail({ name, email, phone, message });

    // Send response to frontend
    res.status(200).json({
      success: true,
      message: "Your message was sent successfully!",
    });
  } catch (err) {
    console.error("❌ Submission Error:", err.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
    });
  }
});

// ===============================================================
// ⚠️ 404 HANDLER
// ===============================================================
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ===============================================================
// 🔥 GLOBAL ERROR HANDLER
// ===============================================================
app.use((err, req, res, next) => {
  console.error("🔥 Global Error:", err.stack || err.message);
  res.status(500).json({ error: "Internal Server Error" });
});

// ===============================================================
// 🚀 START SERVER
// ===============================================================
app.listen(PORT, () => {
  console.log(`✅ True Prime Digital server running on port ${PORT}`);
  console.log(`🌐 http://localhost:${PORT}`);
});

// ===============================================================
// 🧹 GRACEFUL SHUTDOWN
// ===============================================================
process.on("SIGINT", () => {
  console.log("\n⚠️ Gracefully shutting down server...");
  mongoose.disconnect();
  console.log("🛑 MongoDB disconnected.");
  process.exit(0);
});
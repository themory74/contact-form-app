// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: "*", methods: ["POST", "GET"] }));

// Path setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------- CONNECT MONGODB ----------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ---------- CONTACT FORM API ----------
app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body;
  console.log("📨 Form request received:", req.body);

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: name || "Website Visitor", email: email },
        to: [{ email: process.env.TO_EMAIL }],
        subject: `📩 New Contact Form Message from ${name}`,
        htmlContent: `
          <h3>New Contact Message</h3>
          <p><b>Name:</b> ${name}</p>
          <p><b>Email:</b> ${email}</p>
          <p><b>Message:</b></p>
          <p>${message}</p>
        `,
      }),
    });

    if (response.ok) {
      console.log("✅ Email sent successfully via Brevo API");
      res.status(200).json({ success: true, message: "Message sent successfully!" });
    } else {
      const errorText = await response.text();
      console.error("❌ Brevo API error:", errorText);
      res.status(500).json({ success: false, error: "Failed to send email" });
    }
  } catch (error) {
    console.error("❌ API request failed:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// ---------- SERVE FRONTEND ----------
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ---------- START SERVER ----------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
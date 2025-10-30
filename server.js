import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

// MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Contact Form Route
app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body;
  console.log("📨 Form received:", { name, email, message });

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: "True Prime Digital", email: process.env.TO_EMAIL },
        to: [{ email: process.env.TO_EMAIL, name: "True Prime Digital" }],
        subject: `📩 New Contact Form Message from ${name}`,
        htmlContent: `
          <h3>New Contact Message</h3>
          <p><b>Name:</b> ${name}</p>
          <p><b>Email:</b> ${email}</p>
          <p><b>Message:</b> ${message}</p>
        `,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("✅ Email sent successfully via Brevo API");
      res.status(200).json({ success: true, message: "Message sent successfully!" });
    } else {
      console.error("❌ Brevo API Error:", data);
      res.status(500).json({ success: false, error: "Failed to send email" });
    }
  } catch (error) {
    console.error("⚠️ API Request Failed:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// Frontend serving
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
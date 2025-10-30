import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import mongoose from "mongoose";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// MongoDB (optional)
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// POST /api/contact
app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body;
  console.log("📩 Received form:", { name, email, message });

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
        to: [{ email: process.env.TO_EMAIL }],
        subject: `📩 New message from ${name}`,
        htmlContent: `
          <h3>New Contact Message</h3>
          <p><b>Name:</b> ${name}</p>
          <p><b>Email:</b> ${email}</p>
          <p><b>Message:</b> ${message}</p>
        `,
      }),
    });

    if (response.ok) {
      console.log("✅ Email sent successfully via Brevo");
      return res.json({ success: true, message: "Message sent successfully!" });
    } else {
      const errorData = await response.json();
      console.error("❌ Brevo API Error:", errorData);
      return res.status(500).json({ success: false, error: "Email failed to send" });
    }
  } catch (error) {
    console.error("⚠️ Server error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

// Serve frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
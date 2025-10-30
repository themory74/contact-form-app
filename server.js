import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// =============================
// 1️⃣ DATABASE CONNECTION
// =============================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// =============================
// 2️⃣ ROOT ROUTE TEST
// =============================
app.get("/", (req, res) => {
  res.send("🚀 True Prime Digital Contact Form API is running successfully!");
});

// =============================
// 3️⃣ CONTACT FORM SUBMISSION
// =============================
app.post("/submit", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    console.log("📩 Form received:", name, email, message);

    // Brevo SMTP Transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false, // false for 587 (STARTTLS)
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email message details
    const mailOptions = {
      from: `"True Prime Digital" <${process.env.EMAIL_USER}>`,
      to: process.env.TO_EMAIL,
      subject: `New Message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully!");
    res.status(200).send("✅ Message sent successfully!");
  } catch (error) {
    console.error("❌ Error sending message:", error);
    res.status(500).send("❌ Failed to send message. Please try again later.");
  }
});

// =============================
// 4️⃣ START SERVER
// =============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`✅ Server running on port ${PORT}`)
);
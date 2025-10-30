import express from "express";
import nodemailer from "nodemailer";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// ✅ CONNECT TO MONGO
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection failed:", err));

// ✅ DEFINE SCHEMA + MODEL
const MessageSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  createdAt: { type: Date, default: Date.now },
});

const Message = mongoose.model("Message", MessageSchema);

// ✅ TEST ROUTE
app.get("/", (req, res) => {
  res.send("🚀 True Prime Digital Contact Form API is live and running on Render!");
});

// ✅ MAIN CONTACT FORM ROUTE
app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body;
  console.log("📨 Form submission received:", name, email, message);

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: "All fields are required." });
  }

  try {
    // ✅ Save to MongoDB
    await Message.create({ name, email, message });

    // ✅ Setup Brevo SMTP transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // ✅ Email content
    const mailOptions = {
      from: `"True Prime Digital" <${process.env.EMAIL_USER}>`,
      to: process.env.TO_EMAIL,
      subject: `📩 New Contact Message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
    };

    // ✅ Send email
    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully via Brevo!");
    res.status(200).json({ success: true, message: "Message sent successfully!" });

  } catch (error) {
    console.error("❌ Error sending message:", error);
    res.status(500).json({
      success: false,
      message: "Server error: Failed to send message. Please try again later.",
    });
  }
});

// ✅ START SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
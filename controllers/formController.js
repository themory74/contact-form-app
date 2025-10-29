import nodemailer from "nodemailer";
import Message from "../models/Message.js";

export const handleFormSubmission = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Save message to MongoDB
    const newMessage = new Message({ name, email, message });
    await newMessage.save();

    // Nodemailer setup
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.TO_EMAIL,
      subject: `New Message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
    };

    await transporter.sendMail(mailOptions);

    console.log("✅ Email sent successfully");
    res.status(200).json({ success: true, message: "Form submitted successfully!" });
  } catch (error) {
    console.error("❌ Error processing form:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
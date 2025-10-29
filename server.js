import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import formRoutes from "./routes/formRoutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/contact", formRoutes);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Root test route
app.get("/", (req, res) => {
  res.send("🚀 True Prime Digital Contact Form API is running successfully!");
});

// Start Server (IMPORTANT for Render)
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
});
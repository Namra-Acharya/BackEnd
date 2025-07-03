import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";

import routes from "./routes/index.js";

dotenv.config();

const app = express();

// ✅ Enable CORS for frontend deployed on Vercel
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      // Remove trailing slash if present
      const allowed = process.env.FRONTEND_URL.replace(/\/$/, "");
      const reqOrigin = origin.replace(/\/$/, "");
      if (reqOrigin === allowed) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Logging middleware
app.use(morgan("dev"));

// ✅ JSON body parser
app.use(express.json());

// ✅ Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection failed:", err));

// ✅ Default root route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to TaskHub API",
  });
});

// ✅ Mount API routes
app.use("/api-v1", routes);

// ✅ Error middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

// ✅ 404 Not Found handler
app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";

// Import routes
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import checkoutRoutes from "./routes/checkout.js";
import revenueRoutes from "./routes/revenue.js";
import billRoutes from "./routes/bills.js";

// Load environment variables
dotenv.config();

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

// Rate limiting - Very lenient for production deployment
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "production" ? 1000 : 10000, // 1000 requests per 15min for production, 10000 for dev
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === "/api/health";
  },
});

// Middleware
// Apply rate limiting only to API routes (not health check)
app.use("/api", limiter);

// CORS Configuration - Allow all origins in production for now, restrict later
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://cakeraft-backend.onrender.com",
  process.env.FRONTEND_URL,
].filter(Boolean); // Remove undefined values

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, Postman, curl, etc.)
      if (!origin) return callback(null, true);

      if (process.env.NODE_ENV === "production") {
        // In production, allow any origin temporarily (you can restrict later)
        return callback(null, true);
      }

      // In development, check allowed origins
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(null, true); // Allow all for now, can restrict later
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    optionsSuccessStatus: 200,
    maxAge: 86400, // 24 hours
  })
);

// Handle preflight requests
app.options("*", cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Database connection
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.log("⚠️  MongoDB URI not found in environment variables");
      console.log(
        "   Please add your MongoDB Atlas connection string to .env file"
      );
      console.log(
        "   Server will continue running but database operations will fail"
      );
      return;
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Initialize admin user
    await initializeAdmin();
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
  }
};

// Initialize admin user
const initializeAdmin = async () => {
  try {
    const { Admin } = await import("./models/Admin.js");
    const existingAdmin = await Admin.findOne();

    if (!existingAdmin) {
      const adminEmail = process.env.ADMIN_EMAIL || "admin@billing.com";
      const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123";

      const admin = new Admin({
        email: adminEmail,
        password: adminPassword,
      });

      await admin.save();
      console.log(`✅ Admin user created with email: ${adminEmail}`);
    } else {
      console.log("✅ Admin user already exists");
    }
  } catch (error) {
    console.error("❌ Error initializing admin user:", error.message);
  }
};

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/revenue", revenueRoutes);
app.use("/api/bills", billRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Billing System API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("🚨 Server Error:", error.stack);

  if (error.name === "ValidationError") {
    const errors = Object.values(error.errors).map((err) => err.message);
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors,
    });
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`,
    });
  }

  res.status(error.status || 500).json({
    success: false,
    message: error.message || "Internal Server Error",
  });
});

// Handle 404
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Connect to database
connectDB();

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 API Health Check: http://localhost:${PORT}/api/health`);
  console.log(`📁 Environment: ${process.env.NODE_ENV || "development"}`);
});

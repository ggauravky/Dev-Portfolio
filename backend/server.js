// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

// Force IPv4-first DNS resolution - fixes Node.js 18+ defaulting to IPv6 (::1),
// which breaks MongoDB Atlas SRV lookups (querySrv ECONNREFUSED) and
// causes EADDRINUSE on ::1 instead of 127.0.0.1.
const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");
// Use Google & Cloudflare DNS directly - ISP/system DNS often blocks SRV queries
// needed by MongoDB Atlas (mongodb+srv://) connection strings.
dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const connectDatabase = require("./config/database");
const contactRoutes = require("./routes/contactRoutes");
const newsletterRoutes = require("./routes/newsletterRoutes");
const chatRoutes = require("./routes/chatRoutes");
const mlLogRoutes = require("./routes/mlLogRoutes");
const { generalRateLimiter } = require("./middleware/rateLimiter");

// Initialize express app
const app = express();

// Connect to MongoDB
connectDatabase();

// Security middleware
app.use(helmet());
app.use(mongoSanitize());

// CORS configuration
// Allowed origins: production URL + localhost dev servers + explicitly listed preview URLs.
// We do NOT blanket-allow all *.vercel.app origins — that would let any Vercel project
// bypass CORS on this API.
const VERCEL_PROJECT_SLUG = process.env.VERCEL_PROJECT_SLUG || "dev-portfolio";
// Matches only preview deployments of THIS specific project (e.g. dev-portfolio-abc123.vercel.app)
const VERCEL_PREVIEW_PATTERN = new RegExp(
  String.raw`^https://${VERCEL_PROJECT_SLUG}[a-z0-9\-]*\.vercel\.app$`,
  "i"
);

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      "http://localhost:5173",
      "http://localhost:3000",
      "http://127.0.0.1:5173",
      "http://localhost:5174",
    ]
      .filter(Boolean)
      .map((url) => url.replace(/\/$/, ""));

    // Allow requests with no origin (curl, Postman, same-origin server calls)
    if (!origin) return callback(null, true);

    const normalizedOrigin = origin.replace(/\/$/, "");

    // Only allow preview deployments of THIS specific Vercel project
    const isOwnVercelPreview = VERCEL_PREVIEW_PATTERN.test(normalizedOrigin);

    if (allowedOrigins.includes(normalizedOrigin) || isOwnVercelPreview) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from: ${origin}`);
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Admin-Key"],
};

app.use(cors(corsOptions));

// Body parser middleware
// 2 MB global limit — enough for base64 image uploads (~400 KB) with headroom.
// Tighter per-route overrides are applied where smaller inputs are expected.
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// Trust the first hop of the reverse proxy (Render, etc.) so that
// req.ip reflects the real client IP, making rate limiting effective.
app.set("trust proxy", 1);

// Apply general rate limiting to all routes
app.use(generalRateLimiter);

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use("/api/contact", contactRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/ml-log", mlLogRoutes);

// Root route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Portfolio Backend API",
    version: "1.0.0",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Start server
const BASE_PORT = parseInt(process.env.PORT, 10) || 5000;
const MAX_PORT_RETRIES = parseInt(process.env.PORT_RETRIES, 10) || 10;
// Use 127.0.0.1 explicitly in development to avoid IPv6 localhost issues.
const HOST = process.env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1";
let server;

const logServerInfo = (port) => {
  console.log(
    `\nServer running in ${
      process.env.NODE_ENV || "development"
    } mode on port ${port}`
  );
  console.log(`Health check: http://localhost:${port}/health`);
  console.log(`Contact API: http://localhost:${port}/api/contact`);
  if (process.env.FRONTEND_URL) {
    console.log(`Frontend URL: ${process.env.FRONTEND_URL}\n`);
  }
};

const startServer = (port, retriesLeft) => {
  server = app.listen(port, HOST, () => {
    logServerInfo(port);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE" && retriesLeft > 0) {
      const nextPort = port + 1;
      console.warn(`Port ${port} is already in use on ${HOST}. Trying ${nextPort}...`);
      startServer(nextPort, retriesLeft - 1);
      return;
    }

    console.error("Server failed to start:", err.message);
    process.exit(1);
  });
};

startServer(BASE_PORT, MAX_PORT_RETRIES);

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err.message);
  // In development, log and continue rather than killing the server.
  // In production, shut down gracefully so the process manager can restart.
  if (process.env.NODE_ENV === "production") {
    if (server) {
      server.close(() => process.exit(1));
    } else {
      process.exit(1);
    }
  }
});

// Handle SIGTERM
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  if (server) {
    server.close(() => {
      console.log("Process terminated");
    });
  } else {
    console.log("Process terminated");
  }
});

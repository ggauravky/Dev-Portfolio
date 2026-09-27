// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

// Force IPv4-first DNS resolution - fixes Node.js 18+ defaulting to IPv6 (::1),
// which breaks MongoDB Atlas SRV lookups (querySrv ECONNREFUSED) and
// causes EADDRINUSE on ::1 instead of 127.0.0.1.
const dns = require("node:dns");
dns.setDefaultResultOrder("ipv4first");
// Use Google & Cloudflare DNS directly - ISP/system DNS often blocks SRV queries
// needed by MongoDB Atlas (mongodb+srv://) connection strings.
dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const path = require("node:path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const connectDatabase = require("./config/database");
const contactRoutes = require("./routes/contactRoutes");
const newsletterRoutes = require("./routes/newsletterRoutes");
const authRoutes = require("./routes/authRoutes");
const blogSupportRoutes = require("./routes/blogSupportRoutes");
const activityRoutes = require("./routes/activityRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const { generalRateLimiter } = require("./middleware/rateLimiter");
const { logger, requestLogger } = require("./utils/logger");
const { initMonitoring, captureException } = require("./utils/monitoring");
const { buildPublicErrorPayload } = require("./utils/publicError");
const { validateEnvironment } = require("./config/env");
const { corsOrigin } = require("./config/trustedOrigins");
const { getEmailDiagnostics } = require("./utils/email");
const { waitForBackgroundTasks } = require("./utils/backgroundTasks");


const envValidation = validateEnvironment({ strict: true });
for (const warning of envValidation.warnings) {
  logger.warn({ warning }, "Environment validation warning");
}
logger.info({ flags: envValidation.flags }, "Environment configuration validated");
logger.info(getEmailDiagnostics(), "Transactional email configuration");

// Initialize express app
const app = express();
initMonitoring();
app.use(requestLogger);

// Connect to MongoDB
connectDatabase();

// Security middleware
app.use(helmet());
app.use(mongoSanitize());

const corsOptions = {
  origin: corsOrigin,
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Admin-Key", "X-Session-Id"],
};

app.use(cors(corsOptions));

// Body parser middleware
// 2 MB global limit — enough for base64 image uploads (~400 KB) with headroom.
// Tighter per-route overrides are applied where smaller inputs are expected.
app.use(
  express.json({
    limit: "2mb",
    verify: (req, res, buffer) => {
      if (buffer?.length) {
        req.rawBody = Buffer.from(buffer);
      }
    },
  })
);
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(cookieParser());

// Trust the first hop of the reverse proxy (Render, etc.) so that
// req.ip reflects the real client IP, making rate limiting effective.
app.set("trust proxy", 1);

// Apply general rate limiting to all routes
app.use(generalRateLimiter);

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",
    service: "portfolio-backend",
    environment: process.env.NODE_ENV || "development",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use("/api/contact", contactRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/blog", blogSupportRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/payment", paymentRoutes);

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
  const requestId = req.id || req.headers["x-request-id"];
  logger.error({ err, requestId, path: req.originalUrl }, "Unhandled application error");
  captureException(err, {
    requestId,
    method: req.method,
    path: req.originalUrl,
  });

  const publicError = buildPublicErrorPayload(err, {
    production: process.env.NODE_ENV === "production",
    requestId,
  });
  res.status(publicError.status).json(publicError.payload);
});

// Start server
const BASE_PORT = Number.parseInt(process.env.PORT, 10) || 5000;
const MAX_PORT_RETRIES = Number.parseInt(process.env.PORT_RETRIES, 10) || 10;
// Use 127.0.0.1 explicitly in development to avoid IPv6 localhost issues.
const HOST = process.env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1";
let server;
let shutdownInProgress = false;

const logServerInfo = (port) => {
  logger.info(
    {
      mode: process.env.NODE_ENV || "development",
      port,
      host: HOST,
      healthCheck: `http://localhost:${port}/health`,
      contactApi: `http://localhost:${port}/api/contact`,
    },
    "Server started"
  );
  if (process.env.FRONTEND_URL) {
    logger.info({ frontendUrl: process.env.FRONTEND_URL }, "Frontend URL configured");
  }
};

const startServer = (port, retriesLeft) => {
  server = app.listen(port, HOST, () => {
    logServerInfo(port);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE" && retriesLeft > 0) {
      const nextPort = port + 1;
      logger.warn({ port, host: HOST, nextPort }, "Port already in use, retrying");
      startServer(nextPort, retriesLeft - 1);
      return;
    }

    logger.fatal({ err }, "Server failed to start");
    process.exit(1);
  });
};

startServer(BASE_PORT, MAX_PORT_RETRIES);

const gracefulShutdown = async ({ reason = "shutdown", exitCode = 0 } = {}) => {
  if (shutdownInProgress) {
    return;
  }

  shutdownInProgress = true;
  logger.info({ reason }, "Graceful shutdown started");

  const closeServerPromise =
    server && typeof server.close === "function"
      ? new Promise((resolve) => {
          server.close(() => resolve());
        })
      : Promise.resolve();

  try {
    await closeServerPromise;
    await waitForBackgroundTasks({ timeoutMs: 5000 });
  } catch (error) {
    logger.error({ err: error, reason }, "Graceful shutdown encountered an error");
  }

  logger.info({ reason, exitCode }, "Process terminated");
  process.exit(exitCode);
};

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  logger.error({ err }, "Unhandled promise rejection");
  captureException(err, { kind: "unhandledRejection" });
  // In development, log and continue rather than killing the server.
  // In production, shut down gracefully so the process manager can restart.
  if (process.env.NODE_ENV === "production") {
    void gracefulShutdown({ reason: "unhandledRejection", exitCode: 1 });
  }
});

// Handle SIGTERM
process.on("SIGTERM", () => {
  void gracefulShutdown({ reason: "SIGTERM", exitCode: 0 });
});

process.on("SIGINT", () => {
  void gracefulShutdown({ reason: "SIGINT", exitCode: 0 });
});

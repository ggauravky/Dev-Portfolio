// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

const mongoose = require("mongoose");
const { logger } = require("../utils/logger");

const connectDatabase = async (retries = 3) => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 2,
      family: 4, // Force IPv4 — fixes querySrv ECONNREFUSED on many networks
    });

    logger.info(
      {
        host: conn.connection.host,
        database: conn.connection.name,
      },
      "MongoDB connected"
    );

    // Handle connection events
    mongoose.connection.on("error", (err) => {
      logger.error({ err }, "MongoDB connection error");
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected. Attempting to reconnect");
    });

    mongoose.connection.on("reconnected", () => {
      logger.info("MongoDB reconnected successfully");
    });

    return conn;
  } catch (error) {
    logger.error({ err: error }, "MongoDB connection failed");

    if (retries > 0) {
      logger.warn({ retries }, "Retrying MongoDB connection");
      await new Promise((resolve) => setTimeout(resolve, 5000));
      return connectDatabase(retries - 1);
    }

    // ⚠️  Non-fatal: log the failure but do NOT exit.
    // Routes that don't need MongoDB (e.g. /api/chatbot) will keep working.
    logger.warn(
      "MongoDB unavailable. Server will run in limited mode (chat API still works)."
    );
    return null;
  }
};

module.exports = connectDatabase;

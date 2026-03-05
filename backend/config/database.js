// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

const mongoose = require("mongoose");

const connectDatabase = async (retries = 3) => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 2,
      family: 4, // Force IPv4 — fixes querySrv ECONNREFUSED on many networks
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database Name: ${conn.connection.name}`);

    // Handle connection events
    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err.message);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️  MongoDB disconnected. Attempting to reconnect...");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("🔄 MongoDB reconnected successfully");
    });

    return conn;
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);

    if (retries > 0) {
      console.log(`🔄 Retrying connection... (${retries} attempts left)`);
      await new Promise((resolve) => setTimeout(resolve, 5000));
      return connectDatabase(retries - 1);
    }

    // ⚠️  Non-fatal: log the failure but do NOT exit.
    // Routes that don't need MongoDB (e.g. /api/chat) will keep working.
    console.error(
      "⚠️  MongoDB unavailable. Server will run in limited mode (chat API still works)."
    );
    return null;
  }
};

module.exports = connectDatabase;

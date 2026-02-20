const mongoose = require("mongoose");

const chatLogSchema = new mongoose.Schema(
  {
    // ── Core chat data ─────────────────────────────────────────────
    userMessage: {
      type: String,
      required: true,
      trim: true,
      maxLength: 1000,
    },
    aiReply: {
      type: String,
      required: true,
      trim: true,
    },
    source: {
      type: String,
      enum: ["gemini", "fallback"],
      default: "gemini",
    },
    degraded: {
      type: Boolean,
      default: false,
    },
    model: {
      type: String,
      default: "unknown",
    },

    // ── Performance ────────────────────────────────────────────────
    responseTimeMs: {
      type: Number,
      default: null,
    },

    // ── Conversation context ───────────────────────────────────────
    sessionId: {
      type: String,
      default: "unknown",
      index: true,
    },
    messageIndex: {
      type: Number,             // which turn in the session (0-based)
      default: 0,
    },
    historyLength: {
      type: Number,             // how many prior turns were sent
      default: 0,
    },
    messageLength: {
      type: Number,             // character count of user message
      default: 0,
    },
    intentTag: {
      type: String,             // greeting | skills | projects | hiring | education | goals | other
      default: "other",
    },

    // ── Visitor identity ───────────────────────────────────────────
    ipAddress: {
      type: String,
      default: "unknown",
    },
    userAgent: {
      type: String,
      default: "unknown",
    },
    referrer: {
      type: String,
      default: "direct",
    },

    // ── Geo-location (from Vercel headers or IP lookup) ────────────
    country: {
      type: String,
      default: "unknown",
    },
    countryCode: {
      type: String,
      default: "unknown",
    },
    city: {
      type: String,
      default: "unknown",
    },
    region: {
      type: String,
      default: "unknown",
    },
    timezone: {
      type: String,
      default: "unknown",
    },
  },
  {
    timestamps: true,           // createdAt, updatedAt
    collection: "chatlogs",
  }
);

// Useful query indexes
chatLogSchema.index({ createdAt: -1 });
chatLogSchema.index({ ipAddress: 1, createdAt: -1 });
chatLogSchema.index({ country: 1 });
chatLogSchema.index({ intentTag: 1 });

module.exports = mongoose.model("ChatLog", chatLogSchema);

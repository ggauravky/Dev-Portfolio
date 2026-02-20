const mongoose = require("mongoose");

const chatLogSchema = new mongoose.Schema(
  {
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
    ipAddress: {
      type: String,
      default: "unknown",
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

module.exports = mongoose.model("ChatLog", chatLogSchema);

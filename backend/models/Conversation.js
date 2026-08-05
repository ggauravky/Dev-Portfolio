const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    visitorId: {
      type: String,
      default: null,
    },
    sessionId: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "ended"],
      default: "active",
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
      index: true,
    },
    endedAt: {
      type: Date,
      default: null,
    },
    messageCount: {
      type: Number,
      default: 0,
    },
    provider: {
      type: String,
      default: "gemini",
    },
    model: {
      type: String,
      default: "gemini-2.0-flash-lite",
    },
    totalPromptTokens: {
      type: Number,
      default: 0,
    },
    totalCompletionTokens: {
      type: Number,
      default: 0,
    },
    totalTokens: {
      type: Number,
      default: 0,
    },
    averageLatency: {
      type: Number,
      default: 0,
    },
    currentPage: {
      type: String,
      default: "/",
    },
    browser: {
      type: String,
      default: null,
    },
    device: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
    metadata: {
      type: Map,
      of: String,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Conversation || mongoose.model("Conversation", ConversationSchema);

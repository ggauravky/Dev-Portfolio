const mongoose = require("mongoose");

const ChatMessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
      required: true,
      index: true,
    },
    messageIndex: {
      type: Number,
      default: 0,
    },
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
    },
    sources: {
      type: Array,
      default: [],
    },
    confidenceScore: {
      type: Number,
      default: 1.0,
    },
    intent: {
      type: String,
      default: "general",
    },
    latency: {
      type: Number,
      default: 0,
    },
    promptTokens: {
      type: Number,
      default: 0,
    },
    completionTokens: {
      type: Number,
      default: 0,
    },
    totalTokens: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.ChatMessage || mongoose.model("ChatMessage", ChatMessageSchema);

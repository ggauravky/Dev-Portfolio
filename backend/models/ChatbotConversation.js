const mongoose = require("mongoose");
const { RETENTION_SECONDS } = require("../../shared/chatPrivacy.cjs");

const sourceSchema = new mongoose.Schema(
  {
    chunkId: { type: String, trim: true, default: "" },
    section: { type: String, trim: true, default: "" },
    title: { type: String, trim: true, default: "" },
    score: { type: Number, default: 0 },
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    messageId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 64,
    },
    turnId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 64,
    },
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    intent: {
      type: String,
      default: "general",
    },
    provider: {
      type: String,
      default: "system",
    },
    model: {
      type: String,
      default: "unknown",
    },
    degraded: {
      type: Boolean,
      default: false,
    },
    responseTimeMs: {
      type: Number,
      default: null,
    },
    retrievalScore: {
      type: Number,
      default: 0,
    },
    contentLength: {
      type: Number,
      default: 0,
    },
    sources: {
      type: [sourceSchema],
      default: [],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const chatbotConversationSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 128,
      unique: true,
      index: true,
    },
    source: {
      type: String,
      default: "portfolio-chatbot",
    },
    client: {
      ipHash: { type: String, default: "unknown", index: true },
      userAgentHash: { type: String, default: "unknown" },
      countryCode: { type: String, default: "unknown" },
      referrer: { type: String, default: "direct" },
    },
    messages: {
      type: [messageSchema],
      default: [],
    },
    stats: {
      totalMessages: { type: Number, default: 0 },
      totalTurns: { type: Number, default: 0 },
      userMessages: { type: Number, default: 0 },
      assistantMessages: { type: Number, default: 0 },
      lastIntent: { type: String, default: "general" },
      lastProvider: { type: String, default: "system" },
      lastModel: { type: String, default: "unknown" },
      lastTurnId: { type: String, default: "" },
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: "chatbot_conversations",
  }
);

chatbotConversationSchema.index({ lastActivityAt: 1 }, { expireAfterSeconds: RETENTION_SECONDS });
chatbotConversationSchema.index({ "stats.lastIntent": 1, lastActivityAt: -1 });

module.exports = mongoose.model("ChatbotConversation", chatbotConversationSchema);

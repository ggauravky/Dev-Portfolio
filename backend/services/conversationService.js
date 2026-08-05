const mongoose = require("mongoose");
const Conversation = require("../models/Conversation");
const ChatMessage = require("../models/ChatMessage");

/**
 * Enterprise Production Conversation Persistence Service.
 * Provides async non-blocking MongoDB persistence for conversations and messages.
 */
class ConversationService {
  isDbConnected() {
    return mongoose.connection && mongoose.connection.readyState === 1;
  }

  /**
   * Get existing active conversation or create new conversation document.
   */
  async getOrCreateConversation(conversationId, metadata = {}) {
    if (!conversationId || !this.isDbConnected()) return null;

    try {
      let conv = await Conversation.findOne({ conversationId });
      if (!conv) {
        conv = await Conversation.create({
          conversationId,
          visitorId: metadata.visitorId || `vis_${Math.random().toString(36).slice(2, 9)}`,
          sessionId: metadata.sessionId || `sess_${Math.random().toString(36).slice(2, 9)}`,
          currentPage: metadata.currentPage || "/",
          userAgent: metadata.userAgent || null,
          browser: metadata.browser || null,
          device: metadata.device || null,
          status: "active",
        });
      }
      return conv;
    } catch (err) {
      console.warn("[ConversationService] getOrCreateConversation error:", err.message);
      return null;
    }
  }

  /**
   * Async Non-Blocking Save User Message.
   */
  async saveUserMessage(conversationId, text, intent = "general", metadata = {}) {
    if (!conversationId || !text || !this.isDbConnected()) return null;

    try {
      const conv = await this.getOrCreateConversation(conversationId, metadata);
      const nextIndex = conv ? (conv.messageCount || 0) + 1 : 1;

      const userMsg = await ChatMessage.create({
        conversationId,
        messageIndex: nextIndex,
        role: "user",
        content: String(text).trim(),
        intent,
      });

      if (conv) {
        conv.messageCount = nextIndex;
        conv.lastActivity = new Date();
        await conv.save();
      }

      return userMsg;
    } catch (err) {
      console.warn("[ConversationService] saveUserMessage error:", err.message);
      return null;
    }
  }

  /**
   * Async Non-Blocking Save Assistant Response.
   */
  async saveAssistantMessage(conversationId, reply, sources = [], confidenceScore = 1.0, intent = "general", latencyMs = 0, usage = {}, provider = "gemini", model = "gemini-2.0-flash-lite") {
    if (!conversationId || !reply || !this.isDbConnected()) return null;

    try {
      const conv = await Conversation.findOne({ conversationId });
      const nextIndex = conv ? (conv.messageCount || 0) + 1 : 1;

      const assistantMsg = await ChatMessage.create({
        conversationId,
        messageIndex: nextIndex,
        role: "assistant",
        content: String(reply).trim(),
        sources,
        confidenceScore,
        intent,
        latency: latencyMs,
        promptTokens: usage.promptTokens || 0,
        completionTokens: usage.completionTokens || 0,
        totalTokens: usage.totalTokens || 0,
      });

      if (conv) {
        conv.messageCount = nextIndex;
        conv.lastActivity = new Date();
        conv.provider = provider;
        conv.model = model;
        conv.totalPromptTokens = (conv.totalPromptTokens || 0) + (usage.promptTokens || 0);
        conv.totalCompletionTokens = (conv.totalCompletionTokens || 0) + (usage.completionTokens || 0);
        conv.totalTokens = (conv.totalTokens || 0) + (usage.totalTokens || 0);

        const currentAvg = conv.averageLatency || 0;
        conv.averageLatency = currentAvg > 0 ? Math.round((currentAvg + latencyMs) / 2) : latencyMs;

        await conv.save();
      }

      return assistantMsg;
    } catch (err) {
      console.warn("[ConversationService] saveAssistantMessage error:", err.message);
      return null;
    }
  }

  /**
   * Retrieve full conversation message history for replay.
   */
  async getConversationHistory(conversationId) {
    if (!conversationId || !this.isDbConnected()) return [];

    try {
      const messages = await ChatMessage.find({ conversationId }).sort({ createdAt: 1 }).lean();
      return messages;
    } catch (err) {
      console.warn("[ConversationService] getConversationHistory error:", err.message);
      return [];
    }
  }

  /**
   * Mark conversation status as ended.
   */
  async endConversation(conversationId) {
    if (!conversationId || !this.isDbConnected()) return null;

    try {
      const conv = await Conversation.findOneAndUpdate(
        { conversationId },
        { status: "ended", endedAt: new Date() },
        { new: true }
      );
      return conv;
    } catch (err) {
      console.warn("[ConversationService] endConversation error:", err.message);
      return null;
    }
  }
}

const conversationService = new ConversationService();

module.exports = {
  conversationService,
  ConversationService,
};

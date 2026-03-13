// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

const { GoogleGenerativeAI } = require("@google/generative-ai");
const mongoose = require("mongoose");
const ChatLog = require("../models/ChatLog");
const {
  buildRelevantContext,
  buildSystemPrompt,
  buildFallbackReply,
  detectIntent,
  buildChatLogShape,
} = require("../../shared/chatCore.cjs");
const {
  buildPrivacySafeMeta,
  getRetentionPolicy,
} = require("../../shared/chatPrivacy.cjs");
const { logger } = require("../utils/logger");

const SUPPORTED_MODELS = new Set([
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-pro",
]);

const requestedModel = process.env.GEMINI_MODEL || "gemini-2.0-flash";
const GEMINI_MODEL = SUPPORTED_MODELS.has(requestedModel)
  ? requestedModel
  : "gemini-2.0-flash";

if (!SUPPORTED_MODELS.has(requestedModel)) {
  logger.warn(
    { requestedModel, fallbackModel: GEMINI_MODEL },
    "Invalid GEMINI_MODEL configured; falling back"
  );
}

const toLower = (value) => String(value || "").toLowerCase();
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isGeminiRateLimitError = (error) => {
  const message = toLower(error?.message);
  return (
    message.includes("429") ||
    message.includes("quota") ||
    message.includes("rate limit") ||
    message.includes("resource exhausted")
  );
};

const isGeminiAuthError = (error) => {
  const message = toLower(error?.message);
  return message.includes("api_key_invalid") || message.includes("401");
};

const isGeminiTimeoutError = (error) => {
  const message = toLower(error?.message);
  return message.includes("timeout");
};

const lookupGeo = async (ip) => {
  const blank = {
    country: "unknown",
    countryCode: "unknown",
    city: "unknown",
    region: "unknown",
    timezone: "unknown",
  };

  if (!ip || ip === "unknown" || ip === "127.0.0.1" || ip === "::1") {
    return blank;
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 1500);
    const res = await fetch(`https://ipapi.co/${ip}/json/`, {
      signal: controller.signal,
      headers: { "User-Agent": "portfolio-chatbot/1.0" },
    });
    clearTimeout(timer);

    if (!res.ok) return blank;

    const data = await res.json();
    return {
      country: data.country_name || "unknown",
      countryCode: data.country_code || "unknown",
      city: data.city || "unknown",
      region: data.region || "unknown",
      timezone: data.timezone || "unknown",
    };
  } catch {
    return blank;
  }
};

const sendMessageWithRetry = async (chat, message, maxRetries = 2) => {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      return await chat.sendMessage(message);
    } catch (error) {
      lastError = error;
      if (!isGeminiRateLimitError(error) || attempt === maxRetries) {
        throw error;
      }
      const backoffMs = 700 * Math.pow(2, attempt);
      await sleep(backoffMs);
    }
  }

  throw lastError;
};

const saveChatLog = async (userMessage, aiReply, meta, reqLogger) => {
  try {
    if (mongoose.connection.readyState !== 1) return;

    const geo = await lookupGeo(meta.ipAddress);
    const base = buildChatLogShape({
      source: meta.source,
      degraded: meta.degraded,
      model: meta.model,
      responseTimeMs: meta.responseTimeMs,
      sessionId: meta.sessionId,
      messageIndex: meta.messageIndex,
      historyLength: meta.historyLength,
      messageLength: meta.messageLength,
      intentTag: meta.intentTag,
      referrer: meta.referrer,
      ...geo,
    });

    const privacySafe = buildPrivacySafeMeta({
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      ...geo,
    });

    await ChatLog.create({
      userMessage: String(userMessage).slice(0, 1000),
      aiReply: String(aiReply).slice(0, 5000),
      ...base,
      ...privacySafe,
    });
  } catch (error) {
    reqLogger.warn({ err: error }, "ChatLog save failed (non-fatal)");
  }
};

/**
 * @desc    Chat with AI about Gaurav
 * @route   POST /api/chat
 * @access  Public
 */
exports.chat = async (req, res) => {
  const reqLogger = req.log || logger;
  const message = req.body?.message;
  const clientIp = (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "unknown"
  ).replace(/^::ffff:/, "");
  const userAgent = String(req.headers["user-agent"] || "unknown").slice(0, 300);
  const referrer = String(
    req.headers["referer"] || req.headers["referrer"] || "direct"
  ).slice(0, 300);
  const sessionId = String(
    req.headers["x-session-id"] || req.body?.sessionId || "unknown"
  ).slice(0, 64);
  const msgIndex = Number.parseInt(req.body?.messageIndex, 10) || 0;
  const historyLen = Array.isArray(req.body?.history) ? req.body.history.length : 0;
  const startTime = Date.now();

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return res.status(400).json({
      success: false,
      reply: "Please provide a valid message.",
    });
  }

  const trimmedMessage = message.trim().slice(0, 1000);

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      reqLogger.error("GEMINI_API_KEY is not set");
      return res.status(500).json({
        success: false,
        reply: "The chatbot is temporarily unavailable. Please contact Gaurav directly.",
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    const contextJson = buildRelevantContext(trimmedMessage);
    const systemPrompt = buildSystemPrompt(contextJson);

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemPrompt }],
        },
        {
          role: "model",
          parts: [{ text: "Understood. I will answer using only the provided context." }],
        },
      ],
      generationConfig: {
        maxOutputTokens: 350,
        temperature: 0.3,
      },
    });

    const timeoutMs = 20000;
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Gemini API timeout")), timeoutMs)
    );

    const geminiPromise = sendMessageWithRetry(chat, trimmedMessage, 2);
    const result = await Promise.race([geminiPromise, timeoutPromise]);
    const reply = result?.response?.text?.();

    if (!reply || reply.trim().length === 0) {
      return res.status(500).json({
        success: false,
        reply: "I couldn't generate a response. Please try again.",
      });
    }

    const trimmedReply = reply.trim();
    const responseTimeMs = Date.now() - startTime;

    await saveChatLog(
      trimmedMessage,
      trimmedReply,
      {
        source: "gemini",
        degraded: false,
        model: GEMINI_MODEL,
        responseTimeMs,
        sessionId,
        messageIndex: msgIndex,
        historyLength: historyLen,
        messageLength: trimmedMessage.length,
        intentTag: detectIntent(trimmedMessage),
        ipAddress: clientIp,
        userAgent,
        referrer,
      },
      reqLogger
    );

    return res.status(200).json({
      success: true,
      reply: trimmedReply,
    });
  } catch (error) {
    reqLogger.error({ err: error }, "Chat controller error");

    if (isGeminiTimeoutError(error)) {
      return res.status(504).json({
        success: false,
        reply: "The response took too long. Please try again.",
      });
    }

    if (isGeminiAuthError(error)) {
      return res.status(401).json({
        success: false,
        reply: "Chatbot configuration error. Please contact Gaurav directly.",
      });
    }

    if (isGeminiRateLimitError(error)) {
      const fallbackReply = buildFallbackReply(trimmedMessage);
      await saveChatLog(
        trimmedMessage,
        fallbackReply,
        {
          source: "fallback",
          degraded: true,
          model: GEMINI_MODEL,
          responseTimeMs: Date.now() - startTime,
          sessionId,
          messageIndex: msgIndex,
          historyLength: historyLen,
          messageLength: trimmedMessage.length,
          intentTag: detectIntent(trimmedMessage),
          ipAddress: clientIp,
          userAgent,
          referrer,
        },
        reqLogger
      );

      return res.status(200).json({
        success: true,
        degraded: true,
        reply: fallbackReply,
      });
    }

    return res.status(500).json({
      success: false,
      reply: "Something went wrong. Please try again or contact Gaurav directly.",
    });
  }
};

/**
 * @desc    Chat analytics privacy and retention policy
 * @route   GET /api/chat/privacy-policy
 * @access  Public
 */
exports.chatPrivacyPolicy = (req, res) => {
  res.status(200).json({
    success: true,
    policy: getRetentionPolicy(),
  });
};

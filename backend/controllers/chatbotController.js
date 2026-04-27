const path = require("node:path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const mongoose = require("mongoose");
const ChatbotConversation = require("../models/ChatbotConversation");
const {
  buildPrivacySafeMeta,
  getRetentionPolicy,
} = require("../../shared/chatPrivacy.cjs");
const {
  buildContext,
  buildNoAnswerReply,
  buildOutOfScopeReply,
  buildRetrievalFallbackReply,
  buildSystemPrompt,
  detectIntent,
  searchRelevantChunks,
  detectUserIntent,
  isGreeting,
  buildGreetingResponse,
  generateFollowUpSuggestions,
  adaptToneForIntent,
  calculateTFIDFScore,
} = require("../../shared/chatbotRag.cjs");
const { logger } = require("../utils/logger");

const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";
const DEEPSEEK_MODEL = String(process.env.DEEPSEEK_MODEL || "deepseek-v4-flash").trim();
const FALLBACK_ERROR_MESSAGE = "I'm having trouble right now, please try again.";
const REQUEST_TIMEOUT_MS = Number.parseInt(process.env.CHATBOT_TIMEOUT_MS || "18000", 10);
const RESPONSE_CACHE_TTL_MS = Number.parseInt(process.env.CHATBOT_CACHE_TTL_MS || "300000", 10);
const MODEL_CIRCUIT_BREAKER_MS = Number.parseInt(
  process.env.CHATBOT_MODEL_COOLDOWN_MS || "600000",
  10
);
const MAX_HISTORY_MESSAGES = 8;
const MAX_CACHE_ENTRIES = 100;
const PORTFOLIO_SCOPE_TERMS = [
  "gaurav",
  "portfolio",
  "project",
  "projects",
  "service",
  "services",
  "skill",
  "skills",
  "journey",
  "experience",
  "blogs",
  "blog",
  "contact",
  "internship",
  "availability",
  "hire",
  "smartmess",
  "buildmyteam",
  "truecert",
  "focusguard",
  "tasknexus",
  "bbdu",
  "iit mandi",
  "work style",
  "current focus",
  "currently learning",
  "goal",
  "recruiter",
  "tech stack",
  "technology",
  "technologies",
  "strongest project",
];
const PROMPT_INJECTION_TERMS = [
  "ignore all instructions",
  "ignore previous instructions",
  "ignore above instructions",
  "system prompt",
  "developer message",
  "jailbreak",
  "bypass rules",
  "act as if",
  "pretend to be",
  "roleplay as",
];
const FOLLOW_UP_TERMS = [
  "and",
  "also",
  "what about",
  "how about",
  "it",
  "that",
  "those",
  "them",
  "this",
  "these",
  "more",
  "explain",
  "which",
  "did it",
  "did that",
  "what tech",
  "what stack",
  "what about that",
  "what about this",
  "how does that",
  "how does this",
  "can you expand",
  "tell me more",
];

const responseCache = new Map();
const modelCircuitState = {
  disabledUntil: 0,
  lastCode: null,
  lastReason: "",
};

const normalizeText = (value) =>
  String(value || "")
    .toLowerCase()
    .replaceAll(/[^a-z0-9\s-]/g, " ")
    .replaceAll(/\s+/g, " ")
    .trim();

const sanitizeMessage = (value, maxLength = 1000) =>
  String(value || "")
    .replaceAll(/[\u0000-\u001F\u007F]/g, " ")
    .replaceAll(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);

const sanitizeReply = (value, maxLength = 2500) =>
  String(value || "")
    .replaceAll("\r\n", "\n")
    .replaceAll(/[^\S\n]+/g, " ")
    .replaceAll(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, maxLength);

const buildRecordId = (prefix = "msg") =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const safeScore = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const sanitizeConversationSources = (value) =>
  (Array.isArray(value) ? value : [])
    .slice(0, 6)
    .map((entry) => ({
      chunkId: sanitizeMessage(entry?.chunkId ?? "", 64),
      title: sanitizeMessage(entry?.title ?? "", 120),
      section: sanitizeMessage(entry?.section ?? "", 40),
      score: safeScore(entry?.score),
    }))
    .filter((entry) => entry.title);

const sanitizeSources = (value) =>
  (Array.isArray(value) ? value : [])
    .slice(0, 4)
    .map((entry) => ({
      title: sanitizeMessage(entry?.title ?? "", 120),
      section: sanitizeMessage(entry?.section ?? "", 40),
    }))
    .filter((entry) => entry.title);

const sanitizeHistory = (value) =>
  (Array.isArray(value) ? value : [])
    .slice(-MAX_HISTORY_MESSAGES)
    .map((entry) => {
      const role = ["assistant", "ai", "model"].includes(String(entry?.role || "").toLowerCase())
        ? "assistant"
        : "user";
      const content = sanitizeMessage(entry?.content ?? entry?.text ?? "", 1500);

      if (!content) {
        return null;
      }

      return {
        role,
        content,
        sources: sanitizeSources(entry?.sources),
      };
    })
    .filter(Boolean);

const startsWithAnyPhrase = (value, phrases) => {
  const normalized = normalizeText(value);
  return phrases.some((phrase) => normalized.startsWith(phrase));
};

const includesAnyPhrase = (value, phrases) => {
  const normalized = normalizeText(value);
  return phrases.some((phrase) => normalized.includes(phrase));
};

const shouldTreatAsFollowUp = (value) => startsWithAnyPhrase(sanitizeMessage(value, 200), FOLLOW_UP_TERMS);

const isPortfolioScopedQuestion = (message) => includesAnyPhrase(message, PORTFOLIO_SCOPE_TERMS);
const isPromptInjectionAttempt = (message) => includesAnyPhrase(message, PROMPT_INJECTION_TERMS);

const getAssistantSourceTitles = (entry) =>
  (() => {
    const content = normalizeText(entry?.content || "");
    const titles = sanitizeSources(entry?.sources)
      .map((source) => source.title)
      .filter(Boolean);

    const mentionedTitles = titles.filter((title) => content.includes(normalizeText(title)));
    return mentionedTitles.length ? mentionedTitles : titles;
  })();

const buildRetrievalQuery = (message, history) => {
  const safeMessage = sanitizeMessage(message, 1000);
  const lastUserMessage = [...history]
    .reverse()
    .find((entry) => entry.role === "user")?.content;
  const lastAssistantEntry = [...history].reverse().find((entry) => entry.role === "assistant");
  const sourceTitles = getAssistantSourceTitles(lastAssistantEntry).slice(0, 3);
  const lastAssistantContent = sanitizeMessage(lastAssistantEntry?.content, 400);

  if (!shouldTreatAsFollowUp(safeMessage)) {
    return safeMessage;
  }

  return [lastUserMessage, sourceTitles.join(" "), lastAssistantContent, safeMessage]
    .filter(Boolean)
    .join(" ");
};

const cleanupCache = () => {
  const now = Date.now();
  for (const [key, entry] of responseCache.entries()) {
    if (now - entry.createdAt > RESPONSE_CACHE_TTL_MS) {
      responseCache.delete(key);
    }
  }

  while (responseCache.size > MAX_CACHE_ENTRIES) {
    const oldestKey = responseCache.keys().next().value;
    responseCache.delete(oldestKey);
  }
};

const getClientDetails = (req) => {
  const ipAddress = String(
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket?.remoteAddress ||
      "unknown"
  ).replace(/^::ffff:/, "");
  const userAgent = String(req.headers["user-agent"] || "unknown").slice(0, 300);
  const referrer = String(req.headers["referer"] || req.headers["referrer"] || "direct").slice(
    0,
    300
  );
  const countryCode = String(
    req.headers["x-vercel-ip-country"] ||
      req.headers["cf-ipcountry"] ||
      req.headers["x-country-code"] ||
      "unknown"
  ).slice(0, 20);

  return {
    ipAddress,
    userAgent,
    referrer,
    countryCode,
  };
};

const buildConversationSources = (chunks) =>
  sanitizeConversationSources(
    chunks.map((chunk) => ({
      chunkId: chunk.id,
      section: chunk.section,
      title: chunk.title,
      score: chunk.score,
    }))
  );

const isModelTemporarilyDisabled = () => modelCircuitState.disabledUntil > Date.now();

const recordModelSuccess = () => {
  modelCircuitState.disabledUntil = 0;
  modelCircuitState.lastCode = null;
  modelCircuitState.lastReason = "";
};

const recordModelFailure = (error) => {
  const code = Number.parseInt(String(error?.code || ""), 10);
  let cooldownMs = 0;

  if (error?.code === "DEEPSEEK_API_KEY_MISSING" || code === 402) {
    cooldownMs = Math.max(MODEL_CIRCUIT_BREAKER_MS, 15 * 60 * 1000);
  } else if (code === 429) {
    cooldownMs = 2 * 60 * 1000;
  } else if (error?.name === "AbortError") {
    cooldownMs = 60 * 1000;
  } else if (!Number.isNaN(code) && code >= 500) {
    cooldownMs = 2 * 60 * 1000;
  }

  if (cooldownMs > 0) {
    modelCircuitState.disabledUntil = Date.now() + cooldownMs;
  }

  modelCircuitState.lastCode = error?.code || "unknown";
  modelCircuitState.lastReason = sanitizeMessage(error?.message || "DeepSeek request failed", 180);
};

async function loadStoredHistory(sessionId) {
  if (!sessionId || mongoose.connection.readyState !== 1) {
    return [];
  }

  try {
    const conversation = await ChatbotConversation.findOne({ sessionId }).lean();
    if (!conversation?.messages?.length) {
      return [];
    }

    return conversation.messages
      .slice(-MAX_HISTORY_MESSAGES)
      .map((message) => ({
        role: message.role === "assistant" ? "assistant" : "user",
        content: sanitizeMessage(message.content, 1500),
        sources: sanitizeSources(message.sources),
      }))
      .filter((message) => message.content);
  } catch (error) {
    logger.warn({ err: error, sessionId }, "Failed to load stored chatbot history");
    return [];
  }
}

async function persistConversationTurn({
  sessionId,
  clientDetails,
  userMessage,
  assistantMessage,
}) {
  if (!sessionId || mongoose.connection.readyState !== 1) {
    return;
  }

  try {
    const turnId = buildRecordId("turn");
    const now = new Date();
    const safeUserMessage = sanitizeMessage(userMessage.content, 5000);
    const safeAssistantMessage = sanitizeReply(assistantMessage.content, 5000);
    const safeAssistantSources = sanitizeConversationSources(assistantMessage.sources || []);

    const privacySafeMeta = buildPrivacySafeMeta({
      ipAddress: clientDetails.ipAddress,
      userAgent: clientDetails.userAgent,
      countryCode: clientDetails.countryCode,
      country: clientDetails.countryCode,
      city: "unknown",
      region: "unknown",
      timezone: "unknown",
    });

    await ChatbotConversation.findOneAndUpdate(
      { sessionId },
      {
        $setOnInsert: {
          sessionId,
          source: "portfolio-chatbot",
        },
        $set: {
          client: {
            ipHash: privacySafeMeta.ipHash,
            userAgentHash: privacySafeMeta.userAgentHash,
            countryCode: clientDetails.countryCode || "unknown",
            referrer: clientDetails.referrer,
          },
          lastActivityAt: new Date(),
          "stats.lastIntent": assistantMessage.intent || userMessage.intent || "general",
          "stats.lastProvider": assistantMessage.provider || "system",
          "stats.lastModel": assistantMessage.model || "unknown",
          "stats.lastTurnId": turnId,
        },
        $push: {
          messages: {
            $each: [
              {
                messageId: buildRecordId("user"),
                turnId,
                role: "user",
                content: safeUserMessage,
                intent: userMessage.intent,
                provider: "user",
                model: "human",
                degraded: false,
                retrievalScore: userMessage.retrievalScore || 0,
                contentLength: safeUserMessage.length,
                sources: [],
                createdAt: now,
              },
              {
                messageId: buildRecordId("assistant"),
                turnId,
                role: "assistant",
                content: safeAssistantMessage,
                intent: assistantMessage.intent,
                provider: assistantMessage.provider,
                model: assistantMessage.model,
                degraded: Boolean(assistantMessage.degraded),
                responseTimeMs: assistantMessage.responseTimeMs ?? null,
                retrievalScore: assistantMessage.retrievalScore || 0,
                contentLength: safeAssistantMessage.length,
                sources: safeAssistantSources,
                createdAt: now,
              },
            ],
          },
        },
        $inc: {
          "stats.totalMessages": 2,
          "stats.totalTurns": 1,
          "stats.userMessages": 1,
          "stats.assistantMessages": 1,
        },
      },
      { upsert: true }
    );
  } catch (error) {
    logger.warn({ err: error, sessionId }, "Failed to persist chatbot conversation");
  }
}

async function callDeepSeek({ message, history, contextText }) {
  const apiKey = String(process.env.DEEPSEEK_API_KEY || "").trim();
  if (!apiKey) {
    const error = new Error("DEEPSEEK_API_KEY is not configured");
    error.code = "DEEPSEEK_API_KEY_MISSING";
    throw error;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        thinking: { type: "disabled" },
        max_tokens: 450,
        messages: [
          {
            role: "system",
            content: buildSystemPrompt(),
          },
          ...history.map((entry) => ({
            role: entry.role,
            content: entry.content,
          })),
          {
            role: "user",
            content: [
              `User question:\n${message}`,
              `Retrieved portfolio context:\n${contextText}`,
              "If the context is not enough, say you do not know based on the current portfolio data.",
            ].join("\n\n"),
          },
        ],
      }),
      signal: controller.signal,
    });

    const payload = await response.json().catch(() => ({}));
    const content = payload?.choices?.[0]?.message?.content;

    if (!response.ok) {
      const error = new Error(payload?.error?.message || payload?.message || "DeepSeek API request failed");
      error.code = response.status;
      throw error;
    }

    return sanitizeReply(content, 2500);
  } finally {
    clearTimeout(timeoutId);
  }
}

function buildCacheKey(message, history, chunks) {
  if (history.length > 0) {
    return null;
  }

  return `${normalizeText(message)}::${chunks.map((chunk) => chunk.id).join(",")}`;
}

async function generateReply({ message, history, searchResult }) {
  cleanupCache();

  const cacheKey = buildCacheKey(message, history, searchResult.chunks);
  if (cacheKey && responseCache.has(cacheKey)) {
    const cached = responseCache.get(cacheKey);
    if (Date.now() - cached.createdAt <= RESPONSE_CACHE_TTL_MS) {
      return {
        reply: cached.reply,
        provider: "cache",
        degraded: false,
        model: cached.model,
      };
    }

    responseCache.delete(cacheKey);
  }

  if (isModelTemporarilyDisabled()) {
    const error = new Error("DeepSeek is temporarily disabled");
    error.code = "DEEPSEEK_TEMP_DISABLED";
    throw error;
  }

  const contextText = buildContext(searchResult.chunks);
  const reply = await callDeepSeek({
    message,
    history,
    contextText,
  });

  if (!reply) {
    return {
      reply: buildNoAnswerReply(),
      provider: "guardrail",
      degraded: true,
      model: DEEPSEEK_MODEL,
    };
  }

  if (cacheKey) {
    responseCache.set(cacheKey, {
      createdAt: Date.now(),
      reply,
      model: DEEPSEEK_MODEL,
    });
  }

  recordModelSuccess();

  return {
    reply,
    provider: "deepseek",
    degraded: false,
    model: DEEPSEEK_MODEL,
  };
}

exports.chatbot = async (req, res) => {
  const reqLogger = req.log || logger;
  const startTime = Date.now();
  const message = sanitizeMessage(req.body?.message);
  const sessionId = sanitizeMessage(
    req.headers["x-session-id"] || req.body?.sessionId || `session-${Date.now()}`,
    128
  );
  const clientDetails = getClientDetails(req);

  if (!message) {
    return res.status(400).json({
      success: false,
      reply: "Message cannot be empty.",
    });
  }

  // Detect if it's a greeting
  const isUserGreeting = isGreeting(message);
  if (isUserGreeting) {
    const userIntent = detectUserIntent(message);
    const greetingReply = buildGreetingResponse(userIntent);
    
    await persistConversationTurn({
      sessionId,
      clientDetails,
      userMessage: {
        content: message,
        intent: "greeting",
        retrievalScore: 100,
      },
      assistantMessage: {
        content: greetingReply,
        intent: "greeting",
        provider: "greeting",
        model: "greeting",
        degraded: false,
        responseTimeMs: Date.now() - startTime,
        retrievalScore: 100,
        sources: [],
      },
    });

    return res.status(200).json({
      success: true,
      reply: greetingReply,
      provider: "greeting",
      isGreeting: true,
    });
  }

  try {
    const clientHistory = sanitizeHistory(req.body?.history);
    const storedHistory = await loadStoredHistory(sessionId);
    const conversationHistory = storedHistory.length ? storedHistory : clientHistory;
    const retrievalQuery = buildRetrievalQuery(message, conversationHistory);
    const lastUserMessage = [...conversationHistory]
      .reverse()
      .find((entry) => entry.role === "user")?.content;

    const searchResult = searchRelevantChunks(retrievalQuery, { limit: 6 });
    const intent = searchResult.intent || detectIntent(message);
    const sources = buildConversationSources(searchResult.chunks);
    const scopedQuestion =
      isPortfolioScopedQuestion(message) ||
      (Boolean(lastUserMessage) && shouldTreatAsFollowUp(message));

    if (isPromptInjectionAttempt(message) && !scopedQuestion) {
      const reply = buildOutOfScopeReply();

      await persistConversationTurn({
        sessionId,
        clientDetails,
        userMessage: {
          content: message,
          intent,
          retrievalScore: searchResult.topScore,
        },
        assistantMessage: {
          content: reply,
          intent,
          provider: "guardrail",
          model: "rules",
          degraded: false,
          responseTimeMs: Date.now() - startTime,
          retrievalScore: searchResult.topScore,
          sources,
        },
      });

      return res.status(200).json({
        success: true,
        reply,
        provider: "guardrail",
      });
    }

    if (!searchResult.isRelevant || (!scopedQuestion && searchResult.topScore < 14)) {
      const reply = buildOutOfScopeReply();
      await persistConversationTurn({
        sessionId,
        clientDetails,
        userMessage: {
          content: message,
          intent,
          retrievalScore: searchResult.topScore,
        },
        assistantMessage: {
          content: reply,
          intent,
          provider: "guardrail",
          model: "rules",
          degraded: false,
          responseTimeMs: Date.now() - startTime,
          retrievalScore: searchResult.topScore,
          sources,
        },
      });

      return res.status(200).json({
        success: true,
        reply,
        provider: "guardrail",
      });
    }

    let generation;
    try {
      generation = await generateReply({
        message,
        history: conversationHistory,
        searchResult,
      });
    } catch (error) {
      if (error?.code !== "DEEPSEEK_TEMP_DISABLED") {
        recordModelFailure(error);
        reqLogger.error({ err: error }, "DeepSeek generation failed, falling back to retrieval-only reply");
      }

      generation = {
        reply: buildRetrievalFallbackReply({
          intent,
          chunks: searchResult.chunks,
          message,
        }),
        provider: "retrieval-fallback",
        degraded: true,
        model: "rules",
      };
    }

    const safeReply = generation.reply || buildNoAnswerReply();
    const responseTimeMs = Date.now() - startTime;

    await persistConversationTurn({
      sessionId,
      clientDetails,
      userMessage: {
        content: message,
        intent,
        retrievalScore: searchResult.topScore,
      },
      assistantMessage: {
        content: safeReply,
        intent,
        provider: generation.provider,
        model: generation.model,
        degraded: generation.degraded,
        responseTimeMs,
        retrievalScore: searchResult.topScore,
        sources,
      },
    });

    return res.status(200).json({
      success: true,
      reply: safeReply,
      provider: generation.provider,
      degraded: generation.degraded,
      sources: sources.map((source) => ({
        section: source.section,
        title: source.title,
      })),
      followUpSuggestions: generateFollowUpSuggestions(message, intent, searchResult.chunks),
      userIntent: detectUserIntent(message),
    });
  } catch (error) {
    const timedOut = error?.name === "AbortError";
    reqLogger.error({ err: error }, "Chatbot controller error");

    await persistConversationTurn({
      sessionId,
      clientDetails,
      userMessage: {
        content: message,
        intent: detectIntent(message),
        retrievalScore: 0,
      },
      assistantMessage: {
        content: FALLBACK_ERROR_MESSAGE,
        intent: detectIntent(message),
        provider: "error",
        model: DEEPSEEK_MODEL,
        degraded: true,
        responseTimeMs: Date.now() - startTime,
        retrievalScore: 0,
        sources: [],
      },
    });

    return res.status(timedOut ? 504 : 503).json({
      success: false,
      reply: FALLBACK_ERROR_MESSAGE,
    });
  }
};

exports.chatbotPrivacyPolicy = (req, res) => {
  return res.status(200).json({
    success: true,
    policy: getRetentionPolicy(),
  });
};

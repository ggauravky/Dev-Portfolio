// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

const path = require("node:path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const mongoose = require("mongoose");
const ChatbotConversation = require("../models/ChatbotConversation");
const {
  buildPrivacySafeMeta,
  getRetentionPolicy,
} = require("../../shared/chatPrivacy.cjs");
const { logger } = require("../utils/logger");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const GEMINI_API_KEY = String(process.env.GEMINI_API_KEY || "").trim();
const GEMINI_MODEL = String(process.env.GEMINI_MODEL || "gemini-2.0-flash-lite").trim();

const CHATBOT_PROVIDER = String(process.env.CHATBOT_PROVIDER || "gemini").trim().toLowerCase();
const GROQ_API_KEY = String(process.env.GROQ_API_KEY || "").trim();
const GROQ_MODEL = String(process.env.GROQ_MODEL || "llama-3.1-8b-instant").trim();
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const FALLBACK_ERROR_MESSAGE = "I'm having trouble right now, please try again.";
const MAX_HISTORY_MESSAGES = 10;
const REQUEST_TIMEOUT_MS = Number.parseInt(process.env.CHATBOT_TIMEOUT_MS || "20000", 10);

const SYSTEM_PROMPT = `You are the advanced, custom AI assistant integrated directly into Gaurav Kumar Yadav's personal portfolio.

CORE RULES:
1. IDENTITY: Your name is Gaurav's AI Assistant. You represent Gaurav, a 2nd-year Bachelor of Computer Applications (BCA) student at Babu Banarasi Das University (BBDU), Lucknow, who is an AI/ML & Web Developer.
2. KNOWLEDGE DOMAINS & ANSWERING STRATEGY:
   - A. GAURAV'S PORTFOLIO: If asked about Gaurav, his skills (React, Python, Tailwind, SQL, Data Science), his projects (TaskNexus, SmartMess, BuildMyTeam, Real-Time Chat App, AIReel Studio, TrueCert, FocusGuard), his education, or availability, answer using his official profile data below with high confidence and professional pride.
   - B. GENERAL CODING & TECH: If a user asks you to write code, debug a function, explain a programming concept (like recursion or APIs), or solve a technical problem, act as an expert senior developer and provide clean, beautifully formatted markdown code blocks.
   - C. SMALL TALK & CONTACT INFO: Handle "Hi", "Hello", and casual conversation flawlessly. If asked for contact details, provide his email (kumar.gaurav.yadav2007@gmail.com), LinkedIn (https://linkedin.com/in/ggauravky), GitHub (https://github.com/ggauravky), and mobile number (+91 8542036499) clearly.
   - D. IRRELEVANT TOPICS: If a user asks completely non-technical, unprofessional, or highly controversial questions (e.g., political opinions, recipes, gossip), politely say: "I am Gaurav's engineering assistant. I'm here to discuss his portfolio, software development, and technical projects. Let's get back to tech!"

3. TONE: Professional, brilliant, articulate, and helpful. Use clean spacing and markdown list pointers.

Official Profile Data for Gaurav Kumar Yadav:
- Education: 2nd-year BCA student at BBDU, Lucknow. Holds a Certified AI/ML Minor certificate from IIT Mandi (in collaboration with Masai School).
- Programming Languages: Python (primary), JavaScript, Java, C, SQL.
- Frontend: React.js, HTML5, CSS3, Tailwind CSS, Bootstrap, responsive UI.
- Backend: Node.js, Express.js, Flask, REST APIs, JWT authentication.
- Databases: MongoDB, MySQL.
- Data Science & AI: Pandas, NumPy, Matplotlib, Seaborn, Scikit-learn, Model training, Data analysis.
- Tools & Cloud: Git, GitHub, VS Code, Postman, Jupyter Notebook, GCP, AWS (basics), Kaggle.
- Key Projects:
  1. **Real-Time Chat App**: A full-stack chat application featuring Socket.IO for real-time messaging, JWT authentication, online/offline status tracking, theme customization, and Cloudinary image uploads.
  2. **BuildMyTeam**: A collaboration platform for colleges to manage hackathons, team formation, join requests, and shared workspaces with role-based access.
  3. **SmartMess**: A hostel mess management platform with menu visibility, digital attendance tracking, feedback/ratings, and a complaint portal with an admin analytics dashboard.
  4. **TaskNexus** (In Progress): A service-based platform that acts as a smart bridge between clients and freelancers, handling task assignment, quality checks, and delivery.
  5. **AIReel Studio**: An AI-powered video editing platform for content creators featuring automatic caption generation, smart video edits, and social media optimization.
  6. **TrueCert**: A secure certificate issuance and verification platform featuring unique certificate IDs, QR-based verification, revocation/expiry handling, and scan analytics.
  7. **FocusGuard**: An AI-powered attention monitor using webcam input to detect sustained phone-looking behavior and trigger alerts.
- Contact Details:
  - Email: kumar.gaurav.yadav2007@gmail.com
  - LinkedIn: https://linkedin.com/in/ggauravky
  - GitHub: https://github.com/ggauravky
  - Portfolio: https://ggauravky.vercel.app
- Services & Availability:
  - Actively seeking Internships, Entry-level roles, and Freelance projects (open to Remote, Hybrid, or On-site positions).
  - Target Roles: AI/ML Intern, Software Developer Intern, Full-Stack Developer Intern.
  - Services: Website Development, Portfolio Development, Mentorship (1-to-1 roadmap guidance), Resume Review, Debugging Help, and AI/Data Science Guidance.
`;

const sanitizeMessage = (value, maxLength = 1000) =>
  String(value || "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);

const sanitizeReply = (value, maxLength = 2500) =>
  String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/[^\S\n]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, maxLength);

const buildRecordId = (prefix = "msg") =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const sanitizeHistory = (value) =>
  (Array.isArray(value) ? value : [])
    .slice(-MAX_HISTORY_MESSAGES)
    .map((entry) => {
      const role = ["assistant", "ai", "model"].includes(String(entry?.role || "").toLowerCase())
        ? "assistant"
        : "user";
      const content = sanitizeMessage(entry?.content ?? entry?.text ?? "", 1500);
      return content ? { role, content } : null;
    })
    .filter(Boolean);

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

  return { ipAddress, userAgent, referrer, countryCode };
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
          "stats.lastIntent": "general",
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
                intent: "general",
                provider: "user",
                model: "human",
                degraded: false,
                retrievalScore: 0,
                contentLength: safeUserMessage.length,
                sources: [],
                createdAt: now,
              },
              {
                messageId: buildRecordId("assistant"),
                turnId,
                role: "assistant",
                content: safeAssistantMessage,
                intent: "general",
                provider: assistantMessage.provider,
                model: assistantMessage.model,
                degraded: Boolean(assistantMessage.degraded),
                responseTimeMs: assistantMessage.responseTimeMs ?? null,
                retrievalScore: 0,
                contentLength: safeAssistantMessage.length,
                sources: [],
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

function generateSuggestions(message) {
  const msg = String(message || "").toLowerCase();
  if (msg.includes("project") || msg.includes("build") || msg.includes("app")) {
    return ["What is BuildMyTeam?", "Explain SmartMess", "Tell me about TaskNexus"];
  }
  if (msg.includes("skill") || msg.includes("tech") || msg.includes("program")) {
    return ["What is your education?", "What services do you offer?", "Tell me about your experience"];
  }
  if (msg.includes("service") || msg.includes("hire") || msg.includes("work") || msg.includes("consult")) {
    return ["What is your availability?", "How can I contact you?", "Where is your resume?"];
  }
  return [
    "What projects have you built?",
    "What is your tech stack?",
    "What services do you offer?",
    "How can I contact you?"
  ];
}

async function callGroq({ message, history }) {
  if (!GROQ_API_KEY) {
    const error = new Error("GROQ_API_KEY is not configured");
    error.code = "GROQ_API_KEY_MISSING";
    throw error;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT,
          },
          ...history.map((entry) => ({
            role: entry.role === "assistant" ? "assistant" : "user",
            content: entry.content,
          })),
          {
            role: "user",
            content: message,
          },
        ],
        temperature: 0.7,
        max_tokens: 600,
      }),
      signal: controller.signal,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const errorMsg = data?.error?.message || "Groq API request failed";
      const error = new Error(errorMsg);
      error.code = response.status;
      throw error;
    }

    const reply = data?.choices?.[0]?.message?.content;
    return sanitizeReply(reply, 2500);
  } finally {
    clearTimeout(timeoutId);
  }
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

  if (CHATBOT_PROVIDER === "groq") {
    if (!GROQ_API_KEY) {
      reqLogger.error("GROQ_API_KEY is not configured in backend environment.");
      return res.status(200).json({
        success: true,
        reply: "I'm sorry, my AI features are currently offline because the API key is missing. Please contact Gaurav at kumar.gaurav.yadav2007@gmail.com.",
        provider: "fallback",
        degraded: true,
      });
    }

    try {
      const clientHistory = sanitizeHistory(req.body?.history);
      const storedHistory = await loadStoredHistory(sessionId);
      const conversationHistory = storedHistory.length ? storedHistory : clientHistory;

      const replyText = await callGroq({
        message,
        history: conversationHistory,
      });

      const responseTimeMs = Date.now() - startTime;

      await persistConversationTurn({
        sessionId,
        clientDetails,
        userMessage: { content: message },
        assistantMessage: {
          content: replyText,
          provider: "groq",
          model: GROQ_MODEL,
          degraded: false,
          responseTimeMs,
        },
      });

      return res.status(200).json({
        success: true,
        reply: replyText,
        provider: "groq",
        degraded: false,
        sources: [],
        followUpSuggestions: generateSuggestions(message),
      });
    } catch (error) {
      console.error("ACTUAL CHATBOT ERROR:", error);
      reqLogger.error({ err: error }, "Groq chatbot API execution failed");
      const responseTimeMs = Date.now() - startTime;

      const isRateLimit = error?.status === 429 || error?.code === 429;
      const replyText = isRateLimit 
        ? "I am receiving a high volume of requests right now and hit my rate limit. Please try again in a moment, or reach out to Gaurav directly!"
        : `Failed to query chatbot: ${error?.message || "Unknown error occurred."}`;

      try {
        await persistConversationTurn({
          sessionId,
          clientDetails,
          userMessage: { content: message },
          assistantMessage: {
            content: replyText,
            provider: "groq-error",
            model: GROQ_MODEL,
            degraded: true,
            responseTimeMs,
          },
        });
      } catch (dbErr) {
        reqLogger.error({ err: dbErr }, "Failed to write error turn to database");
      }

      return res.status(200).json({
        success: true,
        reply: replyText,
        provider: "groq-error",
        degraded: true,
        sources: [],
        followUpSuggestions: generateSuggestions(message),
      });
    }
  } else {
    // Gemini code path
    if (!GEMINI_API_KEY) {
      reqLogger.error("GEMINI_API_KEY is not configured in backend environment.");
      return res.status(200).json({
        success: true,
        reply: "I'm sorry, my AI features are currently offline because the API key is missing. Please contact Gaurav at kumar.gaurav.yadav2007@gmail.com.",
        provider: "fallback",
        degraded: true,
      });
    }

    try {
      const clientHistory = sanitizeHistory(req.body?.history);
      const storedHistory = await loadStoredHistory(sessionId);
      const conversationHistory = storedHistory.length ? storedHistory : clientHistory;

      // Initialize GoogleGenerativeAI
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: GEMINI_MODEL,
        systemInstruction: SYSTEM_PROMPT,
      });

      // Map conversation history to Gemini role/parts structure
      const geminiHistory = conversationHistory.map((entry) => ({
        role: entry.role === "assistant" ? "model" : "user",
        parts: [{ text: entry.content }],
      }));

      // Start Chat
      const chat = model.startChat({
        history: geminiHistory,
      });

      // Send the user's message with a timeout safeguard
      const chatPromise = chat.sendMessage(message);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request Timeout")), REQUEST_TIMEOUT_MS)
      );

      const result = await Promise.race([chatPromise, timeoutPromise]);
      const response = await result.response;
      const replyText = sanitizeReply(response.text(), 2500);

      const responseTimeMs = Date.now() - startTime;

      await persistConversationTurn({
        sessionId,
        clientDetails,
        userMessage: { content: message },
        assistantMessage: {
          content: replyText,
          provider: "gemini",
          model: GEMINI_MODEL,
          degraded: false,
          responseTimeMs,
        },
      });

      return res.status(200).json({
        success: true,
        reply: replyText,
        provider: "gemini",
        degraded: false,
        sources: [],
        followUpSuggestions: generateSuggestions(message),
      });
    } catch (error) {
      console.error("ACTUAL CHATBOT ERROR:", error);
      reqLogger.error({ err: error }, "Gemini chatbot API execution failed");
      const responseTimeMs = Date.now() - startTime;

      // Handle rate-limiting or quota errors gracefully
      const isRateLimit = error?.status === 429 || error?.code === 429;
      const replyText = isRateLimit 
        ? "I am receiving a high volume of requests right now and hit my rate limit. Please try again in a moment, or reach out to Gaurav directly!"
        : `Failed to query chatbot: ${error?.message || "Unknown error occurred."}`;

      try {
        await persistConversationTurn({
          sessionId,
          clientDetails,
          userMessage: { content: message },
          assistantMessage: {
            content: replyText,
            provider: "gemini-error",
            model: GEMINI_MODEL,
            degraded: true,
            responseTimeMs,
          },
        });
      } catch (dbErr) {
        reqLogger.error({ err: dbErr }, "Failed to write error turn to database");
      }

      return res.status(200).json({
        success: true,
        reply: replyText,
        provider: "gemini-error",
        degraded: true,
        sources: [],
        followUpSuggestions: generateSuggestions(message),
      });
    }
  }
};

exports.chatbotPrivacyPolicy = (req, res) => {
  return res.status(200).json({
    success: true,
    policy: getRetentionPolicy(),
  });
};

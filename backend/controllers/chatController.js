// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const ChatLog = require("../models/ChatLog");

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
  console.warn(
    `Invalid GEMINI_MODEL "${requestedModel}". Falling back to "${GEMINI_MODEL}".`
  );
}

let gauravData = {};

try {
  const dataPath = path.join(__dirname, "../data/gauravData.json");
  const rawData = fs.readFileSync(dataPath, "utf-8");
  gauravData = JSON.parse(rawData);
  console.log("Gaurav knowledge base loaded successfully");
} catch (err) {
  console.error("Failed to load gauravData.json:", err.message);
}

const toLower = (value) => String(value || "").toLowerCase();
const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const hasTerm = (text, term) => {
  const source = toLower(text);
  const token = toLower(term).trim();
  if (!source || !token) return false;

  const simpleWord = /^[a-z0-9]+$/.test(token);
  if (simpleWord) {
    return new RegExp(`\\b${escapeRegExp(token)}\\b`, "i").test(source);
  }

  return source.includes(token);
};
const includesAny = (text, terms) => terms.some((term) => hasTerm(text, term));
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

const safeArray = (value) => (Array.isArray(value) ? value : []);

const findMatchingProjects = (query) => {
  const projects = safeArray(gauravData.projects);
  const tokens = query.split(/\s+/).filter((token) => token.length > 2);

  return projects.filter((project) => {
    const haystack = toLower(
      `${project.name} ${project.description} ${safeArray(project.techStack).join(" ")}`
    );
    return tokens.some((token) => haystack.includes(token));
  });
};

const findMatchingBlogs = (query) => {
  const blogs = safeArray(gauravData.blogs);
  const tokens = query.split(/\s+/).filter((token) => token.length > 2);

  return blogs.filter((blog) => {
    const haystack = toLower(
      `${blog.title} ${blog.excerpt} ${safeArray(blog.tags).join(" ")} ${blog.category}`
    );
    return tokens.some((token) => haystack.includes(token));
  });
};

const buildRelevantContext = (userMessage) => {
  const query = toLower(userMessage);

  // For greetings, return minimal context — the system prompt handles the response
  if (includesAny(query, ["hi", "hello", "hey", "howdy", "sup", "greetings", "how are you", "how's it going"])) {
    return JSON.stringify({ personal: gauravData.personal || {}, voice: gauravData.voice || {} });
  }

  const context = {
    personal: gauravData.personal || {},
    voice: gauravData.voice || {},
    contact: gauravData.contact || {},
    faq: safeArray(gauravData.faq).slice(0, 4),
  };

  if (
    includesAny(query, [
      "skill",
      "tech",
      "stack",
      "language",
      "tool",
      "python",
      "react",
      "ai",
      "ml",
    ])
  ) {
    context.skills = gauravData.skills || {};
  }

  if (
    includesAny(query, [
      "project",
      "built",
      "build",
      "portfolio",
      "tasknexus",
      "chat app",
      "mern",
      "notes",
      "aireel",
      "shopease",
      "dishdash",
      "flappy",
      "calculator",
      "grocery",
      "captcha",
      "pdf",
    ])
  ) {
    const matches = findMatchingProjects(query);
    context.projects = matches.length ? matches.slice(0, 5) : safeArray(gauravData.projects).slice(0, 5);
  }

  if (
    includesAny(query, [
      "hire",
      "choose you",
      "why hire",
      "why should i choose you",
      "why i choose you",
      "available",
      "blog",
      "article",
      "post",
      "write",
      "wrote",
      "writing",
      "published",
      "cybersecurity",
      "certificate",
      "chatgpt",
      "india ai",
      "programming language",
    ])
  ) {
    const matches = findMatchingBlogs(query);
    context.blogs = matches.length ? matches.slice(0, 4) : safeArray(gauravData.blogs).slice(0, 4);
  }

  if (
    includesAny(query, [
      "why you made this",
      "why did you make this",
      "why build this portfolio",
      "purpose of this portfolio",
      "what did you use to build this",
      "how did you build this portfolio",
      "tech stack of this portfolio",
      "built this website",
    ])
  ) {
    context.portfolioMeta = {
      whyBuilt:
        "I built this portfolio to show real proof-of-work and make it easy for recruiters to evaluate my projects and growth quickly.",
      stack: {
        frontend: ["React", "Vite", "Tailwind CSS", "React Router"],
        backend: ["Node.js", "Express.js", "MongoDB"],
        aiChat: ["Gemini API"],
        deployment: ["Vercel (frontend/functions)", "Render (backend API)"],
      },
    };
  }

  if (includesAny(query, ["education", "college", "degree", "iit", "bbdu"])) {
    context.education = safeArray(gauravData.education);
  }

  if (includesAny(query, ["experience", "achievement", "work", "certification"])) {
    context.experience = safeArray(gauravData.experience);
    context.achievements = safeArray(gauravData.achievements);
  }

  if (includesAny(query, ["interest", "hobby", "focus area"])) {
    context.interests = safeArray(gauravData.interests);
  }

  if (Object.keys(context).length <= 4) {
    context.skills = gauravData.skills || {};
    context.projects = safeArray(gauravData.projects).slice(0, 3);
  }

  return JSON.stringify(context);
};

const buildSystemPrompt = (contextJson) => `
You ARE Gaurav Kumar Yadav himself — a BCA student from Lucknow, India who is an aspiring AI/ML and Full-Stack Developer. You are speaking directly to recruiters, collaborators, and visitors who are checking out your portfolio.

Speak ENTIRELY in FIRST PERSON. Always use "I", "my", "me", "I'm", "I've", "I built", "I'm working on". NEVER say "Gaurav does..." or "He built..." or refer to yourself in third person.

Your personality: direct, confident, thoughtful, build-first mindset. Not robotic. Not overly formal. Like you're on a relaxed but professional video call.

RULES — follow strictly:
1. FIRST PERSON ALWAYS: You are Gaurav speaking. Every response must use "I", "my", "me". Never third person.
2. GREETINGS & SMALL TALK: If the user says hi/hello or asks "how are you", respond warmly and briefly as yourself, then guide back to portfolio topics.
3. ON-TOPIC ONLY: Answer only questions about your skills, projects, education, experience, goals, or availability, using the provided context.
4. NO HALLUCINATIONS: Never invent details not in the context.
5. MISSING INFO: If something isn't in the context, say: "I don't have that detail handy right now. You can reach me directly at https://ggauravky.vercel.app/contact"
6. OFF-TOPIC: If the question has nothing to do with you (general knowledge, other people, coding tutorials), say: "That's a bit outside my lane! I'm here to talk about myself and my work. Feel free to reach me directly: https://ggauravky.vercel.app/contact"
7. SPECIAL QUESTIONS: If asked "why should I choose/hire you", answer with concrete strengths and project evidence. If asked "why you made this portfolio" or "what stack you used to build this", answer directly.
8. TONE: Confident, warm, brief — like a developer who knows what they're about. Not stiff. Not verbose.
9. FORMAT: Short bullet points when listing things. Keep replies concise and scannable. Avoid long paragraphs.

Context about me (Gaurav):
${contextJson}
`.trim();

const buildFallbackReply = (userMessage) => {
  const query = toLower(userMessage);
  const personal = gauravData.personal || {};
  const voice = gauravData.voice || {};
  const contact = gauravData.contact || {};
  const faq = safeArray(gauravData.faq);

  // Greetings
  if (includesAny(query, ["hi", "hello", "hey", "howdy", "sup", "greetings"])) {
    return "Hey! 👋 I'm Gaurav. Feel free to ask me anything — about what I build, what I know, or whether I'm available. Happy to chat!";
  }

  if (includesAny(query, ["how are you", "how's it going", "what's up"])) {
    return `I'm doing great and focused on building projects. Right now I'm working on improving my DSA and AI/ML fundamentals while shipping real products.`;
  }

  // FAQ match (answers are already first-person)
  const faqMatch = faq.find((item) => {
    const q = toLower(item.question);
    return q.includes(query) || query.includes(q);
  });

  if (faqMatch?.answer) {
    return faqMatch.answer;
  }

  if (includesAny(query, ["intern", "hire", "freelance", "open", "availability", "opportunity"])) {
    const openTo = safeArray(personal.openTo);
    if (openTo.length) {
      return `Yes, I'm currently open to:\n- ${openTo.join("\n- ")}\n\nFeel free to reach out: ${
        contact.contactPage || "https://ggauravky.vercel.app/contact"
      }`;
    }
  }

  if (
    includesAny(query, [
      "why hire you",
      "why should i hire you",
      "why should i choose you",
      "why i choose you",
      "why choose you",
      "why should we hire you",
    ])
  ) {
    const strengths = safeArray(gauravData.recruiterSignals?.strengths);
    const valueLine =
      gauravData.recruiterSignals?.whyHire ||
      voice.forRecruiters ||
      voice.whatMakesMeDifferent ||
      "I build real projects consistently and can deliver production-ready features end-to-end.";

    const bullets = strengths.length
      ? strengths.slice(0, 4).map((s) => `- ${s}`).join("\n")
      : [
          "- Built and deployed 12+ real projects",
          "- Strong in both MERN and Python/Flask stacks",
          "- Hands-on with real-time systems (Socket.IO chat app)",
          "- Practical AI/ML direction with IIT Mandi certification",
        ].join("\n");

    return `Great question. Here is why I can add value quickly:\n${bullets}\n\n${valueLine}\n\nContact: ${
      contact.contactPage || "https://ggauravky.vercel.app/contact"
    }`;
  }

  if (
    includesAny(query, [
      "why you made this",
      "why did you make this",
      "why build this portfolio",
      "purpose of this portfolio",
      "why this portfolio",
    ])
  ) {
    return `I built this portfolio to show proof-of-work, not just claims on a resume.\n\nMain purpose:\n- Show real deployed projects with clear tech stacks\n- Help recruiters quickly evaluate my strengths\n- Make collaboration and contact easy`;
  }

  if (
    includesAny(query, [
      "what did you use to build this",
      "how did you build this portfolio",
      "tech stack of this portfolio",
      "which tech used in portfolio",
      "built this website",
    ])
  ) {
    return `I built this portfolio with:\n- Frontend: React, Vite, Tailwind CSS, React Router\n- Backend/API: Node.js, Express.js, MongoDB\n- AI Chat: Gemini API\n- Deployment: Vercel (frontend/functions) + Render (backend API)`;
  }

  if (includesAny(query, ["contact", "email", "linkedin", "github", "reach", "social", "instagram", "twitter", "x.com", "kaggle", "leetcode", "geeksforgeeks", "whatsapp", "links"])) {
    return `Here's how you can reach me:\n- Email: ${
      contact.email || personal.email || "kumar.gaurav.yadav2007@gmail.com"
    }\n- Portfolio: ${
      contact.portfolio || personal.portfolio || "https://ggauravky.vercel.app"
    }\n- LinkedIn: ${
      contact.linkedin || personal.linkedin || "https://linkedin.com/in/ggauravky"
    }\n- GitHub: ${
      contact.github || personal.github || "https://github.com/ggauravky"
    }\n- WhatsApp: https://wa.me/918542036499\n- LeetCode: https://leetcode.com/u/gauravky/\n- GeeksforGeeks: https://www.geeksforgeeks.org/profile/gauravky\n- Kaggle: https://www.kaggle.com/kgauravky\n- X: https://x.com/xgauravky\n- Instagram: https://www.instagram.com/the_gau_rav/`;
  }

  if (includesAny(query, ["project", "built", "build", "tasknexus", "chat", "mern", "notes", "aireel"])) {
    const matches = findMatchingProjects(query);
    const project = matches[0] || safeArray(gauravData.projects)[0];
    if (project) {
      return `${project.name} is one of my projects — ${project.description}\nTech stack: ${safeArray(project.techStack).join(", ")}`;
    }
  }

  if (includesAny(query, ["blog", "article", "write", "wrote", "writing", "post", "published", "read"])) {
    const blogs = safeArray(gauravData.blogs);
    if (blogs.length) {
      const matches = findMatchingBlogs(query);
      const list = (matches.length ? matches : blogs).slice(0, 3);
      const titles = list.map((b) => `• ${b.title} (${b.category})`).join("\n");
      return `I write about AI, cybersecurity, and developer career topics. Here are some of my recent pieces:\n\n${titles}\n\nRead them all at: https://ggauravky.vercel.app/blog`;
    }
  }

  if (includesAny(query, ["goal", "future", "plan", "vision", "long term", "short term"])) {
    return voice.shortTermGoals
      ? `${voice.shortTermGoals}\n\n${voice.longTermGoals || ""}`
      : `I'm focused on strengthening my AI/ML and DSA fundamentals while shipping real projects and securing a high-impact internship.`;
  }

  if (includesAny(query, ["learn", "study", "currently", "improving"])) {
    return voice.currentlyLearning
      ? voice.currentlyLearning
      : `I'm currently improving my DSA, advanced AI/ML concepts, MERN scalability, and system design fundamentals.`;
  }

  if (includesAny(query, ["different", "unique", "stand out", "why you", "why hire", "choose you"])) {
    return voice.whatMakesMeDifferent
      ? voice.whatMakesMeDifferent
      : `I build real projects, not just tutorials. My consistency mindset and build-in-public approach is what sets me apart.`;
  }

  if (includesAny(query, ["skill", "tech", "stack", "language", "python", "react", "tool"])) {
    const skills = gauravData.skills || {};
    const langs = safeArray(skills.programmingLanguages).join(", ");
    const fe = safeArray(skills.frontend).slice(0, 4).join(", ");
    const be = safeArray(skills.backend).slice(0, 4).join(", ");
    return langs
      ? `My strongest languages right now: ${langs}\n\nFrontend: ${fe}\nBackend: ${be}`
      : `I work primarily with Python and JavaScript, covering full-stack and AI/ML development.`;
  }

  // Off-topic or unrecognised — redirect to contact
  const isLikelyOffTopic = !includesAny(query, [
    "gaurav", "skill", "project", "education", "intern", "hire",
    "python", "react", "ai", "ml", "data", "full stack", "about", "goal", "learn",
    "blog", "article", "write", "post",
  ]);

  if (isLikelyOffTopic) {
    return `That's a bit outside my lane! I'm here to talk about myself and my work.\n\nFeel free to reach me directly: https://ggauravky.vercel.app/contact`;
  }

  const bio = personal.bio || voice.identity || "I'm Gaurav — a developer focused on AI/ML and full-stack engineering.";
  return `${bio}\n\nWant to know more? Reach me at: ${
    contact.contactPage || "https://ggauravky.vercel.app/contact"
  }`;
};

// ─── Intent tagger ────────────────────────────────────────────────────────────
const detectIntent = (message) => {
  const q = toLower(message);
  if (includesAny(q, ["hi", "hello", "hey", "howdy", "sup", "greetings", "how are you"])) return "greeting";
  if (includesAny(q, ["why you made this", "why did you make this", "why build this portfolio", "purpose of this portfolio", "what did you use to build this", "how did you build this portfolio", "tech stack of this portfolio"])) return "portfolio";
  if (includesAny(q, ["intern", "hire", "available", "freelance", "job", "recruit", "role", "why hire", "why hire you", "why should", "what makes", "different", "why choose you", "why i choose you", "why should i choose you"])) return "hiring";
  if (includesAny(q, ["skill", "tech", "stack", "language", "python", "react", "node", "ai", "ml", "framework", "tool"])) return "skills";
  if (includesAny(q, ["project", "built", "build", "app", "chat", "mern", "aireel", "notes", "grocery", "shopease", "tasknexus"])) return "projects";
  if (includesAny(q, ["education", "college", "degree", "iit", "bca", "mandi", "bbdu", "certification"])) return "education";
  if (includesAny(q, ["goal", "future", "plan", "learn", "studying", "improving", "currently"])) return "goals";
  if (includesAny(q, ["blog", "article", "write", "wrote", "post", "published"])) return "blogs";
  if (includesAny(q, ["contact", "email", "linkedin", "github", "reach", "social", "instagram", "twitter", "x.com", "kaggle", "leetcode", "geeksforgeeks", "whatsapp", "links"])) return "contact";
  return "other";
};

// ─── IP geo lookup (non-blocking, best-effort) ─────────────────────────────
const lookupGeo = async (ip) => {
  const blank = { country: "unknown", countryCode: "unknown", city: "unknown", region: "unknown", timezone: "unknown" };
  if (!ip || ip === "unknown" || ip === "127.0.0.1" || ip === "::1") return blank;
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
      country:     data.country_name  || "unknown",
      countryCode: data.country_code  || "unknown",
      city:        data.city          || "unknown",
      region:      data.region        || "unknown",
      timezone:    data.timezone      || "unknown",
    };
  } catch {
    return blank;
  }
};

// ─── Save to MongoDB (non-fatal) ────────────────────────────────────────────
const saveChatLog = async (userMessage, aiReply, meta) => {
  try {
    if (mongoose.connection.readyState !== 1) return;
    const geo = await lookupGeo(meta.ipAddress);
    await ChatLog.create({
      userMessage:   String(userMessage).slice(0, 1000),
      aiReply:       String(aiReply).slice(0, 5000),
      source:        meta.source        || "gemini",
      degraded:      Boolean(meta.degraded),
      model:         meta.model         || "unknown",
      responseTimeMs:meta.responseTimeMs || null,
      sessionId:     meta.sessionId     || "unknown",
      messageIndex:  meta.messageIndex  || 0,
      historyLength: meta.historyLength || 0,
      messageLength: meta.messageLength || 0,
      intentTag:     meta.intentTag     || "other",
      ipAddress:     meta.ipAddress     || "unknown",
      userAgent:     meta.userAgent     || "unknown",
      referrer:      meta.referrer      || "direct",
      ...geo,
    });
  } catch (err) {
    console.warn("⚠️  ChatLog save failed (non-fatal):", err.message);
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

/**
 * @desc    Chat with AI about Gaurav
 * @route   POST /api/chat
 * @access  Public
 */
exports.chat = async (req, res) => {
  const message    = req.body?.message;
  const clientIp   = (req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || "unknown").replace(/^::ffff:/, "");
  const userAgent  = String(req.headers["user-agent"] || "unknown").slice(0, 300);
  const referrer   = String(req.headers["referer"] || req.headers["referrer"] || "direct").slice(0, 300);
  const sessionId  = String(req.headers["x-session-id"] || req.body?.sessionId || "unknown").slice(0, 64);
  const msgIndex   = parseInt(req.body?.messageIndex, 10) || 0;
  const historyLen = Array.isArray(req.body?.history) ? req.body.history.length : 0;
  const startTime  = Date.now();

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
      console.error("GEMINI_API_KEY is not set in environment variables");
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
          parts: [
            {
              text: "Understood. I will answer using only the provided context.",
            },
          ],
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

    const trimmedReply  = reply.trim();
    const responseTimeMs = Date.now() - startTime;

    saveChatLog(trimmedMessage, trimmedReply, {
      source: "gemini", degraded: false, model: GEMINI_MODEL,
      responseTimeMs, sessionId, messageIndex: msgIndex,
      historyLength: historyLen, messageLength: trimmedMessage.length,
      intentTag: detectIntent(trimmedMessage),
      ipAddress: clientIp, userAgent, referrer,
    });

    return res.status(200).json({
      success: true,
      reply: trimmedReply,
    });
  } catch (error) {
    console.error("Chat controller error:", error.message);

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
      saveChatLog(trimmedMessage, fallbackReply, {
        source: "fallback", degraded: true, model: GEMINI_MODEL,
        responseTimeMs: Date.now() - startTime, sessionId, messageIndex: msgIndex,
        historyLength: historyLen, messageLength: trimmedMessage.length,
        intentTag: detectIntent(trimmedMessage),
        ipAddress: clientIp, userAgent, referrer,
      });
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

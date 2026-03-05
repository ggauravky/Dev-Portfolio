// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// MongoDB (lazy dynamic import; safe if package is missing)
let _mg = null;
let _ChatLog = null;
let _dbReady = false;

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) return null;

  try {
    if (!_mg) _mg = (await import("mongoose")).default;
    if (_dbReady && _mg.connection.readyState === 1) return _mg;

    await _mg.connect(uri, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 4000,
    });

    _dbReady = true;
    return _mg;
  } catch (error) {
    console.warn("MongoDB connect failed (non-fatal):", error.message);
    return null;
  }
}

function getChatLog(mg) {
  if (_ChatLog) return _ChatLog;

  const schema = new mg.Schema(
    {
      userMessage: { type: String, required: true, trim: true, maxLength: 1000 },
      aiReply: { type: String, required: true, trim: true },
      source: { type: String, enum: ["gemini", "fallback"], default: "gemini" },
      degraded: { type: Boolean, default: false },
      model: { type: String, default: "unknown" },
      responseTimeMs: { type: Number, default: null },
      sessionId: { type: String, default: "unknown", index: true },
      messageIndex: { type: Number, default: 0 },
      historyLength: { type: Number, default: 0 },
      messageLength: { type: Number, default: 0 },
      intentTag: { type: String, default: "other" },
      ipAddress: { type: String, default: "unknown" },
      userAgent: { type: String, default: "unknown" },
      referrer: { type: String, default: "direct" },
      country: { type: String, default: "unknown" },
      countryCode: { type: String, default: "unknown" },
      city: { type: String, default: "unknown" },
      region: { type: String, default: "unknown" },
      timezone: { type: String, default: "unknown" },
    },
    { timestamps: true, collection: "chatlogs" }
  );

  _ChatLog = mg.models.ChatLog || mg.model("ChatLog", schema);
  return _ChatLog;
}

const saveChatLog = async (userMessage, aiReply, meta) => {
  try {
    const mg = await connectDB();
    if (!mg || mg.connection.readyState !== 1) return;

    const ChatLog = getChatLog(mg);

    await ChatLog.create({
      userMessage: String(userMessage).slice(0, 1000),
      aiReply: String(aiReply).slice(0, 5000),
      source: meta.source || "gemini",
      degraded: Boolean(meta.degraded),
      model: meta.model || "unknown",
      responseTimeMs: meta.responseTimeMs || null,
      sessionId: meta.sessionId || "unknown",
      messageIndex: meta.messageIndex || 0,
      historyLength: meta.historyLength || 0,
      messageLength: meta.messageLength || 0,
      intentTag: meta.intentTag || "other",
      ipAddress: meta.ipAddress || "unknown",
      userAgent: meta.userAgent || "unknown",
      referrer: meta.referrer || "direct",
      country: meta.country || "unknown",
      countryCode: meta.countryCode || "unknown",
      city: meta.city || "unknown",
      region: meta.region || "unknown",
      timezone: meta.timezone || "unknown",
    });
  } catch (error) {
    console.warn("ChatLog save failed (non-fatal):", error.message);
  }
};

const toLower = (value) => String(value || "").toLowerCase();
const normalizeSpace = (value) => String(value || "").replace(/\s+/g, " ").trim();
const safeArray = (value) => (Array.isArray(value) ? value : []);
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

const toList = (value) => {
  if (Array.isArray(value)) return value.map((item) => normalizeSpace(item)).filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => normalizeSpace(item))
      .filter(Boolean);
  }
  return [];
};

const uniqueBy = (items, keyFn) => {
  const seen = new Set();
  const out = [];

  for (const item of items) {
    const key = keyFn(item);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }

  return out;
};

const tokenize = (value) =>
  toLower(value)
    .split(/[^a-z0-9]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 2);

const getTurnText = (turn) => normalizeSpace(turn?.text || turn?.content || "");

const firstSentence = (value) => {
  const text = normalizeSpace(value);
  if (!text) return "";
  const parts = text.split(/[.!?]/);
  return normalizeSpace(parts[0] || text);
};

const SOCIAL_LINKS = [
  { name: "GitHub", url: "https://github.com/ggauravky", username: "@ggauravky" },
  { name: "LinkedIn", url: "https://www.linkedin.com/in/gauravky/", username: "@gauravky" },
  { name: "WhatsApp", url: "https://wa.me/918542036499", username: "+91 8542036499" },
  { name: "LeetCode", url: "https://leetcode.com/u/gauravky/", username: "@gauravky" },
  { name: "GeeksforGeeks", url: "https://www.geeksforgeeks.org/profile/gauravky", username: "@gauravky" },
  { name: "Kaggle", url: "https://www.kaggle.com/kgauravky", username: "@kgauravky" },
  { name: "Twitter (X)", url: "https://x.com/xgauravky", username: "@xgauravky" },
  { name: "Instagram", url: "https://www.instagram.com/the_gau_rav/", username: "@the_gau_rav" },
];

const DEFAULT_DATA = {
  personal: {
    name: "Gaurav Kumar Yadav",
    title: "Python Developer | AI/ML Engineer | Full Stack Developer",
    location: "Lucknow, Uttar Pradesh, India",
    email: "ggauravky@gmail.com",
    portfolio: "https://ggauravky.vercel.app",
    github: "https://github.com/ggauravky",
    linkedin: "https://www.linkedin.com/in/gauravky/",
    bio: "I am a BCA student focused on AI/ML and full-stack development. I build practical projects and ship consistently.",
    openTo: [
      "Internships",
      "Entry-level roles",
      "Freelance projects",
      "Remote work",
      "Collaboration on open-source and AI projects",
    ],
  },
  contact: {
    email: "ggauravky@gmail.com",
    portfolio: "https://ggauravky.vercel.app",
    github: "https://github.com/ggauravky",
    linkedin: "https://www.linkedin.com/in/gauravky/",
    contactPage: "https://ggauravky.vercel.app/contact",
  },
  voice: {
    whatMakesMeDifferent:
      "I build real projects, not just tutorials, and I improve them over time with a consistent build-first approach.",
    shortTermGoals:
      "Strengthen DSA and AI/ML fundamentals, contribute to real projects, and secure a high-impact internship.",
    longTermGoals:
      "Become a strong AI-focused software engineer building intelligent and scalable products.",
    currentlyLearning:
      "Data Structures and Algorithms, advanced AI/ML concepts, MERN scalability, and system design fundamentals.",
    forRecruiters:
      "I show up consistently, build real systems end-to-end, and focus on long-term engineering growth.",
    targetRoles: ["AI/ML Intern", "Software Developer Intern", "Full-Stack Developer Intern"],
  },
};

const PORTFOLIO_META = {
  whyBuilt:
    "I built this portfolio to show proof-of-work, not just claims. It is designed so recruiters can quickly evaluate my projects, stack, and growth.",
  purpose: [
    "Present real deployed projects with clear technical context",
    "Show consistent build-first learning in AI/ML and full-stack",
    "Make it easy for recruiters and collaborators to contact me",
  ],
  stack: {
    frontend: ["React 18", "Vite", "Tailwind CSS", "React Router"],
    backend: ["Node.js", "Express.js APIs", "MongoDB with Mongoose"],
    aiChat: ["Gemini API via `api/chat.js`"],
    deployment: ["Vercel (frontend + serverless functions)", "Render (backend services)"],
  },
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const loadPortfolioData = () => {
  const candidatePaths = [
    path.join(__dirname, "data/gauravData.json"),
    path.join(process.cwd(), "api/data/gauravData.json"),
    path.join(__dirname, "../backend/data/gauravData.json"),
    path.join(process.cwd(), "backend/data/gauravData.json"),
    path.join(__dirname, "../public/data/gauravData.json"),
    path.join(process.cwd(), "public/data/gauravData.json"),
    path.join(__dirname, "../dist/data/gauravData.json"),
    path.join(process.cwd(), "dist/data/gauravData.json"),
  ];

  for (const filePath of candidatePaths) {
    try {
      const raw = fs.readFileSync(filePath, "utf8");
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") return parsed;
    } catch {
      // Ignore and try next path.
    }
  }

  console.warn("gauravData.json not found in expected paths. Falling back to minimal in-code defaults.");
  return {};
};

const normalizeProjects = (projects) =>
  safeArray(projects).map((project) => {
    const name = project?.name || project?.title || "Untitled project";
    const description = normalizeSpace(project?.description || "");
    const techStack = safeArray(project?.techStack);
    const categories = safeArray(project?.categories);
    const searchText = `${name} ${description} ${techStack.join(" ")} ${categories.join(" ")}`.toLowerCase();

    return {
      ...project,
      name,
      description,
      techStack,
      categories,
      searchText,
    };
  });

const normalizeBlogs = (blogs) =>
  safeArray(blogs).map((blog) => ({
    ...blog,
    title: blog?.title || "Untitled blog",
    tags: safeArray(blog?.tags),
  }));

const normalizeFaq = (faqItems) =>
  safeArray(faqItems)
    .map((item) => ({
      q: normalizeSpace(item?.q || item?.question || ""),
      a: normalizeSpace(item?.a || item?.answer || ""),
    }))
    .filter((item) => item.q && item.a);

const buildRecruiterSignals = (raw, voice, openTo) => {
  const provided = raw?.recruiterSignals || {};
  const strengths = safeArray(provided.strengths);
  const targetRoles = toList(provided.targetRoles || voice?.targetRoles || DEFAULT_DATA.voice.targetRoles);

  return {
    strengths:
      strengths.length > 0
        ? strengths
        : [
            "Consistent builder with 12+ deployed projects",
            "Hands-on experience in MERN and Python/Flask stacks",
            "Real-time app experience with Socket.IO",
            "AI/ML practical direction with IIT Mandi minor certification",
          ],
    availability:
      normalizeSpace(provided.availability) ||
      `Open to ${openTo.slice(0, 3).join(", ").toLowerCase()}`,
    workStyle:
      normalizeSpace(provided.workStyle) ||
      "Build-first and practical. I ship working systems, then improve quality and scale.",
    whyHire:
      normalizeSpace(provided.whyHire) ||
      voice?.forRecruiters ||
      DEFAULT_DATA.voice.forRecruiters,
    targetRoles,
    projectHighlights: safeArray(provided.projectHighlights),
  };
};

const buildKnowledgeBase = (rawData) => {
  const raw = rawData && typeof rawData === "object" ? rawData : {};

  const personal = {
    ...DEFAULT_DATA.personal,
    ...(raw.personal || {}),
  };

  const contact = {
    ...DEFAULT_DATA.contact,
    ...(raw.contact || {}),
    email: raw?.contact?.email || personal.email || DEFAULT_DATA.contact.email,
    portfolio: raw?.contact?.portfolio || personal.portfolio || DEFAULT_DATA.contact.portfolio,
    github: raw?.contact?.github || personal.github || DEFAULT_DATA.contact.github,
    linkedin: raw?.contact?.linkedin || personal.linkedin || DEFAULT_DATA.contact.linkedin,
    contactPage: raw?.contact?.contactPage || DEFAULT_DATA.contact.contactPage,
  };

  const voice = {
    ...DEFAULT_DATA.voice,
    ...(raw.voice || {}),
    targetRoles: toList(raw?.voice?.targetRoles || DEFAULT_DATA.voice.targetRoles),
  };

  const openTo = safeArray(personal.openTo).length > 0 ? safeArray(personal.openTo) : DEFAULT_DATA.personal.openTo;
  personal.openTo = openTo;

  const socialLinks = uniqueBy(
    [
      { name: "Email", url: `mailto:${contact.email}`, username: contact.email },
      { name: "Portfolio", url: contact.portfolio, username: "Website" },
      { name: "GitHub", url: contact.github, username: "@ggauravky" },
      { name: "LinkedIn", url: contact.linkedin, username: "@gauravky" },
      ...SOCIAL_LINKS,
    ].filter((item) => item.url),
    (item) => `${toLower(item.name)}::${toLower(item.url)}`
  );

  return {
    ...raw,
    personal,
    contact,
    voice,
    education: safeArray(raw.education),
    skills: raw.skills || {},
    projects: normalizeProjects(raw.projects),
    blogs: normalizeBlogs(raw.blogs),
    experience: safeArray(raw.experience),
    achievements: safeArray(raw.achievements),
    interests: safeArray(raw.interests),
    faq: normalizeFaq(raw.faq),
    techStackDetailed: raw.techStackDetailed || {},
    recruiterSignals: buildRecruiterSignals(raw, voice, openTo),
    socialLinks,
    portfolioMeta: PORTFOLIO_META,
  };
};

const GAURAV = buildKnowledgeBase(loadPortfolioData());

const INTENT_TERMS = {
  greeting: ["hi", "hello", "hey", "howdy", "sup", "greetings"],
  social: [
    "social",
    "social media",
    "follow",
    "instagram",
    "twitter",
    "x.com",
    "kaggle",
    "leetcode",
    "geeksforgeeks",
    "whatsapp",
    "links",
    "linktree",
  ],
  contact: ["contact", "email", "linkedin", "github", "reach", "connect", "phone", "number"],
  hiring: [
    "intern",
    "hire",
    "available",
    "freelance",
    "job",
    "recruit",
    "role",
    "why hire",
    "why hire you",
    "why should i choose you",
    "why i choose you",
    "why choose you",
    "why should",
    "what makes",
    "different",
    "strength",
  ],
  portfolioWhy: [
    "why did you make this portfolio",
    "why you made this portfolio",
    "why you made this",
    "why made this",
    "why create this",
    "why built this",
    "why build this portfolio",
    "purpose of this portfolio",
    "why this portfolio",
  ],
  portfolioBuild: [
    "what did you use",
    "what did you use to make this",
    "what you used to build this",
    "how did you build this",
    "how did you make this portfolio",
    "how was this portfolio built",
    "which tech used in portfolio",
    "tech stack of this portfolio",
    "built this website",
  ],
  skills: [
    "skill",
    "tech",
    "stack",
    "language",
    "python",
    "react",
    "node",
    "javascript",
    "ai",
    "ml",
    "machine learning",
    "frontend",
    "backend",
    "database",
    "tool",
    "framework",
  ],
  projects: [
    "project",
    "built",
    "build",
    "app",
    "application",
    "chat",
    "mern",
    "aireel",
    "store",
    "notes",
    "calculator",
    "tasknexus",
    "grocery",
    "demo",
    "deployed",
    "shopease",
    "dishdash",
    "taskmaster",
    "flappy",
  ],
  education: [
    "education",
    "study",
    "college",
    "university",
    "degree",
    "bca",
    "iit",
    "mandi",
    "certification",
    "course",
    "academic",
  ],
  goals: [
    "goal",
    "future",
    "plan",
    "aspire",
    "target",
    "learning",
    "studying",
    "next",
    "short term",
    "long term",
  ],
  blogs: ["blog", "article", "write", "wrote", "post", "published", "read"],
  faq: ["tasknexus", "main language", "freelance", "internships"],
  studentGuidance: [
    "how to start coding",
    "how do i start coding",
    "how should i start coding",
    "is dsa important",
    "is dsa necessary",
    "which language should i learn",
    "best language should i learn",
    "which programming language should i learn",
    "how did you learn",
    "how did you start coding",
    "coding beginner",
    "beginner coding",
  ],
  smallTalk: ["how are you", "how's it going", "what's up", "how is your day", "how's your day", "what are you doing"],
};

const FOLLOW_UP_TERMS = [
  "which one",
  "which is best",
  "tell more",
  "explain more",
  "why that",
  "how so",
  "which tech",
  "what about that",
];

const FOLLOW_UP_ELIGIBLE_INTENTS = new Set([
  "hiring",
  "projects",
  "project",
  "skills",
  "education",
  "goals",
  "blogs",
  "contact",
  "social",
  "faq",
  "portfolio_why",
  "portfolio_build",
  "student_guidance",
]);

const ABUSIVE_TERMS = [
  "fuck",
  "fucking",
  "shit",
  "bitch",
  "bastard",
  "idiot",
  "stupid",
  "moron",
  "asshole",
  "chutiya",
  "madarchod",
  "bhenchod",
  "gandu",
];

const ABUSIVE_REPLY =
  "I'm here to help with questions about Gaurav's work and projects. Let me know how I can assist you.";

const HIRING_CTA_LINE = "If helpful, Gaurav would be happy to discuss how he can contribute to your team.";

const OUT_OF_SCOPE_TERMS = [
  "weather",
  "temperature",
  "stock price",
  "crypto",
  "sports score",
  "news",
  "politics",
  "election",
  "capital of",
  "solve this math",
  "recipe",
  "movie recommendation",
  "translate this",
  "write code for",
  "debug my code",
];

const IN_SCOPE_TERMS = [
  "gaurav",
  "you",
  "your",
  "portfolio",
  "resume",
  "project",
  "skills",
  "hire",
  "intern",
  "contact",
  "social",
  "blog",
  "experience",
  "education",
  "chatbot",
  "tech stack",
];

const getLastTurnByRole = (history, role) => {
  if (!Array.isArray(history)) return "";
  for (let i = history.length - 1; i >= 0; i -= 1) {
    if (history[i]?.role === role) {
      const text = getTurnText(history[i]);
      if (text) return text;
    }
  }
  return "";
};

const getRecentTurnsByRole = (history, role, limit = 3) => {
  if (!Array.isArray(history)) return [];
  return history
    .filter((turn) => turn?.role === role)
    .map((turn) => getTurnText(turn))
    .filter(Boolean)
    .slice(-limit);
};

const isClearlyOutOfScope = (message, history = []) => {
  const q = toLower(message);
  if (!q) return false;
  if (includesAny(q, IN_SCOPE_TERMS)) return false;
  if (!includesAny(q, OUT_OF_SCOPE_TERMS)) return false;

  const maybeFollowUp = q.split(/\s+/).length <= 8 && includesAny(q, ["this", "that", "it", "which one", "why", "how"]);
  if (!maybeFollowUp) return true;

  const prevUser = toLower(getLastTurnByRole(history, "user"));
  if (prevUser && includesAny(prevUser, IN_SCOPE_TERMS)) return false;
  return true;
};

const isAbusiveMessage = (message) => includesAny(message, ABUSIVE_TERMS);

const detectIntentFromMessage = (message, history = []) => {
  const q = toLower(message);
  const has = (terms) => includesAny(q, terms);

  if (isAbusiveMessage(q)) return "abusive";
  if (has(INTENT_TERMS.greeting)) return "greeting";
  if (has(INTENT_TERMS.social)) return "social";
  if (has(INTENT_TERMS.portfolioWhy)) return "portfolio_why";
  if (has(INTENT_TERMS.portfolioBuild)) return "portfolio_build";
  if (has(INTENT_TERMS.studentGuidance)) return "student_guidance";
  if (has(INTENT_TERMS.hiring)) return "hiring";
  if (has(INTENT_TERMS.projects)) return "projects";
  if (has(INTENT_TERMS.skills)) return "skills";
  if (has(INTENT_TERMS.education)) return "education";
  if (has(INTENT_TERMS.goals)) return "goals";
  if (has(INTENT_TERMS.blogs)) return "blogs";
  if (has(INTENT_TERMS.contact)) return "contact";
  if (has(INTENT_TERMS.faq)) return "faq";
  if (has(INTENT_TERMS.smallTalk)) return "small_talk";
  if (isClearlyOutOfScope(message, history)) return "out_of_scope";
  return "other";
};

const getPreviousIntentFromHistory = (history = []) => {
  if (!Array.isArray(history)) return "";

  for (let i = history.length - 1; i >= 0; i -= 1) {
    if (history[i]?.role !== "user") continue;

    const priorMessage = getTurnText(history[i]);
    if (!priorMessage) continue;

    const priorIntent = detectIntentFromMessage(priorMessage, history.slice(0, i));
    if (!priorIntent) continue;
    if (["other", "greeting", "small_talk", "out_of_scope", "abusive"].includes(priorIntent)) continue;

    return priorIntent;
  }

  return "";
};

const isFollowUpMessage = (message) => {
  const text = normalizeSpace(message);
  if (!text || text.length >= 40) return false;
  return includesAny(text, FOLLOW_UP_TERMS);
};

const detectIntentMeta = (message, history = []) => {
  const normalizedMessage = normalizeSpace(message);
  const previousIntent = getPreviousIntentFromHistory(history);

  if (isAbusiveMessage(normalizedMessage)) {
    return {
      intent: "abusive",
      followUp: false,
      previousIntent,
    };
  }

  if (isFollowUpMessage(normalizedMessage) && previousIntent && FOLLOW_UP_ELIGIBLE_INTENTS.has(previousIntent)) {
    return {
      intent: previousIntent,
      followUp: true,
      previousIntent,
    };
  }

  return {
    intent: detectIntentFromMessage(normalizedMessage, history),
    followUp: false,
    previousIntent,
  };
};

const detectIntent = (message, history = []) => detectIntentMeta(message, history).intent;

const scoreTextMatch = (text, tokens) => {
  let score = 0;
  for (const token of tokens) {
    if (!text.includes(token)) continue;
    score += token.length >= 5 ? 2 : 1;
  }
  return score;
};

const rankItems = (items, query, toText, limit = 5) => {
  const tokens = tokenize(query);
  if (!tokens.length) return safeArray(items).slice(0, limit);

  return safeArray(items)
    .map((item) => ({
      item,
      score: scoreTextMatch(toLower(toText(item)), tokens),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.item)
    .slice(0, limit);
};

const buildProjectSearchText = (project) =>
  toLower(
    project?.searchText ||
      `${project?.name || ""} ${project?.description || ""} ${safeArray(project?.techStack).join(" ")} ${safeArray(project?.categories).join(" ")}`
  );

const scoreProjectSemanticMatch = (project, queryText, queryTokens) => {
  const searchText = buildProjectSearchText(project);
  if (!searchText || !queryTokens.length) return 0;

  const searchTokens = searchText.split(/[^a-z0-9]+/).filter(Boolean);
  const tokenSet = new Set(searchTokens);
  let score = 0;

  for (const token of queryTokens) {
    if (tokenSet.has(token)) {
      score += token.length >= 5 ? 3 : 2;
      continue;
    }

    if (searchText.includes(token)) {
      score += token.length >= 5 ? 2 : 1;
      continue;
    }

    const partialMatch = searchTokens.some((candidate) => {
      if (candidate.startsWith(token) || token.startsWith(candidate)) return true;
      if (token.length < 4) return false;
      return candidate.includes(token.slice(0, token.length - 1));
    });

    if (partialMatch) score += 1;
  }

  const compactQuery = queryText.replace(/[^a-z0-9]+/g, " ").trim();
  const compactProjectName = toLower(project?.name || "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  if (compactQuery && compactProjectName && (compactProjectName.includes(compactQuery) || compactQuery.includes(compactProjectName))) {
    score += 3;
  }

  return score;
};

const scoreProjectBoost = (project, intentTag = "other") => {
  const categories = safeArray(project?.categories).map((item) => toLower(item));
  const techStack = safeArray(project?.techStack).map((item) => toLower(item));
  let boost = 0;

  if (categories.includes("full stack")) boost += 2;
  if (categories.includes("ai/ml")) boost += 2;
  if (techStack.includes("socket.io")) boost += 2;
  if (techStack.includes("mongodb")) boost += 1;
  if (intentTag === "hiring") boost += 3;
  if (intentTag === "project" || intentTag === "projects") boost += 2;

  return boost;
};

const rankProjects = (projects, query, intentTag = "other", limit = 5) => {
  const queryText = toLower(query);
  const queryTokens = tokenize(query);

  return safeArray(projects)
    .map((project, index) => {
      const semanticScore = scoreProjectSemanticMatch(project, queryText, queryTokens);
      const boostScore = scoreProjectBoost(project, intentTag);
      return {
        item: project,
        score: semanticScore + boostScore,
        semanticScore,
        boostScore,
        index,
      };
    })
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.semanticScore - a.semanticScore ||
        b.boostScore - a.boostScore ||
        a.index - b.index
    )
    .map((entry) => entry.item)
    .slice(0, limit);
};

const findMatchingProjects = (query, intentTag = "other", limit = 5) => rankProjects(GAURAV.projects, query, intentTag, limit);

const findMatchingBlogs = (query) =>
  rankItems(
    GAURAV.blogs,
    query,
    (blog) =>
      `${blog?.title || ""} ${blog?.excerpt || ""} ${safeArray(blog?.tags).join(" ")} ${blog?.category || ""}`,
    4
  );

const findBestFaq = (query) => {
  const q = toLower(query);
  const faqEntries = GAURAV.faq;
  if (!faqEntries.length) return null;

  const exact = faqEntries.find((item) => q.includes(toLower(item.q)));
  if (exact) return exact;

  const tokens = tokenize(query);
  let best = null;
  let bestScore = 0;

  for (const item of faqEntries) {
    const haystack = toLower(item.q);
    const score = scoreTextMatch(haystack, tokens);
    if (score > bestScore) {
      bestScore = score;
      best = item;
    }
  }

  return bestScore > 0 ? best : null;
};

const toProjectSummary = (project) => {
  const summary = {
    name: project?.name || "Project",
    description: firstSentence(project?.description || ""),
    techStack: safeArray(project?.techStack).slice(0, 6),
    categories: safeArray(project?.categories).slice(0, 3),
  };

  if (project?.github && project.github !== "#") summary.github = project.github;
  if (project?.demo && project.demo !== "#") summary.demo = project.demo;

  return summary;
};

const toBlogSummary = (blog) => ({
  title: blog?.title || "Blog",
  category: blog?.category || "",
  excerpt: firstSentence(blog?.excerpt || ""),
  date: blog?.date || "",
  tags: safeArray(blog?.tags).slice(0, 4),
  ...(blog?.url ? { url: blog.url } : {}),
});

const buildSkillsSnapshot = (skills = {}) => ({
  strongest: normalizeSpace(GAURAV.voice.strongestSkill || GAURAV.voice.whatMakesMeDifferent),
  languages: safeArray(skills?.programmingLanguages).slice(0, 5),
  frontend: safeArray(skills?.frontend).slice(0, 4),
  backend: safeArray(skills?.backend).slice(0, 4),
  aiMl: safeArray(skills?.dataScienceAI).slice(0, 6),
  databases: safeArray(skills?.databases).slice(0, 3),
});

const buildStudentGuidanceSnapshot = () => ({
  philosophy: normalizeSpace(GAURAV.voice.workStyle || GAURAV.voice.whatMakesMeDifferent),
  dsaView: "DSA is important for problem-solving and interviews, so I practice it consistently.",
  languageAdvice: "Start with one language and build projects regularly instead of chasing the perfect stack.",
  currentlyLearning: normalizeSpace(GAURAV.voice.currentlyLearning),
});

const buildHiringSnapshot = (message) => {
  const topProjects = findMatchingProjects(message, "hiring", 3);
  const bestProject = topProjects[0] || GAURAV.projects[0] || {};
  const bestProjectSummary =
    normalizeSpace(GAURAV.voice.bestProject) || firstSentence(bestProject?.description || "");

  return {
    strongestSkills: buildSkillsSnapshot(GAURAV.skills),
    bestProjectHighlight: {
      name: bestProject?.name || "Project",
      summary: bestProjectSummary,
    },
    topProjects: topProjects.map(toProjectSummary).slice(0, 3),
    availability:
      normalizeSpace(GAURAV.recruiterSignals?.availability) ||
      normalizeSpace(GAURAV.voice.openToOpportunities) ||
      "Open to opportunities.",
    recruiterSignals: {
      strengths: safeArray(GAURAV.recruiterSignals?.strengths).slice(0, 4),
      targetRoles: safeArray(GAURAV.recruiterSignals?.targetRoles).slice(0, 3),
      workStyle: normalizeSpace(GAURAV.recruiterSignals?.workStyle || GAURAV.voice.workStyle),
      whyHire: normalizeSpace(GAURAV.recruiterSignals?.whyHire || GAURAV.voice.forRecruiters),
    },
  };
};

const buildConversationHints = (history) => {
  const recentAssistantReplies = getRecentTurnsByRole(history, "model", 3);
  const lastUserQuestion = getLastTurnByRole(history, "user");

  if (!recentAssistantReplies.length && !lastUserQuestion) return null;

  const compactReplies = recentAssistantReplies.map((reply) => firstSentence(reply)).filter(Boolean);

  return {
    lastUserQuestion: lastUserQuestion || "",
    recentAssistantReplies: compactReplies,
    avoidRepeatingOpeners: compactReplies,
  };
};

const buildContext = (message, history = [], intentMetaInput = null) => {
  const intentMeta =
    intentMetaInput && typeof intentMetaInput === "object" ? intentMetaInput : detectIntentMeta(message, history);
  const intent = intentMeta?.intent || "other";
  const matchedProjects = findMatchingProjects(message, intent, intent === "hiring" ? 3 : 5);
  const matchedBlogs = findMatchingBlogs(message);
  const faqMatch = findBestFaq(message);
  const hints = buildConversationHints(history);
  const skillsSnapshot = buildSkillsSnapshot(GAURAV.skills);

  const context = {
    identity: {
      name: GAURAV.personal.name,
      title: GAURAV.personal.title,
      location: GAURAV.personal.location,
      bio: GAURAV.personal.bio,
    },
    contact: GAURAV.contact,
    openTo: GAURAV.personal.openTo,
    intentTag: intent,
  };

  if (intentMeta?.followUp) {
    context.followUp = {
      enabled: true,
      previousIntent: intentMeta.previousIntent || "",
    };
  }

  if (intent === "social" || intent === "contact") {
    context.socialLinks = GAURAV.socialLinks;
  }

  if (intent === "portfolio_why" || intent === "portfolio_build") {
    context.portfolioMeta = GAURAV.portfolioMeta;
  }

  if (intent === "projects" || intent === "portfolio_build") {
    context.projects = matchedProjects.map(toProjectSummary).slice(0, 5);
  }

  if (intent === "skills" || intent === "portfolio_build") {
    context.skillsSnapshot = skillsSnapshot;
    context.techStackDetailed = {
      frontend: safeArray(GAURAV.techStackDetailed?.frontend).slice(0, 5),
      backend: safeArray(GAURAV.techStackDetailed?.backend).slice(0, 5),
      aiMl: safeArray(GAURAV.techStackDetailed?.aiMl || GAURAV.techStackDetailed?.aiML).slice(0, 5),
    };
  }

  if (intent === "hiring") {
    const hiringSnapshot = buildHiringSnapshot(message);
    context.hiring = hiringSnapshot;
    context.projects = hiringSnapshot.topProjects;
    context.skillsSnapshot = hiringSnapshot.strongestSkills;
    context.recruiterSignals = hiringSnapshot.recruiterSignals;
    context.availability = hiringSnapshot.availability;
    context.bestProjectHighlight = hiringSnapshot.bestProjectHighlight;
  }

  if (intent === "education") {
    context.education = safeArray(GAURAV.education).slice(0, 3);
  }

  if (intent === "goals") {
    context.goals = {
      shortTerm: GAURAV.voice.shortTermGoals,
      longTerm: GAURAV.voice.longTermGoals,
      currentlyLearning: GAURAV.voice.currentlyLearning,
    };
  }

  if (intent === "blogs") {
    context.blogs = (matchedBlogs.length ? matchedBlogs : GAURAV.blogs.slice(0, 4)).map(toBlogSummary);
  }

  if (intent === "faq" && faqMatch) {
    context.faq = [faqMatch];
  }

  if (intent === "student_guidance") {
    context.studentGuidance = buildStudentGuidanceSnapshot();
    context.projects = findMatchingProjects(message, "projects", 2).map(toProjectSummary);
  }

  if (intent === "abusive") {
    context.responsePolicy = "Stay professional and redirect to portfolio-related help.";
  }

  if (intent === "other" || intent === "greeting" || intent === "small_talk") {
    context.skillsSnapshot = skillsSnapshot;
    context.projects = findMatchingProjects("", "projects", 3).map(toProjectSummary);
    context.recruiterSignals = {
      strengths: safeArray(GAURAV.recruiterSignals?.strengths).slice(0, 3),
      targetRoles: safeArray(GAURAV.recruiterSignals?.targetRoles).slice(0, 3),
    };
    context.voice = {
      currentlyLearning: GAURAV.voice.currentlyLearning,
      forRecruiters: GAURAV.voice.forRecruiters,
    };
  }

  if (hints) {
    context.conversationHints = hints;
  }

  return context;
};

const SYSTEM_PROMPT = `
You are Gaurav AI, the portfolio copilot for Gaurav Kumar Yadav.

Mission:
- Help recruiters and visitors evaluate Gaurav quickly and accurately.
- Use only provided context data.

Strict rules:
1. Speak in first person as Gaurav ("I", "my", "me").
2. Do not invent experience, projects, links, or achievements.
3. Be concise and specific. Prefer evidence from real projects.
4. Do not repeat the same opening sentence or same bullets from recent assistant replies.
5. If asked "why did you build this portfolio?", explain motivation and purpose.
6. If asked "what did you use to build this portfolio?", answer with structured stack details.
7. If asked for social links, provide all available links from context.
8. For recruiter/hiring questions, answer with strongest evidence first.
9. For out-of-scope questions, reply briefly that you only cover Gaurav's portfolio/work and redirect to contact page.
10. If information is missing, say it briefly and share contact page.
11. For student guidance questions, answer briefly from my own build-first learning journey.
12. If the user is rude, stay calm and redirect to portfolio/work topics.

Response style:
- Keep answers natural, confident, and helpful.
- Use short bullet points for lists.
- Avoid hype, buzzwords, and long repeated biography paragraphs.
`.trim();

const buildGeminiContents = (message, history, contextJson) => {
  const systemWithContext = `${SYSTEM_PROMPT}\n\nCONTEXT_DATA_JSON:\n${contextJson}`;
  const contents = [];

  contents.push({
    role: "user",
    parts: [{ text: systemWithContext }],
  });
  contents.push({
    role: "model",
    parts: [{ text: "Understood. I will answer as Gaurav using only this context and avoid repeating prior responses." }],
  });

  if (Array.isArray(history) && history.length > 0) {
    const trimmed = history.slice(-12);
    for (const turn of trimmed) {
      if (turn?.role !== "user" && turn?.role !== "model") continue;
      const text = getTurnText(turn);
      if (!text) continue;
      contents.push({
        role: turn.role,
        parts: [{ text }],
      });
    }
  }

  contents.push({
    role: "user",
    parts: [{ text: message }],
  });

  return contents;
};

const formatSocialLinks = (links) =>
  safeArray(links)
    .map((link) => `- ${link.name}: ${link.url}`)
    .join("\n");

const buildProjectLine = (project) => {
  const title = project?.name || "Project";
  const desc = normalizeSpace(project?.description || "");
  const oneLineDesc = desc.split(".")[0] || desc;
  const stack = safeArray(project?.techStack).slice(0, 6).join(", ");
  return `- ${title}: ${oneLineDesc}${stack ? ` (Stack: ${stack})` : ""}`;
};

const fallbackReply = (message, history = [], forcedIntent = "") => {
  const intent = forcedIntent || detectIntentMeta(message, history).intent;
  const q = toLower(message);
  const contact = GAURAV.contact;

  if (intent === "abusive") {
    return ABUSIVE_REPLY;
  }

  if (intent === "greeting") {
    return "Hi, I am Gaurav. Ask me about my projects, tech stack, hiring availability, or social links.";
  }

  if (intent === "small_talk") {
    const learningRaw = GAURAV.voice.currentlyLearning || "improving DSA and AI/ML fundamentals";
    const learning = String(learningRaw)
      .replace(/^i[' ]?m\s+/i, "")
      .replace(/^i am\s+/i, "")
      .replace(/[.!\s]+$/, "");
    return `Doing well. I am currently focused on ${learning}. I am also shipping projects consistently.`;
  }

  if (intent === "portfolio_why") {
    return [
      GAURAV.portfolioMeta.whyBuilt,
      "",
      "I built it to:",
      ...GAURAV.portfolioMeta.purpose.map((item) => `- ${item}`),
    ].join("\n");
  }

  if (intent === "portfolio_build") {
    const stack = GAURAV.portfolioMeta.stack;
    return [
      "I built this portfolio with:",
      `- Frontend: ${stack.frontend.join(", ")}`,
      `- Backend: ${stack.backend.join(", ")}`,
      `- AI Chat: ${stack.aiChat.join(", ")}`,
      `- Deployment: ${stack.deployment.join(", ")}`,
    ].join("\n");
  }

  if (intent === "social" || intent === "contact") {
    return [
      "You can reach me here:",
      `- Email: ${contact.email}`,
      `- Portfolio: ${contact.portfolio}`,
      `- Contact page: ${contact.contactPage}`,
      "",
      "Social links:",
      formatSocialLinks(GAURAV.socialLinks),
    ].join("\n");
  }

  if (intent === "hiring") {
    const hiring = buildHiringSnapshot(message);
    return [
      "Quick hiring snapshot:",
      `- Strongest skills: ${hiring.strongestSkills.strongest}`,
      `- Best project: ${hiring.bestProjectHighlight.name} - ${hiring.bestProjectHighlight.summary}`,
      "- Top projects:",
      ...hiring.topProjects.map(buildProjectLine),
      `- Availability: ${hiring.availability}`,
      `- Target roles: ${safeArray(hiring.recruiterSignals.targetRoles).join(", ")}`,
      `- Key signals: ${safeArray(hiring.recruiterSignals.strengths).slice(0, 3).join("; ")}`,
      `- Contact: ${contact.email} | ${contact.contactPage}`,
    ].join("\n");
  }

  if (intent === "skills") {
    const skills = buildSkillsSnapshot(GAURAV.skills);
    return [
      "My current stack:",
      `- Languages: ${safeArray(skills.languages).join(", ")}`,
      `- Frontend: ${safeArray(skills.frontend).join(", ")}`,
      `- Backend: ${safeArray(skills.backend).join(", ")}`,
      `- AI/ML: ${safeArray(skills.aiMl).join(", ")}`,
      `- Databases: ${safeArray(skills.databases).join(", ")}`,
    ].join("\n");
  }

  if (intent === "projects") {
    const matches = findMatchingProjects(message, intent, 4);
    const selected = matches.length ? matches.slice(0, 4) : GAURAV.projects.slice(0, 4);
    return ["Project highlights:", ...selected.map(buildProjectLine)].join("\n");
  }

  if (intent === "student_guidance") {
    const guide = buildStudentGuidanceSnapshot();
    return [
      "How I approach learning coding:",
      `- ${guide.philosophy}`,
      `- ${guide.languageAdvice}`,
      `- ${guide.dsaView}`,
      `- What I am focused on now: ${guide.currentlyLearning}`,
    ].join("\n");
  }

  if (intent === "blogs") {
    const matches = findMatchingBlogs(message);
    const selected = matches.length ? matches.slice(0, 4) : GAURAV.blogs.slice(0, 4);
    if (!selected.length) {
      return "I publish blogs on AI, cybersecurity, and learning in public. You can read them at https://ggauravky.vercel.app/blog";
    }
    return [
      "Recent blog topics:",
      ...selected.map((blog) => `- ${blog.title}${blog.url ? `: ${blog.url}` : ""}`),
    ].join("\n");
  }

  if (intent === "education") {
    return GAURAV.education
      .map((entry) => `- ${entry.degree || "Program"} - ${entry.institution || "Institution"}`)
      .join("\n");
  }

  if (intent === "goals") {
    return [
      `Short-term: ${GAURAV.voice.shortTermGoals}`,
      `Long-term: ${GAURAV.voice.longTermGoals}`,
    ].join("\n");
  }

  if (intent === "faq") {
    const faq = findBestFaq(message);
    if (faq) return faq.a;
  }

  if (intent === "out_of_scope") {
    return `I focus on questions about my portfolio, projects, skills, and hiring availability. For anything else, please use: ${contact.contactPage}`;
  }

  if (includesAny(q, ["tasknexus"])) {
    const faq = findBestFaq("tasknexus");
    if (faq) return faq.a;
  }

  return `${GAURAV.personal.bio}\n\nIf you want specifics, ask about my projects, stack, hiring availability, or social links.`;
};

const maybeAppendHiringCTA = (reply, intentTag) => {
  if (intentTag !== "hiring") return reply;

  const normalizedReply = String(reply || "").trim();
  if (!normalizedReply || normalizedReply.length <= 400) return normalizedReply;
  if (includesAny(normalizedReply, ["happy to discuss how he can contribute", "contribute to your team"])) {
    return normalizedReply;
  }

  return `${normalizedReply}\n\n${HIRING_CTA_LINE}`;
};

const dedupeReplyLines = (reply) => {
  const lines = String(reply || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const seen = new Set();
  const unique = [];

  for (const line of lines) {
    const key = toLower(line.replace(/[^a-z0-9]+/g, " ").trim());
    if (!key) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(line);
  }

  return unique.join("\n");
};

const normalizeForCompare = (value) =>
  toLower(value)
    .replace(/[^a-z0-9\s]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const jaccardSimilarity = (a, b) => {
  const setA = new Set(a.split(" ").filter(Boolean));
  const setB = new Set(b.split(" ").filter(Boolean));
  if (!setA.size || !setB.size) return 0;

  let intersection = 0;
  for (const token of setA) {
    if (setB.has(token)) intersection += 1;
  }
  const union = new Set([...setA, ...setB]).size;
  return union ? intersection / union : 0;
};

const isNearDuplicate = (a, b) => {
  const left = normalizeForCompare(a);
  const right = normalizeForCompare(b);
  if (!left || !right) return false;
  if (left === right) return true;

  if ((left.includes(right) || right.includes(left)) && Math.min(left.length, right.length) > 120) {
    return true;
  }

  return jaccardSimilarity(left, right) >= 0.9;
};

const processGeminiReply = ({ message, history, intentTag, rawReply }) => {
  let reply = dedupeReplyLines(rawReply);
  reply = String(reply || "")
    .replace(/\r/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (!reply) {
    return {
      reply: fallbackReply(message, history, intentTag),
      source: "fallback",
      degraded: true,
    };
  }

  const lower = toLower(reply);
  if (includesAny(lower, ["as an ai language model", "i cannot browse"])) {
    return {
      reply: fallbackReply(message, history, intentTag),
      source: "fallback",
      degraded: true,
    };
  }

  const lastAssistant = getLastTurnByRole(history, "model");
  if (lastAssistant && isNearDuplicate(reply, lastAssistant)) {
    return {
      reply: fallbackReply(message, history, intentTag),
      source: "fallback",
      degraded: true,
    };
  }

  return {
    reply,
    source: "gemini",
    degraded: false,
  };
};

const extractGeminiReply = (payload) => {
  const parts = payload?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return "";
  return parts
    .map((part) => part?.text || "")
    .join("")
    .trim();
};

const isRateLimited = (status, errorMessage) => {
  const msg = toLower(errorMessage);
  return (
    status === 429 ||
    msg.includes("429") ||
    msg.includes("quota") ||
    msg.includes("rate limit") ||
    msg.includes("resource exhausted")
  );
};

const SUPPORTED_MODELS = new Set([
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-pro",
  "gemini-2.5-flash-preview-05-20",
]);

export const config = {
  runtime: "nodejs",
};

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, reply: "Method not allowed." });
  }

  const startTime = Date.now();

  const ipAddress = (
    req.headers["x-real-ip"] ||
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    "unknown"
  ).replace(/^::ffff:/, "");
  const userAgent = String(req.headers["user-agent"] || "unknown").slice(0, 300);
  const referrer = String(req.headers["referer"] || req.headers["referrer"] || "direct").slice(0, 300);
  const countryCode = String(req.headers["x-vercel-ip-country"] || "unknown");
  const region = String(req.headers["x-vercel-ip-country-region"] || "unknown");
  const city = String(req.headers["x-vercel-ip-city"] || "unknown");
  const timezone = String(req.headers["x-vercel-ip-timezone"] || "unknown");

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};

    const message = normalizeSpace(body.message || "");
    const history = Array.isArray(body.history) ? body.history : [];
    const sessionId = String(body.sessionId || req.headers["x-session-id"] || "unknown").slice(0, 64);
    const messageIndex = parseInt(body.messageIndex, 10) || 0;

    if (!message) {
      return res.status(400).json({ success: false, reply: "Please provide a valid message." });
    }

    const intentMeta = detectIntentMeta(message, history);
    const intentTag = intentMeta.intent;

    if (intentTag === "abusive") {
      const reply = ABUSIVE_REPLY;

      await saveChatLog(message, reply, {
        source: "fallback",
        degraded: false,
        model: "rules",
        responseTimeMs: Date.now() - startTime,
        sessionId,
        messageIndex,
        historyLength: history.length,
        messageLength: message.length,
        intentTag,
        ipAddress,
        userAgent,
        referrer,
        countryCode,
        city,
        region,
        timezone,
        country: countryCode,
      });

      return res.status(200).json({ success: true, reply });
    }

    if (intentTag === "out_of_scope") {
      const reply = fallbackReply(message, history, "out_of_scope");

      await saveChatLog(message, reply, {
        source: "fallback",
        degraded: false,
        model: "rules",
        responseTimeMs: Date.now() - startTime,
        sessionId,
        messageIndex,
        historyLength: history.length,
        messageLength: message.length,
        intentTag,
        ipAddress,
        userAgent,
        referrer,
        countryCode,
        city,
        region,
        timezone,
        country: countryCode,
      });

      return res.status(200).json({ success: true, reply });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const requestedModel = process.env.GEMINI_MODEL || "gemini-2.0-flash";
    const model = SUPPORTED_MODELS.has(requestedModel) ? requestedModel : "gemini-2.0-flash";

    if (!apiKey) {
      const reply = maybeAppendHiringCTA(fallbackReply(message, history, intentTag), intentTag);

      await saveChatLog(message, reply, {
        source: "fallback",
        degraded: true,
        model: "none",
        responseTimeMs: Date.now() - startTime,
        sessionId,
        messageIndex,
        historyLength: history.length,
        messageLength: message.length,
        intentTag,
        ipAddress,
        userAgent,
        referrer,
        countryCode,
        city,
        region,
        timezone,
        country: countryCode,
      });

      return res.status(200).json({ success: true, degraded: true, reply });
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const contextObj = buildContext(message, history, intentMeta);
    const contextJson = JSON.stringify(contextObj);
    const contents = buildGeminiContents(message, history, contextJson);

    const geminiResponse = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.55,
          maxOutputTokens: 512,
          topP: 0.9,
          topK: 40,
        },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        ],
      }),
    });

    let payload = {};
    try {
      payload = await geminiResponse.json();
    } catch {
      payload = {};
    }

    const geminiText = extractGeminiReply(payload);
    const apiErrorMessage = payload?.error?.message || "";

    if (!geminiResponse.ok || !geminiText) {
      const reply = maybeAppendHiringCTA(fallbackReply(message, history, intentTag), intentTag);

      if (!isRateLimited(geminiResponse.status, apiErrorMessage)) {
        console.error("Gemini error:", apiErrorMessage || "Empty response");
      }

      await saveChatLog(message, reply, {
        source: "fallback",
        degraded: true,
        model,
        responseTimeMs: Date.now() - startTime,
        sessionId,
        messageIndex,
        historyLength: history.length,
        messageLength: message.length,
        intentTag,
        ipAddress,
        userAgent,
        referrer,
        countryCode,
        city,
        region,
        timezone,
        country: countryCode,
      });

      return res.status(200).json({ success: true, degraded: true, reply });
    }

    const processed = processGeminiReply({
      message,
      history,
      intentTag,
      rawReply: geminiText,
    });

    const finalReply = maybeAppendHiringCTA(processed.reply, intentTag);

    await saveChatLog(message, finalReply, {
      source: processed.source,
      degraded: processed.degraded,
      model,
      responseTimeMs: Date.now() - startTime,
      sessionId,
      messageIndex,
      historyLength: history.length,
      messageLength: message.length,
      intentTag,
      ipAddress,
      userAgent,
      referrer,
      countryCode,
      city,
      region,
      timezone,
      country: countryCode,
    });

    if (processed.degraded) {
      return res.status(200).json({ success: true, degraded: true, reply: finalReply });
    }

    return res.status(200).json({ success: true, reply: finalReply });
  } catch (error) {
    console.error("Vercel chat error:", error?.message || error);
    const bodyMessage = normalizeSpace(typeof req.body === "object" ? req.body?.message : "");
    const safeIntent = detectIntent(bodyMessage || "", []);
    const fallback = maybeAppendHiringCTA(fallbackReply(bodyMessage || "", [], safeIntent), safeIntent);
    return res.status(200).json({ success: true, degraded: true, reply: fallback });
  }
}

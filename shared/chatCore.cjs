const path = require("node:path");
const fs = require("node:fs");

const toLower = (value) => String(value || "").toLowerCase();
const normalizeSpace = (value) => String(value || "").replaceAll(/\s+/g, " ").trim();
const safeArray = (value) => (Array.isArray(value) ? value : []);

const includesAny = (text, terms) => {
  const source = toLower(text);
  return terms.some((term) => source.includes(toLower(term)));
};

const DEFAULT_CONTACT = {
  email: "kumar.gaurav.yadav2007@gmail.com",
  portfolio: "https://ggauravky.vercel.app",
  linkedin: "https://www.linkedin.com/in/gauravky/",
  github: "https://github.com/ggauravky",
  contactPage: "https://ggauravky.vercel.app/contact",
};

const DEFAULT_VOICE = {
  currentlyLearning:
    "I'm currently improving my DSA, advanced AI/ML concepts, MERN scalability, and system design fundamentals.",
  whatMakesMeDifferent:
    "I build real projects, not just tutorials. My consistency mindset and build-in-public approach is what sets me apart.",
};

const dataCandidates = [
  path.join(__dirname, "../backend/data/gauravData.json"),
  path.join(__dirname, "../api/data/gauravData.json"),
  path.join(__dirname, "../public/data/gauravData.json"),
  path.join(process.cwd(), "backend/data/gauravData.json"),
  path.join(process.cwd(), "api/data/gauravData.json"),
  path.join(process.cwd(), "public/data/gauravData.json"),
];

let knowledge = null;

function loadKnowledge() {
  if (knowledge) return knowledge;

  for (const filePath of dataCandidates) {
    try {
      const raw = fs.readFileSync(filePath, "utf8");
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        knowledge = parsed;
        return knowledge;
      }
    } catch {
      // Try next path.
    }
  }

  knowledge = {};
  return knowledge;
}

const findMatchingProjects = (query, projects) => {
  const tokens = toLower(query).split(/\s+/).filter((token) => token.length > 2);
  return safeArray(projects).filter((project) => {
    const haystack = toLower(
      `${project.name || ""} ${project.description || ""} ${safeArray(project.techStack).join(" ")}`
    );
    return tokens.some((token) => haystack.includes(token));
  });
};

const findMatchingBlogs = (query, blogs) => {
  const tokens = toLower(query).split(/\s+/).filter((token) => token.length > 2);
  return safeArray(blogs).filter((blog) => {
    const haystack = toLower(
      `${blog.title || ""} ${blog.excerpt || ""} ${safeArray(blog.tags).join(" ")} ${blog.category || ""}`
    );
    return tokens.some((token) => haystack.includes(token));
  });
};

function buildRelevantContext(userMessage) {
  const data = loadKnowledge();
  const query = toLower(userMessage);

  if (includesAny(query, ["hi", "hello", "hey", "howdy", "sup", "greetings", "how are you"])) {
    return JSON.stringify({ personal: data.personal || {}, voice: data.voice || {} });
  }

  const context = {
    personal: data.personal || {},
    voice: data.voice || {},
    contact: data.contact || DEFAULT_CONTACT,
    faq: safeArray(data.faq).slice(0, 4),
  };

  if (includesAny(query, ["skill", "tech", "stack", "language", "tool", "python", "react", "ai", "ml"])) {
    context.skills = data.skills || {};
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
    const matches = findMatchingProjects(query, data.projects);
    context.projects = matches.length ? matches.slice(0, 5) : safeArray(data.projects).slice(0, 5);
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
    const matches = findMatchingBlogs(query, data.blogs);
    context.blogs = matches.length ? matches.slice(0, 4) : safeArray(data.blogs).slice(0, 4);
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
    context.education = safeArray(data.education);
  }

  if (includesAny(query, ["experience", "achievement", "work", "certification"])) {
    context.experience = safeArray(data.experience);
    context.achievements = safeArray(data.achievements);
  }

  if (includesAny(query, ["interest", "hobby", "focus area"])) {
    context.interests = safeArray(data.interests);
  }

  if (Object.keys(context).length <= 4) {
    context.skills = data.skills || {};
    context.projects = safeArray(data.projects).slice(0, 3);
  }

  return JSON.stringify(context);
}

function buildSystemPrompt(contextJson) {
  return `
You ARE Gaurav Kumar Yadav himself - a BCA student from Lucknow, India who is an aspiring AI/ML and Full-Stack Developer. You are speaking directly to recruiters, collaborators, and visitors who are checking out your portfolio.

Speak ENTIRELY in FIRST PERSON. Always use "I", "my", "me", "I'm", "I've", "I built", "I'm working on". NEVER say "Gaurav does..." or "He built..." or refer to yourself in third person.

Your personality: direct, confident, thoughtful, build-first mindset. Not robotic. Not overly formal. Like you're on a relaxed but professional video call.

RULES - follow strictly:
1. FIRST PERSON ALWAYS: You are Gaurav speaking. Every response must use "I", "my", "me". Never third person.
2. GREETINGS & SMALL TALK: If the user says hi/hello or asks "how are you", respond warmly and briefly as yourself, then guide back to portfolio topics.
3. ON-TOPIC ONLY: Answer only questions about your skills, projects, education, experience, goals, or availability, using the provided context.
4. NO HALLUCINATIONS: Never invent details not in the context.
5. MISSING INFO: If something isn't in the context, say: "I don't have that detail handy right now. You can reach me directly at https://ggauravky.vercel.app/contact"
6. OFF-TOPIC: If the question has nothing to do with you (general knowledge, other people, coding tutorials), say: "That's a bit outside my lane! I'm here to talk about myself and my work. Feel free to reach me directly: https://ggauravky.vercel.app/contact"
7. SPECIAL QUESTIONS: If asked "why should I choose/hire you", answer with concrete strengths and project evidence. If asked "why you made this portfolio" or "what stack you used to build this", answer directly.
8. TONE: Confident, warm, brief - like a developer who knows what they're about. Not stiff. Not verbose.
9. FORMAT: Short bullet points when listing things. Keep replies concise and scannable. Avoid long paragraphs.

Context about me (Gaurav):
${contextJson}
`.trim();
}

function buildFallbackReply(userMessage) {
  const data = loadKnowledge();
  const query = toLower(userMessage);
  const personal = data.personal || {};
  const voice = data.voice
    ? { ...DEFAULT_VOICE, ...data.voice }
    : { ...DEFAULT_VOICE };
  const contact = data.contact
    ? { ...DEFAULT_CONTACT, ...data.contact }
    : { ...DEFAULT_CONTACT };
  const faq = safeArray(data.faq).map((item) => ({
    question: normalizeSpace(item.question || item.q),
    answer: normalizeSpace(item.answer || item.a),
  }));

  if (includesAny(query, ["hi", "hello", "hey", "howdy", "sup", "greetings"])) {
    return "Hey! I'm Gaurav. Feel free to ask me anything about what I build, what I know, or whether I'm available.";
  }

  if (includesAny(query, ["how are you", "how's it going", "what's up"])) {
    return "I'm doing great and focused on building projects. Right now I'm improving my DSA and AI/ML fundamentals while shipping real products.";
  }

  const faqMatch = faq.find((item) => toLower(item.question).includes(query) || query.includes(toLower(item.question)));
  if (faqMatch?.answer) return faqMatch.answer;

  if (includesAny(query, ["intern", "hire", "freelance", "open", "availability", "opportunity"])) {
    const openTo = safeArray(personal.openTo);
    if (openTo.length) {
      return `Yes, I'm currently open to:\n- ${openTo.join("\n- ")}\n\nReach me at ${contact.contactPage}.`;
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
    return `Great question. Here's why I can add value quickly:\n- Built and deployed 12+ real projects\n- Strong in both MERN and Python/Flask stacks\n- Hands-on with real-time systems\n- Practical AI/ML direction with IIT Mandi certification\n\nContact: ${contact.contactPage}`;
  }

  if (includesAny(query, ["contact", "email", "linkedin", "github", "reach", "social", "links"])) {
    return `Here's how you can reach me:\n- Email: ${contact.email}\n- Portfolio: ${contact.portfolio}\n- LinkedIn: ${contact.linkedin}\n- GitHub: ${contact.github}`;
  }

  if (includesAny(query, ["goal", "future", "plan", "vision", "long term", "short term"])) {
    return voice.shortTermGoals || "I'm focused on strengthening my AI/ML and DSA fundamentals while shipping real projects.";
  }

  if (includesAny(query, ["learn", "study", "currently", "improving"])) {
    return voice.currentlyLearning;
  }

  if (includesAny(query, ["different", "unique", "stand out", "why you", "why hire", "choose you"])) {
    return voice.whatMakesMeDifferent;
  }

  const bio = personal.bio || "I'm Gaurav - a developer focused on AI/ML and full-stack engineering.";
  return `${bio}\n\nWant to connect? ${contact.contactPage}`;
}

function detectIntent(message) {
  const q = toLower(message);
  if (includesAny(q, ["hi", "hello", "hey", "howdy", "sup", "greetings", "how are you"])) return "greeting";
  if (includesAny(q, ["why you made this", "why did you make this", "why build this portfolio", "purpose of this portfolio", "what did you use to build this", "how did you build this portfolio", "tech stack of this portfolio"])) return "portfolio";
  if (includesAny(q, ["intern", "hire", "available", "freelance", "job", "recruit", "role", "why hire", "why should", "what makes", "different", "why choose you", "why i choose you", "why should i choose you"])) return "hiring";
  if (includesAny(q, ["skill", "tech", "stack", "language", "python", "react", "node", "ai", "ml", "framework", "tool"])) return "skills";
  if (includesAny(q, ["project", "built", "build", "app", "chat", "mern", "aireel", "notes", "grocery", "shopease", "tasknexus"])) return "projects";
  if (includesAny(q, ["education", "college", "degree", "iit", "bca", "mandi", "bbdu", "certification"])) return "education";
  if (includesAny(q, ["goal", "future", "plan", "learn", "studying", "improving", "currently"])) return "goals";
  if (includesAny(q, ["blog", "article", "write", "wrote", "post", "published"])) return "blogs";
  if (includesAny(q, ["contact", "email", "linkedin", "github", "reach", "social", "instagram", "twitter", "x.com", "kaggle", "leetcode", "geeksforgeeks", "whatsapp", "links"])) return "contact";
  return "other";
}

function buildChatLogShape(meta) {
  return {
    source: meta.source || "gemini",
    degraded: Boolean(meta.degraded),
    model: meta.model || "unknown",
    responseTimeMs: meta.responseTimeMs || null,
    sessionId: String(meta.sessionId || "unknown").slice(0, 64),
    messageIndex: Number(meta.messageIndex || 0),
    historyLength: Number(meta.historyLength || 0),
    messageLength: Number(meta.messageLength || 0),
    intentTag: meta.intentTag || "other",
    referrer: String(meta.referrer || "direct").slice(0, 300),
    country: meta.country || "unknown",
    countryCode: meta.countryCode || "unknown",
    city: meta.city || "unknown",
    region: meta.region || "unknown",
    timezone: meta.timezone || "unknown",
  };
}

module.exports = {
  buildRelevantContext,
  buildSystemPrompt,
  buildFallbackReply,
  detectIntent,
  buildChatLogShape,
};

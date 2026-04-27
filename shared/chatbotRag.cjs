const fs = require("node:fs");
const path = require("node:path");

const STOP_WORDS = new Set([
  "a",
  "about",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "can",
  "do",
  "for",
  "from",
  "have",
  "how",
  "i",
  "in",
  "is",
  "it",
  "me",
  "my",
  "of",
  "on",
  "or",
  "please",
  "tell",
  "the",
  "to",
  "what",
  "which",
  "who",
  "with",
  "you",
  "your",
]);

const RELATED_SECTIONS = {
  profile: ["experience", "journey", "skills", "availability", "hiring"],
  hiring: ["profile", "experience", "projects", "skills", "achievements", "availability"],
  projects: ["experience", "skills", "achievements"],
  skills: ["profile", "projects", "current-focus", "experience"],
  services: ["profile", "availability"],
  blogs: ["interests", "profile"],
  journey: ["profile", "experience", "education", "goals"],
  experience: ["projects", "skills", "journey", "achievements"],
  education: ["profile", "journey", "experience"],
  availability: ["contact", "profile", "hiring"],
  achievements: ["experience", "projects", "hiring"],
  initiatives: ["goals", "profile", "experience"],
  "current-focus": ["profile", "skills", "journey", "goals"],
  "work-style": ["profile", "experience", "hiring", "goals"],
  goals: ["journey", "profile", "initiatives", "current-focus"],
  interests: ["profile", "blogs", "projects"],
};

const dataCandidates = [
  path.join(__dirname, "../data/portfolioData.json"),
  path.join(process.cwd(), "data/portfolioData.json"),
  path.join(__dirname, "../backend/data/portfolioData.json"),
  path.join(process.cwd(), "backend/data/portfolioData.json"),
  path.join(__dirname, "../api/data/portfolioData.json"),
  path.join(process.cwd(), "api/data/portfolioData.json"),
  path.join(__dirname, "../public/data/portfolioData.json"),
  path.join(process.cwd(), "public/data/portfolioData.json"),
];

let cachedPortfolioData = null;
let cachedKnowledgeChunks = null;

const toLower = (value) => String(value || "").toLowerCase();

const normalizeText = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const safeArray = (value) => (Array.isArray(value) ? value : []);

const safeObject = (value) =>
  value && typeof value === "object" && !Array.isArray(value) ? value : {};

const unique = (items) => [...new Set(safeArray(items).filter(Boolean))];

const tokenize = (value) =>
  normalizeText(value)
    .split(" ")
    .filter((token) => token && token.length > 1 && !STOP_WORDS.has(token));

const trimText = (value, maxLength = 180) => {
  const text = String(value || "").trim();
  if (!text) {
    return "";
  }

  return text.length > maxLength ? `${text.slice(0, maxLength - 3).trim()}...` : text;
};

const sentence = (value) => {
  const text = trimText(value, 300);
  if (!text) {
    return "";
  }

  return /[.!?]$/.test(text) ? text : `${text}.`;
};

const formatInlineList = (items, limit = 5) => {
  const values = unique(safeArray(items).map((item) => String(item || "").trim())).slice(0, limit);
  if (!values.length) {
    return "";
  }

  if (values.length === 1) {
    return values[0];
  }

  if (values.length === 2) {
    return `${values[0]} and ${values[1]}`;
  }

  return `${values.slice(0, -1).join(", ")}, and ${values[values.length - 1]}`;
};

const formatBullets = (items) =>
  safeArray(items)
    .filter(Boolean)
    .map((item) => `- ${item}`)
    .join("\n");

function readPortfolioData() {
  if (cachedPortfolioData) {
    return cachedPortfolioData;
  }

  for (const filePath of dataCandidates) {
    try {
      const raw = fs.readFileSync(filePath, "utf8");
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        cachedPortfolioData = parsed;
        return cachedPortfolioData;
      }
    } catch {
      // Try the next location.
    }
  }

  cachedPortfolioData = {};
  return cachedPortfolioData;
}

function buildChunk({
  id,
  section,
  title,
  text,
  keywords = [],
  payload = null,
  entityType = "",
  entityName = "",
}) {
  const normalizedTitle = normalizeText(title);
  const normalizedText = normalizeText(text);
  const normalizedKeywords = unique(keywords.map((keyword) => normalizeText(keyword)));

  return {
    id,
    section,
    title,
    text,
    payload,
    entityType,
    entityName,
    keywords: normalizedKeywords,
    normalizedTitle,
    normalizedText,
    searchText: [
      section,
      entityType,
      entityName,
      normalizedTitle,
      normalizedText,
      normalizedKeywords.join(" "),
    ]
      .filter(Boolean)
      .join(" ")
      .trim(),
  };
}

function buildKnowledgeChunks() {
  if (cachedKnowledgeChunks) {
    return cachedKnowledgeChunks;
  }

  const data = readPortfolioData();
  const chunks = [];
  const profile = safeObject(data.profile);
  const skills = safeObject(data.skills);
  const voice = safeObject(data.voice);

  chunks.push(
    buildChunk({
      id: "profile-overview",
      section: "profile",
      title: "Profile Overview",
      text: [
        profile.name,
        profile.preferredName,
        profile.headline,
        profile.role,
        profile.location,
        profile.bio,
        safeArray(profile.strengths).join(" "),
        safeArray(profile.currentFocus).join(" "),
      ]
        .filter(Boolean)
        .join(" "),
      keywords: [
        profile.name,
        profile.preferredName,
        "about",
        "background",
        "introduction",
        "profile",
      ],
      payload: profile,
    })
  );

  chunks.push(
    buildChunk({
      id: "profile-availability",
      section: "availability",
      title: "Availability and Roles",
      text: [
        safeArray(profile?.availability?.openTo).join(" "),
        safeArray(profile?.availability?.targetRoles).join(" "),
        safeArray(profile?.availability?.workModes).join(" "),
      ]
        .filter(Boolean)
        .join(" "),
      keywords: [
        "availability",
        "internship",
        "hire",
        "open to",
        "freelance",
        "roles",
        "work mode",
      ],
      payload: profile?.availability || {},
    })
  );

  chunks.push(
    buildChunk({
      id: "profile-contact",
      section: "contact",
      title: "Contact Information",
      text: Object.values(profile.contact || {}).join(" "),
      keywords: ["contact", "email", "github", "linkedin", "portfolio", "reach out"],
      payload: profile.contact || {},
    })
  );

  safeArray(profile.education).forEach((item, index) => {
    chunks.push(
      buildChunk({
        id: `education-${index + 1}`,
        section: "education",
        title: `${item.degree || "Education"} at ${item.institution || "Institution"}`,
        text: Object.values(item).join(" "),
        keywords: [
          "education",
          "college",
          "university",
          item.degree,
          item.institution,
          item.location,
        ],
        payload: item,
        entityType: "education",
        entityName: item.degree || item.institution || `education-${index + 1}`,
      })
    );
  });

  chunks.push(
    buildChunk({
      id: "skills-summary",
      section: "skills",
      title: "Skills Summary",
      text: safeArray(skills.summary).join(" "),
      keywords: ["skills", "technology", "tech stack", "tools", "expertise"],
      payload: skills.summary || [],
    })
  );

  safeArray(skills.categories).forEach((category, index) => {
    chunks.push(
      buildChunk({
        id: `skills-category-${index + 1}`,
        section: "skills",
        title: category.name || `Skill Category ${index + 1}`,
        text: safeArray(category.items).join(" "),
        keywords: [category.name, ...safeArray(category.items)],
        payload: category,
        entityType: "skill-category",
        entityName: category.name || `skill-category-${index + 1}`,
      })
    );
  });

  safeArray(data.projects).forEach((project, index) => {
    const projectTitle = project.title || project.slug || `Project ${index + 1}`;
    chunks.push(
      buildChunk({
        id: `project-${index + 1}`,
        section: "projects",
        title: projectTitle,
        text: [
          project.category,
          project.summary,
          project.problem,
          safeArray(project.highlights).join(" "),
          safeArray(project.techStack).join(" "),
          Object.values(project.links || {}).join(" "),
        ]
          .filter(Boolean)
          .join(" "),
        keywords: [
          project.title,
          project.slug,
          project.category,
          ...safeArray(project.techStack),
          ...safeArray(project.highlights),
          ...safeArray(project.aliases),
        ],
        payload: project,
        entityType: "project",
        entityName: projectTitle,
      })
    );
  });

  safeArray(data.services).forEach((service, index) => {
    const serviceTitle = service.title || service.slug || `Service ${index + 1}`;
    chunks.push(
      buildChunk({
        id: `service-${index + 1}`,
        section: "services",
        title: serviceTitle,
        text: [
          service.category,
          service.priceLabel,
          service.summary,
          service.deliveryWindow,
          safeArray(service.bestFor).join(" "),
        ]
          .filter(Boolean)
          .join(" "),
        keywords: [
          service.title,
          service.slug,
          service.category,
          "services",
          "offer",
          "pricing",
          "hire",
        ],
        payload: service,
        entityType: "service",
        entityName: serviceTitle,
      })
    );
  });

  safeArray(data.blogs).forEach((blog, index) => {
    const blogTitle = blog.title || blog.slug || `Blog ${index + 1}`;
    chunks.push(
      buildChunk({
        id: `blog-${index + 1}`,
        section: "blogs",
        title: blogTitle,
        text: [blog.date, blog.category, blog.summary, safeArray(blog.tags).join(" ")]
          .filter(Boolean)
          .join(" "),
        keywords: [blog.title, blog.slug, blog.category, ...safeArray(blog.tags), "blog", "article"],
        payload: blog,
        entityType: "blog",
        entityName: blogTitle,
      })
    );
  });

  safeArray(data.journey).forEach((entry, index) => {
    chunks.push(
      buildChunk({
        id: `journey-${index + 1}`,
        section: "journey",
        title: entry.title || entry.stage || `Journey ${index + 1}`,
        text: [entry.stage, entry.summary].filter(Boolean).join(" "),
        keywords: [entry.stage, entry.title, "journey", "background", "experience"],
        payload: entry,
        entityType: "journey",
        entityName: entry.title || entry.stage || `journey-${index + 1}`,
      })
    );
  });

  safeArray(data.experience).forEach((entry, index) => {
    chunks.push(
      buildChunk({
        id: `experience-${index + 1}`,
        section: "experience",
        title: entry.type || `Experience ${index + 1}`,
        text: [entry.summary, safeArray(entry.evidence).join(" ")].filter(Boolean).join(" "),
        keywords: [entry.type, "experience", "work", "proof", ...safeArray(entry.evidence)],
        payload: entry,
        entityType: "experience",
        entityName: entry.type || `experience-${index + 1}`,
      })
    );
  });

  if (safeArray(data.interests).length) {
    chunks.push(
      buildChunk({
        id: "interests",
        section: "interests",
        title: "Professional Interests",
        text: safeArray(data.interests).join(" "),
        keywords: ["interests", "industries", "domains", "excited about", ...safeArray(data.interests)],
        payload: data.interests,
      })
    );
  }

  if (safeArray(data.achievements).length) {
    chunks.push(
      buildChunk({
        id: "achievements",
        section: "achievements",
        title: "Achievements",
        text: safeArray(data.achievements).join(" "),
        keywords: ["achievements", "highlights", "certification", "proof"],
        payload: data.achievements,
      })
    );
  }

  safeArray(data.initiatives).forEach((entry, index) => {
    const initiativeName = entry.name || `Initiative ${index + 1}`;
    chunks.push(
      buildChunk({
        id: `initiative-${index + 1}`,
        section: "initiatives",
        title: initiativeName,
        text: [entry.status, entry.summary].filter(Boolean).join(" "),
        keywords: [entry.name, entry.status, "initiative", "startup", "platform"],
        payload: entry,
        entityType: "initiative",
        entityName: initiativeName,
      })
    );
  });

  const voiceFields = [
    {
      key: "whatMakesMeDifferent",
      id: "voice-differentiators",
      section: "hiring",
      title: "What makes Gaurav different",
      keywords: ["why hire", "what makes you different", "different", "strengths", "value"],
    },
    {
      key: "workStyle",
      id: "voice-work-style",
      section: "work-style",
      title: "Work Style",
      keywords: ["work style", "how do you work", "approach", "build-first"],
    },
    {
      key: "consistency",
      id: "voice-consistency",
      section: "work-style",
      title: "Consistency and Execution",
      keywords: ["consistency", "discipline", "routine", "execution"],
    },
    {
      key: "debuggingApproach",
      id: "voice-debugging",
      section: "work-style",
      title: "Debugging Approach",
      keywords: ["debugging", "problem solving", "root cause", "how do you debug"],
    },
    {
      key: "shortTermGoals",
      id: "voice-short-term-goals",
      section: "goals",
      title: "Short Term Goals",
      keywords: ["short term goals", "next 6 months", "next year", "goals"],
    },
    {
      key: "longTermGoals",
      id: "voice-long-term-goals",
      section: "goals",
      title: "Long Term Goals",
      keywords: ["long term goals", "future", "3 years", "5 years"],
    },
    {
      key: "preferredEnvironment",
      id: "voice-preferred-environment",
      section: "work-style",
      title: "Preferred Work Environment",
      keywords: ["team", "environment", "culture", "what kind of team"],
    },
    {
      key: "strongestSkill",
      id: "voice-strongest-skill",
      section: "skills",
      title: "Strongest Skill",
      keywords: ["strongest skill", "best skill", "core strength"],
    },
    {
      key: "currentlyLearning",
      id: "voice-currently-learning",
      section: "current-focus",
      title: "Current Learning Focus",
      keywords: ["currently learning", "current focus", "working on", "improving"],
    },
    {
      key: "bestProject",
      id: "voice-best-project",
      section: "projects",
      title: "Strongest Project",
      keywords: ["best project", "strongest project", "favorite project", "proudest project"],
    },
    {
      key: "hardestChallenge",
      id: "voice-hardest-challenge",
      section: "experience",
      title: "Hardest Challenge",
      keywords: ["hardest challenge", "difficult problem", "challenge", "async", "real-time"],
    },
    {
      key: "excitedAbout",
      id: "voice-excited-about",
      section: "interests",
      title: "What Excites Gaurav",
      keywords: ["excited about", "interested in", "what kind of work"],
    },
    {
      key: "forRecruiters",
      id: "voice-recruiters",
      section: "hiring",
      title: "Recruiter Summary",
      keywords: ["recruiter", "hire", "why you", "why should we hire you"],
    },
    {
      key: "openToOpportunities",
      id: "voice-open-to-opportunities",
      section: "availability",
      title: "Opportunity Openness",
      keywords: ["open to", "internship", "opportunities", "available"],
    },
    {
      key: "teamCommunication",
      id: "voice-team-communication",
      section: "work-style",
      title: "Team Communication",
      keywords: ["communication", "collaboration", "async", "teamwork"],
    },
  ];

  voiceFields.forEach((field) => {
    const rawValue = voice[field.key];
    const text = Array.isArray(rawValue) ? rawValue.join(" ") : String(rawValue || "");
    if (!text.trim()) {
      return;
    }

    chunks.push(
      buildChunk({
        id: field.id,
        section: field.section,
        title: field.title,
        text,
        keywords: field.keywords,
        payload: rawValue,
      })
    );
  });

  safeArray(data.faq).forEach((entry, index) => {
    chunks.push(
      buildChunk({
        id: `faq-${index + 1}`,
        section: "faq",
        title: entry.question || `FAQ ${index + 1}`,
        text: [entry.question, entry.answer].filter(Boolean).join(" "),
        keywords: [entry.question, "faq", "question", "answer"],
        payload: entry,
        entityType: "faq",
        entityName: entry.question || `faq-${index + 1}`,
      })
    );
  });

  cachedKnowledgeChunks = chunks;
  return cachedKnowledgeChunks;
}

function detectIntent(message) {
  const query = normalizeText(message);

  if (/why should|why hire|what makes you different|why you|recruiter|stand out/.test(query)) {
    return "hiring";
  }

  if (/currently learning|current focus|working on right now|what are you learning|improving/.test(query)) {
    return "current-focus";
  }

  if (/work environment|work style|team culture|preferred environment|what kind of team|how do you work|communication|debug/.test(query)) {
    return "work-style";
  }

  if (/short term goal|long term goal|future plan|career goal|where do you see yourself|goal/.test(query)) {
    return "goals";
  }

  if (/initiative|startup|tasknexus/.test(query)) {
    return "initiatives";
  }

  if (
    /service|services|offer|pricing|book|mentorship|resume review|portfolio review|debugging help|frontend development|backend development|full stack development|guidance/.test(
      query
    )
  ) {
    return "services";
  }

  if (
    /project|build|built|app|platform|product|smartmess|chat app|truecert|focusguard|buildmyteam|grocery|notes|portfolio admin|taskmaster|dishdash/.test(
      query
    )
  ) {
    return "projects";
  }

  if (
    /skill|tech stack|technology|tools|language|python|javascript|react|node|express|mongodb|ml|ai|data science|frontend|backend/.test(
      query
    )
  ) {
    return "skills";
  }

  if (/blog|article|write|wrote|post|content|cybersecurity|deepseek|india/.test(query)) {
    return "blogs";
  }

  if (/journey|background|story|started|roadmap|path|growth/.test(query)) {
    return "journey";
  }

  if (/experience|worked on|proof of work/.test(query)) {
    return "experience";
  }

  if (/education|college|university|bbdu|iit mandi|degree|student/.test(query)) {
    return "education";
  }

  if (/contact|email|linkedin|github|reach|available|open to|internship/.test(query)) {
    return "availability";
  }

  if (/achievement|certification|proof|highlight/.test(query)) {
    return "achievements";
  }

  if (/interest|excited about|industries|domain/.test(query)) {
    return "interests";
  }

  if (/who are you|about you|introduce yourself|tell me about yourself|gaurav/.test(query)) {
    return "profile";
  }

  return "general";
}

function scoreChunk({ query, tokens, intent, chunk }) {
  let score = 0;

  if (!chunk || !chunk.searchText) {
    return score;
  }

  if (query && chunk.searchText.includes(query)) {
    score += 18;
  }

  if (query && chunk.normalizedTitle && query.includes(chunk.normalizedTitle)) {
    score += 22;
  }

  if (query && chunk.normalizedTitle && chunk.normalizedTitle.includes(query)) {
    score += 12;
  }

  if (intent !== "general" && chunk.section === intent) {
    score += 10;
  }

  if (RELATED_SECTIONS[intent]?.includes(chunk.section)) {
    score += 4;
  }

  if (intent === "projects" && chunk.section === "projects" && chunk.payload?.featured) {
    score += 4;
  }

  if (intent === "skills" && chunk.id === "skills-summary") {
    score += 4;
  }

  if (intent === "availability" && (chunk.section === "contact" || chunk.section === "availability")) {
    score += 6;
  }

  if (intent === "profile" && chunk.id === "profile-overview") {
    score += 6;
  }

  if (/tech stack|built with|what did you use|technology/.test(query) && chunk.section === "projects") {
    score += 6;
  }

  if (/price|pricing|cost|charge|fee/.test(query) && chunk.section === "services") {
    score += 6;
  }

  if (/contact|email|linkedin|github/.test(query) && chunk.section === "contact") {
    score += 8;
  }

  for (const token of tokens) {
    if (chunk.keywords.includes(token)) {
      score += 6;
      continue;
    }

    if (chunk.normalizedTitle.includes(token)) {
      score += 4;
    }

    if (chunk.normalizedText.includes(token)) {
      score += 2;
    }
  }

  return score;
}

function searchRelevantChunks(message, { limit = 6 } = {}) {
  const query = normalizeText(message);
  const tokens = tokenize(message);
  const intent = detectIntent(message);
  const chunks = buildKnowledgeChunks();

  const scored = chunks
    .map((chunk) => ({
      ...chunk,
      score: scoreChunk({ query, tokens, intent, chunk }),
    }))
    .filter((chunk) => chunk.score > 0)
    .sort(
      (left, right) =>
        right.score - left.score ||
        Number(Boolean(right.payload?.featured)) - Number(Boolean(left.payload?.featured)) ||
        left.title.localeCompare(right.title)
    );

  const topChunks = scored.slice(0, limit);
  const topScore = topChunks[0]?.score || 0;
  const isRelevant = topScore >= 8 || (intent !== "general" && topScore >= 6);

  return {
    intent,
    topScore,
    isRelevant,
    chunks: topChunks,
  };
}

function buildContext(chunks) {
  return safeArray(chunks)
    .map((chunk, index) => {
      const payload = safeObject(chunk.payload);

      if (chunk.section === "projects") {
        return [
          `[${index + 1}] PROJECT - ${chunk.title}`,
          `Summary: ${chunk.text}`,
          payload.problem ? `Problem: ${payload.problem}` : null,
          safeArray(payload.techStack).length
            ? `Tech stack: ${safeArray(payload.techStack).join(", ")}`
            : null,
          safeArray(payload.highlights).length
            ? `Highlights: ${safeArray(payload.highlights).join(", ")}`
            : null,
        ]
          .filter(Boolean)
          .join("\n");
      }

      if (chunk.section === "services") {
        return [
          `[${index + 1}] SERVICE - ${chunk.title}`,
          `Summary: ${chunk.text}`,
          payload.priceLabel ? `Pricing: ${payload.priceLabel}` : null,
          payload.deliveryWindow ? `Delivery: ${payload.deliveryWindow}` : null,
        ]
          .filter(Boolean)
          .join("\n");
      }

      return `[${index + 1}] ${String(chunk.section || "").toUpperCase()} - ${chunk.title}\n${chunk.text}`;
    })
    .join("\n\n");
}

function buildSystemPrompt() {
  return [
    "You are Gaurav Kumar Yadav's AI assistant.",
    "Answer only from the provided portfolio context.",
    "If the answer is not clearly supported by the context, say you do not know based on the current portfolio data.",
    "Do not answer unrelated general knowledge questions.",
    "Do not invent achievements, timelines, metrics, clients, company names, prices, or experience.",
    "Speak in first person as Gaurav when it feels natural.",
    "Keep responses concise, factual, and helpful.",
    "Use short bullet points only when listing multiple items.",
  ].join("\n");
}

function buildOutOfScopeReply() {
  return "I can only help with questions about Gaurav Kumar Yadav, his projects, skills, services, blogs, and journey.";
}

function buildNoAnswerReply() {
  return "I do not know based on the current portfolio data.";
}

function dedupePayloads(items, keyPicker) {
  const seen = new Set();
  return safeArray(items).filter((item) => {
    const key = normalizeText(keyPicker(item));
    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function getPayloadsBySection(chunks, section) {
  return dedupePayloads(
    safeArray(chunks)
      .filter((chunk) => chunk.section === section && chunk.payload)
      .map((chunk) => chunk.payload),
    (item) => item.title || item.name || item.slug || item.question || item.type
  );
}

function findEntityByQuery(message, items, options = {}) {
  const query = normalizeText(message);
  const keys = safeArray(options.keys).length ? options.keys : ["title", "name", "slug"];
  let bestItem = null;
  let bestScore = 0;

  safeArray(items).forEach((item) => {
    const values = keys
      .map((key) => item?.[key])
      .flat()
      .filter(Boolean)
      .map((value) => String(value));

    const candidates = unique([...values, ...safeArray(item?.aliases)]);
    let score = 0;

    candidates.forEach((candidate) => {
      const normalizedCandidate = normalizeText(candidate);
      if (!normalizedCandidate) {
        return;
      }

      if (query.includes(normalizedCandidate)) {
        score += normalizedCandidate.split(" ").length > 1 ? 18 : 12;
      }

      tokenize(candidate).forEach((token) => {
        if (query.includes(token)) {
          score += 2;
        }
      });
    });

    if (score > bestScore) {
      bestScore = score;
      bestItem = item;
    }
  });

  return bestScore >= 8 ? bestItem : null;
}

function findBestChunk(chunks, section) {
  return safeArray(chunks)
    .filter((chunk) => !section || chunk.section === section)
    .sort((left, right) => right.score - left.score)[0];
}

function findBestFaqMatch(message, chunks) {
  const query = normalizeText(message);
  const queryTokens = tokenize(message);
  let best = null;
  let bestScore = 0;

  getPayloadsBySection(chunks, "faq").forEach((faq) => {
    const question = normalizeText(faq.question);
    let score = 0;

    if (query && question.includes(query)) {
      score += 18;
    }

    if (query && query.includes(question)) {
      score += 18;
    }

    queryTokens.forEach((token) => {
      if (question.includes(token)) {
        score += 3;
      }
    });

    if (score > bestScore) {
      bestScore = score;
      best = faq;
    }
  });

  return bestScore >= 10 ? best : null;
}

function findProjectFromChunks(message, chunks, data) {
  return (
    findEntityByQuery(message, data.projects, { keys: ["title", "slug"] }) ||
    getPayloadsBySection(chunks, "projects")[0] ||
    null
  );
}

function findServiceFromChunks(message, chunks, data) {
  return (
    findEntityByQuery(message, data.services, { keys: ["title", "slug"] }) ||
    getPayloadsBySection(chunks, "services")[0] ||
    null
  );
}

function findBlogFromChunks(message, chunks, data) {
  return (
    findEntityByQuery(message, data.blogs, { keys: ["title", "slug", "category"] }) ||
    getPayloadsBySection(chunks, "blogs")[0] ||
    null
  );
}

function findInitiativeFromChunks(message, chunks, data) {
  return (
    findEntityByQuery(message, data.initiatives, { keys: ["name", "status"] }) ||
    getPayloadsBySection(chunks, "initiatives")[0] ||
    null
  );
}

function findSkillMatches(message, data) {
  const query = normalizeText(message);
  const matchedCategories = safeArray(data?.skills?.categories).filter((category) =>
    [category.name, ...safeArray(category.items)].some((item) => query.includes(normalizeText(item)))
  );

  return matchedCategories;
}

function buildProfileReply(data) {
  const profile = safeObject(data.profile);
  const currentFocus = formatInlineList(profile.currentFocus, 4);
  const strengths = formatInlineList(profile.strengths, 3);
  const openTo = formatInlineList(profile?.availability?.openTo, 4);

  return [
    sentence(profile.bio || `${profile.name} is ${profile.headline || profile.role || "a developer"}`),
    currentFocus ? `Right now I am focused on ${currentFocus}.` : "",
    strengths ? `My strengths are ${strengths}.` : "",
    openTo ? `I am open to ${openTo}.` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function buildHiringReply(data) {
  const voice = safeObject(data.voice);
  const profile = safeObject(data.profile);
  const featuredProjects = safeArray(data.projects)
    .filter((project) => project.featured)
    .slice(0, 3)
    .map((project) => project.title);

  return [
    sentence(voice.forRecruiters || voice.whatMakesMeDifferent),
    `Proof of work: ${formatInlineList(featuredProjects, 3)}.`,
    profile.currentFocus?.length
      ? `Right now I am strengthening ${formatInlineList(profile.currentFocus, 4)}.`
      : "",
    profile.availability?.targetRoles?.length
      ? `I am targeting ${formatInlineList(profile.availability.targetRoles, 3)} roles.`
      : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function buildCurrentFocusReply(data) {
  const voice = safeObject(data.voice);
  const profile = safeObject(data.profile);
  const focus = voice.currentlyLearning || formatInlineList(profile.currentFocus, 5);
  const interests = formatInlineList(data.interests, 4);

  return [
    focus ? sentence(focus) : "",
    interests ? `I am especially interested in ${interests}.` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function buildWorkStyleReply(data) {
  const voice = safeObject(data.voice);

  return [
    sentence(voice.preferredEnvironment),
    voice.workStyle ? `My working style is simple: ${trimText(voice.workStyle, 220)}` : "",
    voice.teamCommunication ? `In teams, ${trimText(voice.teamCommunication, 180)}` : "",
    voice.debuggingApproach ? `My debugging approach: ${trimText(voice.debuggingApproach, 180)}` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function buildGoalsReply(data) {
  const voice = safeObject(data.voice);

  return [
    voice.shortTermGoals ? `Short term: ${trimText(voice.shortTermGoals, 220)}` : "",
    voice.longTermGoals ? `Long term: ${trimText(voice.longTermGoals, 220)}` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function buildProjectReply(project, message) {
  if (!project) {
    return "";
  }

  const query = normalizeText(message);
  const techStack = formatInlineList(project.techStack, 7);
  const highlights = safeArray(project.highlights).slice(0, 4);
  const links = safeObject(project.links);

  if (/tech stack|stack|built with|what did you use|which technologies|technology/.test(query)) {
    return techStack
      ? `I built ${project.title} with ${techStack}.`
      : `I do not know the exact tech stack for ${project.title} based on the current portfolio data.`;
  }

  if (/github|repo|source code|demo|live|link/.test(query)) {
    const linkLines = [
      links.github && links.github !== "#" ? `GitHub: ${links.github}` : "",
      links.demo && links.demo !== "#" ? `Demo: ${links.demo}` : "",
    ].filter(Boolean);

    if (linkLines.length) {
      return [`Here are the main links for ${project.title}:`, ...linkLines.map((line) => `- ${line}`)].join("\n");
    }
  }

  if (/feature|highlight|capabilit|what can it do/.test(query)) {
    if (highlights.length) {
      return [`Key highlights of ${project.title}:`, ...highlights.map((item) => `- ${item}`)].join("\n");
    }
  }

  if (/problem|solve|purpose|why did you build/.test(query)) {
    const problem = sentence(project.problem || project.summary);
    return `${project.title} was built to solve this problem: ${problem}`;
  }

  if (/strongest|best|favorite|proudest|why/.test(query)) {
    return [
      `${project.title} is one of my strongest projects.`,
      sentence(project.summary),
      project.problem ? `It addresses ${trimText(project.problem, 180)}` : "",
      techStack ? `I built it with ${techStack}.` : "",
      highlights.length ? `Key highlights include ${formatInlineList(highlights, 4)}.` : "",
    ]
      .filter(Boolean)
      .join(" ");
  }

  return [
    `${project.title} is ${trimText(project.summary, 180)}`,
    project.problem ? `It addresses ${trimText(project.problem, 180)}` : "",
    techStack ? `I used ${techStack}.` : "",
    highlights.length ? `Highlights: ${formatInlineList(highlights, 4)}.` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function buildStrongestProjectReply(data) {
  const voice = safeObject(data.voice);
  const hintedProject =
    findEntityByQuery(voice.bestProject, data.projects, { keys: ["title", "slug"] }) ||
    safeArray(data.projects).find((project) => project.title === "Real-Time Chat App") ||
    safeArray(data.projects).find((project) => project.featured) ||
    null;

  if (!hintedProject) {
    return sentence(voice.bestProject);
  }

  return [
    sentence(voice.bestProject || `${hintedProject.title} is one of my strongest projects.`),
    hintedProject.techStack?.length
      ? `Tech stack: ${formatInlineList(hintedProject.techStack, 7)}.`
      : "",
    hintedProject.highlights?.length
      ? `Highlights: ${formatInlineList(hintedProject.highlights, 4)}.`
      : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function buildProjectsReply(chunks, data) {
  const allProjects = safeArray(data.projects);
  const projects =
    allProjects.length > 0
      ? allProjects
          .slice()
          .sort(
            (left, right) =>
              Number(Boolean(right.featured)) - Number(Boolean(left.featured)) ||
              String(left.title || "").localeCompare(String(right.title || ""))
          )
          .slice(0, 6)
      : getPayloadsBySection(chunks, "projects").slice(0, 5);
  if (!projects.length) {
    return "";
  }

  return [
    "Here are some of the projects I have built:",
    ...projects.map((project) => `- ${project.title}: ${trimText(project.summary, 120)}`),
  ].join("\n");
}

function buildSkillsReply(data, chunks, message) {
  const query = normalizeText(message);
  const voice = safeObject(data.voice);
  const matchedCategories = findSkillMatches(message, data);

  if (/strongest skill|best skill|core strength/.test(query) && voice.strongestSkill) {
    return sentence(voice.strongestSkill);
  }

  if (matchedCategories.length) {
    return matchedCategories
      .slice(0, 3)
      .map(
        (category) =>
          `${category.name}: ${formatInlineList(category.items, 6)}.`
      )
      .join(" ");
  }

  const skillCategories = getPayloadsBySection(chunks, "skills")
    .filter((entry) => Array.isArray(entry.items))
    .slice(0, 4);

  if (skillCategories.length) {
    return [
      "My stack includes:",
      ...skillCategories.map(
        (category) => `- ${category.name}: ${safeArray(category.items).slice(0, 6).join(", ")}`
      ),
    ].join("\n");
  }

  return "";
}

function buildServiceReply(service, message) {
  if (!service) {
    return "";
  }

  const query = normalizeText(message);
  const details = [
    sentence(service.summary),
    service.priceLabel ? `Pricing: ${service.priceLabel}.` : "",
    service.deliveryWindow ? `Delivery window: ${service.deliveryWindow}` : "",
    safeArray(service.bestFor).length
      ? `Best for ${formatInlineList(service.bestFor, 4)}.`
      : "",
  ].filter(Boolean);

  if (/price|pricing|cost|charge|fee/.test(query)) {
    return [
      `${service.title}:`,
      service.priceLabel ? `Price: ${service.priceLabel}` : "Price is not listed in the current portfolio data.",
      service.deliveryWindow ? `Delivery: ${service.deliveryWindow}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }

  return details.join(" ");
}

function buildServicesReply(chunks, data) {
  const services = safeArray(data.services).length
    ? safeArray(data.services).slice(0, 8)
    : getPayloadsBySection(chunks, "services").slice(0, 6);
  if (!services.length) {
    return "";
  }

  return [
    "I currently offer:",
    ...services.map((service) => `- ${service.title}: ${trimText(service.summary, 110)}`),
  ].join("\n");
}

function buildBlogReply(blog) {
  if (!blog) {
    return "";
  }

  return [
    `${blog.title}${blog.category ? ` is in ${blog.category}` : ""}${blog.date ? ` and was published on ${blog.date}` : ""}.`,
    sentence(blog.summary),
    safeArray(blog.tags).length ? `Main tags: ${formatInlineList(blog.tags, 5)}.` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function buildBlogsReply(chunks, data) {
  const blogs = safeArray(data.blogs).length
    ? safeArray(data.blogs)
        .slice()
        .sort((left, right) => String(right.date || "").localeCompare(String(left.date || "")))
        .slice(0, 6)
    : getPayloadsBySection(chunks, "blogs").slice(0, 5);
  if (!blogs.length) {
    return "";
  }

  return [
    "I have written about:",
    ...blogs.map(
      (blog) =>
        `- ${blog.title}${blog.category ? ` (${blog.category})` : ""}: ${trimText(blog.summary, 105)}`
    ),
  ].join("\n");
}

function buildJourneyReply(chunks) {
  const journey = getPayloadsBySection(chunks, "journey").slice(0, 4);
  if (!journey.length) {
    return "";
  }

  return [
    "My journey in short:",
    ...journey.map((entry) => `- ${entry.title}: ${trimText(entry.summary, 120)}`),
  ].join("\n");
}

function buildExperienceReply(chunks, data) {
  const experience = getPayloadsBySection(chunks, "experience").slice(0, 3);
  if (experience.length) {
    return [
      "My experience is mainly built through shipped work:",
      ...experience.map((entry) => `- ${entry.type}: ${trimText(entry.summary, 120)}`),
    ].join("\n");
  }

  return buildJourneyReply(chunks) || buildProfileReply(data);
}

function buildAvailabilityReply(data, message) {
  const query = normalizeText(message);
  const profile = safeObject(data.profile);
  const contact = safeObject(profile.contact);
  const availability = safeObject(profile.availability);

  if (/email/.test(query) && contact.email) {
    return `You can reach me at ${contact.email}.`;
  }

  if (/linkedin/.test(query) && contact.linkedin) {
    return `My LinkedIn is ${contact.linkedin}.`;
  }

  if (/github/.test(query) && contact.github) {
    return `My GitHub is ${contact.github}.`;
  }

  if (/contact|reach/.test(query) && (contact.contactPage || contact.email)) {
    return [
      "You can reach me through:",
      contact.contactPage ? `- Contact page: ${contact.contactPage}` : "",
      contact.email ? `- Email: ${contact.email}` : "",
      contact.linkedin ? `- LinkedIn: ${contact.linkedin}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }

  return [
    availability.openTo?.length ? `I am open to ${formatInlineList(availability.openTo, 5)}.` : "",
    availability.targetRoles?.length
      ? `I am mainly targeting ${formatInlineList(availability.targetRoles, 4)} roles.`
      : "",
    availability.workModes?.length
      ? `Preferred work modes: ${formatInlineList(availability.workModes, 3)}.`
      : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function buildEducationReply(chunks) {
  const education = getPayloadsBySection(chunks, "education");
  if (!education.length) {
    return "";
  }

  return [
    "My education includes:",
    ...education.map(
      (entry) =>
        `- ${entry.degree} - ${entry.institution}${entry.location ? `, ${entry.location}` : ""}${
          entry.status ? ` (${entry.status})` : ""
        }`
    ),
  ].join("\n");
}

function buildAchievementsReply(data) {
  const achievements = safeArray(data.achievements).slice(0, 5);
  if (!achievements.length) {
    return "";
  }

  return ["Some highlights from my portfolio:", ...achievements.map((item) => `- ${item}`)].join("\n");
}

function buildInitiativeReply(initiative, data) {
  if (!initiative) {
    return "";
  }

  const longTerm = safeObject(data.voice).longTermGoals;
  return [
    `${initiative.name} is currently ${toLower(initiative.status || "in progress")}.`,
    sentence(initiative.summary),
    longTerm && initiative.name.toLowerCase() === "tasknexus"
      ? `Long term, I want to grow it into a reliable platform.`
      : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function buildInterestsReply(data) {
  const interests = formatInlineList(data.interests, 6);
  const voice = safeObject(data.voice);

  return [
    interests ? `I am especially interested in ${interests}.` : "",
    voice.excitedAbout ? sentence(voice.excitedAbout) : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function buildGenericSummary(chunks) {
  const genericSummary = safeArray(chunks)
    .slice(0, 3)
    .map((chunk) => `- ${chunk.title}: ${trimText(chunk.text, 110)}`);

  return ["Here is what I can confirm from my portfolio data:", ...genericSummary].join("\n");
}

function buildRetrievalFallbackReply({ intent, chunks, message }) {
  const scopedChunks = safeArray(chunks);
  if (!scopedChunks.length) {
    return buildNoAnswerReply();
  }

  const data = readPortfolioData();
  const query = normalizeText(message);
  const faqMatch = findBestFaqMatch(message, scopedChunks);
  const directProjectMatch = findEntityByQuery(message, data.projects, { keys: ["title", "slug"] });
  const primaryProject = directProjectMatch || getPayloadsBySection(scopedChunks, "projects")[0] || null;
  const directServiceMatch = findEntityByQuery(message, data.services, { keys: ["title", "slug"] });
  const primaryService = directServiceMatch || getPayloadsBySection(scopedChunks, "services")[0] || null;
  const directBlogMatch = findEntityByQuery(message, data.blogs, { keys: ["title", "slug", "category"] });
  const primaryBlog = directBlogMatch || getPayloadsBySection(scopedChunks, "blogs")[0] || null;
  const directInitiativeMatch = findEntityByQuery(message, data.initiatives, { keys: ["name", "status"] });
  const primaryInitiative =
    directInitiativeMatch || getPayloadsBySection(scopedChunks, "initiatives")[0] || null;

  if (/tell me about yourself|introduce yourself|who are you|about you/.test(query)) {
    return buildProfileReply(data);
  }

  if (/why should|why hire|what makes you different|stand out|recruiter/.test(query)) {
    return buildHiringReply(data);
  }

  if (/currently learning|current focus|working on right now|what are you learning|improving/.test(query)) {
    return buildCurrentFocusReply(data);
  }

  if (/work environment|work style|team culture|preferred environment|what kind of team|how do you work|communication|debug/.test(query)) {
    return buildWorkStyleReply(data);
  }

  if (/short term goal|long term goal|future plan|career goal|where do you see yourself|goal/.test(query)) {
    return buildGoalsReply(data);
  }

  if (/tasknexus|initiative|startup/.test(query) && primaryInitiative) {
    return buildInitiativeReply(primaryInitiative, data);
  }

  if (/strongest|best|favorite|proudest/.test(query) && /project/.test(query) && !directProjectMatch) {
    return buildStrongestProjectReply(data);
  }

  if (primaryProject) {
    if (
      directProjectMatch ||
      /tech stack|stack|built with|feature|highlight|capabilit|github|repo|demo|link|problem|solve|what is|tell me about|how does|why did/.test(
        query
      )
    ) {
      return buildProjectReply(primaryProject, message);
    }
  }

  if (primaryService && directServiceMatch) {
    if (intent === "services" || /pricing|price|cost|fee|best for|delivery|timeline/.test(query)) {
      return buildServiceReply(primaryService, message) || buildServicesReply(scopedChunks, data);
    }
  }

  if (primaryBlog && directBlogMatch) {
    if (intent === "blogs" || /blog|article|write|wrote|post/.test(query)) {
      return buildBlogReply(primaryBlog) || buildBlogsReply(scopedChunks, data);
    }
  }

  if (/internship|available|open to|contact|email|linkedin|github|reach/.test(query) || intent === "availability") {
    return buildAvailabilityReply(data, message);
  }

  if (/education|college|university|bbdu|iit mandi|degree|student/.test(query) || intent === "education") {
    return buildEducationReply(scopedChunks);
  }

  if (/achievement|certification|proof|highlight/.test(query) || intent === "achievements") {
    return buildAchievementsReply(data);
  }

  if (/interest|excited about|industries|domain/.test(query) || intent === "interests") {
    return buildInterestsReply(data);
  }

  if (/experience|proof of work|background/.test(query) || intent === "experience") {
    return buildExperienceReply(scopedChunks, data);
  }

  if (intent === "skills" || /skill|technology|tech stack|tools|language|frontend|backend|python|react|node/.test(query)) {
    return buildSkillsReply(data, scopedChunks, message);
  }

  if (intent === "projects") {
    return buildProjectsReply(scopedChunks, data);
  }

  if (intent === "services") {
    return buildServicesReply(scopedChunks, data) || (primaryService ? buildServiceReply(primaryService, message) : "");
  }

  if (intent === "blogs") {
    return buildBlogsReply(scopedChunks, data) || (primaryBlog ? buildBlogReply(primaryBlog) : "");
  }

  if (intent === "journey") {
    return buildJourneyReply(scopedChunks);
  }

  if (intent === "profile") {
    return buildProfileReply(data);
  }

  if (faqMatch?.answer) {
    return faqMatch.answer;
  }

  const bestChunk = findBestChunk(scopedChunks);
  if (bestChunk?.section === "projects" && primaryProject) {
    return buildProjectReply(primaryProject, message);
  }

  return buildGenericSummary(scopedChunks);
}

/**
 * Detect user intent/persona (recruiter, student, general)
 * Returns: 'recruiter', 'student', or 'general'
 */
function detectUserIntent(message = "") {
  const query = normalizeText(message);
  
  const recruiterKeywords = ["hire", "hiring", "internship", "role", "position", "job", "experience", "availability", "startup", "company"];
  const studentKeywords = ["learning", "beginner", "student", "help", "explain", "how to", "tutorial", "guide", "project idea", "stuck"];
  
  const recruiterScore = recruiterKeywords.filter(kw => query.includes(kw)).length;
  const studentScore = studentKeywords.filter(kw => query.includes(kw)).length;
  
  if (recruiterScore > studentScore && recruiterScore > 0) return "recruiter";
  if (studentScore > recruiterScore && studentScore > 0) return "student";
  return "general";
}

/**
 * Check if message is a greeting
 * Returns: true if greeting detected
 */
function isGreeting(message = "") {
  const greetings = ["hi", "hello", "hey", "good morning", "good afternoon", "good evening", "how are you", "whats up", "how you doing", "greetings"];
  const normalized = normalizeText(message).split(" ")[0];
  return greetings.some(g => g.includes(normalized) || normalized.includes(g.split(" ")[0]));
}

/**
 * Build a warm greeting response
 * Adapts based on user intent
 */
function buildGreetingResponse(userIntent = "general") {
  const greetings = {
    recruiter: "Hey! I'm Gaurav's AI assistant. I can help you learn about his skills, experience, projects, and availability. What would you like to know?",
    student: "Hey! I'm Gaurav's portfolio assistant. I can explain how his projects work, help with concepts, or guide you through learning paths. What interests you?",
    general: "Hey there! I'm Gaurav's portfolio assistant. Feel free to ask me about his projects, skills, services, or journey. How can I help?"
  };
  
  return greetings[userIntent] || greetings.general;
}

/**
 * Generate 2-3 smart follow-up suggestions based on last question + answer
 * Returns: array of strings
 */
function generateFollowUpSuggestions(userMessage = "", answerSection = "", chunks = []) {
  
  // Map sections to logical follow-ups
  const followUpMap = {
    projects: ["Want to see the tech stack?", "Interested in how it was built?", "Curious about the impact?"],
    skills: ["Want to see projects using these?", "Interested in learning resources?", "How should I get started?"],
    services: ["What's the timeline?", "Can you explain the deliverables?", "How do I get started?"],
    blogs: ["What's your take on this topic?", "Any resources to learn more?", "Related projects?"],
    "current-focus": ["How are you learning this?", "Any projects in this area?", "Want guidance on this?"],
    hiring: ["What roles are you open to?", "What's your experience level?", "How can I reach out?"],
    journey: ["What was the toughest challenge?", "How do you stay consistent?", "What's next?"],
    default: ["Tell me about your projects", "What services do you offer?", "How can I contact you?"]
  };
  
  const suggestedSet = followUpMap[answerSection] || followUpMap.default;
  
  // Return 2 random suggestions
  return suggestedSet.sort(() => Math.random() - 0.5).slice(0, 2);
}

/**
 * Adapt response tone based on user intent
 * Returns: object with tone settings
 */
function adaptToneForIntent(userIntent = "general") {
  const tones = {
    recruiter: {
      opener: "Gaurav",
      emphasis: "results and impact",
      style: "professional and direct",
      includeMetrics: true
    },
    student: {
      opener: "Hey",
      emphasis: "learning and how-to",
      style: "friendly and encouraging",
      includeMetrics: false
    },
    general: {
      opener: "Hey",
      emphasis: "understanding and exploration",
      style: "conversational and clear",
      includeMetrics: false
    }
  };
  
  return tones[userIntent] || tones.general;
}

/**
 * Calculate TF-IDF score for relevance (improved from keyword matching)
 * Returns: scored and ranked chunks
 */
function calculateTFIDFScore(chunks = [], query = "") {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return chunks;
  
  // Simple TF-IDF: (token frequency in chunk) * (inverse of docs with token)
  const scoredChunks = chunks.map(chunk => {
    let score = 0;
    const chunkText = normalizeText(chunk.searchText || "");
    
    queryTokens.forEach(token => {
      // Term frequency: count occurrences
      const tf = (chunkText.match(new RegExp(token, "g")) || []).length;
      
      // Inverse document frequency: how rare is this token
      const docsWithToken = chunks.filter(c => 
        normalizeText(c.searchText || "").includes(token)
      ).length;
      const idf = chunks.length / (docsWithToken + 1);
      
      score += tf * idf;
    });
    
    // Boost scores for exact matches or high relevance
    if (chunk.section === detectIntent(query)) score *= 1.5;
    if (chunk.entityType && queryTokens.some(t => chunk.entityName?.includes(t))) score *= 1.3;
    
    return {
      ...chunk,
      score: Math.round(score * 100) / 100
    };
  });
  
  return scoredChunks.sort((a, b) => (b.score || 0) - (a.score || 0));
}

module.exports = {
  buildContext,
  buildKnowledgeChunks,
  buildNoAnswerReply,
  buildOutOfScopeReply,
  buildRetrievalFallbackReply,
  buildSystemPrompt,
  detectIntent,
  readPortfolioData,
  searchRelevantChunks,
  detectUserIntent,
  isGreeting,
  buildGreetingResponse,
  generateFollowUpSuggestions,
  adaptToneForIntent,
  calculateTFIDFScore,
};

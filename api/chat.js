// ─── MongoDB (lazy dynamic import — safe even if package missing) ─────────
let _mg       = null;
let _ChatLog  = null;
let _dbReady  = false;

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) return null;
  try {
    if (!_mg) _mg = (await import("mongoose")).default;
    if (_dbReady && _mg.connection.readyState === 1) return _mg;
    await _mg.connect(uri, { bufferCommands: false, serverSelectionTimeoutMS: 4000 });
    _dbReady = true;
    return _mg;
  } catch (e) {
    console.warn("MongoDB connect failed (non-fatal):", e.message);
    return null;
  }
}

function getChatLog(mg) {
  if (_ChatLog) return _ChatLog;
  const schema = new mg.Schema(
    {
      userMessage:    { type: String, required: true, trim: true, maxLength: 1000 },
      aiReply:        { type: String, required: true, trim: true },
      source:         { type: String, enum: ["gemini", "fallback"], default: "gemini" },
      degraded:       { type: Boolean, default: false },
      model:          { type: String, default: "unknown" },
      responseTimeMs: { type: Number, default: null },
      sessionId:      { type: String, default: "unknown", index: true },
      messageIndex:   { type: Number, default: 0 },
      historyLength:  { type: Number, default: 0 },
      messageLength:  { type: Number, default: 0 },
      intentTag:      { type: String, default: "other" },
      ipAddress:      { type: String, default: "unknown" },
      userAgent:      { type: String, default: "unknown" },
      referrer:       { type: String, default: "direct" },
      country:        { type: String, default: "unknown" },
      countryCode:    { type: String, default: "unknown" },
      city:           { type: String, default: "unknown" },
      region:         { type: String, default: "unknown" },
      timezone:       { type: String, default: "unknown" },
    },
    { timestamps: true, collection: "chatlogs" }
  );
  _ChatLog = mg.models.ChatLog || mg.model("ChatLog", schema);
  return _ChatLog;
}

// ─── Non-blocking save ────────────────────────────────────────────────────
const saveChatLog = async (userMessage, aiReply, meta) => {
  try {
    const mg = await connectDB();
    if (!mg || mg.connection.readyState !== 1) return;
    const ChatLog = getChatLog(mg);
    await ChatLog.create({
      userMessage:    String(userMessage).slice(0, 1000),
      aiReply:        String(aiReply).slice(0, 5000),
      source:         meta.source         || "gemini",
      degraded:       Boolean(meta.degraded),
      model:          meta.model          || "unknown",
      responseTimeMs: meta.responseTimeMs || null,
      sessionId:      meta.sessionId      || "unknown",
      messageIndex:   meta.messageIndex   || 0,
      historyLength:  meta.historyLength  || 0,
      messageLength:  meta.messageLength  || 0,
      intentTag:      meta.intentTag      || "other",
      ipAddress:      meta.ipAddress      || "unknown",
      userAgent:      meta.userAgent      || "unknown",
      referrer:       meta.referrer       || "direct",
      country:        meta.country        || "unknown",
      countryCode:    meta.countryCode    || "unknown",
      city:           meta.city           || "unknown",
      region:         meta.region         || "unknown",
      timezone:       meta.timezone       || "unknown",
    });
  } catch (err) {
    console.warn("⚠️ ChatLog save failed (non-fatal):", err.message);
  }
};

// ─── Intent tagger ────────────────────────────────────────────────────────
const detectIntent = (message) => {
  const q = String(message || "").toLowerCase();
  const has = (terms) => terms.some((t) => q.includes(t));
  if (has(["hi", "hello", "hey", "howdy", "sup", "greetings", "how are you"])) return "greeting";
  if (has(["intern", "hire", "available", "freelance", "job", "recruit", "role", "why hire", "why should", "what makes", "different"])) return "hiring";
  if (has(["skill", "tech", "stack", "language", "python", "react", "node", "ai", "ml", "framework", "tool"])) return "skills";
  if (has(["project", "built", "build", "app", "chat", "mern", "aireel", "notes", "grocery", "shopease", "tasknexus"])) return "projects";
  if (has(["education", "college", "degree", "iit", "bca", "mandi", "bbdu", "certification"])) return "education";
  if (has(["goal", "future", "plan", "learn", "studying", "improving", "currently"])) return "goals";
  if (has(["blog", "article", "write", "wrote", "post", "published"])) return "blogs";
  if (has(["contact", "email", "linkedin", "github", "reach"])) return "contact";
  return "other";
};

// ─── Complete profile data ─────────────────────────────────────────────────
const GAURAV = {
  personal: {
    name: "Gaurav Kumar Yadav",
    nickname: "Gaurav",
    title: "Python Developer | AI/ML Engineer | Full Stack Developer",
    location: "Lucknow, Uttar Pradesh, India",
    email: "ggauravky@gmail.com",
    portfolio: "https://ggauravky.vercel.app",
    github: "https://github.com/ggauravky",
    linkedin: "https://linkedin.com/in/ggauravky",
    bio: "I'm Gaurav Kumar Yadav — a BCA student from Lucknow with a deep focus on AI/ML and full-stack development. I build real-world, user-focused applications from scratch, whether that's intelligent AI tools or complete web systems. What sets me apart is my consistency mindset and build-in-public approach — I don't just learn, I ship.",
    openTo: [
      "Internships",
      "Entry-level roles",
      "Freelance projects",
      "Remote work",
      "Collaboration on open-source and AI projects",
    ],
  },
  education: [
    {
      degree: "Bachelor of Computer Applications (BCA)",
      year: "2nd Year (ongoing)",
      institution: "Babu Banarasi Das University (BBDU)",
      location: "Lucknow, India",
    },
    {
      degree: "Minor in AI/ML",
      institution: "IIT Mandi (Indian Institute of Technology, Mandi)",
      status: "Certified",
      focus: "Machine Learning, Artificial Intelligence, Deep Learning",
    },
  ],
  skills: {
    programmingLanguages: ["Python", "JavaScript", "Java", "C", "SQL"],
    frontend: ["React.js", "HTML5", "CSS3", "Tailwind CSS", "Bootstrap", "Responsive Design"],
    backend: ["Node.js", "Express.js", "Flask", "REST APIs", "JWT Authentication"],
    databases: ["MongoDB", "MySQL"],
    dataScienceAI: [
      "Pandas", "NumPy", "Matplotlib", "Seaborn", "Scikit-learn",
      "Machine Learning", "Data Analysis", "Data Preprocessing",
      "Feature Engineering", "Model Training",
    ],
    cloudPlatforms: ["Google Cloud Platform (GCP)", "AWS (Basics)", "Google Colab", "Kaggle"],
    tools: ["Git", "GitHub", "VS Code", "Postman", "Jupyter Notebooks"],
    softSkills: ["Problem Solving", "Team Collaboration", "Self Learning", "Time Management", "Communication"],
  },
  projects: [
    {
      name: "Real-Time Chat App",
      description: "Full-stack chat application with JWT authentication, Socket.IO for real-time messaging, online/offline status tracking, and Cloudinary image uploads. Features a modern UI with theme customization. One of his strongest projects — demonstrates full-stack architecture, real-time communication, and production-style features.",
      techStack: ["React", "Node.js", "Socket.IO", "MongoDB", "JWT", "Cloudinary"],
      github: "https://github.com/ggauravky/chat-app",
      demo: "https://chat-app-6ly8.onrender.com/",
    },
    {
      name: "MERN Product Store",
      description: "Modern e-commerce product management system with full CRUD operations, dark/light mode toggle, smooth Framer Motion animations, and responsive design using Chakra UI.",
      techStack: ["React", "Node.js", "MongoDB", "Express", "Chakra UI", "Framer Motion"],
      github: "https://github.com/ggauravky/mern-product-store",
      demo: "https://g-mern-product-store.onrender.com/",
    },
    {
      name: "AIReel Studio",
      description: "AI-powered video editing platform for content creators. Features automatic caption generation, smart video edits, and social media optimization using ElevenLabs API.",
      techStack: ["Python", "Flask", "ffmpeg", "ElevenLabs API", "AI/ML"],
      github: "https://github.com/ggauravky/My-all-Python-Projects-",
    },
    {
      name: "Python Grocery Store Application",
      description: "Full-stack grocery store management system built with Python, Flask, and MySQL. Follows three-tier architecture with product management, customer orders, and stock updates.",
      techStack: ["Python", "Flask", "MySQL", "HTML5", "CSS3", "JavaScript"],
      github: "https://github.com/ggauravky/python-grocery-store",
      demo: "https://gauravky.pythonanywhere.com/static/index.html",
    },
    {
      name: "TaskMaster Pro",
      description: "Comprehensive modern todo application with dark mode, Pomodoro focus timer, natural language input processing, drag-and-drop task management, advanced filtering, search, and statistics.",
      techStack: ["HTML5", "CSS3", "JavaScript", "Local Storage"],
      demo: "https://gtodolista.netlify.app/",
    },
    {
      name: "Glass-Morphism Calculator",
      description: "Responsive calculator with glass-morphism design, backdrop blur effects, smooth animations, keyboard support. Showcases advanced CSS techniques.",
      techStack: ["HTML5", "CSS3", "JavaScript"],
      demo: "https://gkycalculator.netlify.app/",
    },
    {
      name: "Notes App",
      description: "Full-featured notes application with add, edit, delete, updated timestamps, and complete MongoDB backend integration.",
      techStack: ["React", "Node.js", "Express", "MongoDB", "REST API"],
      github: "https://github.com/ggauravky/notes-app-mern-stack",
    },
    {
      name: "ShopEase",
      description: "Responsive e-commerce shopping website with product browsing, cart management, promotional banners, newsletter popup, and modern UI/UX.",
      techStack: ["HTML5", "CSS3", "JavaScript"],
      demo: "https://gshoppingweb.netlify.app/",
    },
  ],
  experience: [
    {
      type: "Self-directed Projects",
      description: "Built 12+ projects across Full Stack, AI/ML, Python, and Frontend domains. All projects are hosted and publicly accessible.",
    },
    {
      type: "AI/ML Certification",
      institution: "IIT Mandi",
      description: "Completed a rigorous AI/ML minor program covering Machine Learning algorithms, Deep Learning, Data Science, model training, and AI application development.",
    },
  ],
  achievements: [
    "Certified in AI/ML from IIT Mandi",
    "12+ projects built and deployed",
    "Active open-source contributor on GitHub",
    "Built and deployed a full-stack real-time chat app with Socket.IO",
    "Created AI-powered video editing platform (AIReel Studio)",
  ],
  faq: [
    {
      q: "Are you open for internships?",
      a: "Yes! Actively looking for internships, entry-level developer roles, and freelance projects. Open to remote or on-site — targeting AI/ML Intern, Software Developer Intern, and Full-Stack Developer Intern roles.",
    },
    {
      q: "What is your main programming language?",
      a: "Python is the primary language — used for AI/ML, data science, and backend. Also highly proficient in JavaScript for full-stack web development.",
    },
    {
      q: "What is TaskNexus?",
      a: "TaskNexus is a service-based platform Gaurav is building — a smart bridge between clients and skilled freelancers. It simplifies project outsourcing by handling task assignment, quality checks, and delivery.",
    },
    {
      q: "Can I hire you for freelance work?",
      a: "Absolutely! Open to freelance projects in web development, AI/ML applications, Python scripting, and automation tools. Reach out via the contact page.",
    },
  ],
  voice: {
    whatMakesMeDifferent: "Builds real projects, documents learning publicly, and ships with a long-term engineering mindset. Strong consistency and build-in-public approach.",
    workStyle: "Build-first learning approach — quickly understand fundamentals, immediately apply in projects, then reinforce by documenting and improving.",
    shortTermGoals: "Next 6-12 months: strengthen DSA and AI/ML fundamentals, contribute to real-world projects, secure a high-impact internship working on production-level systems.",
    longTermGoals: "In 3-5 years: be a strong AI-focused software engineer building intelligent, scalable products. Grow TaskNexus into a reliable outsourcing platform.",
    targetRoles: "AI/ML Intern, Software Developer Intern, Full-Stack Developer Intern.",
    bestProject: "Real-Time Chat Application — demonstrates full-stack architecture, real-time communication with Socket.IO, JWT authentication, online status, and media uploads.",
    currentlyLearning: "Data Structures & Algorithms, advanced AI/ML concepts, MERN stack scalability, and system design fundamentals.",
    funFact: "Manages learning using Notion and Pomodoro sessions. Believes in daily small wins over irregular large efforts — consistency beats intensity.",
    forRecruiters: "Someone who shows up consistently, builds real things, and thinks long-term. Not just learning to pass interviews — learning to build products that matter.",
  },
  contact: {
    email: "ggauravky@gmail.com",
    portfolio: "https://ggauravky.vercel.app",
    github: "https://github.com/ggauravky",
    linkedin: "https://linkedin.com/in/ggauravky",
    contactPage: "https://ggauravky.vercel.app/contact",
  },
  techStackDetailed: {
    frontend: ["React", "Tailwind CSS", "HTML5", "CSS3", "JavaScript"],
    backend: ["Node.js", "Express.js", "Flask"],
    database: ["MongoDB", "MySQL"],
    realtime: ["Socket.IO"],
    ai_ml: ["OpenCV", "Pandas", "NumPy", "scikit-learn", "Matplotlib", "Seaborn", "Feature Engineering", "Model Training"],
    tools: ["Git", "GitHub", "Cloudinary", "JWT", "Postman", "Jupyter Notebooks"],
    cloud: ["Google Cloud Platform (GCP)", "AWS (Basics)", "Google Colab", "Kaggle"],
    languages: ["Python", "JavaScript", "Java", "C", "SQL"],
  },
  recruiterSignals: {
    strengths: [
      "Consistent builder — 12+ real projects deployed and publicly accessible",
      "Full-stack experience: React + Node.js + MongoDB (MERN) and Python + Flask",
      "Real-time systems experience with Socket.IO (chat application)",
      "Growing AI/ML focus with IIT Mandi certification and hands-on Python tools",
      "Build-first mindset — ships working systems, not just tutorials",
      "Self-directed learner who documents and improves work continuously",
    ],
    availability: "Open to internships, entry-level roles, and freelance projects — remote or on-site",
    workStyle: "Build-first, practical implementation focused. Uses Notion + Pomodoro for structured daily progress.",
    targetRoles: ["AI/ML Intern", "Software Developer Intern", "Full-Stack Developer Intern"],
    whyHire: "Shows up consistently, builds real things end-to-end, thinks long-term. Not just learning for interviews — building for real-world impact. Combines full-stack depth with AI/ML breadth.",
    projectHighlights: [
      "Real-Time Chat App: JWT auth + Socket.IO + Cloudinary — production-quality full-stack",
      "AIReel Studio: Python + Flask + ffmpeg + ElevenLabs — AI-powered video platform",
      "Python Grocery Store: 3-tier Flask + MySQL architecture, live deployed",
      "MERN Product Store: Full CRUD, Framer Motion animations, live deployed",
    ],
  },
};

// ─── Model config ─────────────────────────────────────────────────────────────
const SUPPORTED_MODELS = new Set([
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-pro",
  "gemini-2.5-flash-preview-05-20",
]);

// ─── Helpers ──────────────────────────────────────────────────────────────────
const toLower = (value) => String(value || "").toLowerCase();
const includesAny = (text, terms) => terms.some((term) => text.includes(term));

// ─── Intent-aware context builder ────────────────────────────────────────────
const buildContext = (message) => {
  const q = toLower(message);

  const wantsSkills = includesAny(q, [
    "skill", "tech", "stack", "language", "python", "react", "node",
    "javascript", "ai", "ml", "machine learning", "frontend", "backend",
    "database", "tool", "framework",
  ]);
  const wantsProjects = includesAny(q, [
    "project", "built", "build", "app", "application", "chat", "mern",
    "aireel", "store", "notes", "calculator", "tasknexus", "grocery",
    "portfolio", "demo", "github", "deployed", "shopease", "dishda",
    "taskmaster", "bird",
  ]);
  const wantsAvailability = includesAny(q, [
    "intern", "hire", "available", "open", "freelance", "job", "work",
    "opportunity", "recruit", "remote", "part-time", "full-time", "role",
  ]);
  const wantsRecruiterInfo = includesAny(q, [
    "why hire", "why should", "worth", "different", "better than", "stand out",
    "what makes", "what can you build", "what have you built", "strong",
    "impress", "convince", "reason to hire", "evaluate", "interview",
    "strengths", "weakness", "value", "prove",
  ]);
  const wantsEducation = includesAny(q, [
    "education", "study", "college", "university", "degree", "bca",
    "iit", "mandi", "certification", "course", "academic",
  ]);
  const wantsContact = includesAny(q, [
    "contact", "email", "linkedin", "reach", "message", "connect",
  ]);
  const wantsAbout = includesAny(q, [
    "who are you", "about", "yourself", "tell me", "introduce", "background",
    "bio", "profile", "gaurav", "him",
  ]);
  const wantsExperience = includesAny(q, [
    "experience", "achievement", "accomplishment", "worked", "done",
    "built how many", "how many project",
  ]);
  const wantsGoals = includesAny(q, [
    "goal", "future", "plan", "aspire", "target", "learning", "studying",
    "next", "short term", "long term",
  ]);
  const wantsFAQ = includesAny(q, [
    "hire", "freelance", "tasknexus", "language", "main lang",
  ]);

  // Always include core identity
  const ctx = {
    identity: {
      name: GAURAV.personal.name,
      title: GAURAV.personal.title,
      location: GAURAV.personal.location,
      bio: GAURAV.personal.bio,
    },
    contact: GAURAV.contact,
  };

  if (wantsAbout || wantsExperience) {
    ctx.bio = GAURAV.personal.bio;
    ctx.achievements = GAURAV.achievements;
    ctx.experience = GAURAV.experience;
    ctx.voice = GAURAV.voice;
  }

  if (wantsSkills) {
    ctx.skills = GAURAV.skills;
    ctx.techStackDetailed = GAURAV.techStackDetailed;
  }

  if (wantsProjects) {
    ctx.projects = GAURAV.projects;
  }

  if (wantsAvailability) {
    ctx.openTo = GAURAV.personal.openTo;
    ctx.voice_forRecruiters = GAURAV.voice.forRecruiters;
    ctx.targetRoles = GAURAV.voice.targetRoles;
    ctx.recruiterSignals = GAURAV.recruiterSignals;
  }

  if (wantsRecruiterInfo) {
    ctx.recruiterSignals = GAURAV.recruiterSignals;
    ctx.voice = GAURAV.voice;
    ctx.achievements = GAURAV.achievements;
    ctx.projects = GAURAV.projects.slice(0, 4);
    ctx.techStackDetailed = GAURAV.techStackDetailed;
  }

  if (wantsEducation) {
    ctx.education = GAURAV.education;
  }

  if (wantsGoals) {
    ctx.goals = {
      shortTerm: GAURAV.voice.shortTermGoals,
      longTerm: GAURAV.voice.longTermGoals,
      currentlyLearning: GAURAV.voice.currentlyLearning,
    };
  }

  if (wantsFAQ) {
    ctx.faq = GAURAV.faq;
  }

  // If nothing specific matched, provide a rich general context
  const hasSpecific =
    wantsSkills || wantsProjects || wantsAvailability || wantsRecruiterInfo ||
    wantsEducation || wantsAbout || wantsExperience || wantsGoals;

  if (!hasSpecific) {
    ctx.skills = GAURAV.skills;
    ctx.techStackDetailed = GAURAV.techStackDetailed;
    ctx.projects = GAURAV.projects.slice(0, 5);
    ctx.achievements = GAURAV.achievements;
    ctx.voice = GAURAV.voice;
    ctx.recruiterSignals = GAURAV.recruiterSignals;
    ctx.openTo = GAURAV.personal.openTo;
    ctx.education = GAURAV.education;
  }

  return JSON.stringify(ctx);
};

// ─── System prompt (Gaurav AI persona) ───────────────────────────────────────
const SYSTEM_PROMPT = `
You are **Gaurav AI**, the intelligent portfolio copilot for Gaurav Kumar Yadav.

Your mission: help recruiters, collaborators, and visitors clearly evaluate Gaurav's technical skills, AI/ML capabilities, full-stack experience, projects, learning mindset, and availability.

Behave like a smart technical assistant — not a generic chatbot.

## PRIMARY OBJECTIVE
Help serious visitors quickly decide whether Gaurav is worth interviewing.
Prioritize: clarity, specificity, technical credibility, real examples, concise communication.

## CONTEXT USAGE RULES
1. Use the provided context as the source of truth.
2. Never invent fake experience or skills.
3. Prefer concrete examples from projects.
4. Avoid repeating the same biography.
5. If exact info is missing, make a reasonable grounded summary from known data.
6. If truly unknown, say briefly and redirect to /contact.

## INTENT CLASSIFICATION

### GREETING / SMALL TALK (hi, hello, how are you, what's up)
→ Warm and human, short, lightly steer toward helping.
→ Do NOT redirect to contact. Do NOT give full bio.

### RECRUITER / HIRING QUESTIONS (HIGH PRIORITY)
(why should we hire you, what makes you different, are you available, what can you build, what is your experience)
→ Confident but honest. Evidence-based. Mention real projects.
→ Highlight consistency mindset. Use recruiterSignals data.
→ This is the MOST IMPORTANT category — answer it well.

### TECHNICAL QUESTIONS
(which tech stack, what AI tools, how did you build X, what backend)
→ Structured, specific, technical but clear. Use techStackDetailed data.
→ Group by frontend / backend / AI-ML when listing stack.

### PROJECT-SPECIFIC QUESTIONS
(tell me about your chat app, explain AIReel Studio, what is TaskNexus)
→ Must include: what it does, tech used, problem solved, why it matters.
→ Recruiters love this depth.

### PERSONAL LIGHT QUESTIONS
(how was your day, what are you learning, what are you working on)
→ Brief human tone. Connect back to growth or building. Stay professional.
→ Do NOT reject these.

### OUT-OF-SCOPE (STRICT — use sparingly)
ONLY when question is completely unrelated to Gaurav:
→ "I specialize in answering questions about Gaurav's work and projects. For anything else, please visit the /contact page."

## RESPONSE QUALITY RULES
Every answer should: prefer specifics over generic claims, mention real projects when relevant, show technical thinking, stay concise but meaningful, sound natural and human.
Avoid: robotic tone, long biography repeats, buzzwords, vague praise.

## PERSUASION MODE (for hiring-related intent)
Subtly highlight: consistency and discipline, real full-stack builds, AI/ML direction, real-world project focus, ability to ship working systems.
But never exaggerate.

## FOLLOW-UP INTELLIGENCE
Use recent conversation context. If user asks a vague follow-up like "which one is best?", infer from previous messages.

## TONE PROFILE
Sound like: smart junior engineer, confident learner, practical builder, humble but capable.
NOT like: corporate robot, overhyped marketer, generic AI.

## EDGE CASES
- Rude user → stay calm, briefly clarify purpose, continue helping.
- Asks availability → answer clearly, optionally guide to contact.
- Asks tech stack → give structured answer grouped by frontend/backend/AI.
- Rude or skeptical → politely clarify purpose, continue helping.

## FINAL GOAL
By end of conversation, user should clearly understand: what Gaurav builds, what technologies he uses, how he thinks, and why he is worth interviewing.
`.trim();

const buildGeminiContents = (message, history, contextJson) => {
  const systemWithContext = `${SYSTEM_PROMPT}\n\n## CONTEXT DATA (use this only)\n${contextJson}`;

  const contents = [];

  // Inject system prompt as the first user turn (Gemini doesn't have system role in v1beta)
  contents.push({
    role: "user",
    parts: [{ text: systemWithContext }],
  });
  contents.push({
    role: "model",
    parts: [{ text: "Understood. I'm Gaurav AI, ready to help visitors learn about Gaurav Kumar Yadav." }],
  });

  // Add conversation history (max last 6 exchanges to save tokens)
  if (Array.isArray(history) && history.length > 0) {
    const trimmed = history.slice(-12); // 6 user + 6 model
    for (const turn of trimmed) {
      if (turn.role === "user" || turn.role === "model") {
        const text = String(turn.text || turn.content || "").trim();
        if (text) {
          contents.push({ role: turn.role, parts: [{ text }] });
        }
      }
    }
  }

  // Current user message
  contents.push({
    role: "user",
    parts: [{ text: message }],
  });

  return contents;
};

// ─── Fallback (no API key / quota exceeded) ───────────────────────────────────
const fallbackReply = (message) => {
  const q = toLower(message);
  const G = GAURAV;

  if (includesAny(q, ["hi", "hello", "hey", "howdy"])) {
    return `Hey! I'm Gaurav AI — Gaurav Kumar Yadav's portfolio assistant. Ask me about his skills, projects, experience, or if he's available for opportunities!`;
  }

  if (includesAny(q, ["how are you"])) {
    return `Doing great! How can I help you learn about Gaurav's work today?`;
  }

  if (includesAny(q, ["who are you", "about yourself", "introduce"])) {
    return G.personal.bio;
  }

  if (includesAny(q, ["tasknexus"])) {
    return G.faq.find((f) => f.q.toLowerCase().includes("tasknexus"))?.a ||
      "TaskNexus is a smart platform Gaurav is building to bridge clients and skilled freelancers.";
  }

  if (includesAny(q, ["intern", "hire", "available", "freelance", "open", "job", "recruit", "role"])) {
    return `Gaurav is open to:\n- ${G.personal.openTo.join("\n- ")}\n\nTarget roles: ${G.voice.targetRoles}\n\nContact: ${G.contact.email} | ${G.contact.contactPage}`;
  }

  if (includesAny(q, ["skill", "tech", "stack", "language", "python", "react", "ai", "ml"])) {
    const s = G.skills;
    return `Core skills:\n- Languages: ${s.programmingLanguages.join(", ")}\n- Frontend: ${s.frontend.join(", ")}\n- Backend: ${s.backend.join(", ")}\n- AI/ML: ${s.dataScienceAI.slice(0, 6).join(", ")}\n- Databases: ${s.databases.join(", ")}`;
  }

  if (includesAny(q, ["project", "built", "app", "application"])) {
    return G.projects
      .slice(0, 4)
      .map((p) => `• **${p.name}** — ${p.description.split(".")[0]}. (${p.techStack.join(", ")})`)
      .join("\n");
  }

  if (includesAny(q, ["achievement", "experience", "done", "accomplish"])) {
    return `Achievements:\n- ${G.achievements.join("\n- ")}`;
  }

  if (includesAny(q, ["education", "study", "college", "bca", "iit", "degree"])) {
    return G.education
      .map((e) => `• ${e.degree} — ${e.institution}`)
      .join("\n");
  }

  if (includesAny(q, ["contact", "email", "linkedin", "github", "reach"])) {
    const c = G.contact;
    return `Contact Gaurav:\n- Email: ${c.email}\n- Portfolio: ${c.portfolio}\n- LinkedIn: ${c.linkedin}\n- GitHub: ${c.github}`;
  }

  if (includesAny(q, ["goal", "future", "learning", "plan"])) {
    return `Short-term: ${G.voice.shortTermGoals}\n\nLong-term: ${G.voice.longTermGoals}`;
  }

  return `${G.personal.name} is a ${G.personal.title} based in ${G.personal.location}. He's a BCA student with an AI/ML minor from IIT Mandi who has built 12+ real-world projects. Ask me anything about his skills, projects, or availability!`;
};

// ─── Gemini response extractor ────────────────────────────────────────────────
const extractGeminiReply = (payload) => {
  const parts = payload?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return "";
  return parts
    .map((p) => p?.text || "")
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

// ─── Vercel handler ───────────────────────────────────────────────────────────
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

  // ── Extract visitor metadata from Vercel/CF headers ────────────────────
  const ipAddress   = (req.headers["x-real-ip"] || req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || "unknown").replace(/^::ffff:/, "");
  const userAgent   = String(req.headers["user-agent"]   || "unknown").slice(0, 300);
  const referrer    = String(req.headers["referer"] || req.headers["referrer"] || "direct").slice(0, 300);
  // Vercel injects these geo headers automatically on deployed functions
  const countryCode = String(req.headers["x-vercel-ip-country"]        || "unknown");
  const region      = String(req.headers["x-vercel-ip-country-region"] || "unknown");
  const city        = String(req.headers["x-vercel-ip-city"]           || "unknown");
  const timezone    = String(req.headers["x-vercel-ip-timezone"]       || "unknown");

  try {
    const body =
      typeof req.body === "string"
        ? JSON.parse(req.body || "{}")
        : req.body || {};

    const message      = String(body.message || "").trim();
    const history      = Array.isArray(body.history) ? body.history : [];
    const sessionId    = String(body.sessionId || req.headers["x-session-id"] || "unknown").slice(0, 64);
    const messageIndex = parseInt(body.messageIndex, 10) || 0;

    if (!message) {
      return res
        .status(400)
        .json({ success: false, reply: "Please provide a valid message." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const requestedModel = process.env.GEMINI_MODEL || "gemini-2.0-flash";
    const model = SUPPORTED_MODELS.has(requestedModel)
      ? requestedModel
      : "gemini-2.0-flash";

    if (!apiKey) {
      const reply = fallbackReply(message);
      await saveChatLog(message, reply, {
        source: "fallback", degraded: true, model: "none",
        responseTimeMs: Date.now() - startTime, sessionId, messageIndex,
        historyLength: history.length, messageLength: message.length,
        intentTag: detectIntent(message),
        ipAddress, userAgent, referrer, countryCode, city, region, timezone,
        country: countryCode, // Vercel doesn't give full name, use code
      });
      return res.status(200).json({
        success: true,
        degraded: true,
        reply,
      });
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const contextJson = buildContext(message);
    const contents = buildGeminiContents(message, history, contextJson);

    const geminiResponse = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.65,
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

    const payload = await geminiResponse.json();
    const geminiText = extractGeminiReply(payload);
    const apiErrorMessage = payload?.error?.message || "";

    if (!geminiResponse.ok || !geminiText) {
      if (isRateLimited(geminiResponse.status, apiErrorMessage)) {
        const reply = fallbackReply(message);
        await saveChatLog(message, reply, {
          source: "fallback", degraded: true, model,
          responseTimeMs: Date.now() - startTime, sessionId, messageIndex,
          historyLength: history.length, messageLength: message.length,
          intentTag: detectIntent(message),
          ipAddress, userAgent, referrer, countryCode, city, region, timezone, country: countryCode,
        });
        return res.status(200).json({
          success: true,
          degraded: true,
          reply,
        });
      }

      console.error("Gemini error:", apiErrorMessage || "Empty response");
      const reply = fallbackReply(message);
      await saveChatLog(message, reply, {
        source: "fallback", degraded: true, model,
        responseTimeMs: Date.now() - startTime, sessionId, messageIndex,
        historyLength: history.length, messageLength: message.length,
        intentTag: detectIntent(message),
        ipAddress, userAgent, referrer, countryCode, city, region, timezone, country: countryCode,
      });
      return res.status(200).json({
        success: true,
        degraded: true,
        reply,
      });
    }

    await saveChatLog(message, geminiText, {
      source: "gemini", degraded: false, model,
      responseTimeMs: Date.now() - startTime, sessionId, messageIndex,
      historyLength: history.length, messageLength: message.length,
      intentTag: detectIntent(message),
      ipAddress, userAgent, referrer, countryCode, city, region, timezone, country: countryCode,
    });

    return res.status(200).json({ success: true, reply: geminiText });
  } catch (error) {
    console.error("Vercel chat error:", error?.message || error);
    const fallback = fallbackReply(typeof req.body === "object" ? req.body?.message : "");
    return res.status(200).json({
      success: true,
      degraded: true,
      reply: fallback,
    });
  }
}

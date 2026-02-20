const PROFILE = {
  name: "Gaurav Kumar Yadav",
  title: "Python Developer | AI/ML Engineer | Full Stack Developer",
  location: "Lucknow, Uttar Pradesh, India",
  email: "ggauravky@gmail.com",
  portfolio: "https://ggauravky.vercel.app",
  linkedin: "https://linkedin.com/in/ggauravky",
  github: "https://github.com/ggauravky",
  education: [
    "BCA (2nd year, ongoing) at Babu Banarasi Das University, Lucknow",
    "AI/ML minor certification from IIT Mandi",
  ],
  skills: {
    programming: ["Python", "JavaScript", "Java", "C", "SQL"],
    frontend: ["React.js", "HTML5", "CSS3", "Tailwind CSS", "Bootstrap"],
    backend: ["Node.js", "Express.js", "Flask", "REST APIs", "JWT"],
    ai: ["Machine Learning", "Data Analysis", "Scikit-learn", "Pandas", "NumPy"],
    databases: ["MongoDB", "MySQL"],
  },
  projects: [
    {
      name: "TaskNexus",
      description:
        "AI-powered task management and productivity dashboard with prioritization, Pomodoro timer, and analytics.",
      tech: ["React", "Node.js", "MongoDB", "AI/ML", "Tailwind CSS"],
      status: "In development",
    },
    {
      name: "Real-Time Chat App",
      description:
        "Full-stack chat app with JWT auth, Socket.IO realtime messaging, status tracking, and Cloudinary uploads.",
      tech: ["React", "Node.js", "Socket.IO", "MongoDB", "JWT", "Cloudinary"],
    },
    {
      name: "MERN Product Store",
      description:
        "Modern e-commerce product management app with CRUD, animations, and responsive UI.",
      tech: ["React", "Node.js", "Express", "MongoDB"],
    },
    {
      name: "AIReel Studio",
      description:
        "AI-powered video editing platform with automatic captions and smart edits.",
      tech: ["Python", "Flask", "ffmpeg", "AI/ML"],
    },
  ],
  openTo: [
    "Internships",
    "Entry-level roles",
    "Freelance projects",
    "Remote work",
  ],
};

const SUPPORTED_MODELS = new Set([
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-pro",
]);

const toLower = (value) => String(value || "").toLowerCase();
const includesAny = (text, terms) => terms.some((term) => text.includes(term));

const buildContext = (message) => {
  const query = toLower(message);
  const context = {
    personal: {
      name: PROFILE.name,
      title: PROFILE.title,
      location: PROFILE.location,
      education: PROFILE.education,
    },
    contact: {
      email: PROFILE.email,
      portfolio: PROFILE.portfolio,
      linkedin: PROFILE.linkedin,
      github: PROFILE.github,
    },
  };

  if (
    includesAny(query, [
      "skill",
      "tech",
      "stack",
      "language",
      "python",
      "react",
      "ai",
      "ml",
    ])
  ) {
    context.skills = PROFILE.skills;
  }

  if (includesAny(query, ["project", "tasknexus", "chat app", "mern", "aireel"])) {
    context.projects = PROFILE.projects;
  }

  if (includesAny(query, ["intern", "hire", "available", "open", "freelance"])) {
    context.openTo = PROFILE.openTo;
  }

  if (!context.skills && !context.projects && !context.openTo) {
    context.skills = PROFILE.skills;
    context.projects = PROFILE.projects.slice(0, 3);
  }

  return JSON.stringify(context);
};

const buildSystemPrompt = (contextJson) => `
You are an AI assistant for Gaurav Kumar Yadav's portfolio.
Answer only using the provided context.

Rules:
1. Do not invent details.
2. If missing information, say:
"I don't have that information yet. Please contact Gaurav directly at ggauravky@gmail.com or visit https://ggauravky.vercel.app/contact"
3. Keep responses concise, professional, and friendly.
4. Use bullets when listing items.

Context:
${contextJson}
`.trim();

const fallbackReply = (message) => {
  const query = toLower(message);

  if (includesAny(query, ["tasknexus"])) {
    return "TaskNexus is an AI-powered task management and productivity dashboard Gaurav is currently building. It combines task management with AI prioritization, focus timers, and analytics.";
  }

  if (includesAny(query, ["intern", "hire", "available", "open", "freelance"])) {
    return `Gaurav is open to:\n- ${PROFILE.openTo.join(
      "\n- "
    )}\n\nYou can contact him at ${PROFILE.email} or ${PROFILE.portfolio}/contact`;
  }

  if (includesAny(query, ["skill", "tech", "stack", "language"])) {
    return `Core skills:\n- Programming: ${PROFILE.skills.programming.join(
      ", "
    )}\n- Frontend: ${PROFILE.skills.frontend.join(
      ", "
    )}\n- Backend: ${PROFILE.skills.backend.join(
      ", "
    )}\n- AI/ML: ${PROFILE.skills.ai.join(", ")}`;
  }

  if (includesAny(query, ["contact", "email", "linkedin", "github"])) {
    return `Contact details:\n- Email: ${PROFILE.email}\n- Portfolio: ${PROFILE.portfolio}\n- LinkedIn: ${PROFILE.linkedin}\n- GitHub: ${PROFILE.github}`;
  }

  return `${PROFILE.name} is a ${PROFILE.title} based in ${PROFILE.location}. He is a BCA student with an AI/ML minor from IIT Mandi and builds projects in AI/ML and full-stack development.`;
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

export const config = {
  runtime: "nodejs",
};

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, reply: "Method not allowed" });
  }

  try {
    const body =
      typeof req.body === "string"
        ? JSON.parse(req.body || "{}")
        : req.body || {};
    const message = String(body.message || "").trim();

    if (!message) {
      return res
        .status(400)
        .json({ success: false, reply: "Please provide a valid message." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const requestedModel = process.env.GEMINI_MODEL || "gemini-2.0-flash-lite";
    const model = SUPPORTED_MODELS.has(requestedModel)
      ? requestedModel
      : "gemini-2.0-flash-lite";

    if (!apiKey) {
      return res.status(200).json({
        success: true,
        degraded: true,
        reply: fallbackReply(message),
      });
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const context = buildContext(message);
    const prompt = buildSystemPrompt(context);

    const geminiResponse = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: `${prompt}\n\nUser question: ${message}` }],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 350,
        },
      }),
    });

    const payload = await geminiResponse.json();
    const geminiText = extractGeminiReply(payload);
    const apiErrorMessage = payload?.error?.message || "";

    if (!geminiResponse.ok || !geminiText) {
      if (isRateLimited(geminiResponse.status, apiErrorMessage)) {
        return res.status(200).json({
          success: true,
          degraded: true,
          reply: fallbackReply(message),
        });
      }

      return res.status(200).json({
        success: true,
        degraded: true,
        reply: fallbackReply(message),
      });
    }

    return res.status(200).json({ success: true, reply: geminiText });
  } catch (error) {
    console.error("Vercel chat error:", error?.message || error);
    return res.status(200).json({
      success: true,
      degraded: true,
      reply: fallbackReply(req.body?.message || ""),
    });
  }
}

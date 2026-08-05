const path = require("node:path");
const fs = require("node:fs");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { ingestionService, tokenize } = require("./ingestionService");
const { conversationRouter } = require("./conversationRouter");

// Configuration from Environment Variables
const GEMINI_API_KEY = String(process.env.GEMINI_API_KEY || "").trim();
const GEMINI_MODEL = String(process.env.GEMINI_MODEL || "gemini-2.0-flash-lite").trim();
const TEMPERATURE = Number.parseFloat(process.env.TEMPERATURE || "0.7");
const TOP_P = Number.parseFloat(process.env.TOP_P || "0.95");
const MAX_TOKENS = Number.parseInt(process.env.MAX_TOKENS || "1000", 10);
const RETRIEVAL_LIMIT = 3; // Trimmed top-K to 3 max for high precision

// In-Memory Session Store & Response Cache
const sessionMemoryStore = new Map();
const SESSION_MAX_TURNS = 10;
const SESSION_TTL_MS = 60 * 60 * 1000; // 1 hour

const responseCache = new Map();
const RESPONSE_CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Classify user query intent and target entity.
 */
function classifyIntent(query) {
  const lower = String(query || "").toLowerCase().trim();

  // Out of Scope
  if (/capital of|weather|crypto|bitcoin|stock|movie|sports|match|president|capital city|joke/i.test(lower)) {
    return {
      intent: "out_of_scope",
      targetCategory: null,
      suggestedFollowUps: ["What technical projects has Gaurav built?", "What are Gaurav's core skills?"],
    };
  }

  // Greetings
  if (/^(hi|hello|hey|greetings|good morning|yo)\b/i.test(lower)) {
    return {
      intent: "greetings",
      targetCategory: "bio",
      suggestedFollowUps: ["Who is Gaurav?", "What projects has Gaurav built?", "What technologies does Gaurav use?"],
    };
  }

  // Specific Project Intent
  if (/tasknexus|task nexus/i.test(lower)) {
    return {
      intent: "projects",
      targetCategory: "projects",
      targetEntity: "TaskNexus",
      suggestedFollowUps: ["What tech stack powers TaskNexus?", "How was TaskNexus architected?", "Show other AI projects"],
    };
  }

  if (/smartmess|smart mess/i.test(lower)) {
    return {
      intent: "projects",
      targetCategory: "projects",
      targetEntity: "SmartMess",
      suggestedFollowUps: ["What features does SmartMess have?", "Show other MERN projects"],
    };
  }

  if (/instax|insta x/i.test(lower)) {
    return {
      intent: "projects",
      targetCategory: "projects",
      targetEntity: "InstaX",
      suggestedFollowUps: ["What features does InstaX have?", "Show other MERN projects"],
    };
  }

  // Who is Gaurav
  if (/who is gaurav|tell me about gaurav|about gaurav|who are you|bio|background/i.test(lower)) {
    return {
      intent: "who_is_gaurav",
      targetCategory: "bio",
      suggestedFollowUps: ["What projects has Gaurav built?", "What is Gaurav's tech stack?", "How can I contact Gaurav?"],
    };
  }

  // General Projects
  if (/project|projects|built|build|apps|app|buildmyteam|collaborative|ai project|mern project/i.test(lower)) {
    return {
      intent: "projects",
      targetCategory: "projects",
      suggestedFollowUps: ["Tell me about TaskNexus", "Tell me about SmartMess", "Which projects are AI-focused?"],
    };
  }

  // Skills
  if (/skill|skills|tech|technologies|technology|language|python|react|node|mongodb|backend|frontend|mern/i.test(lower)) {
    return {
      intent: "skills",
      targetCategory: "skills",
      suggestedFollowUps: ["What backend frameworks does Gaurav use?", "What AI/ML tools does Gaurav know?", "Show projects using React and Node."],
    };
  }

  // Experience
  if (/experience|internship|work|industrial exposure|job|exposure/i.test(lower)) {
    return {
      intent: "experience",
      targetCategory: "experience",
      suggestedFollowUps: ["What projects show industrial exposure?", "Is Gaurav open to internships?", "How can I contact Gaurav?"],
    };
  }

  // Education
  if (/education|degree|college|university|bbdu|iit mandi|bca/i.test(lower)) {
    return {
      intent: "education",
      targetCategory: "education",
      suggestedFollowUps: ["Tell me about Gaurav's AI/ML minor at IIT Mandi", "What is Gaurav's degree program?"],
    };
  }

  // Resume
  if (/resume|cv|download resume|pdf/i.test(lower)) {
    return {
      intent: "resume",
      targetCategory: "resume",
      suggestedFollowUps: ["How can I contact Gaurav?", "What are Gaurav's top technical skills?"],
    };
  }

  // Contact
  if (/contact|email|linkedin|github|hire|reach|mail/i.test(lower)) {
    return {
      intent: "contact",
      targetCategory: "contact",
      suggestedFollowUps: ["What is Gaurav's email address?", "Is Gaurav open to freelance work?"],
    };
  }

  // Blogs
  if (/blog|blogs|article|writing|post|rag blog/i.test(lower)) {
    return {
      intent: "blogs",
      targetCategory: "blogs",
      suggestedFollowUps: ["Which blogs explain RAG?", "Show Gaurav's engineering articles."],
    };
  }

  return {
    intent: "general",
    targetCategory: null,
    suggestedFollowUps: ["What projects has Gaurav built?", "What technologies does Gaurav use?", "How can I contact Gaurav?"],
  };
}

/**
 * Perform Metadata Pre-Filtered RAG Retrieval & Precision Trimming.
 */
function retrieveRAGContext(query, intentInfo, limit = RETRIEVAL_LIMIT) {
  ingestionService.initialize();
  const chunks = ingestionService.getChunks();

  if (!query || chunks.length === 0) return { contextBlocks: [], sources: [], confidenceScore: 0.3 };

  const queryTerms = tokenize(query);
  const normalizedQuery = query.toLowerCase().trim();
  const targetEntityLower = intentInfo?.targetEntity ? intentInfo.targetEntity.toLowerCase() : null;
  const targetCategory = intentInfo?.targetCategory;

  const scored = [];

  for (const chunk of chunks) {
    let score = 0;
    const contentLower = chunk.content.toLowerCase();
    const titleLower = chunk.title.toLowerCase();
    const categoryLower = (chunk.category || "").toLowerCase();

    // Specific Entity Hard Filtering (e.g. TaskNexus query must match TaskNexus title or project content)
    if (targetEntityLower) {
      if (titleLower.includes(targetEntityLower)) {
        score += 0.8;
      } else if (contentLower.includes(targetEntityLower) && (categoryLower === "projects" || chunk.section === "projects")) {
        score += 0.4;
      } else {
        continue; // Exclude non-matching chunks when targeting specific entity
      }
    }

    // Category Match Boost
    if (targetCategory && (categoryLower.includes(targetCategory) || chunk.section === targetCategory)) {
      score += 0.3;
    }

    // Direct String Match
    if (contentLower.includes(normalizedQuery)) score += 0.4;
    if (titleLower.includes(normalizedQuery)) score += 0.4;

    // Term Frequency Matches
    for (const term of queryTerms) {
      if (contentLower.includes(term)) score += 0.15;
      if (titleLower.includes(term)) score += 0.25;
    }

    // Reject noise chunks below threshold 0.35
    if (score >= 0.35) {
      scored.push({ chunk, score: Math.min(1.0, score) });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  // Precision Trim: Take top 2-3 chunks maximum
  const topMatches = scored.slice(0, limit);

  // Strip raw metadata keys (like identity:, tone:, workStyle:, rules:, Q:, A:)
  const cleanContent = (text) =>
    text
      .replace(/^\s*(identity|tone|workStyle|rules|Q:|A:).*$/gm, "")
      .replace(/\n\s*\n/g, "\n")
      .trim();

  const contextBlocks = topMatches.map((m) => `[Document: ${m.chunk.title}]\n${cleanContent(m.chunk.content)}`);
  const sources = topMatches.map((m) => ({
    section: m.chunk.category,
    title: m.chunk.title,
    chunkId: m.chunk.chunkId,
    score: Number(m.score.toFixed(2)),
  }));

  const confidenceScore = topMatches.length > 0 ? Number(topMatches[0].score.toFixed(2)) : 0.3;

  return { contextBlocks, sources, confidenceScore };
}

/**
 * Session Memory helper.
 */
function getSessionMemory(sessionId) {
  if (!sessionId) return { turns: [], addTurn: () => {} };

  const now = Date.now();
  let session = sessionMemoryStore.get(sessionId);

  if (!session || now - session.lastActivity > SESSION_TTL_MS) {
    session = { turns: [], lastActivity: now };
    sessionMemoryStore.set(sessionId, session);
  } else {
    session.lastActivity = now;
  }

  return {
    turns: session.turns,
    addTurn: (role, content) => {
      session.turns.push({ role, content });
      if (session.turns.length > SESSION_MAX_TURNS * 2) {
        session.turns = session.turns.slice(-SESSION_MAX_TURNS * 2);
      }
    },
  };
}

/**
 * Build Grounded Prompt with strict Synthesis & Precision Directives.
 */
function buildGroundedPrompt(query, contextBlocks, memoryTurns, intentInfo) {
  const systemInstruction = `System Persona: Gaurav's Digital AI Twin
Role: Official portfolio AI assistant representing Gaurav Kumar Yadav — BCA student & AI/ML Minor scholar.
Tone: Professional, articulate, friendly, engineering-focused, direct, concise.

STRICT SYNTHESIS & PRECISION DIRECTIVES:
1. Answer ONLY the specific topic asked in the USER QUERY below.
2. NEVER dump unrelated projects, FAQ items, bio sections, or resume details.
3. NEVER output raw internal metadata keys (such as "identity:", "tone:", "workStyle:", "Q:", "A:", or raw JSON).
4. Write in a fluid, articulate, natural conversational tone like ChatGPT or Claude. Synthesize information smoothly.
5. If the user asks about a specific project (e.g. TaskNexus), discuss ONLY that project.
6. Base factual claims strictly on the RETRIEVED KNOWLEDGE CONTEXT provided below.`;

  const contextSection = contextBlocks.length > 0
    ? `[RETRIEVED KNOWLEDGE CONTEXT]\n${contextBlocks.join("\n\n")}`
    : `[NO DIRECT KNOWLEDGE DOC MATCHED - Respond gracefully as Gaurav's assistant]`;

  const memorySection = memoryTurns.length > 0
    ? `[CONVERSATION HISTORY]\n${memoryTurns.map((t) => `${t.role.toUpperCase()}: ${t.content}`).join("\n")}`
    : "";

  const userSection = `USER QUERY: ${query}`;

  return [systemInstruction, contextSection, memorySection, userSection]
    .filter(Boolean)
    .join("\n\n---\n\n");
}

/**
 * Exponential Backoff Retry Wrapper.
 */
async function callWithRetry(fn, maxRetries = 3, baseDelayMs = 500) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await fn();
    } catch (err) {
      attempt++;
      const isRetryable =
        err.status === 429 ||
        err.status === 503 ||
        String(err.message).includes("429") ||
        String(err.message).toLowerCase().includes("quota") ||
        String(err.message).toLowerCase().includes("resource_exhausted");

      if (isRetryable && attempt < maxRetries) {
        const delay = baseDelayMs * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw err;
      }
    }
  }
}

/**
 * Generate Grounded Fallback Response directly from RAG Context.
 */
function generateGroundedFallbackResponse(query, contextBlocks, sources) {
  if (contextBlocks.length > 0) {
    const summaryText = contextBlocks
      .slice(0, 2)
      .map((block) => block.replace(/\[Document: [^\]]+\]\n/, "").replace(/^\s*(identity|tone|workStyle|rules|Q:|A:).*$/gm, "").trim())
      .filter(Boolean)
      .join("\n\n");

    return `Here is what I found regarding your question:\n\n${summaryText}\n\nFeel free to ask for more specific details or reach out to Gaurav directly at gauravkumar752399@gmail.com!`;
  }

  return "I am Gaurav's portfolio AI assistant. Feel free to ask about Gaurav's projects, technical skills, background, or journey, or reach out to Gaurav directly at gauravkumar752399@gmail.com!";
}

/**
 * Process AI Chat completion.
 */
async function processAIChat({ message, sessionId, history = [] }) {
  const startTime = Date.now();
  const trimmedMessage = String(message || "").trim();
  const normalizedKey = trimmedMessage.toLowerCase();

  if (!trimmedMessage) {
    const error = new Error("Message cannot be empty.");
    error.code = "INVALID_REQUEST";
    throw error;
  }

  // Pre-Retrieval Conversation Router Interception
  const convRoute = conversationRouter.route(trimmedMessage);
  if (!convRoute.isRAGRequired) {
    return {
      success: true,
      reply: convRoute.reply,
      sources: [],
      confidenceScore: 1.0,
      intent: convRoute.intent || "casual_conversation",
      followUpSuggestions: convRoute.suggestions || [],
      provider: "conversation-router",
      model: "conversation-router",
      degraded: false,
      latencyMs: Date.now() - startTime,
      usage: { promptTokens: 0, completionTokens: Math.ceil(convRoute.reply.length / 4), totalTokens: Math.ceil(convRoute.reply.length / 4) },
    };
  }

  // Check In-Memory Response Cache
  const now = Date.now();
  const cached = responseCache.get(normalizedKey);
  if (cached && now - cached.timestamp < RESPONSE_CACHE_TTL_MS) {
    return {
      ...cached.payload,
      provider: "cache-hit",
      latencyMs: Date.now() - startTime,
    };
  }

  // Intent classification
  const intentInfo = classifyIntent(trimmedMessage);

  // Session Memory
  const sessionMem = getSessionMemory(sessionId);
  if (Array.isArray(history) && history.length > 0 && sessionMem.turns.length === 0) {
    for (const h of history.slice(-SESSION_MAX_TURNS)) {
      if (h.content) {
        sessionMem.addTurn(h.role === "assistant" ? "assistant" : "user", String(h.content));
      }
    }
  }

  // Metadata Pre-Filtered RAG Context Retrieval
  const { contextBlocks, sources, confidenceScore } = retrieveRAGContext(trimmedMessage, intentInfo);

  // Build Grounded Prompt
  const fullPrompt = buildGroundedPrompt(trimmedMessage, contextBlocks, sessionMem.turns, intentInfo);

  let replyText = "";
  let providerName = "gemini";
  let degraded = false;

  if (!GEMINI_API_KEY) {
    replyText = generateGroundedFallbackResponse(trimmedMessage, contextBlocks, sources);
    providerName = "fallback";
    degraded = true;
  } else {
    try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: GEMINI_MODEL,
        generationConfig: {
          temperature: TEMPERATURE,
          topP: TOP_P,
          maxOutputTokens: MAX_TOKENS,
        },
      });

      // Call Gemini API with Exponential Backoff Retry (up to 3 retries)
      const result = await callWithRetry(() => model.generateContent(fullPrompt));
      const response = await result.response;
      replyText = String(response.text() || "").trim();

      if (!replyText) {
        throw new Error("Received empty text response from Gemini API");
      }
    } catch (err) {
      console.warn("Gemini API error / Quota Limit reached:", err.message);
      // Grounded Fallback directly from retrieved RAG context
      replyText = generateGroundedFallbackResponse(trimmedMessage, contextBlocks, sources);
      providerName = "rag-grounded-fallback";
      degraded = true;
    }
  }

  // Memory Update
  sessionMem.addTurn("user", trimmedMessage);
  sessionMem.addTurn("assistant", replyText);

  const latencyMs = Date.now() - startTime;

  const resultPayload = {
    success: true,
    reply: replyText,
    sources,
    confidenceScore,
    intent: intentInfo.intent,
    followUpSuggestions: intentInfo.suggestedFollowUps,
    provider: providerName,
    model: GEMINI_MODEL,
    degraded,
    latencyMs,
    usage: {
      promptTokens: Math.ceil(fullPrompt.length / 4),
      completionTokens: Math.ceil(replyText.length / 4),
      totalTokens: Math.ceil((fullPrompt.length + replyText.length) / 4),
    },
  };

  // Cache response
  responseCache.set(normalizedKey, {
    payload: resultPayload,
    timestamp: Date.now(),
  });

  return resultPayload;
}

/**
 * Server-Sent Events (SSE) Progressive Token Streaming Response.
 */
async function processAIChatStream(res, { message, sessionId, history = [] }) {
  const trimmedMessage = String(message || "").trim();

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  if (!trimmedMessage) {
    res.write(`data: ${JSON.stringify({ error: "Message cannot be empty" })}\n\n`);
    res.end();
    return;
  }

  // Pre-Retrieval Conversation Router Interception for Streaming
  const convRoute = conversationRouter.route(trimmedMessage);
  if (!convRoute.isRAGRequired) {
    res.write(
      `data: ${JSON.stringify({
        type: "meta",
        sources: [],
        confidenceScore: 1.0,
        intent: convRoute.intent || "casual_conversation",
        suggestions: convRoute.suggestions || [],
      })}\n\n`
    );
    res.write(`data: ${JSON.stringify({ type: "token", text: convRoute.reply })}\n\n`);
    res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
    res.end();
    return;
  }

  const intentInfo = classifyIntent(trimmedMessage);
  const sessionMem = getSessionMemory(sessionId);
  const { contextBlocks, sources, confidenceScore } = retrieveRAGContext(trimmedMessage, intentInfo);
  const fullPrompt = buildGroundedPrompt(trimmedMessage, contextBlocks, sessionMem.turns, intentInfo);

  // Send metadata header event
  res.write(
    `data: ${JSON.stringify({
      type: "meta",
      sources,
      confidenceScore,
      intent: intentInfo.intent,
      suggestions: intentInfo.suggestedFollowUps,
    })}\n\n`
  );

  if (!GEMINI_API_KEY) {
    const fallbackText = generateGroundedFallbackResponse(trimmedMessage, contextBlocks, sources);
    res.write(`data: ${JSON.stringify({ type: "token", text: fallbackText })}\n\n`);
    res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
    res.end();
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    const result = await callWithRetry(() => model.generateContentStream(fullPrompt));

    let fullReply = "";
    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        fullReply += text;
        res.write(`data: ${JSON.stringify({ type: "token", text })}\n\n`);
      }
    }

    sessionMem.addTurn("user", trimmedMessage);
    sessionMem.addTurn("assistant", fullReply);

    res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
  } catch (err) {
    console.warn("SSE Stream Error:", err.message);
    const fallbackText = generateGroundedFallbackResponse(trimmedMessage, contextBlocks, sources);
    res.write(`data: ${JSON.stringify({ type: "token", text: fallbackText })}\n\n`);
    res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
  } finally {
    res.end();
  }
}

module.exports = {
  processAIChat,
  processAIChatStream,
};

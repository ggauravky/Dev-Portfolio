// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// Every chat limit, model name and quota in one place (P-chat-1, D-102).
// Free-tier numbers were read on 2026-11-20 (docs/PLAN.md, "Verified facts"):
// - Groq free plan, openai/gpt-oss-20b: 30 RPM, 1K RPD, 8K TPM, 200K TPD.
// - Gemini free tier: per-model limits are not published (AI Studio shows them
//   per project); set GEMINI_* below from AI Studio and log them in DECISIONS.
// Server-only: nothing here may be imported by src/ (keys are read from env).

export const SITE_URL = 'https://ggauravky.vercel.app'

// ── Models ────────────────────────────────────────────────────────────────
export const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
export const GROQ_MODEL = 'openai/gpt-oss-20b'
export const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'
export const GEMINI_MODEL = 'gemini-3.5-flash-lite'
export const EMBED_MODEL = 'gemini-embedding-001'
export const EMBED_DIM = 768

// ── Provider budgets (per UTC day, counted in Mongo; under the free quotas) ──
export const GROQ_DAILY_BUDGET = 900 // free plan RPD is 1,000
export const GEMINI_DAILY_BUDGET = 200 // ⚠ unpublished limit: confirm in AI Studio
export const EMBED_DAILY_BUDGET = 900 // ⚠ unpublished limit: confirm in AI Studio
// Site-wide per-minute caps, so a burst (or a script) can't spend the free
// per-minute quota for everyone; past them the next provider or the template
// answers. Groq free RPM is 30; Gemini embeddings returned 429 near 100/min.
export const GROQ_PER_MINUTE = 25
export const GEMINI_PER_MINUTE = 10
export const EMBED_PER_MINUTE = 60

// ── Timeouts ──────────────────────────────────────────────────────────────
export const PROVIDER_TIMEOUT_MS = 8000 // time to first token, per provider
export const STREAM_IDLE_MS = 8000 // gap between tokens before giving up
export const EMBED_TIMEOUT_MS = 2500
export const MAX_DURATION_S = 30 // Vercel function maxDuration (Hobby max is 300)

// ── Generation ────────────────────────────────────────────────────────────
export const MAX_OUTPUT_TOKENS = 450 // gpt-oss counts reasoning tokens too
export const TEMPERATURE = 0.2
export const ANSWER_WORDS = 120

// ── Retrieval ─────────────────────────────────────────────────────────────
export const TOP_K = 5
export const CONTEXT_CHARS_PER_CHUNK = 1000 // a knowledge-base piece whole; a request stays near 2.2K tokens
export const MAX_PREVIOUS_ANSWER_CHARS = 700 // the last answer, for follow-ups
export const PREVIOUS_TURN_MAX_AGE_MS = 30 * 60 * 1000 // older turns aren't "the conversation"
export const WEIGHT_VECTOR = 0.7
export const WEIGHT_KEYWORD = 0.3
// Measured 2026-11-20 with gemini-embedding-001 (768): on-topic questions
// scored 0.50–0.80, off-topic 0.45–0.60. Above 0.48 the model gets the context
// (and refuses off-topic itself); the no-LLM template lists pages only ≥ 0.58.
export const MIN_SCORE_HYBRID = 0.48 // below this nothing is "about Gaurav"
export const TEMPLATE_MIN_SCORE_HYBRID = 0.58
export const MIN_SCORE_KEYWORD = 0.18 // keyword-only mode (no query vector)
// A typo zeroes the keyword half of the hybrid score ("servises", "intenship"),
// so a strong vector match alone also counts. Measured 2026-11-20 on 22
// questions: on-topic (typos, Hinglish) cosine 0.666–0.782; off-topic
// (trivia, jokes, code requests, "hack this website", gibberish) 0.480–0.604.
export const MIN_VECTOR_ONLY = 0.64
export const FOLLOW_UPS = 3
// Knowledge base (D-109). A project has several records; at most this many
// from one project or section go into the context (one more when named).
export const GROUP_CAP = 2
export const NAME_BOOST = 0.08 // added to every chunk of a project the question names
// FAQ question-to-question matching (cosine of query embeddings, or word
// overlap without vectors). Above DIRECT the owner's answer is sent as is,
// with no model call; above CONTEXT it leads the model's context.
// Measured 2026-11-20 (22 held-out questions): paraphrases of a FAQ scored
// 0.80–0.98; related-but-different questions ("how long did TaskNexus take to
// build?") up to 0.888; off-topic under 0.65. DIRECT keeps a margin over 0.888.
// Raised to 0.92 after "tell me about his current internship" matched the broader
// "Where has Gaurav worked?" at 0.912; exact paraphrases score 0.92–0.98.
export const FAQ_DIRECT_VECTOR = 0.92
export const FAQ_CONTEXT_VECTOR = 0.78 // lowest correct match measured: 0.796
export const FAQ_DIRECT_KEYWORD = 0.9
export const FAQ_CONTEXT_KEYWORD = 0.6

// ── Input caps ────────────────────────────────────────────────────────────
export const MAX_BODY_BYTES = 4096
export const MAX_QUESTION_CHARS = 500
export const MAX_HISTORY_TURNS = 2
export const MAX_HISTORY_CHARS = 600 // per history entry

// ── Rate limits (Mongo-backed fixed windows, D-102) ────────────────────────
export const RATE_WINDOW_MS = 10 * 60 * 1000
export const SESSION_LIMIT = 18 // messages per session per window
export const IP_LIMIT = 60 // backstop per IP hash (sessionIds are client-made)
export const SESSION_DAILY_LIMIT = 80 // messages per session per UTC day

// ── Storage ───────────────────────────────────────────────────────────────
export const DB_NAME = 'portfolio_chat'
export const RETENTION_DAYS = 180 // owner choice 2026-11-20 (D-101)
export const CACHE_TTL_HOURS = 24
export const CACHE_SCHEMA = 10 // bump when the cached shape changes; old keys just expire
export const MONGO_TIMEOUT_MS = 3000
export const MONGO_POOL = 3
export const MONGO_COOLDOWN_MS = 60 * 1000 // skip Mongo this long after a failure

/** Read server-only settings from the environment (never VITE_*). */
export function readEnv(env = process.env) {
    const origins = String(env.CHAT_ALLOWED_ORIGINS || SITE_URL)
        .split(',')
        .map((value) => {
            try { return new URL(value.trim()).origin } catch { return '' }
        })
        .filter(Boolean)
    return {
        enabled: env.CHAT_ENABLED !== '0' && env.CHAT_ENABLED !== 'false',
        groqKey: env.GROQ_API_KEY || '',
        geminiKey: env.GEMINI_API_KEY || '',
        mongoUri: env.CHAT_MONGODB_URI || '',
        ipSalt: env.CHAT_IP_HASH_SALT || '',
        origins: [...new Set(origins)],
        production: env.NODE_ENV === 'production' || env.VERCEL_ENV === 'production',
    }
}

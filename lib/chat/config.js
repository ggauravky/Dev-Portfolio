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

// ── Provider table (D-113): the only models the chat can call ──────────────
// Every entry is a free-tier model. There is no env override of model ids, so
// a configuration change can't switch to a chargeable model by accident.
// Limits sit under the free quotas: requests and tokens per minute and per UTC
// day. Groq's were read from its own response headers on 2026-11-21
// (x-ratelimit-limit-requests 1000/day, x-ratelimit-limit-tokens 8000/min).
// Gemini publishes no per-model free numbers (AI Studio shows them per
// project), so its values are conservative estimates ⚠.
// Note: a Gemini key from a project with billing enabled is charged; the key
// must come from a free-tier project (docs/DEPLOYMENT.md).
export const PROVIDERS = {
    groq: { model: GROQ_MODEL, keyName: 'groqKey', freeTier: true, rpm: GROQ_PER_MINUTE, rpd: GROQ_DAILY_BUDGET, tpm: 7000, tpd: 180000 },
    gemini: { model: GEMINI_MODEL, keyName: 'geminiKey', freeTier: true, rpm: GEMINI_PER_MINUTE, rpd: GEMINI_DAILY_BUDGET, tpm: 100000, tpd: 400000 },
}
export const EMBED_PROVIDER = { model: EMBED_MODEL, keyName: 'geminiKey', freeTier: true, rpm: EMBED_PER_MINUTE, rpd: EMBED_DAILY_BUDGET }
export const DEFAULT_PROVIDER_ORDER = ['groq', 'gemini']
// Site-wide: at most this many model generations may start in any 10 seconds
// (a leak-free stand-in for a concurrency cap on serverless).
export const GEN_STARTS_PER_10S = 6
export const DEFAULT_COOLDOWN_MS = 60 * 1000 // after a 429/503 with no retry hint
// MongoDB unreachable: shared counters can't be trusted. In production the
// chat fails closed (HTTP 503, D-134); outside production each instance may
// make only this many model calls a minute (local development and tests).
export const EMERGENCY_AI_PER_MINUTE = 3

// ── Timeouts ──────────────────────────────────────────────────────────────
export const PROVIDER_TIMEOUT_MS = 8000 // time to first token, per provider
export const STREAM_IDLE_MS = 8000 // gap between tokens before giving up
export const EMBED_TIMEOUT_MS = 2500
export const MAX_DURATION_S = 30 // Vercel function maxDuration (Hobby max is 300)

export const REQUEST_DEADLINE_MS = 26 * 1000 // the whole request, from its first line (maxDuration is 30 s)
export const CLEANUP_RESERVE_MS = 3000 // kept back from the model for validation, logging and the lease
export const MIN_GENERATION_MS = 5000 // below this much time left, no model call starts

// ── Generation ────────────────────────────────────────────────────────────
// Output tokens per operation (D-134). gpt-oss counts reasoning tokens too, so
// each budget includes room for them. The default stays the old 600.
export const MAX_OUTPUT_TOKENS = 600
export const OUTPUT_TOKENS = {
    fact: 600, explain: 800, compare: 1100, evaluate: 1100, interview: 1000, summary: 700, transform: 800, structured: 700,
}
export const TEMPERATURE = 0.2
export const ANSWER_WORDS = 120
// Bump when the prompt or the answer policy changes: cached answers written
// under another policy are never served (part of the cache key).
export const ANSWER_POLICY = 2

// ── Retrieval ─────────────────────────────────────────────────────────────
export const TOP_K = 5
export const CONTEXT_CHARS_PER_CHUNK = 1000 // a knowledge-base piece whole; a request stays near 2.2K tokens
export const MAX_PREVIOUS_ANSWER_CHARS = 1200 // the answer a follow-up or transformation is about
// ── Conversation memory (D-134) ─────────────────────────────────────────────
// The server's stored turns of this conversation are the source of truth.
// History reads are bounded: at most HISTORY_READ turns, newest first.
export const HISTORY_READ = 40
export const WORKING_TURNS = 6 // recent complete turns the model sees
export const WORKING_CHARS = 2400 // their total size (questions + clipped answers)
export const WORKING_ANSWER_CHARS = 450 // per earlier answer in working memory
export const PREVIOUS_TURN_MAX_AGE_MS = 12 * 60 * 60 * 1000 // working memory: turns of the last 12 h
// (Summaries read the whole conversation in pages: lib/chat/memory.js SUMMARY_MAX_TURNS.)
export const PENDING_MAX_AGE_MS = 30 * 60 * 1000 // a clarification question waits this long for its answer
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

// ── Rate limits (D-134; Mongo-backed fixed windows) ─────────────────────────
// The visitor (signed HttpOnly cookie) is the allowance; a conversation id is
// only a conversation, so New Chat, a new tab or a new session id never get a
// fresh allowance. All windows are fixed windows aligned to the clock: the
// minute, the 10-minute block (:00, :10, …) and the UTC calendar day (resets
// at 00:00 UTC, not a rolling 24 h). Only accepted messages count, cached and
// fixed replies included; a refused request adds nothing to these counters.
export const RATE_WINDOW_MS = 10 * 60 * 1000
export const MINUTE_MS = 60 * 1000
export const VISITOR_PER_MINUTE = 5
export const VISITOR_LIMIT = 15 // per visitor per 10-minute window, across all conversations
export const VISITOR_DAILY_LIMIT = 50 // per visitor per UTC day
// A network (salted hash of the IP, an IPv6 /64) is a backstop: a campus,
// office or hackathon hall shares one public IP, so these stay loose; the
// visitor limits are the fair-use boundary.
export const IP_LIMIT = 150 // accepted messages per network per 10 minutes
export const IP_DAILY_LIMIT = 800 // per network per UTC day
export const IP_AI_LIMIT = 120 // messages that use a model (embedding or generation) per network per 10 minutes
// Cookie rotation: past this many new visitor ids from one network in an hour,
// the network is flagged for an hour, and every visitor id younger than an hour
// on it (not only its first request) shares one small bucket of model calls.
export const NEW_VISITORS_PER_IP_HOUR = 10
// No new identity at all past this many per network per hour (any path: a
// message, a status check, a bad or expired cookie). Loose: a hackathon hall.
export const NEW_VISITORS_HARD_PER_IP_HOUR = 120
export const NEWCOMER_AI_LIMIT = 20 // that bucket: model-using messages per flagged network per 10 minutes
export const YOUNG_VISITOR_MS = 60 * 60 * 1000
// Refused requests (limited, busy, status checks) are counted apart, one
// small counter per network and per visitor per minute, so a client hammering
// the endpoint is cut off before it costs more database work.
export const REJECTS_PER_IP_MINUTE = 240
export const REJECTS_PER_VISITOR_MINUTE = 30
export const STATUS_PER_VISITOR_MINUTE = 12 // quota status checks (opening the chat)
export const STATUS_PER_IP_MINUTE = 240 // status checks per network per minute (they issue identities too)
export const VISITOR_COOKIE = 'chat_vid'
// v1 cookies (unsigned issue time, before D-134) are accepted until this date
// (30 days after v2 went live, 2026-11-26): every honest v1 cookie has expired by then.
export const VISITOR_V1_UNTIL = Date.UTC(2026, 11, 27)
export const VISITOR_COOKIE_DAYS = 30 // also enforced by the server from the signed issue time
export const LOCK_TTL_MS = 35 * 1000 // one request at a time per visitor (≥ the function's maxDuration)
// A secret shorter than this is treated as missing (production then refuses).
export const MIN_SALT_CHARS = 16

// ── Storage ───────────────────────────────────────────────────────────────
export const DB_NAME = 'portfolio_chat'
export const RETENTION_DAYS = 180 // owner choice 2026-11-20 (D-101)
export const CACHE_TTL_HOURS = 24
export const CACHE_SCHEMA = 11 // bump when the cached shape changes; old keys just expire
// Each operation on an open connection. A cold start's first connection (SRV
// lookup, TLS, server selection) gets its own, longer budget: production logs
// showed `mongo timeout after 3000 ms` on cold starts when one 3 s budget
// covered connect + indexes + the operation, and fail-closed turned that into
// 503s (stabilization F20).
export const MONGO_TIMEOUT_MS = 3000
export const MONGO_CONNECT_TIMEOUT_MS = 8000
export const MONGO_POOL = 3
export const MONGO_COOLDOWN_MS = 5 * 1000 // skip Mongo this long after a failure (production answers 503 meanwhile)

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
        // Vercel sets the client-IP headers itself (it overwrites X-Forwarded-For
        // "to prevent IP spoofing", Vercel request-headers docs); anywhere else
        // they are client input and only the socket address is used.
        onVercel: env.VERCEL === '1',
        // "groq,gemini" (default), "gemini,groq", "gemini", "groq", or "none"
        // for answers without a model. Unknown names are ignored.
        providerOrder: parseProviderOrder(env.CHAT_PROVIDER_ORDER),
    }
}

/** The provider order from CHAT_PROVIDER_ORDER: only known, free-tier ids, no repeats. */
export function parseProviderOrder(value) {
    if (value === undefined || value === null || String(value).trim() === '') return [...DEFAULT_PROVIDER_ORDER]
    const names = String(value).toLowerCase().split(',').map((s) => s.trim()).filter((s) => PROVIDERS[s]?.freeTier)
    return [...new Set(names)]
}

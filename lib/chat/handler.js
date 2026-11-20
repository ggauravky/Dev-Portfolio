// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// POST /api/chat. Request: { sessionId, question, history? }.
// Response: NDJSON, one event per line, always HTTP 200 once accepted:
//   {"t":"delta","v":"text"}            (repeated)
//   {"t":"done","sources":[{title,url,type}],"followUps":["…"],"quota":{left,limit,resetAt}}
//   {"t":"limit","retryAt":"ISO","scope":"window"|"day"}  (instead of delta/done when limited)
// Sources come last so a refusal can drop them.
// Bad requests get a small JSON error (400/403/405/413/415). The provider that
// answered is logged, never sent. Stored data is never returned.
//
// Flow (D-107): checks → limits → the conversation so far (server-side) →
// intent routing (small talk and unsafe input answered without a model) →
// retrieval → generation → log.
// Not a public API: it serves only the site's own page (exact Origin, a
// same-origin fetch) and is not listed in openapi.json (D-108).

import { readFileSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import {
    CACHE_SCHEMA, EMBED_DAILY_BUDGET, EMBED_PER_MINUTE, FAQ_DIRECT_KEYWORD, FAQ_DIRECT_VECTOR, GEMINI_DAILY_BUDGET,
    GEMINI_PER_MINUTE, GROQ_DAILY_BUDGET, GROQ_PER_MINUTE, IP_LIMIT, MAX_BODY_BYTES, MAX_HISTORY_CHARS, MAX_HISTORY_TURNS,
    MAX_QUESTION_CHARS, PREVIOUS_TURN_MAX_AGE_MS, RATE_WINDOW_MS, SESSION_DAILY_LIMIT, SESSION_LIMIT, TOP_K, readEnv,
} from './config.js'
import { cleanUserText, normaliseQuestion } from './redact.js'
import { buildMessages, isDecline } from './prompt.js'
import {
    faqMatch, looksLikeNoise, namedGroups, prepareIndex, rank, resolveRelative, sourcesOf, suggest, withFaq, withOverviews,
} from './retrieve.js'
import { embedQuery, generateAnswer } from './providers.js'
import { cannedReply, isFollowUp, route } from './intents.js'
import { createStore, dayOf, hashIp, DAY } from './store.js'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const DEV_ORIGINS = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:4173', 'http://127.0.0.1:5173', 'http://localhost:8787']
const SOURCE_RELATIVE = 0.85
const MAX_SOURCES = 3
const RECENT_TURNS = 6
const TOPIC_CHARS = 400 // of the previous answer, added to a follow-up's retrieval query
const MINUTE = 60 * 1000
const BUDGETS = {
    groq: { day: GROQ_DAILY_BUDGET, minute: GROQ_PER_MINUTE },
    gemini: { day: GEMINI_DAILY_BUDGET, minute: GEMINI_PER_MINUTE },
    embed: { day: EMBED_DAILY_BUDGET, minute: EMBED_PER_MINUTE },
}

export const RESTING_REPLY = "The assistant is resting right now. Everything it knows is on the site: try Projects, Journey or Services, or write to Gaurav from the Contact page."

let cachedIndex = null
export function loadIndex() {
    if (!cachedIndex) {
        try {
            cachedIndex = prepareIndex(JSON.parse(readFileSync(new URL('./corpus-index.json', import.meta.url), 'utf8')))
        } catch {
            cachedIndex = prepareIndex({ chunks: [] })
        }
    }
    return cachedIndex
}

let cachedStore = null
const defaultStore = (env, log) => {
    if (!cachedStore) cachedStore = createStore({ uri: env.mongoUri, log })
    return cachedStore
}

const defaultLog = (event, data = {}) => {
    console.log(JSON.stringify({ event, ...data }))
}

const sendError = (res, status, code, message) => {
    res.setHeader('Cache-Control', 'no-store')
    res.setHeader('X-Robots-Tag', 'noindex')
    res.status(status).json({ success: false, error: { code, message } })
}

function clientIp(req) {
    const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim()
    return forwarded || String(req.headers['x-real-ip'] || '') || req.socket?.remoteAddress || ''
}

/** Validate and clean the body. Returns { value } or { error: [status, code, message] }. */
export function parseRequest(body) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) return { error: [400, 'BAD_BODY', 'Send a JSON object.'] }
    const { sessionId, question, history } = body
    if (typeof sessionId !== 'string' || !UUID.test(sessionId)) return { error: [400, 'BAD_SESSION', 'sessionId must be a UUID.'] }
    if (typeof question !== 'string' || !question.trim()) return { error: [400, 'EMPTY_QUESTION', 'Ask a question.'] }
    if (question.length > MAX_QUESTION_CHARS) return { error: [400, 'TOO_LONG', `Keep questions under ${MAX_QUESTION_CHARS} characters.`] }
    if (history !== undefined && !Array.isArray(history)) return { error: [400, 'BAD_HISTORY', 'history must be an array of strings.'] }
    const earlier = (history || [])
        .filter((item) => typeof item === 'string')
        .slice(-MAX_HISTORY_TURNS)
        .map((item) => cleanUserText(item, MAX_HISTORY_CHARS))
        .filter(Boolean)
    const cleaned = cleanUserText(question, MAX_QUESTION_CHARS)
    if (!cleaned) return { error: [400, 'EMPTY_QUESTION', 'Ask a question.'] }
    return { value: { sessionId: sessionId.toLowerCase(), question: cleaned, history: earlier } }
}

const fold = (text) => String(text || '').toLowerCase().replace(/[‐-―]/g, '-').replace(/\s+/g, ' ')
const escapeRe = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Only named things link: a project, entry, service or post (not "Education").
const NAMEABLE = new Set(['project', 'roadmap', 'journey', 'service', 'blog'])

/**
 * Retrieved chunks the answer names: by its short title ("Kanoon-Mate AI Legal
 * Assistance Platform" up to ":" or "("), or by a distinctive first word
 * ("Kanoon-Mate", "SmartMess", "TechX26"). Only named things count.
 */
export function mentionedChunks(chunks, answer) {
    const text = fold(answer)
    const seen = new Set()
    return chunks
        .map((chunk) => {
            if (!NAMEABLE.has(chunk.type) || !chunk.title || !chunk.url) return null
            const short = fold(chunk.title.split(/[:(]/)[0].trim())
            let at = short.length >= 4 ? text.indexOf(short) : -1
            if (at < 0) {
                const first = chunk.title.split(/\s+/)[0]
                const distinctive = first.length >= 5 && /[A-Z].*[A-Z]|\d|-/.test(first.slice(1))
                const match = distinctive ? new RegExp(`\\b${escapeRe(fold(first))}\\b`).exec(text) : null
                at = match ? match.index : -1
            }
            return at < 0 ? null : { chunk, at }
        })
        .filter(Boolean)
        .sort((a, b) => a.at - b.at)
        .map(({ chunk }) => chunk)
        // One link per page (blog sections share their post's URL).
        .filter((chunk) => !seen.has(chunk.url) && seen.add(chunk.url))
}

// Site pages an answer points to by name ("the Contact page").
const PAGE_MENTIONS = [
    [/contact (page|form)/i, 'about:status'],
    [/projects page/i, 'overview:projects'],
    [/journey page/i, 'overview:journey'],
    [/services page/i, 'overview:services'],
    [/blog page/i, 'overview:blog'],
]
export const mentionedPages = (index, answer) => PAGE_MENTIONS
    .filter(([re]) => re.test(answer))
    .map(([, id]) => index.chunks.find((c) => c.id === id))
    .filter(Boolean)

const PLATFORM_NAMES = {
    instagram: 'Instagram', x: 'X (Twitter)', linkedin: 'LinkedIn', github: 'GitHub', leetcode: 'LeetCode', gfg: 'GeeksforGeeks',
    phone: 'phone number', email: 'email', facebook: 'Facebook', youtube: 'YouTube', telegram: 'Telegram', discord: 'Discord', snapchat: 'Snapchat',
}
export const CONTACT_FOLLOW_UPS = [
    'Is he available for internships or work?',
    "What's in the Full Stack Development service, and what does it cost?",
    'Where has Gaurav worked?',
]

/**
 * Where to reach Gaurav, from the profiles the site itself lists (the ⌘K
 * palette, D-110). The asked platform comes first; one he doesn't list is
 * said plainly, never invented. No model call.
 */
/** A profile as a short, tappable link: "[@ggauravky](https://instagram.com/ggauravky)". */
function profileLink(p) {
    if (p.id === 'email') return `[${p.value}](mailto:${p.value})`
    if (p.id === 'phone') return `[${p.value}](tel:${p.value.replace(/\s+/g, '')})`
    const handle = p.url.replace(/\/+$/, '').split('/').pop()
    return `[${['instagram', 'x'].includes(p.id) ? '@' : ''}${handle}](${p.url})`
}

export function contactReply(profiles, platform = 'all') {
    const row = (p) => `- **${p.label}**: ${profileLink(p)}`
    const asked = profiles.find((p) => p.id === platform)
    const others = profiles.filter((p) => p !== asked)
    const close = 'For work or hiring, the Contact page (/contact) is the quickest way to reach him.'
    if (!profiles.length) return `You can reach Gaurav through the Contact page (/contact).`
    if (asked) {
        // Not bold: a bold URL isn't turned into a link.
        return `Gaurav’s ${PLATFORM_NAMES[platform] || asked.label}: ${profileLink(asked)}\n\nOther ways to find him:\n${others.map(row).join('\n')}\n\n${close}`
    }
    if (platform !== 'all' && PLATFORM_NAMES[platform]) {
        return `Gaurav doesn’t list a ${PLATFORM_NAMES[platform]} account on the site. Here’s where you can find him:\n${profiles.map(row).join('\n')}\n\n${close}`
    }
    return `Here’s where you can find Gaurav:\n${profiles.map(row).join('\n')}\n\n${close}`
}

/**
 * The journey entry a relative-time follow-up is about: one the question names
 * ("the one after TechX26"), else the first one the previous answer named,
 * else the best-ranked journey chunk.
 */
function journeyTopic(index, ranked, question, previous) {
    const journey = index.chunks.filter((c) => c.type === 'journey')
    return mentionedChunks(journey, question)[0]
        || mentionedChunks(journey, previous?.a || '')[0]
        || ranked.top.find((c) => c.type === 'journey')
        || null
}

/**
 * Who may call: the site's own page only. An exact Origin match (no wildcard),
 * and when the browser says where the request came from (Sec-Fetch-Site), it
 * must be same-origin. Scripts can forge headers; the limits and budgets are
 * what bound the cost of that (D-108).
 */
function callerProblem(req, env) {
    const origin = String(req.headers.origin || '')
    const allowed = env.production ? env.origins : [...env.origins, ...DEV_ORIGINS]
    if (origin ? !allowed.includes(origin) : env.production) return 'Origin not allowed.'
    const site = String(req.headers['sec-fetch-site'] || '')
    if (env.production && site && site !== 'same-origin') return 'Cross-site requests are not allowed.'
    return null
}

/**
 * Build the handler. Everything external is injectable for tests:
 * env, store, fetchImpl, embed, index, log, now.
 */
export function createChatHandler(deps = {}) {
    return async function chatHandler(req, res) {
        const started = Date.now()
        const env = deps.env || readEnv()
        const log = deps.log || defaultLog
        const now = deps.now || Date.now
        const send = (event) => res.write(`${JSON.stringify(event)}\n`)

        try {
            if (req.method !== 'POST') {
                res.setHeader('Allow', 'POST')
                return sendError(res, 405, 'METHOD_NOT_ALLOWED', 'Use POST.')
            }
            const problem = callerProblem(req, env)
            if (problem) return sendError(res, 403, 'ORIGIN', problem)
            if (!/^application\/json\b/i.test(String(req.headers['content-type'] || ''))) {
                return sendError(res, 415, 'CONTENT_TYPE', 'Send application/json.')
            }
            let body
            try {
                body = req.body // Vercel's getter throws on invalid JSON
            } catch {
                return sendError(res, 400, 'BAD_JSON', 'Send valid JSON.')
            }
            const size = Number(req.headers['content-length'] || 0) || Buffer.byteLength(JSON.stringify(body ?? ''))
            if (size > MAX_BODY_BYTES) return sendError(res, 413, 'TOO_LARGE', 'Request body is too large.')

            const parsed = parseRequest(body)
            if (parsed.error) return sendError(res, ...parsed.error)
            const { sessionId, question, history } = parsed.value

            res.statusCode = 200
            res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8')
            res.setHeader('Cache-Control', 'no-store')
            res.setHeader('X-Content-Type-Options', 'nosniff')
            res.setHeader('X-Robots-Tag', 'noindex')
            res.setHeader('X-Accel-Buffering', 'no')

            if (!env.enabled) {
                send({ t: 'delta', v: RESTING_REPLY })
                send({ t: 'done', sources: [], followUps: [] })
                return res.end()
            }

            const store = deps.store || defaultStore(env, log)
            const ipHash = hashIp(clientIp(req), env.ipSalt)

            // ── Limits: per session and per IP (10 min), per session (day) ──
            const [session, ip, sessionDay] = await Promise.all([
                store.count(`s:${sessionId}`, RATE_WINDOW_MS),
                store.count(`i:${ipHash}`, RATE_WINDOW_MS),
                store.count(`sd:${sessionId}:${dayOf(now())}`, DAY),
            ])
            const over = [
                session.count > SESSION_LIMIT && ['session', session],
                ip.count > IP_LIMIT && ['ip', ip],
                sessionDay.count > SESSION_DAILY_LIMIT && ['session-day', sessionDay],
            ].filter(Boolean)
            if (over.length) {
                const retryAt = new Date(Math.max(...over.map(([, l]) => l.resetAt))).toISOString()
                send({ t: 'limit', retryAt, scope: over.some(([scope]) => scope === 'session-day') ? 'day' : 'window' })
                log('chat.limited', { scope: over.map(([scope]) => scope).join(',') })
                return res.end()
            }
            // What the visitor has left: the tighter of the 10-minute and daily caps.
            const windowLeft = SESSION_LIMIT - session.count
            const dayLeft = SESSION_DAILY_LIMIT - sessionDay.count
            const quota = windowLeft <= dayLeft
                ? { left: Math.max(0, windowLeft), limit: SESSION_LIMIT, scope: 'window', resetAt: new Date(session.resetAt).toISOString() }
                : { left: Math.max(0, dayLeft), limit: SESSION_DAILY_LIMIT, scope: 'day', resetAt: new Date(sessionDay.resetAt).toISOString() }

            const closed = new AbortController()
            res.on?.('close', () => { if (!res.writableEnded) closed.abort() })

            // Provider budgets: per UTC day and per minute, site-wide.
            const allow = async (name) => {
                const budget = BUDGETS[name]
                if (!budget) return true
                const [day, minute] = await Promise.all([
                    store.count(`p:${name}:${dayOf(now())}`, DAY),
                    store.count(`pm:${name}`, MINUTE),
                ])
                return day.count <= budget.day && minute.count <= budget.minute
            }
            const skipped = []
            const onSkip = (name, reason) => skipped.push(`${name}: ${reason}`.slice(0, 160))

            // ── The conversation so far, as the server stored it ──
            // Recent turns of this session (newest first, last 30 min). The
            // browser's `history` is used only when the server has none.
            const recent = (await store.recentTurns(sessionId, RECENT_TURNS))
                .filter((t) => now() - t.at <= PREVIOUS_TURN_MAX_AGE_MS)
            const priorQuestions = recent.length ? recent.map((t) => t.q).reverse() : history
            const previous = recent.find((t) => (t.intent === 'question' || t.intent === 'more') && t.a && !isDecline(t.a)) || null

            const index = deps.index || loadIndex()
            let routing = route(question, priorQuestions, { hasPrevious: Boolean(previous) })
            // Keyboard noise ("usfhsuidfh") is caught before follow-up handling,
            // which would otherwise search it together with the previous topic.
            if (routing.kind === 'question' && looksLikeNoise(index, routing.question)) {
                const n = recent.filter((t) => t.intent === 'gibberish').length
                routing = { kind: 'reply', intent: 'gibberish', ...cannedReply('gibberish', n, priorQuestions) }
            }
            let intent = routing.kind === 'reply' ? routing.intent : routing.kind
            let answer = ''
            let provider = 'template'
            let ranked = { mode: 'none', top: [], rest: [], matched: false }
            let follow = []
            let sources = []
            let cached = false

            if (routing.kind === 'reply') {
                // Small talk or unsafe input: a fixed reply, no model call.
                provider = 'canned'
                answer = routing.reply
                follow = routing.followUps
                send({ t: 'delta', v: answer })
            } else if (routing.kind === 'contact') {
                // Profiles and how to reach him, from the site's own list (D-110).
                provider = 'canned'
                answer = contactReply(index.profiles || [], routing.platform)
                sources = [{ title: 'Contact', url: '/contact', type: 'about' }]
                follow = CONTACT_FOLLOW_UPS
                send({ t: 'delta', v: answer })
            } else {
                // "Tell me more" asks about the previous turn's topic; a short or
                // pronoun-led question ("what stack did it use?") leans on it.
                const asked = routing.kind === 'more' ? previous.q : routing.question
                // A question that names a project is about that project, even
                // with a pronoun in it ("is TaskNexus live, and what does it use?").
                const named = namedGroups(index, asked)
                const selfContained = named.size > 0 && asked.trim().split(/\s+/).length >= 4
                const leansOnPrevious = Boolean(previous) && (routing.kind === 'more' || (isFollowUp(asked) && !selfContained))
                // The previous answer names the topic ("Kanoon-Mate") even when
                // the previous question didn't ("what stack did it use?").
                const topic = previous ? `${previous.q}\n${previous.a.slice(0, TOPIC_CHARS)}` : ''
                const retrievalText = routing.kind === 'more' ? topic : leansOnPrevious ? `${topic}\n${asked}` : asked
                const cacheKey = leansOnPrevious ? null : `v${CACHE_SCHEMA}:${index.version}:${normaliseQuestion(asked)}`
                const hit = cacheKey ? await store.getCache(cacheKey) : null
                if (hit) {
                    cached = true
                    provider = hit.provider
                    answer = hit.answer
                    follow = hit.followUps || []
                    sources = hit.sources || []
                    ranked = { mode: 'cache', top: sources, rest: [], matched: true }
                    send({ t: 'delta', v: answer })
                } else {
                    const embed = deps.embed || embedQuery
                    const vector = index.hasVectors && env.geminiKey && (await allow('embed'))
                        ? await embed(retrievalText, { key: env.geminiKey, fetchImpl: deps.fetchImpl })
                        : null
                    ranked = rank(index, retrievalText, vector)
                    // The owner's FAQ (D-109): a question that is one of its
                    // questions gets its answer as written, with no model call; a
                    // close one gets that answer first in the model's context.
                    const faq = leansOnPrevious ? null : faqMatch(index, asked, vector)
                    const direct = faq?.chunk && faq.score >= (faq.via === 'vector' ? FAQ_DIRECT_VECTOR : FAQ_DIRECT_KEYWORD)
                    ranked = withFaq(ranked, faq)
                    // Only for on-topic questions: "when was X built?" about something
                    // else must not pull in the journey.
                    if (ranked.matched && !direct) ranked = withOverviews(index, ranked, asked)
                    // "The hackathon before that": the date comparison is done here,
                    // and the entry it finds goes first in the context.
                    // Also when the question names the entry itself ("the hackathon
                    // before the TechX26 Hackathon?").
                    const namesEntry = [...named].some((group) => group.startsWith('journey:'))
                    const resolved = (leansOnPrevious || namesEntry) && ranked.matched
                        ? resolveRelative(index, journeyTopic(index, ranked, asked, previous), asked)
                        : null
                    if (resolved?.chunk) {
                        ranked = { ...ranked, top: [{ ...resolved.chunk, score: ranked.top[0]?.score || 1 }, ...ranked.top.filter((c) => c.id !== resolved.chunk.id)].slice(0, TOP_K) }
                    }
                    follow = suggest({ index, ranked, asked: [...priorQuestions, asked] })
                    // The model sees all top chunks; the visitor sees only the
                    // strong ones (within 85% of the best), at most three.
                    const best = ranked.top[0]?.score || 0
                    sources = sourcesOf(ranked.top.filter((c) => (c.score || 0) >= best * SOURCE_RELATIVE)).slice(0, MAX_SOURCES)

                    if (!ranked.matched) {
                        // Nothing Gaurav has shared matches: a friendly fixed reply
                        // with questions that do work, not a dead end (D-110).
                        // Keyboard noise gets its own reply.
                        intent = looksLikeNoise(index, asked) ? 'gibberish' : 'nomatch'
                        const canned = cannedReply(intent, recent.filter((t) => t.intent === intent).length, priorQuestions)
                        provider = 'canned'
                        answer = canned.reply
                        follow = canned.followUps
                        sources = []
                        send({ t: 'delta', v: answer })
                    } else if (direct) {
                        provider = 'faq'
                        answer = faq.chunk.faq.answer
                        send({ t: 'delta', v: answer })
                        sources = sourcesOf([faq.chunk, ...mentionedChunks(index.chunks, answer)]).slice(0, MAX_SOURCES)
                    } else {
                        const stream = generateAnswer({
                            messages: buildMessages({
                                chunks: ranked.top,
                                // A date-resolved follow-up is asked as a self-contained question.
                                question: resolved?.chunk
                                    ? `What did Gaurav do at ${resolved.chunk.title}? (${resolved.note})`
                                    : routing.kind === 'more' ? question : asked,
                                history: priorQuestions.slice(-MAX_HISTORY_TURNS),
                                previous: leansOnPrevious ? previous : null,
                                topic: leansOnPrevious && ranked.top[0]?.type !== 'overview' ? ranked.top[0]?.title : '',
                                resolved: resolved?.note || '',
                            }),
                            chunks: ranked.top,
                            matched: ranked.matched,
                            confident: ranked.confident,
                            keys: env,
                            fetchImpl: deps.fetchImpl,
                            allow,
                            onSkip,
                            firstTokenMs: deps.firstTokenMs,
                            idleMs: deps.idleMs,
                            signal: closed.signal,
                        })
                        for await (const part of stream) {
                            if (typeof part === 'object') { provider = part.provider; continue }
                            answer += part
                            send({ t: 'delta', v: part })
                        }
                    }
                    // A refusal or "not on the site" answer gets no sources or
                    // follow-ups (they'd point at unrelated pages) and no cache.
                    const declined = provider !== 'canned' && isDecline(answer)
                    if (declined) intent = 'declined'
                    if (declined || provider === 'template' && !ranked.confident) {
                        // No sources (they'd point at unrelated pages), but still
                        // questions that work, so a decline is never a dead end.
                        sources = []
                        follow = cannedReply('nomatch', 0, [...priorQuestions, asked]).followUps
                    } else if (!['template', 'faq', 'canned'].includes(provider)) {
                        // Link what the answer actually talks about (any page it
                        // names, in the order it names them); otherwise only the
                        // single best match.
                        const mentioned = [...mentionedChunks(index.chunks, answer), ...mentionedPages(index, answer)]
                        sources = mentioned.length ? sourcesOf(mentioned).slice(0, MAX_SOURCES) : sources.slice(0, 1)
                    }
                    if (cacheKey && ranked.matched && !declined && provider !== 'template' && provider !== 'faq' && !closed.signal.aborted) {
                        await store.setCache(cacheKey, { answer, provider, sources, followUps: follow })
                    }
                }
            }

            if (!closed.signal.aborted) send({ t: 'done', sources, followUps: follow, quota })

            // Logged before the response ends: on Vercel, work after res.end()
            // may never run. The visitor already has the `done` event.
            const latencyMs = Date.now() - started
            await store.logTurn({
                _id: randomUUID(),
                sessionId,
                question,
                answer,
                intent,
                chunkIds: ranked.top.map((c) => c.id || c.url),
                retrieval: ranked.mode,
                matched: ranked.matched,
                provider,
                cached,
                latencyMs,
                aborted: closed.signal.aborted,
                ipHash,
                corpusVersion: index.version,
                createdAt: new Date(now()),
            })
            log('chat.turn', { intent, provider, mode: ranked.mode, matched: ranked.matched, cached, latencyMs, skipped, salted: Boolean(env.ipSalt) })
            res.end()
        } catch (error) {
            log('chat.error', { error: error?.message || String(error) })
            if (!res.headersSent) return sendError(res, 500, 'CHAT_ERROR', 'The assistant hit a problem. Please try again.')
            try {
                send({ t: 'delta', v: '\n\n(Something went wrong. Please ask again.)' })
                send({ t: 'done', sources: [], followUps: [] })
                res.end()
            } catch { /* connection already gone */ }
        }
        return undefined
    }
}

export default createChatHandler()

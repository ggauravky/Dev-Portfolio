// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// POST /api/chat. Request: { sessionId, question, tz? } (or { sessionId, op: "status" }).
// Response once admitted: NDJSON, one event per line, HTTP 200:
//   {"t":"delta","v":"text"}            (repeated)
//   {"t":"done","sources":[{title,url,type}],"followUps":["…"],"quota":{…},"citations":{…},
//    "unverified"?:n,"cut"?:true,"interrupted"?:"length"|"interrupted","clarify"?:{choices}}
// Refused before any work (D-134): JSON { success:false, error:{code,message}, retryAt?, scope? }
//   429 RATE_LIMITED (a visitor or network limit) · 429 BUSY (one request at a time)
//   503 UNAVAILABLE (shared limits can't be enforced, or no stable secret) · 400/403/405/413/415
// Status: { sessionId, op: "status" } → 200 { success:true, quota } (uses no allowance).
// The provider that answered is logged, never sent. Stored data is never returned
// except this conversation's own history, to its own visitor, when asked for it.
//
// Lifecycle (D-134):
//   checks → secret → visitor + network identity → admission (abuse counter,
//   lease, visitor and network limits; fails closed in production without
//   shared counters) → this conversation's stored turns (owner-bound) →
//   router (lib/chat/router.js) → one operation:
//     reply · contact · recall · summary · transform · clarify · structured · answer
//   → the model only when the operation needs one, after the network's model
//   admission (before the embedding too) → validation → cache (only
//   context-free, verified, complete answers) → done → log → release the lease.
// Not a public API: it serves only the site's own page (exact Origin, a
// same-origin fetch) and is not listed in openapi.json (D-108); the limits,
// not those checks, are what bound direct clients.

import { readFileSync } from 'node:fs'
import { createHmac, randomUUID } from 'node:crypto'
import {
    ANSWER_POLICY, CACHE_SCHEMA, CLEANUP_RESERVE_MS, EMBED_TIMEOUT_MS, HISTORY_READ, MAX_BODY_BYTES, MAX_QUESTION_CHARS, MIN_GENERATION_MS, OUTPUT_TOKENS,
    PROVIDER_TIMEOUT_MS, REQUEST_DEADLINE_MS,
    TOP_K, readEnv,
} from './config.js'
import { deriveKey, saltOk, visitorFor } from './visitor.js'
import { clientNetwork } from './network.js'
import { admit, admitModel, quotaStatus } from './limits.js'
import { COMPLEX_MAX_CHUNKS, fitBudget, gatherEvidence, planQuestion } from './plan.js'
import { validateCitations } from './cite.js'
import { activeProviders, createQuota } from './quota.js'
import { cleanUserText, normaliseQuestion } from './redact.js'
import { buildMessages, isDecline, taskText } from './prompt.js'
import {
    correctQuestion, faqDecision, looksLikeNoise, namedGroups, spellingFixes, prepareIndex, rank, resolveRelative, sourcesOf, suggest, withFaq, withOverviews,
} from './retrieve.js'
import { embedQuery, generateAnswer } from './providers.js'
import { aboutGaurav, cannedReply, isFollowUp, starterFollowUps } from './intents.js'
import { analyse, orderedGroups } from './router.js'
import { compactHistory, coverageNote, loadRecall, loadSummary, plainSummary, recallAnswer, validTimeZone, workingMemory } from './memory.js'
import { describeResult, runQuery } from './structured.js'
import { chunkById, comparisonTable, entityEvidence, evaluationEvidence, nameOf, projectSummary } from './evidence.js'
import { createStore, hashIp } from './store.js'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const DEV_ORIGINS = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:4173', 'http://127.0.0.1:5173', 'http://localhost:8787']
const SOURCE_RELATIVE = 0.85
const MAX_SOURCES = 3

export const RESTING_REPLY = "The assistant is resting right now. Everything it knows is on the site: try Projects, Journey or Services, or write to Gaurav from the Contact page."
export const UNAVAILABLE_REPLY = "The assistant's writing model is temporarily unavailable (its shared free-tier limits are used up or a provider is down), so I can't write that answer right now. This is a technical limit, not missing information: please try again in a few minutes."
const NO_MODEL_PREFIX = 'The assistant’s writing model is unavailable right now, so here is the plain record instead:'

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

const sendError = (res, status, code, message, extra = {}) => {
    res.setHeader('Cache-Control', 'no-store')
    res.setHeader('X-Robots-Tag', 'noindex')
    if (extra.retryAt) res.setHeader('Retry-After', String(Math.max(1, Math.ceil((Date.parse(extra.retryAt) - Date.now()) / 1000))))
    res.status(status).json({ success: false, error: { code, message }, ...extra })
}

const REFUSALS = {
    RATE_LIMITED: 'You have reached the question limit for now.',
    BUSY: 'One question at a time, please: the previous answer is still being written.',
    UNAVAILABLE: 'The assistant is temporarily unavailable. Please try again shortly.',
}

/** Validate and clean the body. Returns { value } or { error: [status, code, message] }. */
export function parseRequest(body) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) return { error: [400, 'BAD_BODY', 'Send a JSON object.'] }
    const { sessionId, question, history, tz, op } = body
    if (typeof sessionId !== 'string' || !UUID.test(sessionId)) return { error: [400, 'BAD_SESSION', 'sessionId must be a UUID.'] }
    if (op !== undefined && op !== 'status') return { error: [400, 'BAD_OP', 'Unknown operation.'] }
    if (op === 'status') return { value: { sessionId: sessionId.toLowerCase(), op: 'status' } }
    if (typeof question !== 'string' || !question.trim()) return { error: [400, 'EMPTY_QUESTION', 'Ask a question.'] }
    if (question.length > MAX_QUESTION_CHARS) return { error: [400, 'TOO_LONG', `Keep questions under ${MAX_QUESTION_CHARS} characters.`] }
    // `history` is accepted for older clients and ignored: the server's own
    // stored turns are the conversation (browser text is never trusted as history).
    if (history !== undefined && !Array.isArray(history)) return { error: [400, 'BAD_HISTORY', 'history must be an array of strings.'] }
    const cleaned = cleanUserText(question, MAX_QUESTION_CHARS)
    if (!cleaned) return { error: [400, 'EMPTY_QUESTION', 'Ask a question.'] }
    return { value: { sessionId: sessionId.toLowerCase(), question: cleaned, timeZone: validTimeZone(tz) || 'UTC' } }
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
    [/\bcontact (page|form)\b/i, 'about:status'],
    [/\bprojects page\b/i, 'overview:projects'],
    [/\bjourney page\b/i, 'overview:journey'],
    [/\bservices page\b/i, 'overview:services'],
    [/\bblog page\b/i, 'overview:blog'],
]
export const mentionedPages = (index, answer) => PAGE_MENTIONS
    .filter(([re]) => re.test(answer))
    .map(([, id]) => index.chunks.find((c) => c.id === id))
    .filter(Boolean)

/** Valid citation numbers → the public link for each ({ title, url }; url may be ''). */
function citationMap(valid) {
    return Object.fromEntries(Object.entries(valid).map(([n, chunk]) => {
        const [source] = sourcesOf([chunk])
        return [n, source ? { title: source.title, url: source.url } : { title: chunk.title.split(':')[0], url: '' }]
    }))
}

const PLATFORM_NAMES = {
    instagram: 'Instagram', x: 'X (Twitter)', linkedin: 'LinkedIn', github: 'GitHub', leetcode: 'LeetCode', gfg: 'GeeksforGeeks',
    phone: 'phone number', email: 'email', facebook: 'Facebook', youtube: 'YouTube', telegram: 'Telegram', discord: 'Discord', snapchat: 'Snapchat',
}
export const CONTACT_FOLLOW_UPS = [
    'Is he available for internships or work?',
    "What's in the Full Stack Development service, and what does it cost?",
    'Where has Gaurav worked?',
]

/** A profile as a short, tappable link: "[@ggauravky](https://instagram.com/ggauravky)". */
function profileLink(p) {
    if (p.id === 'email') return `[${p.value}](mailto:${p.value})`
    if (p.id === 'phone') return `[${p.value}](tel:${p.value.replace(/\s+/g, '')})`
    const handle = p.url.replace(/\/+$/, '').split('/').pop()
    return `[${['instagram', 'x'].includes(p.id) ? '@' : ''}${handle}](${p.url})`
}

/**
 * Where to reach Gaurav, from the profiles the site itself lists (the ⌘K
 * palette, D-110). The asked platform comes first; one he doesn't list is
 * said plainly, never invented. No model call.
 */
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

/** The turns' owner binding: visitor + conversation, keyed (not the cookie id). */
export const ownerOf = (visitorId, sessionId, salt) => createHmac('sha256', deriveKey(salt, 'chat-turn-owner')).update(`${visitorId}|${sessionId}`).digest('hex').slice(0, 32)

// The cache only holds answers that depend on nothing but the question (D-134).
const CACHEABLE_MODES = new Set(['fact', 'explain', 'compare', 'evaluate', 'interview'])

/**
 * Build the handler. Everything external is injectable for tests:
 * env, store, fetchImpl, embed, index, log, now, quota.
 */
export function createChatHandler(deps = {}) {
    return async function chatHandler(req, res) {
        const started = Date.now()
        const env = deps.env || readEnv()
        const log = deps.log || defaultLog
        const now = deps.now || Date.now
        const send = (event) => res.write(`${JSON.stringify(event)}\n`)
        let releaseLease = async () => {}
        // One absolute deadline for the whole request (stabilization F08), from
        // its first line: validation, identity, MongoDB, admission, history,
        // embedding, generation and logging all share it, and the model gets
        // only what is left minus a reserve for validation, logging and cleanup.
        const deadlineAt = started + (deps.deadlineMs || REQUEST_DEADLINE_MS)
        const remaining = () => deadlineAt - Date.now()
        const stopped = new AbortController()
        let deadline = setTimeout(() => stopped.abort(), Math.max(0, remaining()))
        deadline.unref?.()
        // A client that leaves before admission is never admitted.
        const closed = new AbortController()
        res.on?.('close', () => { if (!res.writableEnded) closed.abort() })

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
            const declared = Number(req.headers['content-length'] || 0)
            if (declared > MAX_BODY_BYTES) return sendError(res, 413, 'TOO_LARGE', 'Request body is too large.')
            let body
            try {
                body = req.body // Vercel's getter throws on invalid JSON
            } catch {
                return sendError(res, 400, 'BAD_JSON', 'Send valid JSON.')
            }
            if (typeof body === 'string') {
                try { body = JSON.parse(body) } catch { return sendError(res, 400, 'BAD_JSON', 'Send valid JSON.') }
            }
            const size = declared || Buffer.byteLength(JSON.stringify(body ?? ''))
            if (size > MAX_BODY_BYTES) return sendError(res, 413, 'TOO_LARGE', 'Request body is too large.')

            const parsed = parseRequest(body)
            if (parsed.error) return sendError(res, ...parsed.error)
            const { sessionId, question, timeZone, op } = parsed.value

            if (!env.enabled && op !== 'status') {
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8')
                res.setHeader('Cache-Control', 'no-store')
                send({ t: 'delta', v: RESTING_REPLY })
                send({ t: 'done', sources: [], followUps: [] })
                return res.end()
            }
            // Production needs one stable secret for cookies, owner bindings and
            // network hashes; a random per-instance key would break all three.
            if (env.production && !saltOk(env.ipSalt)) {
                log('chat.config', { problem: 'CHAT_IP_HASH_SALT missing or too short' })
                return sendError(res, 503, 'UNAVAILABLE', REFUSALS.UNAVAILABLE)
            }

            const store = deps.store || defaultStore(env, log)
            const net = hashIp(clientNetwork(req, { onVercel: env.onVercel }), env.ipSalt)
            // An anonymous, signed, HttpOnly visitor cookie (D-113, D-134).
            // The cookie is only read here; a new id is counted and set by
            // limits.js issueVisitor() once its network allows it (D-136).
            const visitor = visitorFor(req, res, { salt: env.ipSalt, production: env.production, now: now() })

            if (op === 'status') {
                const status = await quotaStatus({ store, visitor, net, production: env.production, now, res })
                if (!status.ok) return sendError(res, status.status, status.code, REFUSALS[status.code], status.retryAt ? { retryAt: status.retryAt } : {})
                res.setHeader('Cache-Control', 'no-store')
                return res.status(200).json({ success: true, quota: status.quota })
            }

            // ── Admission: abuse counter, lease, visitor and network limits ──
            const leaseId = randomUUID()
            if (closed.signal.aborted) { clearTimeout(deadline); return undefined }
            const admission = await admit({ store, visitor, net, production: env.production, leaseId, now, res })
            if (!admission.ok) {
                log('chat.refused', { code: admission.code, scope: admission.scope })
                return sendError(res, admission.status, admission.code, REFUSALS[admission.code], { retryAt: admission.retryAt, scope: admission.scope })
            }
            releaseLease = admission.release
            const { quota } = admission

            res.statusCode = 200
            res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8')
            res.setHeader('Cache-Control', 'no-store')
            res.setHeader('X-Content-Type-Options', 'nosniff')
            res.setHeader('X-Robots-Tag', 'noindex')
            res.setHeader('X-Accel-Buffering', 'no')

            const generationSignal = AbortSignal.any ? AbortSignal.any([closed.signal, stopped.signal]) : closed.signal

            const quotaManager = deps.quota || createQuota({ store, now, log, production: env.production })
            const skipped = []
            const onSkip = (name, reason) => skipped.push(`${name}: ${reason}`.slice(0, 160))
            const providerCalls = []

            // ── The conversation so far, as the server stored it (owner-bound) ──
            const owner = ownerOf(visitor.id, sessionId, env.ipSalt)
            const turns = await store.recentTurns(sessionId, HISTORY_READ, owner)
            const index = deps.index || loadIndex()
            let route = analyse({ question, turns, index, now: now() })
            const priorQuestions = [...turns].sort((a, b) => a.at - b.at).map((t) => t.q)

            // The turn as it will be logged (Admin Portal fields first, D-101/D-113).
            let intent = route.intent || 'question'
            let answer = ''
            let provider = 'canned'
            let retrieval = 'none'
            let chunkIds = []
            let matched = false
            let cached = false
            let cut = false
            let interruption = ''
            let follow = []
            let sources = []
            let citations = {}
            let flags = []
            let entities = route.entities || []
            let mentioned = []
            let pending = null
            let clarify = null
            let generatedFrom = 0 // where a model's text starts (after a composite's computed parts)
            let fallback = false
            let answerSource = route.op
            let faq = null
            let plan = null

            const say = (text) => {
                answer += text
                send({ t: 'delta', v: text })
            }
            // Counted once per message, whatever model calls follow (embedding, generation).
            let gatePromise = null
            const modelGate = () => {
                gatePromise = gatePromise || admitModel({ store, net, flagged: admission.flagged, production: env.production, t: now() }).then((gate) => {
                    if (!gate.ok) onSkip('network', gate.reason)
                    return gate.ok
                })
                return gatePromise
            }
            // One model pass: streamed to the visitor, or collected when `emit` is false.
            const modelPass = async ({ messages, chunks, mode, fallbackText, emit }) => {
                const allowed = await modelGate()
                const stream = generateAnswer({
                    messages, chunks, matched: true, keys: env, fetchImpl: deps.fetchImpl, quota: quotaManager,
                    // Too little time left to generate safely: answer without a model.
                    order: allowed && remaining() > MIN_GENERATION_MS ? providerOrderFor(mode, activeProviders(env)) : [], onSkip,
                    firstTokenMs: Math.min(deps.firstTokenMs || PROVIDER_TIMEOUT_MS, Math.max(1000, remaining() - CLEANUP_RESERVE_MS)), idleMs: deps.idleMs,
                    signal: generationSignal, maxTokens: OUTPUT_TOKENS[mode] || OUTPUT_TOKENS.fact,
                    fallback: fallbackText, onCall: (name) => providerCalls.push(name),
                })
                let text = ''
                let cutHere = false
                let reason = ''
                let from = 'template'
                for await (const part of stream) {
                    if (typeof part === 'object') {
                        if (part.provider) from = part.provider
                        if (part.cut) { cutHere = true; reason = part.reason || 'interrupted' }
                        continue
                    }
                    text += part
                    if (emit) say(part)
                }
                return { text, from, cut: cutHere, reason }
            }
            /**
             * A model answer, or the fallback text when no provider can answer.
             * With `verify` (judgement-heavy answers, stabilization F11) the answer
             * is collected and checked before it is shown; if the check finds
             * claims its sources don't support, one repair pass is asked for,
             * and the version with fewer problems is shown. Never more than two
             * passes; a final answer that still has problems carries the
             * unverified note and is never cached.
             */
            const generate = async ({ messages, chunks, mode, fallbackText, verify = null }) => {
                let pass = await modelPass({ messages, chunks, mode, fallbackText, emit: !verify })
                if (verify && pass.from !== 'template' && !pass.cut && !generationSignal.aborted) {
                    const problems = verify(pass.text)
                    if (problems.length && remaining() > MIN_GENERATION_MS * 2) {
                        const review = `\n\n<review note="your previous draft, for correction only">The draft stated things its sources do not support: ${problems.slice(0, 5).map((p) => `“${p.text}”`).join('; ')}. Write the answer again without those claims, and do not add new ones.</review>`
                        const again = await modelPass({
                            messages: [messages[0], { ...messages[1], content: `${messages[1].content}${review}` }], chunks, mode, fallbackText: pass.text, emit: false,
                        })
                        if (again.from !== 'template' && !again.cut && verify(again.text).length < problems.length) pass = again
                        flags.push({ type: 'repair-attempted', text: problems[0].text.slice(0, 160) })
                    }
                    say(pass.text)
                } else if (verify) {
                    say(pass.text)
                }
                provider = pass.from
                if (pass.cut) { cut = true; interruption = pass.reason }
                if (provider === 'template') fallback = true
                return pass.text
            }

            // Several tasks in one message (D-136): the parts answered in code
            // come first; the parts that need a model were merged into one
            // answer, which then runs through the normal path below (uncached).
            if (route.op === 'composite') {
                const sections = []
                for (const part of route.fixed) {
                    if (part.op === 'contact') sections.push(contactReply(index.profiles || [], part.platform))
                    else if (part.op === 'structured') {
                        const result = runQuery(index.records, part.query)
                        if (result) { sections.push(describeResult(result, route.language)); entities = [...entities, ...(result.entities || [])] }
                    } else if (part.op === 'recall') {
                        const data = await loadRecall(part.convo, { store, sessionId, owner, recent: turns })
                        sections.push(recallAnswer(part.convo, data, { nameOf: (g) => nameOf(index, g), lang: route.language }).text)
                    } else if (part.op === 'summary-plain') {
                        const { turns: chosen, total } = await loadSummary({ store, sessionId, owner, today: part.convo.today, timeZone, now: now() })
                        const note = coverageNote({ covered: Math.min(chosen.length, 60), total: Math.max(total, chosen.length), today: part.convo.today, lang: route.language })
                        sections.push(`${plainSummary(chosen, { today: part.convo.today, lang: route.language })}\n\n${note}`)
                    } else if (part.op === 'clarify') {
                        sections.push(part.reply)
                        clarify = { choices: part.choices }
                        pending = part.pending
                    } else if (part.reply) sections.push(part.reply)
                }
                say(sections.join('\n\n'))
                answerSource = 'composite'
                provider = 'template'
                if (route.generative) {
                    say('\n\n')
                    route = { ...route.generative, composite: true }
                    generatedFrom = answer.length
                    if (route.op === 'answer') entities = [...new Set([...entities, ...(route.entities || [])])]
                } else {
                    route = { ...route, op: 'composite-done' }
                }
            }

            if (route.op === 'composite-done') {
                // answered above, in code
            } else if (route.op === 'reply') {
                // Small talk or unsafe input: a fixed reply, no model call.
                follow = route.followUps || []
                say(route.reply)
            } else if (route.op === 'contact') {
                // Profiles and how to reach him, from the site's own list (D-110).
                say(contactReply(index.profiles || [], route.platform))
                sources = [{ title: 'Contact', url: '/contact', type: 'about' }]
                follow = CONTACT_FOLLOW_UPS
            } else if (route.op === 'recall') {
                // Exact, from this visitor's own stored turns of this conversation,
                // read for this request (the earliest one, the n-th back…); no model.
                const data = await loadRecall(route.convo, { store, sessionId, owner, recent: turns })
                const result = recallAnswer(route.convo, data, { nameOf: (g) => nameOf(index, g), lang: route.language })
                say(result.text)
                entities = result.entities
                follow = starterFollowUps(priorQuestions, priorQuestions.length)
            } else if (route.op === 'summary') {
                // The whole conversation (or today's), read in bounded pages and
                // compacted; the coverage line is written here, not by the model.
                const { turns: chosen, total } = await loadSummary({ store, sessionId, owner, today: route.convo.today, timeZone, now: now() })
                const compact = compactHistory(chosen)
                const note = coverageNote({ covered: compact.covered, total: Math.max(total, chosen.length), dropped: compact.dropped, today: route.convo.today, lang: route.language })
                const plain = plainSummary(chosen, { today: route.convo.today, lang: route.language })
                if (chosen.length < 2) {
                    say(chosen.length ? `${plain}\n\n${note}` : plain)
                } else {
                    answerSource = 'summary'
                    const messages = buildMessages({
                        question,
                        task: taskText({ mode: 'summary', language: route.language }),
                        conversation: compact.conversation,
                    })
                    await generate({ messages, chunks: [], mode: 'summary', fallbackText: `${NO_MODEL_PREFIX}\n\n${plain}` })
                    say(`\n\n${note}`)
                }
                entities = [...new Set(chosen.flatMap((t) => t.entities || []))].slice(0, 8)
            } else if (route.op === 'transform') {
                const previous = route.previous
                if (!previous) {
                    say("There's no earlier answer in this conversation to rework yet. Ask a question first, and then I can shorten, simplify, translate or expand it.")
                } else {
                    // The previous answer and its own evidence; no fresh search (D-134).
                    entities = previous.entities || []
                    let chunks = (previous.chunkIds || []).map((id) => chunkById(index, id)).filter(Boolean).slice(0, 6)
                    // "More detail" may need the rest of the same project's records.
                    if (route.transform === 'more' && entities.length) {
                        const extra = entityEvidence(index, entities.slice(0, 2), null, { per: 4, maxChars: 4000 }).chunks
                        chunks = [...chunks, ...extra.filter((c) => !chunks.some((x) => x.id === c.id))].slice(0, 8)
                    }
                    chunkIds = chunks.map((c) => c.id)
                    const messages = buildMessages({
                        chunks,
                        question,
                        task: taskText({ mode: 'transform', transform: route.transform, language: route.language }),
                        previous,
                    })
                    await generate({ messages, chunks, mode: 'transform', fallbackText: UNAVAILABLE_REPLY })
                    sources = sourcesOf(chunks).slice(0, MAX_SOURCES)
                }
            } else if (route.op === 'clarify') {
                // Ask, and keep the original question for the reply (D-134).
                say(route.reply)
                clarify = { choices: route.choices }
                pending = route.pending
                follow = route.choices.slice(0, 4)
            } else if (route.op === 'structured') {
                // Computed in code from the structured records; never estimated.
                // Described in code in the visitor's language too (D-136): the same
                // result gives the same facts in English, Hindi and Hinglish, with
                // no model rewording that could turn "listed" into "built".
                const result = runQuery(index.records, route.query)
                answerSource = 'structured'
                provider = 'template'
                say(result ? describeResult(result, route.language) : UNAVAILABLE_REPLY)
                const items = (result?.items || []).filter((r) => r.url)
                sources = sourcesOf(items.slice(0, MAX_SOURCES).map((r) => ({ url: r.url, title: r.name || r.title, type: r.group ? 'project' : 'about' })))
                entities = result?.entities || []
                matched = true
            } else {
                // ── An answer: evidence first, then the model ──
                const mode = route.mode
                const asked = correctQuestion(index, aboutGaurav(route.searchText))
                const fixes = spellingFixes(index, route.searchText)
                const standalone = !route.composite && route.how !== 'memory' && route.how !== 'clarified' && !isFollowUpOf(route, turns)
                const cacheKey = standalone && CACHEABLE_MODES.has(mode) && !route.facets.length
                    ? `v${CACHE_SCHEMA}:${index.version}:p${ANSWER_POLICY}:${route.language}:${mode}:${normaliseQuestion(asked)}`
                    : null
                const hit = cacheKey ? await store.getCache(cacheKey) : null
                if (hit && !hit.unverified) {
                    cached = true
                    provider = hit.provider
                    retrieval = 'cache'
                    matched = true
                    follow = hit.followUps || []
                    sources = hit.sources || []
                    citations = hit.citations || {}
                    entities = hit.entities || entities
                    chunkIds = hit.chunkIds || []
                    say(hit.answer)
                } else {
                    // The network's model admission comes before the embedding too (D-134).
                    const modelOk = await modelGate()
                    let vector = null
                    if (modelOk && index.hasVectors && env.geminiKey) {
                        const ticket = await quotaManager.reserve('embed', { generation: false })
                        if (ticket.ok) {
                            providerCalls.push('embed')
                            vector = remaining() > MIN_GENERATION_MS
                                ? await (deps.embed || embedQuery)(asked, { key: env.geminiKey, fetchImpl: deps.fetchImpl, timeoutMs: Math.min(EMBED_TIMEOUT_MS, remaining() - MIN_GENERATION_MS) })
                                : null
                            if (!vector) onSkip('embed', 'no vector (error or timeout)')
                        } else onSkip('embed', `quota: ${ticket.reason}`)
                    }
                    let ranked = rank(index, asked, vector)
                    retrieval = ranked.mode
                    let top
                    if (mode === 'evaluate' || mode === 'interview') {
                        // Always the profile, hiring summary, growth areas and evidence limits.
                        // The role summaries the question names come out of the same budget.
                        const roles = withOverviews(index, { ...ranked, top: [] }, asked, 3).top
                            .filter((c) => String(c.id).startsWith('hire:') && c.id !== 'hire:overall').slice(0, 2)
                        const rolesChars = roles.reduce((sum, c) => sum + Math.min(c.text.length, c.contextChars || 1000), 0)
                        const base = evaluationEvidence(index, ranked, { interview: mode === 'interview', resume: /\b(resume|résumé|cv)\b/i.test(asked), maxChars: Math.max(4500, 9500 - rolesChars) })
                        top = [...base.slice(0, 1), ...roles.filter((c) => !base.some((t) => t.id === c.id)), ...base.slice(1)]
                        if (entities.length) top = [...entityEvidence(index, entities, ranked, { per: 2, maxChars: 3000 }).chunks, ...top]
                        matched = true
                    } else if (entities.length) {
                        // The owner's own answer when the question is that FAQ (one named project).
                        if (entities.length === 1 && route.how === 'named') faq = faqDecision(index, asked, vector)
                        // Named or resolved projects get their own evidence, every one of them.
                        const { chunks } = entityEvidence(index, entities, ranked, { per: mode === 'compare' ? 3 : 4, maxChars: mode === 'compare' ? 7600 : 5000 })
                        const others = ranked.top.filter((c) => !chunks.some((x) => x.id === c.id)
                            && !(c.type === 'project' && c.group && !entities.includes(c.group))).slice(0, 2)
                        top = [...chunks, ...others]
                        matched = true
                    } else {
                        plan = planQuestion(asked, new Set(orderedGroups(index, asked)))
                        faq = faqDecision(index, asked, vector, { multi: plan.complex || route.facets.length > 0 })
                        if (faq.match) ranked = withFaq(ranked, faq.match)
                        if (plan.complex && ranked.matched) ranked = { ...ranked, top: gatherEvidence(index, plan, ranked) }
                        if (ranked.matched && faq.decision !== 'direct') ranked = withOverviews(index, ranked, asked, plan.complex ? COMPLEX_MAX_CHUNKS : TOP_K)
                        if (plan.complex) ranked = { ...ranked, top: fitBudget(ranked.top) }
                        // "The hackathon before TechX26" (or "before that" after one): the
                        // date comparison is done here, from the entry the question names
                        // or the one the previous answer was about.
                        const journeyGroup = [...namedGroups(index, asked)].find((g) => g.startsWith('journey:'))
                        const journey = index.chunks.filter((c) => c.type === 'journey')
                        const previousTurn = isFollowUpOf(route, turns) ? [...turns].sort((a, b) => b.at - a.at)[0] : null
                        const topic = journeyGroup ? journey.find((c) => c.group === journeyGroup)
                            : previousTurn ? mentionedChunks(journey, previousTurn.a || '')[0] || mentionedChunks(journey, previousTurn.q || '')[0] : null
                        const resolved = topic ? resolveRelative(index, topic, asked) : null
                        if (resolved?.chunk) ranked = { ...ranked, top: [{ ...resolved.chunk, score: ranked.top[0]?.score || 1 }, ...ranked.top.filter((c) => c.id !== resolved.chunk.id)].slice(0, TOP_K) }
                        top = ranked.top
                        matched = ranked.matched
                        route.resolvedNote = resolved?.note || ''
                    }
                    // A pay or private-life part still gets its answer: the policy note is in <task>.
                    if (!matched && route.facets.length) matched = true
                    chunkIds = top.map((c) => c.id || c.url)
                    follow = suggest({ index, ranked: { ...ranked, top }, asked: [...priorQuestions, question] })
                    const best = top[0]?.score || 0
                    sources = sourcesOf(top.filter((c) => (c.score || 0) >= best * SOURCE_RELATIVE)).slice(0, MAX_SOURCES)

                    if (!matched) {
                        // Nothing Gaurav has shared matches: a friendly fixed reply
                        // with questions that do work, not a dead end (D-110).
                        const noise = route.written === 'en' && looksLikeNoise(index, asked)
                        intent = noise ? 'gibberish' : 'nomatch'
                        const canned = cannedReply(intent, turns.filter((t) => t.intent === intent).length, priorQuestions)
                        provider = 'canned'
                        sources = []
                        follow = canned.followUps
                        say(canned.reply)
                    } else if (faq?.decision === 'direct' && route.language === 'en') {
                        provider = 'faq'
                        say(faq.match.chunk.faq.answer)
                        sources = sourcesOf([faq.match.chunk, ...mentionedChunks(index.chunks, answer)]).slice(0, MAX_SOURCES)
                    } else {
                        const conversation = route.how === 'memory' || route.how === 'clarified' || isFollowUpOf(route, turns) ? workingMemory(turns, now()) : []
                        const names = route.entityNames || []
                        const messages = buildMessages({
                            chunks: top,
                            question: route.asked,
                            task: taskText({ mode, language: route.language, entities: names, facets: route.facets, list: route.list }),
                            conversation,
                            resolved: [route.how === 'memory' && names.length ? `The question refers to: ${names.join(', ')}.` : '', route.resolvedNote || ''].filter(Boolean).join(' '),
                            spelling: [...fixes].map(([from, to]) => `${from} → ${to}`),
                        })
                        // Without a model: what the records can say plainly, else an honest note.
                        const fallbackText = mode === 'compare' && entities.length >= 2 && comparisonTable(index, entities)
                            ? `${NO_MODEL_PREFIX}\n\n${comparisonTable(index, entities)}`
                            : entities.length === 1 && projectSummary(index, entities[0])
                                ? `${NO_MODEL_PREFIX}\n\n${projectSummary(index, entities[0])}`
                                : top[0]?.faq && top[0]?.faqScore && route.language === 'en'
                                    ? `The closest question Gaurav has answered is “${top[0].faq.question}”\n\n${top[0].faq.answer}`
                                    // A journey entry or service the question names: its own record.
                                    : namedRecord(index, asked, top)
                                        ? `${NO_MODEL_PREFIX}\n\n${namedRecord(index, asked, top)}`
                                        : UNAVAILABLE_REPLY
                        // Judgement-heavy answers are checked before they are shown (F11).
                        const verify = HEAVY_MODES.has(mode) ? (text) => validateCitations(text, top, index.names || []).flags : null
                        await generate({ messages, chunks: top, mode, fallbackText, verify })
                    }

                    const declined = !['canned', 'template', 'faq'].includes(provider) && isDecline(answer.slice(generatedFrom))
                    if (declined) intent = 'declined'
                    if (declined || (provider === 'template' && fallback && answer === UNAVAILABLE_REPLY)) {
                        // No sources (they'd point at unrelated pages), but still
                        // questions that work, so a decline is never a dead end.
                        sources = []
                        follow = cannedReply('nomatch', 0, [...priorQuestions, question]).followUps
                    } else if (['groq', 'gemini'].includes(provider)) {
                        // Citations (D-113): the sources the answer cites, checked
                        // against what they say. Without citations, link what the
                        // answer names (pages and projects), else the best match.
                        const check = validateCitations(answer.slice(generatedFrom), top, index.names || [])
                        citations = citationMap(check.valid)
                        flags = [...flags, ...check.flags]
                        if (check.cited.length) {
                            sources = sourcesOf(check.cited).slice(0, MAX_SOURCES)
                        } else {
                            const mentioned = [...mentionedChunks(index.chunks, answer.slice(generatedFrom)), ...mentionedPages(index, answer.slice(generatedFrom))]
                            sources = mentioned.length ? sourcesOf(mentioned).slice(0, MAX_SOURCES) : sources.slice(0, 1)
                        }
                    }
                    // Projects this answer was about, for "both", "the first one"… later.
                    // Projects the answer names (a list, a ranking): usable for "the first one" or
                    // "compare both" later, but never as "it" (only the question's own entities are).
                    if (['groq', 'gemini', 'faq'].includes(provider)) mentioned = orderedGroups(index, answer.slice(generatedFrom)).filter((g) => !entities.includes(g)).slice(0, 6)
                    // Only verified, complete, context-free model answers are shared (D-134).
                    const cacheable = cacheKey && matched && !declined && ['groq', 'gemini'].includes(provider) && !cut && !fallback
                        && !generationSignal.aborted && flags.length === 0 && answer.trim().length > 0
                    if (cacheable) {
                        await store.setCache(cacheKey, { answer, provider, sources, followUps: follow, citations, entities, chunkIds })
                    }
                }
            }

            const complete = !cut && !generationSignal.aborted && !fallback
            const unverified = flags.filter((f) => !['replaced-by-computed', 'repair-attempted'].includes(f.type)).length
            if (!closed.signal.aborted) {
                send({
                    t: 'done', sources, followUps: follow, quota, citations,
                    ...(unverified ? { unverified } : {}),
                    ...(cut ? { cut: true, interrupted: interruption || 'interrupted' } : {}),
                    ...(clarify ? { clarify } : {}),
                })
            }

            // Logged before the response ends: on Vercel, work after res.end()
            // may never run. The visitor already has the `done` event.
            const latencyMs = Date.now() - started
            await store.logTurn({
                _id: randomUUID(),
                sessionId,
                // Not the cookie id: a keyed hash of visitor + conversation binds
                // the turns to this visitor without linking their conversations.
                owner,
                question,
                answer,
                intent,
                chunkIds,
                retrieval,
                matched,
                provider,
                cached,
                latencyMs,
                aborted: closed.signal.aborted,
                ipHash: net,
                corpusVersion: index.version,
                createdAt: new Date(now()),
                // D-134 additions (backward compatible; the Admin reads the fields above).
                operation: route.op,
                mode: route.mode || null,
                language: route.language,
                entities: entities.slice(0, 8),
                mentioned,
                complete,
                cut,
                fallback,
                clarification: Boolean(clarify),
                ...(pending ? { pending } : {}),
                answerSource,
                validation: flags.length ? flags.map((f) => f.type).slice(0, 8) : [],
                providerCalls,
            })
            log('chat.turn', {
                op: route.op, mode: route.mode, intent, reason: route.reason, provider, retrieval, matched, cached, cut, fallback, latencyMs, skipped,
                language: route.language, entities: entities.length, how: route.how,
                plan: plan ? { complex: plan.complex, entities: plan.entities.length, parts: plan.parts.length } : null,
                faq: faq?.match ? { decision: faq.decision, why: faq.why, id: faq.match.chunk.id, score: Number(faq.match.score.toFixed(3)) } : null,
                chunks: chunkIds.slice(0, 8), citations: Object.keys(citations).length, flags: flags.map((f) => f.type),
                calls: providerCalls, emergency: quotaManager.state.emergency, newVisitor: visitor.isNew, flagged: admission.flagged, salted: saltOk(env.ipSalt),
            })
            clearTimeout(deadline)
            await releaseLease()
            res.end()
        } catch (error) {
            clearTimeout(deadline)
            log('chat.error', { error: String(error?.message || error).slice(0, 200) })
            await releaseLease()
            if (!res.headersSent) return sendError(res, 500, 'CHAT_ERROR', 'The assistant hit a problem. Please try again.')
            try {
                send({ t: 'done', sources: [], followUps: [], cut: true, interrupted: 'error' })
                res.end()
            } catch { /* connection already gone */ }
        }
        return undefined
    }
}

// Long, judgement-heavy answers (D-134): in the live check the configured Groq
// model added unsupported claims to critiques ("five public projects…") while
// Gemini kept to the evidence, and these prompts are the largest, which Groq's
// 7K tokens-per-minute budget fits worst. They try Gemini first; Groq remains
// the fallback, and the order is only ever among the configured free providers.
const HEAVY_MODES = new Set(['compare', 'evaluate', 'interview', 'summary'])
export function providerOrderFor(mode, order) {
    if (!HEAVY_MODES.has(mode) || !order.includes('gemini')) return order
    return ['gemini', ...order.filter((name) => name !== 'gemini')]
}

/** The plain record of a journey entry or service the question names (no-model fallback). */
function namedRecord(index, asked, top) {
    const groups = namedGroups(index, asked)
    const chunk = top.find((c) => ['journey', 'service'].includes(c.type) && groups.has(c.group))
        || index.chunks.find((c) => ['journey', 'service'].includes(c.type) && groups.has(c.group))
    if (!chunk) return ''
    return `**${chunk.title.split(/[:(]/)[0].trim()}**: ${chunk.summary || ''}${chunk.url ? ` (${chunk.url})` : ''}`
}

/** A short or pronoun-led question that leans on the previous turn. */
function isFollowUpOf(route, turns) {
    if (!turns.length) return false
    if (route.how === 'memory' || route.how === 'clarified') return true
    return !(route.entities || []).length && isFollowUp(route.asked || '') && String(route.asked || '').split(/\s+/).length <= 8
}

export default createChatHandler()

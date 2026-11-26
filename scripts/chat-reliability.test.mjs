// Chat reliability (D-113): `node --test scripts/chat-reliability.test.mjs`
// (part of `npm run test:chat`). No network: providers are mocked, MongoDB is
// a small in-process fake with the same atomic semantics as the operations the
// store uses ($inc upserts, unique _id, $max, TTL-style expiry).

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { join } from 'node:path'
import { buildCorpus, corpusVersion, faqKeysOf, loadSiteData } from '../lib/chat/corpus.js'
import { prepareIndex, faqDecision, questionType } from '../lib/chat/retrieve.js'
import { createChatHandler } from '../lib/chat/handler.js'
import { createMemoryStore, createStore } from '../lib/chat/store.js'
import { activeProviders, createQuota, estimateTokens, retryHintMs } from '../lib/chat/quota.js'
import {
    parseProviderOrder, EMERGENCY_AI_PER_MINUTE, GEN_STARTS_PER_10S, NEWCOMER_AI_LIMIT, NEW_VISITORS_PER_IP_HOUR, STATUS_PER_VISITOR_MINUTE, VISITOR_COOKIE,
    VISITOR_DAILY_LIMIT, VISITOR_PER_MINUTE,
} from '../lib/chat/config.js'
import { parseInline } from '../src/components/chat/answerFormat.js'
import { HIRING } from '../lib/chat/retrieve.js'
import { signVisitor, signVisitorV1, verifyVisitor, visitorFor } from '../lib/chat/visitor.js'
import { validateCitations } from '../lib/chat/cite.js'
import { validateKnowledgeBase } from '../lib/chat/knowledge.js'

const ROOT = new URL('../', import.meta.url)
const data = await loadSiteData()
const corpus = buildCorpus(data)
const index = prepareIndex({ version: 'v1', chunks: corpus.chunks, aliases: corpus.aliases, faqKeys: faqKeysOf(corpus.chunks), profiles: corpus.profiles, records: corpus.records })
const ORIGIN = 'https://ggauravky.vercel.app'
const SESSION = '3f2b8c1e-5a4d-4e6f-9b7a-1c2d3e4f5a6b'
const enc = new TextEncoder()

// ── helpers ───────────────────────────────────────────────────────────────

const sse = (lines, { status = 200, headers = {}, delayMs = 0 } = {}) => new Response(new ReadableStream({
    async start(controller) {
        for (const line of lines) {
            if (delayMs) await new Promise((r) => setTimeout(r, delayMs))
            controller.enqueue(enc.encode(`data: ${typeof line === 'string' ? line : JSON.stringify(line)}\n\n`))
        }
        controller.close()
    },
}), { status, headers })
const groqText = (...texts) => [...texts.map((t) => ({ choices: [{ delta: { content: t } }] })), { choices: [{ delta: {} }], x_groq: { usage: { total_tokens: 900 } } }, '[DONE]']
const geminiText = (...texts) => texts.map((t) => ({ candidates: [{ content: { parts: [{ text: t }] } }], usageMetadata: { totalTokenCount: 800 } }))

function mockFetch(routes) {
    const calls = []
    const impl = async (url, init) => {
        const name = String(url).includes('groq') ? 'groq' : String(url).includes('embedContent') ? 'embed' : 'gemini'
        calls.push(name)
        const route = routes[name]
        if (!route) throw new Error(`unexpected ${name} call`)
        return route(init)
    }
    impl.calls = calls
    return impl
}

function fakeRes() {
    const res = { headers: {}, statusCode: 0, chunks: [], headersSent: false, writableEnded: false }
    res.setHeader = (k, v) => { res.headers[k.toLowerCase()] = v }
    res.status = (c) => { res.statusCode = c; return res }
    res.json = (b) => { res.body = b; res.headersSent = true; res.writableEnded = true; return res }
    res.write = (s) => { res.headersSent = true; res.chunks.push(s); return true }
    res.end = () => { res.writableEnded = true; return res }
    res.on = () => {}
    res.events = () => res.chunks.join('').split('\n').filter(Boolean).map((line) => JSON.parse(line))
    res.text = () => res.events().filter((e) => e.t === 'delta').map((e) => e.v).join('')
    return res
}

const request = (question, { cookie = '', ip = '203.0.113.7', session = SESSION } = {}) => ({
    method: 'POST',
    body: { sessionId: session, question },
    headers: { origin: ORIGIN, 'content-type': 'application/json', 'x-vercel-forwarded-for': ip, ...(cookie ? { cookie } : {}) },
    socket: {},
})

const SALT = 'reliability-salt-0123456789abcdef'
const env = (extra = {}) => ({
    enabled: true, groqKey: 'g', geminiKey: 'm', mongoUri: '', ipSalt: SALT, origins: [ORIGIN], production: true, onVercel: true, providerOrder: ['groq', 'gemini'], ...extra,
})

// An established visitor by default (issued two hours ago): young ids are tested on purpose.
const cookieFor = (id, issuedMs = Date.now() - 2 * 60 * 60 * 1000) => `${VISITOR_COOKIE}=${signVisitor(id, SALT, issuedMs)}`
const ids = (n) => Array.from({ length: n }, (_, i) => i.toString(16).padStart(32, 'a'))

function makeHandler({ store = createMemoryStore(), fetchImpl, now, extraEnv, log = () => {} } = {}) {
    const handler = createChatHandler({
        env: env(extraEnv), store, fetchImpl, index, log, now,
        embed: async () => null, firstTokenMs: 200, idleMs: 200,
    })
    return { handler, store, fetchImpl }
}

const ask = async (handler, question, options) => {
    const res = fakeRes()
    await handler(request(question, options), res)
    return res
}

// ── A fake MongoDB with the store's operations ────────────────────────────

function fakeMongo({ now = () => Date.now() } = {}) {
    const collections = new Map()
    const dup = () => Object.assign(new Error('E11000 duplicate key'), { code: 11000 })
    const coll = (name) => {
        if (!collections.has(name)) collections.set(name, new Map())
        const docs = collections.get(name)
        const idOf = (f) => (f._id !== undefined ? f._id : `${f.key}|${f.windowStart}`)
        const matches = (doc, filter) => Object.entries(filter).every(([k, v]) => (v && typeof v === 'object' && '$lte' in v
            ? doc[k] <= v.$lte : v && typeof v === 'object' && '$lt' in v ? (doc[k] || 0) < v.$lt : doc[k] === v))
        return {
            collectionName: name,
            async createIndex() {},
            // Same semantics as MongoDB's: a non-matching existing document makes
            // the upsert insert a second one with the same unique key → E11000.
            async findOneAndUpdate(filter, update) {
                const id = idOf(filter)
                const existing = docs.get(id)
                if (existing && !matches(existing, filter)) throw dup()
                const equality = Object.fromEntries(Object.entries(filter).filter(([, v]) => !v || typeof v !== 'object'))
                const doc = existing || { ...equality, ...(update.$setOnInsert || {}) }
                if (Array.isArray(update)) {
                    const amount = update[0].$set.count.$max[1].$add[1]
                    doc.count = Math.max(0, (doc.count || 0) + amount)
                    doc.expireAt = doc.expireAt || update[0].$set.expireAt.$ifNull[1]
                }
                for (const [k, v] of Object.entries(update.$inc || {})) doc[k] = (doc[k] || 0) + v
                docs.set(id, doc)
                return { ...doc }
            },
            async updateOne(filter, update, options = {}) {
                const id = filter._id
                const doc = docs.get(id)
                if (doc && !matches(doc, filter)) {
                    if (options.upsert && filter.expireAt) throw dup()
                    return
                }
                const next = doc || { _id: id }
                Object.assign(next, update.$set || {})
                for (const [k, v] of Object.entries(update.$max || {})) next[k] = !next[k] || v > next[k] ? v : next[k]
                if (doc || options.upsert) docs.set(id, next)
            },
            async findOne(filter) {
                const doc = docs.get(idOf(filter))
                return doc ? { ...doc } : null
            },
            async deleteOne(filter) {
                const doc = docs.get(filter._id)
                if (doc && matches(doc, filter)) docs.delete(filter._id)
            },
            async insertOne(doc) { docs.set(doc._id, doc) },
            find(filter) {
                let list = [...docs.values()].filter((d) => matches(d, filter))
                const cursor = {
                    sort: () => { list = list.sort((a, b) => b.createdAt - a.createdAt); return cursor },
                    limit: (n) => { list = list.slice(0, n); return cursor },
                    toArray: async () => list,
                }
                return cursor
            },
        }
    }
    const db = { collection: coll, command: async () => {} }
    return { db, collections, now }
}

// ── Stage A: limits, visitors, quotas, failures ───────────────────────────

test('visitor cookie: signed with its issue time, tamper-proof, server-expired, v1 migrated', () => {
    const t = Date.now()
    const value = signVisitor('a'.repeat(32), SALT, t)
    assert.equal(verifyVisitor(value, SALT, t).id, 'a'.repeat(32))
    assert.equal(verifyVisitor(value, 'another-salt-0123456789', t), null, 'another key does not verify')
    const [v, , issued, mac] = value.split('.')
    assert.equal(verifyVisitor([v, 'b'.repeat(32), issued, mac].join('.'), SALT, t), null, 'a changed id does not verify')
    assert.equal(verifyVisitor([v, 'a'.repeat(32), String(Number(issued) + 86400 * 20), mac].join('.'), SALT, t), null, 'a changed issue time does not verify')
    assert.equal(verifyVisitor(value, SALT, t + 31 * 86400 * 1000), null, 'expired after 30 days by the server, whatever Max-Age the browser kept')
    assert.equal(verifyVisitor('garbage', SALT), null)
    // A v1 cookie keeps its id (no reset of an active visitor's allowance).
    const old = verifyVisitor(signVisitorV1('c'.repeat(32), SALT), SALT)
    assert.deepEqual([old.id, old.legacy], ['c'.repeat(32), true])
    const res = fakeRes()
    const migrated = visitorFor({ headers: { cookie: `${VISITOR_COOKIE}=${signVisitorV1('c'.repeat(32), SALT)}` } }, res, { salt: SALT, production: true, now: t })
    assert.deepEqual([migrated.id, migrated.isNew, migrated.young], ['c'.repeat(32), false, false])
    assert.match(res.headers['set-cookie'], /^chat_vid=v2\.c{32}\.\d+\.[\w-]+; Path=\/api\/chat; Max-Age=\d+; HttpOnly; SameSite=Strict; Secure$/)
    // A forged cookie is replaced by a fresh server-made id.
    const forged = visitorFor({ headers: { cookie: `${VISITOR_COOKIE}=v2.${'d'.repeat(32)}.${issued}.forged` } }, fakeRes(), { salt: SALT, production: true, now: t })
    assert.equal(forged.isNew, true)
    assert.notEqual(forged.id, 'd'.repeat(32))
})

test('production without a stable secret refuses to serve (no random per-instance keys)', async () => {
    const res = await ask(makeHandler({ extraEnv: { ipSalt: '' } }).handler, 'What is TaskNexus?')
    assert.equal(res.statusCode, 503)
    assert.equal(res.body.error.code, 'UNAVAILABLE')
})

test('shared Wi-Fi: 40 visitors on one network are not limited (fairness)', async () => {
    const fetchImpl = mockFetch({ groq: () => sse(groqText('ok')) })
    const { handler } = makeHandler({ fetchImpl })
    let limited = 0
    for (const id of ids(40)) {
        for (const q of ['What is TaskNexus?', 'Where has Gaurav worked?']) {
            const res = await ask(handler, q, { cookie: cookieFor(id), session: `${id.slice(-8)}-5a4d-4e6f-9b7a-1c2d3e4f5a6b` })
            if (res.statusCode !== 200) limited += 1
        }
    }
    assert.equal(limited, 0, '80 requests from 40 visitors behind one IP all answered (the old per-IP cap of 60 would have blocked)')
})

test('cookie rotation: past the new-visitor cap, first questions share one small bucket', async () => {
    const fetchImpl = mockFetch({ groq: () => sse(groqText('answer')) })
    // An open provider quota, so only the per-network newcomer rules apply.
    const open = { reserve: async () => ({ ok: true, reserved: 0 }), settle: async () => {}, release: async () => {}, cooldown: async () => {}, state: { emergency: false } }
    const handler = createChatHandler({ env: env(), store: createMemoryStore(), fetchImpl, index, log: () => {}, quota: open, embed: async () => null, firstTokenMs: 200, idleMs: 200 })
    // Distinct questions (a repeat would be served from the cache), no cookies kept.
    const total = NEW_VISITORS_PER_IP_HOUR + NEWCOMER_AI_LIMIT + 15
    for (let i = 0; i < total; i += 1) {
        await ask(handler, `How does Kanoon-Mate work under the hood? (${i})`, { session: `${String(i).padStart(8, '0')}-5a4d-4e6f-9b7a-1c2d3e4f5a6b` })
    }
    const calls = fetchImpl.calls.filter((c) => c === 'groq').length
    assert.equal(calls, NEW_VISITORS_PER_IP_HOUR + NEWCOMER_AI_LIMIT, 'after the cap, newcomers share the bucket, then get no model calls')
    // The restriction persists: a young id keeps it on its later requests (not only its first)…
    const young = cookieFor('f'.repeat(32), Date.now() - 10 * 60 * 1000)
    await ask(handler, 'How does InstaX work under the hood? (young)', { cookie: young })
    assert.equal(fetchImpl.calls.filter((c) => c === 'groq').length, calls, 'a young id on the flagged network: still no model call')
    // …while an established visitor on the same network is unaffected (shared Wi-Fi fairness).
    await ask(handler, 'How does InstaX work under the hood? (established)', { cookie: cookieFor('e'.repeat(32)) })
    assert.equal(fetchImpl.calls.filter((c) => c === 'groq').length, calls + 1)
})

test('one request at a time per visitor: a parallel one gets "busy"', async () => {
    const fetchImpl = mockFetch({ groq: () => sse(groqText('slow ', 'answer'), { delayMs: 40 }) })
    const { handler } = makeHandler({ fetchImpl })
    const cookie = cookieFor('c'.repeat(32))
    const [a, b] = await Promise.all([ask(handler, 'How does Kanoon-Mate work under the hood?', { cookie }), ask(handler, 'What is InstaX built with?', { cookie })])
    assert.deepEqual([a.statusCode, b.statusCode].sort(), [200, 429])
    assert.equal([a, b].find((r) => r.statusCode === 429).body.error.code, 'BUSY')
    const again = await ask(handler, 'What is InstaX built with?', { cookie })
    assert.equal(again.statusCode, 200, 'the lease is released after the answer')
    // Another tab with another session id is the same visitor: still one at a time.
    const [c, d] = await Promise.all([
        ask(handler, 'How does Kanoon-Mate work under the hood?', { cookie }),
        ask(handler, 'What is InstaX built with?', { cookie, session: '9f2b8c1e-5a4d-4e6f-9b7a-1c2d3e4f5a6b' }),
    ])
    assert.deepEqual([c.statusCode, d.statusCode].sort(), [200, 429])
})

test('the allowance is the visitor\'s: New Chat, a new session id or another tab never resets it', async () => {
    const { handler, store } = makeHandler({ fetchImpl: mockFetch({}) })
    const id = '8'.repeat(32)
    const statuses = []
    for (let i = 0; i < VISITOR_PER_MINUTE + 3; i += 1) {
        // Every request a "new chat" in another tab: a fresh session id, the same browser.
        const res = await ask(handler, 'hi', { cookie: cookieFor(id), session: `${String(i).padStart(8, '0')}-5a4d-4e6f-9b7a-1c2d3e4f5a6b` })
        statuses.push(res.statusCode)
    }
    assert.deepEqual(statuses, [...Array(VISITOR_PER_MINUTE).fill(200), 429, 429, 429])
    // A refused request adds nothing: the window sits at its cap, so the reset time doesn't move.
    assert.equal((await store.peek(`vm:${id}`, 60 * 1000)).count, VISITOR_PER_MINUTE)
    assert.equal((await store.peek(`vd:${id}`, 24 * 60 * 60 * 1000)).count, VISITOR_PER_MINUTE)
})

test('status: the remaining allowance without spending any, bounded per minute', async () => {
    const { handler } = makeHandler({ fetchImpl: mockFetch({}) })
    const cookie = cookieFor('9'.repeat(32))
    await ask(handler, 'hi', { cookie })
    const check = async () => {
        const res = fakeRes()
        await handler({ ...request('', { cookie }), body: { sessionId: SESSION, op: 'status' } }, res)
        return res
    }
    const first = await check()
    assert.equal(first.statusCode, 200)
    assert.deepEqual([first.body.quota.dayLeft, first.body.quota.left, first.body.quota.shared], [VISITOR_DAILY_LIMIT - 1, VISITOR_PER_MINUTE - 1, true])
    assert.equal((await check()).body.quota.dayLeft, VISITOR_DAILY_LIMIT - 1, 'checking spends nothing')
    let last
    for (let i = 0; i < STATUS_PER_VISITOR_MINUTE; i += 1) last = await check()
    assert.equal(last.statusCode, 429, 'status checks are limited too')
})

test('concurrency: 50 parallel visitors never start more model calls than the site-wide cap', async () => {
    const fetchImpl = mockFetch({ groq: () => sse(groqText('a'), { delayMs: 5 }), gemini: () => sse(geminiText('b'), { delayMs: 5 }) })
    const store = createMemoryStore()
    const handler = createChatHandler({ env: env(), store, fetchImpl, index, log: () => {}, embed: async () => null, firstTokenMs: 500, idleMs: 500 })
    await Promise.all(ids(50).map((id, i) => ask(handler, `How does Kanoon-Mate work under the hood? (${i})`, { cookie: cookieFor(id), ip: `198.51.100.${i}` })))
    const modelCalls = fetchImpl.calls.filter((c) => c !== 'embed').length
    assert.ok(modelCalls <= GEN_STARTS_PER_10S, `${modelCalls} model calls > ${GEN_STARTS_PER_10S}`)
})

test('quota: tokens are reserved, then settled with the reported usage', async () => {
    const store = createMemoryStore()
    const quota = createQuota({ store })
    const t = await quota.reserve('groq', { tokens: 3000 })
    assert.ok(t.ok)
    await quota.settle(t, 900)
    const tpm = await store.count('q:groq:tpm', 60 * 1000, 0)
    assert.equal(tpm.count, 900, 'the estimate is replaced by the real usage')
    await quota.settle(t, 100)
    await quota.release(t)
    assert.equal((await store.count('q:groq:tpm', 60 * 1000, 0)).count, 900, 'a ticket settles once: a second settle or release does nothing')
    assert.equal((await quota.reserve('groq', { tokens: 7000 })).reason, 'tokens per minute')
    assert.equal((await quota.reserve('openai', { tokens: 1 })).ok, false, 'not a free-tier model')
    assert.ok(estimateTokens([{ content: 'x'.repeat(4000) }], 0) === 1000)
    assert.ok(estimateTokens([{ content: 'प्रोजेक्ट'.repeat(100) }], 0) > 500, 'Devanagari is counted denser than Latin text')
})

test('quota: a reservation settles in its own minute and day, even across midnight; never below zero', async () => {
    let t = Date.UTC(2026, 10, 26, 23, 59, 50)
    const store = createMemoryStore({ now: () => t })
    const quota = createQuota({ store, now: () => t })
    const ticket = await quota.reserve('groq', { tokens: 2000 })
    t = Date.UTC(2026, 10, 27, 0, 0, 20) // the answer finished after midnight
    await quota.settle(ticket, 600)
    const at = (ms) => store.count('q:groq:tpd:2026-11-26', 24 * 60 * 60 * 1000, 0, ms)
    assert.equal((await at(Date.UTC(2026, 10, 26, 12))).count, 600, 'the 26th is corrected')
    assert.equal((await store.count('q:groq:tpd:2026-11-27', 24 * 60 * 60 * 1000, 0)).count, 0, 'the 27th is untouched')
    assert.equal((await store.count('q:groq:tpm', 60 * 1000, 0)).count, 0, 'the new minute is untouched (no negative counter)')
    assert.equal((await store.count('q:groq:tpm', 60 * 1000, 0, Date.UTC(2026, 10, 26, 23, 59, 50))).count, 600)
    // A timeout (no usage reported) keeps the whole estimate: tokens may have been spent.
    const timed = await quota.reserve('gemini', { tokens: 1500 })
    await quota.settle(timed, 0)
    assert.equal((await store.count('q:gemini:tpm', 60 * 1000, 0)).count, 1500)
    assert.equal((await store.count('k:neg', 60 * 1000, -5)).count, 0, 'counters never go below zero')
})

test('quota: a 429 sets a shared cooldown from the retry hint', async () => {
    let groq = 0
    const fetchImpl = mockFetch({
        groq: () => { groq += 1; return new Response('{"error":"rate"}', { status: 429, headers: { 'retry-after': '30' } }) },
        gemini: () => sse(geminiText('Gemini answers.')),
    })
    const store = createMemoryStore()
    const handlerA = createChatHandler({ env: env(), store, fetchImpl, index, log: () => {}, embed: async () => null, firstTokenMs: 200, idleMs: 200 })
    const first = await ask(handlerA, 'How does Kanoon-Mate work under the hood?', { cookie: cookieFor('d'.repeat(32)) })
    assert.equal(first.text(), 'Gemini answers.')
    // Another instance (same shared store) skips Groq while it cools down.
    const handlerB = createChatHandler({ env: env(), store, fetchImpl, index, log: () => {}, embed: async () => null, firstTokenMs: 200, idleMs: 200 })
    await ask(handlerB, 'What is InstaX built with?', { cookie: cookieFor('e'.repeat(32)) })
    assert.equal(groq, 1, 'Groq is not called again during the cooldown')
    assert.ok(await store.getUntil('cool:groq') > Date.now() + 25 * 1000)
    assert.equal(retryHintMs({ headers: { 'x-ratelimit-reset-tokens': '1m26.4s' } }), 86400)
    assert.equal(retryHintMs({ detail: '"retryDelay": "17s"' }), 17000)
})

test('providers: malformed or empty stream falls through; a cut answer is flagged', async () => {
    const fetchImpl = mockFetch({ groq: () => sse(['{not json', '[DONE]']), gemini: () => sse(geminiText('From Gemini.')) })
    const { handler } = makeHandler({ fetchImpl })
    assert.equal((await ask(handler, 'How does Kanoon-Mate work under the hood?')).text(), 'From Gemini.')
    const cutting = mockFetch({
        groq: () => new Response(new ReadableStream({
            start(c) { c.enqueue(enc.encode(`data: ${JSON.stringify({ choices: [{ delta: { content: 'Half an ' } }] })}\n\n`)); setTimeout(() => c.error(new Error('reset')), 20) },
        })),
    })
    const cut = await ask(makeHandler({ fetchImpl: cutting }).handler, 'How does Kanoon-Mate work under the hood?')
    assert.equal(cut.text(), 'Half an ')
    assert.deepEqual([cut.events().at(-1).cut, cut.events().at(-1).interrupted], [true, 'interrupted'])
    assert.deepEqual(cutting.calls, ['groq'], 'no switch to another provider mid-answer')
    // The output cap reached: flagged as incomplete too, and never cached.
    // (Usage reported, so the token estimate is corrected; unknown usage keeps the whole estimate.)
    const capped = mockFetch({ groq: () => sse([{ choices: [{ delta: { content: 'Long ' } }] }, { choices: [{ delta: {}, finish_reason: 'length' }], x_groq: { usage: { total_tokens: 900 } } }, '[DONE]']) })
    const made = makeHandler({ fetchImpl: capped })
    const long = await ask(made.handler, 'How does Kanoon-Mate work under the hood?')
    assert.equal(long.events().at(-1).interrupted, 'length')
    assert.equal(made.store.turns.at(-1).complete, false)
    await ask(made.handler, 'How does Kanoon-Mate work under the hood?', { cookie: cookieFor('a1'.repeat(16)) })
    assert.equal(capped.calls.filter((c) => c === 'groq').length, 2, 'an incomplete answer is not served from the cache')
})

test('provider configuration: order, single provider, none, no keys', () => {
    assert.deepEqual(parseProviderOrder(undefined), ['groq', 'gemini'])
    assert.deepEqual(parseProviderOrder('gemini, groq'), ['gemini', 'groq'])
    assert.deepEqual(parseProviderOrder('gemini'), ['gemini'])
    assert.deepEqual(parseProviderOrder('none'), [])
    assert.deepEqual(parseProviderOrder('openai,groq,groq'), ['groq'], 'unknown and repeated names are dropped')
    assert.deepEqual(activeProviders({ providerOrder: ['groq', 'gemini'], groqKey: '', geminiKey: 'm' }), ['gemini'])
    assert.deepEqual(activeProviders({ providerOrder: ['groq', 'gemini'], groqKey: '', geminiKey: '' }), [])
})

test('provider configuration in the handler: no keys or "none" answers without a model', async () => {
    for (const extraEnv of [{ groqKey: '', geminiKey: '' }, { providerOrder: [] }]) {
        const fetchImpl = mockFetch({})
        const res = await ask(makeHandler({ fetchImpl, extraEnv }).handler, 'How does Kanoon-Mate work under the hood?')
        assert.equal(res.events().at(-1).t, 'done')
        assert.deepEqual(fetchImpl.calls, [], JSON.stringify(extraEnv))
    }
    const only = mockFetch({ gemini: () => sse(geminiText('Gemini only.')) })
    const res = await ask(makeHandler({ fetchImpl: only, extraEnv: { providerOrder: ['gemini'] } }).handler, 'How does Kanoon-Mate work under the hood?')
    assert.equal(res.text(), 'Gemini only.')
    assert.deepEqual(only.calls, ['gemini'])
})

test('MongoDB down in production: fail closed, no model call, no instance allowance', async () => {
    const store = createStore({ getDb: async () => { throw new Error('unreachable') } })
    const fetchImpl = mockFetch({ groq: () => sse(groqText('ok')) })
    const handler = createChatHandler({ env: env(), store, fetchImpl, index, log: () => {}, embed: async () => null, firstTokenMs: 200, idleMs: 200 })
    for (let i = 0; i < 5; i += 1) {
        const res = await ask(handler, `How does Kanoon-Mate work under the hood? ${i}`, { cookie: cookieFor(ids(20)[i]) })
        assert.equal(res.statusCode, 503)
        assert.ok(Number(res.headers['retry-after']) >= 1)
    }
    assert.deepEqual(fetchImpl.calls, [])
    // Two instances: neither can spend a global allowance of its own.
    const quota = createQuota({ store, production: true })
    assert.equal((await quota.reserve('groq', { tokens: 10 })).ok, false)
})

test('MongoDB down outside production: emergency mode allows only a few model calls per instance, then recovers', async () => {
    let t = Date.now()
    const now = () => t
    let down = true
    const mongo = fakeMongo({ now })
    const store = createStore({ getDb: async () => { if (down) throw new Error('unreachable'); return mongo.db }, now })
    const fetchImpl = mockFetch({ groq: () => sse(groqText('ok')) })
    const logs = []
    const handler = createChatHandler({ env: env({ production: false }), store, fetchImpl, index, log: (e, d) => logs.push([e, d]), now, embed: async () => null, firstTokenMs: 200, idleMs: 200 })
    for (let i = 0; i < EMERGENCY_AI_PER_MINUTE + 4; i += 1) {
        await ask(handler, `How does Kanoon-Mate work under the hood? ${i}`, { cookie: cookieFor(ids(20)[i]) })
    }
    assert.equal(fetchImpl.calls.length, EMERGENCY_AI_PER_MINUTE, 'only the emergency allowance reached a model')
    assert.ok(logs.some(([e, d]) => e === 'chat.turn' && d.emergency === true))
    // Recovery: Mongo is back after the cooldown; counters are shared again.
    down = false
    t += 2 * 60 * 1000
    const counted = await store.count('probe', 60 * 1000)
    assert.equal(counted.shared, true)
    assert.ok(mongo.collections.get('chat_rate').size > 0)
})

test('MongoDB atomic counters and locks: concurrent increments, held lock, expiry', async () => {
    let t = Date.now()
    const mongo = fakeMongo()
    const store = createStore({ getDb: async () => mongo.db, now: () => t })
    const results = await Promise.all(Array.from({ length: 25 }, () => store.count('k', 60 * 1000)))
    assert.deepEqual(results.map((r) => r.count).sort((a, b) => a - b), Array.from({ length: 25 }, (_, i) => i + 1), 'each increment counted once')
    assert.equal(await store.acquire('lock:x', 1000, 'old'), true)
    assert.equal(await store.acquire('lock:x', 1000, 'other'), false, 'held')
    t += 2000
    assert.equal(await store.acquire('lock:x', 1000, 'new'), true, 'expired lock is taken over')
    // The old request finishes late: it must not release the newer request's lease.
    await store.release('lock:x', 'old')
    assert.equal(await store.acquire('lock:x', 1000, 'third'), false, 'the newer lease survives the old release')
    await store.release('lock:x', 'new')
    assert.equal(await store.acquire('lock:x', 1000, 'third'), true, 'released by its owner: free')
    // Conditional take: 30 concurrent takes on a cap of 10 count exactly 10.
    const takes = await Promise.all(Array.from({ length: 30 }, () => store.take('cap', 60 * 1000, 10)))
    assert.equal(takes.filter((r) => r.ok).length, 10)
    assert.equal((await store.peek('cap', 60 * 1000)).count, 10, 'refused takes add nothing')
})

test('conversation isolation: another visitor with the same session id gets no history', async () => {
    const bodies = []
    const fetchImpl = mockFetch({ groq: (init) => { bodies.push(JSON.parse(init.body)); return sse(groqText('Kanoon-Mate uses OCR.')) } })
    const { handler } = makeHandler({ fetchImpl })
    await ask(handler, 'How does Kanoon-Mate work under the hood?', { cookie: cookieFor('1'.repeat(32)) })
    const other = await ask(handler, 'tell me more', { cookie: cookieFor('2'.repeat(32)) })
    assert.match(other.text(), /^Happy to go deeper/, 'no previous turn: the fixed reply, not the other visitor\'s topic')
    assert.equal(bodies.length, 1)
})

// ── Stage B: FAQ decisions ────────────────────────────────────────────────

test('FAQ decision: direct only for an equivalent question', () => {
    const vec = (v) => Buffer.from(new Float32Array(v).buffer).toString('base64')
    const faqChunk = (id, question, answer) => ({ id, type: 'faq', title: question, url: '/journey', group: 'faq:experience', text: `Question: ${question} Answer: ${answer}`, faq: { question, alternates: [], answer, category: 'experience' } })
    const tiny = prepareIndex({
        chunks: [
            faqChunk('faq:a', 'Where has Gaurav worked?', 'He interned at CodSoft and AshokSoft.'),
            faqChunk('faq:b', 'Is he available for internships or work?', 'Yes, see the Contact page.'),
        ].map((c) => ({ ...c, vec: vec([1, 0, 0]) })),
        faqKeys: [
            { chunkId: 'faq:a', text: 'Where has Gaurav worked?', vec: vec([1, 0, 0]) },
            { chunkId: 'faq:b', text: 'Is he available for internships or work?', vec: vec([0, 1, 0]) },
        ],
    })
    const near = [1, 0, 0]
    assert.equal(faqDecision(tiny, 'Where has Gaurav worked?', near).decision, 'direct')
    const d = (q) => faqDecision(tiny, q, near)
    assert.equal(d('Where is Gaurav working currently?').decision, 'supporting', 'a "now" cue the FAQ does not ask about')
    assert.equal(d('When did Gaurav start working?').decision, 'supporting', 'a different question type')
    assert.equal(d('What are his responsibilities at work?').decision, 'supporting')
    assert.equal(faqDecision(tiny, 'Where has Gaurav worked?', near, { multi: true }).decision, 'supporting', 'one FAQ cannot answer a multi-part question')
    assert.equal(questionType('When did he start?'), 'when')
    assert.equal(questionType('Is he available?'), 'yes-no')
})

// ── Stage C: freshness, citations, integrity ──────────────────────────────

test('freshness: any changed fact changes the index version; the build check passes on the committed index', () => {
    const versionOf = (d) => {
        const c = buildCorpus(d)
        return corpusVersion({ chunks: c.chunks, faqKeys: faqKeysOf(c.chunks), aliases: c.aliases, profiles: c.profiles })
    }
    const base = versionOf(data)
    const kb = structuredClone(data.kb)
    const variants = {
        'a project fact': { ...data, projects: [{ ...data.projects[0], description: 'changed' }, ...data.projects.slice(1)] },
        'a service price': { ...data, services: [{ ...data.services[0], priceLabel: 'INR 1' }, ...data.services.slice(1)] },
        'an FAQ answer': { ...data, kb: { ...kb, faq: [{ ...kb.faq[0], answer: 'changed' }, ...kb.faq.slice(1)] } },
        'a roadmap': { ...data, kb: { ...kb, retrieval_records: kb.retrieval_records.map((r) => (r.kind === 'roadmap' ? { ...r, text: `${r.text} changed` } : r)) } },
        'a profile link': { ...data, profiles: data.profiles.map((p) => (p.id === 'instagram' ? { ...p, url: 'https://instagram.com/x', value: 'https://instagram.com/x' } : p)) },
    }
    for (const [what, changed] of Object.entries(variants)) assert.notEqual(versionOf(changed), base, what)
    assert.equal(versionOf(data), base, 'stable when nothing changed')
    const check = spawnSync(process.execPath, ['scripts/build-chat-index.mjs', '--check'], { cwd: ROOT, encoding: 'utf8' })
    assert.equal(check.status, 0, check.stderr || check.stdout)
    assert.deepEqual(validateKnowledgeBase(data.kb), [])
    assert.ok(validateKnowledgeBase({ projects: [{ id: 'x' }, { id: 'x' }], retrieval_records: [], faq: [] }).length >= 2)
})

test('freshness: a changed index never serves the old cached answer', async () => {
    const store = createMemoryStore()
    const fetchImpl = mockFetch({ groq: () => sse(groqText('Fresh answer.')) })
    const make = (version) => createChatHandler({
        env: env(), store, fetchImpl, index: { ...index, version }, log: () => {}, embed: async () => null, firstTokenMs: 200, idleMs: 200,
    })
    await ask(make('v1'), 'How does Kanoon-Mate work under the hood?', { cookie: cookieFor('3'.repeat(32)) })
    await ask(make('v1'), 'How does Kanoon-Mate work under the hood?', { cookie: cookieFor('4'.repeat(32)) })
    assert.equal(fetchImpl.calls.length, 1, 'same index: the cache answers')
    await ask(make('v2'), 'How does Kanoon-Mate work under the hood?', { cookie: cookieFor('5'.repeat(32)) })
    assert.equal(fetchImpl.calls.length, 2, 'new index: a cache miss')
})

test('citations: valid markers become sources; unsupported numbers and moved stacks are flagged', () => {
    const chunks = [
        { id: 'a', type: 'project', title: 'TaskNexus: Overview', url: 'https://github.com/ggauravky/TaskNexus', group: 'tasknexus', text: 'TaskNexus uses React, Node.js, Express and MongoDB Atlas.' },
        { id: 'b', type: 'service', title: 'Full Stack Development', url: '/full-stack-development', group: 'service:fullstack-development', text: 'Price: INR 3499 – INR 3999.' },
    ]
    const projects = [{ group: 'tasknexus', name: ' tasknexus ' }]
    const ok = validateCitations('TaskNexus uses MongoDB [1]. The service costs INR 3499 [2].', chunks, projects)
    assert.deepEqual(ok.cited.map((c) => c.id), ['a', 'b'])
    assert.deepEqual(ok.flags, [])
    const out = validateCitations('TaskNexus uses PostgreSQL [1]. It costs INR 999 [2]. See [7].', chunks, projects)
    assert.deepEqual(Object.keys(out.valid), ['1', '2'], 'an out-of-range marker is dropped')
    assert.deepEqual(out.flags.map((f) => f.type).sort(), ['number-not-in-source', 'tech-not-in-project-source'])
})

test('integrity: no stray control bytes in chat code; service prices only from the site', () => {
    const files = []
    const walk = (dir) => {
        for (const name of readdirSync(dir)) {
            const path = join(dir, name)
            if (statSync(path).isDirectory()) walk(path)
            else if (/\.(js|mjs|jsx|css)$/.test(name)) files.push(path)
        }
    }
    walk(new URL('../lib/chat', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'))
    walk(new URL('../src/components/chat', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'))
    const bad = files.filter((f) => readFileSync(f).includes(0x08))
    assert.deepEqual(bad, [], 'a backspace byte broke the page-link regexes once (D-113)')
    assert.ok(!corpus.chunks.some((c) => /historical repository service data|historical listing/i.test(c.text)), 'the knowledge base\'s historical prices are not indexed')
})

// ── Code-review regressions (2026-11-21) ──────────────────────────────────

test('review: a number written with a comma in the source is not flagged', () => {
    const chunks = [{ id: 'g', type: 'about', title: 'GitHub', url: '/', group: 'github', text: 'Commits: about 3,000+ (reported).' }]
    assert.deepEqual(validateCitations('He has made about 3,000+ commits [1].', chunks).flags, [])
})

test('review: refused and failed calls give their token reservation back', async () => {
    const store = createMemoryStore()
    const quota = createQuota({ store })
    for (let i = 0; i < 30; i += 1) await store.count('q:groq:rpm', 60 * 1000)
    assert.equal((await quota.reserve('groq', { tokens: 3000 })).ok, false)
    assert.equal((await store.count('q:groq:tpm', 60 * 1000, 0)).count, 0, 'refused: nothing reserved')
    const failing = mockFetch({ gemini: () => new Response('down', { status: 503 }) })
    const fresh = createMemoryStore()
    const handler = createChatHandler({ env: env({ providerOrder: ['gemini'] }), store: fresh, fetchImpl: failing, index, log: () => {}, embed: async () => null, firstTokenMs: 200, idleMs: 200 })
    await ask(handler, 'How does Kanoon-Mate work under the hood?', { cookie: cookieFor('6'.repeat(32)) })
    assert.equal((await fresh.count('q:gemini:tpm', 60 * 1000, 0)).count, 0, 'failed: nothing left reserved')
})

test('review: a "busy" reply spends no quota; turns are not linkable across conversations', async () => {
    const fetchImpl = mockFetch({ groq: () => sse(groqText('slow ', 'answer'), { delayMs: 40 }) })
    const { handler, store } = makeHandler({ fetchImpl })
    const id = '7'.repeat(32)
    await Promise.all([
        ask(handler, 'How does Kanoon-Mate work under the hood?', { cookie: cookieFor(id) }),
        ask(handler, 'What is InstaX built with?', { cookie: cookieFor(id) }),
    ])
    assert.equal((await store.count(`v:${id}`, 10 * 60 * 1000, 0)).count, 1, 'only the answered request was counted')
    const turn = store.turns.at(-1)
    assert.equal(turn.visitorId, undefined, 'the cookie id is not stored')
    assert.match(turn.owner, /^[0-9a-f]{32}$/, 'a per-conversation hash instead')
})

test('review: text like array[0] is not a citation; seniority words need a subject', () => {
    assert.deepEqual(parseInline('uses buffer[0] here').map((p) => p.t), ['text'])
    assert.equal(HIRING.test('Is TaskNexus built for junior developers?'), false)
    assert.equal(HIRING.test('is he a fresher?'), true)
})

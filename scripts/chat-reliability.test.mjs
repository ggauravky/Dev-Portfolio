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
import { parseProviderOrder, EMERGENCY_AI_PER_MINUTE, GEN_STARTS_PER_10S, NEW_VISITORS_PER_IP_HOUR, VISITOR_COOKIE } from '../lib/chat/config.js'
import { signVisitor, verifyVisitor } from '../lib/chat/visitor.js'
import { validateCitations } from '../lib/chat/cite.js'
import { validateKnowledgeBase } from '../lib/chat/knowledge.js'

const ROOT = new URL('../', import.meta.url)
const data = await loadSiteData()
const corpus = buildCorpus(data)
const index = prepareIndex({ version: 'v1', chunks: corpus.chunks, aliases: corpus.aliases, faqKeys: faqKeysOf(corpus.chunks), profiles: corpus.profiles })
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

const env = (extra = {}) => ({
    enabled: true, groqKey: 'g', geminiKey: 'm', mongoUri: '', ipSalt: 'salt', origins: [ORIGIN], production: true, providerOrder: ['groq', 'gemini'], ...extra,
})

const cookieFor = (id) => `${VISITOR_COOKIE}=${signVisitor(id, 'salt')}`
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
            ? doc[k] <= v.$lte : doc[k] === v))
        return {
            collectionName: name,
            async createIndex() {},
            async findOneAndUpdate(filter, update) {
                const id = idOf(filter)
                const doc = docs.get(id) || { ...filter, ...(update.$setOnInsert || {}) }
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
                const doc = docs.get(filter._id)
                return doc ? { ...doc } : null
            },
            async deleteOne(filter) { docs.delete(filter._id) },
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

test('visitor cookie: signed, HttpOnly, tamper-proof', () => {
    const value = signVisitor('a'.repeat(32), 'salt')
    assert.equal(verifyVisitor(value, 'salt'), 'a'.repeat(32))
    assert.equal(verifyVisitor(value, 'other-salt'), null, 'another key does not verify')
    assert.equal(verifyVisitor(`${'b'.repeat(32)}.${value.split('.')[1]}`, 'salt'), null, 'a changed id does not verify')
    assert.equal(verifyVisitor('garbage', 'salt'), null)
})

test('shared Wi-Fi: 40 visitors on one network are not limited (fairness)', async () => {
    const fetchImpl = mockFetch({ groq: () => sse(groqText('ok')) })
    const { handler } = makeHandler({ fetchImpl })
    let limited = 0
    for (const id of ids(40)) {
        for (const q of ['What is TaskNexus?', 'Where has Gaurav worked?']) {
            const res = await ask(handler, q, { cookie: cookieFor(id), session: `${id.slice(-8)}-5a4d-4e6f-9b7a-1c2d3e4f5a6b` })
            if (res.events()[0].t === 'limit') limited += 1
        }
    }
    assert.equal(limited, 0, '80 requests from 40 visitors behind one IP all answered (the old per-IP cap of 60 would have blocked)')
})

test('cookie rotation: past the new-visitor cap per network, no model calls', async () => {
    const fetchImpl = mockFetch({ groq: () => sse(groqText('answer')) })
    const { handler } = makeHandler({ fetchImpl })
    for (let i = 0; i < NEW_VISITORS_PER_IP_HOUR + 8; i += 1) await ask(handler, 'How does Kanoon-Mate work under the hood?')
    assert.ok(fetchImpl.calls.filter((c) => c === 'groq').length <= NEW_VISITORS_PER_IP_HOUR, `model calls: ${fetchImpl.calls.length}`)
})

test('one request at a time per visitor: a parallel one gets "busy"', async () => {
    const fetchImpl = mockFetch({ groq: () => sse(groqText('slow ', 'answer'), { delayMs: 40 }) })
    const { handler } = makeHandler({ fetchImpl })
    const cookie = cookieFor('c'.repeat(32))
    const [a, b] = await Promise.all([ask(handler, 'How does Kanoon-Mate work under the hood?', { cookie }), ask(handler, 'What is InstaX built with?', { cookie })])
    const kinds = [a.events()[0].t, b.events()[0].t].sort()
    assert.deepEqual(kinds, ['busy', 'delta'])
    const again = await ask(handler, 'What is InstaX built with?', { cookie })
    assert.equal(again.events()[0].t, 'delta', 'the lock is released after the answer')
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
    await quota.settle('groq', t.reserved, 900)
    const tpm = await store.count('q:groq:tpm', 60 * 1000, 0)
    assert.equal(tpm.count, 900, 'the estimate is replaced by the real usage')
    assert.equal((await quota.reserve('groq', { tokens: 7000 })).reason, 'tokens per minute')
    assert.equal((await quota.reserve('openai', { tokens: 1 })).ok, false, 'not a free-tier model')
    assert.ok(estimateTokens([{ content: 'x'.repeat(4000) }]) >= 1000)
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
    assert.match(cut.text(), /^Half an \n\n\(The answer was cut short/)
    assert.equal(cut.events().at(-1).cut, true)
    assert.deepEqual(cutting.calls, ['groq'], 'no switch to another provider mid-answer')
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

test('MongoDB down: emergency mode allows only a few model calls per instance, then recovers', async () => {
    let t = Date.now()
    const now = () => t
    let down = true
    const mongo = fakeMongo({ now })
    const store = createStore({ getDb: async () => { if (down) throw new Error('unreachable'); return mongo.db }, now })
    const fetchImpl = mockFetch({ groq: () => sse(groqText('ok')) })
    const logs = []
    const handler = createChatHandler({ env: env(), store, fetchImpl, index, log: (e, d) => logs.push([e, d]), now, embed: async () => null, firstTokenMs: 200, idleMs: 200 })
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
    assert.equal(await store.acquire('lock:x', 1000), true)
    assert.equal(await store.acquire('lock:x', 1000), false, 'held')
    t += 2000
    assert.equal(await store.acquire('lock:x', 1000), true, 'expired lock is taken over')
    await store.release('lock:x')
    assert.equal(await store.acquire('lock:x', 1000), true, 'released lock is free')
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

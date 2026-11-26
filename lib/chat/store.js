// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// Chat storage (D-101, D-102), MongoDB database `portfolio_chat`:
// - chat_turns  one document per question → answer (ChatTurn), TTL 180 days
// - chat_rate   fixed-window counters: per conversation, visitor, network,
//               provider requests and tokens (D-113)
// - chat_locks  short-lived documents: one request at a time per visitor, and
//               shared provider cooldowns after a 429
// - chat_cache  answers to repeated questions, TTL 24 h
// Nothing stored here is ever returned to the client. If Mongo is missing or
// failing, every call falls back to per-instance memory so the chat keeps
// answering, but counters then say `shared: false`: limits are only per warm
// instance, so production refuses to serve (fails closed, D-134); elsewhere
// the handler stops trusting them for model calls (emergency mode, D-113).
// Turns are not logged while Mongo is down. chat_locks also holds visitor
// leases (owned by one request) and flagged networks (cookie rotation).

import { createHmac, randomBytes } from 'node:crypto'
import { CACHE_TTL_HOURS, DB_NAME, MONGO_POOL, MONGO_TIMEOUT_MS, MONGO_COOLDOWN_MS, RETENTION_DAYS } from './config.js'

export const DAY = 24 * 60 * 60 * 1000
const CACHE_TTL_MS = CACHE_TTL_HOURS * 60 * 60 * 1000
// A window's counter outlives the window by an hour (as in Mongo), so a
// reservation made just before it ended can still be settled into it.
const GRACE_MS = 60 * 60 * 1000

export const windowStartOf = (now, windowMs) => Math.floor(now / windowMs) * windowMs
export const dayOf = (now) => new Date(now).toISOString().slice(0, 10)

// Without a configured salt, a random per-process key: the hash still works for
// the per-instance IP backstop, but it is never a known key that would let
// stored hashes be reversed (the IPv4 space is small enough to brute-force).
const EPHEMERAL_SALT = randomBytes(32).toString('hex')

/** Salted, truncated HMAC of the client IP. The raw IP is never stored. */
export function hashIp(ip, salt) {
    if (!ip) return 'unknown'
    return createHmac('sha256', salt || EPHEMERAL_SALT).update(String(ip)).digest('hex').slice(0, 32)
}

// ── Memory store (fallback and tests) ─────────────────────────────────────

export function createMemoryStore({ now = () => Date.now(), shared = true } = {}) {
    const counters = new Map()
    const cache = new Map()
    const locks = new Map()
    const leases = new Map()
    const turns = []
    const sweep = () => {
        const t = now()
        for (const [key, value] of counters) if (value.expireAt <= t) counters.delete(key)
        for (const [key, value] of cache) if (value.expireAt <= t) cache.delete(key)
        for (const [key, value] of locks) if (value <= t) locks.delete(key)
        for (const [key, value] of leases) if (value.until <= t) leases.delete(key)
        if (turns.length > 200) turns.splice(0, turns.length - 200)
    }
    return {
        kind: 'memory',
        turns,
        // `at`: a time inside the window to count in (a reservation settles in
        // the window it was made in). Never below zero.
        async count(key, windowMs, amount = 1, at = now()) {
            sweep()
            const start = windowStartOf(at, windowMs)
            const id = `${key}|${start}`
            const entry = counters.get(id) || { count: 0, expireAt: start + windowMs + GRACE_MS }
            entry.count = Math.max(0, entry.count + amount)
            counters.set(id, entry)
            return { count: entry.count, resetAt: start + windowMs, shared }
        },
        // Count one only while under `limit` (atomic): { ok, count, resetAt }.
        async take(key, windowMs, limit) {
            sweep()
            const start = windowStartOf(now(), windowMs)
            const id = `${key}|${start}`
            const entry = counters.get(id) || { count: 0, expireAt: start + windowMs + GRACE_MS }
            if (entry.count >= limit) return { ok: false, count: entry.count, resetAt: start + windowMs, shared }
            entry.count += 1
            counters.set(id, entry)
            return { ok: true, count: entry.count, resetAt: start + windowMs, shared }
        },
        async peek(key, windowMs) {
            sweep()
            const start = windowStartOf(now(), windowMs)
            return { count: counters.get(`${key}|${start}`)?.count || 0, resetAt: start + windowMs, shared }
        },
        // A lease (D-134): held until its owner releases it or `ttlMs` passes.
        async acquire(key, ttlMs, owner = 'x') {
            sweep()
            const held = leases.get(key)
            if (held && held.until > now()) return false
            leases.set(key, { until: now() + ttlMs, owner })
            return true
        },
        // Only the request holding the lease can release it.
        async release(key, owner = 'x') {
            if (leases.get(key)?.owner === owner) leases.delete(key)
        },
        // Shared "not before" times (provider cooldowns, flagged networks).
        async setUntil(key, untilMs) {
            locks.set(key, Math.max(locks.get(key) || 0, untilMs))
        },
        async getUntil(key) {
            sweep()
            return locks.get(key) || 0
        },
        async getCache(key) {
            sweep()
            return cache.get(key)?.value || null
        },
        async setCache(key, value) {
            cache.set(key, { value, expireAt: now() + CACHE_TTL_MS })
        },
        async logTurn(doc) {
            turns.push(doc)
        },
        // Owner-bound (D-113, D-134): without an owner nothing is returned.
        async recentTurns(sessionId, limit, owner) {
            if (!owner) return []
            return turns.filter((t) => t.sessionId === sessionId && t.owner === owner)
                .slice(-limit).reverse().map(toRecent)
        },
    }
}

/** The fields the conversation layer may read back (server-side only). */
const toRecent = (doc) => ({
    q: doc.question,
    a: doc.answer,
    intent: doc.intent || 'question',
    at: new Date(doc.createdAt).getTime(),
    // D-134 fields (absent on older turns): what the turn did, and whether its
    // answer is complete enough to use as context.
    operation: doc.operation || null,
    entities: Array.isArray(doc.entities) ? doc.entities : [],
    mentioned: Array.isArray(doc.mentioned) ? doc.mentioned : [],
    chunkIds: Array.isArray(doc.chunkIds) ? doc.chunkIds : [],
    pending: doc.pending || null,
    language: doc.language || null,
    complete: doc.complete !== undefined ? Boolean(doc.complete) : !doc.aborted,
})
const RECENT_FIELDS = {
    question: 1, answer: 1, intent: 1, createdAt: 1, operation: 1, entities: 1, mentioned: 1, chunkIds: 1, pending: 1, language: 1, complete: 1, aborted: 1,
}

// ── Mongo store ───────────────────────────────────────────────────────────

let clientPromise = null
let indexesPromise = null

async function connect(uri) {
    if (!clientPromise) {
        clientPromise = import('mongodb')
            .then(({ MongoClient }) => new MongoClient(uri, {
                maxPoolSize: MONGO_POOL,
                serverSelectionTimeoutMS: MONGO_TIMEOUT_MS,
                connectTimeoutMS: MONGO_TIMEOUT_MS,
                appName: 'portfolio-chat',
            }).connect())
            .catch((error) => {
                clientPromise = null // retry on the next request
                throw error
            })
    }
    const client = await clientPromise
    return client.db(DB_NAME)
}

async function ensureIndex(collection, keys, options) {
    try {
        await collection.createIndex(keys, options)
    } catch (error) {
        // TTL changed since the index was made: update it in place.
        if ((error?.code === 85 || error?.code === 86) && options.expireAfterSeconds !== undefined) {
            await collection.db.command({ collMod: collection.collectionName, index: { keyPattern: keys, expireAfterSeconds: options.expireAfterSeconds } })
            return
        }
        throw error
    }
}

/** Create indexes once per cold start (idempotent). */
export function ensureIndexes(db) {
    if (!indexesPromise) {
        indexesPromise = Promise.all([
            ensureIndex(db.collection('chat_turns'), { createdAt: 1 }, { name: 'ttl_createdAt', expireAfterSeconds: RETENTION_DAYS * 86400 }),
            ensureIndex(db.collection('chat_turns'), { sessionId: 1, createdAt: -1 }, { name: 'session_time' }),
            ensureIndex(db.collection('chat_rate'), { key: 1, windowStart: 1 }, { name: 'key_window', unique: true }),
            ensureIndex(db.collection('chat_rate'), { expireAt: 1 }, { name: 'ttl_expireAt', expireAfterSeconds: 0 }),
            ensureIndex(db.collection('chat_cache'), { expireAt: 1 }, { name: 'ttl_expireAt', expireAfterSeconds: 0 }),
            ensureIndex(db.collection('chat_locks'), { expireAt: 1 }, { name: 'ttl_expireAt', expireAfterSeconds: 0 }),
        ]).catch((error) => {
            indexesPromise = null
            throw error
        })
    }
    return indexesPromise
}

const withTimeout = (promise, ms = MONGO_TIMEOUT_MS) => Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(`mongo timeout after ${ms} ms`)), ms)),
])

/**
 * Mongo-backed store with a memory fallback per call. `getDb` is injectable so
 * tests can pass a fake database.
 */
export function createStore({ uri, getDb, now = () => Date.now(), log = () => {} } = {}) {
    // The fallback's counters are per instance: they say so (`shared: false`).
    const memory = createMemoryStore({ now, shared: false })
    if (!uri && !getDb) return memory
    const db = () => withTimeout((getDb ? getDb() : connect(uri)).then(async (database) => {
        await ensureIndexes(database)
        return database
    }))
    // Circuit breaker: after a failure, skip Mongo for a cooldown so one outage
    // doesn't add a timeout to every store call of every request.
    let downUntil = 0
    const fallback = (name, op) => async (...args) => {
        if (now() < downUntil) return memory[name](...args)
        try {
            return await op(await db(), ...args)
        } catch (error) {
            downUntil = now() + MONGO_COOLDOWN_MS
            log('chat.store.fallback', { op: name, error: error?.message || String(error) })
            return memory[name](...args)
        }
    }
    return {
        kind: 'mongo',
        // Atomic: one $inc on the { key, windowStart } document. Two first
        // increments racing on the unique index can raise E11000; MongoDB 4.2+
        // retries that upsert itself, and one retry here covers older servers.
        // `at`: count in the window containing that time (a reservation settles
        // in its own window). A negative amount never takes a counter below 0.
        count: fallback('count', async (database, key, windowMs, amount = 1, at = now()) => {
            const start = windowStartOf(at, windowMs)
            const expireAt = new Date(start + windowMs + 60 * 60 * 1000)
            const update = amount >= 0
                ? { $inc: { count: amount }, $setOnInsert: { expireAt } }
                : [{ $set: { count: { $max: [0, { $add: [{ $ifNull: ['$count', 0] }, amount] }] }, expireAt: { $ifNull: ['$expireAt', expireAt] } } }]
            const inc = () => withTimeout(database.collection('chat_rate').findOneAndUpdate(
                { key, windowStart: start },
                update,
                { upsert: true, returnDocument: 'after' },
            ))
            let doc
            try {
                doc = await inc()
            } catch (error) {
                if (error?.code !== 11000) throw error
                doc = await inc()
            }
            // Driver 6+ returns the document; older shapes wrap it in `value`.
            const count = (doc && 'count' in doc ? doc.count : doc?.value?.count) ?? amount
            return { count, resetAt: start + windowMs, shared: true }
        }),
        // Count one only while the window is under `limit` (one atomic upsert):
        // a full window's document doesn't match the filter, so the upsert
        // collides on the unique { key, windowStart } index (E11000) and
        // nothing is counted. One retry covers two first inserts racing.
        take: fallback('take', async (database, key, windowMs, limit) => {
            const start = windowStartOf(now(), windowMs)
            const attempt = () => withTimeout(database.collection('chat_rate').findOneAndUpdate(
                { key, windowStart: start, count: { $lt: limit } },
                { $inc: { count: 1 }, $setOnInsert: { expireAt: new Date(start + windowMs + 60 * 60 * 1000) } },
                { upsert: true, returnDocument: 'after' },
            ))
            for (let i = 0; i < 2; i += 1) {
                try {
                    const doc = await attempt()
                    const count = (doc && 'count' in doc ? doc.count : doc?.value?.count) ?? 1
                    return { ok: true, count, resetAt: start + windowMs, shared: true }
                } catch (error) {
                    if (error?.code !== 11000) throw error
                }
            }
            return { ok: false, count: limit, resetAt: start + windowMs, shared: true }
        }),
        peek: fallback('peek', async (database, key, windowMs) => {
            const start = windowStartOf(now(), windowMs)
            const doc = await withTimeout(database.collection('chat_rate').findOne({ key, windowStart: start }, { projection: { count: 1 } }))
            return { count: doc?.count || 0, resetAt: start + windowMs, shared: true }
        }),
        // A lease (D-134): take the lock if it is free or expired, recording the
        // request that holds it (one atomic upsert). A held, unexpired lock
        // makes the upsert collide on _id: E11000 → false.
        acquire: fallback('acquire', async (database, key, ttlMs, owner = 'x') => {
            const t = now()
            try {
                await withTimeout(database.collection('chat_locks').updateOne(
                    { _id: key, expireAt: { $lte: new Date(t) } },
                    { $set: { expireAt: new Date(t + ttlMs), owner } },
                    { upsert: true },
                ))
                return true
            } catch (error) {
                if (error?.code === 11000) return false
                throw error
            }
        }),
        // Only the holder's lease is deleted: an old request whose lease expired
        // and was taken over can't release the newer request's lease.
        release: fallback('release', async (database, key, owner = 'x') => {
            await withTimeout(database.collection('chat_locks').deleteOne({ _id: key, owner }))
        }),
        setUntil: fallback('setUntil', async (database, key, untilMs) => {
            await withTimeout(database.collection('chat_locks').updateOne(
                { _id: key },
                { $max: { expireAt: new Date(untilMs) } },
                { upsert: true },
            ))
        }),
        getUntil: fallback('getUntil', async (database, key) => {
            const doc = await withTimeout(database.collection('chat_locks').findOne({ _id: key }))
            return doc?.expireAt ? doc.expireAt.getTime() : 0
        }),
        getCache: fallback('getCache', async (database, key) => {
            const doc = await withTimeout(database.collection('chat_cache').findOne({ _id: key }))
            return doc && doc.expireAt > new Date(now()) ? doc.value : null
        }),
        setCache: fallback('setCache', async (database, key, value) => {
            await withTimeout(database.collection('chat_cache').updateOne(
                { _id: key },
                { $set: { value, expireAt: new Date(now() + CACHE_TTL_MS) } },
                { upsert: true },
            ))
        }),
        logTurn: fallback('logTurn', async (database, doc) => {
            await withTimeout(database.collection('chat_turns').insertOne(doc))
        }),
        // Newest first; read by the server only (never sent to the client).
        // Uses the existing { sessionId: 1, createdAt: -1 } index.
        // Only this visitor's turns of this conversation: a guessed sessionId
        // can't pull someone else's history into the prompt (D-113).
        recentTurns: fallback('recentTurns', async (database, sessionId, limit, owner) => {
            if (!owner) return []
            const docs = await withTimeout(database.collection('chat_turns')
                .find({ sessionId, owner }, { projection: RECENT_FIELDS })
                .sort({ createdAt: -1 })
                .limit(limit)
                .toArray())
            return docs.map(toRecent)
        }),
    }
}

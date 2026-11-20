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
// instance, so the handler stops trusting them for model calls (emergency
// mode, D-113). Turns are not logged while Mongo is down.

import { createHmac, randomBytes } from 'node:crypto'
import { CACHE_TTL_HOURS, DB_NAME, MONGO_POOL, MONGO_TIMEOUT_MS, MONGO_COOLDOWN_MS, RETENTION_DAYS } from './config.js'

export const DAY = 24 * 60 * 60 * 1000
const CACHE_TTL_MS = CACHE_TTL_HOURS * 60 * 60 * 1000

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
    const turns = []
    const sweep = () => {
        const t = now()
        for (const [key, value] of counters) if (value.expireAt <= t) counters.delete(key)
        for (const [key, value] of cache) if (value.expireAt <= t) cache.delete(key)
        for (const [key, value] of locks) if (value <= t) locks.delete(key)
        if (turns.length > 200) turns.splice(0, turns.length - 200)
    }
    return {
        kind: 'memory',
        turns,
        async count(key, windowMs, amount = 1) {
            sweep()
            const start = windowStartOf(now(), windowMs)
            const id = `${key}|${start}`
            const entry = counters.get(id) || { count: 0, expireAt: start + windowMs }
            entry.count += amount
            counters.set(id, entry)
            return { count: entry.count, resetAt: start + windowMs, shared }
        },
        // A lock held until it is released or `ttlMs` passes. Returns false if held.
        async acquire(key, ttlMs) {
            sweep()
            if ((locks.get(key) || 0) > now()) return false
            locks.set(key, now() + ttlMs)
            return true
        },
        async release(key) {
            locks.delete(key)
        },
        // Shared "not before" times (provider cooldowns).
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
        async recentTurns(sessionId, limit, visitorId = null) {
            return turns.filter((t) => t.sessionId === sessionId && (!visitorId || t.visitorId === visitorId))
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
})

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
        count: fallback('count', async (database, key, windowMs, amount = 1) => {
            const start = windowStartOf(now(), windowMs)
            const inc = () => withTimeout(database.collection('chat_rate').findOneAndUpdate(
                { key, windowStart: start },
                { $inc: { count: amount }, $setOnInsert: { expireAt: new Date(start + windowMs + 60 * 60 * 1000) } },
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
        // Take the lock if it is free or expired (one atomic upsert). A held,
        // unexpired lock makes the upsert collide on _id: E11000 → false.
        acquire: fallback('acquire', async (database, key, ttlMs) => {
            const t = now()
            try {
                await withTimeout(database.collection('chat_locks').updateOne(
                    { _id: key, expireAt: { $lte: new Date(t) } },
                    { $set: { expireAt: new Date(t + ttlMs) } },
                    { upsert: true },
                ))
                return true
            } catch (error) {
                if (error?.code === 11000) return false
                throw error
            }
        }),
        release: fallback('release', async (database, key) => {
            await withTimeout(database.collection('chat_locks').deleteOne({ _id: key }))
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
        recentTurns: fallback('recentTurns', async (database, sessionId, limit, visitorId = null) => {
            const docs = await withTimeout(database.collection('chat_turns')
                .find(visitorId ? { sessionId, visitorId } : { sessionId }, { projection: { question: 1, answer: 1, intent: 1, createdAt: 1 } })
                .sort({ createdAt: -1 })
                .limit(limit)
                .toArray())
            return docs.map(toRecent)
        }),
    }
}

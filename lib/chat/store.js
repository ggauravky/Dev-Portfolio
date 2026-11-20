// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// Chat storage (D-101, D-102), MongoDB database `portfolio_chat`:
// - chat_turns  one document per question → answer (ChatTurn), TTL 180 days
// - chat_rate   fixed-window counters: per session, per IP hash, per provider-day
// - chat_cache  answers to repeated questions, TTL 24 h
// Nothing stored here is ever returned to the client. If Mongo is missing or
// failing, every call falls back to per-instance memory: the chat keeps
// answering, limits still apply per warm instance, and turns are not logged.

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

export function createMemoryStore({ now = () => Date.now() } = {}) {
    const counters = new Map()
    const cache = new Map()
    const turns = []
    const sweep = () => {
        const t = now()
        for (const [key, value] of counters) if (value.expireAt <= t) counters.delete(key)
        for (const [key, value] of cache) if (value.expireAt <= t) cache.delete(key)
        if (turns.length > 200) turns.splice(0, turns.length - 200)
    }
    return {
        kind: 'memory',
        turns,
        async count(key, windowMs) {
            sweep()
            const start = windowStartOf(now(), windowMs)
            const id = `${key}|${start}`
            const entry = counters.get(id) || { count: 0, expireAt: start + windowMs }
            entry.count += 1
            counters.set(id, entry)
            return { count: entry.count, resetAt: start + windowMs }
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
        async recentTurns(sessionId, limit) {
            return turns.filter((t) => t.sessionId === sessionId).slice(-limit).reverse().map(toRecent)
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
    const memory = createMemoryStore({ now })
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
        count: fallback('count', async (database, key, windowMs) => {
            const start = windowStartOf(now(), windowMs)
            const doc = await withTimeout(database.collection('chat_rate').findOneAndUpdate(
                { key, windowStart: start },
                { $inc: { count: 1 }, $setOnInsert: { expireAt: new Date(start + windowMs + 60 * 60 * 1000) } },
                { upsert: true, returnDocument: 'after' },
            ))
            // Driver 6+ returns the document; older shapes wrap it in `value`.
            const count = (doc && 'count' in doc ? doc.count : doc?.value?.count) || 1
            return { count, resetAt: start + windowMs }
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
        recentTurns: fallback('recentTurns', async (database, sessionId, limit) => {
            const docs = await withTimeout(database.collection('chat_turns')
                .find({ sessionId }, { projection: { question: 1, answer: 1, intent: 1, createdAt: 1 } })
                .sort({ createdAt: -1 })
                .limit(limit)
                .toArray())
            return docs.map(toRecent)
        }),
    }
}

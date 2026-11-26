// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// Admission and usage limits (D-134). The backend is the only authority; the
// page only shows what it is told.
//
// Who is counted:
// - the visitor (signed HttpOnly cookie, lib/chat/visitor.js) is the
//   allowance, across every conversation, tab and session id it opens
// - the network (salted hash of the IP, IPv6 /64) is a loose backstop for
//   shared networks, plus a cap on messages that use a model
// A conversation id is never a limit key, so New Chat can't add allowance.
//
// How (all fixed windows aligned to the clock, MongoDB atomic upserts):
//   visitor  5 / minute · 15 / 10 minutes · 50 / UTC day (resets 00:00 UTC)
//   network  150 / 10 minutes · 800 / UTC day (accepted messages)
//            120 model-using messages / 10 minutes (past it: answers that
//            need no model still work, the rest say so)
// Every accepted message counts once, whatever answers it (a model, the
// cache, a fixed reply, a computed result). Limits are "taken" only while
// under the cap, so refused requests add nothing to them and never push a
// reset further away; if a later window refuses, the earlier ones are given
// back. Refused requests (limited, busy) go to a small per-minute counter
// per network and per visitor, and a client hammering past it is refused
// with a single read.
//
// Cookie rotation: each new visitor id is counted per network per hour. Past
// NEW_VISITORS_PER_IP_HOUR the network is flagged for an hour (chat_locks), and
// every visitor id on it younger than an hour (its issue time is signed in the
// cookie) shares one small bucket of model calls: the restriction lasts for
// the id's whole first hour, not only its first request. Established visitors
// on the same network are unaffected.
//
// Shared counters unavailable (MongoDB down): in production nothing is served
// (HTTP 503, fail closed), so no instance can hand out allowance of its own.

import {
    IP_AI_LIMIT, IP_DAILY_LIMIT, IP_LIMIT, LOCK_TTL_MS, MINUTE_MS, NEW_VISITORS_PER_IP_HOUR, NEWCOMER_AI_LIMIT, RATE_WINDOW_MS,
    REJECTS_PER_IP_MINUTE, REJECTS_PER_VISITOR_MINUTE, STATUS_PER_VISITOR_MINUTE, VISITOR_DAILY_LIMIT, VISITOR_LIMIT, VISITOR_PER_MINUTE,
    YOUNG_VISITOR_MS,
} from './config.js'
import { DAY } from './store.js'

const HOUR = 60 * 60 * 1000

/** The windows an accepted message takes, tightest first. */
export const visitorWindows = (visitorId) => [
    { key: `vm:${visitorId}`, ms: MINUTE_MS, limit: VISITOR_PER_MINUTE, scope: 'minute' },
    { key: `v:${visitorId}`, ms: RATE_WINDOW_MS, limit: VISITOR_LIMIT, scope: 'window' },
    { key: `vd:${visitorId}`, ms: DAY, limit: VISITOR_DAILY_LIMIT, scope: 'day' },
]
export const networkWindows = (net) => [
    { key: `i:${net}`, ms: RATE_WINDOW_MS, limit: IP_LIMIT, scope: 'network' },
    { key: `id:${net}`, ms: DAY, limit: IP_DAILY_LIMIT, scope: 'network' },
]

const iso = (ms) => new Date(ms).toISOString()

/**
 * What the visitor has left, from the counts of every window that applies.
 * `left` is the tightest; `day*` is the daily allowance. Network numbers are
 * not shown; a nearly used network only lowers `left` (scope "network").
 */
export function quotaOf(visitorCounts, networkCounts = []) {
    const rows = [...visitorCounts, ...networkCounts].map(({ window, count, resetAt }) => ({
        scope: window.scope, limit: window.limit, left: Math.max(0, window.limit - count), resetAt,
    }))
    const day = rows.find((r) => r.scope === 'day')
    const binding = rows.reduce((a, b) => (b.left < a.left ? b : a))
    return {
        left: binding.left,
        limit: binding.scope === 'network' ? day?.limit || binding.limit : binding.limit,
        scope: binding.scope,
        resetAt: iso(binding.resetAt),
        dayLeft: day ? day.left : null,
        dayLimit: day ? day.limit : null,
        dayResetAt: day ? iso(day.resetAt) : null,
        shared: true, // the allowance is shared by every conversation of this browser
    }
}

/**
 * Admit one message. Returns
 *   { ok: true, quota, flagged, release }             accepted (lease held)
 *   { ok: false, status, code, retryAt, scope, quota } refused
 * `release()` frees this request's lease (only its own).
 */
export async function admit({ store, visitor, net, production, leaseId, now = Date.now }) {
    const t = now()
    const unshared = (...results) => production && results.some((r) => r && r.shared === false)
    const unavailable = { ok: false, status: 503, code: 'UNAVAILABLE', retryAt: iso(t + 30 * 1000), scope: 'service' }

    // 1. A client already refused too often this minute: one read, nothing written.
    const [netRejects, visitorRejects] = await Promise.all([
        store.peek(`x:${net}`, MINUTE_MS),
        store.peek(`xv:${visitor.id}`, MINUTE_MS),
    ])
    if (unshared(netRejects, visitorRejects)) return unavailable
    if (netRejects.count >= REJECTS_PER_IP_MINUTE || visitorRejects.count >= REJECTS_PER_VISITOR_MINUTE) {
        return { ok: false, status: 429, code: 'RATE_LIMITED', retryAt: iso(netRejects.resetAt), scope: 'minute' }
    }
    const rejected = () => Promise.all([store.count(`x:${net}`, MINUTE_MS), store.count(`xv:${visitor.id}`, MINUTE_MS)])

    // 2. One request at a time per visitor: a lease only this request can release.
    const lockKey = `lock:${visitor.id}`
    if (!(await store.acquire(lockKey, LOCK_TTL_MS, leaseId))) {
        await rejected()
        return { ok: false, status: 429, code: 'BUSY', retryAt: iso(t + 5000), scope: 'busy' }
    }
    const release = () => store.release(lockKey, leaseId).catch(() => {})

    // 3. Take every window, visitor first; give back what was taken if one is full.
    const windows = [...visitorWindows(visitor.id), ...networkWindows(net)]
    const taken = []
    for (const window of windows) {
        const result = await store.take(window.key, window.ms, window.limit)
        if (unshared(result)) {
            await release()
            return unavailable
        }
        if (!result.ok) {
            await Promise.all(taken.map(({ window: w }) => store.count(w.key, w.ms, -1, t)))
            await rejected()
            await release()
            return { ok: false, status: 429, code: 'RATE_LIMITED', retryAt: iso(result.resetAt), scope: window.scope }
        }
        taken.push({ window, count: result.count, resetAt: result.resetAt })
    }

    // 4. Cookie rotation (see the header): new ids per network per hour.
    let flagged = false
    if (visitor.isNew) {
        const fresh = await store.count(`nv:${net}`, HOUR)
        if (fresh.count > NEW_VISITORS_PER_IP_HOUR) await store.setUntil(`risk:${net}`, t + HOUR)
    }
    if (visitor.young || (visitor.issuedMs && t - visitor.issuedMs < YOUNG_VISITOR_MS)) {
        flagged = (await store.getUntil(`risk:${net}`)) > t
    }

    const quota = quotaOf(taken.filter(({ window }) => window.scope !== 'network'), taken.filter(({ window }) => window.scope === 'network'))
    return { ok: true, quota, flagged, release }
}

/**
 * May this message use a model (an embedding or a generation)? Counted once per
 * message, before the first model call: the network's model-message cap, and
 * for a young id on a flagged network the shared newcomer bucket.
 */
export async function admitModel({ store, net, flagged }) {
    const units = await store.take(`ia:${net}`, RATE_WINDOW_MS, IP_AI_LIMIT)
    if (!units.ok) return { ok: false, reason: 'network AI limit' }
    if (flagged) {
        const newcomers = await store.take(`ian:${net}`, RATE_WINDOW_MS, NEWCOMER_AI_LIMIT)
        if (!newcomers.ok) return { ok: false, reason: 'newcomer bucket used' }
    }
    return { ok: true }
}

/**
 * The visitor's current allowance without using any (opening the chat).
 * Status checks are themselves limited per visitor per minute.
 */
export async function quotaStatus({ store, visitor, net, production }) {
    const check = await store.take(`st:${visitor.id}`, MINUTE_MS, STATUS_PER_VISITOR_MINUTE)
    if (production && check.shared === false) return { ok: false, status: 503, code: 'UNAVAILABLE' }
    if (!check.ok) return { ok: false, status: 429, code: 'RATE_LIMITED', retryAt: iso(check.resetAt) }
    const read = (windows) => Promise.all(windows.map(async (window) => ({ window, ...(await store.peek(window.key, window.ms)) })))
    const [mine, network] = await Promise.all([read(visitorWindows(visitor.id)), read(networkWindows(net))])
    if (production && [...mine, ...network].some((r) => r.shared === false)) return { ok: false, status: 503, code: 'UNAVAILABLE' }
    return { ok: true, quota: quotaOf(mine, network) }
}

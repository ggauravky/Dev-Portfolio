// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// Admission and usage limits (D-134, D-136). The backend is the only
// authority; the page only shows what it is told.
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
//   new ids  10 / network / hour before the network is flagged; none issued
//            past 120 / network / hour
//   status   240 / network / minute, 12 / visitor / minute
// Every accepted message counts once, whatever answers it (a model, the
// cache, a fixed reply, a computed result). Limits are "taken" only while
// under the cap, so refused requests add nothing to them and never push a
// reset further away; if a later window refuses, the earlier ones are given
// back, in the same windows. Refused requests (limited, busy) go to a small
// per-minute counter per network and per visitor, and a client hammering past
// it is refused with a single read.
//
// Identity issuance (D-136): every new id, whichever request brought it (a
// message, a status check, a missing, invalid or expired cookie), goes through
// issueVisitor(): counted per network, bounded, and only then set as a cookie.
//
// Cookie rotation: past NEW_VISITORS_PER_IP_HOUR the network is flagged for an
// hour (chat_locks), and every visitor id on it younger than an hour (its issue
// time is signed in the cookie) shares one small bucket of model calls.
// Established visitors on the same network are unaffected.
//
// Shared counters unavailable (MongoDB down, before or during a request): in
// production nothing is admitted and no model is called (fail closed), so no
// instance can hand out allowance of its own.

import {
    IP_AI_LIMIT, IP_DAILY_LIMIT, IP_LIMIT, LOCK_TTL_MS, MINUTE_MS, NEW_VISITORS_HARD_PER_IP_HOUR, NEW_VISITORS_PER_IP_HOUR, NEWCOMER_AI_LIMIT,
    RATE_WINDOW_MS, REJECTS_PER_IP_MINUTE, REJECTS_PER_VISITOR_MINUTE, STATUS_PER_IP_MINUTE, STATUS_PER_VISITOR_MINUTE, VISITOR_DAILY_LIMIT,
    VISITOR_LIMIT, VISITOR_PER_MINUTE, YOUNG_VISITOR_MS,
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
const windowEnd = (t, ms) => Math.floor(t / ms) * ms + ms

/**
 * When can another message be accepted? Every exhausted window must have
 * reset, so it is the *latest* reset among them, not the first window that
 * refused: a spent minute and a spent day mean tomorrow, not in 20 seconds.
 * `rows`: [{ window, count, resetAt }]. Returns { at, scope } or null.
 */
export function retryOf(rows) {
    const spent = rows.filter((r) => r.count >= r.window.limit)
    if (!spent.length) return null
    const last = spent.reduce((a, b) => (b.resetAt > a.resetAt ? b : a))
    return { at: last.resetAt, scope: last.window.scope }
}

/**
 * What the visitor has left, from the counts of every window that applies.
 * `left` is the tightest (ties: the one that resets later); `day*` is the
 * daily allowance; `retryAt` is set when nothing is left (all spent windows
 * reset). Network numbers are not shown; a nearly used network only lowers
 * `left` (scope "network"). `serverNow` lets the page correct its own clock.
 */
export function quotaOf(visitorCounts, networkCounts = [], t = Date.now()) {
    const all = [...visitorCounts, ...networkCounts]
    const rows = all.map(({ window, count, resetAt }) => ({
        scope: window.scope, limit: window.limit, left: Math.max(0, window.limit - count), resetAt,
    }))
    const day = rows.find((r) => r.scope === 'day')
    const binding = rows.reduce((a, b) => (b.left < a.left || (b.left === a.left && b.resetAt > a.resetAt) ? b : a))
    const retry = retryOf(all)
    return {
        left: binding.left,
        limit: binding.scope === 'network' ? day?.limit || binding.limit : binding.limit,
        scope: retry ? retry.scope : binding.scope,
        resetAt: iso(retry ? retry.at : binding.resetAt),
        ...(retry ? { retryAt: iso(retry.at) } : {}),
        dayLeft: day ? day.left : null,
        dayLimit: day ? day.limit : null,
        dayResetAt: day ? iso(day.resetAt) : null,
        shared: true, // the allowance is shared by every conversation of this browser
        serverNow: iso(t),
    }
}

/** Production must not decide on per-instance counters (MongoDB unreachable). */
const degraded = (store, production, ...results) => Boolean(production)
    && (results.some((r) => r && r.shared === false) || store.healthy?.() === false)

const unavailable = (t) => ({ ok: false, status: 503, code: 'UNAVAILABLE', retryAt: iso(t + 30 * 1000), scope: 'service' })

/**
 * Issue a new visitor identity: the one place a new id is accepted, for every
 * path. It is counted per network per hour with one atomic take: past
 * NEW_VISITORS_HARD_PER_IP_HOUR no identity is issued at all; past
 * NEW_VISITORS_PER_IP_HOUR the network is flagged for an hour (cookie rotation,
 * see admitModel). The Set-Cookie header is written only once the id is
 * accepted, so a refused request never hands out a signed identity. A v1
 * cookie being migrated keeps its id and isn't counted again.
 * Returns null when accepted, else a refusal.
 */
export async function issueVisitor({ store, visitor, net, production, t, res }) {
    if (!visitor.isNew) {
        if (visitor.cookie) res?.setHeader?.('Set-Cookie', visitor.cookie)
        return null
    }
    const fresh = await store.take(`nv:${net}`, HOUR, NEW_VISITORS_HARD_PER_IP_HOUR, t)
    if (degraded(store, production, fresh)) return unavailable(t)
    if (!fresh.ok) return { ok: false, status: 429, code: 'RATE_LIMITED', retryAt: iso(fresh.resetAt), scope: 'network' }
    if (fresh.count > NEW_VISITORS_PER_IP_HOUR) await store.setUntil(`risk:${net}`, t + HOUR)
    if (visitor.cookie) res?.setHeader?.('Set-Cookie', visitor.cookie)
    return null
}

/**
 * Admit one message. Returns
 *   { ok: true, quota, flagged, release }             accepted (lease held)
 *   { ok: false, status, code, retryAt, scope }        refused
 * `release()` frees this request's lease (only its own).
 * Every counter is taken in the windows of one timestamp `t`, so a request
 * that crosses a minute or midnight gives back exactly what it took.
 */
export async function admit({ store, visitor, net, production, leaseId, now = Date.now, res }) {
    const t = now()
    const unshared = (...results) => degraded(store, production, ...results)

    // 1. A client already refused too often this minute: one read, nothing written.
    const [netRejects, visitorRejects] = await Promise.all([
        store.peek(`x:${net}`, MINUTE_MS, t),
        store.peek(`xv:${visitor.id}`, MINUTE_MS, t),
    ])
    if (unshared(netRejects, visitorRejects)) return unavailable(t)
    if (netRejects.count >= REJECTS_PER_IP_MINUTE || visitorRejects.count >= REJECTS_PER_VISITOR_MINUTE) {
        return { ok: false, status: 429, code: 'RATE_LIMITED', retryAt: iso(netRejects.resetAt), scope: 'minute' }
    }
    const rejected = () => Promise.all([store.count(`x:${net}`, MINUTE_MS, 1, t), store.count(`xv:${visitor.id}`, MINUTE_MS, 1, t)])

    // 2. A new identity is counted and bounded before it can use anything.
    const refusedId = await issueVisitor({ store, visitor, net, production, t, res })
    if (refusedId) {
        if (refusedId.status === 429) await rejected()
        return refusedId
    }

    // 3. One request at a time per visitor: a lease only this request can release.
    const lockKey = `lock:${visitor.id}`
    const leased = await store.acquire(lockKey, LOCK_TTL_MS, leaseId)
    if (unshared()) return unavailable(t)
    if (!leased) {
        await rejected()
        return { ok: false, status: 429, code: 'BUSY', retryAt: iso(t + 5000), scope: 'busy' }
    }
    const release = () => store.release(lockKey, leaseId).catch(() => {})

    // 4. Take every window, visitor first. If one is full, give back what was
    //    taken (in the same windows) and say when every spent window allows
    //    another message. These are separate atomic takes, not a transaction:
    //    a failure between them can leave a message counted in a window it
    //    never used, which errs towards the limit, never past it.
    const windows = [...visitorWindows(visitor.id), ...networkWindows(net)]
    const taken = []
    const giveBack = () => Promise.all(taken.map(({ window: w }) => store.count(w.key, w.ms, -1, t)))
    for (const window of windows) {
        const result = await store.take(window.key, window.ms, window.limit, t)
        if (unshared(result)) {
            await giveBack()
            await release()
            return unavailable(t)
        }
        if (!result.ok) {
            await giveBack()
            const unread = windows.filter((w) => w !== window && !taken.some((x) => x.window === w))
            const rest = await Promise.all(unread.map(async (w) => ({ window: w, ...(await store.peek(w.key, w.ms, t)) })))
            const retry = retryOf([
                { window, count: window.limit, resetAt: result.resetAt },
                ...rest,
                ...taken.map((x) => ({ ...x, count: x.count - 1 })),
            ])
            await rejected()
            await release()
            return { ok: false, status: 429, code: 'RATE_LIMITED', retryAt: iso(retry.at), scope: retry.scope }
        }
        taken.push({ window, count: result.count, resetAt: result.resetAt })
    }

    // 5. Cookie rotation: a young id on a flagged network. A risk state that
    //    can't be read (store degraded) is not proof the network is clean.
    let flagged = false
    if (visitor.young || (visitor.issuedMs && t - visitor.issuedMs < YOUNG_VISITOR_MS)) {
        flagged = (await store.getUntil(`risk:${net}`)) > t || unshared()
    }

    const quota = quotaOf(taken.filter(({ window }) => window.scope !== 'network'), taken.filter(({ window }) => window.scope === 'network'), t)
    return { ok: true, quota, flagged, release }
}

/**
 * May this message use a model (an embedding or a generation)? Counted once per
 * message, before the first model call: the network's model-message cap, and
 * for a young id on a flagged network the shared newcomer bucket. In
 * production a degraded store (MongoDB failed after admission) refuses: no
 * model call without authoritative counters.
 */
export async function admitModel({ store, net, flagged, production = false, t = Date.now() }) {
    const refuse = { ok: false, reason: 'shared counters unavailable' }
    if (degraded(store, production)) return refuse
    const units = await store.take(`ia:${net}`, RATE_WINDOW_MS, IP_AI_LIMIT, t)
    if (degraded(store, production, units)) return refuse
    if (!units.ok) return { ok: false, reason: 'network AI limit' }
    if (flagged) {
        const newcomers = await store.take(`ian:${net}`, RATE_WINDOW_MS, NEWCOMER_AI_LIMIT, t)
        if (degraded(store, production, newcomers)) return refuse
        if (!newcomers.ok) return { ok: false, reason: 'newcomer bucket used' }
    }
    return { ok: true }
}

/**
 * The visitor's current allowance without using any (opening the chat).
 * Bounded per network and per visitor per minute. A browser without a cookie
 * gets its identity here, through the same counted issuance as a message, so
 * a first message from several tabs finds one cookie already set.
 */
export async function quotaStatus({ store, visitor, net, production, now = Date.now, res }) {
    const t = now()
    const network = await store.take(`sn:${net}`, MINUTE_MS, STATUS_PER_IP_MINUTE, t)
    if (degraded(store, production, network)) return unavailable(t)
    if (!network.ok) return { ok: false, status: 429, code: 'RATE_LIMITED', retryAt: iso(network.resetAt), scope: 'network' }
    const refusedId = await issueVisitor({ store, visitor, net, production, t, res })
    if (refusedId) return refusedId
    if (!visitor.isNew) {
        const check = await store.take(`st:${visitor.id}`, MINUTE_MS, STATUS_PER_VISITOR_MINUTE, t)
        if (degraded(store, production, check)) return unavailable(t)
        if (!check.ok) return { ok: false, status: 429, code: 'RATE_LIMITED', retryAt: iso(check.resetAt), scope: 'minute' }
    }
    const read = (windows) => Promise.all(windows.map(async (window) => ({ window, ...(await store.peek(window.key, window.ms, t)) })))
    // A brand-new id has used nothing yet: no reads needed for it.
    const mine = visitor.isNew
        ? visitorWindows(visitor.id).map((window) => ({ window, count: 0, resetAt: windowEnd(t, window.ms) }))
        : await read(visitorWindows(visitor.id))
    const others = await read(networkWindows(net))
    if (degraded(store, production, ...mine, ...others)) return unavailable(t)
    return { ok: true, quota: quotaOf(mine, others, t) }
}

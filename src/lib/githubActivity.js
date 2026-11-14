// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// Last-known-good GitHub activity (D-094). The page always renders from one
// persisted value, never straight from a fetch:
//   1. the newer of the browser's stored copy and the committed seed,
//   2. replaced only by a refresh that succeeds and passes validation.
// A failed refresh (network, 4xx/5xx, malformed body) is logged and changes
// nothing. No React here, so it can be tested in Node.

import seed from '../data/githubActivitySeed.js'

export const ENDPOINT = '/api/github-activity'
/** Browser refresh interval; the CDN copy behind it refreshes every 30 min. */
export const REFRESH_MS = 15 * 60 * 1000
const STORAGE_KEY = 'gh_activity_lkg_v1'
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/

/** True only for a value every surface can print without "NaN"/"undefined". */
export function isValidActivity(value) {
    return Boolean(value)
        && Number.isInteger(value.count) && value.count >= 0
        && typeof value.asOf === 'string' && ISO_DAY.test(value.asOf)
        && (value.lastActive === null || (typeof value.lastActive === 'string' && ISO_DAY.test(value.lastActive)))
        && typeof value.updatedAt === 'string' && Number.isFinite(Date.parse(value.updatedAt))
}

const pick = ({ count, asOf, lastActive, updatedAt, source }) => ({ count, asOf, lastActive, updatedAt, source })

/** The valid value with the later `updatedAt`, or null when neither is valid. */
export function newerOf(a, b) {
    const okA = isValidActivity(a)
    const okB = isValidActivity(b)
    if (!okA) return okB ? b : null
    if (!okB) return a
    return Date.parse(a.updatedAt) >= Date.parse(b.updatedAt) ? a : b
}

function readStored(storage) {
    try {
        const raw = storage?.getItem(STORAGE_KEY)
        return raw ? JSON.parse(raw) : null
    } catch {
        return null
    }
}

/** What to render right now: stored copy or seed, whichever is newer. */
export function readLastKnownGood({ storage = globalThis.localStorage, fallback = seed } = {}) {
    return newerOf(readStored(storage), fallback)
}

/**
 * One background refresh. Resolves to the value to keep: the fresh one on
 * success, otherwise `current` unchanged. Never rejects.
 */
export async function refreshActivity(current, { fetchImpl = globalThis.fetch, storage = globalThis.localStorage, endpoint = ENDPOINT } = {}) {
    try {
        const res = await fetchImpl(endpoint, { headers: { Accept: 'application/json' } })
        if (res.status === 304) return current
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const body = await res.json()
        if (!isValidActivity(body)) throw new Error('malformed response')
        const fresh = pick(body)
        const kept = newerOf(fresh, current)
        if (kept === fresh) {
            try { storage?.setItem(STORAGE_KEY, JSON.stringify(fresh)) } catch { /* private mode */ }
        }
        return kept
    } catch (error) {
        console.warn('[github-activity] refresh failed, keeping last-known-good:', error?.message || error)
        return current
    }
}

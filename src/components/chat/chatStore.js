// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// Per-tab chat state in sessionStorage: a reload keeps the thread, a new tab
// starts fresh. The session id is stored apart from the thread. Storage can be
// missing or blocked, so every access is guarded and the chat still works.

const SESSION_KEY = 'gky_chat_session'
const THREAD_KEY = 'gky_chat_thread_v1'
const QUOTA_KEY = 'gky_chat_quota_v1'
export const MAX_TURNS = 30

const storage = () => {
    try { return window.sessionStorage } catch { return null }
}

const uuid = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
    // RFC 4122 v4 from getRandomValues (older Safari).
    const b = crypto.getRandomValues(new Uint8Array(16))
    b[6] = (b[6] & 0x0f) | 0x40
    b[8] = (b[8] & 0x3f) | 0x80
    const h = [...b].map((x) => x.toString(16).padStart(2, '0')).join('')
    return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`
}

let memorySession = null
export function getSessionId() {
    const store = storage()
    try {
        const existing = store?.getItem(SESSION_KEY)
        if (existing) return existing
        const id = uuid()
        store?.setItem(SESSION_KEY, id)
        return id
    } catch {
        memorySession = memorySession || uuid()
        return memorySession
    }
}

/**
 * "New chat": a fresh id, so the server's memory of the conversation starts
 * over too. It is only a conversation id: the allowance stays the visitor's.
 */
export function resetSession() {
    memorySession = null
    try { storage()?.removeItem(SESSION_KEY) } catch { /* ignore */ }
    return getSessionId()
}

/** Status patch for a turn cut off mid-stream: kept if it has text, else an error. */
export const interrupted = (answer) => (answer
    ? { status: 'stopped', error: undefined }
    : { status: 'error', error: 'DEFAULT' })

export function readThread() {
    try {
        const raw = storage()?.getItem(THREAD_KEY)
        const turns = raw ? JSON.parse(raw) : []
        if (!Array.isArray(turns)) return []
        // A turn left mid-stream by a reload is shown as interrupted, not pending.
        return turns.map((t) => (t.status === 'streaming' || t.status === 'pending' ? { ...t, ...interrupted(t.a) } : t))
    } catch {
        return []
    }
}

export function writeThread(turns) {
    try {
        storage()?.setItem(THREAD_KEY, JSON.stringify(turns.slice(-MAX_TURNS)))
    } catch { /* quota or blocked storage: the thread just isn't kept */ }
}

export const clearThread = () => {
    try { storage()?.removeItem(THREAD_KEY) } catch { /* ignore */ }
}

// The allowance belongs to the browser, not the tab (D-134): the last quota the
// server reported is shared across tabs through localStorage, so every tab
// shows the same lock. It is only a display: the server enforces the limits,
// and the chat asks it again (op: "status") whenever it opens.
const sharedStorage = () => {
    try { return window.localStorage } catch { return null }
}

/**
 * What the visitor has left ({ left, limit, scope, resetAt, dayLeft, dayLimit,
 * dayResetAt }) and, once a limit is hit, until when the composer is locked
 * ({ until, scope }).
 */
export function readQuota() {
    try {
        const value = JSON.parse(sharedStorage()?.getItem(QUOTA_KEY) || 'null')
        if (!value || typeof value !== 'object') return {}
        // A window that has already reset (or a lock that has ended) says nothing now.
        const ends = Date.parse(value.until || value.dayResetAt || value.resetAt || '') || 0
        return ends > Date.now() ? value : {}
    } catch {
        return {}
    }
}

export function writeQuota(value) {
    try { sharedStorage()?.setItem(QUOTA_KEY, JSON.stringify(value || {})) } catch { /* ignore */ }
}

/**
 * A quota from the server, on this browser's clock (D-136): its times are
 * shifted by the difference between the server's clock (`serverNow`) and this
 * one, `until` is set when nothing is left (from `retryAt`, the time every
 * spent limit allows another message), and `seen` orders updates.
 */
export function fromServer(quota, localNow = Date.now()) {
    if (!quota || typeof quota.left !== 'number') return null
    const serverNow = Date.parse(quota.serverNow || '') || localNow
    const shift = (iso) => (iso ? new Date(Date.parse(iso) + (localNow - serverNow)).toISOString() : iso)
    const out = { ...quota, resetAt: shift(quota.resetAt), retryAt: shift(quota.retryAt), dayResetAt: shift(quota.dayResetAt), seen: serverNow }
    return out.left > 0 ? { ...out, until: null } : { ...out, until: out.retryAt || out.resetAt }
}

/** Keep the newer of two quotas (by server time): a late, older reply never overwrites a newer one. */
export const newerQuota = (current, next) => (!next ? current : !current?.seen || (next.seen || 0) >= current.seen ? next : current)

/** Call `fn` when another tab records a new quota. Returns an unsubscribe function. */
export function onQuotaChange(fn) {
    if (typeof window === 'undefined') return () => {}
    const listener = (event) => { if (event.key === QUOTA_KEY) fn(readQuota()) }
    window.addEventListener('storage', listener)
    return () => window.removeEventListener('storage', listener)
}

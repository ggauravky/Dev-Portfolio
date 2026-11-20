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

/** "New chat": a fresh id, so the server's memory of the conversation starts over too. */
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

/**
 * What the visitor has left ({ left, limit, resetAt }) and, once a limit is
 * hit, until when the composer is locked ({ until, scope }). Kept per tab so a
 * reload still shows the lock; the server enforces it either way.
 */
export function readQuota() {
    try {
        const value = JSON.parse(storage()?.getItem(QUOTA_KEY) || 'null')
        if (!value || typeof value !== 'object') return {}
        // A window that has already reset (or a lock that has ended) says nothing now.
        const ends = Date.parse(value.until || value.resetAt || '') || 0
        return ends > Date.now() ? value : {}
    } catch {
        return {}
    }
}

export function writeQuota(value) {
    try { storage()?.setItem(QUOTA_KEY, JSON.stringify(value || {})) } catch { /* ignore */ }
}

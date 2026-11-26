// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// Client for POST /api/chat (D-103, D-134). Once a question is admitted, NDJSON lines:
//   {"t":"delta","v":"…"} … {"t":"done","sources":[…],"followUps":[…],"quota":{…}}
// done may also carry citations {n: {title,url}}, unverified (count), cut with
// interrupted ("length"|"interrupted"), and clarify {choices}.
// Refused before any work, a JSON error: 429 RATE_LIMITED (with retryAt and
// scope) → onLimit, 429 BUSY → onBusy, 503 UNAVAILABLE → an error with retryAt.
// The server is the authority on limits; this only reports what it says.

export const CHAT_URL = '/api/chat'

const timeZone = () => {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone || undefined } catch { return undefined }
}

const readJson = async (res) => {
    try { return await res.json() } catch { return null }
}

export async function streamChat({ sessionId, question, signal, onDelta, onDone, onLimit, onBusy, fetchImpl = fetch }) {
    const res = await fetchImpl(CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // The visitor's time zone, for "what did we talk about today?".
        body: JSON.stringify({ sessionId, question, tz: timeZone() }),
        // The anonymous visitor cookie is HttpOnly and same-origin (D-113).
        credentials: 'same-origin',
        signal,
    })
    if (!res.ok || !res.body) {
        const body = await readJson(res)
        const code = body?.error?.code || `HTTP_${res.status}`
        if (res.status === 429 && code === 'BUSY') return onBusy?.()
        if (res.status === 429) {
            // Retry-After (seconds) is relative, so this browser's clock can't skew it.
            const after = Number(res.headers?.get?.('retry-after'))
            const retryAt = Number.isFinite(after) && after > 0 ? new Date(Date.now() + after * 1000).toISOString() : body?.retryAt || new Date(Date.now() + 60 * 1000).toISOString()
            return onLimit?.(retryAt, body?.scope || 'window')
        }
        const error = new Error(code)
        error.code = code
        error.retryAt = body?.retryAt || null
        throw error
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let finished = false
    const handle = (line) => {
        if (!line.trim()) return
        let event
        try { event = JSON.parse(line) } catch { return }
        if (event.t === 'delta' && typeof event.v === 'string') onDelta?.(event.v)
        else if (event.t === 'done') {
            finished = true
            onDone?.({
                sources: event.sources || [],
                followUps: event.followUps || [],
                quota: event.quota || null,
                citations: event.citations || {},
                unverified: Number(event.unverified) || 0,
                cut: Boolean(event.cut),
                interrupted: event.interrupted || '',
                clarify: event.clarify || null,
            })
        } else if (event.t === 'limit') {
            // Older servers sent limits in the stream.
            finished = true
            onLimit?.(event.retryAt, event.scope || 'window')
        } else if (event.t === 'busy') {
            finished = true
            onBusy?.()
        }
    }
    for (;;) {
        const { value, done } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        let newline
        while ((newline = buffer.indexOf('\n')) >= 0) {
            handle(buffer.slice(0, newline))
            buffer = buffer.slice(newline + 1)
        }
    }
    handle(buffer)
    // The connection ended without a `done`: an interrupted answer.
    if (!finished) onDone?.({ sources: [], followUps: [], cut: true, interrupted: 'interrupted' })
    return undefined
}

/**
 * The visitor's current allowance from the server, without spending any (D-134).
 * Returns the quota object, or null when it can't be read.
 */
export async function fetchQuota({ sessionId, fetchImpl = fetch, signal } = {}) {
    try {
        const res = await fetchImpl(CHAT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId, op: 'status' }),
            credentials: 'same-origin',
            signal,
        })
        if (!res.ok) return null
        const body = await readJson(res)
        return body?.quota || null
    } catch {
        return null
    }
}

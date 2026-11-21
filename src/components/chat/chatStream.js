// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// Client for POST /api/chat (D-103 protocol): NDJSON lines
//   {"t":"delta","v":"…"} … {"t":"done","sources":[…],"followUps":[…],"quota":{left,limit,resetAt}}
//   or {"t":"limit","retryAt":"ISO","scope":"window"|"day"}, or {"t":"busy"}
// done may also carry citations {n: {title,url}}, unverified (count) and cut.
// Calls onDelta / onDone / onLimit; rejects on network or HTTP errors.

export const CHAT_URL = '/api/chat'

export async function streamChat({ sessionId, question, history, signal, onDelta, onDone, onLimit, onBusy, fetchImpl = fetch }) {
    const res = await fetchImpl(CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, question, history }),
        // The anonymous visitor cookie is HttpOnly and same-origin (D-113).
        credentials: 'same-origin',
        signal,
    })
    if (!res.ok || !res.body) {
        let code = `HTTP_${res.status}`
        try { code = (await res.json())?.error?.code || code } catch { /* not JSON */ }
        const error = new Error(code)
        error.code = code
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
            })
        } else if (event.t === 'limit') {
            finished = true
            onLimit?.(event.retryAt, event.scope === 'day' ? 'day' : 'window')
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
    if (!finished) onDone?.({ sources: [], followUps: [], cut: true })
}

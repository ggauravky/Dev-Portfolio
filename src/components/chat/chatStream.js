// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// Client for POST /api/chat (D-103 protocol): NDJSON lines
//   {"t":"delta","v":"…"} … {"t":"done","sources":[…],"followUps":[…]}
//   or {"t":"limit","retryAt":"ISO"}
// Calls onDelta / onDone / onLimit; rejects on network or HTTP errors.

export const CHAT_URL = '/api/chat'

export async function streamChat({ sessionId, question, history, signal, onDelta, onDone, onLimit, fetchImpl = fetch }) {
    const res = await fetchImpl(CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, question, history }),
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
        else if (event.t === 'done') { finished = true; onDone?.({ sources: event.sources || [], followUps: event.followUps || [] }) }
        else if (event.t === 'limit') { finished = true; onLimit?.(event.retryAt) }
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

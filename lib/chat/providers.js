// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// Provider chain (D-098): Groq first, Gemini second, then a templated answer
// built from the top chunks, so the chat never dead-ends. Plain fetch, no SDKs.
// A provider is skipped on a missing key, a spent daily budget, a non-2xx
// response, a timeout before the first token, or an empty stream. Once text has
// been sent, a failure ends the reply with a short note instead of switching
// providers mid-sentence.

import {
    EMBED_DIM, EMBED_MODEL, EMBED_TIMEOUT_MS, GEMINI_BASE, GEMINI_MODEL, GROQ_MODEL, GROQ_URL,
    MAX_OUTPUT_TOKENS, PROVIDER_TIMEOUT_MS, STREAM_IDLE_MS, TEMPERATURE,
} from './config.js'

export class ProviderError extends Error {
    constructor(provider, message, status = 0) {
        super(`${provider}: ${message}`)
        this.provider = provider
        this.status = status
    }
}

// ── Embeddings (Gemini) ───────────────────────────────────────────────────

/** Embed one visitor question. Returns a number[] or null (never throws). */
export async function embedQuery(text, { key, fetchImpl = fetch, timeoutMs = EMBED_TIMEOUT_MS } = {}) {
    if (!key || !text) return null
    try {
        const res = await fetchImpl(`${GEMINI_BASE}/${EMBED_MODEL}:embedContent`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
            body: JSON.stringify({
                content: { parts: [{ text }] },
                taskType: 'RETRIEVAL_QUERY',
                outputDimensionality: EMBED_DIM,
            }),
            signal: AbortSignal.timeout(timeoutMs),
        })
        if (!res.ok) return null
        const values = (await res.json())?.embedding?.values
        return Array.isArray(values) && values.length === EMBED_DIM ? values : null
    } catch {
        return null
    }
}

const sleep = (ms) => new Promise((resolve) => { setTimeout(resolve, ms) })

/**
 * Embed texts in batches (index builder only). Throws on failure.
 * `taskType`: RETRIEVAL_DOCUMENT for chunks, RETRIEVAL_QUERY for FAQ question
 * keys (compared with visitors' questions, which are embedded the same way).
 * The free tier returns 429 near 100 texts a minute, so a 429 waits and retries.
 */
export async function embedDocuments(items, {
    key, fetchImpl = fetch, batchSize = 40, taskType = 'RETRIEVAL_DOCUMENT', retries = 6, wait = sleep, onProgress = () => {},
} = {}) {
    if (!key) throw new Error('GEMINI_API_KEY is required to embed the corpus')
    const out = []
    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize)
        let res
        for (let attempt = 0; ; attempt += 1) {
            res = await fetchImpl(`${GEMINI_BASE}/${EMBED_MODEL}:batchEmbedContents`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
                body: JSON.stringify({
                    requests: batch.map((item) => ({
                        model: `models/${EMBED_MODEL}`,
                        content: { parts: [{ text: item.text }] },
                        taskType,
                        ...(taskType === 'RETRIEVAL_DOCUMENT' && item.title ? { title: item.title } : {}),
                        outputDimensionality: EMBED_DIM,
                    })),
                }),
                signal: AbortSignal.timeout(30000),
            })
            if (res.status !== 429 || attempt >= retries) break
            const delay = Number(String(await res.text()).match(/"retryDelay":\s*"(\d+)s"/)?.[1] || 30)
            onProgress(`rate limited, waiting ${delay + 2}s`)
            await wait((delay + 2) * 1000)
        }
        if (!res.ok) throw new Error(`batchEmbedContents HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`)
        const embeddings = (await res.json())?.embeddings
        if (!Array.isArray(embeddings) || embeddings.length !== batch.length) throw new Error('batchEmbedContents: unexpected shape')
        for (const embedding of embeddings) {
            if (!Array.isArray(embedding?.values) || embedding.values.length !== EMBED_DIM) throw new Error('embedding: wrong dimension')
            out.push(embedding.values)
        }
        onProgress(`${out.length}/${items.length}`)
    }
    return out
}

// ── Streaming helpers ─────────────────────────────────────────────────────

/** Yield each `data:` payload of a server-sent-events body. */
async function* sseData(body) {
    const decoder = new TextDecoder()
    let buffer = ''
    for await (const part of body) {
        buffer += decoder.decode(part, { stream: true })
        let newline
        while ((newline = buffer.indexOf('\n')) >= 0) {
            const row = buffer.slice(0, newline).replace(/\r$/, '')
            buffer = buffer.slice(newline + 1)
            if (row.startsWith('data:')) yield row.slice(5).trim()
        }
    }
    const last = buffer.trim()
    if (last.startsWith('data:')) yield last.slice(5).trim()
}

/**
 * Wrap a provider stream with a first-token timeout and an idle timeout. The
 * controller aborts the upstream fetch when either fires.
 */
async function* withTimeouts(name, controller, source, firstMs, idleMs) {
    let timer = null
    const arm = (ms) => {
        clearTimeout(timer)
        timer = setTimeout(() => controller.abort(new ProviderError(name, `timeout after ${ms} ms`)), ms)
    }
    arm(firstMs)
    try {
        for await (const text of source) {
            arm(idleMs)
            yield text
        }
    } catch (error) {
        throw controller.signal.aborted && controller.signal.reason instanceof ProviderError ? controller.signal.reason : error
    } finally {
        clearTimeout(timer)
    }
}

async function openStream(name, fetchImpl, url, init, controller) {
    let res
    try {
        res = await fetchImpl(url, { ...init, signal: controller.signal })
    } catch (error) {
        throw controller.signal.reason instanceof ProviderError ? controller.signal.reason : new ProviderError(name, error?.message || 'network error')
    }
    if (!res.ok || !res.body) {
        let detail = ''
        try { detail = (await res.text()).slice(0, 200) } catch { /* ignore */ }
        throw new ProviderError(name, `HTTP ${res.status} ${detail}`.trim(), res.status)
    }
    return res.body
}

// ── Providers ─────────────────────────────────────────────────────────────

async function* groqTokens(messages, { key, fetchImpl, controller }) {
    const body = await openStream('groq', fetchImpl, GROQ_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify({
            model: GROQ_MODEL,
            messages,
            stream: true,
            temperature: TEMPERATURE,
            max_completion_tokens: MAX_OUTPUT_TOKENS,
            reasoning_effort: 'low',
        }),
    }, controller)
    for await (const data of sseData(body)) {
        if (data === '[DONE]') return
        let json
        try { json = JSON.parse(data) } catch { continue }
        if (json?.error) throw new ProviderError('groq', json.error.message || 'stream error')
        // Only the answer text; gpt-oss reasoning arrives in a separate field.
        const text = json?.choices?.[0]?.delta?.content
        if (text) yield text
    }
}

async function* geminiTokens(messages, { key, fetchImpl, controller }) {
    const system = messages.find((m) => m.role === 'system')?.content || ''
    const user = messages.filter((m) => m.role === 'user').map((m) => m.content).join('\n\n')
    const body = await openStream('gemini', fetchImpl, `${GEMINI_BASE}/${GEMINI_MODEL}:streamGenerateContent?alt=sse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify({
            systemInstruction: { parts: [{ text: system }] },
            contents: [{ role: 'user', parts: [{ text: user }] }],
            generationConfig: { temperature: TEMPERATURE, maxOutputTokens: MAX_OUTPUT_TOKENS },
        }),
    }, controller)
    for await (const data of sseData(body)) {
        let json
        try { json = JSON.parse(data) } catch { continue }
        if (json?.error) throw new ProviderError('gemini', json.error.message || 'stream error')
        const parts = json?.candidates?.[0]?.content?.parts || []
        const text = parts.filter((p) => !p.thought).map((p) => p.text || '').join('')
        if (text) yield text
    }
}

export const PROVIDERS = [
    { name: 'groq', keyName: 'groqKey', tokens: groqTokens },
    { name: 'gemini', keyName: 'geminiKey', tokens: geminiTokens },
]

// ── Template (no LLM) ─────────────────────────────────────────────────────

/** Answer built only from retrieved chunks: titles, one line each, links. */
export function templateAnswer(chunks, { matched = true } = {}) {
    if (!matched || chunks.length === 0) {
        return "I don't have anything on that in Gaurav's site. I can answer questions about his projects, his journey (education, internships, hackathons), his skills, his services and his blog posts."
    }
    // A close FAQ match leads the context (withFaq). It may answer a slightly
    // different question, so say which one: the owner's own words, labelled.
    if (chunks[0].faq && chunks[0].faqScore) {
        return `The closest question Gaurav has answered is “${chunks[0].faq.question}”\n\n${chunks[0].faq.answer}`
    }
    // Only the strongest matches: a template can't weigh relevance like a model.
    const best = chunks[0].score || 0
    // One row per project or section, and FAQ text is not a page summary.
    const groups = new Set()
    const strong = chunks
        .filter((chunk) => (!best || (chunk.score || 0) >= best * 0.85) && chunk.type !== 'faq')
        .filter((chunk) => !groups.has(chunk.group || chunk.id) && groups.add(chunk.group || chunk.id))
        .slice(0, 3)
    if (!strong.length) {
        // Only FAQ entries matched: the best one, labelled, beats "nothing found".
        const faq = chunks.find((chunk) => chunk.faq)
        return faq
            ? `The closest question Gaurav has answered is “${faq.faq.question}”\n\n${faq.faq.answer}`
            : templateAnswer([], { matched: false })
    }
    const rows = strong.map((chunk) => `- **${chunk.title.split(':')[0]}**: ${chunk.summary || chunk.title}${chunk.url ? ` (${chunk.url})` : ''}`)
    return `Here's what the site has on that:\n${rows.join('\n')}`
}

/**
 * Stream an answer through the chain. Yields `{ provider }` once, when a
 * provider produces its first token (or 'template'), then text strings.
 * `allow(name)` is an async budget check; `onSkip(name, reason)` logs.
 */
export async function* generateAnswer({
    messages, chunks, matched, confident = true, keys, fetchImpl = fetch, allow = async () => true, onSkip = () => {},
    firstTokenMs = PROVIDER_TIMEOUT_MS, idleMs = STREAM_IDLE_MS, signal,
}) {
    if (matched) {
        for (const provider of PROVIDERS) {
            const key = keys?.[provider.keyName]
            if (!key) { onSkip(provider.name, 'no key'); continue }
            if (!(await allow(provider.name))) { onSkip(provider.name, 'budget (daily or per-minute)'); continue }
            if (signal?.aborted) return

            const controller = new AbortController()
            const stopUpstream = () => controller.abort(new ProviderError(provider.name, 'client closed'))
            signal?.addEventListener('abort', stopUpstream, { once: true })
            let started = false
            try {
                const source = provider.tokens(messages, { key, fetchImpl, controller })
                for await (const text of withTimeouts(provider.name, controller, source, firstTokenMs, idleMs)) {
                    if (!started) {
                        started = true
                        yield { provider: provider.name }
                    }
                    yield text
                }
                if (started) return
                onSkip(provider.name, 'empty stream')
            } catch (error) {
                if (signal?.aborted) return
                if (started) {
                    onSkip(provider.name, `cut off: ${error?.message || error}`)
                    yield '\n\n(The answer was cut short. Please ask again.)'
                    return
                }
                onSkip(provider.name, error?.message || String(error))
            } finally {
                signal?.removeEventListener('abort', stopUpstream)
            }
        }
    }
    yield { provider: 'template' }
    yield templateAnswer(chunks, { matched: matched && confident })
}

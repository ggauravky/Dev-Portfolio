// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// Free-tier quota manager (D-113, D-134). Every model and embedding call goes
// through here first, so the site's shared free quotas are spent fairly and
// never exhausted by a burst:
// - only providers in the PROVIDERS table (all free tier), in the configured
//   order, with a key, can be used
// - requests are counted per minute and per UTC day, per provider
// - tokens are reserved before a call (a conservative estimate) and corrected
//   afterwards with the usage the provider reports
// - a 429/503 sets a shared cooldown (from the provider's retry hint)
// - a site-wide cap on generations starting per 10 s stands in for a
//   concurrency limit (no lease to leak on serverless)
//
// Reservations are tickets (D-134). A ticket remembers the windows it was
// counted in (its minute and its UTC day), so settling a call that crossed a
// minute or midnight corrects the right counters, and it settles once: a
// second settle or release does nothing. Tokens go back only when the call
// certainly used none (refused, or the provider answered with an error before
// generating). A timeout, an empty stream or a cut stream keeps the whole
// estimate unless the provider reported its usage. Counters never go below 0
// (store.js). The keys (`q:<provider>:<metric>`) are the ones the Admin
// Portal's operations view reads, unchanged.
//
// Shared counters unavailable (MongoDB down): production refuses every call
// (the handler normally fails closed before getting here); outside production
// each instance may make EMERGENCY_AI_PER_MINUTE calls.

import {
    DEFAULT_COOLDOWN_MS, DEFAULT_PROVIDER_ORDER, EMBED_PROVIDER, EMERGENCY_AI_PER_MINUTE, GEN_STARTS_PER_10S, MAX_OUTPUT_TOKENS, PROVIDERS,
} from './config.js'

const MINUTE = 60 * 1000
const DAY_MS = 24 * 60 * MINUTE
const TEN_SECONDS = 10 * 1000
const dayKey = (now) => new Date(now).toISOString().slice(0, 10)

/**
 * A cautious token estimate for the prompt plus the whole output cap (the
 * answer is usually shorter). Latin text runs near 4 characters a token;
 * Devanagari and other scripts tokenise far denser, so they count about one
 * token per 1.5 characters. The reported usage replaces it after the call.
 */
export function estimateTokens(messages, maxOutput = MAX_OUTPUT_TOKENS) {
    let latin = 0
    let other = 0
    for (const m of messages || []) {
        for (const ch of String(m?.content || '')) {
            if (ch.charCodeAt(0) < 0x0250) latin += 1
            else other += 1
        }
    }
    return Math.ceil(latin / 4 + other / 1.5) + maxOutput
}

/** Providers usable now, in order: known, free tier, enabled, with a key. */
export function activeProviders(env) {
    return (env.providerOrder || DEFAULT_PROVIDER_ORDER).filter((name) => PROVIDERS[name]?.freeTier && env[PROVIDERS[name].keyName])
}

// Emergency mode (MongoDB unreachable, outside production only): a counter for
// this whole instance. Module-level on purpose: a quota manager is made per
// request, and the allowance must hold across all requests a warm instance serves.
const emergency = { window: 0, count: 0 }

export function createQuota({ store, now = () => Date.now(), log = () => {}, production = false }) {
    const emergencyAllows = () => {
        const w = Math.floor(now() / MINUTE)
        if (w !== emergency.window) { emergency.window = w; emergency.count = 0 }
        emergency.count += 1
        return emergency.count <= EMERGENCY_AI_PER_MINUTE
    }

    const state = { emergency: false, calls: 0 }

    async function cooling(name) {
        const until = await store.getUntil(`cool:${name}`)
        return until > now() ? until : 0
    }

    // Add `amount` tokens to the ticket's own windows (never below zero).
    const adjust = (ticket, amount) => Promise.all([
        store.count(`q:${ticket.name}:tpm`, MINUTE, amount, ticket.at),
        store.count(`q:${ticket.name}:tpd:${ticket.day}`, DAY_MS, amount, ticket.at),
    ])

    /**
     * Reserve one call. Returns a ticket { ok, reason, reserved, name, at, day }.
     * Pass the ticket to settle() or release() exactly once (later calls do nothing).
     */
    async function reserve(name, { tokens = 0, generation = true } = {}) {
        const limits = name === 'embed' ? EMBED_PROVIDER : PROVIDERS[name]
        if (!limits?.freeTier) return { ok: false, reason: 'not a free-tier model' }
        const until = await cooling(name)
        if (until) return { ok: false, reason: `cooling down until ${new Date(until).toISOString()}` }
        const t = now()
        const counted = Boolean(tokens && limits.tpm)
        const none = Promise.resolve(null)
        const [rpm, rpd, tpm, tpd, starts] = await Promise.all([
            store.count(`q:${name}:rpm`, MINUTE, 1, t),
            store.count(`q:${name}:rpd:${dayKey(t)}`, DAY_MS, 1, t),
            counted ? store.count(`q:${name}:tpm`, MINUTE, tokens, t) : none,
            counted ? store.count(`q:${name}:tpd:${dayKey(t)}`, DAY_MS, tokens, t) : none,
            generation ? store.count('q:gen:starts', TEN_SECONDS, 1, t) : none,
        ])
        const ticket = { ok: true, name, at: t, day: dayKey(t), reserved: counted ? tokens : 0, done: false }
        // Not shared (MongoDB down): production refuses; elsewhere a small per-instance allowance.
        if ([rpm, rpd, tpm, tpd, starts].some((c) => c && c.shared === false)) {
            state.emergency = true
            if (production) return { ok: false, reason: 'shared counters unavailable' }
            return emergencyAllows() ? { ...ticket, reserved: 0, emergency: true } : { ok: false, reason: 'emergency mode: instance allowance used' }
        }
        state.emergency = false
        const refuse = async (reason) => {
            // A refused call makes no request and uses no tokens: give back every
            // count it took, in its own windows, so refusals can't wear down the
            // daily request budget or the generation starts (stabilization F07).
            await Promise.all([
                ticket.reserved ? adjust(ticket, -ticket.reserved) : null,
                store.count(`q:${name}:rpm`, MINUTE, -1, t),
                store.count(`q:${name}:rpd:${ticket.day}`, DAY_MS, -1, t),
                generation ? store.count('q:gen:starts', TEN_SECONDS, -1, t) : null,
            ])
            ticket.done = true
            return { ok: false, reason }
        }
        if (rpm.count > limits.rpm) return refuse('requests per minute')
        if (rpd.count > limits.rpd) return refuse('requests per day')
        if (tpm && tpm.count > limits.tpm) return refuse('tokens per minute')
        if (tpd && tpd.count > limits.tpd) return refuse('tokens per day')
        if (starts && starts.count > GEN_STARTS_PER_10S) return refuse('too many generations at once')
        state.calls += 1
        return ticket
    }

    /** Give the reservation back: only for a call that certainly used no tokens. */
    async function release(ticket) {
        if (!ticket?.ok || ticket.done) return
        ticket.done = true
        if (!ticket.reserved || ticket.emergency) return
        await adjust(ticket, -ticket.reserved)
    }

    /**
     * Replace the estimate with the reported usage. Unknown usage keeps the
     * whole estimate (the conservative choice): it is never given back.
     */
    async function settle(ticket, used) {
        if (!ticket?.ok || ticket.done) return
        ticket.done = true
        if (!ticket.reserved || ticket.emergency || !Number.isFinite(used) || used <= 0) return
        const delta = Math.round(used - ticket.reserved)
        if (delta) await adjust(ticket, delta)
    }

    /** A shared cooldown after a 429/503, from the provider's retry hint. */
    async function cooldown(name, ms = DEFAULT_COOLDOWN_MS, reason = '') {
        const wait = Math.min(Math.max(ms || DEFAULT_COOLDOWN_MS, 1000), 60 * MINUTE)
        await store.setUntil(`cool:${name}`, now() + wait)
        log('chat.provider.cooldown', { provider: name, ms: wait, reason: String(reason).slice(0, 120) })
    }

    return { reserve, settle, release, cooldown, state }
}

/** Milliseconds to wait from a provider's 429 response (headers or body). */
export function retryHintMs(error) {
    const headers = error?.headers || {}
    const seconds = Number(headers['retry-after'])
    if (Number.isFinite(seconds) && seconds > 0) return seconds * 1000
    // Groq: "1m26.4s", "779ms"
    const reset = String(headers['x-ratelimit-reset-tokens'] || headers['x-ratelimit-reset-requests'] || '')
    const m = reset.match(/^(?:(\d+)m)?(?:([\d.]+)s)?(?:(\d+)ms)?$/)
    if (reset && m) return ((Number(m[1] || 0) * 60) + Number(m[2] || 0)) * 1000 + Number(m[3] || 0)
    // Gemini: "retryDelay": "17s" in the error body
    const delay = String(error?.detail || error?.message || '').match(/"retryDelay":\s*"(\d+(?:\.\d+)?)s"/)
    if (delay) return Number(delay[1]) * 1000
    return 0
}

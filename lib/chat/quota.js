// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// Free-tier quota manager (D-113). Every model and embedding call goes
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
// - when the counters aren't shared (MongoDB down), each instance may make
//   only EMERGENCY_AI_PER_MINUTE model calls
// Counters are fixed windows in the store (atomic $inc).

import {
    DEFAULT_COOLDOWN_MS, DEFAULT_PROVIDER_ORDER, EMBED_PROVIDER, EMERGENCY_AI_PER_MINUTE, GEN_STARTS_PER_10S, MAX_OUTPUT_TOKENS, PROVIDERS,
} from './config.js'

const MINUTE = 60 * 1000
const DAY_MS = 24 * 60 * MINUTE
const TEN_SECONDS = 10 * 1000
const dayKey = (now) => new Date(now).toISOString().slice(0, 10)

/**
 * A cautious token estimate: ~4 characters a token for the prompt, plus the
 * whole output cap (the answer is usually shorter). The provider's reported
 * usage replaces it after the call (settle).
 */
export const estimateTokens = (messages, maxOutput = MAX_OUTPUT_TOKENS) => Math.ceil(
    (messages || []).reduce((sum, m) => sum + String(m?.content || '').length, 0) / 4,
) + maxOutput

/** Providers usable now, in order: known, free tier, enabled, with a key. */
export function activeProviders(env) {
    return (env.providerOrder || DEFAULT_PROVIDER_ORDER).filter((name) => PROVIDERS[name]?.freeTier && env[PROVIDERS[name].keyName])
}

// Emergency mode (MongoDB unreachable): a counter for this whole instance.
// Module-level on purpose: a quota manager is made per request, and the
// allowance must hold across all requests a warm instance serves.
const emergency = { window: 0, count: 0 }

export function createQuota({ store, now = () => Date.now(), log = () => {} }) {
    const emergencyAllows = () => {
        const w = Math.floor(now() / MINUTE)
        if (w !== emergency.window) { emergency.window = w; emergency.count = 0 }
        emergency.count += 1
        return emergency.count <= EMERGENCY_AI_PER_MINUTE
    }

    const state = { emergency: false }

    async function cooling(name) {
        const until = await store.getUntil(`cool:${name}`)
        return until > now() ? until : 0
    }

    /**
     * Reserve one call. Returns { ok, reason, reserved } — `reserved` is the
     * token estimate to settle later. Counting happens even when the answer
     * is no, which only errs towards caution.
     */
    async function reserve(name, { tokens = 0, generation = true } = {}) {
        const limits = name === 'embed' ? EMBED_PROVIDER : PROVIDERS[name]
        if (!limits?.freeTier) return { ok: false, reason: 'not a free-tier model' }
        const until = await cooling(name)
        if (until) return { ok: false, reason: `cooling down until ${new Date(until).toISOString()}` }
        const t = now()
        const counted = tokens && limits.tpm
        const none = Promise.resolve(null)
        const [rpm, rpd, tpm, tpd, starts] = await Promise.all([
            store.count(`q:${name}:rpm`, MINUTE),
            store.count(`q:${name}:rpd:${dayKey(t)}`, DAY_MS),
            counted ? store.count(`q:${name}:tpm`, MINUTE, tokens) : none,
            counted ? store.count(`q:${name}:tpd:${dayKey(t)}`, DAY_MS, tokens) : none,
            generation ? store.count('q:gen:starts', TEN_SECONDS) : none,
        ])
        // Not shared (MongoDB down): trust only the per-instance emergency allowance.
        if ([rpm, rpd, tpm, tpd, starts].some((c) => c && c.shared === false)) {
            state.emergency = true
            return emergencyAllows() ? { ok: true, reserved: 0, emergency: true } : { ok: false, reason: 'emergency mode: instance allowance used' }
        }
        state.emergency = false
        const refuse = async (reason) => {
            // A refused call uses no tokens: give the reservation back.
            if (counted) await release(name, tokens)
            return { ok: false, reason }
        }
        if (rpm.count > limits.rpm) return refuse('requests per minute')
        if (rpd.count > limits.rpd) return refuse('requests per day')
        if (tpm && tpm.count > limits.tpm) return refuse('tokens per minute')
        if (tpd && tpd.count > limits.tpd) return refuse('tokens per day')
        if (starts && starts.count > GEN_STARTS_PER_10S) return refuse('too many generations at once')
        return { ok: true, reserved: counted ? tokens : 0 }
    }

    /** Give back a reservation that was never used (refused or failed call). */
    async function release(name, reserved) {
        if (!reserved || state.emergency) return
        const t = now()
        await Promise.all([
            store.count(`q:${name}:tpm`, MINUTE, -reserved),
            store.count(`q:${name}:tpd:${dayKey(t)}`, DAY_MS, -reserved),
        ])
    }

    /** Replace the estimate with the reported usage (may give tokens back). */
    async function settle(name, reserved, used) {
        if (!reserved || !Number.isFinite(used) || used <= 0 || state.emergency) return
        const delta = Math.round(used - reserved)
        if (!delta) return
        const t = now()
        await Promise.all([
            store.count(`q:${name}:tpm`, MINUTE, delta),
            store.count(`q:${name}:tpd:${dayKey(t)}`, DAY_MS, delta),
        ])
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

// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// The client's network, for the network-level backstops (D-134).
// - Only a trusted source: on Vercel, the headers Vercel itself sets (it
//   overwrites X-Forwarded-For "to prevent IP spoofing"; x-vercel-forwarded-for
//   and x-real-ip are identical, per Vercel's request-headers docs). Anywhere
//   else those headers are client input, so only the socket address counts.
// - Validated (node:net isIP) and normalised: IPv4-mapped IPv6 ("::ffff:1.2.3.4")
//   is IPv4; zones, brackets and ports are dropped.
// - IPv6 is aggregated to its /64: one subscriber usually has a whole /64,
//   so rotating addresses inside it is still one network.
// - Missing or invalid: "unknown", a shared bucket of its own (never a free pass).
// The raw address is never stored; callers hash the result (store.js hashIp).

import { isIP } from 'node:net'

const first = (value) => String(value || '').split(',')[0].trim()

/** "[::1]:443", "fe80::1%eth0", "1.2.3.4:5678" → the bare address, or ''. */
export function cleanIp(raw) {
    let text = String(raw || '').trim()
    if (!text) return ''
    const bracket = text.match(/^\[([^\]]+)\](?::\d+)?$/)
    if (bracket) text = bracket[1]
    else if (/^\d{1,3}(?:\.\d{1,3}){3}:\d+$/.test(text)) text = text.replace(/:\d+$/, '')
    text = text.replace(/%.*$/, '')
    const mapped = text.match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i)
    if (mapped) text = mapped[1]
    return isIP(text) ? text.toLowerCase() : ''
}

/** Expand an IPv6 address to 8 groups of 4 hex digits. */
function expand6(ip) {
    let text = ip
    // An embedded IPv4 tail ("64:ff9b::1.2.3.4") becomes two groups.
    const v4 = text.match(/(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)
    if (v4) {
        const [a, b, c, d] = v4.slice(1).map(Number)
        text = text.replace(v4[0], `${((a << 8) | b).toString(16)}:${((c << 8) | d).toString(16)}`)
    }
    const [head, tail = ''] = text.split('::')
    const left = head ? head.split(':') : []
    const right = text.includes('::') ? (tail ? tail.split(':') : []) : []
    const missing = 8 - left.length - right.length
    const groups = text.includes('::') ? [...left, ...Array(missing).fill('0'), ...right] : left
    return groups.map((g) => g.padStart(4, '0'))
}

/** The network a valid address belongs to: the IPv4 address, or an IPv6 /64. */
export function networkOf(ip) {
    const clean = cleanIp(ip)
    if (!clean) return 'unknown'
    if (isIP(clean) === 4) return clean
    return `${expand6(clean).slice(0, 4).join(':')}::/64`
}

/** The client's network for a request (see the header comment). */
export function clientNetwork(req, { onVercel = false } = {}) {
    const header = (name) => first(req.headers?.[name])
    const raw = onVercel
        ? header('x-vercel-forwarded-for') || header('x-forwarded-for') || header('x-real-ip')
        : req.socket?.remoteAddress || ''
    return networkOf(raw)
}

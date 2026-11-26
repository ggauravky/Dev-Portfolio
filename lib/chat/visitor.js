// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// Anonymous visitor identity (D-113, D-134). The server issues a random id in
// a signed HttpOnly cookie, so page scripts can't read or forge it, and the
// usage allowance belongs to the visitor (the browser profile), not to a
// conversation: New Chat, a new tab or a changed session id keep the same id.
//
// It does not prove a unique person: clearing cookies, a private window or
// another browser gives a new id. That is bounded elsewhere (new ids per
// network are counted and young ids on a flooded network share one small
// bucket of model calls, lib/chat/limits.js).
//
// Cookie v2: "v2.<id>.<issued, unix seconds>.<HMAC-SHA256>". The issue time is
// signed, so the server enforces the 30-day life itself (not only Max-Age) and
// can tell a young id from an established one. A v1 cookie ("<id>.<mac>") still
// verifies with its old key and is re-issued as v2 with the same id, so the
// migration doesn't reset anyone's allowance.
//
// Keys are derived from CHAT_IP_HASH_SALT with HKDF, one label per purpose
// (domain separation). Without a salt there is no stable key: production
// refuses to serve (handler.js); outside production a random per-process key
// is used (cookies then only verify on the instance that issued them).

import { createHmac, hkdfSync, randomBytes, timingSafeEqual } from 'node:crypto'
import { MIN_SALT_CHARS, VISITOR_COOKIE, VISITOR_COOKIE_DAYS, YOUNG_VISITOR_MS } from './config.js'

const EPHEMERAL = randomBytes(32)
const ID = /^[0-9a-f]{32}$/
const SECONDS = /^\d{9,11}$/
const LIFE_MS = VISITOR_COOKIE_DAYS * 86400 * 1000

/** A usable secret: long enough to be one. */
export const saltOk = (salt) => typeof salt === 'string' && salt.length >= MIN_SALT_CHARS

/** A 32-byte key for one purpose ("chat-visitor-v2", "chat-turn-owner"…). */
export function deriveKey(salt, label) {
    if (!saltOk(salt)) return createHmac('sha256', EPHEMERAL).update(label).digest()
    return Buffer.from(hkdfSync('sha256', Buffer.from(salt), Buffer.alloc(0), Buffer.from(label), 32))
}

// v1 used HKDF with the label "chat-visitor" (kept to verify old cookies).
const keyV1 = (salt) => (salt ? Buffer.from(hkdfSync('sha256', Buffer.from(salt), Buffer.alloc(0), Buffer.from('chat-visitor'), 32)) : EPHEMERAL)

const mac = (text, key) => createHmac('sha256', key).update(text).digest('base64url')
const equal = (a, b) => {
    const x = Buffer.from(String(a))
    const y = Buffer.from(String(b))
    return x.length === y.length && timingSafeEqual(x, y)
}

/** The v2 cookie value for an id issued at `issuedMs`. */
export function signVisitor(id, salt, issuedMs = Date.now()) {
    const issued = String(Math.floor(issuedMs / 1000))
    return `v2.${id}.${issued}.${mac(`v2.${id}.${issued}`, deriveKey(salt, 'chat-visitor-v2'))}`
}

/** The v1 format, only for tests of the migration. */
export const signVisitorV1 = (id, salt) => `${id}.${mac(id, keyV1(salt))}`

/**
 * The visitor in a cookie value, if its signature is valid and it hasn't
 * expired: { id, issuedMs, legacy }. Otherwise null.
 */
export function verifyVisitor(value, salt, now = Date.now()) {
    const parts = String(value || '').split('.')
    if (parts.length === 4 && parts[0] === 'v2') {
        const [, id, issued, given] = parts
        if (!ID.test(id) || !SECONDS.test(issued)) return null
        if (!equal(mac(`v2.${id}.${issued}`, deriveKey(salt, 'chat-visitor-v2')), given)) return null
        const issuedMs = Number(issued) * 1000
        // Expired, or issued in the future (a forged clock can't help: it's signed).
        if (now - issuedMs > LIFE_MS || issuedMs - now > 5 * 60 * 1000) return null
        return { id, issuedMs, legacy: false }
    }
    if (parts.length === 2) {
        const [id, given] = parts
        if (!ID.test(id) || !given || !equal(mac(id, keyV1(salt)), given)) return null
        return { id, issuedMs: null, legacy: true }
    }
    return null
}

const readCookie = (header, name) => String(header || '')
    .split(';')
    .map((part) => part.trim().split('='))
    .find(([k]) => k === name)?.[1] || ''

const cookieHeader = (value, production, maxAgeSeconds) => [
    `${VISITOR_COOKIE}=${value}`,
    'Path=/api/chat',
    `Max-Age=${maxAgeSeconds}`,
    'HttpOnly',
    'SameSite=Strict',
    production ? 'Secure' : '',
].filter(Boolean).join('; ')

/**
 * The visitor for a request: { id, isNew, issuedMs, young }. A missing,
 * invalid or expired cookie gets a new id; a v1 cookie keeps its id and is
 * re-issued as v2 (as an established visitor, not a young one). Sets the
 * Set-Cookie header on `res` when needed.
 */
export function visitorFor(req, res, { salt, production, now = Date.now() }) {
    const existing = verifyVisitor(readCookie(req.headers?.cookie, VISITOR_COOKIE), salt, now)
    if (existing && !existing.legacy) {
        return { id: existing.id, isNew: false, issuedMs: existing.issuedMs, young: now - existing.issuedMs < YOUNG_VISITOR_MS }
    }
    if (existing?.legacy) {
        // Signed by us within its 30-day Max-Age: established. The re-issued
        // cookie dates from before the young period and keeps a fresh life.
        const issuedMs = now - YOUNG_VISITOR_MS - 1000
        res.setHeader?.('Set-Cookie', cookieHeader(signVisitor(existing.id, salt, issuedMs), production, Math.floor((LIFE_MS - YOUNG_VISITOR_MS) / 1000)))
        return { id: existing.id, isNew: false, issuedMs, young: false }
    }
    const id = randomBytes(16).toString('hex')
    res.setHeader?.('Set-Cookie', cookieHeader(signVisitor(id, salt, now), production, VISITOR_COOKIE_DAYS * 86400))
    return { id, isNew: true, issuedMs: now, young: true }
}

// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// Anonymous visitor identity (D-113). The server issues a random id in a
// signed HttpOnly cookie, so page scripts can't read or forge it, and limits
// can be per visitor instead of per network (many honest visitors share one IP
// on campus Wi-Fi, in offices, behind mobile NAT).
//
// It does not prove a unique person: a script can drop cookies and get a new
// id each time. That is bounded elsewhere: new ids per network are capped, and
// past the cap they get no model calls (lib/chat/handler.js).
//
// The signing key is derived from CHAT_IP_HASH_SALT (HKDF), so no new secret
// is needed. Without a salt, a random per-process key: cookies then only
// verify on the instance that issued them (fine for local development).

import { createHmac, hkdfSync, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto'
import { VISITOR_COOKIE, VISITOR_COOKIE_DAYS } from './config.js'

const EPHEMERAL = randomBytes(32)
const ID = /^[0-9a-f]{32}$/

const keyOf = (salt) => (salt
    ? Buffer.from(hkdfSync('sha256', Buffer.from(salt), Buffer.alloc(0), Buffer.from('chat-visitor'), 32))
    : EPHEMERAL)

const sign = (id, key) => createHmac('sha256', key).update(id).digest('base64url')

/** The cookie value for an id: "id.signature". */
export const signVisitor = (id, salt) => `${id}.${sign(id, keyOf(salt))}`

/** The id inside a cookie value if its signature is valid, else null. */
export function verifyVisitor(value, salt) {
    const [id, mac] = String(value || '').split('.')
    if (!ID.test(id || '') || !mac) return null
    const expected = Buffer.from(sign(id, keyOf(salt)))
    const given = Buffer.from(mac)
    return expected.length === given.length && timingSafeEqual(expected, given) ? id : null
}

const readCookie = (header, name) => String(header || '')
    .split(';')
    .map((part) => part.trim().split('='))
    .find(([k]) => k === name)?.[1] || ''

/**
 * The visitor for a request: { id, isNew }. A new or invalid cookie gets a new
 * id and a Set-Cookie header on `res`.
 */
export function visitorFor(req, res, { salt, production }) {
    const existing = verifyVisitor(readCookie(req.headers?.cookie, VISITOR_COOKIE), salt)
    if (existing) return { id: existing, isNew: false }
    const id = randomUUID().replace(/-/g, '')
    const attributes = [
        `${VISITOR_COOKIE}=${signVisitor(id, salt)}`,
        'Path=/api/chat',
        `Max-Age=${VISITOR_COOKIE_DAYS * 86400}`,
        'HttpOnly',
        'SameSite=Strict',
        production ? 'Secure' : '',
    ].filter(Boolean)
    res.setHeader?.('Set-Cookie', attributes.join('; '))
    return { id, isNew: true }
}

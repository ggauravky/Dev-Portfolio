// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// Visitor text is cleaned before it reaches any provider, the embedder or Mongo
// (D-101). Gemini's free-tier terms ask that no personal information be sent,
// so emails and phone numbers are replaced with placeholders. This is a
// best-effort filter, not a guarantee; the Privacy page must say so.

const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi
// 10+ digits, optionally with a leading +, spaces, dots, dashes or brackets.
const PHONE = /\+?\d(?:[\s().-]*\d){9,}/g
const CONTROL = new RegExp('[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u200B-\u200F\u2028\u2029\uFEFF]', 'g')
// Chat-template and delimiter look-alikes a visitor could paste in.
const TEMPLATE_TOKENS = /<\|[^|>]{0,40}\|>|<\/?\s*(?:system|context|source|assistant|user|visitor_question|earlier_questions|previous_turn|likely_topic|resolved_reference)[^>]{0,40}>/gi

export function redactPII(text) {
    return String(text || '')
        .replace(EMAIL, '[email]')
        .replace(PHONE, '[phone]')
}

/** Normalise visitor input: no control characters or template tokens, trimmed. */
export function cleanUserText(text, maxChars) {
    const cleaned = redactPII(String(text || '').replace(CONTROL, ' ').replace(TEMPLATE_TOKENS, ' '))
        .replace(/[ \t]+/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim()
    return maxChars ? cleaned.slice(0, maxChars) : cleaned
}

/** Cache key form of a question: lower case, letters/digits only, single spaces. */
export function normaliseQuestion(text) {
    return String(text || '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
}

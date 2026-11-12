// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// Inline field validators for the v2 inputs (src/components/ui/Input.jsx):
// each returns an error message, or '' when the value is fine.

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const validateEmail = (value) => {
    const v = String(value || '').trim()
    if (!v) return 'Enter your email address.'
    return EMAIL.test(v) ? '' : 'That email doesn’t look right. Check for a typo.'
}

const capital = (s) => `${s[0].toUpperCase()}${s.slice(1)}`

export const validateRequired = (label, min = 1, max = Infinity) => (value) => {
    const v = String(value || '').trim()
    if (!v) return `Enter ${label}.`
    if (v.length < min) return `${capital(label)} needs at least ${min} characters.`
    if (v.length > max) return `${capital(label)} can be at most ${max} characters.`
    return ''
}

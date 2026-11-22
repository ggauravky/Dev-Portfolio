// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// One display format for the data's hand-written date labels (unslop audit
// J-3, D-118). journeyData mixes "October 1, 2026", "February 2026",
// "June 1, 2026 - July 15, 2026" and "September 14, 2025 – August 4, 2026".
// Display only: the data and its JSON-LD keep the original strings.
//
//   "September 7, 2026 - Present"   → "Sep 7, 2026 – Present"
//   "June 1, 2026 - July 15, 2026"  → "Jun 1 – Jul 15, 2026"   (same year: once)
//   "October 2025"                  → "Oct 2025"

const MONTH = /\b(January|February|March|April|May|June|July|August|September|October|November|December)\b/g

const shortMonths = (text) => text.replace(MONTH, (name) => name.slice(0, 3))

const yearOf = (part) => part.match(/\b(\d{4})$/)?.[1] || null

export function shortDateLabel(label) {
    if (!label) return ''
    const parts = label.split(/\s+[-–—]\s+/).map((part) => shortMonths(part.trim()))
    if (parts.length !== 2) return parts.join('\u00a0– ')
    let [from, to] = parts
    const fromYear = yearOf(from)
    // Drop the repeated year from a "Mon D, YYYY" start when the range ends the same year.
    if (fromYear && fromYear === yearOf(to) && /,\s*\d{4}$/.test(from)) from = from.replace(/,\s*\d{4}$/, '')
    // No-break space before the dash: a wrapped range breaks after it, never before.
    return `${from}\u00a0– ${to}`
}

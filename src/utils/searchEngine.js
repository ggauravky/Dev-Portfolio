// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Custom multi-strategy search engine for the Command Palette.
// No external fuzzy libraries — pure JS scoring for minimal bundle impact.
// Source: https://github.com/ggauravky/Dev-Portfolio

// Levenshtein distance (typo tolerance)
function levenshtein(a, b) {
    const la = a.length
    const lb = b.length
    if (la === 0) return lb
    if (lb === 0) return la
    if (la > 20 || lb > 20) return 99
    const prev = Array.from({ length: lb + 1 }, (_, i) => i)
    for (let i = 1; i <= la; i++) {
        const curr = [i]
        for (let j = 1; j <= lb; j++) {
            curr[j] =
                a[i - 1] === b[j - 1]
                    ? prev[j - 1]
                    : 1 + Math.min(prev[j - 1], prev[j], curr[j - 1])
        }
        prev.splice(0, prev.length, ...curr)
    }
    return prev[lb]
}

// Acronym match: "ai" matches "AI Lab", "aip" matches "AI Projects"
function acronymScore(query, title) {
    const words = title.split(/\s+/)
    const initials = words.map((w) => (w[0] || '').toLowerCase()).join('')
    if (initials.startsWith(query)) return 85
    if (initials.includes(query)) return 65
    return 0
}

// Build highlight segments for a title string
// Returns array of {text, highlight} objects for rendering matched portions
export function buildHighlightSegments(title, query) {
    if (!query) return [{ text: title, highlight: false }]
    const lower = title.toLowerCase()
    const q = query.toLowerCase()
    const idx = lower.indexOf(q)
    if (idx === -1) return [{ text: title, highlight: false }]
    return [
        { text: title.slice(0, idx), highlight: false },
        { text: title.slice(idx, idx + q.length), highlight: true },
        { text: title.slice(idx + q.length), highlight: false },
    ].filter((s) => s.text.length > 0)
}

// Score a single command item against a normalized query string
function scoreItem(cmd, q) {
    const title = (cmd.title || '').toLowerCase()
    const desc = (cmd.desc || '').toLowerCase()
    const keywords = (cmd.keywords || []).map((k) => k.toLowerCase())

    if (title === q) return 100
    if (title.startsWith(q)) return 92

    const acr = acronymScore(q, cmd.title || '')
    if (acr > 0) return acr

    if (keywords.some((k) => k === q)) return 82
    if (title.includes(q)) return 75
    if (keywords.some((k) => k.startsWith(q))) return 68
    if (keywords.some((k) => k.includes(q))) return 55

    const aliasBlob = keywords.join(' ')
    try {
        if (new RegExp('\\b' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).test(aliasBlob)) return 48
    } catch (_) { /* noop */ }

    if (desc.includes(q)) return 35

    if (q.length >= 3) {
        const titleDist = levenshtein(q, title.slice(0, q.length + 2))
        if (titleDist === 1) return 30
        if (titleDist === 2 && q.length >= 5) return 18
        for (const kw of keywords) {
            const d = levenshtein(q, kw.slice(0, q.length + 2))
            if (d === 1) return 28
            if (d === 2 && q.length >= 5) return 16
        }
    }

    return 0
}

// Score, filter, sort and return top commands matching a query
export function searchCommands(query, commands, maxResults = 15) {
    const q = (query || '').trim().toLowerCase()
    if (!q) return []
    const scored = []
    for (const cmd of commands) {
        const score = scoreItem(cmd, q)
        if (score > 0) {
            scored.push({ ...cmd, _score: score, _segments: buildHighlightSegments(cmd.title, q) })
        }
    }
    scored.sort((a, b) => b._score - a._score)
    return scored.slice(0, maxResults)
}

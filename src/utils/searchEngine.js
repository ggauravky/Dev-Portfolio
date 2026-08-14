// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Multi-strategy search engine for the Command Palette.
// Pure JS no external fuzzy libraries minimal bundle impact.
// Source: https://github.com/ggauravky/Dev-Portfolio

// ALIAS / TYPO NORMALIZATION MAP
// Maps common misspellings and shorthand to their canonical form.
const ALIAS_MAP = {
    'js': 'javascript',
    'es6': 'javascript',
    'vanilla': 'javascript',
    'ts': 'typescript',
    'reactjs': 'react',
    'react js': 'react',
    'nextjs': 'next.js',
    'next js': 'next.js',
    'nodejs': 'node.js',
    'node js': 'node.js',
    'expressjs': 'express',
    'tailwindcss': 'tailwind',
    'mongo': 'mongodb',
    'postgres': 'postgresql',
    'psql': 'postgresql',
    'pg': 'postgresql',
    'prismaorm': 'prisma',
    'amazon': 'aws',
    'linkdin': 'linkedin',
    'lnkd': 'linkedin',
    'twiter': 'twitter',
    'intagram': 'instagram',
    'instgram': 'instagram',
    'projets': 'projects',
    'projetcs': 'projects',
    'skils': 'skills',
    'skiils': 'skills',
    'sevices': 'services',
    'contect': 'contact',
    'conatct': 'contact',
    'resum': 'resume',
    'resme': 'resume',
    'githb': 'github',
    'python3': 'python',
    'py': 'python',
    'html5': 'html',
    'css3': 'css',
}

function normalize(token) {
    return ALIAS_MAP[token] || token
}

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
            curr[j] = a[i - 1] === b[j - 1]
                ? prev[j - 1]
                : 1 + Math.min(prev[j - 1], prev[j], curr[j - 1])
        }
        prev.splice(0, prev.length, ...curr)
    }
    return prev[lb]
}

function acronymScore(query, title) {
    const words = title.split(/\s+/)
    const initials = words.map((w) => (w[0] || '').toLowerCase()).join('')
    if (initials.startsWith(query)) return 85
    if (initials.includes(query)) return 65
    return 0
}

function scoreToken(cmd, token) {
    const title = (cmd.title || '').toLowerCase()
    const desc = (cmd.desc || '').toLowerCase()
    const keywords = (cmd.keywords || []).map((k) => k.toLowerCase())
    const aliases = (cmd.aliases || []).map((a) => a.toLowerCase())

    if (title === token) return 100
    if (title.startsWith(token)) return 92

    const acr = acronymScore(token, cmd.title || '')
    if (acr > 0) return acr

    if (keywords.some((k) => k === token)) return 82
    if (aliases.some((a) => a === token)) return 80
    if (title.includes(token)) return 75
    if (keywords.some((k) => k.startsWith(token))) return 70
    if (aliases.some((a) => a.startsWith(token))) return 60
    if (keywords.some((k) => k.includes(token))) return 55
    if (aliases.some((a) => a.includes(token))) return 50

    const blob = [...keywords, ...aliases].join(' ')
    try {
        const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        if (new RegExp('\\b' + escaped).test(blob)) return 48
    } catch (_) { /* noop */ }

    if (desc.includes(token)) return 35

    if (token.length >= 3) {
        const titleDist = levenshtein(token, title.slice(0, token.length + 2))
        if (titleDist === 1) return 30
        if (titleDist === 2 && token.length >= 5) return 18

        for (const kw of keywords) {
            const d = levenshtein(token, kw.slice(0, token.length + 2))
            if (d === 1) return 28
            if (d === 2 && token.length >= 5) return 16
        }

        for (const al of aliases) {
            const d = levenshtein(token, al.slice(0, token.length + 2))
            if (d === 1) return 26
            if (d === 2 && token.length >= 5) return 14
        }
    }

    return 0
}

function scoreItem(cmd, rawQuery) {
    const q = rawQuery.toLowerCase().trim()
    if (!q) return 0

    const stripped = q.replace(/^my\s+/, '')
    const tokens = stripped.split(/\s+/).filter(Boolean)
    const normalizedTokens = tokens.map((t) => normalize(t))

    let finalScore = 0

    if (normalizedTokens.length === 1) {
        finalScore = scoreToken(cmd, normalizedTokens[0])
    } else {
        const tokenScores = normalizedTokens.map((t) => scoreToken(cmd, t))
        const matchedCount = tokenScores.filter((s) => s > 0).length
        const totalTokens = tokenScores.length

        if (matchedCount === 0) return 0

        const avgScore = tokenScores.reduce((a, b) => a + b, 0) / totalTokens

        if (matchedCount === totalTokens) {
            finalScore = avgScore * 1.15
        } else {
            finalScore = avgScore * (matchedCount / totalTokens) * 0.7
        }

        const categoryTokens = ['projects', 'project', 'skills', 'skill', 'services', 'service', 'blog', 'page', 'pages']
        const hasCategoryToken = normalizedTokens.some((t) => categoryTokens.includes(t))
        const techTokens = normalizedTokens.filter((t) => !categoryTokens.includes(t))

        if (hasCategoryToken && techTokens.length > 0 && finalScore > 0) {
            const cmdCat = (cmd.category || '').toLowerCase()
            const matchesCat = normalizedTokens.some((t) => {
                if (t === 'project' || t === 'projects') return cmdCat.includes('project')
                if (t === 'skill' || t === 'skills') return cmdCat.includes('skill')
                if (t === 'service' || t === 'services') return cmdCat.includes('service')
                if (t === 'blog') return cmdCat.includes('blog')
                if (t === 'page' || t === 'pages') return cmdCat.includes('page')
                return false
            })
            if (matchesCat) finalScore *= 1.3
        }
    }

    if (finalScore <= 0) return 0

    const priority = cmd.priority || 50
    finalScore = finalScore * (1 + priority / 350)

    return Math.min(finalScore, 200)
}

export function buildHighlightSegments(title, query) {
    if (!query || !title) return [{ text: title, highlight: false }]

    const lower = title.toLowerCase()
    const tokens = query.toLowerCase().trim().split(/\s+/).filter(Boolean)

    for (const token of tokens) {
        const normalized = normalize(token)
        for (const candidate of [token, normalized]) {
            const idx = lower.indexOf(candidate)
            if (idx !== -1) {
                return [
                    { text: title.slice(0, idx), highlight: false },
                    { text: title.slice(idx, idx + candidate.length), highlight: true },
                    { text: title.slice(idx + candidate.length), highlight: false },
                ].filter((s) => s.text.length > 0)
            }
        }
    }

    return [{ text: title, highlight: false }]
}

export function searchCommands(query, commands, maxResults = 20) {
    const q = (query || '').trim()
    if (!q) return []

    const scored = []
    for (const cmd of commands) {
        try {
            const score = scoreItem(cmd, q)
            if (score > 0) {
                scored.push({
                    ...cmd,
                    _score: score,
                    _segments: buildHighlightSegments(cmd.title, q),
                })
            }
        } catch (_) {
            // Skip malformed commands gracefully
        }
    }

    scored.sort((a, b) => b._score - a._score)
    return scored.slice(0, maxResults)
}

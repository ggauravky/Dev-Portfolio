// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// Deterministic structured queries (D-134). Counts, technology filters,
// collaborative projects, live links, latest or earliest journey entries and
// service prices are computed here from the structured records (records.js),
// never estimated by a model. A model may only explain the result.
//
// A query is a small object of allowlisted fields:
//   { kind: 'count' }
//   { kind: 'filter', all: [tag], any: [tag], none: [tag], collaborative?, live? }
//   { kind: 'journey', category, order: 'latest'|'earliest' }
//   { kind: 'services', maxPrice?, cheapest? }
// validateQuery() rejects anything else, so a plan from any source (a parser
// or, later, a model) can't run arbitrary code or database queries.
// For exclusions, a project whose stack is undocumented is neither in nor out:
// it is reported as "can't tell", since an unlisted technology isn't proven absent.

import { STATUS_TEXT, TECH, TECH_LABEL } from './records.js'

const KINDS = new Set(['count', 'filter', 'journey', 'services'])
const ORDERS = new Set(['latest', 'earliest'])
const CATEGORIES = new Set(['Hackathons', 'Internships', 'Certifications', 'Workshops', 'Conferences', 'Community Events', 'Startup Events', 'Open Source', 'Education', 'Academic Programs'])
const TAGS = new Set([...TECH.map(([tag]) => tag), 'ai', 'ml', 'backend', 'frontend'])

/** True when every field is allowlisted and well-typed. */
export function validateQuery(q) {
    if (!q || typeof q !== 'object' || !KINDS.has(q.kind)) return false
    const allowed = { count: [], filter: ['all', 'any', 'none', 'collaborative', 'live'], journey: ['category', 'order'], services: ['maxPrice', 'cheapest'] }[q.kind]
    if (Object.keys(q).some((k) => k !== 'kind' && !allowed.includes(k))) return false
    for (const field of ['all', 'any', 'none']) {
        if (q[field] !== undefined && (!Array.isArray(q[field]) || q[field].length > 6 || q[field].some((t) => !TAGS.has(t)))) return false
    }
    if (q.collaborative !== undefined && typeof q.collaborative !== 'boolean') return false
    if (q.live !== undefined && q.live !== true) return false
    if (q.category !== undefined && !CATEGORIES.has(q.category)) return false
    if (q.order !== undefined && !ORDERS.has(q.order)) return false
    if (q.maxPrice !== undefined && !(Number.isFinite(q.maxPrice) && q.maxPrice > 0 && q.maxPrice < 1e7)) return false
    if (q.cheapest !== undefined && q.cheapest !== true) return false
    return true
}

// ── Parsing visitor questions ───────────────────────────────────────────────

// Words in a question that name a tag (visitor side; "mongo", "postgres", "next").
const ASKED_TECH = [
    ['mongodb', /\bmongo(db)?\b|\bmongoose\b|मोंगो/i], ['postgresql', /\bpostgres(ql)?\b|\bneon\b/i], ['mysql', /\bmysql\b/i],
    ['sqlite', /\bsqlite\b/i], ['prisma', /\bprisma\b/i], ['nextjs', /\bnext\.?js\b|\bnextjs\b/i], ['react', /\breact(\.?js)?\b|रिएक्ट/i],
    ['vue', /\bvue\b/i], ['typescript', /\btypescript\b/i], ['node', /\bnode(\.?js)?\b/i], ['express', /\bexpress\b/i],
    ['python', /\bpython\b|पायथन/i], ['flask', /\bflask\b/i], ['fastapi', /\bfastapi\b/i], ['streamlit', /\bstreamlit\b/i],
    ['tailwind', /\btailwind\b/i], ['redux', /\bredux\b/i], ['socketio', /\bsocket\.?io\b|\bwebsockets?\b/i], ['jwt', /\bjwt\b/i],
    ['razorpay', /\brazorpay\b/i], ['cloudinary', /\bcloudinary\b/i], ['opencv', /\bopencv\b/i], ['gemini', /\bgemini\b/i],
    ['whisper', /\bwhisper\b/i], ['langchain', /\blangchain\b/i], ['ffmpeg', /\bffmpeg\b/i], ['docker', /\bdocker\b/i],
    ['javascript', /\bjavascript\b/i], ['html', /\bhtml\b/i],
    ['ai', /\b(ai|llms?|gen ?ai|generative ai|rag|artificial intelligence)\b/i], ['ml', /\b(ml|machine learning)\b/i],
    ['backend', /\bback[- ]?end\b/i], ['frontend', /\bfront[- ]?end\b/i],
]
// A negation right before a name. Hindi "bina" leads only when it isn't
// "X ke bina" (that one follows its name; see askedTags).
const NEGATION = /(\b(not|without|no|don'?t|doesn'?t|do not|does not|except|excluding|exclude|but not|other than)\b|(?<!\b(ke|ka|ki) )\bbina\b)\s*(use|uses|using|have|has|include|includes|with)?\s*$/i

/** Tags the question names, each with whether it is negated. */
function askedTags(text) {
    const found = []
    for (const [tag, re] of ASKED_TECH) {
        const m = re.exec(text)
        if (!m) continue
        // "Next.js" also matches React's pattern elsewhere; keep one tag per mention.
        if (tag === 'react' && found.some((f) => f.tag === 'nextjs' && f.at === m.index)) continue
        const before = text.slice(Math.max(0, m.index - 40), m.index)
        found.push({ tag, at: m.index, end: m.index + m[0].length, negated: NEGATION.test(before) })
    }
    found.sort((a, b) => a.at - b.at)
    // "not React or Vue", "without React, Vue": the negation carries over a list.
    for (let i = 1; i < found.length; i += 1) {
        const between = text.slice(found[i - 1].end, found[i].at)
        if (!found[i].negated && found[i - 1].negated && /^\W*(or|nor|,|\/|and)\W*$/i.test(between)) found[i].negated = true
    }
    // Hindi/Hinglish: "React ke bina", "React nahi" put the negation after the name.
    for (const f of found) if (/^\s*(ke |ka )?(bina|nahi|nahin)\b|^\s*(के )?बिना|^\s*नहीं/i.test(text.slice(f.end, f.end + 14))) f.negated = true
    return found
}

const PROJECT_WORD = /\bprojects?\b|\bapps?\b|\bapplications?\b|प्रोजेक्ट/i
const LIST_ASK = /\b(which|what|list|show|name|any|kaun ?se|konse|kaunse|kon ?se)\b|कौन|किन/i
const USE_WORD = /\b(use[sd]?|using|built (with|on|using)|made (with|in|using)|with|in|on|based on|written in|developed (with|in)|have|has|involve|demonstrat\w*|show(case)?s?|istemal|use kiya)\b|इस्तेमाल|उपयोग/i
const COUNT_ASK = /\bhow many\b.*\b(projects?|apps?)\b|\b(number|count|total)\s+of\s+(his\s+)?projects\b|\bkitne\s+projects?\b|कितने\s*प्रोजेक्ट/i
const COLLAB = /\b(collaborative|collaborat\w+|team ?(based)?|group|with (a |his )?team|in (a )?team|teammates?)\b.*\bprojects?\b|\bprojects?\b.*\b(collaborat\w+|with (a |his )?team|in (a )?team|as a team|teammates?)\b/i
const SOLO = /\b(solo|individual|alone|by himself|on his own)\b.*\bprojects?\b|\bprojects?\b.*\b(solo|alone|by himself|on his own)\b/i
const LIVE = /\bprojects?\b.*\b(live|deployed|hosted|demo links?|live demo)\b|\b(live|deployed|hosted)\b.*\bprojects?\b/i
const JOURNEY_ORDER = /\b(latest|most recent|recent|newest|last|current|first|earliest|oldest)\b/i
const JOURNEY_CAT = [
    [/\bhackathons?\b|हैकाथॉन/i, 'Hackathons'], [/\binternships?\b|\bintern\b|इंटर्नशिप/i, 'Internships'], [/\b(certificat\w*|courses?)\b/i, 'Certifications'],
    [/\bworkshops?\b/i, 'Workshops'], [/\bconferences?\b/i, 'Conferences'], [/\bopen[- ]source\b/i, 'Open Source'],
]
const SERVICE_PRICE = /\bservices?\b.*\b(under|below|less than|cheaper than|within|upto|up to|max(imum)?|at most|budget( of)?)\s*(₹|rs\.?|inr)?\s*(\d[\d,]*)/i
const CHEAPEST = /\b(cheapest|least expensive|lowest[- ]priced?|most affordable)\b.*\bservices?\b|\bservices?\b.*\b(cheapest|least expensive|lowest price)\b/i

/**
 * The structured query a question asks, or null. Only clear shapes are taken:
 * anything else goes to retrieval and the model.
 */
export function parseQuery(question) {
    const text = String(question || '')
    if (CHEAPEST.test(text)) return { kind: 'services', cheapest: true }
    const price = text.match(SERVICE_PRICE)
    if (price) return { kind: 'services', maxPrice: Number(price[5].replace(/,/g, '')) }
    const category = JOURNEY_CAT.find(([re]) => re.test(text))?.[1]
    const order = text.match(JOURNEY_ORDER)?.[1]?.toLowerCase()
    if (category && order && !PROJECT_WORD.test(text)) {
        return { kind: 'journey', category, order: /first|earliest|oldest/.test(order) ? 'earliest' : 'latest' }
    }
    if (COUNT_ASK.test(text) && !askedTags(text).length) return { kind: 'count' }
    if (!PROJECT_WORD.test(text)) return null
    const tags = askedTags(text)
    const q = { kind: 'filter' }
    if (COLLAB.test(text)) q.collaborative = true
    else if (SOLO.test(text)) q.collaborative = false
    if (LIVE.test(text)) q.live = true
    if (tags.length && (LIST_ASK.test(text) || COUNT_ASK.test(text)) && (USE_WORD.test(text) || tags.some((t) => t.negated))) {
        const positive = tags.filter((t) => !t.negated).map((t) => t.tag)
        const negative = tags.filter((t) => t.negated).map((t) => t.tag)
        const anyOf = /\b(either|or)\b/i.test(text) && !/\b(both|and)\b/i.test(text.replace(/\bbut\b.*$/i, ''))
        if (positive.length) q[anyOf ? 'any' : 'all'] = [...new Set(positive)]
        if (negative.length) q.none = [...new Set(negative)]
        // Next.js is React too: excluding React excludes Next.js.
        if (q.none?.includes('react') && !q.none.includes('nextjs')) q.none.push('nextjs')
    }
    if (Object.keys(q).length === 1) return null
    return validateQuery(q) ? q : null
}

// ── Running a query ─────────────────────────────────────────────────────────

const has = (record, tag) => record.tags.includes(tag)
const names = (list) => list.map((r) => r.name)
const joinNames = (list) => (list.length <= 2 ? list.join(' and ') : `${list.slice(0, -1).join(', ')} and ${list.at(-1)}`)
const label = (tag) => TECH_LABEL[tag] || tag

/** Run a validated query. Returns { kind, query, items, unknown, facts, entities }. */
export function runQuery(records, query) {
    if (!validateQuery(query)) return null
    const projects = records?.projects || []
    if (query.kind === 'count') {
        const by = (cls) => projects.filter((p) => p.statusClass === cls).length
        return {
            kind: 'count', query, items: [], entities: [],
            facts: {
                listed: records.listedOnSite ?? projects.filter((p) => p.onSite).length,
                records: projects.length,
                offSite: projects.filter((p) => !p.onSite).map((p) => p.name),
                documented: by('documented') + by('limited'),
                historical: by('historical'),
                ownerReported: by('owner-reported') + by('idea'),
                live: projects.filter((p) => p.live).length,
                caseStudies: projects.filter((p) => p.caseStudy).length,
                reposIndexed: records.github?.reposIndexed ?? null,
                reposSnapshot: records.github?.snapshot || '',
            },
        }
    }
    if (query.kind === 'filter') {
        const matchesPositive = (p) => (query.all || []).every((t) => has(p, t)) && (!query.any?.length || query.any.some((t) => has(p, t)))
        const extra = (p) => (query.collaborative === undefined || p.collaborative === query.collaborative) && (!query.live || Boolean(p.live))
        const candidates = projects.filter((p) => matchesPositive(p) && extra(p))
        const none = query.none || []
        const items = candidates.filter((p) => none.every((t) => !has(p, t)) && (!none.length || p.stackDocumented))
        const unknown = none.length ? candidates.filter((p) => !p.stackDocumented && none.every((t) => !has(p, t))) : []
        // With an exclusion: the projects that matched but were excluded, so the
        // answer can say why ("every MongoDB project also lists React").
        const excluded = none.length ? candidates.filter((p) => none.some((t) => has(p, t))) : []
        // A positive condition on an undocumented stack can't be checked either.
        const unchecked = (query.all?.length || query.any?.length) ? projects.filter((p) => !p.stackDocumented && extra(p) && !matchesPositive(p)) : []
        return { kind: 'filter', query, items, unknown: [...unknown, ...unchecked], excluded, entities: items.map((p) => p.group).slice(0, 8), facts: { total: projects.length } }
    }
    if (query.kind === 'journey') {
        const entries = (records.journey || []).filter((e) => e.category === query.category && e.date)
            .sort((a, b) => (query.order === 'latest' ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date)))
        return { kind: 'journey', query, items: entries.slice(0, 3), entities: [], facts: { total: entries.length } }
    }
    const services = (records.services || []).filter((s) => s.min !== null)
    const items = query.cheapest
        ? [...services].sort((a, b) => a.min - b.min).slice(0, 1)
        : services.filter((s) => s.min <= query.maxPrice).sort((a, b) => a.min - b.min)
    return { kind: 'services', query, items, entities: [], facts: { total: services.length } }
}

// ── Describing a result (deterministic English) ─────────────────────────────

function describeFilter(result) {
    const { query, items, unknown, excluded } = result
    const parts = []
    if (query.all?.length) parts.push(`use ${query.all.map(label).join(' and ')}`)
    if (query.any?.length) parts.push(`use ${query.any.map(label).join(' or ')}`)
    if (query.none?.length) parts.push(`don't use ${query.none.filter((t) => !(t === 'nextjs' && query.none.includes('react'))).map((t) => (t === 'react' ? 'React (or Next.js)' : label(t))).join(' or ')}`)
    if (query.collaborative === true) parts.push('were built with a team')
    if (query.collaborative === false) parts.push('he built on his own')
    if (query.live) parts.push('have a live demo link')
    const what = `projects that ${parts.join(' and ')}`
    const row = (p) => `- **${p.name}**: ${p.stack.slice(0, 7).join(', ')}${p.url ? ` (${p.url})` : ''}${p.statusClass !== 'documented' ? ` · ${STATUS_TEXT[p.statusClass]}` : ''}`
    const lines = []
    if (items.length) {
        lines.push(`From the ${result.facts.total} project records, ${items.length === 1 ? 'one matches' : `${items.length} match`}: ${what}.`)
        lines.push(...items.slice(0, 12).map(row))
        if (items.length > 12) lines.push(`- …and ${items.length - 12} more on the Projects page.`)
    } else {
        lines.push(`None of the ${result.facts.total} project records match: ${what}.`)
    }
    if (excluded?.length && !items.length) {
        const shown = names(excluded).slice(0, 8)
        lines.push('', `Every project whose recorded stack meets the first condition also lists what you excluded: ${excluded.length > 8 ? `${shown.join(', ')} and ${excluded.length - 8} more` : joinNames(shown)}.`)
    }
    if (unknown?.length) {
        lines.push('', `${joinNames(names(unknown).slice(0, 5))} ${unknown.length === 1 ? "doesn't have its" : "don't have their"} stack documented in detail, so ${unknown.length === 1 ? 'it' : 'they'} can't be checked either way.`)
    }
    if (query.collaborative === true) lines.push('', 'Collaborative means the site or the records name teammates.')
    return lines.join('\n')
}

/** The answer text for a result, in English (exact; no model). */
export function describeResult(result) {
    if (!result) return ''
    if (result.kind === 'count') {
        const f = result.facts
        return [
            'It depends on what you count, so here are the separate numbers from the records:',
            `- **Listed on the Projects page:** ${f.listed}`,
            `- **Project records the assistant knows:** ${f.records} (the ${f.listed} on the page plus ${f.offSite.length} that aren't, such as ${joinNames(f.offSite.slice(0, 3))})`,
            `- **By documentation:** ${f.documented} documented in a public repository, ${f.historical} earlier case studies kept as historical, ${f.ownerReported} described by Gaurav but not independently verified`,
            `- **With a live demo link:** ${f.live}`,
            '',
            `There's no verified count of *completed* projects: the records say how each one is documented, not whether it is finished. ${f.reposIndexed ? `His GitHub had ${f.reposIndexed} public repositories when it was indexed (${f.reposSnapshot}), but repositories aren't the same as projects.` : ''}`.trim(),
        ].join('\n')
    }
    if (result.kind === 'filter') return describeFilter(result)
    if (result.kind === 'journey') {
        const [first, ...rest] = result.items
        const which = result.query.order === 'latest' ? 'most recent' : 'earliest'
        const kind = result.query.category.toLowerCase().replace(/s$/, '')
        if (!first) return `The Journey page doesn't list any ${kind} entries.`
        return [
            `His ${which} ${kind} on the Journey page is **${first.title}**${first.organization ? ` (${first.organization})` : ''}, ${first.dateLabel || first.date}${first.status ? `, ${first.status.toLowerCase()}` : ''}.`,
            rest.length ? `Before that: ${rest.map((e) => `${e.title} (${e.dateLabel || e.date})`).join('; ')}.` : '',
            'All entries are on the Journey page (/journey).',
        ].filter(Boolean).join('\n')
    }
    const { items, query } = result
    if (!items.length) return `No service starts at or under ₹${query.maxPrice}. The prices are on the Services page (/services).`
    return [
        query.cheapest ? 'The lowest-priced service:' : `Services that start at or under ₹${query.maxPrice}:`,
        ...items.map((s) => `- **${s.title}**: ${s.priceLabel} (${s.url})`),
    ].join('\n')
}

/** A compact, authoritative evidence block for the model (when it explains a result). */
export function resultEvidence(result) {
    return {
        id: 'computed:result',
        type: 'computed',
        title: 'Computed result (authoritative)',
        url: '',
        group: 'computed',
        status: 'computed from the structured records',
        text: describeResult(result),
        contextChars: 2400,
    }
}

/** Every project name the result allows an explanation to mention. */
export const resultNames = (result) => [...(result?.items || []), ...(result?.excluded || []), ...(result?.unknown || [])]
    .map((r) => r.name || r.title).filter(Boolean)

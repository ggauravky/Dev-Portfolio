// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// Deterministic structured queries (D-134, D-136). Counts, technology
// filters, collaborative projects, live links, latest or earliest journey
// entries and service prices are computed here from the structured records
// (records.js), never estimated by a model, and described here in English,
// Hindi or Hinglish from the same result, so a number, a status or a name
// can't change meaning between languages (no model rewording).
//
// A query is a small object of allowlisted fields:
//   { kind: 'count' }                                       every count, kept apart
//   { kind: 'filter', all, any, none: [tag], collaborative?, live?, onSite?,
//     undocumented?, status?, count? }                       projects that match
//   { kind: 'journey', category, order: 'latest'|'earliest' }
//   { kind: 'services', maxPrice?, inclusive?, cheapest?, list? }
// validateQuery() rejects anything else, so a plan from any source can't run
// arbitrary code or database queries.
// Evidence completeness: a record that doesn't list a technology is not proof
// the project never used it. Exclusions say "doesn't list X", and a project
// whose stack isn't documented in detail is reported as can't-tell. A recorded
// live-demo link is not a checked, working deployment.

import { STATUS_TEXT, TECH, TECH_LABEL } from './records.js'

const KINDS = new Set(['count', 'filter', 'journey', 'services'])
const ORDERS = new Set(['latest', 'earliest'])
const STATUSES = new Set(['documented', 'historical', 'owner-reported'])
const CATEGORIES = new Set(['Hackathons', 'Internships', 'Certifications', 'Workshops', 'Conferences', 'Community Events', 'Startup Events', 'Open Source', 'Education', 'Academic Programs'])
const TAGS = new Set([...TECH.map(([tag]) => tag), 'ai', 'ml', 'backend', 'frontend'])
const FIELDS = {
    count: [],
    filter: ['all', 'any', 'none', 'collaborative', 'live', 'onSite', 'undocumented', 'status', 'count'],
    journey: ['category', 'order'],
    services: ['maxPrice', 'inclusive', 'cheapest', 'list'],
}

/** True when every field is allowlisted and well-typed. */
export function validateQuery(q) {
    if (!q || typeof q !== 'object' || !KINDS.has(q.kind)) return false
    if (Object.keys(q).some((k) => k !== 'kind' && !FIELDS[q.kind].includes(k))) return false
    for (const field of ['all', 'any', 'none']) {
        if (q[field] !== undefined && (!Array.isArray(q[field]) || q[field].length > 6 || q[field].some((t) => !TAGS.has(t)))) return false
    }
    for (const field of ['collaborative', 'live', 'onSite', 'inclusive']) if (q[field] !== undefined && typeof q[field] !== 'boolean') return false
    for (const field of ['undocumented', 'count', 'cheapest', 'list']) if (q[field] !== undefined && q[field] !== true) return false
    if (q.status !== undefined && !STATUSES.has(q.status)) return false
    if (q.category !== undefined && !CATEGORIES.has(q.category)) return false
    if (q.order !== undefined && !ORDERS.has(q.order)) return false
    if (q.maxPrice !== undefined && !(Number.isFinite(q.maxPrice) && q.maxPrice > 0 && q.maxPrice < 1e7)) return false
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
const NEGATION = /(\b(not|without|no|don'?t|doesn'?t|do not|does not|except|excluding|exclude|but not|other than|neither|nor)\b|(?<!\b(ke|ka|ki) )\bbina\b)\s*(use|uses|using|have|has|include|includes|with|list|lists)?\s*$/i

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
const COUNT_ASK = /\bhow many\b|\b(number|count|total)\s+of\b|\bkitne\b|कितने/i

const COLLAB = /\b(collaborative|collaborat\w+|team ?(based)?|group|with (a |his )?team|in (a )?team|teammates?)\b.*\bprojects?\b|\bprojects?\b.*\b(collaborat\w+|with (a |his )?team|in (a )?team|as a team|teammates?)\b/i
const SOLO = /\b(solo|individual|alone|by himself|on his own)\b.*\bprojects?\b|\bprojects?\b.*\b(solo|alone|by himself|on his own)\b/i
const NO_LIVE = /\b(no|without|don'?t have|doesn'?t have|lack\w*|missing|not)\s+(a\s+|any\s+)?(verified\s+)?(live|deployed|deployment|demo)\b|\bnot (live|deployed)\b/i
const LIVE = /\bprojects?\b.*\b(live|deployed|hosted|demo links?|live demo)\b|\b(live|deployed|hosted)\b.*\bprojects?\b/i
const LISTED = /\b(listed|on the (site|portfolio|projects page))\b/i
const UNDOCUMENTED = /\b(incomplete|missing|undocumented|unknown|vague)\s+(tech(nology)?|stack)\s*(records?|details?|info\w*)?\b|\bstack\s+(is|isn'?t|not)\s+(documented|recorded|known)\b/i
const STATUS_WORDS = [
    [/\bhistorical|earlier case stud|old(er)? (projects|case)/i, 'historical'],
    [/\b(unverified|not (independently )?verified|owner[- ]reported|user[- ]reported)\b/i, 'owner-reported'],
    [/\b(documented|public repo(sitor(y|ies))?)\b/i, 'documented'],
]
const JOURNEY_ORDER = /\b(latest|most recent|recent|newest|last|current|first|earliest|oldest)\b|सबसे (नया|हालिया|पहला)/i
const JOURNEY_CAT = [
    [/\bhackathons?\b|हैकाथॉन/i, 'Hackathons'], [/\binternships?\b|\bintern\b|इंटर्नशिप/i, 'Internships'], [/\b(certificat\w*|courses?)\b/i, 'Certifications'],
    [/\bworkshops?\b/i, 'Workshops'], [/\bconferences?\b/i, 'Conferences'], [/\bopen[- ]source\b/i, 'Open Source'],
]
// "under / below / less than / cheaper than" is strict; "at most / up to / within / max / budget" is inclusive.
const SERVICE_PRICE = /\bservices?\b.*?\b(under|below|less than|cheaper than|within|upto|up to|max(?:imum)?|at most|budget(?: of)?)\s*(?:₹|rs\.?|inr)?\s*(\d[\d,]*)/i
const CHEAPEST = /\b(cheapest|least expensive|lowest[- ]priced?|most affordable)\b.*\bservices?\b|\bservices?\b.*\b(cheapest|least expensive|lowest price)\b|सबसे सस्ती/i
const SERVICE_LIST = /\b(all|every|list)\b.*\bservices?\b.*\b(prices?|cost)\b|\bservices?\b.*\b(prices|price list|what (do|does) .* cost)\b/i

/**
 * The structured query a question asks, or null. Only clear shapes are taken:
 * anything else goes to retrieval and the model.
 */
export function parseQuery(question) {
    const text = String(question || '')
    if (CHEAPEST.test(text)) return { kind: 'services', cheapest: true }
    const price = text.match(SERVICE_PRICE)
    if (price) {
        const inclusive = !/under|below|less than|cheaper than/i.test(price[1])
        return { kind: 'services', maxPrice: Number(price[2].replace(/,/g, '')), inclusive }
    }
    if (SERVICE_LIST.test(text) && !PROJECT_WORD.test(text)) return { kind: 'services', list: true }
    const category = JOURNEY_CAT.find(([re]) => re.test(text))?.[1]
    const order = text.match(JOURNEY_ORDER)?.[0]?.toLowerCase()
    if (category && order && !PROJECT_WORD.test(text)) {
        return { kind: 'journey', category, order: /first|earliest|oldest|पहला/.test(order) ? 'earliest' : 'latest' }
    }
    if (!PROJECT_WORD.test(text)) return null
    const tags = askedTags(text)
    const counting = COUNT_ASK.test(text)
    const q = { kind: 'filter' }
    if (COLLAB.test(text)) q.collaborative = true
    else if (SOLO.test(text)) q.collaborative = false
    if (NO_LIVE.test(text)) q.live = false
    else if (LIVE.test(text)) q.live = true
    if (LISTED.test(text) && (q.live !== undefined || tags.length)) q.onSite = true
    if (UNDOCUMENTED.test(text)) q.undocumented = true
    const status = STATUS_WORDS.find(([re]) => re.test(text))?.[1]
    if (status && counting) q.status = status
    if (tags.length && (LIST_ASK.test(text) || counting) && (USE_WORD.test(text) || tags.some((t) => t.negated))) {
        const positive = tags.filter((t) => !t.negated).map((t) => t.tag)
        const negative = tags.filter((t) => t.negated).map((t) => t.tag)
        const anyOf = /\b(either|or)\b/i.test(text.replace(/\b(but|and)\s+(not|without)\b.*$/i, '')) && !/\b(both|and)\b/i.test(text.replace(/\b(but|and)\s+(not|without)\b.*$/i, ''))
        if (positive.length) q[anyOf ? 'any' : 'all'] = [...new Set(positive)]
        if (negative.length) q.none = [...new Set(negative)]
        // Next.js is React too: excluding React excludes Next.js.
        if (q.none?.includes('react') && !q.none.includes('nextjs')) q.none.push('nextjs')
    }
    // "How many projects has he completed?": every count, kept apart.
    if (Object.keys(q).length === 1) return counting ? { kind: 'count' } : null
    if (counting) q.count = true
    return validateQuery(q) ? q : null
}

// ── Running a query ─────────────────────────────────────────────────────────

const has = (record, tag) => record.tags.includes(tag)
const STATUS_OF = (p) => (p.statusClass === 'limited' ? 'documented' : p.statusClass === 'idea' ? 'owner-reported' : p.statusClass)

/** Run a validated query. Returns { kind, query, items, unknown, excluded, facts, entities }. */
export function runQuery(records, query) {
    if (!validateQuery(query)) return null
    const projects = records?.projects || []
    if (query.kind === 'count') {
        const by = (cls) => projects.filter((p) => STATUS_OF(p) === cls).length
        return {
            kind: 'count', query, items: [], entities: [],
            facts: {
                listed: records.listedOnSite ?? projects.filter((p) => p.onSite).length,
                records: projects.length,
                offSite: projects.filter((p) => !p.onSite).map((p) => p.name),
                documented: by('documented'),
                historical: by('historical'),
                ownerReported: by('owner-reported'),
                live: projects.filter((p) => p.live).length,
                caseStudies: projects.filter((p) => p.caseStudy).length,
                reposIndexed: records.github?.reposIndexed ?? null,
                reposSnapshot: records.github?.snapshot || '',
            },
        }
    }
    if (query.kind === 'filter') {
        const matchesPositive = (p) => (query.all || []).every((t) => has(p, t)) && (!query.any?.length || query.any.some((t) => has(p, t)))
        const extra = (p) => (query.collaborative === undefined || p.collaborative === query.collaborative)
            && (query.live === undefined || Boolean(p.live) === query.live)
            && (query.onSite === undefined || p.onSite === query.onSite)
            && (!query.undocumented || !p.stackDocumented)
            && (!query.status || STATUS_OF(p) === query.status)
        const candidates = projects.filter((p) => matchesPositive(p) && extra(p))
        const none = query.none || []
        const items = candidates.filter((p) => none.every((t) => !has(p, t)) && (!none.length || p.stackDocumented))
        const unknownNone = none.length ? candidates.filter((p) => !p.stackDocumented && none.every((t) => !has(p, t))) : []
        // With an exclusion: the projects that matched but were excluded, so the
        // answer can say why ("every MongoDB project also lists React").
        const excluded = none.length ? candidates.filter((p) => none.some((t) => has(p, t))) : []
        // A positive condition on an undocumented stack can't be checked either.
        const unchecked = !query.undocumented && (query.all?.length || query.any?.length) ? projects.filter((p) => !p.stackDocumented && extra(p) && !matchesPositive(p)) : []
        return {
            kind: 'filter', query, items, unknown: [...unknownNone, ...unchecked], excluded,
            entities: items.map((p) => p.group).slice(0, 8), facts: { total: projects.length },
        }
    }
    if (query.kind === 'journey') {
        const entries = (records.journey || []).filter((e) => e.category === query.category && e.date)
            .sort((a, b) => (query.order === 'latest' ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date)))
        return { kind: 'journey', query, items: entries.slice(0, 3), entities: [], facts: { total: entries.length } }
    }
    const services = (records.services || []).filter((s) => s.min !== null).sort((a, b) => a.min - b.min)
    const items = query.cheapest ? services.slice(0, 1)
        : query.list ? services
            : services.filter((s) => (query.inclusive ? s.min <= query.maxPrice : s.min < query.maxPrice))
    return { kind: 'services', query, items, entities: [], facts: { total: services.length } }
}

// ── Describing a result: English, Hindi, Hinglish ───────────────────────────

const label = (tag) => TECH_LABEL[tag] || tag
const LIST_JOIN = {
    en: (l) => (l.length <= 2 ? l.join(' and ') : `${l.slice(0, -1).join(', ')} and ${l.at(-1)}`),
    hi: (l) => (l.length <= 2 ? l.join(' और ') : `${l.slice(0, -1).join(', ')} और ${l.at(-1)}`),
    hinglish: (l) => (l.length <= 2 ? l.join(' aur ') : `${l.slice(0, -1).join(', ')} aur ${l.at(-1)}`),
}
const OR_JOIN = { en: ' or ', hi: ' या ', hinglish: ' ya ' }
const STATUS_I18N = {
    en: STATUS_TEXT,
    hi: {
        documented: 'सार्वजनिक रिपॉज़िटरी में दस्तावेज़ित', limited: 'सीमित दस्तावेज़ वाली सार्वजनिक रिपॉज़िटरी',
        historical: 'पुराना पोर्टफोलियो केस स्टडी (ऐतिहासिक)', 'owner-reported': 'गौरव द्वारा बताया गया, स्वतंत्र रूप से सत्यापित नहीं', idea: 'गौरव द्वारा बताया गया विचार',
    },
    hinglish: {
        documented: 'public repository mein documented', limited: 'public repository, limited documentation',
        historical: 'purani portfolio case study (historical)', 'owner-reported': 'Gaurav ne bataya hai, independently verified nahi', idea: 'Gaurav ka bataya hua idea',
    },
}
const STATUS_GROUP = {
    en: { documented: 'documented in a public repository', historical: 'kept as earlier, historical case studies', 'owner-reported': 'described by Gaurav but not independently verified' },
    hi: { documented: 'सार्वजनिक रिपॉज़िटरी में दस्तावेज़ित', historical: 'पुराने, ऐतिहासिक केस स्टडी', 'owner-reported': 'गौरव द्वारा बताए गए पर स्वतंत्र रूप से सत्यापित नहीं' },
    hinglish: { documented: 'public repository mein documented', historical: 'purani, historical case studies', 'owner-reported': 'Gaurav ne bataye par independently verified nahi' },
}

/** The conditions of a filter, in words. */
function conditions(query, lang) {
    const join = LIST_JOIN[lang]
    const named = (tags) => tags.filter((t) => !(t === 'nextjs' && (query.none || []).includes('react'))).map((t) => (t === 'react' && (query.none || []).includes('nextjs') ? 'React (Next.js)' : label(t)))
    const out = []
    const T = {
        en: {
            all: (l) => `whose recorded stack includes ${join(l)}`, any: (l) => `whose recorded stack includes ${l.join(OR_JOIN.en)}`,
            none: (l) => `whose recorded stack doesn't list ${l.join(OR_JOIN.en)}`, team: 'built with a team', solo: 'built solo (no teammates recorded)',
            live: 'with a recorded live demo link', nolive: 'without a recorded live demo link', site: 'listed on the Projects page',
            undoc: "whose stack isn't documented in detail",
        },
        hi: {
            all: (l) => `जिनके दर्ज स्टैक में ${join(l)} हैं`, any: (l) => `जिनके दर्ज स्टैक में ${l.join(OR_JOIN.hi)} है`,
            none: (l) => `जिनके दर्ज स्टैक में ${l.join(OR_JOIN.hi)} नहीं है`, team: 'जो टीम के साथ बने', solo: 'जो अकेले बने (कोई टीममेट दर्ज नहीं)',
            live: 'जिनका लाइव डेमो लिंक दर्ज है', nolive: 'जिनका लाइव डेमो लिंक दर्ज नहीं है', site: 'जो प्रोजेक्ट पेज पर सूचीबद्ध हैं',
            undoc: 'जिनका स्टैक विस्तार से दर्ज नहीं है',
        },
        hinglish: {
            all: (l) => `jinke recorded stack mein ${join(l)} hain`, any: (l) => `jinke recorded stack mein ${l.join(OR_JOIN.hinglish)} hai`,
            none: (l) => `jinke recorded stack mein ${l.join(OR_JOIN.hinglish)} listed nahi hai`, team: 'jo team ke saath bane', solo: 'jo akele bane (koi teammate recorded nahi)',
            live: 'jinka live demo link recorded hai', nolive: 'jinka live demo link recorded nahi hai', site: 'jo Projects page par listed hain',
            undoc: 'jinka stack detail mein documented nahi hai',
        },
    }[lang]
    if (query.all?.length) out.push(T.all(named(query.all)))
    if (query.any?.length) out.push(T.any(named(query.any)))
    if (query.none?.length) out.push(T.none(named(query.none)))
    if (query.collaborative === true) out.push(T.team)
    if (query.collaborative === false) out.push(T.solo)
    if (query.live === true) out.push(T.live)
    if (query.live === false) out.push(T.nolive)
    if (query.onSite) out.push(T.site)
    if (query.undocumented) out.push(T.undoc)
    if (query.status) out.push(STATUS_GROUP[lang][query.status])
    return join(out)
}

function describeFilter(result, lang) {
    const { query, items, unknown, excluded } = result
    const join = LIST_JOIN[lang]
    const total = result.facts.total
    const cond = conditions(query, lang)
    const status = STATUS_I18N[lang]
    const row = (p) => `- **${p.name}**: ${p.stack.slice(0, 7).join(', ') || '—'}${p.url ? ` (${p.url})` : ''}${p.statusClass !== 'documented' ? ` · ${status[p.statusClass]}` : ''}`
    const head = {
        en: items.length ? `**${items.length}** of the ${total} project records ${items.length === 1 ? 'matches' : 'match'} (projects ${cond}):` : `None of the ${total} project records match (projects ${cond}).`,
        hi: items.length ? `${total} प्रोजेक्ट रिकॉर्ड में से **${items.length}** मेल खाते हैं (प्रोजेक्ट ${cond}):` : `${total} प्रोजेक्ट रिकॉर्ड में से कोई भी मेल नहीं खाता (प्रोजेक्ट ${cond})।`,
        hinglish: items.length ? `${total} project records mein se **${items.length}** match karte hain (projects ${cond}):` : `${total} project records mein se koi bhi match nahi karta (projects ${cond}).`,
    }[lang]
    const lines = [head]
    const shown = query.count && items.length > 12 ? [] : items.slice(0, 12)
    lines.push(...shown.map(row))
    if (query.count && items.length > 12) lines.push(join(items.map((p) => p.name)))
    else if (items.length > 12) lines.push({ en: `- …and ${items.length - 12} more on the Projects page.`, hi: `- …और ${items.length - 12} प्रोजेक्ट पेज पर।`, hinglish: `- …aur ${items.length - 12} Projects page par.` }[lang])
    if (excluded?.length && !items.length) {
        const names = excluded.map((p) => p.name)
        const list = names.length > 8 ? `${names.slice(0, 8).join(', ')} (+${names.length - 8})` : join(names)
        lines.push('', {
            en: `Every project that meets the other conditions also lists what you excluded: ${list}.`,
            hi: `बाकी शर्तों वाले हर प्रोजेक्ट के स्टैक में वह भी दर्ज है जिसे आपने बाहर रखा: ${list}।`,
            hinglish: `Baaki conditions wale har project ke stack mein woh bhi listed hai jo aapne exclude kiya: ${list}.`,
        }[lang])
    }
    if (unknown?.length) {
        const names = join(unknown.slice(0, 5).map((p) => p.name))
        lines.push('', {
            en: `${names} ${unknown.length === 1 ? "doesn't have its" : "don't have their"} stack documented in detail, so ${unknown.length === 1 ? 'it' : 'they'} can't be checked either way.`,
            hi: `${names} का स्टैक विस्तार से दर्ज नहीं है, इसलिए इन्हें किसी भी तरफ़ जाँचा नहीं जा सकता।`,
            hinglish: `${names} ka stack detail mein documented nahi hai, isliye inhe kisi bhi taraf check nahi kiya ja sakta.`,
        }[lang])
    }
    if (query.none?.length && items.length) {
        lines.push('', { en: "A record that doesn't list a technology isn't proof the project never used it.", hi: 'किसी रिकॉर्ड में कोई तकनीक दर्ज न होना इस बात का सबूत नहीं कि प्रोजेक्ट में वह कभी इस्तेमाल नहीं हुई।', hinglish: 'Kisi record mein koi technology listed na hona is baat ka saboot nahi ki project mein woh kabhi use nahi hui.' }[lang])
    }
    if (query.live !== undefined) {
        lines.push('', { en: "A recorded live demo link hasn't been checked as currently working.", hi: 'दर्ज लाइव डेमो लिंक के अभी चलने की जाँच नहीं की गई है।', hinglish: 'Recorded live demo link abhi chal raha hai ya nahi, yeh check nahi kiya gaya.' }[lang])
    }
    if (query.collaborative === true) {
        lines.push('', { en: 'Collaborative means the site or the records name teammates.', hi: 'टीम प्रोजेक्ट का मतलब: साइट या रिकॉर्ड में टीममेट्स के नाम दर्ज हैं।', hinglish: 'Team project ka matlab: site ya records mein teammates ke naam listed hain.' }[lang])
    }
    return lines.join('\n')
}

const CATEGORY_I18N = {
    hi: { Hackathons: 'हैकाथॉन', Internships: 'इंटर्नशिप', Certifications: 'सर्टिफ़िकेशन', Workshops: 'वर्कशॉप', Conferences: 'कॉन्फ़्रेंस', 'Open Source': 'ओपन सोर्स' },
    hinglish: { Hackathons: 'hackathon', Internships: 'internship', Certifications: 'certification', Workshops: 'workshop', Conferences: 'conference', 'Open Source': 'open source' },
}

function describeCount(f, lang) {
    const join = LIST_JOIN[lang]
    const examples = join(f.offSite.slice(0, 3))
    if (lang === 'hi') {
        return [
            `पोर्टफोलियो के प्रोजेक्ट पेज पर **${f.listed}** प्रोजेक्ट सूचीबद्ध हैं। सभी पूर्ण हो चुके प्रोजेक्ट की सत्यापित संख्या उपलब्ध नहीं है: रिकॉर्ड बताते हैं कि हर प्रोजेक्ट कैसे दस्तावेज़ित है, यह नहीं कि वह पूरा हुआ या नहीं।`,
            `- **असिस्टेंट के पास प्रोजेक्ट रिकॉर्ड:** ${f.records} (पेज के ${f.listed}, और ${f.offSite.length} जो पेज पर नहीं हैं, जैसे ${examples})`,
            `- **दस्तावेज़ के अनुसार:** ${f.documented} सार्वजनिक रिपॉज़िटरी में दस्तावेज़ित, ${f.historical} पुराने ऐतिहासिक केस स्टडी, ${f.ownerReported} गौरव द्वारा बताए गए पर स्वतंत्र रूप से सत्यापित नहीं`,
            `- **दर्ज लाइव डेमो लिंक:** ${f.live} (इनके अभी चलने की जाँच नहीं की गई)`,
            f.reposIndexed ? `\nGitHub पर ${f.reposIndexed} सार्वजनिक रिपॉज़िटरी थीं (${f.reposSnapshot} तक), पर रिपॉज़िटरी और प्रोजेक्ट एक ही चीज़ नहीं हैं।` : '',
        ].filter(Boolean).join('\n')
    }
    if (lang === 'hinglish') {
        return [
            `Portfolio ke Projects page par **${f.listed}** projects listed hain. Sabhi completed projects ka verified count available nahi hai: records batate hain ki har project kaise documented hai, yeh nahi ki woh poora hua ya nahi.`,
            `- **Assistant ke paas project records:** ${f.records} (page ke ${f.listed}, aur ${f.offSite.length} jo page par nahi hain, jaise ${examples})`,
            `- **Documentation ke hisaab se:** ${f.documented} public repository mein documented, ${f.historical} purani historical case studies, ${f.ownerReported} Gaurav ne bataye par independently verified nahi`,
            `- **Recorded live demo links:** ${f.live} (abhi chal rahe hain ya nahi, yeh check nahi kiya gaya)`,
            f.reposIndexed ? `\nGitHub par ${f.reposIndexed} public repositories thi (${f.reposSnapshot} tak), par repositories aur projects ek cheez nahi hain.` : '',
        ].filter(Boolean).join('\n')
    }
    return [
        `**${f.listed}** projects are listed on the Portfolio's Projects page. There's no verified count of *completed* projects: the records say how each project is documented, not whether it is finished.`,
        `- **Project records the assistant knows:** ${f.records} (the ${f.listed} on the page plus ${f.offSite.length} that aren't, such as ${examples})`,
        `- **By documentation:** ${f.documented} documented in a public repository, ${f.historical} earlier case studies kept as historical, ${f.ownerReported} described by Gaurav but not independently verified`,
        `- **With a recorded live demo link:** ${f.live} (not checked as currently working)`,
        f.reposIndexed ? `\nHis GitHub had ${f.reposIndexed} public repositories when it was indexed (${f.reposSnapshot}), but repositories aren't the same as projects.` : '',
    ].filter(Boolean).join('\n')
}

function describeJourney(result, lang) {
    const [first, ...rest] = result.items
    const latest = result.query.order === 'latest'
    const cat = result.query.category
    if (lang === 'hi') {
        const kind = CATEGORY_I18N.hi[cat] || cat
        if (!first) return `जर्नी पेज पर कोई ${kind} दर्ज नहीं है।`
        return [
            `जर्नी पेज पर उनका ${latest ? 'सबसे हालिया' : 'सबसे पहला'} ${kind} **${first.title}**${first.organization ? ` (${first.organization})` : ''} है: ${first.dateLabel || first.date}${first.status ? `, स्थिति: ${first.status}` : ''}।`,
            rest.length ? `${latest ? 'उससे पहले' : 'उसके बाद'}: ${rest.map((e) => `${e.title} (${e.dateLabel || e.date})`).join('; ')}।` : '',
            'सभी प्रविष्टियाँ जर्नी पेज (/journey) पर हैं।',
        ].filter(Boolean).join('\n')
    }
    if (lang === 'hinglish') {
        const kind = CATEGORY_I18N.hinglish[cat] || cat
        if (!first) return `Journey page par koi ${kind} listed nahi hai.`
        return [
            `Journey page par unka ${latest ? 'sabse recent' : 'sabse pehla'} ${kind} **${first.title}**${first.organization ? ` (${first.organization})` : ''} hai: ${first.dateLabel || first.date}${first.status ? `, status: ${first.status}` : ''}.`,
            rest.length ? `${latest ? 'Usse pehle' : 'Uske baad'}: ${rest.map((e) => `${e.title} (${e.dateLabel || e.date})`).join('; ')}.` : '',
            'Saari entries Journey page (/journey) par hain.',
        ].filter(Boolean).join('\n')
    }
    const kind = cat.toLowerCase().replace(/s$/, '')
    if (!first) return `The Journey page doesn't list any ${kind} entries.`
    return [
        `His ${latest ? 'most recent' : 'earliest'} ${kind} on the Journey page is **${first.title}**${first.organization ? ` (${first.organization})` : ''}, ${first.dateLabel || first.date}${first.status ? `, ${first.status.toLowerCase()}` : ''}.`,
        rest.length ? `${latest ? 'Before that' : 'After that'}: ${rest.map((e) => `${e.title} (${e.dateLabel || e.date})`).join('; ')}.` : '',
        'All entries are on the Journey page (/journey).',
    ].filter(Boolean).join('\n')
}

function describeServices(result, lang) {
    const { items, query } = result
    const price = `₹${query.maxPrice}`
    const rows = items.map((s) => `- **${s.title}**: ${s.priceLabel} (${s.url})`)
    const T = {
        en: {
            none: `No service starts ${query.inclusive ? 'at or under' : 'below'} ${price}. The prices are on the Services page (/services).`,
            some: `Services that start ${query.inclusive ? 'at or under' : 'below'} ${price}:`, cheapest: 'The lowest-priced service:', list: 'All services and their prices:',
        },
        hi: {
            none: `कोई भी सेवा ${price} ${query.inclusive ? 'या उससे कम' : 'से कम'} से शुरू नहीं होती। कीमतें सर्विसेज़ पेज (/services) पर हैं।`,
            some: `जो सेवाएँ ${price} ${query.inclusive ? 'या उससे कम' : 'से कम'} से शुरू होती हैं:`, cheapest: 'सबसे कम कीमत वाली सेवा:', list: 'सभी सेवाएँ और उनकी कीमतें:',
        },
        hinglish: {
            none: `Koi bhi service ${price} ${query.inclusive ? 'ya usse kam' : 'se kam'} se shuru nahi hoti. Prices Services page (/services) par hain.`,
            some: `Jo services ${price} ${query.inclusive ? 'ya usse kam' : 'se kam'} se shuru hoti hain:`, cheapest: 'Sabse kam price wali service:', list: 'Saari services aur unke prices:',
        },
    }[lang]
    if (!items.length) return T.none
    return [query.cheapest ? T.cheapest : query.list ? T.list : T.some, ...rows].join('\n')
}

/** The answer text for a result, exact, in 'en', 'hi' or 'hinglish' (no model). */
export function describeResult(result, lang = 'en') {
    if (!result) return ''
    const language = LIST_JOIN[lang] ? lang : 'en'
    if (result.kind === 'count') return describeCount(result.facts, language)
    if (result.kind === 'filter') return describeFilter(result, language)
    if (result.kind === 'journey') return describeJourney(result, language)
    return describeServices(result, language)
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

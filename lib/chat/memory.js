// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// Conversation memory (D-134). The source of truth is this conversation's
// stored turns (chat_turns), read server-side and only for the visitor that
// owns them (owner = keyed hash of visitor id + conversation id, store.js).
// A conversation id alone is not authorisation, and the browser never sends
// earlier answers, so pasted "assistant" text can't become history.
//
// What it provides, all in deterministic code:
// - recall: the first, previous or n-th question, an earlier answer, the list
//   of projects discussed, today's turns (by the visitor's own time zone)
// - entity memory: the projects each turn was about, in discussion order, so
//   "both", "the first one", "compare all three" or "its architecture" resolve
//   to real projects, or to a clarification question when they can't
// - a pending clarification: "Which project?" keeps the original question, and
//   a reply naming a project completes it
// - answer transformations: shorter, simpler, more detail, translate, a
//   real-life example, a table, again; they work on the previous answer and
//   its evidence, with no fresh search
// Stored text is data: it reaches a model only fenced as conversation data.

import { PENDING_MAX_AGE_MS, PREVIOUS_TURN_MAX_AGE_MS, WORKING_ANSWER_CHARS, WORKING_CHARS, WORKING_TURNS } from './config.js'

const NUMBER_WORDS = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 }
const ORDINALS = { first: 1, '1st': 1, second: 2, '2nd': 2, third: 3, '3rd': 3, fourth: 4, '4th': 4, fifth: 5, '5th': 5, pehla: 1, pehle: 1, dusra: 2, doosra: 2, teesra: 3, tisra: 3 }

// ── Recall and summary requests ─────────────────────────────────────────────

const ASKED_ME = /\b(question|questions|message|messages|asked|ask|query|sawal|puchha|pucha)\b/i
const RECALL = [
    ['first-question', /\b(my|the)\s+(very\s+)?(first|1st)\s+(question|message|query)\b|\bwhat did i (ask|say)( you)? (first|at first|initially|(at|in) the (very )?(start|beginning))\b|\bwhat was the first thing i (asked|said)\b|\bhow did (i|this conversation) start\b|\bpehla (sawal|question|message)\b|पहला (सवाल|प्रश्न)/i],
    ['last-question', /\b(my|the)\s+(last|previous|prev|earlier|latest)\s+(question|message|query)\b|\bwhat did i (just )?ask( you)?( before| last| previously)?\s*\??$|\bpichla (sawal|question)\b|पिछला (सवाल|प्रश्न)/i],
    ['first-answer', /\b(your|the)\s+(first|1st)\s+(answer|reply|response)\b|\bwhat did you (say|tell me|answer) (first|at first|at the start)\b/i],
    ['last-answer', /\b(your|the)\s+(last|previous|earlier)\s+(answer|reply|response)\b|\bwhat did you (just )?(say|tell me|answer|reply)\s*\??$/i],
    ['projects', /\b(which|what) projects (have|did) (we|you|i) (discuss|discussed|talk about|talked about|cover|covered|mention|mentioned)\b|\bprojects (we|you) (have )?(discussed|talked about|mentioned|covered)\b/i],
]
const AGO = /\b(\d{1,2}|one|two|three|four|five|six|seven|eight|nine|ten)\s+(messages?|questions?|turns?|answers?|replies)\s+(ago|back|before|earlier)\b/i
const SUMMARY = /\b(summari[sz]e|summary|recap|sum up|overview)\b.{0,40}\b(chat|conversation|discussion|everything|so far|today|we|our|this session|talk)\b|\b(chat|conversation|discussion)\b.{0,20}\b(summary|recap)\b|\bwhat (have|did) we (talk|chat|discuss|cover)(ed)?( about)?\b|\bbaat(cheet)?\s+(ka|ki)\s+(summary|saar)\b|\bab tak (kya|ki) baat\b|बातचीत (का )?सार/i

/**
 * A conversation operation the question asks for, or null:
 * { kind: 'recall', which: 'first-question'|'last-question'|'first-answer'|'last-answer'|'projects'|'nth', n?, answer? }
 * { kind: 'summary', today }
 */
export function conversationOp(question) {
    const text = String(question || '')
    if (SUMMARY.test(text)) return { kind: 'summary', today: /\btoday|aaj\b|आज/i.test(text) }
    const ago = text.match(AGO)
    if (ago && (ASKED_ME.test(text) || /\b(you|tell|told|said|answer)\b/i.test(text))) {
        const n = Number(ago[1]) || NUMBER_WORDS[ago[1].toLowerCase()] || 1
        return { kind: 'recall', which: 'nth', n, answer: /\b(you|tell|told|said|answer|replies|reply)\b/i.test(text) && !/\bi (ask|said)\b/i.test(text) }
    }
    for (const [which, re] of RECALL) if (re.test(text)) return { kind: 'recall', which }
    return null
}

/** Turns oldest first, without fixed small-talk replies when asked for "questions". */
const chronological = (turns) => [...turns].sort((a, b) => a.at - b.at)
const clip = (text, max) => {
    const flat = String(text || '').replace(/\s+/g, ' ').trim()
    return flat.length > max ? `${flat.slice(0, max).replace(/\s+\S*$/, '')}…` : flat
}

/** The calendar date of a time in a time zone ("2026-11-26"). */
export function localDate(ms, timeZone = 'UTC') {
    try {
        return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(ms))
    } catch {
        return new Date(ms).toISOString().slice(0, 10)
    }
}
export const validTimeZone = (tz) => {
    if (typeof tz !== 'string' || tz.length > 64 || !/^[A-Za-z_]+(\/[A-Za-z0-9_+-]+){0,2}$/.test(tz)) return null
    try { new Intl.DateTimeFormat('en', { timeZone: tz }); return tz } catch { return null }
}

// ── Exact recall (stabilization F04) ────────────────────────────────────────
// Each request reads exactly what it needs, through the visitor's own
// ownership binding, never by conversation id alone: the first question is
// the earliest record (not the oldest of the latest 40), "n questions ago" is
// the n-th record counted back from the newest. One "question" is one visitor
// message with its answer; "5 messages ago" is read the same way and said so.

const RECALL_ANSWER_CHARS = 1500

/** Load what a recall needs. `recent`: the newest turns already read (desc). */
export async function loadRecall(op, { store, sessionId, owner, recent = [] }) {
    const history = (options) => store.historyTurns(sessionId, owner, options)
    if (op.which === 'first-question') return { turn: (await history({ order: 'asc', limit: 1 }))[0] || null }
    if (op.which === 'first-answer') return { turn: (await history({ order: 'asc', limit: 10 })).find((t) => t.a) || null }
    if (op.which === 'last-question') return { turn: recent[0] || null }
    if (op.which === 'last-answer') return { turn: recent.find((t) => t.a) || null }
    if (op.which === 'nth') {
        const [turn] = await history({ order: 'desc', skip: op.n - 1, limit: 1 })
        return { turn: turn || null, total: turn ? null : await store.countTurns(sessionId, owner) }
    }
    // Projects discussed: every turn's entities, a bounded number of pages.
    const all = []
    for (let page = 0; page < 5; page += 1) {
        const batch = await history({ order: 'asc', skip: page * 100, limit: 100 })
        all.push(...batch)
        if (batch.length < 100) break
    }
    return { list: all }
}

const RECALL_TEXT = {
    en: {
        empty: "I don't have any earlier messages from this conversation, so there's nothing to recall. (New chat starts an empty conversation; records older than 180 days are deleted.)",
        first: (q) => `Your first question in this conversation was ${q}`,
        previous: (q) => `Your previous question was ${q}`,
        asked: (q) => `You asked ${q}, and I answered:`,
        noAnswer: "I haven't answered anything in this conversation yet.",
        nth: (n, q) => `${n} ${n === 1 ? 'question' : 'questions'} ago you asked ${q}`,
        nthAnswer: (n, q) => `${n} ${n === 1 ? 'question' : 'questions'} ago you asked ${q}, and I answered:`,
        tooFar: (total, n) => `This conversation has ${total} earlier ${total === 1 ? 'question' : 'questions'}, so there is none ${n} back.`,
        excerpt: '(This is the start of that answer; the full answer was longer.)',
        cut: '(That answer was cut short at the time, so this is all of it there is.)',
        noProjects: "We haven't discussed a specific project in this conversation yet.",
        projects: (l) => `Projects we've discussed so far, in order: ${l}.`,
    },
    hi: {
        empty: 'इस बातचीत में पहले का कोई संदेश मेरे पास नहीं है, इसलिए याद दिलाने के लिए कुछ नहीं है। (New chat एक खाली बातचीत शुरू करता है; 180 दिन से पुराने रिकॉर्ड हटा दिए जाते हैं।)',
        first: (q) => `इस बातचीत में आपका पहला सवाल था: ${q}`,
        previous: (q) => `आपका पिछला सवाल था: ${q}`,
        asked: (q) => `आपने पूछा था ${q}, और मैंने जवाब दिया:`,
        noAnswer: 'इस बातचीत में मैंने अभी तक कोई जवाब नहीं दिया है।',
        nth: (n, q) => `${n} सवाल पहले आपने पूछा था: ${q}`,
        nthAnswer: (n, q) => `${n} सवाल पहले आपने पूछा था ${q}, और मैंने जवाब दिया:`,
        tooFar: (total, n) => `इस बातचीत में पहले के केवल ${total} सवाल हैं, इसलिए ${n} सवाल पहले का कोई सवाल नहीं है।`,
        excerpt: '(यह उस जवाब की शुरुआत है; पूरा जवाब इससे लंबा था।)',
        cut: '(वह जवाब उस समय बीच में ही कट गया था, इसलिए इतना ही है।)',
        noProjects: 'इस बातचीत में अभी तक किसी खास प्रोजेक्ट पर बात नहीं हुई है।',
        projects: (l) => `अब तक जिन प्रोजेक्ट पर बात हुई, क्रम से: ${l}।`,
    },
    hinglish: {
        empty: 'Is conversation mein pehle ka koi message mere paas nahi hai, isliye yaad dilane ke liye kuch nahi hai. (New chat ek khaali conversation shuru karta hai; 180 din se purane records delete ho jaate hain.)',
        first: (q) => `Is conversation mein aapka pehla sawal tha: ${q}`,
        previous: (q) => `Aapka pichla sawal tha: ${q}`,
        asked: (q) => `Aapne pucha tha ${q}, aur maine jawab diya:`,
        noAnswer: 'Is conversation mein maine abhi tak koi jawab nahi diya hai.',
        nth: (n, q) => `${n} sawal pehle aapne pucha tha: ${q}`,
        nthAnswer: (n, q) => `${n} sawal pehle aapne pucha tha ${q}, aur maine jawab diya:`,
        tooFar: (total, n) => `Is conversation mein pehle ke sirf ${total} sawal hain, isliye ${n} sawal pehle ka koi sawal nahi hai.`,
        excerpt: '(Yeh us jawab ki shuruaat hai; poora jawab isse lamba tha.)',
        cut: '(Woh jawab us waqt beech mein hi cut ho gaya tha, isliye itna hi hai.)',
        noProjects: 'Is conversation mein abhi tak kisi khaas project par baat nahi hui hai.',
        projects: (l) => `Ab tak jin projects par baat hui, order mein: ${l}.`,
    },
}

/**
 * The recall answer, exact, in the visitor's language. Questions are quoted
 * whole (they are at most 500 characters); a long answer is shown from its
 * start and said to be an excerpt; an answer cut short at the time says so.
 * Returns { text, found, entities }.
 */
export function recallAnswer(op, data, { nameOf = (g) => g, lang = 'en' } = {}) {
    const T = RECALL_TEXT[lang] || RECALL_TEXT.en
    const quote = (t) => `“${String(t.q || '').trim()}”`
    const answerOf = (t) => {
        const full = String(t.a || '').trim()
        const shown = full.length > RECALL_ANSWER_CHARS ? `${full.slice(0, RECALL_ANSWER_CHARS).replace(/\s+\S*$/, '')}…\n\n${T.excerpt}` : full
        return t.complete === false ? `${shown}\n\n${T.cut}` : shown
    }
    if (op.which === 'projects') {
        const groups = discussed(data.list || [])
        if (!(data.list || []).length) return { found: false, text: T.empty, entities: [] }
        if (!groups.length) return { found: true, text: T.noProjects, entities: [] }
        return { found: true, text: T.projects(groups.map((g) => `**${nameOf(g)}**`).join(', ')), entities: groups }
    }
    const t = data.turn
    if (!t) {
        if (op.which === 'nth' && data.total) return { found: false, text: T.tooFar(data.total, op.n), entities: [] }
        if (op.which === 'first-answer' || op.which === 'last-answer') return { found: false, text: T.noAnswer, entities: [] }
        return { found: false, text: T.empty, entities: [] }
    }
    const entities = t.entities || []
    if (op.which === 'first-question') return { found: true, text: T.first(quote(t)), entities }
    if (op.which === 'last-question') return { found: true, text: T.previous(quote(t)), entities }
    if (op.which === 'nth') {
        return op.answer && t.a
            ? { found: true, text: `${T.nthAnswer(op.n, quote(t))}\n\n${answerOf(t)}`, entities }
            : { found: true, text: T.nth(op.n, quote(t)), entities }
    }
    return { found: true, text: `${T.asked(quote(t))}\n\n${answerOf(t)}`, entities }
}

// ── Summaries over the whole conversation (stabilization F03) ───────────────
// The turns are read in bounded pages (at most SUMMARY_MAX_TURNS), oldest
// first, greetings and other fixed replies left out. Each turn becomes one
// compact line (the question, and the first sentence of its answer), within a
// character budget; when even that doesn't fit, the oldest turns keep only
// their question, and past that the summary covers the latest turns and says
// how many it left out. One model call summarises the lines (never an earlier
// summary), and a coverage line written in code says what was covered.

export const SUMMARY_MAX_TURNS = 300
const SUMMARY_CHARS = 9000

/** The turns a summary covers: today's (visitor's time zone) or the whole conversation. */
export async function loadSummary({ store, sessionId, owner, today = false, timeZone = 'UTC', now = Date.now() }) {
    const since = today ? now - 36 * 60 * 60 * 1000 : null
    const all = []
    for (let page = 0; page * 100 < SUMMARY_MAX_TURNS; page += 1) {
        const batch = await store.historyTurns(sessionId, owner, { order: 'asc', skip: page * 100, limit: 100, since })
        all.push(...batch)
        if (batch.length < 100) break
    }
    const day = localDate(now, timeZone)
    const inScope = today ? all.filter((t) => localDate(t.at, timeZone) === day) : all
    const total = today || all.length < SUMMARY_MAX_TURNS ? inScope.length : await store.countTurns(sessionId, owner)
    const turns = inScope.filter((t) => t.q && t.operation !== 'reply')
    return { turns, total, read: inScope.length }
}

/** Compact lines for the model within the budget. Returns { conversation, covered, dropped }. */
export function compactHistory(turns, budget = SUMMARY_CHARS) {
    const full = turns.map((t) => ({ q: clip(t.q, 220), a: t.a ? `${clip(firstSentence(t.a), 200)}${t.complete === false ? ' [answer was cut short]' : ''}` : '' }))
    const size = (list) => list.reduce((sum, t) => sum + t.q.length + t.a.length + 30, 0)
    if (size(full) <= budget) return { conversation: full, covered: turns.length, dropped: 0 }
    // Older turns keep only their question.
    const lean = full.map((t, i) => (i < full.length - 20 ? { q: clip(t.q, 140), a: '' } : t))
    if (size(lean) <= budget) return { conversation: lean, covered: turns.length, dropped: 0 }
    // Still too long: the latest turns, and say how many were left out.
    const kept = []
    for (let i = lean.length - 1; i >= 0 && size(kept) + lean[i].q.length + lean[i].a.length + 30 <= budget; i -= 1) kept.unshift(lean[i])
    return { conversation: kept, covered: kept.length, dropped: turns.length - kept.length }
}

/** What a summary covered, said in code (never left to the model). */
export function coverageNote({ covered, total, dropped = 0, today = false, lang = 'en' }) {
    const T = {
        en: dropped
            ? `Covered: the latest ${covered} of ${total} questions${today ? ' from today' : ''}; the ${dropped} earliest aren't included.`
            : total > covered
                ? `Covered: ${covered} questions${today ? ' from today' : ''}; ${total - covered} more are older than the ${SUMMARY_MAX_TURNS} turns a summary reads.`
                : `Covered: all ${covered} ${covered === 1 ? 'question' : 'questions'}${today ? ' from today' : ' in this conversation'} (greetings left out).`,
        hi: dropped
            ? `शामिल: ${total} में से आख़िरी ${covered} सवाल${today ? ' (आज के)' : ''}; सबसे पहले के ${dropped} शामिल नहीं हैं।`
            : total > covered
                ? `शामिल: ${covered} सवाल; ${total - covered} और सवाल ${SUMMARY_MAX_TURNS} की सीमा से पुराने हैं।`
                : `शामिल: ${today ? 'आज के' : 'इस बातचीत के'} सभी ${covered} सवाल (अभिवादन छोड़कर)।`,
        hinglish: dropped
            ? `Covered: ${total} mein se aakhri ${covered} sawal${today ? ' (aaj ke)' : ''}; sabse pehle ke ${dropped} shaamil nahi hain.`
            : total > covered
                ? `Covered: ${covered} sawal; ${total - covered} aur sawal ${SUMMARY_MAX_TURNS} ki limit se purane hain.`
                : `Covered: ${today ? 'aaj ke' : 'is conversation ke'} saare ${covered} sawal (greetings chhodkar).`,
    }
    return `_${T[lang] || T.en}_`
}

/** A plain summary without a model: each question and the first line of its answer. */
export function plainSummary(turns, { today = false, lang = 'en' } = {}) {
    const T = {
        en: { none: today ? "We haven't talked yet today in this conversation." : 'This conversation has no earlier messages to summarise yet.', head: today ? "Here's what we covered today" : "Here's what we've covered", asked: 'You asked' },
        hi: { none: today ? 'इस बातचीत में आज अभी तक कोई बात नहीं हुई है।' : 'इस बातचीत में सारांश के लिए अभी कोई संदेश नहीं है।', head: today ? 'आज हमने इन बातों पर चर्चा की' : 'अब तक हमने इन बातों पर चर्चा की', asked: 'आपने पूछा' },
        hinglish: { none: today ? 'Is conversation mein aaj abhi tak koi baat nahi hui hai.' : 'Is conversation mein summary ke liye abhi koi message nahi hai.', head: today ? 'Aaj humne in baaton par baat ki' : 'Ab tak humne in baaton par baat ki', asked: 'Aapne pucha' },
    }[lang] || {}
    if (!turns.length) return T.none
    const lines = turns.slice(-60).map((t, i) => `${i + 1}. ${T.asked} “${clip(t.q, 160)}”${t.a ? `: ${clip(firstSentence(t.a), 180)}` : ''}`)
    return `${T.head}:\n${lines.join('\n')}`
}
const firstSentence = (text) => String(text || '').replace(/\[\d+(?:,\s*\d+)*\]/g, '').replace(/[*#>|]/g, '').split(/(?<=[.!?।])\s/)[0]

// ── Entity memory ───────────────────────────────────────────────────────────

/** Project groups in the order they were first discussed (oldest first). */
export function discussed(turns) {
    const out = []
    for (const t of chronological(turns)) for (const g of t.entities || []) if (!out.includes(g)) out.push(g)
    return out
}

/** Project groups by recency: the most recently discussed first. */
function recentEntities(turns) {
    const out = []
    for (const t of [...turns].sort((a, b) => b.at - a.at)) for (const g of t.entities || []) if (!out.includes(g)) out.push(g)
    return out
}

const BOTH = /\b(both|these two|those two|the two|the pair|dono|दोनों)\b/i
const ALL_N = /\b(all|these|those|the)\s+(three|four|five|3|4|5)\b|\b(teeno|teenon|तीनों)\b/i
const ALL_OF = /\b(all of them|all of these|all those projects|all these projects|each of them)\b/i
const ORDINAL_REF = /\b(first|1st|second|2nd|third|3rd|fourth|4th|fifth|5th|last|pehla|pehle|dusra|doosra|teesra|tisra)\b(\s+(one|project|app|of them|wala|wale))?/gi
const SINGULAR_REF = /\b(it|its|it's|this project|that project|the project|this app|that app|the app|that application|this application|the same project|this one|that one|the one we discussed|the project we discussed|the previous project|is project|iss project|us project|uska|uski|uske|is app|ye project|yeh project|wo project|woh project|इस प्रोजेक्ट|उस प्रोजेक्ट)\b/i
// "His project", "the project", "its architecture" with nothing named.
export const VAGUE_PROJECT = /\b(his|the|this|that|its|a|one of his|is|iss|uska|uske)\s+(project|app|application|system)\b(?!s)|\bits\s+(architecture|stack|backend|frontend|database|design|tech stack|features?)\b|प्रोजेक्ट का आर्किटेक्चर/i

/**
 * Resolve references to earlier projects. `named`: groups the question names
 * itself. Returns { entities, how, ambiguous, choices }:
 * - how 'named'       the question names them
 * - how 'memory'      resolved from the conversation
 * - ambiguous true    a reference that can't be resolved confidently
 */
export function resolveReferences(question, turns, named = []) {
    const text = String(question || '')
    const recent = recentEntities(turns)
    const order = discussed(turns)
    const newest = [...turns].sort((a, b) => b.at - a.at)
    // "It" / "its architecture": only what a recent question was about. A
    // project an answer merely named (in a list or an assessment) is not the topic.
    const last = newest.find((t) => (t.entities || []).length)
    const topic = last?.entities || []
    // "The first one", "both": the previous answer's own list if it named several.
    const lastAnswer = newest[0]
    const listed = (lastAnswer?.entities || []).length >= 2 ? lastAnswer.entities
        : [...(lastAnswer?.entities || []), ...(lastAnswer?.mentioned || [])].length >= 2 ? [...(lastAnswer?.entities || []), ...(lastAnswer?.mentioned || [])] : []
    const lastList = topic
    const plural = BOTH.test(text) ? 2 : ALL_N.test(text) ? (Number(text.match(ALL_N)[2]) || NUMBER_WORDS[(text.match(ALL_N)[2] || '').toLowerCase()] || 3) : ALL_OF.test(text) ? Math.max(2, Math.min(order.length, 5)) : 0
    if (named.length >= 2) return { entities: named, how: 'named', ambiguous: false }
    if (plural) {
        // One named plus "both": the named one and the most recent other one.
        // With nothing discussed yet, the previous answer's own list.
        const base = recent.length >= plural ? recent : [...recent, ...listed.filter((g) => !recent.includes(g))]
        const pool = named.length ? [...named, ...base.filter((g) => !named.includes(g))] : base
        if (pool.length >= plural) return { entities: pool.slice(0, plural).reverse(), how: 'memory', ambiguous: false }
        return { entities: pool, how: 'memory', ambiguous: true, choices: order.slice(-5) }
    }
    const ordinals = [...text.matchAll(ORDINAL_REF)].map((m) => m[1].toLowerCase())
    if (ordinals.length && (/\b(one|project|app|of them|wala|wale|compare|and)\b/i.test(text) || ordinals.length >= 2) && !named.length) {
        // The last answer's own list if it had several, else the discussion order.
        const list = listed.length >= 2 ? listed : order
        const picked = ordinals.map((o) => (o === 'last' ? list.at(-1) : list[(ORDINALS[o] || 1) - 1])).filter(Boolean)
        if (picked.length === ordinals.length) return { entities: [...new Set(picked)], how: 'memory', ambiguous: false }
        return { entities: [], how: 'memory', ambiguous: true, choices: list.slice(0, 5) }
    }
    if (named.length) return { entities: named, how: 'named', ambiguous: false }
    if (SINGULAR_REF.test(text) || VAGUE_PROJECT.test(text)) {
        if (lastList.length === 1) return { entities: lastList, how: 'memory', ambiguous: false }
        if (lastList.length > 1) return { entities: [], how: 'memory', ambiguous: true, choices: lastList.slice(0, 5) }
        if (VAGUE_PROJECT.test(text)) return { entities: [], how: 'none', ambiguous: true, choices: [] }
    }
    return { entities: [], how: 'none', ambiguous: false }
}

/**
 * The clarification this conversation is waiting on, if the visitor's reply
 * completes it ("InstaX" after "Which project?"). Returns the original question
 * or null.
 */
export function pendingFor(turns, named, question, now = Date.now()) {
    const last = [...turns].sort((a, b) => b.at - a.at)[0]
    if (!last?.pending?.question || now - last.at > PENDING_MAX_AGE_MS || !named.length) return null
    const words = String(question || '').trim().split(/\s+/).length
    return words <= 8 ? last.pending.question : null
}

// ── Answer transformations ──────────────────────────────────────────────────

const TRANSFORMS = [
    ['translate', /\b(translate|say|explain|write|answer|tell|repeat)\b.{0,30}\b(in|into|to)\s+(hindi|english|hinglish)\b|\b(hindi|english|hinglish)\s+(me|mein|mai)\s+(batao|bataiye|samjhao|samjhaiye|bolo|likho)\b|^\s*(in\s+)?(hindi|english|hinglish)\s*(please|pls)?\s*\??\s*$|हिंदी में (बताओ|समझाओ|बताइए)/i],
    ['table', /\b(as|into|in)\s+a\s+table\b|\btabular\b|\btable (form|format)\b|\bconvert (it|that|this|the comparison)\b.{0,20}\btable\b/i],
    ['shorter', /\b(make it|keep it|say it|explain it|in)\s+(short|shorter|brief|briefly)\b|\b(shorter|tl;?dr|too long|summari[sz]e (that|this|it|your answer)|short version|in one line|one sentence)\b/i],
    ['simpler', /\b(simple|simpler|easy|easier|plain|layman'?s?)\s+(words|terms|language|english|way)\b|\bexplain (it|that|this) (simply|like i'?m (five|5|a beginner))\b|\beli5\b|\bsimplify\b|\basaan (bhasha|shabdon)\b|आसान (भाषा|शब्दों)/i],
    ['example', /\b(real[- ]life|real[- ]world|everyday|practical)\s+(example|analogy)\b|\bwith an? (example|analogy)\b|\bgive (me )?an? (example|analogy)\b/i],
    ['more', /\b(more details?|in (more )?detail|elaborate|expand( on)?|go deeper|deep dive|explain (more|further))\b.{0,20}\b(that|this|it|on that|on it|your answer)?\b/i],
    ['again', /\b(explain|say|tell me) (that|it|this) again\b|\bagain,? (please|pls)\b|\brepeat (that|it|your answer)\b|\bi (didn'?t|did not|don'?t) (understand|get) (that|it)\b/i],
]

/**
 * An answer transformation the message asks for, or null. Only short messages
 * that point back ("make it shorter", "in Hindi please"); a full new question
 * that happens to contain "in detail" is a question.
 */
export function transformOp(question) {
    const text = String(question || '').trim()
    const words = text.split(/\s+/).length
    for (const [kind, re] of TRANSFORMS) {
        if (!re.test(text)) continue
        if (kind === 'more' && words > 8) continue
        if (words > 14) continue
        const lang = kind === 'translate' ? (/hindi|हिंदी/i.test(text) ? 'hi' : /hinglish/i.test(text) ? 'hinglish' : 'en') : null
        return { kind, language: lang }
    }
    return null
}

/** The most recent complete answer a transformation or follow-up can use. */
export function previousAnswer(turns, now = Date.now()) {
    return [...turns].sort((a, b) => b.at - a.at)
        .find((t) => t.a && t.complete !== false && now - t.at <= PREVIOUS_TURN_MAX_AGE_MS && !['recall', 'clarify', 'reply'].includes(t.operation)) || null
}

/**
 * Recent complete turns for the model's working memory, oldest first, within
 * a character budget (questions whole, answers clipped). Context-free fixed
 * replies are left out.
 */
export function workingMemory(turns, now = Date.now()) {
    const useful = [...turns].sort((a, b) => b.at - a.at)
        .filter((t) => now - t.at <= PREVIOUS_TURN_MAX_AGE_MS && t.complete !== false && t.q && !['reply'].includes(t.operation))
        .slice(0, WORKING_TURNS)
    const out = []
    let size = 0
    for (const t of useful) {
        const item = { q: clip(t.q, 300), a: clip(t.a, WORKING_ANSWER_CHARS) }
        size += item.q.length + item.a.length
        if (size > WORKING_CHARS && out.length) break
        out.unshift(item)
    }
    return out
}

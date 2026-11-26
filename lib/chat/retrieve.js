// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// Hybrid retrieval over a static index (D-100): brute-force cosine on the
// precomputed Gemini vectors plus in-process BM25, mixed 0.7 / 0.3. Around 70
// chunks, so a full scan is microseconds and no vector database is needed.
// Without a query vector (no key, quota spent, timeout) BM25 runs alone.

import {
    FAQ_CONTEXT_KEYWORD, FAQ_CONTEXT_VECTOR, FAQ_DIRECT_KEYWORD, FAQ_DIRECT_VECTOR, FOLLOW_UPS, GROUP_CAP, MIN_SCORE_HYBRID, MIN_SCORE_KEYWORD, MIN_VECTOR_ONLY, NAME_BOOST,
    TEMPLATE_MIN_SCORE_HYBRID, TOP_K, WEIGHT_KEYWORD, WEIGHT_VECTOR,
} from './config.js'
import { FAQ_NOT_SUGGESTED } from './knowledge.js'
import { editDistance, nearest } from './fuzzy.js'

const STOP = new Set(('a an and are as at be been but by can could did do does for from has have he her him his how i if in into is it its '
    + 'me my of on or our please say she so tell than that the their them then there these they this to us was we were what when where '
    + 'which who whom why will with would you your about any some more most much many also just like know get got gaurav gaurav\'s kumar yadav '
    + 'ggauravky give show explain describe list happen happened right now currently thing things stuff want need really actually '
    + 'kind sort type him build built builds made make making create created done ever yourself pls plz please '
    // Hinglish filler ("gaurav ke projects batao", "kitne projects banaye")
    + 'ke ka ki ko hai hain tha thi kya kaise kaun kitne kitna batao bata bataiye do dikhao uska uski unka unke apna apne mujhe '
    + 'kaha kahan banaye banaya karta karte karti').split(' '))

// Visitors' words → the words the data uses. Query side only; adds no facts.
const EXPANSIONS = {
    study: ['bca', 'university', 'student', 'degree'],
    studying: ['bca', 'university', 'student', 'degree'],
    education: ['bca', 'university', 'degree'],
    college: ['university', 'bca'],
    degree: ['bca', 'university'],
    hire: ['availability', 'freelance', 'internships', 'services', 'contact'],
    hiring: ['availability', 'freelance', 'internships', 'services', 'contact'],
    available: ['availability', 'freelance', 'internships'],
    contact: ['email', 'linkedin', 'contact'],
    reach: ['email', 'contact'],
    team: ['team', 'collaborative'],
    teammates: ['team'],
    cost: ['price', 'inr'],
    price: ['price', 'inr'],
    pricing: ['price', 'inr'],
    charge: ['price', 'inr'],
    fee: ['price', 'inr'],
    cv: ['resume'],
    write: ['blog', 'post'],
    wrote: ['blog', 'post'],
    written: ['blog', 'post'],
    article: ['blog', 'post'],
    part: ['role'],
    email: ['contact'],
    stack: ['tech', 'stack'],
    experience: ['internship', 'internships'],
    job: ['internship', 'internships'],
    hackathons: ['hackathon'],
    projects: ['project'],
    certificate: ['certificate', 'course'],
    certifications: ['certificate', 'course'],
    postgres: ['postgresql'],
    padhta: ['study', 'university', 'bca'],
    stats: ['github', 'commits', 'activity'],
    won: ['winner', 'award'],
    win: ['winner', 'award'],
    awards: ['award', 'winner'],
    live: ['launched', 'production'],
    commits: ['commit', 'github'],
    worked: ['experience', 'internship'],
}

export function expandQuery(tokens) {
    const out = [...tokens]
    for (const token of tokens) for (const extra of EXPANSIONS[token] || []) if (!out.includes(extra)) out.push(extra)
    return out
}

// Keyword-only "is this about Gaurav?" gate: the top chunk must cover at least
// this share of the question's words, weighted by rarity. Words the corpus has
// never seen weigh the most, so "quantum computing" or "cricket" don't match.
const MIN_COVERAGE = 0.5
const FOLLOW_UP_MIN_SIM = 0.7
const RARE_DF = 8 // a word in at most this many chunks is a name, not filler (315 chunks, D-109)

export const tokenize = (text) => String(text || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\p{L}\p{N}+#.]+/gu, ' ')
    .split(' ')
    .map((token) => token.replace(/^\.+|\.+$/g, ''))
    .filter((token) => token.length > 1 && !STOP.has(token))

const K1 = 1.2
const B = 0.75
const KEYWORD_SATURATION = 4 // bm25 / (bm25 + 4): an absolute 0–1 score

/** Encode a vector as base64 int8 (index builder): scaled so the largest value is ±127. */
export function encodeVector(values) {
    const max = Math.max(...values.map(Math.abs)) || 1
    const bytes = Int8Array.from(values, (v) => Math.round((v / max) * 127))
    return Buffer.from(bytes.buffer).toString('base64')
}

/** Decode a base64 vector (int8 "i8" or float32 "f32") and L2-normalise it. */
export function decodeVector(b64, enc = 'f32') {
    if (!b64) return null
    const bytes = Buffer.from(b64, 'base64')
    const vec = enc === 'i8'
        ? new Int8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength)
        : new Float32Array(bytes.buffer, bytes.byteOffset, bytes.byteLength / 4)
    return normalise(Array.from(vec))
}

export function normalise(vec) {
    let norm = 0
    for (const v of vec) norm += v * v
    norm = Math.sqrt(norm) || 1
    return vec.map((v) => v / norm)
}

const dot = (a, b) => {
    let sum = 0
    for (let i = 0; i < a.length; i += 1) sum += a[i] * b[i]
    return sum
}

/** Lower-case words only, padded with spaces, for whole-phrase name matching. */
const foldWords = (text) => ` ${String(text || '').toLowerCase().normalize('NFKD').replace(/[^\p{L}\p{N}]+/gu, ' ').trim()} `

/** Prepare an index once per cold start. */
export function prepareIndex(raw) {
    const enc = raw?.enc || 'f32'
    const chunks = (raw?.chunks || []).map((chunk) => {
        // Title words count twice: they are the strongest signal in this corpus.
        const tokens = [
            ...tokenize(chunk.title), ...tokenize(chunk.title), ...tokenize((chunk.keywords || []).join(' ')), ...tokenize(chunk.text),
        ]
        const tf = new Map()
        for (const token of tokens) tf.set(token, (tf.get(token) || 0) + 1)
        return { ...chunk, vec: decodeVector(chunk.vec, enc), tf, length: tokens.length }
    })
    const df = new Map()
    for (const chunk of chunks) for (const token of chunk.tf.keys()) df.set(token, (df.get(token) || 0) + 1)
    const avgLength = chunks.reduce((sum, c) => sum + c.length, 0) / (chunks.length || 1)
    const hasVectors = chunks.length > 0 && chunks.every((c) => c.vec && c.vec.length)
    const byId = new Map(chunks.map((c) => [c.id, c]))
    const faqKeys = (raw?.faqKeys || [])
        .filter((k) => byId.has(k.chunkId))
        .map((k) => ({ chunkId: k.chunkId, text: k.text, tokens: new Set(tokenize(k.text)), vec: decodeVector(k.vec, enc) }))
    // Project names, longest first ("Kanoon-Mate AI Legal…" before "Kanoon-Mate").
    const names = Object.entries(raw?.aliases || {})
        .flatMap(([group, list]) => list.map((name) => ({ group, name: foldWords(name) })))
        .filter(({ name }) => name.trim().length >= 4)
        .sort((a, b) => b.name.length - a.name.length)
    return {
        version: raw?.version || 'none',
        dim: raw?.dim || 0,
        chunks,
        byId,
        df,
        avgLength,
        hasVectors,
        faqKeys,
        names,
        profiles: Array.isArray(raw?.profiles) ? raw.profiles : [],
        // Structured facts (D-134): counts, filters, comparisons.
        records: raw?.records || null,
        hasKeyVectors: faqKeys.length > 0 && faqKeys.every((k) => k.vec && k.vec.length),
    }
}

/** Projects the question names ("Kanoon-Mate", "TaskNexus"), as chunk groups. */
export function namedGroups(index, question) {
    const text = foldWords(question)
    const found = new Set()
    for (const { group, name } of index.names || []) if (text.includes(name)) found.add(group)
    return found
}

const dice = (a, b) => {
    if (!a.size || !b.size) return 0
    let both = 0
    for (const token of a) if (b.has(token)) both += 1
    return (2 * both) / (a.size + b.size)
}

/**
 * The FAQ entry a question asks, matched question-to-question against every
 * FAQ question and alternate phrasing (D-109). With a query vector: cosine
 * (both sides embedded as queries). Without: word overlap (Dice).
 * Returns { chunk, score, via } or null.
 */
export function faqMatch(index, question, queryVec = null) {
    if (!index.faqKeys?.length) return null
    const useVector = Boolean(queryVec && index.hasKeyVectors && queryVec.length === index.faqKeys[0].vec.length)
    const q = useVector ? normalise(queryVec) : null
    // Keyword mode: the visitor's words plus their data-side synonyms ("won" → "winner").
    const own = new Set(expandQuery(correctTokens(index, tokenize(question))))
    // Best key per FAQ entry, then the best entry and the runner-up entry.
    const perFaq = new Map()
    for (const key of index.faqKeys) {
        const score = useVector ? dot(q, key.vec) : dice(own, key.tokens)
        if (!perFaq.has(key.chunkId) || score > perFaq.get(key.chunkId).score) perFaq.set(key.chunkId, { score, key: key.text })
    }
    const ordered = [...perFaq.entries()].sort((a, b) => b[1].score - a[1].score)
    if (!ordered.length) return null
    const [[chunkId, best], second] = ordered
    return {
        chunk: index.byId.get(chunkId),
        score: best.score,
        key: best.key,
        runnerUp: second ? second[1].score : 0,
        via: useVector ? 'vector' : 'keyword',
    }
}

// ── FAQ decision: direct, supporting or none (D-113) ───────────────────────
// Close wording is not the same question: "where has he worked?", "where is he
// working now?", "when did he start?" and "what are his responsibilities at
// AshokSoft?" all sit near each other. The owner's answer is sent as written
// only when the match is strong, clearly ahead of the next FAQ, about the same
// named things, and the same kind of question; otherwise it is supporting
// context for a model answer.

const FAQ_MARGIN = 0.03
const normQ = (text) => String(text || '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim()

/** What kind of question: where / when / who / why / how-many / how / what / yes-no. */
export function questionType(text) {
    const t = ` ${normQ(text)} `
    if (/ where /.test(t)) return 'where'
    if (/ when | since when | what year | which year /.test(t)) return 'when'
    if (/ who | whom | whose /.test(t)) return 'who'
    if (/ why /.test(t)) return 'why'
    if (/ how (many|much|long|old) /.test(t)) return 'quantity'
    if (/ how /.test(t)) return 'how'
    if (/ (what|which) /.test(t)) return 'what'
    if (/^ (is|are|was|were|does|do|did|can|could|has|have|will|would|should) /.test(t)) return 'yes-no'
    return 'other'
}

// Cues that change what is being asked even with the same words around them.
const CUES = [
    ['now', / (currently|current|now|present|presently|still|at the moment|these days|right now) /],
    ['start', / (start|started|starting|begin|began|join|joined|since) /],
    ['duties', / (responsibilit\w*|duties|role|tasks?|work on|working on|day to day) /],
    ['future', / (plan|plans|planned|next|future|roadmap|will) /],
    ['compare', / (compare|comparison|versus|vs|difference|differ|better than) /],
]
const cuesOf = (text) => new Set(CUES.filter(([, re]) => re.test(` ${normQ(text)} `)).map(([name]) => name))

/** Rare words of the question (names: "ashoksoft", "tasknexus") the FAQ entry must contain. */
function namesCovered(index, question, chunk) {
    const rare = correctTokens(index, tokenize(question)).filter((t) => (index.df.get(t) || 0) > 0 && (index.df.get(t) || 0) <= RARE_DF)
    return rare.every((t) => chunk.tf?.has(t))
}

/**
 * { decision: 'direct'|'supporting'|'none', match, why }. `multi`: the planner
 * found several parts or entities, so one FAQ can't answer it all.
 */
export function faqDecision(index, question, queryVec = null, { multi = false } = {}) {
    const match = faqMatch(index, question, queryVec)
    if (!match?.chunk) return { decision: 'none', match: null, why: 'no FAQ' }
    const supporting = faqInContext(match)
    const asSupport = (why) => ({ decision: supporting ? 'supporting' : 'none', match, why })
    const exact = [match.chunk.faq.question, ...match.chunk.faq.alternates].some((k) => normQ(k) === normQ(question))
    if (exact && !multi) return { decision: 'direct', match, why: 'exact FAQ wording' }
    const strong = match.score >= (match.via === 'vector' ? FAQ_DIRECT_VECTOR : FAQ_DIRECT_KEYWORD)
    if (!strong) return asSupport('below direct threshold')
    if (multi) return asSupport('several parts or entities')
    if (match.score - match.runnerUp < FAQ_MARGIN) return asSupport('too close to another FAQ')
    if (!namesCovered(index, question, match.chunk)) return asSupport('names the FAQ does not cover')
    if (questionType(question) !== questionType(match.key)) return asSupport('different question type')
    const asked = cuesOf(question)
    const stored = cuesOf(match.key)
    if ([...asked].some((c) => !stored.has(c))) return asSupport('a cue the FAQ does not ask about')
    return { decision: 'direct', match, why: 'equivalent question' }
}

/** True when a FAQ match is strong enough to put its answer in the context. */
export const faqInContext = (match) => Boolean(match?.chunk)
    && match.score >= (match.via === 'vector' ? FAQ_CONTEXT_VECTOR : FAQ_CONTEXT_KEYWORD)

/**
 * Pick up to `k` chunks, best first, at most GROUP_CAP from one project or
 * section (one more for a project the question names), so one project's many
 * records can't push everything else out of the context.
 */
function pickDiverse(scored, named, k) {
    const perGroup = new Map()
    const out = []
    for (const s of scored) {
        const group = s.chunk.group || s.chunk.id
        const cap = GROUP_CAP + (named.has(group) ? 1 : 0)
        if ((perGroup.get(group) || 0) >= cap) continue
        perGroup.set(group, (perGroup.get(group) || 0) + 1)
        out.push(s)
        if (out.length === k) break
    }
    return out
}

const idfOf = (index, token) => {
    const n = index.chunks.length
    const df = index.df.get(token) || 0
    return Math.log(1 + (n - df + 0.5) / (df + 0.5))
}

function bm25(index, queryTokens, chunk) {
    let score = 0
    for (const token of new Set(queryTokens)) {
        const freq = chunk.tf.get(token)
        if (!freq) continue
        score += idfOf(index, token) * ((freq * (K1 + 1)) / (freq + K1 * (1 - B + (B * chunk.length) / index.avgLength)))
    }
    return score
}

/** Rarity-weighted share of the visitor's own words that a chunk contains. */
export function coverage(index, ownTokens, chunk) {
    let total = 0
    let hit = 0
    for (const token of new Set(ownTokens)) {
        const weight = idfOf(index, token)
        total += weight
        if (chunk.tf.has(token) || (EXPANSIONS[token] || []).some((extra) => chunk.tf.has(extra))) hit += weight
    }
    return total ? hit / total : 0
}

// ── Typo tolerance ("servises", "intenship", "hackthon") ──────────────────
// A word the corpus has never seen is replaced by the nearest corpus word
// (lib/chat/fuzzy.js has the rules), preferring the most common. Only corpus
// words are targets, so an off-topic word is never "corrected" into a new
// meaning; it just stays unknown.

export { editDistance }

const corpusVocab = (index) => {
    if (!index.vocab) index.vocab = [...index.df.entries()].filter(([w]) => w.length >= 3 && !/\d/.test(w))
    return index.vocab
}

/** Each unknown word → its nearest corpus word, if one is close enough. */
export function correctTokens(index, tokens) {
    if (!index?.df?.size) return tokens
    return tokens.map((token) => {
        if (index.df.has(token) || EXPANSIONS[token] || /\d/.test(token)) return token
        // A plural the corpus has only in the singular ("blogs" → "blog").
        if (token.length > 3 && token.endsWith('s') && index.df.has(token.slice(0, -1))) return token.slice(0, -1)
        return nearest(token, corpusVocab(index)) || token
    })
}

/** The words of a question that look misspelled, with their fixes: Map(original → fixed). */
export function spellingFixes(index, question) {
    const fixes = new Map()
    const raw = tokenize(question)
    correctTokens(index, raw).forEach((fixed, i) => {
        // Plurals and synonyms are not spelling mistakes worth mentioning.
        if (fixed !== raw[i] && fixed !== raw[i].replace(/s$/, '')) fixes.set(raw[i], fixed)
    })
    return fixes
}

/** The question with its typos fixed ("tell me about his intenship" → "…internship"). */
export function correctQuestion(index, question) {
    const text = String(question || '')
    const fixes = spellingFixes(index, text)
    if (!fixes.size) return text
    return text.replace(/[\p{L}\p{N}]+/gu, (word) => fixes.get(word.toLowerCase()) || word)
}

/**
 * Keyboard noise that reached retrieval ("usfhsuidfh"): a short message in
 * which no word is a corpus word, a common word, or one typo away from one.
 */
export function looksLikeNoise(index, question) {
    const words = String(question || '').toLowerCase().match(/[\p{L}]+/gu) || []
    if (!words.length || words.length > 3) return false
    const fixed = correctTokens(index, words)
    const unknown = (word, i) => word.length >= 3 && !STOP.has(word) && !index.df.has(fixed[i]) && !COMMON.has(word)
    return words.every(unknown) && words.some((word) => word.length >= 5)
}

// Common English words that are not in the corpus but are not noise either.
const COMMON = new Set(('hello hey thanks okay sure please sorry great nice cool awesome yes nope maybe help hmm wow lol haha test testing '
    + 'what when where why how who which whose is are was were do does did can could will would should shall may might must').split(' '))

/**
 * Rank every chunk. Returns `{ mode, top, rest, matched }`:
 * - `top`: up to TOP_K chunks above the threshold (the answer's context)
 * - `rest`: the next candidates, for follow-up suggestions
 * - `matched`: false when nothing clears the threshold (answer honestly)
 */
export function rank(index, question, queryVec = null) {
    // Redaction placeholders are not part of the question.
    const ownTokens = correctTokens(index, tokenize(String(question || '').replace(/\[(?:email|phone)\]/g, ' ')))
    const queryTokens = expandQuery(ownTokens)
    const useVector = Boolean(queryVec && index.hasVectors && queryVec.length === index.chunks[0].vec.length)
    const q = useVector ? normalise(queryVec) : null

    // "Who is Gaurav?" has no content words left: answer from the about chunks.
    if (queryTokens.length === 0 && !useVector) {
        const about = index.chunks.filter((c) => c.type === 'about')
        return { mode: 'about', top: about.slice(0, TOP_K).map((c) => ({ ...c, score: 1 })), rest: [], matched: about.length > 0 }
    }

    const named = namedGroups(index, question)
    const scored = index.chunks.map((chunk) => {
        const raw = bm25(index, queryTokens, chunk)
        const keyword = raw / (raw + KEYWORD_SATURATION)
        const vector = useVector ? dot(q, chunk.vec) : 0
        const boost = named.has(chunk.group) ? NAME_BOOST : 0
        const score = (useVector ? WEIGHT_VECTOR * vector + WEIGHT_KEYWORD * keyword : keyword) + boost
        return { chunk, score, vector, keyword }
    }).sort((a, b) => b.score - a.score)

    const threshold = useVector ? MIN_SCORE_HYBRID : MIN_SCORE_KEYWORD
    const bestCoverage = Math.max(0, ...scored.slice(0, TOP_K).map((s) => coverage(index, ownTokens, s.chunk)))
    // Or a rare word of the question names a top chunk ("Kanoon", "TechX26"):
    // a named thing on the site, even if the question has other unknown words.
    const own = new Set(ownTokens)
    const namesAChunk = named.size > 0 || scored.slice(0, TOP_K).some((s) => tokenize(s.chunk.title)
        .some((t) => own.has(t) && (index.df.get(t) || 0) <= RARE_DF))
    if (!useVector && bestCoverage < MIN_COVERAGE && !namesAChunk) {
        return { mode: 'keyword', top: [], rest: [], matched: false }
    }
    // A strong meaning match counts even when typos zero the keyword half.
    const above = scored.filter((s) => s.score >= threshold || (useVector && s.vector >= MIN_VECTOR_ONLY))
    const top = pickDiverse(above, named, TOP_K).map((s) => ({ ...s.chunk, score: s.score }))
    const picked = new Set(top.map((c) => c.id))
    const rest = scored.filter((s) => !picked.has(s.chunk.id)).slice(0, 12)
        .filter((s) => s.score >= threshold * 0.85)
        .map((s) => ({ ...s.chunk, score: s.score }))
    // "confident": strong enough for the no-LLM template to list pages.
    const confident = top.length > 0 && (!useVector || top[0].score >= TEMPLATE_MIN_SCORE_HYBRID
        || scored[0].vector >= MIN_VECTOR_ONLY + 0.04)
    // `all`: every chunk with its score, for the retrieval planner (plan.js).
    return { mode: useVector ? 'hybrid' : 'keyword', top, rest, matched: top.length > 0, confident, all: scored }
}

/** Put a strong FAQ match first in the context (it is the owner's own answer). */
export function withFaq(ranked, match) {
    if (!faqInContext(match)) return ranked
    const others = ranked.top.filter((c) => c.id !== match.chunk.id)
    const score = Math.max(ranked.top[0]?.score || 0, MIN_SCORE_HYBRID)
    return {
        ...ranked,
        top: [{ ...match.chunk, score, faqScore: match.score }, ...others].slice(0, TOP_K),
        matched: true,
        confident: true,
    }
}

// "Why should I hire him?", "what are his abilities?", "is he a good fit for…",
// "what makes him different?", "strengths / weaknesses".
export const HIRING = /\b(hire|hiring|hired|recruit\w*|employ|onboard|why (should|would|do|must|shall) (i|we)|abilit\w*|capabilit\w*|strengths?|weakness\w*|good (at|fit|for|enough|intern|candidate|developer|engineer|choice|hire)|fit (for|as)|suitable|qualif\w*|stands? out|unique about (him|gaurav|you)|(he|him|gaurav|you|his profile) (different|better) (from|than)|(different from|better than) other (candidates|developers|freshers|applicants|students)|what (can|does|could|will) (he|him|gaurav) (do|offer|bring)|value (does|can|will|would|could) (he|him|gaurav|you)|add value|bring to (my|our|the|a) (team|company|startup|org\w*)|offer (my|our|the|a) (team|company|startup|org\w*)|candidate|worth (hiring|it)|right (person|choice)|pitch|convince me|sell (him|gaurav|yourself)|how experienced|experience level|years of experience|job[- ]ready|industry[- ]ready|ready for (a |the )?(job|role|work|industry)|\b(he|gaurav|you)\s+(is\s+)?(an?\s+)?(senior|junior|fresher)|\b(is|are)\s+(he|gaurav|you)\s+(an?\s+)?(senior|junior|fresher)|(senior|junior|fresher)\s+(role|position|level|candidate|hire|developer role))\b/i

// A role named with "as a / for / become / work as / good" asks about fit too.
const HIRING_ROLE_ASK = /\b(as an?|for (an?|the)|become|work as|good|role|job|position|fit)\b/i

// Questions that need the whole set, not the best few items: relative time
// ("the hackathon before that", "latest"), counts and lists.
const OVERVIEW_NEEDS = [
    { id: 'overview:journey', re: /\b(before|after|earlier|later|latest|newest|oldest|recent(ly)?|first|last|next|previous|timeline|when|this year|last year|20\d\d|so far|how many (events|hackathons|internships|courses|certificates))\b/i },
    { id: 'overview:projects', re: /\b(all|every|list|how many|which|team|solo|strongest|best|top|favou?rite|main|biggest)\b.*\bprojects?\b|\bprojects?\b.*\b(all|list|how many|team|solo|strongest|best|top)\b/i },
    { id: 'overview:services', re: /\b(all|list|which|what|how many)\b.*\bservices\b|\bservices\b.*\b(prices?|cost|offer)\b/i },
    { id: 'overview:blog', re: /\b(all|list|which|what|how many)\b.*\b(posts|articles|blogs?)\b/i },
    // Hiring and fit (D-112): the overall case, plus the role a question names.
    { id: 'hire:overall', re: HIRING },
    { id: 'hire:fullstack', re: /\b(full[ -]?stack|mern|web (dev|developer|development)|software (developer|engineer)|sde)\b/i },
    { id: 'hire:frontend', re: /\b(front[ -]?end|react (dev|developer)|ui (dev|developer|engineer))\b/i },
    { id: 'hire:backend', re: /\b(back[ -]?end|api (dev|developer)|node(\.?js| js)? (dev|developer)|express (dev|developer))\b/i },
    { id: 'hire:ai', re: /\b(ai|gen ?ai|llm|artificial intelligence|prompt|rag) (engineer|developer|dev|role|work|skills?)\b|\bai\/ml\b/i },
    { id: 'hire:ml', re: /\b(ml|machine learning) (engineer|developer|dev|role|work|skills?)\b|\bmachine learning\b/i },
    { id: 'hire:data', re: /\bdata (scientist|science|analyst|analysis|analytics|engineer)\b/i },
]

/**
 * Make sure a question that needs a whole set gets its overview chunk in the
 * context (replacing the weakest of the top chunks), even when similarity
 * ranked it lower.
 */
export function withOverviews(index, ranked, question, limit = TOP_K) {
    const ids = new Set(ranked.top.map((c) => c.id))
    const wanted = OVERVIEW_NEEDS.filter(({ re }) => re.test(question))
    // A question naming several roles ("full stack or AI or ML?") gets up to
    // three role summaries plus the overall one; one naming a role also gets
    // the overall case.
    const roles = wanted.filter(({ id }) => id.startsWith('hire:') && id !== 'hire:overall').slice(0, 3)
    const others = wanted.filter(({ id }) => !id.startsWith('hire:'))
    const hiring = wanted.some(({ id }) => id === 'hire:overall') || (roles.length && HIRING_ROLE_ASK.test(question))
    const needed = [...others, ...(hiring ? [{ id: 'hire:overall' }] : []), ...roles]
        .filter(({ id }) => !ids.has(id))
        .map(({ id }) => index.chunks.find((c) => c.id === id))
        .filter(Boolean)
    if (!needed.length) return ranked
    const keep = ranked.top.slice(0, Math.max(0, limit - needed.length))
    const floor = keep.at(-1)?.score ?? 0
    return { ...ranked, top: [...keep, ...needed.map((c) => ({ ...c, score: floor }))] }
}

// ── "The hackathon before that": resolved from dates, not by the model ──────

const RELATIVE = /\b(before|earlier|previous|prior|preceding|after|later|next|following|since)\b/i
const CATEGORY_WORDS = [
    [/\bhackathons?\b/i, 'Hackathons'],
    [/\binternships?\b/i, 'Internships'],
    [/\b(courses?|certificat\w*)\b/i, 'Certifications'],
    [/\bworkshops?\b/i, 'Workshops'],
    [/\b(conferences?)\b/i, 'Conferences'],
    [/\b(meetups?|community events?)\b/i, 'Community Events'],
    [/\b(startup|pitch)\b/i, 'Startup Events'],
    [/\bopen[- ]source\b/i, 'Open Source'],
]
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const monthYear = (iso) => {
    const m = String(iso).match(/^(\d{4})-(\d{2})/)
    return m ? `${MONTH_NAMES[Number(m[2]) - 1]} ${m[1]}` : ''
}

/**
 * For a relative-time follow-up about a journey entry, find the nearest entry
 * before or after it (same category unless the question names one). Returns
 * { chunk, note } or null. Dates are ISO strings, compared as text.
 */
export function resolveRelative(index, topic, question) {
    const word = String(question || '').match(RELATIVE)?.[1]
    if (!word || topic?.type !== 'journey' || !topic.meta?.date) return null
    const earlier = /before|earlier|previous|prior|preceding/i.test(word)
    const category = CATEGORY_WORDS.find(([re]) => re.test(question))?.[1] || topic.meta.category
    const candidates = index.chunks
        .filter((c) => c.type === 'journey' && c.meta?.date && c.id !== topic.id && c.meta.category === category)
        .filter((c) => (earlier ? c.meta.date < topic.meta.date : c.meta.date > topic.meta.date))
        .sort((a, b) => (earlier ? b.meta.date.localeCompare(a.meta.date) : a.meta.date.localeCompare(b.meta.date)))
    const found = candidates[0]
    const kind = category.toLowerCase().replace(/s$/, '')
    if (!found) {
        return { chunk: null, note: `There is no ${kind} ${earlier ? 'before' : 'after'} ${topic.title} (${monthYear(topic.meta.date)}) on the site.` }
    }
    return {
        chunk: found,
        note: `The ${kind} ${earlier ? 'before' : 'after'} ${topic.title} (${monthYear(topic.meta.date)}) is ${found.title} (${monthYear(found.meta.date)}).`,
    }
}

const shortTitle = (title, max = 60) => (title.length > max ? `${title.slice(0, max).replace(/\s+\S*$/, '')}…` : title)

/** A question a visitor can click next, phrased from the chunk's type and title. */
export function followUpFor(chunk) {
    const title = shortTitle(chunk.title)
    switch (chunk.type) {
        case 'project': return `How was ${title} built?`
        case 'journey': return `Tell me about ${title}`
        case 'service': return `What's included in ${title}?`
        case 'skills': return `What does Gaurav use for ${title.replace(/^Skills:\s*/, '').toLowerCase()}?`
        case 'blog': return `What does the post "${shortTitle(chunk.title.split(':')[0], 50)}" cover?`
        case 'overview': return {
            'overview:projects': 'Which projects has Gaurav built?',
            'overview:journey': 'What has Gaurav been doing this year?',
            'overview:services': 'What services does Gaurav offer, and at what price?',
            'overview:blog': 'What has Gaurav written on the blog?',
        }[chunk.id] || 'Who is Gaurav?'
        default: return chunk.id === 'about:status' ? 'How can I contact Gaurav?' : 'Who is Gaurav?'
    }
}

/** 2–3 follow-ups from strong chunks the answer did not use. No LLM call. */
export function followUps(ranked, index = null, limit = FOLLOW_UPS) {
    const usedUrls = new Set(ranked.top.map((c) => c.url))
    const seen = new Set()
    const out = []
    // With vectors: the pages most like the answer's main chunk (measured
    // 2026-11-20: related pages ≥ 0.74, unrelated ones lower), else the tail of
    // the query ranking.
    const anchor = ranked.top[0]
    const candidates = anchor?.vec && index?.hasVectors
        ? index.chunks
            .map((chunk) => ({ chunk, sim: dot(anchor.vec, chunk.vec) }))
            .filter((c) => c.sim >= FOLLOW_UP_MIN_SIM)
            .sort((a, b) => b.sim - a.sim)
            .map((c) => c.chunk)
        : ranked.rest
    for (const chunk of candidates) {
        if (usedUrls.has(chunk.url) || seen.has(chunk.url)) continue
        seen.add(chunk.url)
        out.push(followUpFor(chunk))
        if (out.length === limit) break
    }
    return out
}

const SUGGEST_REDUNDANCY = 0.5 // MMR: how much likeness to an already-picked question costs
const ASKED_OVERLAP = 0.6 // word overlap at which a suggestion counts as already asked

/**
 * Questions to ask next (D-109): the owner's FAQ questions, ranked by how close
 * they are to what this answer was about (vector likeness to the main chunk,
 * plus the same project), then picked with maximal marginal relevance so the
 * three aren't variations of one question. Skips questions already asked or
 * answered, and FAQ entries about the assistant itself. Falls back to the
 * chunk-based phrasing when the index has no FAQ.
 */
export function suggest({ index, ranked, asked = [], limit = FOLLOW_UPS }) {
    const askedTokens = asked.map((q) => new Set(tokenize(q)))
    const seenBefore = (question) => {
        const tokens = new Set(tokenize(question))
        return askedTokens.some((a) => dice(a, tokens) >= ASKED_OVERLAP)
    }
    // A suggestion is an FAQ question, or the question a hiring summary answers (D-112).
    const questionOf = (c) => c.faq?.question || c.ask || ''
    const used = new Set(ranked.top.filter((c) => c.type === 'faq' || c.ask).map((c) => c.id))
    const anchor = ranked.top.find((c) => c.vec && c.type !== 'overview') || ranked.top.find((c) => c.vec)
    const groups = new Set(ranked.top.slice(0, 3).map((c) => c.group).filter(Boolean))
    const anchorTokens = new Set(tokenize(ranked.top[0]?.title || ''))
    // After a hiring answer, a recruiter's next questions: the other roles,
    // availability, contact, skills and experience (not "where does he live?").
    const hiringTurn = ranked.top.some((c) => c.group === 'hire')
    const RECRUITER_CATEGORIES = new Set(['opportunities', 'contact', 'skills', 'experience', 'projects'])
    const pool = index.chunks
        .filter((c) => (c.faq ? !FAQ_NOT_SUGGESTED.has(c.faq.category) : Boolean(c.ask)) && !used.has(c.id) && !seenBefore(questionOf(c)))
        .filter((c) => !hiringTurn || c.ask || RECRUITER_CATEGORIES.has(c.faq?.category))
        .map((c) => ({
            c,
            rel: (anchor?.vec && c.vec ? dot(anchor.vec, c.vec) : dice(anchorTokens, new Set(tokenize(questionOf(c)))))
                + (groups.has(c.group) ? 0.15 : 0)
                + (c.faq?.priority === 'high' ? 0.02 : 0),
        }))
    const likeness = (a, b) => (a.vec && b.vec ? dot(a.vec, b.vec) : a.group === b.group ? 0.9 : 0)
    const picks = []
    while (picks.length < limit && pool.length) {
        let bestAt = 0
        let bestValue = -Infinity
        pool.forEach((s, i) => {
            const redundancy = picks.length ? Math.max(...picks.map((p) => likeness(p, s.c))) : 0
            const value = s.rel - SUGGEST_REDUNDANCY * redundancy
            if (value > bestValue) {
                bestValue = value
                bestAt = i
            }
        })
        picks.push(pool.splice(bestAt, 1)[0].c)
    }
    const out = picks.map(questionOf)
    for (const q of out.length < limit ? followUps(ranked, index, limit) : []) {
        if (out.length === limit) break
        if (!out.includes(q) && !seenBefore(q)) out.push(q)
    }
    return out
}

const FAQ_PAGE_TITLES = { '/about': 'About', '/journey': 'Journey', '/skills': 'Skills', '/projects': 'Projects', '/contact': 'Contact' }

/** The link text for a chunk: the project or post name, or the page's name. */
function sourceTitle(chunk) {
    if (['blog', 'project', 'roadmap'].includes(chunk.type)) return chunk.title.split(':')[0]
    if (chunk.type === 'faq') return FAQ_PAGE_TITLES[chunk.url] || (chunk.url.includes('github.com') ? 'GitHub' : 'About')
    return chunk.title
}

/** Public, minimal source list for the client (no text, no scores). */
export const sourcesOf = (chunks) => {
    const seen = new Set()
    return chunks.filter((c) => c.url && !seen.has(c.url) && seen.add(c.url))
        .map((c) => ({ title: sourceTitle(c), url: c.url, type: c.type }))
}

// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// Retrieval planner (D-113). Most questions are simple and keep the cheap
// path (one ranking, 5 chunks). A complex question, one naming several
// projects, asking several things at once, or comparing, gets more evidence
// from the same single embedding:
// - every named project or entry is guaranteed its own best chunks, so a
//   comparison covers all of them and not just the one that ranked first
// - every sub-question gets its own keyword-ranked chunk
// - the total stays within a chunk and character budget
// Chunks of a named entity are tagged with it, and the prompt forbids moving
// a detail from one entity to another (no mixed-up stacks in comparisons).

import { correctTokens, rank, tokenize } from './retrieve.js'

export const COMPLEX_MAX_CHUNKS = 8
export const COMPLEX_MAX_CHARS = 7000
const PER_ENTITY = 2
const DEFAULT_CHARS = 1000

const COMPARE = /\b(compare|comparison|compared|vs\.?|versus|difference|differences|differ|better|worse|similar|both|between|each)\b/i
const WH = '(what|how|why|when|which|who|where|whom|whose|does|did|is|are|was|were|can|could|has|have|will|would|should|tell|list|explain|describe)'
const SPLITS = new RegExp(`\\?|;|,\\s*(?:and\\s+)?(?=${WH}\\b)|\\s+and\\s+(?=${WH}\\b)|\\s+also\\s+(?=${WH}\\b)`, 'i')

/** "What is X? How does Y work, and why Z?" → ["What is X", "How does Y work", "why Z"]. */
export function subQuestions(text) {
    const parts = String(text || '')
        .split(SPLITS)
        .map((part) => (part || '').trim())
        .filter((part) => part.split(/\s+/).length >= 2)
    if (parts.length >= 2) return parts
    // A list of topics: "his internship, strongest projects and AI skills".
    const items = String(text || '')
        .replace(/[?.!]+$/, '')
        .split(/,|\s+and\s+|\s*&\s*/i)
        .map((item) => item.trim())
        .filter(Boolean)
    const short = items.length >= 3 && items.slice(1).every((item) => item.split(/\s+/).length <= 5)
    return short ? items : parts
}

/**
 * The plan for a question: { complex, entities: [group…], parts: [text…],
 * compare }. `named`: the entity groups the question names (namedGroups).
 */
export function planQuestion(asked, named) {
    const entities = [...named]
    const parts = subQuestions(asked)
    const compare = COMPARE.test(asked)
    const complex = entities.length >= 2 || parts.length >= 2 || (compare && entities.length >= 1)
    return { complex, entities, parts, compare }
}

const charsOf = (chunk) => Math.min(chunk.text?.length || 0, chunk.contextChars || DEFAULT_CHARS)

/** A display name for an entity group: the start of its project or entry title. */
function entityName(index, group) {
    const chunk = index.chunks.find((c) => c.group === group && (c.type === 'project' || c.type === 'journey' || c.type === 'service'))
    return chunk ? chunk.title.split(/[:(]/)[0].trim() : group
}

/**
 * Evidence for a complex question. `ranked`: the ranking of the whole question
 * (with `all`). Returns a new `top`: entity slots first (grouped), then one
 * chunk per sub-question, then the best of the rest, within the budget.
 */
export function gatherEvidence(index, plan, ranked) {
    const picked = []
    const seen = new Set()
    let chars = 0
    const take = (chunk, extra = {}) => {
        if (!chunk || seen.has(chunk.id) || picked.length >= COMPLEX_MAX_CHUNKS) return false
        const size = charsOf(chunk)
        if (chars + size > COMPLEX_MAX_CHARS && picked.length) return false
        seen.add(chunk.id)
        chars += size
        picked.push({ ...chunk, ...extra })
        return true
    }
    const all = ranked.all || ranked.top.map((chunk) => ({ chunk, score: chunk.score || 0 }))

    // 1. Every named entity: its own best chunks, tagged with its name.
    for (const group of plan.entities) {
        const entity = entityName(index, group)
        all.filter((s) => s.chunk.group === group)
            .slice(0, PER_ENTITY)
            .forEach((s) => take(s.chunk, { score: s.score, entity }))
    }
    // 2. Every sub-question: its best keyword match (no extra embedding call).
    for (const part of plan.parts) {
        const own = correctTokens(index, tokenize(part))
        if (!own.length) continue
        const sub = rank(index, part, null)
        const best = sub.top.find((c) => !seen.has(c.id))
        if (best) take(best, { score: best.score })
    }
    // 3. The best of the whole-question ranking (already above the relevance
    //    threshold), to fill the budget.
    for (const chunk of ranked.top) take(chunk, { score: chunk.score })
    // Entity chunks stay together, in the order the question named them.
    const order = new Map(plan.entities.map((g, i) => [g, i]))
    return picked
        .map((c, i) => ({ c, i }))
        .sort((a, b) => (order.has(a.c.group) ? order.get(a.c.group) : 99) - (order.has(b.c.group) ? order.get(b.c.group) : 99) || a.i - b.i)
        .map(({ c }) => c)
}

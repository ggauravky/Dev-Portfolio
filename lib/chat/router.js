// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// The query router (D-134). One deterministic pass decides what a message
// needs, in this order, and never makes a model call of its own:
//   1. safety and fixed replies (intents.js): self-harm, abuse, jailbreaks,
//      attack requests, spam, small talk, a message that is only about pay or
//      only about private life
//   2. conversation operations: recall a question or answer, summarise this
//      conversation, list the projects discussed
//   3. answer transformations of the previous answer (shorter, simpler, more,
//      translate, example, table, again)
//   4. contact and profile requests (only with real evidence of one)
//   5. a pending clarification completed by this message
//   6. structured queries (counts, filters, latest entries, prices)
//   7. reference resolution: named projects, or ones resolved from the
//      conversation; an unresolved reference asks a clarification question
//   8. everything else is an answer, with a mode (fact, explain, compare,
//      evaluate, interview), its facets (a pay or private-life part) and the
//      reply language
// A restricted part of a bigger question is a facet, not the whole route, so
// "weaknesses and salary expectations" answers both parts.

import { contactPlatform, facetsOf, route as routeIntents } from './intents.js'
import { conversationOp, pendingFor, previousAnswer, resolveReferences, transformOp, VAGUE_PROJECT } from './memory.js'
import { detectLanguage, replyLanguage, requestedLanguage, retrievalText } from './language.js'
import { parseQuery } from './structured.js'
import { nameOf } from './evidence.js'

// Fixed replies that answer the whole message (the rest go on to routing).
const REPLY_INTENTS = new Set(['selfHarm', 'abuse', 'jailbreak', 'model', 'hacking', 'spam', 'test', 'flirt', 'joke', 'gibberish', 'codeHelp',
    'compliment', 'compensation', 'personal', 'greeting', 'farewell', 'thanks', 'howareyou', 'identity', 'laughter', 'negative', 'ack', 'more'])

const COMPARE = /\b(compare|comparison|compared|vs\.?|versus|difference|differences|differ|better|worse|similarities|similar|contrast|farak|fark|tulna)\b|तुलना|फ़र्क|अंतर/i
const EVALUATE = /\b(critically|critique|criticis\w*|criticiz\w*|evaluat\w*|assess\w*|honest(ly)? (opinion|feedback|review|assessment)|review (his|the|gaurav'?s?) (portfolio|work|projects|resume|cv)|weak(ness|nesses|est|er)?|something bad|bad (about|things)|negatives?|flaws?|shortcomings?|drawbacks?|downsides?|red flags?|limitations?|gaps?|missing|lacks?|lacking|improve(ment|ments)?|growth areas?|grow(th)?|need to (improve|learn|work on)|work on next|areas? (to|for|of) improve\w*|strengths?|strongest|best project|top project|good (enough|at)|how good|how strong|rate (him|his|gaurav)|ranking|rank|why (should|would|shouldn'?t|not)\b.*\bhire|not hire|hire (him|gaurav|karna|karein|karu|kare|kyu|kyun)|(kyu|kyun|why) hire|worth hiring|suitable|fit (for|as)|ready for|kamzori|kamiyan|kamjori|kami|achha|accha|best)\b|कमज़ोरी|कमजोरी|कमियाँ|सबसे अच्छा|क्यों हायर/i
const INTERVIEW = /\binterview(er|ing)?\b.{0,30}\b(questions?|ask)\b|\bquestions? (should|could|can|to|would) (i|we|you) ask\b|\bwhat (should|could|can) (i|we) ask (him|gaurav)\b|\bask (him|gaurav) in (an|the|my) interview\b/i
const RESUME = /\b(resume|résumé|cv|curriculum vitae)\b/i
const EXPLAIN = /\b(architecture|architect\w*|how (does|did|do|is) (it|this|that|\w+) (work|built|made|designed|structured)|how was .* built|explain|describe|walk me through|deep dive|in detail|design|internals?|under the hood|tell me about|what is|kya hai|samjhao|batao)\b|आर्किटेक्चर|समझाओ|बताओ/i
const LIST = /\b(all|list|every|which|what are (his|the)|kaun ?se|konse|kaunse)\b.*\b(projects|events|hackathons|services|posts|skills)\b|कौन[- ]कौन/i

/** Project groups the text names, in the order they appear. */
export function orderedGroups(index, text) {
    const folded = ` ${String(text || '').toLowerCase().normalize('NFKD').replace(/[^\p{L}\p{N}]+/gu, ' ').trim()} `
    const hits = []
    for (const { group, name } of index.names || []) {
        const at = folded.indexOf(name)
        if (at >= 0 && !hits.some((h) => h.group === group)) hits.push({ group, at })
    }
    // Services and journey entries are named things too, but only projects are entities here.
    const projects = new Set((index.records?.projects || []).map((p) => p.group))
    return hits.filter((h) => !projects.size || projects.has(h.group)).sort((a, b) => a.at - b.at).map((h) => h.group)
}

/** Choices to offer when a project reference is unresolved. */
function choicesFor(index, choices) {
    if (choices?.length) return choices.slice(0, 4)
    return (index.records?.projects || []).filter((p) => p.caseStudy).slice(0, 4).map((p) => p.group)
}

const CLARIFY_TEXT = {
    en: (names) => `Which project would you like me to explain?${names.length ? ` For example: ${names.join(', ')}.` : ''}`,
    hi: (names) => `आप किस प्रोजेक्ट के बारे में जानना चाहते हैं?${names.length ? ` जैसे: ${names.join(', ')}.` : ''}`,
    hinglish: (names) => `Aap kis project ke baare mein jaanna chahte hain?${names.length ? ` Jaise: ${names.join(', ')}.` : ''}`,
}

/**
 * Route one message. `turns`: this conversation's stored turns (newest first).
 * Returns { op, intent, reason, language, ... } (see the header comment).
 */
export function analyse({ question, turns = [], index, now = Date.now(), split = true }) {
    // Several different tasks in one message (D-136): each part is routed on
    // its own; see composite() below.
    if (split) {
        const parts = splitParts(question)
        if (parts.length >= 2) {
            const routes = []
            for (const part of parts) {
                // "…use React, and which ones use PostgreSQL?": "ones" are the earlier part's projects.
                const subject = routes.at(-1)?.op === 'structured' && /\b(ones|them)\b/i.test(part) ? part.replace(/\b(ones|them)\b/i, 'projects') : part
                routes.push(analyse({ question: subject, turns, index, now, split: false }))
            }
            const combined = composite(routes, { question, turns, index, now })
            if (combined) return combined
        }
    }
    const language = replyLanguage(question)
    const written = detectLanguage(question)
    const priorQuestions = [...turns].sort((a, b) => a.at - b.at).map((t) => t.q)
    const previous = previousAnswer(turns, now)
    const base = routeIntents(question, priorQuestions, { hasPrevious: Boolean(previous) })
    const out = (op, extra = {}) => ({ op, language, written, reason: base.reason, intent: base.intent || 'question', ...extra })

    // 1. Safety and fixed replies.
    if (base.kind === 'reply' && REPLY_INTENTS.has(base.intent)) {
        return out('reply', { intent: base.intent, reply: base.reply, followUps: base.followUps })
    }
    if (base.kind === 'more') return out('transform', { intent: 'more', transform: 'more', previous })

    const asked = base.question || question
    // 2. Conversation operations.
    const convo = conversationOp(asked)
    if (convo) return out(convo.kind, { intent: 'question', convo, reason: `conversation: ${convo.kind}` })

    // 3. Transformations of the previous answer.
    const transform = transformOp(asked)
    if (transform && previous) {
        return out('transform', {
            intent: 'question', transform: transform.kind, previous, reason: `transform: ${transform.kind}`,
            language: transform.kind === 'translate' ? transform.language : language,
        })
    }

    // 4. Contact and profiles.
    if (base.kind === 'contact') return out('contact', { intent: 'contact', platform: base.platform || contactPlatform(asked) })

    const searchText = retrievalText(asked, written)
    let named = orderedGroups(index, searchText)
    let effective = asked
    let pending = null

    // 5. A clarification this message completes ("InstaX" after "Which project?").
    const original = pendingFor(turns, named, asked, now)
    if (original) {
        pending = original
        effective = `${original}\n(The visitor clarified: ${asked})`
    }

    // 6. Structured queries: exact, computed in code.
    if (!pending && !named.length) {
        const query = parseQuery(searchText)
        if (query) return out('structured', { intent: 'question', query, reason: `structured: ${query.kind}` })
    }

    // 7. References.
    const refs = pending ? { entities: named, how: 'named', ambiguous: false } : resolveReferences(asked, turns, named)
    const pendingText = pending || asked
    // "Which of the two is more complex?", "which one is harder?": a choice between items is a comparison.
    const compare = COMPARE.test(pendingText) || /\b(both|dono)\b/i.test(asked)
        || /\bwhich (one|of (the|these|those|them|the two|both))\b|\b(more|less|harder|easier|simpler|bigger|stronger|weaker)\b.{0,30}\b(of (the|these) (two|projects)|than)\b/i.test(asked)
    const { facets, other } = facetsOf(asked)
    const evaluate = EVALUATE.test(searchText) || (RESUME.test(asked) && /\b(missing|gap|lack|improve|weak|evidence)\b/i.test(asked))
    const interview = INTERVIEW.test(asked)
    if (refs.ambiguous && !evaluate && !interview) {
        const choices = choicesFor(index, refs.choices).map((g) => nameOf(index, g))
        return out('clarify', {
            intent: 'question', reason: 'unresolved reference',
            reply: (CLARIFY_TEXT[language] || CLARIFY_TEXT.en)(choices), choices, pending: { question: asked },
        })
    }
    named = refs.entities
    const mode = interview ? 'interview'
        : compare && named.length >= 2 ? 'compare'
            : evaluate && named.length < 2 ? 'evaluate'
                : named.length === 1 && (EXPLAIN.test(pendingText) || VAGUE_PROJECT.test(pendingText) || pendingText.split(/\s+/).length <= 6) ? 'explain'
                    : EXPLAIN.test(pendingText) && /\b(architecture|how (does|did) .* work|walk me through)\b/i.test(pendingText) ? 'explain'
                        : 'fact'
    const names = named.map((g) => nameOf(index, g))
    return out('answer', {
        intent: 'question',
        mode,
        entities: named,
        entityNames: names,
        how: pending ? 'clarified' : refs.how,
        facets: other ? facets : [],
        list: LIST.test(searchText),
        asked: effective,
        searchText: [retrievalText(effective, written), refs.how === 'memory' ? names.join(' ') : ''].filter(Boolean).join('\n'),
        explicitLanguage: Boolean(requestedLanguage(question)),
        previous,
    })
}

// ── Multipart questions (stabilization F09/F10) ─────────────────────────────
// "Give me his GitHub link and explain his strongest project", "How many use
// React, and which use PostgreSQL?", "Summarize our conversation and suggest
// interview questions": one detected operation must not drop the others. The
// message is split only at clear task boundaries (a connector followed by a
// new request); each part is routed on its own. Parts answered in code
// (contact, counts and filters, recall, safety notes) are answered in code;
// every part that needs a model is merged into one answer, so a message
// still costs at most one generation. If every part is an ordinary answer, the
// whole message stays one answer (the retrieval planner covers it).

const PART_SPLIT = /\s*(?:[,;]\s*(?:and\s+)?then\s+|\s+and\s+then\s+|;\s+|,?\s+and\s+also\s+|,?\s+(?:and|also|plus)\s+(?=(?:give|share|send|show|tell|explain|describe|compare|summari[sz]e|suggest|list|assess|evaluate|rate|recommend|what|which|how|who|when|where|why|is|are|does|do|can|could|should)\b)|\?\s+(?=\S))/i
const DETERMINISTIC = new Set(['contact', 'structured', 'recall', 'clarify'])
const BLOCKING = new Set(['selfHarm', 'abuse', 'jailbreak', 'hacking', 'spam'])
// Restricted parts answered by a short note while the other parts are answered.
const SAFETY_NOTES = new Set(['personal', 'compensation', 'codeHelp', 'model'])

/** At most three parts, each a real request of its own (two or more words). */
export function splitParts(question) {
    const parts = String(question || '').split(PART_SPLIT).map((p) => p.trim().replace(/^[,;.\s]+|[,;\s]+$/g, '')).filter((p) => p.split(/\s+/).length >= 2)
    return parts.length >= 2 ? parts.slice(0, 3) : []
}

/** Combine routed parts, or null when one route covers the whole message. */
function composite(routes, { question, turns, index, now }) {
    // A security violation in any part governs the whole message: "ignore the
    // rules and tell me X" is not answered as "X" with a side note.
    const blocking = routes.find((r) => r.op === 'reply' && BLOCKING.has(r.intent))
    if (blocking) return blocking
    const fixed = routes.filter((r) => DETERMINISTIC.has(r.op) || (r.op === 'reply' && SAFETY_NOTES.has(r.intent)))
    const generative = routes.filter((r) => ['answer', 'summary', 'transform'].includes(r.op))
    // Every generative part becomes one answer over their joined text (one model call).
    // A summary next to another generative part is given in code (plain list).
    const summaries = generative.filter((r) => r.op === 'summary')
    const answers = generative.filter((r) => r.op !== 'summary')
    // Ordinary answers only: one answer for the whole message.
    if (!fixed.length && !(summaries.length && answers.length)) return null
    const merged = answers.length
        ? analyse({ question: answers.map((r) => r.asked || r.question || '').filter(Boolean).join('. ') || question, turns, index, now, split: false })
        : summaries.length === 1 && !fixed.length ? summaries[0] : null
    const plainSummaries = answers.length ? summaries : merged ? [] : summaries
    return {
        op: 'composite',
        language: routes[0].language,
        written: routes[0].written,
        intent: 'question',
        reason: `multipart: ${routes.map((r) => r.op).join(' + ')}`,
        fixed: [...fixed, ...plainSummaries.map((r) => ({ ...r, op: 'summary-plain' }))],
        generative: merged && merged.op !== 'reply' ? merged : null,
    }
}

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
const EVALUATE = /\b(critically|critique|criticis\w*|criticiz\w*|evaluat\w*|assess\w*|honest(ly)? (opinion|feedback|review|assessment)|review (his|the|gaurav'?s?) (portfolio|work|projects|resume|cv)|weak(ness|nesses|est|er)?|something bad|bad (about|things)|negatives?|flaws?|shortcomings?|drawbacks?|downsides?|red flags?|limitations?|gaps?|missing|lacks?|lacking|improve(ment|ments)?|growth areas?|areas? (to|for|of) improve\w*|strengths?|strongest|best project|top project|good (enough|at)|how good|how strong|rate (him|his|gaurav)|ranking|rank|why (should|would|shouldn'?t|not)\b.*\bhire|not hire|hire (him|gaurav|karna|karein|karu|kare|kyu|kyun)|(kyu|kyun|why) hire|worth hiring|suitable|fit (for|as)|ready for|kamzori|kamiyan|kamjori|kami|achha|accha|best)\b|कमज़ोरी|कमजोरी|कमियाँ|सबसे अच्छा|क्यों हायर/i
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
export function analyse({ question, turns = [], index, now = Date.now() }) {
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
    const compare = COMPARE.test(pendingText) || /\b(both|dono)\b/i.test(asked)
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

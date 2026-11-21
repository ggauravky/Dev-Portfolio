// Chat evaluation datasets (D-113): `node --test scripts/chat-eval.test.mjs`
// (part of `npm run test:chat`). No network: keyword-only retrieval, so these
// check routing and evidence selection, not model wording. Each category
// prints its accuracy; any miss fails the test with the questions listed.
//
// scripts/chat-eval/
//   routing.json    350 phrasings: projects × templates, typos, Hinglish,
//                   attacks, spam, personal, contact, small talk, off-topic
//   typos.json      138 machine-made typos (drop, swap, double a letter)
//   recruiter.json  248 hiring, fit, abilities and pay phrasings
//   security.json   professional security questions vs attack requests
//   multipart.json  comparisons and several-part questions

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { buildCorpus, loadSiteData } from '../lib/chat/corpus.js'
import { looksLikeNoise, namedGroups, prepareIndex, rank, withFaq, faqMatch, withOverviews, correctQuestion } from '../lib/chat/retrieve.js'
import { aboutGaurav, classify, fixTriggers } from '../lib/chat/intents.js'
import { COMPLEX_MAX_CHARS, COMPLEX_MAX_CHUNKS, gatherEvidence, planQuestion } from '../lib/chat/plan.js'

const load = (name) => JSON.parse(readFileSync(new URL(`./chat-eval/${name}.json`, import.meta.url), 'utf8'))
const corpus = buildCorpus(await loadSiteData())
const faqKeys = corpus.chunks.filter((c) => c.faq).flatMap((c) => [c.faq.question, ...c.faq.alternates].map((text) => ({ chunkId: c.id, text })))
const index = prepareIndex({ chunks: corpus.chunks, aliases: corpus.aliases, faqKeys, profiles: corpus.profiles })
const SMALL_TALK = new Set(['greeting', 'farewell', 'thanks', 'ack', 'laughter', 'howareyou', 'identity', 'more', 'negative'])

function report(name, results) {
    const misses = results.filter((r) => !r.ok)
    console.log(`[eval] ${name}: ${results.length - misses.length}/${results.length} (${((1 - misses.length / results.length) * 100).toFixed(1)}%)`)
    assert.deepEqual(misses.map((m) => m.why), [], `${name}: ${misses.length} miss(es)`)
}

const routes = (q) => {
    const asked = correctQuestion(index, aboutGaurav(fixTriggers(q)))
    return withOverviews(index, withFaq(rank(index, asked), faqMatch(index, asked)), asked)
}

test('eval: routing (350 phrasings)', () => {
    report('routing', load('routing').map(({ q, intent, onTopic }) => {
        const got = classify(q)
        if (intent === 'smalltalk') return { ok: SMALL_TALK.has(got), why: `${q} → ${got}` }
        if (intent === 'gibberish-ish') {
            const ok = got === 'gibberish' || (got === 'question' && (looksLikeNoise(index, q) || !rank(index, q).matched))
            return { ok, why: `${q} → ${got}` }
        }
        if (got !== intent) return { ok: false, why: `${q} → ${got} (want ${intent})` }
        if (onTopic === false && routes(q).matched) return { ok: false, why: `${q}: off-topic but matched` }
        return { ok: true }
    }))
})

test('eval: typos (138 variants)', () => {
    report('typos', load('typos').map(({ q, intent, onTopic }) => {
        const got = classify(q)
        if (got !== intent) return { ok: false, why: `${q} → ${got} (want ${intent})` }
        if (onTopic && !rank(index, q).matched) return { ok: false, why: `${q}: on-topic but unmatched` }
        return { ok: true }
    }))
})

test('eval: recruiter questions reach the hiring summaries (248)', () => {
    const roleId = (r) => (/full|mern|software/.test(r) ? 'hire:fullstack' : /front|react/.test(r) ? 'hire:frontend' : /back|node/.test(r) ? 'hire:backend'
        : /ai|genai|llm/.test(r) ? 'hire:ai' : /ml|machine/.test(r) ? 'hire:ml' : /data/.test(r) ? 'hire:data' : null)
    report('recruiter', load('recruiter').map(({ q, expect, role }) => {
        const got = classify(q)
        if (expect === 'compensation') return { ok: got === 'compensation', why: `${q} → ${got}` }
        if (expect === 'question') return { ok: got === 'question', why: `${q} → ${got}` }
        if (got !== 'question') return { ok: false, why: `${q} → ${got}` }
        const ids = routes(q).top.map((c) => c.id)
        if (expect === 'hire' && !ids.some((id) => id.startsWith('hire:'))) return { ok: false, why: `${q}: no hiring summary` }
        const need = role && role !== 'multi' && roleId(role)
        if (need && !ids.includes(need)) return { ok: false, why: `${q}: no ${need}` }
        if (role === 'multi' && ids.filter((id) => id.startsWith('hire:')).length < 2) return { ok: false, why: `${q}: one role only` }
        if (expect === 'hire-or-about' && !ids.some((id) => /^(hire:|kb:identity|kb:approach|kb:skills|skills:|faq:)/.test(id))) return { ok: false, why: `${q}: no profile evidence` }
        return { ok: true }
    }))
})

test('eval: security questions vs attack requests', () => {
    report('security', load('security').map(({ q, intent }) => {
        const got = classify(q)
        return { ok: got === intent, why: `${q} → ${got} (want ${intent})` }
    }))
})

test('eval: complex questions get evidence for every part, within budget, never mixed', () => {
    report('multipart', load('multipart').map(({ q, entities = [], minParts = 0, simple }) => {
        const named = namedGroups(index, q)
        const plan = planQuestion(q, named)
        if (simple) return { ok: !plan.complex, why: `${q}: should stay simple` }
        if (!plan.complex) return { ok: false, why: `${q}: not seen as complex` }
        if (plan.parts.length < minParts) return { ok: false, why: `${q}: ${plan.parts.length} parts < ${minParts}` }
        const top = gatherEvidence(index, plan, rank(index, q))
        const missing = entities.filter((g) => !top.some((c) => c.group === g))
        if (missing.length) return { ok: false, why: `${q}: no evidence for ${missing.join(', ')}` }
        // A chunk tagged with an entity belongs to that entity's group.
        const mixed = top.filter((c) => c.entity && !entities.some((g) => g === c.group))
        if (mixed.length) return { ok: false, why: `${q}: tagged chunks outside the named entities: ${mixed.map((c) => c.id).join(', ')}` }
        const chars = top.reduce((sum, c) => sum + Math.min(c.text.length, c.contextChars || 1000), 0)
        if (top.length > COMPLEX_MAX_CHUNKS || chars > COMPLEX_MAX_CHARS + 1000) return { ok: false, why: `${q}: over budget (${top.length} chunks, ${chars} chars)` }
        return { ok: true }
    }))
})

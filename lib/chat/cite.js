// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// Citation checking (D-113). The model marks facts with the number of the
// <source> they came from ("[2]", "[1, 3]"). After the answer has streamed:
// - markers pointing at no source are dropped (the client hides them)
// - the "From" links become the sources actually cited, in order
// - each sentence is checked against the sources it cites (or, without a
//   marker, against all of them): every number, year and price must appear in
//   that evidence; a sentence naming one project must not give it a technology
//   that the project's own sources never mention
//
// This is a lexical check, not proof: it catches a wrong price, a made-up
// count or a stack moved from one project to another, but not a claim that
// rephrases evidence wrongly. Flags are logged and the client shows a short
// note asking the visitor to check the linked pages. No extra model call.

const MARKER = /\[(\d{1,2}(?:\s*,\s*\d{1,2})*)\](?!\()/g
const TECH = /\b(react|next\.?js|vue|angular|svelte|node\.?js|express|nestjs|django|flask|fastapi|spring|laravel|mongodb|mongoose|postgres(?:ql)?|mysql|sqlite|prisma|redis|firebase|supabase|neon|graphql|socket\.io|websockets?|docker|kubernetes|aws|gcp|azure|vercel|render|netlify|tailwind|redux|typescript|stripe|razorpay|clerk|jwt|oauth|tensorflow|pytorch|scikit-learn|opencv|langchain|openai|gemini|whisper|chromadb)\b/gi

// Commas are kept: "3,000" must stay one number when facts are compared.
const fold = (text) => String(text || '').toLowerCase().replace(/[‐-―]/g, '-').replace(/\s+/g, ' ')

/** "[1, 3]" positions in the answer → numbers. */
export function citedNumbers(answer) {
    const numbers = []
    for (const m of String(answer || '').matchAll(MARKER)) for (const n of m[1].split(',')) numbers.push(Number(n.trim()))
    return numbers
}

/** Facts that must appear in the evidence: numbers (prices, years, counts). */
function factsOf(sentence) {
    const facts = []
    for (const m of sentence.replace(MARKER, ' ').matchAll(/(?:₹|inr\s*|rs\.?\s*)?\d[\d,]*(?:\.\d+)?\+?/gi)) {
        const digits = m[0].replace(/[^\d.]/g, '')
        if (digits.length >= 2) facts.push(digits.replace(/\.$/, ''))
    }
    return facts
}

/**
 * Check an answer against the chunks the model saw (in prompt order, so
 * source n is chunks[n - 1]). `projects`: [{ group, name }] the corpus knows
 * (index.names), used to spot a sentence about one project.
 * Returns { cited: chunk[], valid: { n: chunk }, flags: [{ type, text }] }.
 */
export function validateCitations(answer, chunks, projects = []) {
    const text = String(answer || '')
    const valid = {}
    const order = []
    for (const n of citedNumbers(text)) {
        const chunk = chunks[n - 1]
        if (!chunk) continue
        valid[n] = chunk
        if (!order.includes(chunk)) order.push(chunk)
    }
    const allEvidence = fold(chunks.map((c) => `${c.title} ${c.text}`).join(' '))
    const flags = []
    const sentences = text.split(/(?<=[.!?])\s+|\n+/).map((s) => s.trim()).filter((s) => s.length > 12)
    for (const sentence of sentences) {
        const refs = citedNumbers(sentence).map((n) => chunks[n - 1]).filter(Boolean)
        const evidence = refs.length ? fold(refs.map((c) => `${c.title} ${c.text}`).join(' ')) : allEvidence
        // Whole numbers, not substrings: "999" is not in "3999".
        const known = new Set(factsOf(evidence))
        for (const fact of factsOf(sentence)) {
            if (!known.has(fact)) flags.push({ type: 'number-not-in-source', text: sentence.slice(0, 160) })
        }
        // One project named in the sentence: its technologies must be in its own sources.
        const lower = ` ${fold(sentence).replace(/[^a-z0-9 ]+/g, ' ')} `
        const named = [...new Set(projects.filter((p) => lower.includes(p.name)).map((p) => p.group))]
        if (named.length === 1) {
            const own = fold(chunks.filter((c) => c.group === named[0]).map((c) => c.text).join(' '))
            if (own) {
                for (const m of sentence.matchAll(TECH)) {
                    const tech = m[0].toLowerCase().replace(/\.js$/, '').replace(/\./g, '')
                    if (!own.replace(/\./g, '').includes(tech)) flags.push({ type: 'tech-not-in-project-source', text: sentence.slice(0, 160) })
                }
            }
        }
    }
    // One flag per sentence and type is enough.
    const seen = new Set()
    return {
        cited: order,
        valid,
        flags: flags.filter((f) => !seen.has(`${f.type}|${f.text}`) && seen.add(`${f.type}|${f.text}`)),
    }
}

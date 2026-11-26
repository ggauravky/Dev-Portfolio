// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// Evidence planning (D-134): the operation and its entities decide what goes
// into the model's context, before any similarity ranking.
// - a named or resolved project gets its own authoritative evidence: a fact
//   card from the structured records (stack, status, links, team) plus its
//   best records, whatever their similarity score; in a comparison every
//   project gets its share, so none is crowded out by another
// - an evaluation (strengths, weaknesses, critique, resume gaps, hiring fit,
//   interview questions) always gets the profile, education, experience,
//   hiring summary, growth areas and an explicit "evidence limits" source
// Every piece is built from the records and chunks already in the index; none
// adds a fact.

import { STATUS_TEXT } from './records.js'

const charsOf = (chunk) => Math.min(chunk.text?.length || 0, chunk.contextChars || 1000)

/** The record for a project group. */
export const recordOf = (index, group) => (index.records?.projects || []).find((p) => p.group === group) || null

/** A display name for a group (project, journey entry or service). */
export function nameOf(index, group) {
    const record = recordOf(index, group)
    if (record) return record.name.split(/\s*[:(]/)[0].trim()
    const chunk = index.chunks.find((c) => c.group === group && ['project', 'journey', 'service'].includes(c.type))
    return chunk ? chunk.title.split(/[:(]/)[0].trim() : group
}

/** A project's key facts as one evidence chunk, tagged with its name. */
export function projectCard(record) {
    const lines = [
        `${record.name}. Category: ${record.category || 'not documented'}.`,
        `Technology stack (as recorded): ${record.stack.length ? record.stack.join(', ') : 'not documented'}${record.stackDocumented ? '' : ' (not documented in detail)'}.`,
        `Status: ${STATUS_TEXT[record.statusClass]} (${record.status.replace(/_/g, ' ')}).`,
        record.live ? `Live demo link: ${record.live}.` : 'No live demo link is recorded.',
        record.github ? `Public repository: ${record.github}.` : '',
        record.collaborative ? `Built with a team${record.teamSize ? ` of ${record.teamSize}` : ''}.` : 'No teammates are recorded.',
        record.planned ? `It has ${record.planned} planned (not built) features recorded.` : '',
        record.summary ? `Summary: ${record.summary}` : '',
    ]
    return {
        id: `card:${record.group}`,
        type: 'project',
        title: `${record.name}: key facts`,
        url: record.url,
        group: record.group,
        entity: record.name.split(/\s*[:(]/)[0].trim(),
        status: STATUS_TEXT[record.statusClass],
        summary: record.summary,
        text: lines.filter(Boolean).join('\n'),
        contextChars: 900,
    }
}

// Within a project, the facets that explain it best come first.
const FACET_ORDER = [/overview/, /implementation|features/, /architecture|technical/, /history|roadmap/, /./]
const facetRank = (chunk) => FACET_ORDER.findIndex((re) => re.test(chunk.id))

/**
 * Evidence for named or resolved projects. `ranked`: the ranking of the whole
 * question (with `all`). Each entity gets its card and up to `per` records:
 * its best-ranked records, then its overview and implementation records.
 */
export function entityEvidence(index, groups, ranked, { per = 3, maxChars = 7000 } = {}) {
    const out = []
    const seen = new Set()
    let chars = 0
    const share = Math.floor(maxChars / Math.max(1, groups.length))
    for (const group of groups) {
        const record = recordOf(index, group)
        const entity = nameOf(index, group)
        let used = 0
        const take = (chunk, score = 1) => {
            if (!chunk || seen.has(chunk.id)) return
            const size = charsOf(chunk)
            if (used && used + size > share) return
            seen.add(chunk.id)
            used += size
            chars += size
            out.push({ ...chunk, entity, score })
        }
        if (record) take(projectCard(record))
        const byScore = new Map((ranked?.all || []).map((s) => [s.chunk.id, s.score]))
        const own = index.chunks
            .filter((c) => c.group === group && c.type !== 'faq')
            .map((c) => ({ c, score: byScore.get(c.id) || 0 }))
            .sort((a, b) => (b.score - a.score) || (facetRank(a.c) - facetRank(b.c)))
        // The best match first, then the overview and implementation facets.
        const ordered = [own[0], ...own.slice(1).sort((a, b) => facetRank(a.c) - facetRank(b.c))].filter(Boolean)
        let n = 0
        for (const { c, score } of ordered) {
            if (n >= per) break
            const before = out.length
            take(c, score)
            if (out.length > before) n += 1
        }
    }
    return { chunks: out, chars }
}

/** What the records do not establish, stated once, for evaluations. */
export function limitsChunk(index) {
    const projects = index.records?.projects || []
    const unverified = projects.filter((p) => ['owner-reported', 'idea'].includes(p.statusClass)).map((p) => p.name)
    const historical = projects.filter((p) => p.statusClass === 'historical').length
    const github = index.records?.github
    return {
        id: 'limits:evidence',
        type: 'about',
        title: 'Evidence limits (what the records do not establish)',
        url: '',
        group: 'limits',
        status: 'computed from the records',
        contextChars: 1400,
        text: [
            'No project has published usage, user, traffic or revenue numbers.',
            'Coding-practice platforms (LeetCode, CodeChef, GeeksforGeeks): profile links are listed; his resume reports 250+ LeetCode problems solved (owner-reported, not independently verified); no ratings or contest results are recorded.',
            github ? `GitHub: commit and streak numbers are owner-reported and unverified; ${github.reposIndexed} public repositories were indexed on ${github.snapshot}. Repository counts are not project counts.` : '',
            `${unverified.length} of ${projects.length} project records are described by Gaurav but not independently verified (${unverified.slice(0, 6).join(', ')}${unverified.length > 6 ? ', …' : ''}); ${historical} are earlier case studies kept as historical.`,
            'No salary or stipend expectation is published.',
            'His public resume (/resume.pdf) is included as owner-reported text (its claims, such as CGPA, LeetCode counts and a 30% efficiency figure, are not independently verified); its layout and design are not visible here, and where it differs from the site those differences are listed.',
            'He is an early-career developer (a final-year student and intern): the records show what he has built, not long production operation, large teams or seniority. Absence of evidence is not evidence of inability.',
        ].filter(Boolean).join(' '),
    }
}

const PROFILE_IDS = ['hire:overall', 'kb:identity', 'kb:experience', 'kb:links', 'kb:resume', 'kb:education', 'kb:approach', 'kb:github', 'overview:projects']

/** Evidence for an evaluation or interview questions, within a budget. */
export function evaluationEvidence(index, ranked, { interview = false, resume = false, maxChars = 8500 } = {}) {
    const out = []
    const seen = new Set()
    let chars = 0
    const take = (chunk) => {
        if (!chunk || seen.has(chunk.id)) return
        const size = charsOf(chunk)
        if (chars + size > maxChars && out.length) return
        seen.add(chunk.id)
        chars += size
        out.push({ ...chunk, score: chunk.score || 1 })
    }
    const byId = (id) => index.chunks.find((c) => c.id === id)
    // The limits first: an evaluation must always know what is not established.
    take(limitsChunk(index))
    for (const id of PROFILE_IDS.slice(0, 4)) take(byId(id))
    // A question about his resume gets every piece of it (its claims and its differences from the site).
    if (resume) for (const chunk of index.chunks.filter((c) => c.group === 'resume')) take(chunk)
    // The owner's case studies are the strongest documented evidence; an
    // interview also needs the engineering decisions to ask about.
    const studies = (index.records?.projects || []).filter((p) => p.caseStudy).slice(0, interview ? 4 : 3)
    for (const record of studies) take(projectCard(record))
    if (interview) for (const chunk of index.chunks.filter((c) => c.group === 'decisions').slice(0, 2)) take(chunk)
    for (const id of PROFILE_IDS.slice(4)) take(byId(id))
    for (const chunk of (ranked?.top || []).slice(0, 3)) take(chunk)
    return out
}

/** A stored chunk id back to its chunk, including the built ones (cards, limits). */
export function chunkById(index, id) {
    if (String(id).startsWith('card:')) {
        const record = recordOf(index, String(id).slice(5))
        return record ? projectCard(record) : null
    }
    if (id === 'limits:evidence') return limitsChunk(index)
    return index.byId?.get(id) || null
}

/** A plain side-by-side table from the records (no model): the comparison fallback. */
export function comparisonTable(index, groups) {
    const records = groups.map((g) => recordOf(index, g)).filter(Boolean)
    if (records.length < 2) return ''
    const cell = (text) => String(text || 'not documented').replace(/\|/g, '/').replace(/\s+/g, ' ')
    const head = `| | ${records.map((r) => cell(r.name.split(/\s*[:(]/)[0])).join(' | ')} |`
    const sep = `|---|${records.map(() => '---').join('|')}|`
    const rows = [
        ['Category', (r) => r.category],
        ['Stack', (r) => r.stack.slice(0, 8).join(', ')],
        ['Status', (r) => STATUS_TEXT[r.statusClass]],
        ['Live demo', (r) => (r.live ? 'linked' : 'none recorded')],
        ['Team', (r) => (r.collaborative ? `team${r.teamSize ? ` of ${r.teamSize}` : ''}` : 'none recorded')],
    ].map(([label, get]) => `| ${label} | ${records.map((r) => cell(get(r))).join(' | ')} |`)
    return [head, sep, ...rows].join('\n')
}

/** A plain project summary from the records (no model): a single-project fallback. */
export function projectSummary(index, group) {
    const r = recordOf(index, group)
    if (!r) return ''
    return [
        `**${r.name}**: ${r.summary || r.category}`,
        `- Stack: ${r.stack.slice(0, 10).join(', ') || 'not documented'}`,
        `- Status: ${STATUS_TEXT[r.statusClass]}`,
        r.url ? `- More: ${r.url}` : '',
    ].filter(Boolean).join('\n')
}

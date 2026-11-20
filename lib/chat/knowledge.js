// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// Chunks from the owner's knowledge base (lib/chat/knowledge-base.json, D-109).
// Its retrieval records, FAQ pairs and profile sections become retrieval
// chunks next to the site's own data. Every chunk keeps the record's status
// ("planned", "user reported", "historical"…) so the model can say how sure a
// claim is. Nothing here is written by hand: text comes from the file.

const MAX_PIECE = 900 // characters per chunk; longer records are split on sentences

// Knowledge-base project ids whose site slug differs.
const SLUG_ALIASES = { 'linkedin-clone': 'mern-linkedin-clone' }

// Short names visitors use for projects with long titles (names, not facts).
const SHORT_NAMES = {
    'kanoon-mate': ['Kanoon-Mate', 'Kanoon Mate', 'KanoonMate'],
    'rag-ai-teaching-assistant': ['RAG teaching assistant', 'RAG AI teaching assistant', 'AI teaching assistant'],
    'flipkart-capstone': ['Flipkart'],
    'fire-detection-alert-system': ['fire detection'],
    'mental-health-score-predictor': ['mental health predictor', 'mental health score'],
    'notehub-studyspace': ['NoteHub', 'StudySpace'],
    'vscode-error-sound-notifier': ['error sound notifier'],
    'smart-lms': ['SmartLMS'],
    'pdf-to-audio-book': ['PDF to audiobook'],
    'dev-portfolio-admin-panel': ['admin panel'],
}

const join = (parts) => parts.filter((part) => part && String(part).trim()).join('\n')
const list = (items, sep = '; ') => (Array.isArray(items) ? items.filter(Boolean).join(sep) : '')

/** "public_repository_documented" → "public repository documented". */
export const humanStatus = (status) => String(status || '').replace(/_/g, ' ').trim()

/** Split text into pieces of at most `max` characters, on sentence ends. */
export function splitText(text, max = MAX_PIECE) {
    const flat = String(text || '').replace(/\s+/g, ' ').trim()
    if (flat.length <= max) return flat ? [flat] : []
    const sentences = flat.match(/[^.!?]+[.!?]+(?=\s|$)|[^.!?]+$/g) || [flat]
    const pieces = []
    let current = ''
    for (const sentence of sentences.map((s) => s.trim())) {
        if (current && current.length + sentence.length + 1 > max) {
            pieces.push(current)
            current = ''
        }
        current = current ? `${current} ${sentence}` : sentence
        while (current.length > max) {
            const cut = current.slice(0, max).replace(/\s+\S*$/, '')
            pieces.push(cut)
            current = current.slice(cut.length).trim()
        }
    }
    if (current) pieces.push(current)
    return pieces
}

/** Chunks for one record, split when long: ids get "#2", "#3"… */
function pieces(base, text, label = '') {
    // The label line ("TaskNexus: Overview. Status: …") counts toward the piece.
    const parts = splitText(text, MAX_PIECE - label.length - 16)
    return parts.map((part, i) => ({
        ...base,
        id: i ? `${base.id}#${i + 1}` : base.id,
        text: join([label && i ? `${label} (continued)` : label, part]),
    }))
}

const firstSentence = (text, max = 200) => {
    const flat = String(text || '').replace(/\s+/g, ' ').trim()
    const sentence = flat.match(/^.{20,}?[.!?](?=\s|$)/)?.[0] || flat
    return sentence.length > max ? `${sentence.slice(0, max).replace(/\s+\S*$/, '')}…` : sentence
}

// FAQ categories → the site page that covers them (project FAQs use the project).
const FAQ_PAGES = {
    about: '/about', mindset: '/about', goals: '/about', engineering: '/about', meta: '/about', legal: '/about',
    education: '/journey', experience: '/journey', achievements: '/journey', community: '/journey',
    skills: '/skills', projects: '/projects', ai: '/projects', ml: '/projects',
    opportunities: '/contact', contact: '/contact', github: 'https://github.com/ggauravky',
}
// Categories never offered as suggested questions (about the assistant itself).
export const FAQ_NOT_SUGGESTED = new Set(['meta', 'legal'])

/**
 * Build chunks from the knowledge base.
 * `siteSlugs`: project slugs that have a page on the site (/projects/<slug>).
 * Returns { chunks, aliases } where aliases maps a group (project slug) to the
 * names a visitor may use for it.
 */
export function knowledgeChunks(kb, siteSlugs = []) {
    if (!kb || typeof kb !== 'object') return { chunks: [], aliases: {} }
    const onSite = new Set(siteSlugs)
    const projects = new Map((kb.projects || []).map((p) => [p.id, p]))
    const groupOf = (projectId) => SLUG_ALIASES[projectId] || projectId
    const urlOf = (projectId) => {
        const slug = groupOf(projectId)
        if (onSite.has(slug)) return `/projects/${slug}`
        return projects.get(projectId)?.github_url || ''
    }
    const nameOf = (projectId) => projects.get(projectId)?.name || projectId

    const chunks = []

    // ── Retrieval records: project facets and roadmaps ──
    for (const record of kb.retrieval_records || []) {
        if (record.kind === 'faq') continue // built from kb.faq below, with the answer kept apart
        const projectId = record.project_id
        const title = record.kind === 'roadmap'
            ? `${nameOf(projectId)}: roadmap and plans`
            : String(record.title || nameOf(projectId)).replace(/\s+—\s+/, ': ')
        const base = {
            id: `kb:${record.id}`,
            type: record.kind === 'roadmap' ? 'roadmap' : 'project',
            title,
            url: urlOf(projectId),
            group: groupOf(projectId),
            status: humanStatus(record.status),
            summary: firstSentence(record.text),
            keywords: Array.isArray(record.keywords) ? record.keywords.slice(0, 16) : [],
        }
        chunks.push(...pieces(base, record.text, `${title}. Status: ${base.status}.`))
    }

    // ── FAQ: question, alternate phrasings and the owner's answer ──
    for (const faq of kb.faq || []) {
        const projectFaq = projects.has(faq.category)
        chunks.push({
            id: `faq:${faq.id}`,
            type: 'faq',
            title: faq.question,
            url: projectFaq ? urlOf(faq.category) : (FAQ_PAGES[faq.category] || '/about'),
            group: projectFaq ? groupOf(faq.category) : `faq:${faq.category}`,
            status: humanStatus(faq.confidence),
            summary: firstSentence(faq.answer),
            keywords: [],
            faq: {
                question: faq.question,
                alternates: Array.isArray(faq.alternate_phrasings) ? faq.alternate_phrasings : [],
                answer: faq.answer,
                category: faq.category,
                priority: faq.priority,
            },
            text: join([
                `Question: ${faq.question}`,
                faq.alternate_phrasings?.length ? `Also asked as: ${list(faq.alternate_phrasings)}` : '',
                `Answer (${humanStatus(faq.confidence)}): ${faq.answer}`,
            ]),
        })
    }

    // ── Profile sections ──
    const id = kb.identity || {}
    if (id.full_name) {
        chunks.push(...pieces({
            id: 'kb:identity', type: 'about', title: 'About Gaurav', url: '/about', group: 'about',
            summary: firstSentence(id.short_bio), keywords: id.aliases || [],
        }, join([
            `${id.full_name} (preferred name ${id.preferred_name}; GitHub ${id.github_handle}; also known as ${list(id.aliases, ', ')}).`,
            id.based_in ? `Based in ${[id.based_in.city, id.based_in.state, id.based_in.country].filter(Boolean).join(', ')}.` : '',
            `Current roles: ${list(id.current_roles)}.`,
            id.professional_headline,
            id.detailed_bio,
            id.current_interests?.length ? `Current interests: ${list(id.current_interests, ', ')}.` : '',
        ]), 'About Gaurav.'))
        chunks.push(...pieces({
            id: 'kb:approach', type: 'about', title: 'How Gaurav works and his goals', url: '/about', group: 'about',
            summary: firstSentence(id.professional_philosophy?.[0]), keywords: ['philosophy', 'goals', 'working style'],
        }, join([
            id.professional_philosophy?.length ? `Professional philosophy: ${list(id.professional_philosophy)}.` : '',
            id.career_goals?.short_term?.length ? `Short-term goals: ${list(id.career_goals.short_term)}.` : '',
            id.career_goals?.long_term?.length ? `Long-term goals: ${list(id.career_goals.long_term)}.` : '',
            id.working_style?.values?.length ? `Values: ${list(id.working_style.values, ', ')}.` : '',
            id.working_style?.debugging ? `Debugging: ${id.working_style.debugging}` : '',
            id.working_style?.team ? `In a team: ${id.working_style.team}` : '',
            id.working_style?.preferred_environments?.length ? `Preferred environments: ${list(id.working_style.preferred_environments)}.` : '',
        ]), 'How Gaurav works.'))
    }

    if (kb.education?.length) {
        chunks.push(...pieces({
            id: 'kb:education', type: 'about', title: 'Education', url: '/journey', group: 'education',
            summary: firstSentence(`${kb.education[0].program} at ${kb.education[0].institution}.`), keywords: ['education', 'study', 'degree'],
        }, kb.education.map((e) => join([
            `${e.program}, ${e.institution}${e.place ? ` (${e.place})` : ''}.`,
            `${e.start_year || '?'} to ${e.expected_graduation_year ? `${e.expected_graduation_year} (expected)` : '?'}; status: ${humanStatus(e.status)}${e.current_stage_as_of_2026_11 ? `; now: ${e.current_stage_as_of_2026_11}` : ''}.`,
            e.subjects?.length ? `Subjects: ${list(e.subjects, ', ')}.` : '',
        ])).join(' '), 'Education.'))
    }

    if (kb.experience?.length) {
        chunks.push(...pieces({
            id: 'kb:experience', type: 'about', title: 'Work experience', url: '/journey', group: 'experience',
            summary: `${kb.experience[0].role} at ${kb.experience[0].organization}.`, keywords: ['experience', 'internship', 'work', 'job'],
        }, kb.experience.map((e) => join([
            `${e.role} at ${e.organization}${e.start ? ` (from ${e.start}${e.end ? ` to ${e.end}` : ''})` : ''}; status: ${humanStatus(e.status)}.`,
            e.location ? `Location: ${e.location}.` : '',
            e.areas?.length ? `Areas: ${list(e.areas, ', ')}.` : '',
            e.public_safe_summary,
            e.disclosure_note ? `Not to be discussed: ${e.disclosure_note}` : '',
        ])).join(' '), 'Work experience.'))
    }

    const community = kb.community_and_achievements
    if (community) {
        chunks.push(...pieces({
            id: 'kb:community', type: 'about', title: 'Community roles and achievements', url: '/journey', group: 'community',
            summary: 'Community roles, events and achievement claims, each with how well it is verified.', keywords: ['community', 'achievements', 'events', 'hackathon'],
        }, join([
            community.community_roles?.length ? `Community roles: ${community.community_roles.map((r) => `${r.role}, ${r.organization} (announced ${r.announced}; ${humanStatus(r.status)})`).join('; ')}.` : '',
            community.achievement_claims?.length ? `Achievement claims: ${community.achievement_claims.map((a) => `${a.claim} (${humanStatus(a.status)}${a.note ? `: ${a.note}` : ''})`).join('; ')}.` : '',
            community.events?.length ? `Events: ${community.events.map((e) => `${e.name}${e.place ? `, ${e.place}` : ''} (${e.context}; ${humanStatus(e.status)})`).join('; ')}.` : '',
        ]), 'Community and achievements.'))
    }

    const skills = kb.skills
    if (skills) {
        const groups = Object.entries(skills).filter(([, value]) => Array.isArray(value))
        chunks.push(...pieces({
            id: 'kb:skills', type: 'skills', title: 'Skills overview', url: '/skills', group: 'skills',
            summary: `Languages: ${list(skills.languages, ', ')}.`, keywords: ['skills', 'technologies', 'languages'],
        }, join([
            ...groups.map(([name, items]) => `${humanStatus(name).replace(/\bai ml\b/, 'AI/ML')}: ${list(items, ', ')}.`),
            skills.accuracy_rule ? `Note: ${skills.accuracy_rule}` : '',
        ]), 'Skills.'))
    }

    const gh = kb.github
    if (gh?.username) {
        const metrics = gh.commit_metrics || {}
        chunks.push(...pieces({
            id: 'kb:github', type: 'about', title: 'GitHub activity', url: gh.profile_url || 'https://github.com/ggauravky', group: 'github',
            summary: `${gh.public_repositories_indexed} public repositories indexed on ${gh.snapshot_date}.`, keywords: ['github', 'commits', 'repositories', 'streak'],
        }, join([
            `GitHub ${gh.username} (${gh.profile_url}). Snapshot ${gh.snapshot_date}: ${gh.public_repositories_indexed} public repositories indexed; private repositories are not counted.`,
            metrics.claimed_commits ? `Commits: about ${metrics.claimed_commits.value} (${humanStatus(metrics.claimed_commits.status)}; exact count not verified).` : '',
            metrics.claimed_streak_days ? `Longest streak: ${metrics.claimed_streak_days.value} days (${humanStatus(metrics.claimed_streak_days.status)}; not verified).` : '',
            metrics.commit_count_explanation,
            gh.activity_characteristics?.length ? `Activity: ${list(gh.activity_characteristics)}.` : '',
            gh.relevant_changes_2026?.length ? `Changes in 2026: ${gh.relevant_changes_2026.map((c) => `${c.period}: ${c.change}`).join('; ')}.` : '',
        ]), 'GitHub.'))
    }

    const links = kb.public_links
    if (links) {
        chunks.push({
            id: 'kb:links', type: 'about', title: 'Profiles and links', url: '/contact', group: 'contact',
            summary: 'Public profiles: GitHub, LinkedIn, LeetCode, CodeChef and GeeksforGeeks.', keywords: ['profiles', 'links', 'leetcode', 'linkedin'],
            text: join(['Gaurav\'s public profiles and links:', ...Object.entries(links).map(([name, url]) => `${humanStatus(name)}: ${url}`)]),
        })
    }

    if (kb.technical_decisions?.length) {
        const decisions = kb.technical_decisions.map((d) => `${d.topic}: ${d.decision} Why: ${d.why} (${humanStatus(d.status)})`)
        for (let i = 0; i < decisions.length; i += 3) {
            chunks.push({
                id: `kb:decisions:${i / 3 + 1}`, type: 'about', title: 'Engineering decisions', url: '', group: 'decisions',
                summary: firstSentence(decisions[i]), keywords: ['decision', 'architecture', 'why'],
                text: join(['Engineering decisions Gaurav made:', ...decisions.slice(i, i + 3)]),
            })
        }
    }

    if (kb.project_relationships?.length) {
        chunks.push(...pieces({
            id: 'kb:relationships', type: 'about', title: 'How the projects relate', url: '/projects', group: 'relationships',
            summary: 'How related projects differ from each other.', keywords: ['difference', 'compare', 'versus', 'vs'],
        }, kb.project_relationships.map((r) => `${list(r.projects, ' and ')}: ${r.relationship}`).join(' '), 'How the projects relate.'))
    }

    // ── Names a visitor may use for each project (name boost, D-109) ──
    const aliases = {}
    for (const project of projects.values()) {
        const group = groupOf(project.id)
        aliases[group] = [...new Set([project.name, ...(project.aliases || []), ...(SHORT_NAMES[project.id] || [])]
            .filter((n) => String(n).length >= 4))]
    }

    return { chunks, aliases }
}

/** Projects in the knowledge base that have no page on the site, with status. */
export function offSiteProjects(kb, siteSlugs = []) {
    const onSite = new Set(siteSlugs)
    return (kb?.projects || [])
        .filter((p) => !onSite.has(SLUG_ALIASES[p.id] || p.id) && p.id !== 'dev-portfolio')
        .map((p) => ({ name: p.name, status: humanStatus(p.current_status), summary: firstSentence(p.summary, 140) }))
}

/** Older blog titles the knowledge base lists (not on the blog index). */
export const olderPosts = (kb) => (kb?.blogs || []).filter((b) => /historical/.test(b.status)).map((b) => b.title)

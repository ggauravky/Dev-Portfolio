// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// Turns the site's own data into retrieval chunks (D-100). One chunk per
// project, journey entry, skill group and service, one per blog-post section,
// plus the live status, and the owner's knowledge base (lib/chat/knowledge.js,
// D-109). Facts come only from these sources; nothing is written here by hand.

import { createHash } from 'node:crypto'
import { knowledgeChunks, offSiteProjects, olderPosts } from './knowledge.js'

const join = (parts) => parts.filter((part) => part && String(part).trim()).join('\n')
const list = (label, items) => (Array.isArray(items) && items.length
    ? `${label}: ${items.map((item) => (typeof item === 'string' ? item : item?.name || item?.title || '')).filter(Boolean).join('; ')}`
    : '')
const line = (label, value) => (value ? `${label}: ${value}` : '')

/** First sentence, at most ~200 characters, cut on a word boundary. */
export function firstSentence(text, max = 200) {
    const flat = String(text || '').replace(/\s+/g, ' ').trim()
    const sentence = flat.match(/^.{20,}?[.!?](?=\s|$)/)?.[0] || flat
    return sentence.length > max ? `${sentence.slice(0, max).replace(/\s+\S*$/, '')}…` : sentence
}

export const hashText = (text) => createHash('sha256').update(text).digest('hex').slice(0, 16)

function projectChunk(project) {
    const team = project.isCollaborative && Array.isArray(project.team)
        ? `Team project. ${project.team.map((m) => `${m.name}${m.role ? ` (${m.role})` : ''}`).join(', ')}.`
        : 'Solo project.'
    return {
        id: `project:${project.slug}`,
        type: 'project',
        group: project.slug,
        title: project.title,
        url: `/projects/${project.slug}`,
        summary: firstSentence(project.description),
        text: join([
            project.title,
            project.description,
            team,
            list('Categories', project.categories),
            list('Tech stack', project.techStack),
            line('Problem', project.problem),
            line('Solution', project.solution),
            line('Architecture', project.architecture),
            list('Key decisions', project.keyDecisions),
            list('Lessons learned', project.lessonsLearned),
            line('Live demo', project.demo),
            line('Source code', project.github),
        ]),
    }
}

function journeyChunk(entry) {
    return {
        id: `journey:${entry.id}`,
        type: 'journey',
        group: `journey:${entry.id}`,
        title: entry.title,
        url: `/journey#${entry.id}`,
        // For date questions resolved in code ("the hackathon before that").
        meta: { date: entry.date || '', category: entry.category || '' },
        summary: firstSentence(entry.description),
        text: join([
            `${entry.title}${entry.organization ? `, ${entry.organization}` : ''}`,
            line('When', entry.dateLabel || entry.date),
            line('Category', entry.category),
            line('Status', entry.status),
            line('Where', entry.location),
            line('Duration', entry.duration),
            entry.description,
            line('Objectives', entry.objectives),
            line('Outcomes', entry.outcomes),
            list('What Gaurav learned', entry.whatILearned),
            list('Skills', entry.skills),
            list('Technologies', entry.technologies),
        ]),
    }
}

function skillChunk(group) {
    return {
        id: `skills:${group.id}`,
        type: 'skills',
        group: 'skills',
        title: `Skills: ${group.title}`,
        url: '/skills',
        summary: `Covers ${(group.categories || []).map((category) => category.title).join(', ').toLowerCase()}.`,
        text: join([
            `Skills: ${group.title}`,
            ...(group.categories || []).map((category) => list(category.title, category.skills)),
        ]),
    }
}

function serviceChunk(service) {
    const faq = (service.pricingFaq || []).map((item) => `Q: ${item.question} A: ${item.answer}`)
    return {
        id: `service:${service.slug}`,
        type: 'service',
        group: `service:${service.slug}`,
        title: service.title,
        url: service.path,
        summary: `${firstSentence(service.summary)}${service.priceLabel ? ` Price: ${service.priceLabel}.` : ''}`,
        text: join([
            `Service: ${service.title} (${service.category || 'Services'})`,
            line('Price', service.priceLabel),
            service.summary,
            line('Outcome', service.outcomePromise),
            list('Features', service.features),
            list('Deliverables', service.deliverables),
            list('Best for', service.bestFor),
            list('Client provides', service.youProvide),
            line('Delivery', service.deliveryWindow || service.timeline),
            line('Support', service.supportLevel),
            ...faq,
            'Booking: services are booked and paid on the site at /booknow.',
        ]),
    }
}

const blockText = (block) => [block?.text, ...(Array.isArray(block?.items) ? block.items.map((i) => (typeof i === 'string' ? i : i?.text)) : [])]
    .filter(Boolean)
    .join('\n')

function blogChunks(post) {
    return (post.sections || []).map((section) => ({
        id: `blog:${post.slug}#${section.id}`,
        type: 'blog',
        group: `blog:${post.slug}`,
        title: `${post.title}: ${section.title.replace(/^\d+\.\s*/, '')}`,
        url: `/blog/${post.slug}`,
        summary: firstSentence((section.blocks || []).map(blockText).find(Boolean)),
        text: join([
            `Blog post "${post.title}" (${post.date || post.publishedDate}). Section: ${section.title}`,
            ...(section.blocks || []).map(blockText),
        ]),
    }))
}

function statusChunk(siteStatus, profiles = []) {
    const availability = siteStatus?.availability
    return {
        id: 'about:status',
        type: 'about',
        group: 'contact',
        title: 'Availability and contact',
        url: '/contact',
        summary: `${availability?.label ? `${availability.label}. ` : ''}Contact form on the Contact page.`,
        text: join([
            'Availability and contact',
            availability ? `Availability: ${availability.available ? 'available' : 'not available'}. ${availability.label || ''}` : '',
            line('Email', siteStatus?.email),
            profiles.length ? '' : line('GitHub', siteStatus?.links?.github),
            profiles.length ? '' : line('LinkedIn', siteStatus?.links?.linkedin),
            line('Resume', siteStatus?.resumeUrl),
            ...profiles.filter((p) => p.id !== 'email').map((p) => line(p.label, p.id === 'phone' ? formatPhone(p.value) : p.url)),
            'Contact form: /contact. Paid services: /services.',
        ]),
    }
}

// ── Overview chunks (D-107) ───────────────────────────────────────────────
// List questions ("which projects were team builds?", "what has he done in
// 2025?") need the whole set in one place; per-item chunks can't answer them.
// Built only from the same data; they get a larger context budget.
const OVERVIEW_CONTEXT_CHARS = 2600

function projectsOverview(projects, caseStudySlugs, offSite = []) {
    const bySlug = new Map(projects.map((p) => [p.slug, p]))
    const cases = caseStudySlugs.map((slug) => bySlug.get(slug)).filter(Boolean)
    const team = projects.filter((p) => p.isCollaborative)
    const solo = projects.filter((p) => !p.isCollaborative)
    return {
        id: 'overview:projects',
        type: 'overview',
        title: 'All projects',
        url: '/projects',
        contextChars: OVERVIEW_CONTEXT_CHARS,
        summary: `${projects.length} projects on the site, ${cases.length} with full case studies.`,
        group: 'overview:projects',
        text: join([
            `All of Gaurav's projects: ${projects.length} on the site.`,
            cases.length ? `Case studies, in Gaurav's own ranking (strongest first): ${cases.map((p, i) => `${i + 1}. ${p.title}`).join('; ')}.` : '',
            `Team projects (${team.length}): ${team.map((p) => p.title).join('; ')}.`,
            `Solo projects (${solo.length}): ${solo.map((p) => p.title).join('; ')}.`,
            offSite.length ? `Not on the Projects page but in Gaurav's records (${offSite.length}), with status: ${offSite.map((p) => `${p.name} (${p.status})`).join('; ')}.` : '',
            'Each project on the site with its categories:',
            ...projects.map((p) => `- ${p.title} (${(p.categories || []).join(', ') || 'uncategorised'}; ${p.isCollaborative ? 'team' : 'solo'})`),
        ]),
    }
}

// "2025-07-20" → "Jul 2025", read from the ISO string (no time-zone shift).
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const monthOf = (iso) => {
    const m = String(iso || '').match(/^(\d{4})-(\d{2})/)
    return m ? `${MONTHS[Number(m[2]) - 1]} ${m[1]}` : 'undated'
}

function journeyOverview(journey) {
    const years = new Map()
    for (const entry of [...journey].sort((a, b) => String(b.date).localeCompare(String(a.date)))) {
        const year = String(entry.date || '').slice(0, 4) || 'Undated'
        if (!years.has(year)) years.set(year, [])
        years.get(year).push(entry)
    }
    const now = journey.filter((e) => e.status === 'In Progress')
    return {
        id: 'overview:journey',
        type: 'overview',
        title: 'Journey timeline',
        url: '/journey',
        contextChars: OVERVIEW_CONTEXT_CHARS,
        summary: `${journey.length} entries: education, internships, hackathons, courses and community work.`,
        group: 'overview:journey',
        text: join([
            `Gaurav's journey: ${journey.length} entries, newest first.`,
            now.length ? `In progress now: ${now.map((e) => e.title).join('; ')}.` : '',
            ...[...years.entries()].map(([year, entries]) => `${year}: ${entries.map((e) => `${e.title} (${monthOf(e.date)}, ${e.category}${e.status && e.status !== 'Completed' ? `, ${e.status}` : ''})`).join('; ')}.`),
        ]),
    }
}

function servicesOverview(services) {
    return {
        id: 'overview:services',
        type: 'overview',
        title: 'All services',
        url: '/services',
        summary: `${services.length} paid services, booked on the site.`,
        group: 'overview:services',
        text: join([
            `Gaurav offers ${services.length} services, booked and paid on the site (/booknow):`,
            ...services.map((s) => `- ${s.title}: ${s.priceLabel || 'price on the page'}. ${firstSentence(s.summary)}`),
        ]),
    }
}

function blogOverview(blogs, older = []) {
    return {
        id: 'overview:blog',
        type: 'overview',
        title: 'Blog posts',
        url: '/blog',
        summary: `${blogs.length} published posts.`,
        group: 'overview:blog',
        text: join([
            `Gaurav's blog: ${blogs.length} posts.`,
            ...blogs.map((b) => `- "${b.title}" (${b.date || b.publishedDate}): ${firstSentence(b.excerpt || b.subtitle || '')}`),
            older.length ? `Older posts from an earlier version of the site (not on the blog index now): ${older.map((t) => `"${t}"`).join('; ')}.` : '',
        ]),
    }
}

/**
 * The owner's public profiles and contact routes from the ⌘K palette
 * (src/data/commandRegistry.js, "social-*" entries), read as text because
 * that module imports icons. → [{ id, label, url, value }]
 */
export function parseProfiles(source) {
    const out = []
    for (const m of String(source || '').matchAll(/id:\s*'social-([a-z]+)'[\s\S]*?title:\s*'([^']+)'[\s\S]*?url:\s*'([^']+)'/g)) {
        const [, id, title, url] = m
        const value = url.replace(/^mailto:/, '').replace(/^tel:/, '')
        const label = { email: 'Email', phone: 'Phone / WhatsApp' }[id] || title.replace(/\s*Profile$/, '')
        out.push({ id, label, url, value })
    }
    return out
}

/** "+918235773177" → "+91 82357 73177" (Indian mobile grouping), else as is. */
export const formatPhone = (value) => (/^\+91\d{10}$/.test(value) ? `+91 ${value.slice(3, 8)} ${value.slice(8)}` : value)

/** The case-study ranking from src/lib/projects.js, read as text (that module
 *  uses extensionless imports, so plain Node can't load it). */
export function parseCaseStudySlugs(source) {
    const block = String(source || '').match(/CASE_STUDY_SLUGS\s*=\s*\[([\s\S]*?)\]/)
    return block ? [...block[1].matchAll(/'([a-z0-9-]+)'/g)].map((m) => m[1]) : []
}

/**
 * Build every chunk from already-imported data. Pure, so tests and the
 * staleness check can call it without the network. Returns { chunks, aliases }.
 */
export function buildCorpus({ projects = [], journey = [], skillGroups = [], services = [], blogs = [], siteStatus = null, caseStudySlugs = [], kb = null, profiles = [] }) {
    const slugs = projects.map((p) => p.slug)
    const knowledge = knowledgeChunks(kb, slugs)
    // Site project titles are names too.
    const aliases = { ...knowledge.aliases }
    for (const p of projects) aliases[p.slug] = [...new Set([p.title, p.title.split(/[:(]/)[0].trim(), ...(aliases[p.slug] || [])])].filter((n) => n.length >= 4)
    // Services and journey entries are named things too ("the Full Stack
    // Development service", "TechX26 Hackathon"): a question naming one stands on its own.
    // A service only with the word "service": "frontend development" alone is a skill.
    for (const s of services) aliases[`service:${s.slug}`] = [`${s.title} service`]
    for (const e of journey) aliases[`journey:${e.id}`] = [e.title].filter((n) => n && n.length >= 8)
    const chunks = [
        ...(siteStatus ? [statusChunk(siteStatus, profiles)] : []),
        ...(projects.length ? [projectsOverview(projects, caseStudySlugs, offSiteProjects(kb, slugs))] : []),
        ...(journey.length ? [journeyOverview(journey)] : []),
        ...(services.length ? [servicesOverview(services)] : []),
        ...(blogs.length ? [blogOverview(blogs, olderPosts(kb))] : []),
        ...projects.map(projectChunk),
        ...journey.map(journeyChunk),
        ...skillGroups.map(skillChunk),
        ...services.map(serviceChunk),
        ...blogs.flatMap(blogChunks),
        ...knowledge.chunks,
    ]
    return {
        profiles: profiles.map((p) => ({ ...p, value: p.id === 'phone' ? formatPhone(p.value) : p.value })),
        chunks: chunks.map((chunk) => ({ ...chunk, hash: hashText(`${chunk.title}
${chunk.url}
${chunk.summary}
${chunk.status || ''}
${chunk.text}`) })),
        aliases,
    }
}

export const buildChunks = (data) => buildCorpus(data).chunks

/** Load the real data (Node only; used by the index builder and the build check). */
export async function loadSiteData(root = new URL('../../', import.meta.url)) {
    const { readFile } = await import('node:fs/promises')
    const at = (path) => new URL(path, root).href
    const [{ projectsData }, { journeyData }, { skillGroups }, { servicesData }, blogs, { siteStatus }, kb] = await Promise.all([
        import(at('src/data/projectsData.js')),
        import(at('src/data/journeyData.js')),
        import(at('src/data/skillsData.js')),
        import(at('src/data/servicesData.js')),
        import(at('src/data/blogsData.js')),
        import(at('src/data/siteStatus.js')),
        readFile(new URL('lib/chat/knowledge-base.json', root), 'utf8').then(JSON.parse),
    ])
    const projectsSource = await readFile(new URL('src/lib/projects.js', root), 'utf8')
    const registrySource = await readFile(new URL('src/data/commandRegistry.js', root), 'utf8')
    return {
        projects: projectsData,
        journey: journeyData,
        skillGroups,
        services: servicesData,
        blogs: blogs.getPublicBlogs(),
        siteStatus,
        kb,
        caseStudySlugs: parseCaseStudySlugs(projectsSource),
        profiles: parseProfiles(registrySource),
    }
}

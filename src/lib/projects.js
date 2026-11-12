// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// Projects index helpers (P4, S7). Reads src/data/projectsData.js and never edits
// it (the sitemap script regex-parses `slug:`). Presentation only: nothing here
// adds a fact; it orders, groups and splits the existing strings.

import { projectsData, projectCategories } from '../data/projectsData'

/** The owner's case-study ranking (confirmed 2026-11-12, D-049). */
export const CASE_STUDY_SLUGS = [
    'kanoon-mate',
    'insightaudio',
    'rag-ai-teaching-assistant',
    'smart-lms',
    'smartmess',
    'real-time-chat-app',
]

const caseRank = (slug) => {
    const i = CASE_STUDY_SLUGS.indexOf(slug)
    return i === -1 ? Infinity : i
}

/**
 * The ranked index: the 6 case studies in the owner's order, then the other
 * `featured` projects, then the rest; ties go newest first (higher id).
 */
export const RANKED_PROJECTS = [...projectsData].sort((a, b) =>
    (caseRank(a.slug) - caseRank(b.slug))
    || (Number(Boolean(b.featured)) - Number(Boolean(a.featured)))
    || (b.id - a.id),
)

export const RANK_BY_SLUG = new Map(RANKED_PROJECTS.map((p, i) => [p.slug, i + 1]))

export const isCaseStudy = (project) => CASE_STUDY_SLUGS.includes(project.slug)

export const CASE_STUDY_COUNT = RANKED_PROJECTS.filter(isCaseStudy).length

/** Index lede; also painted by the static route shell (scripts/route-shells.js). */
export const PROJECTS_LEDE =
    'AI/ML and web development projects, built with Python, React, Node.js and the MERN stack. Ranked, with the case studies first.'

/** "No. 03 of 26 · Case study" — shared with the static route shell. */
export const caseKicker = (project) =>
    `No. ${pad2(RANK_BY_SLUG.get(project.slug))} of ${RANKED_PROJECTS.length}${isCaseStudy(project) ? ' · Case study' : ''}`

export const CATEGORIES = projectCategories

export const pad2 = (n) => String(n).padStart(2, '0')

/** `demo: '#'` means "no live demo" in the data. */
export const hasUrl = (url) => Boolean(url) && url !== '#'

/** The data's placeholder image is not a screenshot: never show it. */
export const hasRealImage = (src) => Boolean(src) && !/comming-soon/.test(src)

export const projectType = (project) => (project.isCollaborative ? 'Team' : 'Solo')

/** Gaurav's own role, from the `team` list (team projects only). */
export const ownRole = (project) =>
    project.team?.find((member) => /Gaurav Kumar Yadav/i.test(member.name))?.role || null

/** Smallest generated variant of a project image (scripts/generate-image-variants.js). */
export const previewSrc = (src) => src.replace(/\.(png|jpe?g)$/i, '-480.webp')

/** "A ↔ B ↔ C" / "A ➔ B" architecture strings → steps, when there are 3 or more. */
export function splitPipeline(text) {
    if (!text) return []
    const parts = text.split(/\s+(?:↔|➔|→)\s+/).map((part) => part.trim()).filter(Boolean)
    return parts.length >= 3 ? parts : []
}

/**
 * "Lead: rest" or "Lead — rest" → { lead, rest } for decision lists. A colon only
 * splits when the rest starts with a capital ("timestamps: true …" stays whole).
 */
export function splitLead(item) {
    const dash = item.match(/^(.{3,64}?)\s+—\s+(.+)$/)
    if (dash) return { lead: dash[1], rest: dash[2] }
    const colon = item.match(/^(.{3,64}?):\s+([A-Z].+)$/)
    if (colon) return { lead: colon[1], rest: colon[2] }
    return { lead: '', rest: item }
}

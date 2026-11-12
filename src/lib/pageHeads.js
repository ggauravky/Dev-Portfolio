// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// Page headers for the P5 pages, one source for two renderers:
// src/components/page/PageHead.jsx (React) and scripts/route-shells.js, which
// paints the same markup from index.html before any JS (D-057, D-059).
// No data imports here: heads that count data are builders that take it, so a
// page only loads the data it already uses (Contact never loads journeyData).
// Copy: existing facts only, logged in docs/COPY_REVIEW.md § P5.

export const STATIC_HEADS = {
    '/about': {
        rail: ['Lucknow', 'BCA, 2024 to present'],
        title: 'About',
        lede: 'Full-stack developer and AI/ML learner. I build web and AI products: full-stack apps and APIs, RAG systems, automation and machine-learning projects.',
    },
    '/blog': {
        rail: ['Writing', 'Latest first'],
        title: 'Engineering notes',
        lede: 'System design, software engineering, and the things I’ve built.',
    },
    '/contact': {
        rail: ['Lucknow, India', 'IST, UTC+5:30'],
        title: 'Contact',
        lede: 'Internships, entry-level roles, freelance projects or a collaboration. I read every message and reply personally.',
    },
}

export const skillsHead = (groups) => ({
    rail: [`${groups.length} groups`, `${groups.flatMap((g) => g.categories).reduce((n, c) => n + c.skills.length, 0)} skills`],
    title: 'Skills',
    lede: 'The languages, frameworks and tools I use to turn ideas into working code.',
})

export const journeyHead = (entries) => {
    // The year from the ISO string itself, so it can't shift with the time zone.
    const years = entries.map((item) => Number(item.date.slice(0, 4)))
    return {
        rail: [`${entries.length} entries`, `${Math.min(...years)} to ${Math.max(...years)}`],
        title: 'Journey',
        lede: 'Internships, hackathons, workshops, certifications and the degree that shaped how I build, newest first.',
    }
}

export const servicesHead = (services) => ({
    rail: [`${services.length} services`, `From INR ${Math.min(...services.map((s) => s.amount))}`],
    title: 'Services',
    lede: 'Frontend, backend, full-stack and AI or data science work, done remotely. The price is fixed before you pay, and the server verifies every payment.',
})

/** One per service page (/frontend-development, …). */
export const serviceHead = (service) => ({
    rail: [service.category, service.priceLabel],
    title: service.title,
    lede: service.summary,
})

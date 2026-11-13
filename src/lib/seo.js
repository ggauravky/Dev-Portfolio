// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// One source for every route's <head>: title, description, canonical, Open
// Graph/Twitter tags and the JSON-LD @graph. The pages read it through useSEO
// (client), and scripts/route-heads.js writes the same values into each
// route's prerendered HTML at build time, so crawlers that never run JS still
// get the right page. Plain data and functions only: this file runs in Node.
//
// Facts come from the repo data. Keep `SAME_AS` in step with the Contact page.

// No data imports here: this module ships in the client's useSEO chunk.
// The full route list lives in seoRoutes.js (build only).
const hasUrl = (url) => Boolean(url) && url !== '#'
const hasRealImage = (src) => Boolean(src) && !/comming-soon/.test(src)

// `github` links in projectsData.js that returned 404 when audited (2026-11-13,
// docs/SEO_AUDIT.md): private, renamed or moved. They are not public source, so
// they are left out of `codeRepository`. Remove an entry once its link is fixed.
const UNAVAILABLE_REPOS = new Set([
    'https://github.com/ggauravky/My-all-Python-Projects-/tree/main/PDF_to_Audio_Book_using_Python',
    'https://github.com/ggauravky/My-all-Web-Dev-Projects/tree/main/Todo%20List%20-%20Advanced',
    'https://github.com/ggauravky/My-all-Web-Dev-Projects/tree/main/calculator',
    'https://github.com/ggauravky/My-all-Web-Dev-Projects/tree/main/captcha-generator',
    'https://github.com/ggauravky/My-all-Web-Dev-Projects/tree/main/ecommerce-website-master',
    'https://github.com/ggauravky/My-all-Web-Dev-Projects/tree/main/flappy-bird',
    'https://github.com/ggauravky/My-all-Web-Dev-Projects/tree/main/food-delivery',
    'https://github.com/ggauravky/python-grocery-store',
])
const isPublicRepo = (url) => hasUrl(url) && /^https:\/\/github\.com\//.test(url) && !UNAVAILABLE_REPOS.has(url)

export const SITE_URL = 'https://ggauravky.vercel.app'
export const SITE_NAME = 'Gaurav Kumar Yadav'
export const NAME = 'Gaurav Kumar Yadav'
export const PERSON_ID = `${SITE_URL}/#person`
export const WEBSITE_ID = `${SITE_URL}/#website`
export const TWITTER_HANDLE = '@xgauravky'

export const DEFAULT_OG = {
    url: `${SITE_URL}/og-image.jpg`,
    width: 1200,
    height: 630,
    alt: 'Gaurav Kumar Yadav: AI/ML and web developer, BCA student at BBDU, Lucknow, beside his portrait in an arch',
}

/** The Contact page's profile links (WhatsApp excluded: not a profile). */
export const SAME_AS = [
    'https://github.com/ggauravky',
    'https://www.linkedin.com/in/gauravky/',
    'https://leetcode.com/u/gauravky/',
    'https://www.kaggle.com/kgauravky',
    'https://www.geeksforgeeks.org/profile/gauravky',
    'https://x.com/xgauravky',
    'https://www.instagram.com/the_gau_rav/',
]

const BBDU = {
    '@type': 'EducationalOrganization',
    name: 'BBD University',
    alternateName: ['BBDU', 'Babu Banarasi Das University'],
    address: {
        '@type': 'PostalAddress',
        addressLocality: 'Lucknow',
        addressRegion: 'Uttar Pradesh',
        addressCountry: 'IN',
    },
}

export const PERSON = {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: NAME,
    alternateName: ['Gaurav BBDU', 'ggauravky'],
    url: `${SITE_URL}/`,
    image: `${SITE_URL}/images/profile.jpg`,
    jobTitle: 'AI/ML Developer & Web Developer',
    description: 'Gaurav Kumar Yadav is a BCA student at BBD University (BBDU), Lucknow, India, focused on AI/ML and web development projects.',
    alumniOf: BBDU,
    affiliation: BBDU,
    hasCredential: {
        '@type': 'EducationalOccupationalCredential',
        name: 'AI and Machine Learning Program',
        credentialCategory: 'certificate',
        recognizedBy: { '@type': 'Organization', name: 'IIT Mandi x Masai School' },
    },
    address: BBDU.address,
    knowsAbout: ['Machine Learning', 'Artificial Intelligence', 'Web Development', 'Full Stack Development', 'React', 'Python', 'MERN Stack', 'Data Science'],
    knowsLanguage: 'en',
    sameAs: SAME_AS,
}

export const WEBSITE = {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: `${SITE_URL}/`,
    name: SITE_NAME,
    alternateName: 'ggauravky',
    description: 'Portfolio of Gaurav Kumar Yadav, AI/ML developer and web developer from Lucknow, India.',
    inLanguage: 'en',
    publisher: { '@id': PERSON_ID },
    // /projects reads ?q= on load (Projects.jsx), so this search is URL-addressable.
    potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/projects?q={search_term_string}` },
        'query-input': 'required name=search_term_string',
    },
}

export const absoluteUrl = (path) => (path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`)

const DESC_MIN = 150
const DESC_MAX = 160

/** Plain text for a snippet: no emoji, single spaces. */
const plain = (text) => String(text || '')
    .replace(/[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}️‍]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()

/**
 * Description sized for snippets (150–160 chars) from whole sentences.
 * `base` is split into sentences; `extras` is a list of optional slots, each a
 * list of alternative sentences (at most one per slot). The longest
 * combination of leading sentences + extras that fits wins, preferring one in
 * 150–160. Only when even the first sentence is too long is it cut at a word.
 */
export function fitDescription(base, extras = []) {
    const sentences = plain(base).split(/(?<=[.!?])\s+(?=[A-Z0-9"“‘'(])/).filter(Boolean)
    const slots = extras.map((slot) => [null, ...(Array.isArray(slot) ? slot : [slot]).map(plain)])
    let best = ''
    let bestScore = -1
    // Whole sentences of a useful length (130+) win; then anything in range;
    // a sentence shortened at a comma or "and" only when nothing whole fits.
    const score = (t, whole) => {
        if (whole && t.length >= 130) return 4000 + t.length
        return (t.length >= DESC_MIN ? 2000 : 0) + (whole ? 1000 : 0) + t.length
    }
    const visit = (prefix, i, whole) => {
        if (prefix.length > DESC_MAX) return
        if (i === slots.length) {
            const s = score(prefix, whole)
            if (s > bestScore) [best, bestScore] = [prefix, s]
            return
        }
        for (const option of slots[i]) visit(option ? `${prefix} ${option}` : prefix, i + 1, whole)
    }
    // A sentence shortened at a comma or "and": "A, B, C and D." -> "A, B." (kept only if it says something).
    const clauses = (sentence) => [...sentence.matchAll(/,| and /g)]
        .map((m) => sentence.slice(0, m.index).replace(/[\s,;:—-]+$/, '').replace(/\s+(and|or|with)$/i, ''))
        .filter((head) => head.length >= 40)
        .map((head) => `${head}.`)
    for (let k = 1; k <= sentences.length; k++) {
        const lead = sentences.slice(0, k - 1)
        visit([...lead, sentences[k - 1]].join(' '), 0, true)
        for (const clause of clauses(sentences[k - 1])) visit([...lead, clause].join(' '), 0, false)
    }
    if (best) return best
    const cut = sentences[0].slice(0, DESC_MAX - 1)
    return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[\s,;:.—-]+$/, '')}…`
}

// Static routes. `name` is the breadcrumb label; `page` the schema.org page type.
export const STATIC = {
    '/': {
        name: 'Home',
        page: 'ProfilePage',
        title: 'Gaurav Kumar Yadav — AI/ML and Web Developer, BBDU Lucknow',
        description: 'Gaurav Kumar Yadav is a BCA student at BBD University, Lucknow, building AI/ML and full-stack web projects with Python, React, Node.js and the MERN stack.',
    },
    '/about': {
        name: 'About',
        page: 'ProfilePage',
        title: 'About — Gaurav Kumar Yadav',
        description: 'Gaurav Kumar Yadav is a BCA student at BBD University, Lucknow, specialising in AI and Data Science and working as a FullStack Intern at Ashoksoft Technologies.',
    },
    '/projects': {
        name: 'Projects',
        page: 'CollectionPage',
        title: 'Projects and case studies — Gaurav Kumar Yadav',
        description: 'Case studies by Gaurav Kumar Yadav, a BCA student at BBDU Lucknow: AI/ML and web development projects built with Python, React, Node.js and the MERN stack.',
    },
    '/skills': {
        name: 'Skills',
        title: 'Skills — Gaurav Kumar Yadav',
        description: 'Technical skills of Gaurav Kumar Yadav: Python, AI/ML and data science with Pandas and NumPy, plus React, Node.js, MongoDB and modern full-stack web tools.',
    },
    '/journey': {
        name: 'Journey',
        title: 'Journey — Gaurav Kumar Yadav',
        description: 'Internships, workshops, hackathons, conferences, certifications and industrial visits from the path of Gaurav Kumar Yadav, an AI/ML and web developer.',
    },
    '/services': {
        name: 'Services',
        page: 'CollectionPage',
        title: 'Services — Gaurav Kumar Yadav',
        description: 'Work with Gaurav Kumar Yadav on frontend, backend, full-stack and AI or data science projects. Practical remote development services from Lucknow, India.',
    },
    '/blog': {
        name: 'Engineering Notes',
        page: 'CollectionPage',
        title: 'Engineering Notes — Gaurav Kumar Yadav',
        description: 'Engineering notes by Gaurav Kumar Yadav on system design, software engineering and practical lessons from building web applications and AI-powered products.',
    },
    '/contact': {
        name: 'Contact',
        page: 'ContactPage',
        title: 'Contact — Gaurav Kumar Yadav',
        description: 'Contact Gaurav Kumar Yadav about internships, entry-level roles, freelance projects or collaborations. Python, AI/ML and web developer based in Lucknow, India.',
    },
    '/updates': {
        name: 'Updates',
        title: 'Updates and changelog — Gaurav Kumar Yadav',
        description: 'Product updates, feature releases and the changelog of the portfolio platform built by Gaurav Kumar Yadav, an AI/ML and web developer from Lucknow, India.',
    },
    '/booknow': {
        name: 'Book a service',
        title: 'Book a service — Gaurav Kumar Yadav',
        description: 'Book a frontend, backend, full-stack or AI and data science service with Gaurav Kumar Yadav, using secure Razorpay checkout with server-verified pricing.',
    },
    '/support': {
        name: 'Support',
        title: 'Support my work — Gaurav Kumar Yadav',
        description: 'Support the work of Gaurav Kumar Yadav through secure Razorpay checkout, with server-side payment verification and a downloadable receipt for each payment.',
    },
    '/privacy': {
        name: 'Privacy Policy',
        title: 'Privacy Policy — Gaurav Kumar Yadav',
        description: 'Privacy Policy for the portfolio website of Gaurav Kumar Yadav: how personal information is collected, used and protected when you visit or get in touch.',
    },
    '/terms': {
        name: 'Terms of Service',
        title: 'Terms of Service — Gaurav Kumar Yadav',
        description: 'Terms of Service for the portfolio website of Gaurav Kumar Yadav: the conditions for using the site, viewing its content and getting in touch about services.',
    },
    '/refund': {
        name: 'Refund Policy',
        title: 'Refund Policy — Gaurav Kumar Yadav',
        description: 'Refund and cancellation policy for the frontend, backend, full-stack and AI or data science services booked through the portfolio of Gaurav Kumar Yadav.',
    },
    // Private or transactional: never indexed.
    '/my-activity': { name: 'My activity', noindex: true, title: 'My activity — Gaurav Kumar Yadav', description: 'Manage your portfolio profile, payments, receipts, and sign-in history.' },
    '/my-supports': { name: 'My activity', noindex: true, title: 'My activity — Gaurav Kumar Yadav', description: 'Manage your portfolio profile, payments, receipts, and sign-in history.' },
    '/payment-success': { name: 'Payment status', noindex: true, title: 'Payment status — Gaurav Kumar Yadav', description: 'View an authenticated payment status and download its receipt.' },
    '/admin': { name: 'Admin', noindex: true, title: 'Admin — Gaurav Kumar Yadav', description: 'Administration.' },
}

export const NOT_FOUND_SEO = {
    title: 'Page not found — Gaurav Kumar Yadav',
    description: 'This page does not exist. Go back to the portfolio of Gaurav Kumar Yadav.',
    noindex: true,
    crumbs: [],
}

const crumb = (name, path) => ({ name, path })

/** SEO for a static route, or null. */
export function staticSeo(path) {
    const entry = STATIC[path]
    if (!entry) return null
    return {
        path,
        title: entry.title,
        description: entry.description,
        noindex: Boolean(entry.noindex),
        page: entry.page || 'WebPage',
        crumbs: path === '/' ? [] : [crumb(entry.name, path)],
    }
}

export function projectSeo(project) {
    const path = `/projects/${project.slug}`
    const url = absoluteUrl(path)
    const image = hasRealImage(project.image) ? absoluteUrl(project.image) : null
    const work = {
        '@type': isPublicRepo(project.github) ? 'SoftwareSourceCode' : 'CreativeWork',
        '@id': `${url}#work`,
        name: project.title,
        description: project.description,
        url,
        author: { '@id': PERSON_ID },
        keywords: project.techStack.join(', '),
        mainEntityOfPage: { '@id': `${url}#webpage` },
    }
    if (image) work.image = image
    if (isPublicRepo(project.github)) work.codeRepository = project.github
    return {
        path,
        title: `${project.title} case study — Gaurav Kumar Yadav`,
        description: fitDescription(project.description, [
            ['A case study by Gaurav Kumar Yadav.', 'By Gaurav Kumar Yadav.'],
            // Skip the stack when the description already lists it.
            /\bbuilt\s+(with|using)\b/i.test(project.description)
                ? []
                : [4, 3, 2].map((n) => `Built with ${project.techStack.slice(0, n).join(', ')}.`),
        ]),
        ogImage: image ? { url: image, alt: `${project.title}, a project by Gaurav Kumar Yadav` } : null,
        crumbs: [crumb('Projects', '/projects'), crumb(project.title, path)],
        nodes: [work],
    }
}

export function blogSeo(blog) {
    const path = `/blog/${blog.slug}`
    const url = absoluteUrl(path)
    const cover = blog.coverImage || blog.image
    const image = blog.ogImage || (cover ? (cover.startsWith('http') ? cover : absoluteUrl(cover)) : null)
    const published = blog.publishedDate || blog.date
    const post = {
        '@type': 'BlogPosting',
        '@id': `${url}#article`,
        headline: blog.title,
        description: plain(blog.excerpt || blog.subtitle),
        url,
        author: { '@id': PERSON_ID },
        publisher: { '@id': PERSON_ID },
        mainEntityOfPage: { '@id': `${url}#webpage` },
        inLanguage: 'en',
    }
    if (image) post.image = image
    if (published) post.datePublished = published
    if (blog.updatedDate || published) post.dateModified = blog.updatedDate || published
    if (blog.tags?.length) post.keywords = blog.tags.join(', ')
    return {
        path,
        title: `${blog.title} — Gaurav Kumar Yadav`,
        description: fitDescription(blog.excerpt || blog.subtitle, [['Engineering notes by Gaurav Kumar Yadav.', 'By Gaurav Kumar Yadav.']]),
        type: 'article',
        noindex: blog.status === 'preview' || blog.status === 'draft',
        publishedTime: published || undefined,
        modifiedTime: blog.updatedDate || undefined,
        tags: blog.tags || [],
        ogImage: image ? { url: image, alt: blog.title } : null,
        crumbs: [crumb('Engineering Notes', '/blog'), crumb(blog.title, path)],
        nodes: [post],
    }
}

export function serviceSeo(service) {
    const url = absoluteUrl(service.path)
    return {
        path: service.path,
        title: `${service.title} services — Gaurav Kumar Yadav`,
        description: fitDescription(service.summary, [
            ['Offered remotely by Gaurav Kumar Yadav from Lucknow, India.', 'Offered by Gaurav Kumar Yadav, Lucknow.', 'By Gaurav Kumar Yadav.'],
            [`Priced ${String(service.priceLabel).replace(' - ', ' to ')}.`],
        ]),
        crumbs: [crumb('Services', '/services'), crumb(service.title, service.path)],
        nodes: [{
            '@type': 'Service',
            '@id': `${url}#service`,
            name: service.title,
            description: service.summary,
            url,
            provider: { '@id': PERSON_ID },
            areaServed: { '@type': 'Country', name: 'India' },
            category: service.category,
            offers: {
                '@type': 'Offer',
                price: service.amount,
                priceCurrency: 'INR',
                url: `${SITE_URL}/booknow?service=${service.slug}`,
            },
        }],
    }
}

/** The page's full JSON-LD document: one @graph with stable @ids. */
export function buildJsonLd(seo, extras = []) {
    const url = absoluteUrl(seo.path)
    const page = {
        '@type': seo.page || 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: seo.title,
        description: seo.description,
        isPartOf: { '@id': WEBSITE_ID },
        inLanguage: 'en',
    }
    if (seo.page === 'ProfilePage') page.mainEntity = { '@id': PERSON_ID }
    else if (seo.nodes?.length) page.mainEntity = { '@id': seo.nodes[0]['@id'] }
    else page.about = { '@id': PERSON_ID }

    const graph = [WEBSITE, PERSON, page]
    if (seo.crumbs?.length) {
        page.breadcrumb = { '@id': `${url}#breadcrumb` }
        graph.push({
            '@type': 'BreadcrumbList',
            '@id': `${url}#breadcrumb`,
            itemListElement: [crumb('Home', '/'), ...seo.crumbs].map((c, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                name: c.name,
                item: absoluteUrl(c.path),
            })),
        })
    }
    graph.push(...(seo.nodes || []), ...extras)
    return { '@context': 'https://schema.org', '@graph': graph }
}

export const robotsContent = (noindex) => (noindex
    ? 'noindex, nofollow'
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1')

/** Markdown alternate for AI agents: the full knowledge base, linked from the key pages. */
export const MARKDOWN_ALTERNATE_PATHS = ['/', '/about', '/projects', '/skills', '/journey', '/services', '/contact']
export const MARKDOWN_ALTERNATE_HREF = `${SITE_URL}/llms-full.txt`

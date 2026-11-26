// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// Structured records (D-134): the authoritative facts behind counts, filters,
// rankings by date and comparisons. Built by the index builder from the same
// data as the retrieval chunks (src/data/* and lib/chat/knowledge-base.json)
// and stored in corpus-index.json (`records`), so a request never re-reads the
// data files and the cache version changes whenever a record does.
//
// Technologies are normalised to canonical tags ("MongoDB Atlas", "Mongoose"
// → mongodb; "React 18", "Next.js 16" → react). A stack the records describe
// only vaguely ("see repository", "not independently verified") is marked
// undocumented: absence from it proves nothing.

// ── Technology tags ────────────────────────────────────────────────────────
// [tag, label, pattern]. Order matters only for display.
export const TECH = [
    ['react', 'React', /\breact(\.?js)?\b|\bnext\.?js\b|\breact\s*\d+/i],
    ['nextjs', 'Next.js', /\bnext\.?js\b/i],
    ['vue', 'Vue', /\bvue(\.?js)?\b/i],
    ['typescript', 'TypeScript', /\btypescript\b|\bts\b/i],
    ['javascript', 'JavaScript', /\bjavascript\b|\bjs\b|full-stack javascript/i],
    ['html', 'HTML/CSS', /\bhtml5?\b/i],
    ['tailwind', 'Tailwind CSS', /\btailwind/i],
    ['redux', 'Redux', /\bredux/i],
    ['node', 'Node.js', /\bnode(\.?js)?\b/i],
    ['express', 'Express', /\bexpress(\.?js)?\b/i],
    ['mongodb', 'MongoDB', /\bmongo(db)?\b|\bmongoose\b|\bmern\b/i],
    ['postgresql', 'PostgreSQL', /\bpostgres(ql)?\b|\bneon\b/i],
    ['mysql', 'MySQL', /\bmysql\b/i],
    ['sqlite', 'SQLite', /\bsqlite\b/i],
    ['prisma', 'Prisma', /\bprisma\b/i],
    ['python', 'Python', /\bpython\b|\bflask\b|\bfastapi\b|\bdjango\b|\bstreamlit\b|\bpandas\b|\bscikit/i],
    ['flask', 'Flask', /\bflask\b/i],
    ['fastapi', 'FastAPI', /\bfastapi\b/i],
    ['streamlit', 'Streamlit', /\bstreamlit\b/i],
    ['socketio', 'Socket.IO', /\bsocket\.?io\b|websockets?/i],
    ['jwt', 'JWT', /\bjwt\b/i],
    ['oauth', 'OAuth', /\boauth/i],
    ['clerk', 'Clerk', /\bclerk\b/i],
    ['razorpay', 'Razorpay', /\brazorpay\b/i],
    ['cloudinary', 'Cloudinary', /\bcloudinary\b/i],
    ['opencv', 'OpenCV', /\bopencv\b/i],
    ['scikit', 'scikit-learn', /\bscikit|sklearn|randomforest|logistic regression|\bknn\b|k-means/i],
    ['gemini', 'Gemini', /\bgemini\b/i],
    ['whisper', 'Whisper', /\bwhisper\b/i],
    ['langchain', 'LangChain', /\blangchain\b/i],
    ['ffmpeg', 'FFmpeg', /\bffmpeg\b/i],
    ['ytdlp', 'yt-dlp', /\byt-dlp\b/i],
    ['vercel', 'Vercel', /\bvercel\b/i],
    ['render', 'Render', /\brender\b/i],
    ['docker', 'Docker', /\bdocker\b/i],
    ['chrome', 'Chrome extension', /\bchrome extension|manifest v3\b/i],
]
// Groups visitors ask about as one thing.
const AI_STACK = /\bgemini|openai|whisper|langchain|\brag\b|\bllm|ollama|chromadb|sentence transformers|elevenlabs|sarvam|bge-m3|mistral|ai\/llm/i
const ML_STACK = /scikit|sklearn|tensorflow|pytorch|yolo|opencv|randomforest|regression|\bknn\b|k-means|pca|adaboost|decision trees/i
const BACKEND_STACK = /\bnode|express|flask|fastapi|django|prisma|postgres|mongo|mysql|sqlite|socket\.io|\bapi\b/i
const FRONTEND_STACK = /\breact|next\.?js|vue|tailwind|html|redux|vite/i

export const TECH_LABEL = Object.fromEntries([...TECH.map(([tag, label]) => [tag, label]),
    ['ai', 'AI (LLM, speech or RAG tooling)'], ['ml', 'machine learning'], ['backend', 'a backend'], ['frontend', 'a web frontend']])

/** Canonical tags of a stack (list of strings), with the derived groups. */
export function techTags(stack, category = '') {
    const text = (Array.isArray(stack) ? stack : [stack]).join(' , ')
    const tags = new Set(TECH.filter(([, , re]) => re.test(text)).map(([tag]) => tag))
    if (AI_STACK.test(text) || /\b(ai|llm|rag|generative)\b/i.test(category)) tags.add('ai')
    if (ML_STACK.test(text) || /machine learning|computer vision|\bml\b/i.test(category)) tags.add('ml')
    if (BACKEND_STACK.test(text)) tags.add('backend')
    if (FRONTEND_STACK.test(text)) tags.add('frontend')
    return tags
}

const VAGUE_STACK = /see repository|not independently verified|exact .*(unverified|not verified)|specific version not verified|implementation unverified/i

/** "public_repository_documented" → a class the answers can explain. */
export function statusClass(status) {
    const s = String(status || '')
    if (/concept|idea/.test(s)) return 'idea'
    if (/user_reported|unverified|not_independently/.test(s)) return 'owner-reported'
    if (/historical/.test(s)) return 'historical'
    if (/limited/.test(s)) return 'limited'
    return 'documented'
}
export const STATUS_TEXT = {
    documented: 'documented in a public repository',
    historical: 'an earlier portfolio case study (historical)',
    'owner-reported': 'described by Gaurav; not independently verified',
    idea: 'an idea or concept Gaurav described',
    limited: 'a public repository with limited documentation',
}

const realUrl = (url) => (/^https?:\/\//.test(String(url || '')) ? String(url) : '')
const SLUG_OF = { 'linkedin-clone': 'mern-linkedin-clone' }

/**
 * Project records: one per knowledge-base project, merged with its site
 * project when it has a page. `aliases`: group → names (from corpus.js).
 */
export function projectRecords({ kb, projects = [], aliases = {}, caseStudySlugs = [] }) {
    const site = new Map(projects.map((p) => [p.slug, p]))
    const studies = new Set(caseStudySlugs)
    return (kb?.projects || []).map((p, order) => {
        const group = SLUG_OF[p.id] || p.id
        const page = site.get(group)
        const stack = [...new Set([...(p.technology_stack || []), ...(page?.techStack || [])])]
        const team = page?.team?.length ? page.team.length : (p.collaborators || []).length ? (p.collaborators || []).length + 1 : 0
        return {
            group,
            name: p.name,
            aliases: aliases[group] || [p.name],
            order,
            onSite: Boolean(page),
            caseStudy: studies.has(group),
            url: page ? `/projects/${group}` : realUrl(p.github_url),
            github: realUrl(p.github_url || page?.github),
            live: realUrl(p.live_demo_url || page?.demo),
            category: p.category || (page?.categories || []).join(', '),
            stack,
            stackDocumented: !(stack.length <= 2 && stack.some((s) => VAGUE_STACK.test(s))),
            tags: [...techTags(stack, p.category || '')],
            status: p.current_status || '',
            statusClass: statusClass(p.current_status),
            collaborative: Boolean(page?.isCollaborative) || team > 1,
            teamSize: team || null,
            summary: String(p.summary || page?.description || '').slice(0, 300),
            planned: (p.planned_or_future_features || []).length,
        }
    })
}

export const journeyRecords = (journey = []) => journey.map((e) => ({
    id: e.id, title: e.title, organization: e.organization || '', date: e.date || '', dateLabel: e.dateLabel || '',
    category: e.category || '', status: e.status || '', url: '/journey',
}))

const priceRange = (label) => {
    const n = [...String(label || '').matchAll(/(\d[\d,]*)/g)].map((m) => Number(m[1].replace(/,/g, '')))
    return n.length ? { min: Math.min(...n), max: Math.max(...n) } : { min: null, max: null }
}
export const serviceRecords = (services = []) => services.map((s) => ({
    slug: s.slug, title: s.title, priceLabel: s.priceLabel || '', ...priceRange(s.priceLabel), url: s.path || `/services/${s.slug}`,
}))

/** All records for the index. */
export function buildRecords({ kb, projects, journey, services, aliases, caseStudySlugs }) {
    return {
        projects: projectRecords({ kb, projects, aliases, caseStudySlugs }),
        journey: journeyRecords(journey),
        services: serviceRecords(services),
        github: kb?.github ? {
            reposIndexed: kb.github.public_repositories_indexed ?? null,
            snapshot: kb.github.snapshot_date || '',
            profile: kb.github.profile_url || '',
        } : null,
        listedOnSite: projects.length,
    }
}

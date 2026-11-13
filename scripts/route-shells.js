// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// Static route shells (D-057), the D-044 idea for /projects, /projects/:slug
// and, from P5, the page headers in src/lib/pageHeads.js.
// At build (and in dev) this writes the exact first-viewport header markup of
// both pages into index.html, plus a tiny inline script that paints the one for
// the current URL into #root before any JS loads. React's first commit renders
// the same header (boot.jsx waits for the route chunk), so the swap is in place
// with no layout shift, and the LCP no longer waits on the JS bundle.
//
// Keep in step with the headers in src/pages/Projects.jsx and ProjectDetail.jsx.
// Text comes from projectsData.js through src/lib/projects.js, the same helpers
// the pages use.

import { ARCH_ID, ARCH_PATH } from '../src/lib/arch.js'
import {
    CASE_STUDY_COUNT,
    PROJECTS_LEDE,
    RANKED_PROJECTS,
    caseKicker,
    hasRealImage,
    hasUrl,
} from '../src/lib/projects.js'
import { STATIC_HEADS, journeyHead, serviceHead, servicesHead, skillsHead } from '../src/lib/pageHeads.js'
import { journeyData } from '../src/data/journeyData.js'
import { servicesData } from '../src/data/servicesData.js'
import { skillGroups } from '../src/data/skillsData.js'
import { getPublicBlogs } from '../src/data/blogsData.js'

const esc = (s) => String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

// src/components/ui/Button.jsx, as rendered for an external link with arrow="external".
const button = (href, label, variant) => (
    `<a href="${esc(href)}" target="_blank" rel="noopener noreferrer" class="btn btn--${variant}">`
    + '<span class="btn__label"><span class="btn__roll">'
    + `<span class="btn__text">${esc(label)}</span>`
    + `<span class="btn__text btn__text--clone" aria-hidden="true">${esc(label)}</span>`
    + '</span><span class="btn__arrow btn__arrow--external" aria-hidden="true">↗</span></span></a>'
)

// src/components/Arch.jsx with an empty mask: the image arrives with React.
const arch = () => (
    '<div class="arch">'
    + '<svg class="arch__defs" width="0" height="0" aria-hidden="true" focusable="false"><defs>'
    + `<clipPath id="${ARCH_ID}" clipPathUnits="objectBoundingBox"><path d="${ARCH_PATH}"></path></clipPath></defs></svg>`
    + '<svg class="arch__outline" viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden="true" focusable="false">'
    + `<path d="${ARCH_PATH}" vector-effect="non-scaling-stroke"></path></svg>`
    + '<div class="arch__mask"></div></div>'
)

function projectsHeader() {
    return '<main class="pj"><header class="pj-head page-wrap page-grid">'
        + '<p class="page-rail pj-head__rail">'
        + `<span>${RANKED_PROJECTS.length} projects</span><span>${CASE_STUDY_COUNT} case studies</span></p>`
        + '<div class="page-main"><h1 class="pj-h1">Projects</h1>'
        + `<p class="pj-lede">${esc(PROJECTS_LEDE)}</p></div></header></main>`
}

function caseHeader(project) {
    const demo = hasUrl(project.demo) ? project.demo : null
    const source = hasUrl(project.github) ? project.github : null
    const actions = demo || source
        ? '<div class="case-actions">'
            + (demo ? button(demo, 'Live demo', 'primary') : '')
            + (source ? button(source, 'Source on GitHub', demo ? 'secondary' : 'primary') : '')
            + '</div>'
        : ''
    const frontis = hasRealImage(project.image)
        ? `<figure class="case-frontis" aria-hidden="true">${arch()}</figure>`
        : ''
    return '<main class="case"><header class="case-head page-wrap page-grid">'
        + '<p class="page-rail case-head__rail">'
        + '<a class="text-link text-link--muted case-back" href="/projects"><span class="text-link__label">← All projects</span></a></p>'
        + '<div class="case-head__main">'
        + `<p class="case-kicker">${esc(caseKicker(project))}</p>`
        + `<h1 class="case-title">${esc(project.title)}</h1>`
        + `<p class="case-lede">${esc(project.description)}</p>`
        + actions
        + `</div>${frontis}</header></main>`
}

// src/components/page/PageHead.jsx inside the page's <main class="pg">.
function pageHeader(head) {
    return '<main class="pg"><header class="pg-head page-wrap page-grid">'
        + `<p class="page-rail pg-head__rail">${head.rail.map((r) => `<span>${esc(r)}</span>`).join('')}</p>`
        + `<div class="page-main"><h1 class="pg-h1">${esc(head.title)}</h1>`
        + `<p class="pg-lede">${esc(head.lede)}</p></div></header></main>`
}

// src/pages/BlogPost.jsx header + cover, for published/preview posts.
function articleHeader(blog) {
    const cover = blog.images?.find((image) => image.id === blog.coverImageId)
    const rail = '<a class="text-link text-link--muted" href="/blog"><span class="text-link__label">← Notes</span></a>'
        + `<span>${esc(blog.category)}</span>`
        + (blog.publishedDate ? `<span>${esc(blog.date)}</span>` : '')
        + (blog.publishedDate && blog.readTime ? `<span>${esc(blog.readTime)}</span>` : '')
        + (blog.status === 'preview' ? '<span>Preview</span>' : '')
    const figure = cover
        ? '<figure class="ar-cover page-wrap">'
            + `<img src="${esc(cover.src)}" alt="${esc(cover.alt)}" class="ar-cover__img" loading="eager" fetchpriority="high" decoding="async">`
            + `<figcaption class="ar-caption"><span>${esc(cover.caption)}</span><span>Source: ${esc(cover.credit)}${cover.usageRights === 'unverified' ? ' · Usage rights unverified' : ''}</span></figcaption>`
            + '</figure>'
        : ''
    return '<main class="pg ar"><article><header class="ar-head page-wrap page-grid">'
        + `<p class="page-rail ar-head__rail">${rail}</p>`
        + `<div class="page-main"><h1 class="ar-title">${esc(blog.title)}</h1>`
        + `<p class="pg-lede">${esc(blog.subtitle || blog.excerpt)}</p>`
        + `<p class="ar-byline">${esc(blog.author)}</p></div></header>`
        + `${figure}</article></main>`
}

/** The inline script: picks the shell for this URL and paints it into #root. */
function shellScript() {
    const shells = {
        index: projectsHeader(),
        cases: Object.fromEntries(RANKED_PROJECTS.map((p) => [p.slug, caseHeader(p)])),
        pages: Object.fromEntries([
            ...Object.entries(STATIC_HEADS).map(([path, head]) => [path, pageHeader(head)]),
            ['/skills', pageHeader(skillsHead(skillGroups))],
            ['/journey', pageHeader(journeyHead(journeyData))],
            ['/services', pageHeader(servicesHead(servicesData))],
            ...servicesData.map((service) => [service.path, pageHeader(serviceHead(service))]),
            ...getPublicBlogs().map((blog) => [`/blog/${blog.slug}`, articleHeader(blog)]),
        ]),
    }
    // `<` escaped so no string can close the script element.
    const data = JSON.stringify(shells).replace(/</g, '\\u003c')
    return '<script>(function(){'
        + 'var p=location.pathname.replace(/\\/+$/,"");'
        + `var S=${data};`
        + 'var h=p==="/projects"?S.index:(p.indexOf("/projects/")===0?S.cases[p.slice(10)]:S.pages[p]);'
        + 'if(!h)return;'
        + 'document.getElementById("root").insertAdjacentHTML("beforeend",'
        + '"<div class=\\"App\\" id=\\"route-shell\\"><div style=\\"padding-top:var(--chrome-h)\\">"+h+"</div></div>")'
        + '})()</script>'
}

export default function routeShells() {
    return {
        name: 'route-shells',
        transformIndexHtml: {
            order: 'pre',
            handler(html) {
                const marker = '<!-- route-shells -->'
                if (!html.includes(marker)) {
                    throw new Error('route-shells: index.html is missing the <!-- route-shells --> marker after #root')
                }
                return html.replace(marker, shellScript())
            },
        },
    }
}

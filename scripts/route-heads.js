// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// Prerendered <head> per route. The SPA ships one index.html, so without this
// every URL (/about, /projects/x, /blog/y …) served Home's title, description
// and canonical to crawlers that do not run JS (most AI crawlers), and to
// Google before rendering. Values come from src/lib/seo.js, the same module
// useSEO reads on the client, so the two never disagree.
//
// - transformIndexHtml fills the <!-- seo-head --> marker with Home's head.
// - closeBundle writes dist/<route>/index.html for every route in
//   allRouteSeo(): same document, that route's head, a route-specific
//   <noscript> fallback, and no Home hero shell (so one h1 per route).
// vercel.json rewrites each route to its own file; an unknown slug has no file
// and gets the real 404.

import fs from 'node:fs'
import path from 'node:path'
import {
    DEFAULT_OG,
    MARKDOWN_ALTERNATE_HREF,
    MARKDOWN_ALTERNATE_PATHS,
    NAME,
    SITE_NAME,
    TWITTER_HANDLE,
    absoluteUrl,
    buildJsonLd,
    robotsContent,
    staticSeo,
} from '../src/lib/seo.js'
import { allRouteSeo } from '../src/lib/seoRoutes.js'

const MARKER = '<!-- seo-head -->'
const START = '<!--seo:start-->'
const END = '<!--seo:end-->'

const esc = (s) => String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const meta = (attr, key, content) => (content == null || content === ''
    ? ''
    : `    <meta ${attr}="${key}" content="${esc(content)}" />\n`)

/** The head block for one route, wrapped in markers so the build can swap it. */
export function renderHead(seo) {
    const url = absoluteUrl(seo.path)
    const image = seo.ogImage || DEFAULT_OG
    const isDefault = image.url === DEFAULT_OG.url
    const isArticle = seo.type === 'article'
    // `<` escaped so no string can close the script element.
    const jsonLd = JSON.stringify(buildJsonLd(seo)).replace(/</g, '\\u003c')

    return `${START}\n`
        + `    <title>${esc(seo.title)}</title>\n`
        + meta('name', 'description', seo.description)
        + meta('name', 'robots', robotsContent(seo.noindex))
        + `    <link rel="canonical" href="${esc(url)}" />\n`
        + (MARKDOWN_ALTERNATE_PATHS.includes(seo.path)
            ? `    <link rel="alternate" type="text/markdown" href="${MARKDOWN_ALTERNATE_HREF}" title="Gaurav Kumar Yadav, full knowledge base" />\n`
            : '')
        + meta('property', 'og:type', isArticle ? 'article' : 'website')
        + meta('property', 'og:url', url)
        + meta('property', 'og:title', seo.title)
        + meta('property', 'og:description', seo.description)
        + meta('property', 'og:site_name', SITE_NAME)
        + meta('property', 'og:locale', 'en_US')
        + meta('property', 'og:image', image.url)
        + meta('property', 'og:image:alt', image.alt || seo.title)
        + (isDefault ? meta('property', 'og:image:width', DEFAULT_OG.width) + meta('property', 'og:image:height', DEFAULT_OG.height) : '')
        + (isArticle
            ? meta('property', 'article:author', NAME)
                + meta('property', 'article:published_time', seo.publishedTime)
                + meta('property', 'article:modified_time', seo.modifiedTime)
                + (seo.tags || []).map((tag) => meta('property', 'article:tag', tag)).join('')
            : '')
        + meta('name', 'twitter:card', 'summary_large_image')
        + meta('name', 'twitter:site', TWITTER_HANDLE)
        + meta('name', 'twitter:creator', TWITTER_HANDLE)
        + meta('name', 'twitter:title', seo.title)
        + meta('name', 'twitter:description', seo.description)
        + meta('name', 'twitter:image', image.url)
        + meta('name', 'twitter:image:alt', image.alt || seo.title)
        + `    <script type="application/ld+json" id="seo-json-ld">${jsonLd}</script>\n`
        + `    ${END}`
}

const NAV = [
    ['/', 'Home'], ['/about', 'About'], ['/projects', 'Projects'], ['/skills', 'Skills'],
    ['/journey', 'Journey'], ['/services', 'Services'], ['/blog', 'Engineering Notes'], ['/contact', 'Contact'],
]

/** Fallback for clients without JS: the route's heading, summary and the main links. */
function renderNoscript(seo) {
    const heading = seo.crumbs?.length ? seo.crumbs[seo.crumbs.length - 1].name : seo.title
    return '<noscript>'
        + `<h1>${esc(heading)}</h1>`
        + `<p>${esc(seo.description)}</p>`
        + `<ul>${NAV.map(([href, label]) => `<li><a href="${absoluteUrl(href)}">${label}</a></li>`).join('')}</ul>`
        + '</noscript>'
}

/** Removes the element that starts at `open` (a <div …> tag), balancing nested divs. */
function removeDiv(html, open) {
    const start = html.indexOf(open)
    if (start < 0) return html
    const re = /<\/?div\b[^>]*>/g
    re.lastIndex = start
    let depth = 0
    for (let m = re.exec(html); m; m = re.exec(html)) {
        depth += m[0][1] === '/' ? -1 : 1
        if (depth === 0) return html.slice(0, start) + html.slice(m.index + m[0].length)
    }
    throw new Error(`route-heads: unbalanced ${open}`)
}

function routeDocument(baseHtml, seo) {
    const head = baseHtml.replace(new RegExp(`${START}[\\s\\S]*?${END}`), renderHead(seo))
    const body = head.replace(/<noscript>[\s\S]*?<\/noscript>/, renderNoscript(seo))
    return removeDiv(body, '<div id="home-shell">')
}

export default function routeHeads() {
    let outDir = 'dist'
    return {
        name: 'route-heads',
        configResolved(config) {
            outDir = path.resolve(config.root, config.build.outDir)
        },
        transformIndexHtml: {
            order: 'pre',
            handler(html) {
                if (!html.includes(MARKER)) {
                    throw new Error(`route-heads: index.html is missing the ${MARKER} marker in <head>`)
                }
                return html.replace(MARKER, renderHead(staticSeo('/')))
            },
        },
        closeBundle() {
            const indexPath = path.join(outDir, 'index.html')
            if (!fs.existsSync(indexPath)) return
            const base = fs.readFileSync(indexPath, 'utf8')
            if (!base.includes(START)) throw new Error('route-heads: dist/index.html lost its seo markers')
            let count = 0
            for (const [route, seo] of allRouteSeo()) {
                if (route === '/') continue
                const file = path.join(outDir, route, 'index.html')
                fs.mkdirSync(path.dirname(file), { recursive: true })
                fs.writeFileSync(file, routeDocument(base, seo))
                count += 1
            }
            this.info?.(`route-heads: wrote ${count} route documents`)
        },
        // `vite preview` mirrors vercel.json: /about serves dist/about/index.html
        // (its own head) instead of the SPA fallback.
        configurePreviewServer(server) {
            server.middlewares.use((req, _res, next) => {
                const [pathname, query = ''] = (req.url || '/').split('?')
                const clean = decodeURIComponent(pathname).replace(/\/+$/, '')
                if (clean && !path.extname(clean) && fs.existsSync(path.join(outDir, clean, 'index.html'))) {
                    req.url = `${clean}/index.html${query ? `?${query}` : ''}`
                }
                next()
            })
        },
    }
}

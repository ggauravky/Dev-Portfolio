// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
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
} from '../lib/seo'

const JSON_LD_ID = 'seo-json-ld'

const setMeta = (attribute, key, content) => {
    let meta = document.head.querySelector(`meta[${attribute}="${key}"]`)
    if (!content) {
        meta?.remove()
        return
    }
    if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute(attribute, key)
        document.head.appendChild(meta)
    }
    meta.setAttribute('content', String(content))
}

const setLink = (selector, attrs) => {
    let link = document.head.querySelector(selector)
    if (!attrs) {
        link?.remove()
        return
    }
    if (!link) {
        link = document.createElement('link')
        document.head.appendChild(link)
    }
    Object.entries(attrs).forEach(([key, value]) => link.setAttribute(key, value))
}

/**
 * Applies a route's SEO (from src/lib/seo.js) to <head>. The same values are
 * prerendered into each route's HTML by scripts/route-heads.js, so this only
 * keeps the head right during client-side navigation.
 *
 * `path` is the canonical path (defaults to the current one); `additionalJsonLd`
 * adds page-only nodes (ItemList, FAQ) to the shared @graph.
 */
const useSEO = ({
    path,
    title,
    description,
    keywords,
    ogImage,
    type = 'website',
    author = NAME,
    publishedTime,
    modifiedTime,
    tags,
    noindex = false,
    page,
    crumbs,
    nodes,
    additionalJsonLd = null,
}) => {
    const location = useLocation()
    const canonicalPath = path || location.pathname.replace(/(.)\/+$/, '$1')

    useEffect(() => {
        const url = absoluteUrl(canonicalPath)
        const image = typeof ogImage === 'string' ? { url: ogImage } : (ogImage || DEFAULT_OG)
        const isDefaultImage = image.url === DEFAULT_OG.url

        if (title) document.title = title
        setMeta('name', 'description', description)
        setMeta('name', 'keywords', keywords)
        setMeta('name', 'robots', robotsContent(noindex))

        setMeta('property', 'og:type', type)
        setMeta('property', 'og:url', url)
        setMeta('property', 'og:title', title)
        setMeta('property', 'og:description', description)
        setMeta('property', 'og:site_name', SITE_NAME)
        setMeta('property', 'og:image', image.url)
        setMeta('property', 'og:image:alt', image.alt || title)
        setMeta('property', 'og:image:width', isDefaultImage ? DEFAULT_OG.width : null)
        setMeta('property', 'og:image:height', isDefaultImage ? DEFAULT_OG.height : null)

        setMeta('name', 'twitter:card', 'summary_large_image')
        setMeta('name', 'twitter:site', TWITTER_HANDLE)
        setMeta('name', 'twitter:creator', TWITTER_HANDLE)
        setMeta('name', 'twitter:title', title)
        setMeta('name', 'twitter:description', description)
        setMeta('name', 'twitter:image', image.url)
        setMeta('name', 'twitter:image:alt', image.alt || title)

        const isArticle = type === 'article'
        setMeta('property', 'article:author', isArticle ? author : null)
        setMeta('property', 'article:published_time', isArticle ? publishedTime : null)
        setMeta('property', 'article:modified_time', isArticle ? modifiedTime : null)
        document.head.querySelectorAll('meta[property="article:tag"]').forEach((tag) => tag.remove())
        if (isArticle) {
            (tags || []).forEach((tag) => {
                const meta = document.createElement('meta')
                meta.setAttribute('property', 'article:tag')
                meta.setAttribute('content', tag)
                document.head.appendChild(meta)
            })
        }

        setLink('link[rel="canonical"]', { rel: 'canonical', href: url })
        setLink(
            'link[rel="alternate"][type="text/markdown"]',
            MARKDOWN_ALTERNATE_PATHS.includes(canonicalPath)
                ? { rel: 'alternate', type: 'text/markdown', href: MARKDOWN_ALTERNATE_HREF }
                : null,
        )

        const extras = additionalJsonLd
            ? (Array.isArray(additionalJsonLd) ? additionalJsonLd : [additionalJsonLd])
            : []
        let script = document.getElementById(JSON_LD_ID)
        if (!script) {
            script = document.createElement('script')
            script.type = 'application/ld+json'
            script.id = JSON_LD_ID
            document.head.appendChild(script)
        }
        script.text = JSON.stringify(buildJsonLd(
            { path: canonicalPath, title, description, page, crumbs, nodes },
            extras,
        ))
    }, [canonicalPath, title, description, keywords, ogImage, type, author, publishedTime, modifiedTime, tags, noindex, page, crumbs, nodes, additionalJsonLd])
}

export default useSEO

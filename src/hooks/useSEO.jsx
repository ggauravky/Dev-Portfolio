// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

const useSEO = ({
    title,
    description,
    keywords,
    ogImage,
    type = 'website',
    author,
    publishedTime,
    tags,
    noindex = false,
    additionalJsonLd = null
}) => {
    const location = useLocation()
    const siteUrl = 'https://ggauravky.vercel.app'
    const fullUrl = `${siteUrl}${location.pathname}`
    const createdMetaRefs = useRef([])

    useEffect(() => {
        // Cleanup function to track created meta tags
        const createdMeta = []
        // Set page title
        if (title) {
            document.title = title
        }

        // Set meta description
        if (description) {
            const metaDescription = document.querySelector('meta[name="description"]')
            if (metaDescription) {
                metaDescription.setAttribute('content', description)
            }
        }

        // Set meta keywords
        if (keywords) {
            const metaKeywords = document.querySelector('meta[name="keywords"]')
            if (metaKeywords) {
                metaKeywords.setAttribute('content', keywords)
            }
        }

        // Set Open Graph tags - optimized to track created elements
        const updateOrCreateMeta = (property, content, isProperty = true) => {
            if (!content) return // Skip if no content
            const attribute = isProperty ? 'property' : 'name'
            let meta = document.querySelector(`meta[${attribute}="${property}"]`)
            if (!meta) {
                meta = document.createElement('meta')
                meta.setAttribute(attribute, property)
                document.head.appendChild(meta)
                createdMeta.push(meta)
            }
            meta.setAttribute('content', content)
        }

        if (title) updateOrCreateMeta('og:title', title)
        if (description) updateOrCreateMeta('og:description', description)
        updateOrCreateMeta('og:url', fullUrl)
        updateOrCreateMeta('og:type', type)
        updateOrCreateMeta('og:site_name', 'Gaurav Kumar Yadav - Developer Portfolio')
        updateOrCreateMeta('og:locale', 'en_US')
        if (ogImage) updateOrCreateMeta('og:image', ogImage)
        if (ogImage) updateOrCreateMeta('og:image:alt', title || 'Gaurav Kumar Yadav portfolio preview')

        // Set Twitter Card tags
        updateOrCreateMeta('twitter:card', 'summary_large_image', false)
        if (title) updateOrCreateMeta('twitter:title', title, false)
        if (description) updateOrCreateMeta('twitter:description', description, false)
        if (ogImage) updateOrCreateMeta('twitter:image', ogImage, false)
        if (ogImage) updateOrCreateMeta('twitter:image:alt', title || 'Gaurav Kumar Yadav portfolio preview', false)
        updateOrCreateMeta('twitter:url', fullUrl, false)
        updateOrCreateMeta('twitter:site', '@ggauravky', false)
        updateOrCreateMeta('twitter:creator', '@ggauravky', false)

        // Explicit robots control (index/follow by default)
        updateOrCreateMeta(
            'robots',
            noindex
                ? 'noindex, nofollow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
                : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
            false
        )

        // Set article-specific tags for blog posts
        if (type === 'article') {
            if (author) updateOrCreateMeta('article:author', author)
            if (publishedTime) updateOrCreateMeta('article:published_time', publishedTime)
            updateOrCreateMeta('article:modified_time', new Date().toISOString())
            if (tags && tags.length > 0) {
                tags.forEach(tag => {
                    const tagMeta = document.createElement('meta')
                    tagMeta.setAttribute('property', 'article:tag')
                    tagMeta.setAttribute('content', tag)
                    document.head.appendChild(tagMeta)
                })
            }
        }

        // Set canonical URL
        let canonical = document.querySelector('link[rel="canonical"]')
        if (!canonical) {
            canonical = document.createElement('link')
            canonical.setAttribute('rel', 'canonical')
            document.head.appendChild(canonical)
        }
        canonical.setAttribute('href', fullUrl)

        // Add JSON-LD structured data - Enhanced with multiple schemas
        const jsonLdId = 'seo-json-ld'
        let jsonLdScript = document.getElementById(jsonLdId)

        // Base author/person schema
        const personSchema = {
            '@type': 'Person',
            '@id': `${siteUrl}/#person`,
            name: 'Gaurav Kumar Yadav',
            url: siteUrl,
            image: `${siteUrl}/images/profile.jpg`,
            jobTitle: 'AI/ML Developer & Web Developer',
            description: 'Gaurav Kumar Yadav is a BCA student at BBD University (BBDU), Lucknow, India, focused on AI/ML and web development projects.',
            alumniOf: 'BBD University Lucknow',
            address: {
                '@type': 'PostalAddress',
                addressLocality: 'Lucknow',
                addressRegion: 'Uttar Pradesh',
                addressCountry: 'India'
            },
            knowsAbout: ['Machine Learning', 'Artificial Intelligence', 'Web Development', 'Full Stack Development', 'React', 'Python', 'MERN Stack', 'Data Science basics'],
            knowsLanguage: ['English', 'Hindi'],
            sameAs: [
                'https://github.com/ggauravky',
                'https://www.linkedin.com/in/gauravky/',
                'https://twitter.com/ggauravky'
            ]
        }

        let structuredData = {}

        const breadcrumbItems = location.pathname
            .split('/')
            .filter(Boolean)
            .map((segment, index, arr) => {
                const itemPath = `/${arr.slice(0, index + 1).join('/')}`
                const name = segment
                    .replaceAll('-', ' ')
                    .replaceAll(/\b\w/g, (char) => char.toUpperCase())
                return {
                    '@type': 'ListItem',
                    position: index + 2,
                    name,
                    item: `${siteUrl}${itemPath}`
                }
            })

        if (type === 'article') {
            // Blog post schema - Google Rich Results compliant
            structuredData = {
                '@context': 'https://schema.org',
                '@type': 'BlogPosting',
                headline: title,
                name: title,
                description: description,
                url: fullUrl,
                image: {
                    '@type': 'ImageObject',
                    url: ogImage || `${siteUrl}/images/profile.jpg`,
                    width: 1200,
                    height: 630
                },
                datePublished: publishedTime || new Date().toISOString(),
                dateModified: publishedTime || new Date().toISOString(),
                author: {
                    '@type': 'Person',
                    name: author || 'Gaurav Kumar Yadav',
                    url: siteUrl,
                    image: `${siteUrl}/images/profile.jpg`,
                    jobTitle: 'AI/ML Developer & Web Developer'
                },
                publisher: {
                    '@type': 'Person',
                    name: 'Gaurav Kumar Yadav',
                    url: siteUrl,
                    logo: {
                        '@type': 'ImageObject',
                        url: `${siteUrl}/images/profile.jpg`,
                        width: 512,
                        height: 512
                    }
                },
                mainEntityOfPage: {
                    '@type': 'WebPage',
                    '@id': fullUrl
                }
            }
            if (keywords) {
                structuredData.keywords = keywords
            }
        } else {
            // Portfolio website with comprehensive schemas
            structuredData = {
                '@context': 'https://schema.org',
                '@graph': [
                    // WebSite Schema
                    {
                        '@type': 'WebSite',
                        '@id': `${siteUrl}/#website`,
                        url: siteUrl,
                        name: 'Gaurav Kumar Yadav Portfolio',
                        alternateName: ['ggauravky portfolio', 'Gaurav Kumar Yadav BBDU portfolio', 'Gaurav Lucknow developer portfolio'],
                        description: 'Portfolio of Gaurav Kumar Yadav, AI/ML developer and web developer from Lucknow, India.',
                        inLanguage: 'en-IN',
                        potentialAction: {
                            '@type': 'SearchAction',
                            target: {
                                '@type': 'EntryPoint',
                                urlTemplate: `${siteUrl}/projects?q={search_term_string}`
                            },
                            'query-input': 'required name=search_term_string'
                        }
                    },
                    // Person Schema
                    personSchema,
                    // ProfilePage Schema
                    {
                        '@type': 'ProfilePage',
                        '@id': fullUrl,
                        url: fullUrl,
                        name: title,
                        description: description,
                        mainEntity: {
                            '@id': `${siteUrl}/#person`
                        },
                        breadcrumb: {
                            '@type': 'BreadcrumbList',
                            '@id': `${fullUrl}#breadcrumb`,
                            itemListElement: [
                                {
                                    '@type': 'ListItem',
                                    position: 1,
                                    name: 'Home',
                                    item: siteUrl
                                },
                                ...breadcrumbItems
                            ]
                        }
                    },
                    // Organization Schema (Portfolio as professional presence)
                    {
                        '@type': 'Organization',
                        '@id': `${siteUrl}/#organization`,
                        name: 'ggauravky portfolio',
                        alternateName: 'Gaurav Kumar Yadav Portfolio',
                        url: siteUrl,
                        logo: {
                            '@type': 'ImageObject',
                            url: `${siteUrl}/images/profile.jpg`,
                            width: 512,
                            height: 512
                        },
                        founder: {
                            '@id': `${siteUrl}/#person`
                        },
                        contactPoint: {
                            '@type': 'ContactPoint',
                            contactType: 'Portfolio Inquiries',
                            availableLanguage: ['English', 'Hindi']
                        },
                        sameAs: [
                            'https://github.com/ggauravky',
                            'https://www.linkedin.com/in/gauravky/',
                            'https://twitter.com/ggauravky'
                        ]
                    }
                ]
            }
        }

        if (additionalJsonLd) {
            const extras = Array.isArray(additionalJsonLd) ? additionalJsonLd : [additionalJsonLd]

            if (structuredData['@graph']) {
                structuredData['@graph'].push(...extras)
            } else {
                structuredData = {
                    '@context': 'https://schema.org',
                    '@graph': [structuredData, ...extras]
                }
            }
        }

        if (!jsonLdScript) {
            jsonLdScript = document.createElement('script')
            jsonLdScript.type = 'application/ld+json'
            jsonLdScript.id = jsonLdId
            document.head.appendChild(jsonLdScript)
        }
        jsonLdScript.text = JSON.stringify(structuredData)

        // Store ref for cleanup
        createdMetaRefs.current = createdMeta

        // Cleanup function
        return () => {
            if (type === 'article') {
                document.querySelectorAll('meta[property="article:tag"]').forEach(tag => tag.remove())
            }
        }
    }, [title, description, keywords, ogImage, location, type, author, publishedTime, tags, fullUrl, siteUrl, noindex, additionalJsonLd])
}

export default useSEO

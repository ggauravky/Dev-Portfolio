import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const useSEO = ({
    title,
    description,
    keywords,
    ogImage,
    type = 'website',
    author,
    publishedTime,
    tags
}) => {
    const location = useLocation()
    const siteUrl = 'https://ggauravky.vercel.app'
    const fullUrl = `${siteUrl}${location.pathname}`

    useEffect(() => {
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

        // Set Open Graph tags
        const updateOrCreateMeta = (property, content, isProperty = true) => {
            const attribute = isProperty ? 'property' : 'name'
            let meta = document.querySelector(`meta[${attribute}="${property}"]`)
            if (!meta) {
                meta = document.createElement('meta')
                meta.setAttribute(attribute, property)
                document.head.appendChild(meta)
            }
            meta.setAttribute('content', content)
        }

        if (title) updateOrCreateMeta('og:title', title)
        if (description) updateOrCreateMeta('og:description', description)
        updateOrCreateMeta('og:url', fullUrl)
        updateOrCreateMeta('og:type', type)
        if (ogImage) updateOrCreateMeta('og:image', ogImage)

        // Set Twitter Card tags
        updateOrCreateMeta('twitter:card', 'summary_large_image', false)
        if (title) updateOrCreateMeta('twitter:title', title, false)
        if (description) updateOrCreateMeta('twitter:description', description, false)
        if (ogImage) updateOrCreateMeta('twitter:image', ogImage, false)
        updateOrCreateMeta('twitter:url', fullUrl, false)

        // Set article-specific tags for blog posts
        if (type === 'article') {
            if (author) updateOrCreateMeta('article:author', author)
            if (publishedTime) updateOrCreateMeta('article:published_time', publishedTime)
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

        // Add JSON-LD structured data
        let jsonLdScript = document.querySelector('script[type="application/ld+json"]')
        if (jsonLdScript) {
            jsonLdScript.remove()
        }

        const structuredData = {
            '@context': 'https://schema.org',
            '@type': type === 'article' ? 'BlogPosting' : 'WebSite',
            name: title,
            description: description,
            url: fullUrl,
            author: {
                '@type': 'Person',
                name: author || 'Gaurav Kumar Yadav',
                url: siteUrl,
                jobTitle: 'Python Developer | AI & Data Science Enthusiast',
                sameAs: [
                    'https://github.com/ggauravky',
                    'https://www.linkedin.com/in/gauravky/',
                    'https://leetcode.com/gauravky/'
                ]
            }
        }

        if (type === 'article') {
            structuredData['@type'] = 'BlogPosting'
            structuredData.headline = title
            structuredData.image = ogImage || `${siteUrl}/images/profile.jpg`
            structuredData.datePublished = publishedTime
            structuredData.publisher = {
                '@type': 'Person',
                name: 'Gaurav Kumar Yadav',
                logo: {
                    '@type': 'ImageObject',
                    url: `${siteUrl}/images/profile.jpg`
                }
            }
            if (keywords) {
                structuredData.keywords = keywords
            }
        } else {
            structuredData['@type'] = 'WebSite'
            structuredData.potentialAction = {
                '@type': 'SearchAction',
                target: {
                    '@type': 'EntryPoint',
                    urlTemplate: `${siteUrl}/blog?search={search_term_string}`
                },
                'query-input': 'required name=search_term_string'
            }
        }

        jsonLdScript = document.createElement('script')
        jsonLdScript.type = 'application/ld+json'
        jsonLdScript.text = JSON.stringify(structuredData)
        document.head.appendChild(jsonLdScript)

        // Cleanup function to remove article tags when unmounting
        return () => {
            if (type === 'article') {
                document.querySelectorAll('meta[property="article:tag"]').forEach(tag => tag.remove())
            }
        }
    }, [title, description, keywords, ogImage, location, type, author, publishedTime, tags, fullUrl, siteUrl])
}

export default useSEO

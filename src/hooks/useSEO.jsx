import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const useSEO = ({ title, description, keywords, ogImage }) => {
    const location = useLocation()

    useEffect(() => {
        if (title) {
            document.title = title
        }

        if (description) {
            const metaDescription = document.querySelector('meta[name="description"]')
            if (metaDescription) {
                metaDescription.setAttribute('content', description)
            }
        }

        if (keywords) {
            const metaKeywords = document.querySelector('meta[name="keywords"]')
            if (metaKeywords) {
                metaKeywords.setAttribute('content', keywords)
            }
        }

        const ogTitle = document.querySelector('meta[property="og:title"]')
        const ogDesc = document.querySelector('meta[property="og:description"]')
        const ogUrl = document.querySelector('meta[property="og:url"]')
        const ogImg = document.querySelector('meta[property="og:image"]')

        if (ogTitle && title) {
            ogTitle.setAttribute('content', title)
        }
        if (ogDesc && description) {
            ogDesc.setAttribute('content', description)
        }
        if (ogUrl) {
            ogUrl.setAttribute('content', `https://ggauravky.vercel.app${location.pathname}`)
        }
        if (ogImg && ogImage) {
            ogImg.setAttribute('content', ogImage)
        }

        const twitterTitle = document.querySelector('meta[property="twitter:title"]')
        const twitterDesc = document.querySelector('meta[property="twitter:description"]')
        const twitterUrl = document.querySelector('meta[property="twitter:url"]')
        const twitterImg = document.querySelector('meta[property="twitter:image"]')

        if (twitterTitle && title) {
            twitterTitle.setAttribute('content', title)
        }
        if (twitterDesc && description) {
            twitterDesc.setAttribute('content', description)
        }
        if (twitterUrl) {
            twitterUrl.setAttribute('content', `https://ggauravky.vercel.app${location.pathname}`)
        }
        if (twitterImg && ogImage) {
            twitterImg.setAttribute('content', ogImage)
        }

        let canonical = document.querySelector('link[rel="canonical"]')
        if (!canonical) {
            canonical = document.createElement('link')
            canonical.setAttribute('rel', 'canonical')
            document.head.appendChild(canonical)
        }
        canonical.setAttribute('href', `https://ggauravky.vercel.app${location.pathname}`)
    }, [title, description, keywords, ogImage, location])
}

export default useSEO

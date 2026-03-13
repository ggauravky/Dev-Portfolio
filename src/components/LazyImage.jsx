// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import './LazyImage.css'

function LazyImage({
    src,
    alt,
    className = '',
    sizes = '100vw',
    responsive = true,
    fetchPriority = 'auto',
    placeholderSrc = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%231e293b" width="400" height="300"/%3E%3C/svg%3E',
    onLoad,
    onError,
    ...props
}) {
    const [imageSrc, setImageSrc] = useState(placeholderSrc)
    const [imageRef, setImageRef] = useState()
    const [isLoaded, setIsLoaded] = useState(false)
    const [isInView, setIsInView] = useState(false)

    const buildVariantSet = (format) => {
        if (!responsive || !src?.startsWith('/')) return ''

        const match = src.match(/^(.*)\.(png|jpg|jpeg)$/i)
        if (!match) return ''

        const base = match[1]
        const widths = [480, 768, 1200]
        return widths.map(w => `${base}-${w}.${format} ${w}w`).join(', ')
    }

    const buildOriginalVariantSet = () => {
        if (!responsive || !src?.startsWith('/')) return ''

        const match = src.match(/^(.*)\.(png|jpg|jpeg)$/i)
        if (!match) return ''

        const base = match[1]
        const ext = match[2].toLowerCase() === 'jpeg' ? 'jpg' : match[2].toLowerCase()
        const widths = [480, 768, 1200]
        return widths.map(w => `${base}-${w}.${ext} ${w}w`).join(', ')
    }

    const avifSrcSet = buildVariantSet('avif')
    const webpSrcSet = buildVariantSet('webp')
    const originalSrcSet = buildOriginalVariantSet()

    useEffect(() => {
        let observer
        let didCancel = false

        if (imageRef && imageSrc === placeholderSrc) {
            if (IntersectionObserver) {
                observer = new IntersectionObserver(
                    entries => {
                        entries.forEach(entry => {
                            if (
                                !didCancel &&
                                (entry.intersectionRatio > 0 || entry.isIntersecting)
                            ) {
                                setIsInView(true)
                                setImageSrc(src)
                                observer.unobserve(imageRef)
                            }
                        })
                    },
                    {
                        threshold: 0.01,
                        rootMargin: '75px',
                    }
                )
                observer.observe(imageRef)
            } else {
                // Old browsers fallback - load image immediately
                setImageSrc(src)
            }
        }
        return () => {
            didCancel = true
            if (observer?.unobserve && imageRef) {
                observer.unobserve(imageRef)
            }
        }
    }, [src, imageSrc, imageRef, placeholderSrc])

    const handleLoad = (event) => {
        setIsLoaded(true)
        if (onLoad) {
            onLoad(event)
        }
    }

    const handleError = (event) => {
        // Set fallback image on error
        setImageSrc(
            `https://via.placeholder.com/400x300/1e293b/60a5fa?text=${encodeURIComponent(alt || 'Image')}`
        )
        if (onError) {
            onError(event)
        }
    }

    return (
        <picture ref={setImageRef}>
            {isInView && avifSrcSet && <source type="image/avif" srcSet={avifSrcSet} sizes={sizes} />}
            {isInView && webpSrcSet && <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} />}
            <img
                src={imageSrc}
                srcSet={isInView && originalSrcSet ? originalSrcSet : undefined}
                sizes={sizes}
                alt={alt}
                className={`${className} ${isLoaded && isInView ? 'lazy-image-loaded' : 'lazy-image-loading'
                    }`}
                onLoad={handleLoad}
                onError={handleError}
                loading={fetchPriority === 'high' ? 'eager' : 'lazy'}
                fetchPriority={fetchPriority}
                decoding="async"
                {...props}
            />
        </picture>
    )
}

LazyImage.propTypes = {
    src: PropTypes.string.isRequired,
    alt: PropTypes.string.isRequired,
    className: PropTypes.string,
    sizes: PropTypes.string,
    responsive: PropTypes.bool,
    fetchPriority: PropTypes.oneOf(['auto', 'high', 'low']),
    placeholderSrc: PropTypes.string,
    onLoad: PropTypes.func,
    onError: PropTypes.func,
}

export default LazyImage

// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { memo, useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import './LazyImage.css'

const lazyImageCallbacks = new Map()
let sharedImageObserver = null

const getImageObserver = () => {
    if (sharedImageObserver || typeof IntersectionObserver === 'undefined') {
        return sharedImageObserver
    }

    sharedImageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting && entry.intersectionRatio <= 0) return
            const loadImage = lazyImageCallbacks.get(entry.target)
            lazyImageCallbacks.delete(entry.target)
            sharedImageObserver.unobserve(entry.target)
            loadImage?.()
        })
    }, {
        threshold: 0.01,
        rootMargin: '100px',
    })

    return sharedImageObserver
}

const observeLazyImage = (element, loadImage) => {
    const observer = getImageObserver()
    if (!observer) {
        loadImage()
        return () => {}
    }

    lazyImageCallbacks.set(element, loadImage)
    observer.observe(element)

    return () => {
        lazyImageCallbacks.delete(element)
        observer.unobserve(element)
    }
}

const buildVariantSet = (src, responsive, format) => {
    if (!responsive || !src?.startsWith('/')) return ''

    const match = src.match(/^(.*)\.(png|jpg|jpeg)$/i)
    if (!match) return ''

    const base = match[1]
    return [480, 768, 1200].map((width) => `${base}-${width}.${format} ${width}w`).join(', ')
}

function LazyImage({
    src,
    alt,
    className = '',
    sizes = '100vw',
    responsive = true,
    fetchPriority = 'auto',
    priority = false,
    placeholderSrc = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%230f172a" width="400" height="300"/%3E%3C/svg%3E',
    onLoad,
    onError,
    ...props
}) {
    const isEager = priority || fetchPriority === 'high'
    const [imageSrc, setImageSrc] = useState(isEager ? src : placeholderSrc)
    const [isLoaded, setIsLoaded] = useState(false)
    const [isInView, setIsInView] = useState(isEager)
    const [isFallback, setIsFallback] = useState(false)
    const imageRef = useRef(null)
    const fallbackAttemptedRef = useRef(false)
    const sourceFallbackAttemptedRef = useRef(false)

    const effectiveFetchPriority = isEager ? 'high' : fetchPriority

    const sourceExtension = src.match(/\.(png|jpg|jpeg)$/i)?.[1]?.toLowerCase()
    const originalFormat = sourceExtension === 'jpeg' ? 'jpg' : sourceExtension
    const avifSrcSet = buildVariantSet(src, responsive, 'avif')
    const webpSrcSet = buildVariantSet(src, responsive, 'webp')
    const originalSrcSet = originalFormat ? buildVariantSet(src, responsive, originalFormat) : ''

    useEffect(() => {
        const element = imageRef.current
        fallbackAttemptedRef.current = false
        sourceFallbackAttemptedRef.current = false
        setIsFallback(false)
        setIsLoaded(false)

        if (isEager) {
            setIsInView(true)
            setImageSrc(src)
            return undefined
        }

        setIsInView(false)
        setImageSrc(placeholderSrc)
        if (!element) return undefined

        return observeLazyImage(element, () => {
            setIsLoaded(false)
            setIsInView(true)
            setImageSrc(src)
        })
    }, [src, placeholderSrc, isEager])

    const handleLoad = (event) => {
        if (isInView) setIsLoaded((loaded) => loaded ? loaded : true)
        if (onLoad) {
            onLoad(event)
        }
    }

    const handleError = (event) => {
        if (responsive && !isFallback && !sourceFallbackAttemptedRef.current) {
            sourceFallbackAttemptedRef.current = true
            setIsFallback(true)
            setIsLoaded(false)
            setImageSrc(src)
            return
        }

        if (!fallbackAttemptedRef.current) {
            fallbackAttemptedRef.current = true
            setIsFallback(true)
            setIsLoaded(false)
            setImageSrc(
                `https://via.placeholder.com/400x300/0f172a/64748b?text=${encodeURIComponent(alt || 'Media')}`
            )
        }
        if (onError) {
            onError(event)
        }
    }

    return (
        <picture ref={imageRef} className="lazy-image-picture-wrapper">
            {isInView && !isFallback && avifSrcSet && <source type="image/avif" srcSet={avifSrcSet} sizes={sizes} />}
            {isInView && !isFallback && webpSrcSet && <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} />}
            <img
                src={imageSrc}
                srcSet={isInView && !isFallback && originalSrcSet ? originalSrcSet : undefined}
                sizes={sizes}
                alt={alt || ''}
                className={`${className} ${isLoaded && isInView ? 'lazy-image-loaded' : 'lazy-image-loading'}`}
                onLoad={handleLoad}
                onError={handleError}
                loading={isEager ? 'eager' : 'lazy'}
                fetchpriority={effectiveFetchPriority}
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
    priority: PropTypes.bool,
    placeholderSrc: PropTypes.string,
    onLoad: PropTypes.func,
    onError: PropTypes.func,
}

export default memo(LazyImage)

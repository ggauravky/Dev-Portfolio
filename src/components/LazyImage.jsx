import { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import './LazyImage.css'

function LazyImage({
    src,
    alt,
    className = '',
    placeholderSrc = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%231e293b" width="400" height="300"/%3E%3C/svg%3E',
    onLoad,
    onError,
    ...props
}) {
    const [imageSrc, setImageSrc] = useState(placeholderSrc)
    const [imageRef, setImageRef] = useState()
    const [isLoaded, setIsLoaded] = useState(false)
    const [isInView, setIsInView] = useState(false)

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
            if (observer && observer.unobserve && imageRef) {
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
        <img
            ref={setImageRef}
            src={imageSrc}
            alt={alt}
            className={`${className} ${isLoaded && isInView ? 'lazy-image-loaded' : 'lazy-image-loading'
                }`}
            onLoad={handleLoad}
            onError={handleError}
            loading="lazy"
            decoding="async"
            {...props}
        />
    )
}

LazyImage.propTypes = {
    src: PropTypes.string.isRequired,
    alt: PropTypes.string.isRequired,
    className: PropTypes.string,
    placeholderSrc: PropTypes.string,
    onLoad: PropTypes.func,
    onError: PropTypes.func,
}

export default LazyImage

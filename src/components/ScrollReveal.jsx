// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { useRef, useEffect, useState } from 'react'
import PropTypes from 'prop-types'

const revealCallbacks = new Map()
let sharedRevealObserver = null

const getRevealObserver = () => {
    if (sharedRevealObserver || typeof IntersectionObserver === 'undefined') {
        return sharedRevealObserver
    }

    sharedRevealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return
            const reveal = revealCallbacks.get(entry.target)
            revealCallbacks.delete(entry.target)
            sharedRevealObserver.unobserve(entry.target)
            reveal?.()
        })
    }, {
        threshold: 0.05,
        rootMargin: '0px 0px -20px 0px'
    })

    return sharedRevealObserver
}

const observeReveal = (element, reveal) => {
    const observer = getRevealObserver()
    if (!observer) {
        reveal()
        return () => {}
    }

    revealCallbacks.set(element, reveal)
    observer.observe(element)

    return () => {
        revealCallbacks.delete(element)
        observer.unobserve(element)
    }
}

/**
 * ScrollReveal — wraps children and plays a refined fade+slide-up animation
 * only when the element enters the viewport (IntersectionObserver).
 */
function ScrollReveal({ children, delay = 0, className = '' }) {
    const ref = useRef(null)
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const el = ref.current
        if (!el) return

        return observeReveal(el, () => setVisible(true))
    }, [])

    return (
        <div
            ref={ref}
            className={`scroll-reveal ${visible ? 'scroll-visible' : ''} ${className}`}
            style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }}
        >
            {children}
        </div>
    )
}

ScrollReveal.propTypes = {
    children: PropTypes.node.isRequired,
    delay: PropTypes.number,
    className: PropTypes.string,
}

export default ScrollReveal

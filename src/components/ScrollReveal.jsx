// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { useRef, useEffect, useState } from 'react'
import PropTypes from 'prop-types'

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

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true)
                    observer.disconnect() // animate only once
                }
            },
            {
                threshold: 0.05,
                rootMargin: '0px 0px -20px 0px'
            }
        )

        observer.observe(el)
        return () => observer.disconnect()
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

// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// Reading progress (P5): a 1px line under the top chrome that fills with the
// article. Scroll-linked, not an animation: transform only, one rAF per scroll
// burst, nothing at idle. Decorative (aria-hidden); the dock's ring and the TOC
// carry position for assistive tech.

import { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import './ReadingProgress.css'

function ReadingProgress({ targetRef }) {
    const barRef = useRef(null)

    useEffect(() => {
        let frame = 0
        const update = () => {
            frame = 0
            const el = targetRef.current
            const bar = barRef.current
            if (!el || !bar) return
            const rect = el.getBoundingClientRect()
            const total = rect.height - window.innerHeight
            const done = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 1
            bar.style.transform = `scaleX(${done})`
        }
        const onScroll = () => { if (!frame) frame = requestAnimationFrame(update) }
        update()
        window.addEventListener('scroll', onScroll, { passive: true })
        window.addEventListener('resize', onScroll)
        return () => {
            cancelAnimationFrame(frame)
            window.removeEventListener('scroll', onScroll)
            window.removeEventListener('resize', onScroll)
        }
    }, [targetRef])

    return <div className="ar-progress" aria-hidden="true"><div ref={barRef} className="ar-progress__bar" /></div>
}

ReadingProgress.propTypes = {
    targetRef: PropTypes.shape({ current: PropTypes.any }).isRequired,
}

export default ReadingProgress

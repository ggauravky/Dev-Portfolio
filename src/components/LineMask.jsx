// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// Line-split heading reveal (below-fold headings only; the hero name never
// animates in). The text is split into words, the words are grouped by the
// line they render on, and each line rises inside its own clip 80 ms after the
// line above (lines, never characters). The rise is a CSS transition started
// when the parent <Reveal> marks itself [data-revealed]; see src/styles/page.css.
// Lines are re-measured on resize and once fonts settle, so wrapping changes
// never leave a word on the wrong delay. Non-text titles fall back to one line.

import { Fragment, useLayoutEffect, useRef } from 'react'
import PropTypes from 'prop-types'

// Line 4 and beyond share line 3's delay: 280 ms + 3 × 80 ms = 520 ms total.
const MAX_LINE = 3

function LineMask({ text }) {
    const ref = useRef(null)
    const str = typeof text === 'string' || typeof text === 'number' ? String(text) : null

    useLayoutEffect(() => {
        const el = ref.current
        if (!el || str === null) return undefined
        const measure = () => {
            let line = -1
            let lastTop = null
            el.querySelectorAll('.line-mask__word').forEach((word) => {
                const top = word.offsetTop
                if (lastTop === null || top > lastTop + 2) {
                    line += 1
                    lastTop = top
                }
                word.style.setProperty('--line', String(Math.min(line, MAX_LINE)))
            })
        }
        measure()
        let alive = true
        document.fonts?.ready.then(() => { if (alive) measure() })
        const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure)
        ro?.observe(el)
        return () => {
            alive = false
            ro?.disconnect()
        }
    }, [str])

    if (str === null) {
        return <span className="line-mask"><span className="line-mask__line">{text}</span></span>
    }

    const words = str.split(/\s+/).filter(Boolean)
    return (
        <span ref={ref} className="line-mask line-mask--split">
            {words.map((word, i) => (
                <Fragment key={i}>
                    <span className="line-mask__word"><span className="line-mask__line">{word}</span></span>
                    {i < words.length - 1 ? ' ' : null}
                </Fragment>
            ))}
        </span>
    )
}

LineMask.propTypes = {
    text: PropTypes.node,
}

export default LineMask

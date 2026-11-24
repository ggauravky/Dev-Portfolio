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

// Every LineMask on a page is measured in one frame: all offsetTop reads first,
// then all --line writes, so the page pays one layout instead of one forced
// reflow per word (PSI "Forced reflow", D-126).
const pending = new Set()
const mounted = new Set()
let frame = 0
let fontsHooked = false
function flush() {
    frame = 0
    const els = [...pending]
    pending.clear()
    const plans = els.map((el) => {
        const words = [...el.querySelectorAll('.line-mask__word')]
        let line = -1
        let lastTop = null
        const lines = words.map((word) => {
            const top = word.offsetTop
            if (lastTop === null || top > lastTop + 2) {
                line += 1
                lastTop = top
            }
            return String(Math.min(line, MAX_LINE))
        })
        return { words, lines }
    })
    // document.fonts.ready forces a style update in Chromium, so it is read once
    // here (layout is already clean) rather than once per heading in the commit.
    if (!fontsHooked && document.fonts) {
        fontsHooked = true
        document.fonts.ready.then(() => mounted.forEach(scheduleMeasure))
    }
    for (const { words, lines } of plans) {
        words.forEach((word, i) => {
            if (word.style.getPropertyValue('--line') !== lines[i]) word.style.setProperty('--line', lines[i])
        })
    }
}
function scheduleMeasure(el) {
    pending.add(el)
    if (!frame) frame = requestAnimationFrame(flush)
}

function LineMask({ text }) {
    const ref = useRef(null)
    const str = typeof text === 'string' || typeof text === 'number' ? String(text) : null

    useLayoutEffect(() => {
        const el = ref.current
        if (!el || str === null) return undefined
        // Line delays only matter once the heading reveals (below the fold), so
        // measuring in the next frame never shows a word on the wrong delay.
        const measure = () => scheduleMeasure(el)
        mounted.add(el)
        measure()
        const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure)
        ro?.observe(el)
        return () => {
            mounted.delete(el)
            pending.delete(el)
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

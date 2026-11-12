// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// S6 — the hero name responds to the cursor through Fraunces' weight axis
// (D-031, the one exception to transform/opacity-only motion).
// - Paints statically: it is the LCP element and is never animated in.
// - Fine pointers only, never under reduced motion, armed after load + idle.
// - Letters only get *lighter* near the cursor, inside slots locked to their
//   resting width, so nothing reflows and there is no layout shift.
// - The rAF loop runs only while letters are easing and stops once settled.

import { Fragment, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { hasFinePointer, prefersReducedMotion } from '../../lib/motion'

const REST = 460
const LIGHTEST = 180
const RADIUS = 240 // px of influence around the pointer
const EASE = 0.2

const whenIdle = (fn) => {
    if ('requestIdleCallback' in window) return window.requestIdleCallback(fn, { timeout: 2000 })
    return window.setTimeout(fn, 600)
}

function useWeightAxis(rootRef) {
    useEffect(() => {
        const root = rootRef.current
        if (!root || !hasFinePointer() || prefersReducedMotion()) return undefined

        const area = root.closest('section') || root
        const letters = Array.from(root.querySelectorAll('.hero-name__ch'))
        const cur = letters.map(() => REST)
        const target = letters.map(() => REST)
        const shown = letters.map(() => REST)
        let centres = []
        let frame = 0
        let armed = false
        let disposed = false
        let resizeTimer = 0

        const measure = () => {
            centres = letters.map((el) => {
                const r = el.getBoundingClientRect()
                return [r.left + r.width / 2 + window.scrollX, r.top + r.height / 2 + window.scrollY]
            })
        }

        const unlock = () => {
            letters.forEach((el) => {
                el.style.width = ''
                el.style.fontVariationSettings = ''
            })
        }

        // Lock each letter to its resting width (no visual change: same width).
        const lock = () => {
            unlock()
            const widths = letters.map((el) => el.getBoundingClientRect().width)
            letters.forEach((el, i) => {
                el.style.width = `${widths[i]}px`
                cur[i] = target[i] = shown[i] = REST
            })
            measure()
        }

        const tick = () => {
            let moving = false
            for (let i = 0; i < letters.length; i += 1) {
                const delta = target[i] - cur[i]
                if (Math.abs(delta) < 0.5) cur[i] = target[i]
                else {
                    cur[i] += delta * EASE
                    moving = true
                }
                const w = Math.round(cur[i])
                if (w !== shown[i]) {
                    shown[i] = w
                    letters[i].style.fontVariationSettings = w === REST ? '' : `"wght" ${w}`
                }
            }
            frame = moving ? requestAnimationFrame(tick) : 0
        }
        const kick = () => {
            if (!frame) frame = requestAnimationFrame(tick)
        }

        const onMove = (event) => {
            if (event.pointerType !== 'mouse') return
            const x = event.pageX
            const y = event.pageY
            for (let i = 0; i < letters.length; i += 1) {
                const d = Math.hypot(x - centres[i][0], y - centres[i][1])
                const t = Math.max(0, 1 - d / RADIUS)
                const eased = t * t * (3 - 2 * t)
                target[i] = REST - (REST - LIGHTEST) * eased
            }
            kick()
        }
        const onLeave = () => {
            target.fill(REST)
            kick()
        }
        // Free the slots at once (stale widths would overlap at a new font
        // size), then re-lock once resizing settles.
        const onResize = () => {
            window.clearTimeout(resizeTimer)
            cancelAnimationFrame(frame)
            frame = 0
            unlock()
            resizeTimer = window.setTimeout(lock, 150)
        }

        const arm = () => {
            if (disposed || armed) return
            armed = true
            lock()
            area.addEventListener('pointermove', onMove, { passive: true })
            area.addEventListener('pointerleave', onLeave)
            window.addEventListener('resize', onResize)
        }

        const start = () => {
            const fonts = document.fonts?.ready || Promise.resolve()
            fonts.then(() => whenIdle(arm))
        }
        if (document.readyState === 'complete') start()
        else window.addEventListener('load', start, { once: true })

        return () => {
            disposed = true
            cancelAnimationFrame(frame)
            window.clearTimeout(resizeTimer)
            window.removeEventListener('load', start)
            area.removeEventListener('pointermove', onMove)
            area.removeEventListener('pointerleave', onLeave)
            window.removeEventListener('resize', onResize)
            unlock()
        }
    }, [rootRef])
}

/** The hero name: real text for assistive tech, per-letter slots for S6. */
function HeroName({ id, name }) {
    const ref = useRef(null)
    useWeightAxis(ref)
    const words = name.split(' ')

    return (
        <h1 id={id} className="hero-name">
            <span className="sr-only">{name}</span>
            <span ref={ref} className="hero-name__visual" aria-hidden="true" translate="no">
                {words.map((word, w) => (
                    <Fragment key={word}>
                        <span className="hero-name__word">
                            {Array.from(word).map((ch, i) => (
                                <span key={`${ch}-${i}`} className="hero-name__ch">{ch}</span>
                            ))}
                        </span>
                        {w < words.length - 1 ? ' ' : null}
                    </Fragment>
                ))}
            </span>
        </h1>
    )
}

HeroName.propTypes = {
    id: PropTypes.string,
    name: PropTypes.string.isRequired,
}

export default HeroName

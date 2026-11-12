// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { useEffect } from 'react'
import { SPRING, createSpring2D, hasFinePointer, prefersReducedMotion } from '../lib/motion'

/**
 * Magnetic pull (DESIGN.md buttons: 8–12px, spring). Moves the element toward the
 * pointer while it is over it and springs back on leave. Writes the CSS
 * `translate` property, so it composes with `transform` and `scale` (press).
 * Fine pointers only; off under reduced motion.
 */
export function useMagnetic(ref, { max = 10, strength = 0.35, enabled = true } = {}) {
    useEffect(() => {
        const el = ref.current
        if (!el || !enabled || !hasFinePointer() || prefersReducedMotion()) return undefined

        const spring = createSpring2D((x, y) => {
            el.style.translate = x || y ? `${x.toFixed(2)}px ${y.toFixed(2)}px` : ''
        }, SPRING.magnetic)

        const clamp = (v) => Math.max(-max, Math.min(max, v))
        const onMove = (event) => {
            if (event.pointerType !== 'mouse') return
            const r = el.getBoundingClientRect()
            spring.set(
                clamp((event.clientX - (r.left + r.width / 2)) * strength),
                clamp((event.clientY - (r.top + r.height / 2)) * strength),
            )
        }
        const onLeave = () => spring.set(0, 0)

        el.addEventListener('pointermove', onMove)
        el.addEventListener('pointerleave', onLeave)
        return () => {
            el.removeEventListener('pointermove', onMove)
            el.removeEventListener('pointerleave', onLeave)
            spring.stop()
            el.style.translate = ''
        }
    }, [ref, max, strength, enabled])
}

export default useMagnetic

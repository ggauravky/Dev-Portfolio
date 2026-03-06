// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { useEffect, useRef } from 'react'

/**
 * Cursor Spotlight — a soft radial glow that follows the mouse with smooth
 * lerp (linear-interpolation) lag. Uses RAF + CSS custom properties so it
 * never triggers a React re-render and stays at 60fps.
 * Hidden on touch/mobile devices automatically.
 */
export default function CursorSpotlight() {
    const spotRef = useRef(null)

    useEffect(() => {
        const el = spotRef.current
        if (!el) return

        // Current rendered position (lerp target)
        let cx = window.innerWidth / 2
        let cy = window.innerHeight / 2
        // Raw mouse destination
        let tx = cx
        let ty = cy
        let rafId = null
        let hasMoved = false

        const LERP = 0.1  // 0=no movement, 1=instant snap — 0.1 gives nice lag

        const onMove = (e) => {
            tx = e.clientX
            ty = e.clientY
            if (!hasMoved) {
                hasMoved = true
                // Jump to position on first move so it doesn't slide in from centre
                cx = tx
                cy = ty
                el.style.opacity = '1'
            }
        }

        const tick = () => {
            // Lerp towards target
            cx += (tx - cx) * LERP
            cy += (ty - cy) * LERP

            // translate3d triggers GPU composite layer — no layout thrash
            el.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`
            rafId = requestAnimationFrame(tick)
        }

        const onLeave = () => { el.style.opacity = '0' }
        const onEnter = () => { if (hasMoved) el.style.opacity = '1' }

        window.addEventListener('mousemove', onMove, { passive: true })
        document.documentElement.addEventListener('mouseleave', onLeave)
        document.documentElement.addEventListener('mouseenter', onEnter)
        rafId = requestAnimationFrame(tick)

        return () => {
            window.removeEventListener('mousemove', onMove)
            document.documentElement.removeEventListener('mouseleave', onLeave)
            document.documentElement.removeEventListener('mouseenter', onEnter)
            cancelAnimationFrame(rafId)
        }
    }, [])

    return (
        <div
            ref={spotRef}
            aria-hidden="true"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: 900,
                height: 900,
                borderRadius: '50%',
                pointerEvents: 'none',
                zIndex: 0,
                opacity: 0,
                transition: 'opacity 0.6s ease',
                background: 'radial-gradient(circle at center, rgba(99,102,241,0.18) 0%, rgba(139,92,246,0.14) 28%, rgba(6,182,212,0.08) 55%, transparent 72%)',
                // Only show on non-touch devices
                // The @media query equivalent — we just hide via JS on touch at mount
            }}
            className="hidden-on-touch"
        />
    )
}

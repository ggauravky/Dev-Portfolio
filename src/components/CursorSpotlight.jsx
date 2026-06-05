// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { useEffect, useRef } from 'react'

/**
 * Cursor Spotlight — an interactive cursor experience.
 * Features:
 * 1. An ambient background glow (zIndex 0) that illuminates cards from behind.
 * 2. An editorial foreground pointer ring (zIndex 9999, mix-blend-mode difference)
 *    that inverts text colors on hover.
 */
export default function CursorSpotlight() {
    const glowRef = useRef(null)
    const ringRef = useRef(null)
    const dotRef = useRef(null)

    useEffect(() => {
        const glow = glowRef.current
        const ring = ringRef.current
        const dot = dotRef.current
        if (!glow || !ring || !dot) return

        // Target coordinates
        let tx = window.innerWidth / 2
        let ty = window.innerHeight / 2

        // Rendered coordinates (lerped)
        let gx = tx, gy = ty // Glow
        let rx = tx, ry = ty // Ring
        let dx = tx, dy = ty // Dot

        let rafId = null
        let hasMoved = false

        const LERP_GLOW = 0.05
        const LERP_RING = 0.08
        const LERP_DOT = 0.25

        const onMove = (e) => {
            tx = e.clientX
            ty = e.clientY

            if (!hasMoved) {
                hasMoved = true
                gx = rx = dx = tx
                gy = ry = dy = ty
                glow.style.opacity = '1'
                ring.style.opacity = '1'
                dot.style.opacity = '1'
            }
        }

        const tick = () => {
            if (hasMoved) {
                // Lerp each element at different rates
                gx += (tx - gx) * LERP_GLOW
                gy += (ty - gy) * LERP_GLOW

                rx += (tx - rx) * LERP_RING
                ry += (ty - ry) * LERP_RING

                dx += (tx - dx) * LERP_DOT
                dy += (ty - dy) * LERP_DOT

                glow.style.transform = `translate3d(${gx}px, ${gy}px, 0) translate(-50%, -50%)`
                ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`
                dot.style.transform = `translate3d(${dx}px, ${dy}px, 0) translate(-50%, -50%)`
            }

            rafId = requestAnimationFrame(tick)
        }

        const onLeave = () => {
            glow.style.opacity = '0'
            ring.style.opacity = '0'
            dot.style.opacity = '0'
        }

        const onEnter = () => {
            if (hasMoved) {
                glow.style.opacity = '1'
                ring.style.opacity = '1'
                dot.style.opacity = '1'
            }
        }

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
        <>
            {/* Ambient Background Glow (Z-Index 0) */}
            <div
                ref={glowRef}
                aria-hidden="true"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: 700,
                    height: 700,
                    borderRadius: '50%',
                    pointerEvents: 'none',
                    zIndex: 0,
                    opacity: 0,
                    transition: 'opacity 0.8s ease',
                    background: 'radial-gradient(circle at center, rgba(197,248,42,0.1) 0%, rgba(255,93,0,0.05) 35%, transparent 70%)',
                }}
                className="hidden-on-touch"
            />

            {/* Foreground Inverse Ring (Z-Index 9999) */}
            <div
                ref={ringRef}
                aria-hidden="true"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    border: '1px solid #c5f82a',
                    pointerEvents: 'none',
                    zIndex: 9999,
                    opacity: 0,
                    mixBlendMode: 'difference',
                    transition: 'opacity 0.4s ease',
                }}
                className="hidden-on-touch"
            />

            {/* Foreground Inverse Dot (Z-Index 9999) */}
            <div
                ref={dotRef}
                aria-hidden="true"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: '#c5f82a',
                    pointerEvents: 'none',
                    zIndex: 9999,
                    opacity: 0,
                    mixBlendMode: 'difference',
                    transition: 'opacity 0.2s ease',
                }}
                className="hidden-on-touch"
            />
        </>
    )
}

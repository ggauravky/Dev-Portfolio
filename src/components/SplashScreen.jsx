// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Premium Opening Sequence — Single-logo portal animation
//
// Architecture:
//   One motion.span lives in a position:fixed portal.
//   Phase 1 — Fade in at screen center (large).
//   Phase 2 — Measure navLogoRef position, animate x/y/scale to it.
//   Phase 3 — Fade portal logo out; navbar logo (same position) becomes visible.
//
//   There is never more than ONE visible logo node.
//   No layoutId. No crossfade. No swap.

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import PropTypes from 'prop-types'

// ── Timing ──────────────────────────────────────────────────────────────────
const PRESENT_MS  = 400   // hold at center (incl. 250ms fade-in + ~150ms still)
const TRAVEL_MS   = 480   // logo travels from center to navbar
const HANDOFF_MS  = 60    // pause after arrival before fading out
const FADE_MS     = 220   // portal logo fade-out (must be < App.jsx onDone delay)
const FALLBACK_MS = 3500  // hard safety timeout

// Precision deceleration — no bounce, no overshoot
const TRAVEL_EASE = [0.76, 0, 0.24, 1]

// ── Session guard ────────────────────────────────────────────────────────────
const KEY = 'gky-splash-shown'
const hasSeenSplash = () => { try { return !!sessionStorage.getItem(KEY) } catch { return false } }
const markSeenSplash = () => { try { sessionStorage.setItem(KEY, '1') } catch {} }

// ── Wordmark style ───────────────────────────────────────────────────────────
// Must produce identical typography rendering to the Navbar logo span:
//   font-display (Plus Jakarta Sans), font-extrabold (800), uppercase, tracking-wider (0.05em)
// Sizing: fluid clamp(42px, 10vw, 220px) occupying ~42-50% viewport width across screen sizes
const WORDMARK_STYLE = {
    fontFamily: 'var(--font-display, "Plus Jakarta Sans", "Inter", system-ui, sans-serif)',
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    paddingLeft: '0.05em', // Optical compensation for trailing letter-spacing
    color: '#ffffff',
    lineHeight: 1,
    userSelect: 'none',
    whiteSpace: 'nowrap',
    fontSize: 'clamp(42px, 10vw, 220px)',
    display: 'block',
}

// ── Component ────────────────────────────────────────────────────────────────
export default function SplashScreen({ onDone, navLogoRef }) {
    const reducedMotion = useRef(
        typeof window !== 'undefined'
            ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
            : false
    ).current

    // Skip on reduced-motion or if already seen this session
    const skip = reducedMotion || hasSeenSplash()

    const logoRef  = useRef(null)
    const doneRef  = useRef(false)

    const [mounted, setMounted] = useState(!skip)

    // Overlay opacity — 1 = solid obsidian, 0 = transparent
    const [overlayOpacity, setOverlayOpacity] = useState(1)

    // All logo animation values driven by state → Framer Motion animate prop
    const [logoAnimate, setLogoAnimate] = useState({
        opacity: 0,
        filter: 'blur(10px)',
        x: 0,
        y: 0,
        scale: 1,
    })

    const callDone = useCallback(() => {
        if (!doneRef.current) {
            doneRef.current = true
            markSeenSplash()
            onDone()
        }
    }, [onDone])

    useEffect(() => {
        if (skip) { callDone(); return }

        const ids = []
        const schedule = (fn, ms) => { const id = setTimeout(fn, ms); ids.push(id) }

        // Hard fallback — guarantees site is usable no matter what
        schedule(callDone, FALLBACK_MS)

        // ── Phase 1: Fade logo in at screen center ──
        schedule(() => {
            setLogoAnimate(p => ({ ...p, opacity: 1, filter: 'blur(0px)' }))
        }, 16)

        // ── Phase 2: Measure navbar logo position, begin travel ──
        schedule(() => {
            const el  = logoRef.current
            const nav = navLogoRef?.current

            if (!el || !nav) { callDone(); return }

            const sr = el.getBoundingClientRect()
            const nr = nav.getBoundingClientRect()

            // Bail if elements have no dimensions (display:none, not mounted, etc.)
            if (!sr.width || !nr.width) { callDone(); return }

            // Transform: move splash logo center to navbar logo center, scale to match
            const tx    = (nr.left + nr.width  / 2) - (sr.left + sr.width  / 2)
            const ty    = (nr.top  + nr.height / 2) - (sr.top  + sr.height / 2)
            const scale = nr.width / sr.width

            setOverlayOpacity(0)                              // Start revealing the page
            setLogoAnimate(p => ({ ...p, x: tx, y: ty, scale }))  // Logo starts traveling
        }, PRESENT_MS)

        // ── Phase 3: Handoff — fade portal logo, signal App to show navbar ──
        schedule(() => {
            setLogoAnimate(p => ({ ...p, opacity: 0 }))
            callDone()  // App.jsx: navReady=true, then openingState='ready' after 300ms

            // Unmount portal after fade completes (FADE_MS covers opacity animation)
            schedule(() => setMounted(false), FADE_MS + 16)
        }, PRESENT_MS + TRAVEL_MS + HANDOFF_MS)

        return () => ids.forEach(clearTimeout)
    }, [skip, navLogoRef, callDone])

    if (!mounted) return null

    return (
        <>
            {/* ── Dark overlay — fades out while logo travels ── */}
            <motion.div
                aria-hidden="true"
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 9999,
                    background: '#080a0e',
                    pointerEvents: 'none',
                }}
                animate={{ opacity: overlayOpacity }}
                transition={{ duration: 0.38, ease: 'easeInOut' }}
            />

            {/* ── Single portal logo — the only visible identity element ── */}
            <div
                aria-hidden="true"
                style={{
                    position: 'fixed',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10000,
                    pointerEvents: 'none',
                }}
            >
                <motion.span
                    ref={logoRef}
                    style={WORDMARK_STYLE}
                    animate={logoAnimate}
                    transition={{
                        // Fade in / fade out
                        opacity: { duration: 0.2, ease: 'easeOut' },
                        // Blur removal on entry
                        filter:  { duration: 0.3, ease: 'easeOut' },
                        // Precision travel to navbar
                        x:     { duration: TRAVEL_MS / 1000, ease: TRAVEL_EASE },
                        y:     { duration: TRAVEL_MS / 1000, ease: TRAVEL_EASE },
                        scale: { duration: TRAVEL_MS / 1000, ease: TRAVEL_EASE },
                    }}
                >
                    Gaurav
                </motion.span>
            </div>
        </>
    )
}

SplashScreen.propTypes = {
    onDone:     PropTypes.func.isRequired,
    navLogoRef: PropTypes.shape({ current: PropTypes.object }),
}

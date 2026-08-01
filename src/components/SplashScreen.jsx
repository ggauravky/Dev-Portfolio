// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Premium Opening Sequence — Typography Construction Architecture
//
// Sequence Overview:
//   0–250ms:   Silence & Recognition — Brand wordmark appears at generous tracking (0.30em).
//   250–850ms: Construction — Letters glide together; tracking compresses from 0.30em -> 0.05em; opacity -> 1.0; y -> 0.
//   850–1050ms: Registration Pause — Assembled wordmark rests in stillness.
//   1050ms+:   Travel & Handoff — Wordmark translates & scales to target navbar coordinates.

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import PropTypes from 'prop-types'

// ── Timing Windows (ms) ───────────────────────────────────────────────────────
const T_INITIAL_STILLNESS = 250   // 0-250ms: Stillness at wide tracking
const T_CONSTRUCTION_DUR  = 600   // 250-850ms: Assembly (tracking compression)
const T_REGISTRATION_PAUSE= 200   // 850-1050ms: Pause before departure
const T_START_TRAVEL      = T_INITIAL_STILLNESS + T_CONSTRUCTION_DUR + T_REGISTRATION_PAUSE // 1050ms

const TRAVEL_MS   = 480   // Travel duration to navbar
const HANDOFF_MS  = 60    // Pause after docking before portal fade-out
const FADE_MS     = 220   // Portal logo fade-out
const FALLBACK_MS = 4000  // Safety fallback

// ── Easings ───────────────────────────────────────────────────────────────────
const ASSEMBLE_EASE = [0.22, 1, 0.36, 1]  // Smooth precision deceleration for assembly
const TRAVEL_EASE   = [0.76, 0, 0.24, 1]  // Physical momentum for travel to navbar

// ── Session Guard ─────────────────────────────────────────────────────────────
const KEY = 'gky-splash-shown'
const hasSeenSplash = () => { try { return !!sessionStorage.getItem(KEY) } catch { return false } }
const markSeenSplash = () => { try { sessionStorage.setItem(KEY, '1') } catch {} }

// ── Base Wordmark Style ───────────────────────────────────────────────────────
// Must produce identical typography rendering to the Navbar logo span:
//   font-display (Plus Jakarta Sans), font-extrabold (800), uppercase
// Sizing: fluid clamp(42px, 10vw, 220px) occupying ~42-48% viewport width
const WORDMARK_BASE_STYLE = {
    fontFamily: 'var(--font-display, "Plus Jakarta Sans", "Inter", system-ui, sans-serif)',
    fontWeight: 800,
    textTransform: 'uppercase',
    color: '#ffffff',
    lineHeight: 1,
    userSelect: 'none',
    whiteSpace: 'nowrap',
    fontSize: 'clamp(42px, 10vw, 220px)',
    display: 'block',
}

export default function SplashScreen({ onDone, navLogoRef }) {
    const reducedMotion = useRef(
        typeof window !== 'undefined'
            ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
            : false
    ).current

    const skip = reducedMotion || hasSeenSplash()

    const logoRef = useRef(null)
    const doneRef = useRef(false)

    const [mounted, setMounted] = useState(!skip)
    const [overlayOpacity, setOverlayOpacity] = useState(1)

    // Initial state: wide tracking (0.30em), slightly below baseline (y: 3), 0.70 opacity
    const [logoAnimate, setLogoAnimate] = useState({
        opacity: 0.7,
        letterSpacing: '0.30em',
        paddingLeft: '0.30em', // Keeps optical center aligned during letterSpacing animation
        y: 3,
        x: 0,
        scale: 1,
    })

    const [logoTransition, setLogoTransition] = useState({
        duration: 0,
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

        schedule(callDone, FALLBACK_MS)

        // ── Phase 1 (250ms): Begin Construction Assembly ──
        // Letters glide together: tracking 0.30em -> 0.05em, opacity 0.7 -> 1.0, y 3 -> 0
        schedule(() => {
            setLogoTransition({
                letterSpacing: { duration: T_CONSTRUCTION_DUR / 1000, ease: ASSEMBLE_EASE },
                paddingLeft:   { duration: T_CONSTRUCTION_DUR / 1000, ease: ASSEMBLE_EASE },
                opacity:       { duration: T_CONSTRUCTION_DUR / 1000, ease: ASSEMBLE_EASE },
                y:             { duration: T_CONSTRUCTION_DUR / 1000, ease: ASSEMBLE_EASE },
            })
            setLogoAnimate(p => ({
                ...p,
                opacity: 1,
                letterSpacing: '0.05em',
                paddingLeft: '0.05em',
                y: 0,
            }))
        }, T_INITIAL_STILLNESS)

        // ── Phase 2 (1050ms): Measure & Begin Travel to Navbar ──
        schedule(() => {
            const el  = logoRef.current
            const nav = navLogoRef?.current

            if (!el || !nav) { callDone(); return }

            const sr = el.getBoundingClientRect()
            const nr = nav.getBoundingClientRect()

            if (!sr.width || !nr.width) { callDone(); return }

            const tx    = (nr.left + nr.width  / 2) - (sr.left + sr.width  / 2)
            const ty    = (nr.top  + nr.height / 2) - (sr.top  + sr.height / 2)
            const scale = nr.width / sr.width

            setOverlayOpacity(0)

            setLogoTransition({
                x:     { duration: TRAVEL_MS / 1000, ease: TRAVEL_EASE },
                y:     { duration: TRAVEL_MS / 1000, ease: TRAVEL_EASE },
                scale: { duration: TRAVEL_MS / 1000, ease: TRAVEL_EASE },
            })

            setLogoAnimate(p => ({
                ...p,
                x: tx,
                y: ty,
                scale,
            }))
        }, T_START_TRAVEL)

        // ── Phase 3 (1050 + 480 + 60 = 1590ms): Docked Handoff ──
        schedule(() => {
            setLogoTransition({
                opacity: { duration: FADE_MS / 1000, ease: 'easeOut' },
            })
            setLogoAnimate(p => ({ ...p, opacity: 0 }))
            callDone()

            schedule(() => setMounted(false), FADE_MS + 16)
        }, T_START_TRAVEL + TRAVEL_MS + HANDOFF_MS)

        return () => ids.forEach(clearTimeout)
    }, [skip, navLogoRef, callDone])

    if (!mounted) return null

    return (
        <>
            {/* ── Dark obsidian backdrop — fades out during travel phase ── */}
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

            {/* ── Single identity wordmark portal ── */}
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
                    style={WORDMARK_BASE_STYLE}
                    animate={logoAnimate}
                    transition={logoTransition}
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

// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// Motion tokens — the single source (DESIGN.md "Buttons and micro-interactions",
// D-030). CSS mirrors these as --dur-fast/--dur-base/--dur-slow and --ease-out in
// src/index.css; keep both in sync. Animate transform and opacity only (the S6
// hero-name axis is the one exception, D-031) and honour reduced motion.

import { useEffect, useState } from 'react'

/** Durations in ms. */
export const DURATION = { fast: 160, base: 280, slow: 520 }

/** Durations in seconds, for framer-motion `transition.duration`. */
export const DURATION_S = { fast: 0.16, base: 0.28, slow: 0.52 }

/** The one easing curve. */
export const EASE = [0.22, 1, 0.36, 1]
export const EASE_CSS = 'cubic-bezier(.22,1,.36,1)'

/**
 * Spring presets. framer-motion objects plus the same numbers for the tiny
 * rAF spring below (stiffness / damping / mass).
 * - snappy: active indicators (the dock uses DOCK_BOUNCE in CSS instead)
 * - soft: hover previews, followers
 * - magnetic: buttons / cursor pull, settles fast with a little give
 */
export const SPRING = {
    snappy: { type: 'spring', stiffness: 520, damping: 42, mass: 0.9 },
    soft: { type: 'spring', stiffness: 260, damping: 30, mass: 1 },
    magnetic: { type: 'spring', stiffness: 340, damping: 22, mass: 0.6 },
}

/**
 * DOCK ONLY: the one deliberate overshoot in the system (D-132, DESIGN.md "Motion
 * tokens"). The S1 dock's morph and hover highlight ease their transform with it,
 * never their opacity, which keeps EASE_CSS. Nothing else may use it.
 * Generated with Jake Archibald's linear() easing generator
 * (linear-easing-generator.netlify.app), "Spring" preset: mass 1, stiffness 260,
 * damping 22, velocity 0 (damping ratio 0.68, peak 1.053); simplify 0.0017,
 * round 3. The tool's settle time is 667 ms; the dock plays it in 380 ms, tuned by
 * eye. Browsers without `linear()` get a slight-overshoot cubic-bezier.
 * CSS mirrors this as --ease-dock / --dur-dock, scoped to `.dock-cluster` in
 * src/components/chrome/Dock.css so no other selector can reach it.
 */
export const DOCK_BOUNCE = {
    duration: 380,
    linear: 'linear(0, 0.007, 0.028 2.3%, 0.113, 0.225 7.6%, 0.602 15.4%, 0.71, 0.799, 0.873, 0.934, 0.98 28.1%, 1.015 30.9%, 1.033, 1.045 35.2%, 1.051, 1.053 40.3%, 1.047 45.2%, 1.013 59.1%, 1.002 67.1%, 0.997 78%, 0.999)',
    fallback: 'cubic-bezier(.3,1.25,.6,1)',
}

const REDUCED_QUERY = '(prefers-reduced-motion: reduce)'
const FINE_QUERY = '(hover: hover) and (pointer: fine)'

const canMatchMedia = () => typeof window !== 'undefined' && typeof window.matchMedia === 'function'

const matches = (query) => canMatchMedia() && window.matchMedia(query).matches

export const prefersReducedMotion = () => matches(REDUCED_QUERY)
export const hasFinePointer = () => matches(FINE_QUERY)

function useMediaQuery(query) {
    const [value, setValue] = useState(() => matches(query))
    useEffect(() => {
        if (!canMatchMedia()) return undefined
        const mql = window.matchMedia(query)
        const update = () => setValue(mql.matches)
        update()
        mql.addEventListener('change', update)
        return () => mql.removeEventListener('change', update)
    }, [query])
    return value
}

/** Live `prefers-reduced-motion: reduce`. */
export const useReducedMotion = () => useMediaQuery(REDUCED_QUERY)

/** Live "mouse or trackpad" (hover + fine pointer). */
export const useFinePointer = () => useMediaQuery(FINE_QUERY)

/**
 * A tiny 2D spring integrator for pointer-driven transforms (magnetic buttons,
 * cursor). Framer-free, so components on every page don't pull framer-motion in.
 * `onUpdate(x, y)` runs inside rAF; the loop stops itself once settled.
 */
export function createSpring2D(onUpdate, { stiffness, damping, mass } = SPRING.magnetic) {
    let x = 0
    let y = 0
    let vx = 0
    let vy = 0
    let tx = 0
    let ty = 0
    let frame = 0
    let last = 0

    const step = (now) => {
        const dt = Math.min(0.032, (now - (last || now)) / 1000) || 1 / 60
        last = now
        const ax = (-stiffness * (x - tx) - damping * vx) / mass
        const ay = (-stiffness * (y - ty) - damping * vy) / mass
        vx += ax * dt
        vy += ay * dt
        x += vx * dt
        y += vy * dt
        const settled = Math.abs(x - tx) < 0.05 && Math.abs(y - ty) < 0.05 && Math.abs(vx) < 0.05 && Math.abs(vy) < 0.05
        if (settled) {
            x = tx
            y = ty
            vx = 0
            vy = 0
        }
        onUpdate(x, y)
        frame = settled ? 0 : requestAnimationFrame(step)
    }

    return {
        set(nx, ny) {
            tx = nx
            ty = ny
            if (!frame) {
                last = 0
                frame = requestAnimationFrame(step)
            }
        },
        jump(nx, ny) {
            x = tx = nx
            y = ty = ny
            vx = vy = 0
            onUpdate(x, y)
        },
        stop() {
            cancelAnimationFrame(frame)
            frame = 0
        },
    }
}

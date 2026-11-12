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
 * - snappy: dock morph, active indicators
 * - soft: hover previews, followers
 * - magnetic: buttons / cursor pull, settles fast with a little give
 */
export const SPRING = {
    snappy: { type: 'spring', stiffness: 520, damping: 42, mass: 0.9 },
    soft: { type: 'spring', stiffness: 260, damping: 30, mass: 1 },
    magnetic: { type: 'spring', stiffness: 340, damping: 22, mass: 0.6 },
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

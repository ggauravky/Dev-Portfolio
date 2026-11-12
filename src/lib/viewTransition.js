// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// S7 shared-element navigation (row → case study). Progressive enhancement only
// (DESIGN.md "Known tensions"): the View Transitions API morphs the named
// elements; without it, or under reduced motion, the caller's <Link> navigates
// instantly. The route wipe skips a navigation while one is in flight.

import { flushSync } from 'react-dom'
import { prefersReducedMotion } from './motion'
import { ProjectDetail } from './routeChunks'

export const VT_TITLE = 'project-title'
export const VT_MEDIA = 'project-media'

// The route's own loader, so a preloaded case study renders without suspending.
const loadCaseStudy = () => ProjectDetail.preload()

/** Warm the case-study chunk (row hover/focus), so the morph doesn't wait on it. */
export const preloadCaseStudy = () => {
    loadCaseStudy().catch(() => {})
}

export const canViewTransition = () =>
    typeof document !== 'undefined'
    && typeof document.startViewTransition === 'function'
    && !prefersReducedMotion()

/** A plain left click without modifiers: the only click we take over. */
export const isPlainClick = (event) =>
    !event.defaultPrevented && event.button === 0
    && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey

// True only while a shared-element navigation is in flight. Not history state:
// that would survive reload/Back and wrongly skip the route wipe later.
let inFlight = false
export const isViewTransitionNavigation = () => inFlight

const READY = '[data-vt-ready], .case--missing'

// Wait (≤ 800 ms) for the new page to render a *new* title (not the one being
// left, case → next case); the lazy route may suspend once even when its chunk
// is cached. Timers, not rAF: rendering is paused during the update callback.
function waitForNew(previous, timeout = 800) {
    return new Promise((resolve) => {
        const start = performance.now()
        const tick = () => {
            const el = document.querySelector(READY)
            if ((el && el !== previous) || performance.now() - start > timeout) resolve()
            else window.setTimeout(tick, 16)
        }
        tick()
    })
}

/**
 * Navigate to `to` inside a view transition. `shared` is a list of
 * [element, name] pairs to morph; the destination names its own elements.
 */
export async function navigateWithTransition(navigate, to, shared = []) {
    try {
        await loadCaseStudy()
    } catch {
        // The route's own lazy import will retry; navigate anyway.
    }

    // The case study names its own title/frontispiece in CSS; `vt-leaving` turns
    // those names off while the old page is captured (no duplicate names when
    // leaving one case study for the next).
    const root = document.documentElement
    const named = shared.filter(([el]) => el)
    root.classList.add('vt-leaving')
    named.forEach(([el, name]) => { el.style.viewTransitionName = name })

    const previous = document.querySelector(READY)
    inFlight = true
    const transition = document.startViewTransition(async () => {
        root.classList.remove('vt-leaving')
        named.forEach(([el]) => { el.style.viewTransitionName = '' })
        flushSync(() => navigate(to))
        await waitForNew(previous)
    })

    transition.finished.catch(() => {}).finally(() => {
        inFlight = false
        root.classList.remove('vt-leaving')
        named.forEach(([el]) => { if (el.isConnected) el.style.viewTransitionName = '' })
    })
}

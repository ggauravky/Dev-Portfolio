// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// Reveal — the one scroll reveal (DESIGN.md "Reveal rules", replaces ScrollReveal).
// - Content is visible by default. CSS hides a [data-reveal] element only while
//   <html> has .reveal-armed and the element lacks [data-revealed] (src/index.css).
//   An attribute, not a class: React rewrites className on re-render.
// - Armed only when IntersectionObserver exists and reduced motion is off.
// - Elements already on screen (or above it) at mount are revealed before paint.
// - Fail-safes: a scroll check reveals anything at or above the viewport bottom
//   (covers jumps past an element that the observer never reports), and if the
//   observer never calls back the whole system disarms.

import { createElement, useLayoutEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { prefersReducedMotion } from '../lib/motion'

const ARMED_CLASS = 'reveal-armed'
const WATCHDOG_MS = 1500

const pending = new Set()
let observer = null
let observerAlive = false
let armed = false
let scrollFrame = 0

function reveal(el) {
    pending.delete(el)
    observer?.unobserve(el)
    el.dataset.revealed = ''
}

function disarm() {
    armed = false
    document.documentElement.classList.remove(ARMED_CLASS)
    pending.forEach((el) => { el.dataset.revealed = '' })
    pending.clear()
    observer?.disconnect()
    observer = null
    window.removeEventListener('scroll', onScroll)
}

// Reveal anything whose top has reached the viewport's bottom edge (including
// elements scrolled past entirely).
function sweep() {
    scrollFrame = 0
    const limit = window.innerHeight
    pending.forEach((el) => {
        if (el.getBoundingClientRect().top < limit) reveal(el)
    })
}

function onScroll() {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(sweep)
}

function arm() {
    if (armed) return true
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined' || prefersReducedMotion()) {
        return false
    }
    observer = new IntersectionObserver((entries) => {
        observerAlive = true
        entries.forEach((entry) => {
            if (entry.isIntersecting) reveal(entry.target)
        })
    }, { rootMargin: '0px 0px 20% 0px', threshold: 0 })
    armed = true
    document.documentElement.classList.add(ARMED_CLASS)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.setTimeout(() => {
        if (!observerAlive) disarm()
    }, WATCHDOG_MS)
    return true
}

// Scroll-driven reveals (src/index.css) animate by position, so anything already
// on screen when a page mounts would sit part-faded until the reader scrolls.
// Mark those as static (fully shown, never animated); everything below the fold
// keeps its reveal. Rows are marked once ("seen"), so a later sweep can never
// freeze a row mid-animation.
const ROW_SELECTOR = 'main :is(.pg-row, .pj-row, .work-row, .note-row, .journey-row, .jr-entry)'

// Every Reveal mounted in one React commit is settled together in a microtask
// (after the commit's layout effects, still before paint): all rect reads
// first, then all data-attribute writes, so a page pays one layout instead of
// one forced reflow per element (PSI "Forced reflow", D-126).
const mountQueue = new Set()
let mountScheduled = false

function settleMounted() {
    mountScheduled = false
    const els = [...mountQueue]
    mountQueue.clear()
    if (!els.length) return
    const isArmed = arm()
    const limit = window.innerHeight

    // Reads.
    const rows = isArmed
        ? [...document.querySelectorAll(ROW_SELECTOR)].filter((row) => !('revealSeen' in row.dataset))
        : []
    const rowOnScreen = rows.map((row) => row.getBoundingClientRect().top < limit)
    const elOnScreen = els.map((el) => !isArmed || el.getBoundingClientRect().top < limit)

    // Writes.
    rows.forEach((row, i) => {
        row.dataset.revealSeen = ''
        if (rowOnScreen[i]) row.dataset.revealStatic = ''
    })
    els.forEach((el, i) => {
        if (elOnScreen[i]) {
            el.dataset.revealed = ''
            el.dataset.revealStatic = ''
            return
        }
        pending.add(el)
        observer.observe(el)
    })
}

function Reveal({ as = 'div', delay = 0, className = '', style, children, ...rest }) {
    const ref = useRef(null)

    useLayoutEffect(() => {
        const el = ref.current
        if (!el) return undefined
        mountQueue.add(el)
        if (!mountScheduled) {
            mountScheduled = true
            queueMicrotask(settleMounted)
        }
        return () => {
            mountQueue.delete(el)
            pending.delete(el)
            observer?.unobserve(el)
        }
    }, [])

    const transitionDelay = delay ? `${Math.min(delay, 160)}ms` : undefined

    return createElement(
        as,
        {
            ref,
            'data-reveal': '',
            className: className || undefined,
            style: transitionDelay ? { ...style, transitionDelay } : style,
            ...rest,
        },
        children,
    )
}

Reveal.propTypes = {
    as: PropTypes.elementType,
    delay: PropTypes.number,
    className: PropTypes.string,
    style: PropTypes.object,
    children: PropTypes.node,
}

export default Reveal

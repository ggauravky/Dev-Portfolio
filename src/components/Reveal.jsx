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

function freezeOnScreenRows() {
    const limit = window.innerHeight
    document.querySelectorAll(ROW_SELECTOR).forEach((row) => {
        if ('revealSeen' in row.dataset) return
        row.dataset.revealSeen = ''
        if (row.getBoundingClientRect().top < limit) row.dataset.revealStatic = ''
    })
}

function Reveal({ as = 'div', delay = 0, className = '', style, children, ...rest }) {
    const ref = useRef(null)

    useLayoutEffect(() => {
        const el = ref.current
        if (!el) return undefined
        const armed = arm()
        if (armed) freezeOnScreenRows()
        if (!armed || el.getBoundingClientRect().top < window.innerHeight) {
            el.dataset.revealed = ''
            el.dataset.revealStatic = ''
            return undefined
        }
        pending.add(el)
        observer.observe(el)
        return () => {
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

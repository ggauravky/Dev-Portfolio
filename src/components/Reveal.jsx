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

function Reveal({ as = 'div', delay = 0, className = '', style, children, ...rest }) {
    const ref = useRef(null)

    useLayoutEffect(() => {
        const el = ref.current
        if (!el) return undefined
        if (!arm() || el.getBoundingClientRect().top < window.innerHeight) {
            el.dataset.revealed = ''
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

// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// Route transition (DESIGN.md): one overlay element carrying the wordmark that
// clip-path-wipes off the new page (≤ 520 ms). Replaces PageTransition. The new
// route renders immediately underneath; the overlay never takes the pointer and
// is skipped on first load, hash-only changes and under reduced motion.

import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { prefersReducedMotion } from '../../lib/motion'
import { isViewTransitionNavigation } from '../../lib/viewTransition'
import './RouteWipe.css'

function RouteWipe() {
    const { pathname } = useLocation()
    const previous = useRef(pathname)
    const [run, setRun] = useState(0)

    useEffect(() => {
        if (previous.current === pathname) return
        previous.current = pathname
        // A shared-element view transition (S7) is the route change itself; a
        // wipe over it would hide the morph.
        if (!prefersReducedMotion() && !isViewTransitionNavigation()) setRun((n) => n + 1)
    }, [pathname])

    if (!run) return null

    return (
        <div key={run} className="route-wipe" aria-hidden="true" onAnimationEnd={(event) => {
            if (event.target === event.currentTarget) setRun(0)
        }}>
            <span className="route-wipe__mark">Gaurav Kumar Yadav</span>
        </div>
    )
}

export default RouteWipe

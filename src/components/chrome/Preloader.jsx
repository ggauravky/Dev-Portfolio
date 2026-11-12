// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// Preloader (DESIGN.md): first visit per session only, ≤ 1.4 s in total, the name
// and a counter, skippable (button, Esc, click), and never shown under reduced
// motion. The page renders underneath the whole time; the overlay animates only
// transform/opacity, so it never holds back the page itself.

import { useCallback, useEffect, useRef, useState } from 'react'
import { DURATION, prefersReducedMotion } from '../../lib/motion'
import './Preloader.css'

const STORAGE_KEY = 'gky-splash-shown'
const COUNT_MS = 880 // + DURATION.slow exit = 1.4 s

function shouldShow() {
    if (typeof window === 'undefined' || prefersReducedMotion()) return false
    try {
        if (sessionStorage.getItem(STORAGE_KEY)) return false
        sessionStorage.setItem(STORAGE_KEY, '1')
    } catch {
        return false
    }
    return true
}

// Decided once per page load (not in render: StrictMode would run it twice).
const SHOW_ON_LOAD = shouldShow()

function Preloader() {
    const [phase, setPhase] = useState(SHOW_ON_LOAD ? 'count' : 'done')
    const countRef = useRef(null)
    const barRef = useRef(null)

    const exit = useCallback(() => {
        setPhase((current) => (current === 'count' ? 'exit' : current))
    }, [])

    // Counter + hairline progress, written straight to the DOM.
    useEffect(() => {
        if (phase !== 'count') return undefined
        let frame = 0
        const start = performance.now()
        const tick = (now) => {
            const t = Math.min(1, (now - start) / COUNT_MS)
            const eased = 1 - (1 - t) ** 3
            if (countRef.current) countRef.current.textContent = String(Math.round(eased * 100)).padStart(3, '0')
            if (barRef.current) barRef.current.style.transform = `scaleX(${eased})`
            if (t < 1) frame = requestAnimationFrame(tick)
            else exit()
        }
        frame = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(frame)
    }, [phase, exit])

    useEffect(() => {
        if (phase !== 'exit') return undefined
        const timer = window.setTimeout(() => setPhase('done'), DURATION.slow)
        return () => window.clearTimeout(timer)
    }, [phase])

    useEffect(() => {
        if (phase !== 'count') return undefined
        const onKey = (event) => {
            if (event.key === 'Escape') exit()
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [phase, exit])

    if (phase === 'done') return null

    return (
        <div className={`preloader ${phase === 'exit' ? 'is-exiting' : ''}`} onClick={exit} role="presentation">
            <div className="preloader__inner">
                <p className="preloader__name">Gaurav Kumar Yadav</p>
                <div className="preloader__meta">
                    <span ref={countRef} className="preloader__count" aria-hidden="true">000</span>
                    <button type="button" className="preloader__skip" onClick={exit}>
                        Skip intro
                    </button>
                </div>
                <span className="preloader__rule" aria-hidden="true">
                    <span ref={barRef} className="preloader__bar" />
                </span>
            </div>
        </div>
    )
}

export default Preloader

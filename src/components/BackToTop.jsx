// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { useState, useEffect } from 'react'
import './BackToTop.css'

const RADIUS = 24
const CIRCUMFERENCE = 2 * Math.PI * RADIUS  // ≈ 150.8

function BackToTop() {
    const [isVisible, setIsVisible] = useState(false)
    const [scrollPct, setScrollPct] = useState(0)

    useEffect(() => {
        const onScroll = () => {
            const scrollY = window.scrollY || window.pageYOffset
            const docH = document.documentElement.scrollHeight - document.documentElement.clientHeight
            const pct = docH > 0 ? Math.min(scrollY / docH, 1) : 0
            setScrollPct(pct)
            setIsVisible(scrollY > 300)
        }

        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

    // offset: full circumference (empty) → 0 (full ring)
    const dashOffset = CIRCUMFERENCE * (1 - scrollPct)

    if (!isVisible) return null

    return (
        <button
            onClick={scrollToTop}
            className="back-to-top-button"
            aria-label={`Back to top — ${Math.round(scrollPct * 100)}% scrolled`}
        >
            {/* Circular progress ring */}
            <svg className="btt-ring" viewBox="0 0 56 56" aria-hidden="true">
                {/* Track */}
                <circle
                    cx="28" cy="28" r={RADIUS}
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="2.5"
                />
                {/* Progress */}
                <circle
                    cx="28" cy="28" r={RADIUS}
                    fill="none"
                    stroke="url(#btt-grad)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={dashOffset}
                    style={{ transition: 'stroke-dashoffset 0.15s linear' }}
                    transform="rotate(-90 28 28)"
                />
                <defs>
                    <linearGradient id="btt-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#60a5fa" />
                        <stop offset="100%" stopColor="#a78bfa" />
                    </linearGradient>
                </defs>
            </svg>

            {/* Arrow icon */}
            <svg
                className="btt-arrow"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
            >
                <path d="M5 15l7-7 7 7" />
            </svg>
        </button>
    )
}

export default BackToTop

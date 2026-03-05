// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

export default function AvailabilityBanner() {
    const [visible, setVisible] = useState(
        () => !sessionStorage.getItem('bannerDismissed')
    )

    const dismiss = () => {
        sessionStorage.setItem('bannerDismissed', '1')
        setVisible(false)
    }

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ y: -56, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -56, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="relative z-[60] w-full overflow-hidden"
                    style={{
                        background: 'linear-gradient(90deg, #0f172a 0%, #0f2810 40%, #0f2810 60%, #0f172a 100%)',
                        borderBottom: '1px solid rgba(74,222,128,0.18)',
                    }}
                >
                    {/* Subtle glow streak */}
                    <div
                        className="pointer-events-none absolute inset-0"
                        style={{
                            background: 'radial-gradient(ellipse 60% 100% at 50% 50%, rgba(74,222,128,0.07) 0%, transparent 70%)',
                        }}
                    />

                    {/* Centered content */}
                    <div className="relative flex items-center justify-center py-2 px-10 sm:px-14 gap-2 sm:gap-3 min-h-[36px]">
                        {/* Pulsing dot */}
                        <span className="relative flex h-2 w-2 shrink-0">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-70" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
                        </span>

                        {/* Status text */}
                        <span className="text-green-400 text-xs sm:text-sm font-semibold tracking-wide whitespace-nowrap">
                            Open to opportunities
                        </span>

                        {/* Divider — hidden on tiny screens */}
                        <span className="hidden sm:block text-green-700 text-sm select-none">·</span>

                        {/* Sub-text — hidden on small screens */}
                        <span className="hidden sm:block text-slate-400 text-xs">
                            Internships, freelance &amp; collaborations
                        </span>

                        {/* CTA pill */}
                        <Link
                            to="/contact"
                            onClick={dismiss}
                            className="group shrink-0 flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full transition-all duration-200"
                            style={{
                                background: 'rgba(74,222,128,0.12)',
                                border: '1px solid rgba(74,222,128,0.3)',
                                color: '#4ade80',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.background = 'rgba(74,222,128,0.22)'
                                e.currentTarget.style.borderColor = 'rgba(74,222,128,0.55)'
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = 'rgba(74,222,128,0.12)'
                                e.currentTarget.style.borderColor = 'rgba(74,222,128,0.3)'
                            }}
                        >
                            Let's talk
                            <svg className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </div>

                    {/* Dismiss — absolutely pinned to right so it never affects centering */}
                    <button
                        onClick={dismiss}
                        aria-label="Dismiss banner"
                        className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-slate-500 hover:text-slate-300 hover:bg-slate-700/50 transition-all duration-200"
                    >
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

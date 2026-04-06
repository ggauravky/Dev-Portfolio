// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { useState } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

function StickyMobileCTA({
    badge = 'Quick Action',
    title,
    primaryLabel,
    primaryTo,
    secondaryLabel,
    secondaryTo,
    secondaryExternal = false,
}) {
    const [dismissed, setDismissed] = useState(false)

    if (dismissed) {
        return null
    }

    let secondaryAction = null
    if (secondaryLabel && secondaryTo) {
        if (secondaryExternal) {
            secondaryAction = (
                <a
                    href={secondaryTo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-100 border border-slate-600 hover:border-cyan-500/50 hover:text-cyan-300 transition-all duration-300"
                >
                    {secondaryLabel}
                </a>
            )
        } else {
            secondaryAction = (
                <Link
                    to={secondaryTo}
                    className="inline-flex items-center justify-center rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-100 border border-slate-600 hover:border-cyan-500/50 hover:text-cyan-300 transition-all duration-300"
                >
                    {secondaryLabel}
                </Link>
            )
        }
    }

    return (
        <>
            <div className="md:hidden h-28" aria-hidden="true" />

            <div className="md:hidden fixed inset-x-0 bottom-0 z-40 px-3 pb-[calc(env(safe-area-inset-bottom)+0.7rem)]">
                <div className="rounded-2xl border border-slate-700/80 bg-slate-900/95 backdrop-blur-xl shadow-2xl shadow-black/50 p-3.5">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.18em] text-cyan-300 font-semibold">{badge}</p>
                            <p className="text-sm text-slate-100 font-semibold mt-1">{title}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setDismissed(true)}
                            className="w-8 h-8 rounded-lg border border-slate-700 bg-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-colors"
                            aria-label="Close quick action bar"
                        >
                            <svg className="w-4 h-4 mx-auto" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className={`mt-3 grid gap-2 ${secondaryLabel && secondaryTo ? 'grid-cols-2' : 'grid-cols-1'}`}>
                        <Link
                            to={primaryTo}
                            className="inline-flex items-center justify-center rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all duration-300"
                        >
                            {primaryLabel}
                        </Link>

                        {secondaryAction}
                    </div>
                </div>
            </div>
        </>
    )
}

StickyMobileCTA.propTypes = {
    badge: PropTypes.string,
    title: PropTypes.string.isRequired,
    primaryLabel: PropTypes.string.isRequired,
    primaryTo: PropTypes.string.isRequired,
    secondaryLabel: PropTypes.string,
    secondaryTo: PropTypes.string,
    secondaryExternal: PropTypes.bool,
}

export default StickyMobileCTA

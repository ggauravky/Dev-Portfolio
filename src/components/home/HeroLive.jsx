// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// Home hero live panel (D-074), in the slot the portrait used to fill. Three
// lines at most: Lucknow time (always shown), the latest GitHub activity (streams
// in after idle, hidden on failure or offline) and availability (siteStatus.js).
// Not a widget: no box, just a hairline and the mono face. Nothing animates; the
// only change is the minute ticking over. The static shell in index.html renders
// the same rows with the time blank, so nothing shifts when React takes over.

import { useEffect, useState } from 'react'
import { siteStatus, isAvailable } from '../../data/siteStatus'
import { timeFormat, numberFormat, formatGitHubDay, useLucknowTime, loadGitHubActivity } from '../../lib/liveStatus'

const isOffline = () => typeof navigator !== 'undefined' && navigator.onLine === false

/** One line of GitHub text, or null when there's nothing real to show. */
function gitHubText(data) {
    if (!data) return null
    if (data.lastActive) return `Last contribution ${formatGitHubDay(data.lastActive)}`
    if (Number.isFinite(data.total)) return `${numberFormat.format(data.total)} contributions in the last year`
    return null
}

/** Fetched after idle so it never competes with the hero paint. */
function useGitHubLine() {
    const [state, setState] = useState(() => (isOffline() ? { status: 'off' } : { status: 'loading' }))

    useEffect(() => {
        if (isOffline()) return undefined
        let cancelled = false
        let idleId = 0
        let timerId = 0

        const load = () => {
            loadGitHubActivity()
                .then((data) => {
                    if (cancelled) return
                    const text = gitHubText(data)
                    setState(text ? { status: 'ready', text } : { status: 'off' })
                })
                .catch(() => {
                    if (!cancelled) setState({ status: 'off' })
                })
        }

        if ('requestIdleCallback' in window) idleId = window.requestIdleCallback(load, { timeout: 3000 })
        else timerId = window.setTimeout(load, 300)

        return () => {
            cancelled = true
            if (idleId) window.cancelIdleCallback(idleId)
            window.clearTimeout(timerId)
        }
    }, [])

    return state
}

function HeroLive() {
    const now = useLucknowTime()
    const github = useGitHubLine()
    const availability = siteStatus.availability
    const available = isAvailable()

    return (
        <div
            className="hero-live"
            role="group"
            aria-label="Live status: local time in Lucknow, latest GitHub activity and current availability."
            aria-live="off"
        >
            <dl className="hero-live__list">
                <div className="hero-live__row">
                    <dt>Lucknow, India</dt>
                    <dd>
                        <time dateTime={now.toISOString()}>{timeFormat.format(now)} IST</time>
                    </dd>
                </div>
                {github.status !== 'off' ? (
                    <div className="hero-live__row">
                        <dt>GitHub</dt>
                        {/* Blank but full-height while loading, so the text lands without a shift. */}
                        <dd>{github.status === 'ready' ? github.text : ' '}</dd>
                    </div>
                ) : null}
                {availability ? (
                    <div className="hero-live__row hero-live__row--status">
                        <dt className="sr-only">Availability</dt>
                        <dd>
                            {available ? <span className="hero-live__dot" aria-hidden="true" /> : null}
                            {availability.label}
                        </dd>
                    </div>
                ) : null}
            </dl>
        </div>
    )
}

export default HeroLive

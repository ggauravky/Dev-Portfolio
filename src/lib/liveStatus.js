// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// Live facts shared by the footer colophon (S4) and the Home hero panel (D-074):
// Lucknow time and the latest GitHub activity. One clock, one set of formatters
// and one GitHub derivation, so the two surfaces can't drift apart.

import { useEffect, useState } from 'react'
import { fetchGitHubContributions } from '../utils/githubApi'

/** Lucknow wall-clock time, always IST whatever the visitor's timezone. */
export const timeFormat = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
})
/** GitHub days are UTC calendar dates ("2026-11-12"). */
export const dayFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })
export const numberFormat = new Intl.NumberFormat('en-IN')

export const formatGitHubDay = (isoDay) => dayFormat.format(new Date(`${isoDay}T00:00:00Z`))

/**
 * Current time, re-rendered on each minute boundary: one timeout aligned to the
 * minute, then one interval, both cleared on unmount. The first value is taken
 * when the component first renders in the browser (never at build time).
 */
export function useLucknowTime() {
    const [now, setNow] = useState(() => new Date())
    useEffect(() => {
        let interval = 0
        const tick = () => setNow(new Date())
        const timeout = window.setTimeout(() => {
            tick()
            interval = window.setInterval(tick, 60_000)
        }, 60_000 - (Date.now() % 60_000))
        return () => {
            window.clearTimeout(timeout)
            window.clearInterval(interval)
        }
    }, [])
    return now
}

/**
 * Last-year contribution total and the last active day, from the existing
 * GitHub helper (and its localStorage cache). Rejects on any failure; callers
 * hide the line rather than showing fallback numbers, which aren't real data.
 */
export function loadGitHubActivity() {
    return fetchGitHubContributions().then((result) => {
        const days = result.contributionsArray || []
        const today = new Date().toISOString().slice(0, 10)
        const last = [...days].reverse().find((day) => day.count > 0 && day.date <= today)
        return { total: result.totalContributions, lastActive: last?.date || null }
    })
}

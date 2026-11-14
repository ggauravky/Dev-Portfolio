// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// Live facts shared by the footer colophon (S4) and the Home hero panel (D-074):
// Lucknow time and the latest GitHub activity. One clock, one set of formatters
// and one GitHub derivation, so the two surfaces can't drift apart.

import { useEffect, useState } from 'react'
import { readLastKnownGood, refreshActivity, REFRESH_MS } from './githubActivity.js'

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
 * The one GitHub line, worded as the footer always had it. Null when there's no
 * real value, so callers omit the line instead of printing "NaN"/"undefined".
 */
export function formatGitHubStat(data) {
    if (!data) return null
    const last = data.lastActive ? formatGitHubDay(data.lastActive) : null
    if (Number.isInteger(data.count) && data.count >= 0) {
        return `${numberFormat.format(data.count)} contributions in the last year${last ? `, last on ${last}` : ''}`
    }
    return last ? `Last contribution ${last}` : null
}

// One shared store for the hero and the footer (D-094): one value, one timer.
let current = null
let started = false
let lastAttempt = 0
const listeners = new Set()

function refreshNow() {
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return
    lastAttempt = Date.now()
    refreshActivity(current).then((next) => {
        if (next === current) return
        current = next
        listeners.forEach((fn) => fn(current))
    })
}

function startRefreshing() {
    if (started) return
    started = true
    // After idle, so it never competes with the hero paint.
    if ('requestIdleCallback' in window) window.requestIdleCallback(refreshNow, { timeout: 3000 })
    else window.setTimeout(refreshNow, 300)
    window.setInterval(refreshNow, REFRESH_MS)
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && Date.now() - lastAttempt >= REFRESH_MS) refreshNow()
    })
}

/**
 * Last-known-good GitHub activity: renders from the stored copy or the seed at
 * once, then takes a newer value when a background refresh succeeds.
 */
export function useGitHubActivity() {
    const [value, setValue] = useState(() => {
        if (current === null) current = readLastKnownGood()
        return current
    })
    useEffect(() => {
        listeners.add(setValue)
        if (current !== value) setValue(current)
        startRefreshing()
        return () => { listeners.delete(setValue) }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps
    return value
}

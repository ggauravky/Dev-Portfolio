// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { useState, useEffect, useCallback, useRef } from 'react'
import { X } from 'lucide-react'

// Verify real connectivity by pinging a small known-static asset.
// navigator.onLine alone is unreliable (captive portals, etc.).
async function verifyConnectivity() {
    try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 4000)
        const response = await fetch('/favicon.svg', {
            method: 'HEAD',
            cache: 'no-store',
            signal: controller.signal,
        })
        clearTimeout(timeout)
        return response.ok
    } catch {
        return false
    }
}

// Toast states
const STATE = {
    HIDDEN:   'hidden',
    OFFLINE:  'offline',
    ONLINE:   'online',
    CHECKING: 'checking',
}

export default function NetworkStatusBanner() {
    const [state, setState] = useState(STATE.HIDDEN)
    const [dismissed, setDismissed] = useState(false)
    const dismissTimerRef = useRef(null)

    // Clear any pending auto-dismiss timer
    const clearDismissTimer = useCallback(() => {
        if (dismissTimerRef.current) {
            clearTimeout(dismissTimerRef.current)
            dismissTimerRef.current = null
        }
    }, [])

    // Handle going offline
    const handleOffline = useCallback(() => {
        clearDismissTimer()
        setDismissed(false)
        setState(STATE.OFFLINE)
    }, [clearDismissTimer])

    // Handle coming back online — verify with real ping then show "Back online"
    const handleOnline = useCallback(async () => {
        clearDismissTimer()
        setState(STATE.CHECKING)

        const connected = await verifyConnectivity()
        if (connected) {
            setState(STATE.ONLINE)
            setDismissed(false)
            // Auto-dismiss "Back online" toast after 3.5s
            dismissTimerRef.current = setTimeout(() => {
                setState(STATE.HIDDEN)
            }, 3500)
        } else {
            // Ping failed — still treat as offline
            setState(STATE.OFFLINE)
        }
    }, [clearDismissTimer])

    useEffect(() => {
        // If already offline when component mounts, show immediately
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
            setState(STATE.OFFLINE)
        }

        window.addEventListener('online',  handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online',  handleOnline)
            window.removeEventListener('offline', handleOffline)
            clearDismissTimer()
        }
    }, [handleOnline, handleOffline, clearDismissTimer])

    // Don't render if hidden or dismissed
    if (state === STATE.HIDDEN || dismissed) return null

    const isOffline   = state === STATE.OFFLINE || state === STATE.CHECKING
    const isBackOnline = state === STATE.ONLINE

    return (
        <aside
            className="net-banner"
            aria-live="assertive"
            aria-atomic="true"
            aria-label={isOffline ? 'Network connection lost' : 'Network connection restored'}
            role="status"
        >
            <p className="net-banner__text">
                <strong>
                    {isBackOnline ? 'Back online' : state === STATE.CHECKING ? 'Checking…' : "You're offline"}
                </strong>
                <span>
                    {isBackOnline
                        ? 'Connection restored.'
                        : state === STATE.CHECKING ? 'Verifying connection…' : 'Some features may be unavailable.'}
                </span>
            </p>
            {/* Dismiss button — hidden while checking */}
            {state !== STATE.CHECKING && (
                <button
                    type="button"
                    onClick={() => setDismissed(true)}
                    className="net-banner__close"
                    aria-label="Dismiss notification"
                >
                    <X className="w-4 h-4" aria-hidden="true" />
                </button>
            )}
        </aside>
    )
}

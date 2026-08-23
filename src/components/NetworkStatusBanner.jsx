// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { useState, useEffect, useCallback, useRef } from 'react'
import { Wifi, WifiOff, X, CheckCircle } from 'lucide-react'

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
            className="fixed bottom-20 right-4 z-[70] max-w-xs w-full select-none"
            aria-live="assertive"
            aria-atomic="true"
            aria-label={isOffline ? 'Network connection lost' : 'Network connection restored'}
            role="status"
        >
            <div
                className={[
                    'rounded-xl p-3.5 shadow-2xl backdrop-blur-md',
                    'flex items-center justify-between gap-3',
                    'text-xs font-mono',
                    'border',
                    isBackOnline
                        ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-200'
                        : 'bg-rose-950/90 border-rose-500/30 text-rose-200',
                    // Slide-in animation via inline style
                ].join(' ')}
                style={{
                    animation: 'sw-slide-in .25s ease-out both',
                }}
            >
                {/* Icon + text */}
                <div className="flex items-center gap-2.5">
                    <div
                        className={[
                            'p-2 rounded-lg shrink-0',
                            isBackOnline
                                ? 'bg-emerald-900/60 text-emerald-300'
                                : 'bg-rose-900/60 text-rose-300',
                        ].join(' ')}
                        aria-hidden="true"
                    >
                        {isBackOnline
                            ? <CheckCircle className="w-4 h-4" />
                            : <WifiOff className="w-4 h-4 animate-pulse" />
                        }
                    </div>

                    <div>
                        {isBackOnline ? (
                            <>
                                <h4 className="font-bold text-emerald-100">Back Online</h4>
                                <p className="text-[11px] text-emerald-300/80 mt-0.5">
                                    Connection restored.
                                </p>
                            </>
                        ) : (
                            <>
                                <h4 className="font-bold text-rose-100">
                                    {state === STATE.CHECKING ? 'Checking…' : 'You\'re Offline'}
                                </h4>
                                <p className="text-[11px] text-rose-300/80 mt-0.5">
                                    {state === STATE.CHECKING
                                        ? 'Verifying connection…'
                                        : 'Some features may be unavailable.'
                                    }
                                </p>
                            </>
                        )}
                    </div>
                </div>

                {/* Dismiss button — hidden while checking */}
                {state !== STATE.CHECKING && (
                    <button
                        type="button"
                        onClick={() => setDismissed(true)}
                        className={[
                            'p-1 rounded-md transition-colors',
                            isBackOnline
                                ? 'text-emerald-400 hover:text-white hover:bg-emerald-900/60'
                                : 'text-rose-400 hover:text-white hover:bg-rose-900/60',
                        ].join(' ')}
                        aria-label="Dismiss notification"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Inline keyframe — avoids polluting global CSS */}
            <style>{`
                @keyframes sw-slide-in {
                    from { opacity: 0; transform: translateY(12px) scale(.97); }
                    to   { opacity: 1; transform: translateY(0)    scale(1);    }
                }
                @media (prefers-reduced-motion: reduce) {
                    @keyframes sw-slide-in { from { opacity:0 } to { opacity:1 } }
                }
            `}</style>
        </aside>
    )
}

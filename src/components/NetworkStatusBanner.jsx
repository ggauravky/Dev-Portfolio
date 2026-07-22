// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { useState, useEffect } from 'react'
import { Wifi, WifiOff, X } from 'lucide-react'

export default function NetworkStatusBanner() {
    const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true)
    const [dismissed, setDismissed] = useState(false)
    const [connectionType, setConnectionType] = useState(null)

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true)
            setDismissed(false)
        }
        const handleOffline = () => {
            setIsOnline(false)
            setDismissed(false)
        }

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        // Read connection speed if supported
        if (typeof navigator !== 'undefined' && 'connection' in navigator) {
            const conn = navigator.connection
            if (conn?.effectiveType) {
                setConnectionType(conn.effectiveType)
            }
        }

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    if (isOnline || dismissed) return null

    return (
        <aside className="fixed bottom-16 right-4 z-50 max-w-sm w-full select-none animate-in fade-in zoom-in-95 duration-200" aria-label="Network Connection Status Warning">
            <div className="bg-rose-950/90 border border-rose-500/40 rounded-xl p-3.5 shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 text-xs font-mono text-rose-200">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-rose-900/60 text-rose-300 shrink-0">
                        <WifiOff className="w-4 h-4 animate-pulse" />
                    </div>
                    <div>
                        <h4 className="font-bold text-rose-100">Network Offline</h4>
                        <p className="text-[11px] text-rose-300/80 mt-0.5">
                            Serving cached static content. Reconnecting...
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => setDismissed(true)}
                    className="p-1 rounded-md text-rose-400 hover:text-white hover:bg-rose-900/60 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </aside>
    )
}

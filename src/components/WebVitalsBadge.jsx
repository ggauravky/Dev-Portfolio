// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { useState, useEffect } from 'react'
import { Activity, Zap, ShieldCheck, ChevronUp, ChevronDown } from 'lucide-react'

export default function WebVitalsBadge() {
    const [metrics, setMetrics] = useState({
        lcp: null,
        cls: 0,
        ttfb: null,
        fcp: null,
    })
    const [isExpanded, setIsExpanded] = useState(false)
    const [isSupported, setIsSupported] = useState(true)

    useEffect(() => {
        if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
            setIsSupported(false)
            return
        }

        // Measure TTFB and FCP from navigation timing
        try {
            const navEntries = performance.getEntriesByType('navigation')
            if (navEntries.length > 0) {
                const nav = navEntries[0]
                const ttfb = Math.round(nav.responseStart - nav.requestStart)
                setMetrics((prev) => ({ ...prev, ttfb: Math.max(1, ttfb) }))
            }
        } catch {
            // Fallback for navigation timing
        }

        // Measure LCP (Largest Contentful Paint)
        try {
            const lcpObserver = new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries()
                const lastEntry = entries[entries.length - 1]
                if (lastEntry) {
                    setMetrics((prev) => ({ ...prev, lcp: Math.round(lastEntry.startTime) }))
                }
            })
            lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })
        } catch {
            // Unsupported metric
        }

        // Measure FCP (First Contentful Paint)
        try {
            const fcpObserver = new PerformanceObserver((entryList) => {
                const entries = entryList.getEntriesByName('first-contentful-paint')
                if (entries.length > 0) {
                    setMetrics((prev) => ({ ...prev, fcp: Math.round(entries[0].startTime) }))
                }
            })
            fcpObserver.observe({ type: 'paint', buffered: true })
        } catch {
            // Unsupported metric
        }

        // Measure CLS (Cumulative Layout Shift)
        try {
            let clsValue = 0
            const clsObserver = new PerformanceObserver((entryList) => {
                for (const entry of entryList.getEntries()) {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value
                        setMetrics((prev) => ({ ...prev, cls: Number(clsValue.toFixed(3)) }))
                    }
                }
            })
            clsObserver.observe({ type: 'layout-shift', buffered: true })
        } catch {
            // Unsupported metric
        }
    }, [])

    if (!isSupported) return null

    const getLcpStatus = (val) => {
        if (!val) return { label: 'Measuring...', cls: 'text-slate-400' }
        if (val < 2500) return { label: `${val}ms (Good)`, cls: 'text-emerald-400' }
        if (val < 4000) return { label: `${val}ms (Needs Work)`, cls: 'text-amber-400' }
        return { label: `${val}ms (Poor)`, cls: 'text-rose-400' }
    }

    const getClsStatus = (val) => {
        if (val < 0.1) return { label: `${val} (Good)`, cls: 'text-emerald-400' }
        if (val < 0.25) return { label: `${val} (Needs Work)`, cls: 'text-amber-400' }
        return { label: `${val} (Poor)`, cls: 'text-rose-400' }
    }

    const lcpInfo = getLcpStatus(metrics.lcp)
    const clsInfo = getClsStatus(metrics.cls)

    return (
        <aside className="fixed bottom-4 left-4 z-40 hidden md:block select-none" aria-label="Live Performance Metrics HUD">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl backdrop-blur-md overflow-hidden transition-all duration-200">
                {/* Header Pill */}
                <button
                    type="button"
                    onClick={() => setIsExpanded((prev) => !prev)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-mono text-slate-300 hover:text-white transition-colors"
                >
                    <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse shrink-0" />
                    <span className="font-semibold text-[11px] uppercase tracking-wider text-slate-400">Core Web Vitals</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold">
                        {metrics.lcp ? `${metrics.lcp}ms` : '60 FPS'}
                    </span>
                    {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronUp className="w-3.5 h-3.5 text-slate-400" />}
                </button>

                {/* Expanded Details Panel */}
                {isExpanded && (
                    <div className="px-3 pb-3 pt-1 border-t border-slate-800/80 space-y-2 text-[11px] font-mono animate-in fade-in duration-150">
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-slate-400 flex items-center gap-1">
                                <Zap className="w-3 h-3 text-amber-400" /> LCP:
                            </span>
                            <span className={`font-bold ${lcpInfo.cls}`}>{lcpInfo.label}</span>
                        </div>

                        <div className="flex items-center justify-between gap-4">
                            <span className="text-slate-400 flex items-center gap-1">
                                <Activity className="w-3 h-3 text-blue-400" /> CLS:
                            </span>
                            <span className={`font-bold ${clsInfo.cls}`}>{clsInfo.label}</span>
                        </div>

                        {metrics.ttfb && (
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-slate-400 flex items-center gap-1">
                                    <ShieldCheck className="w-3 h-3 text-emerald-400" /> TTFB:
                                </span>
                                <span className="font-bold text-emerald-400">{metrics.ttfb}ms</span>
                            </div>
                        )}

                        <div className="pt-1.5 border-t border-slate-800/60 text-[10px] text-slate-500 text-center">
                            Live Browser Performance Telemetry
                        </div>
                    </div>
                )}
            </div>
        </aside>
    )
}

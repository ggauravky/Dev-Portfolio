// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio

import PropTypes from 'prop-types'
import { Cpu, Zap, Activity, AlertTriangle } from 'lucide-react'

export default function ModelMetricsBadge({
    latencyMs,
    model = 'gemini-2.0-flash-lite',
    provider = 'gemini',
    degraded = false,
    tokenCount = null,
    className = '',
}) {
    const isErrorOrDegraded = Boolean(degraded)

    return (
        <div
            className={`inline-flex flex-wrap items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono backdrop-blur-md transition-all duration-300 border ${
                isErrorOrDegraded
                    ? 'bg-amber-950/40 border-amber-500/30 text-amber-300'
                    : 'bg-slate-900/80 border-slate-700/60 text-slate-300 shadow-sm'
            } ${className}`}
            role="status"
            aria-label={`AI Model Metrics: ${model}, Latency: ${latencyMs ? `${latencyMs}ms` : 'N/A'}`}
        >
            {/* Model Provider / Name */}
            <div className="flex items-center gap-1.5 text-blue-400 font-semibold">
                <Cpu className="w-3.5 h-3.5 text-blue-400" />
                <span>{model}</span>
            </div>

            <span className="text-slate-600">|</span>

            {/* Provider Badge */}
            <span className="capitalize text-slate-400 font-medium">
                {provider}
            </span>

            {/* Latency Metric */}
            {typeof latencyMs === 'number' && latencyMs >= 0 && (
                <>
                    <span className="text-slate-600">|</span>
                    <div className="flex items-center gap-1 text-emerald-400">
                        <Zap className="w-3 h-3 text-emerald-400" />
                        <span>{latencyMs}ms</span>
                    </div>
                </>
            )}

            {/* Token Count metric if available */}
            {typeof tokenCount === 'number' && tokenCount > 0 && (
                <>
                    <span className="text-slate-600">|</span>
                    <div className="flex items-center gap-1 text-purple-400">
                        <Activity className="w-3 h-3 text-purple-400" />
                        <span>{tokenCount} tokens</span>
                    </div>
                </>
            )}

            {/* Degraded Status Alert */}
            {isErrorOrDegraded && (
                <>
                    <span className="text-slate-600">|</span>
                    <div className="flex items-center gap-1 text-amber-400 font-semibold">
                        <AlertTriangle className="w-3 h-3 text-amber-400 animate-pulse" />
                        <span>Fallback / Degraded</span>
                    </div>
                </>
            )}
        </div>
    )
}

ModelMetricsBadge.propTypes = {
    latencyMs: PropTypes.number,
    model: PropTypes.string,
    provider: PropTypes.string,
    degraded: PropTypes.bool,
    tokenCount: PropTypes.number,
    className: PropTypes.string,
}

// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

// ────────────────────────────────────────────────────────────────────────────
// StreakCounter — Enhanced GitHub stats with streak, best day, average daily
// ────────────────────────────────────────────────────────────────────────────
import { useEffect, useState, useRef } from 'react'

function AnimatedNumber({ value, duration = 1000, delay = 0, decimals = 0 }) {
    const [displayValue, setDisplayValue] = useState(0)
    const startTime = useRef(null)
    const animationFrame = useRef(null)

    useEffect(() => {
        if (typeof value !== 'number' || value === 0) {
            setDisplayValue(value || 0)
            return
        }

        const timeout = setTimeout(() => {
            startTime.current = performance.now()
            
            const animate = (currentTime) => {
                const elapsed = currentTime - startTime.current
                const progress = Math.min(elapsed / duration, 1)
                
                // Easing function (ease-out-cubic)
                const eased = 1 - Math.pow(1 - progress, 3)
                const currentValue = eased * value
                
                setDisplayValue(decimals > 0 ? currentValue.toFixed(decimals) : Math.floor(currentValue))
                
                if (progress < 1) {
                    animationFrame.current = requestAnimationFrame(animate)
                }
            }
            
            animationFrame.current = requestAnimationFrame(animate)
        }, delay)

        return () => {
            clearTimeout(timeout)
            if (animationFrame.current) {
                cancelAnimationFrame(animationFrame.current)
            }
        }
    }, [value, duration, delay, decimals])

    return <span>{typeof displayValue === 'number' ? displayValue.toLocaleString() : displayValue}</span>
}

function StreakCounter({ 
    currentStreak = 0, 
    longestStreak = 0, 
    totalContributions = 0,
    bestDayCount = 0,
    mostActiveDay = null,
    averageDaily = 0,
    activeDays = 0,
    isLoading = false 
}) {
    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-slate-800/50 rounded-xl p-4 animate-pulse">
                            <div className="h-4 w-16 bg-slate-700 rounded mb-2"></div>
                            <div className="h-8 w-12 bg-slate-700 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    const mainStats = [
        {
            icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.047 8.287 8.287 0 009 9.601a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.468 5.99 5.99 0 00-1.925 3.547 5.975 5.975 0 01-2.133-1A3.75 3.75 0 0012 18z" /></svg>,
            label: 'Current Streak',
            value: currentStreak,
            suffix: 'days',
            color: 'from-orange-500 to-red-500',
            bgColor: 'bg-gradient-to-br from-orange-500/10 to-red-500/10',
            borderColor: 'border-orange-500/30',
            highlight: currentStreak > 0
        },
        {
            icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" /></svg>,
            label: 'Best Streak',
            value: longestStreak,
            suffix: 'days',
            color: 'from-amber-400 to-yellow-500',
            bgColor: 'bg-gradient-to-br from-amber-500/10 to-yellow-500/10',
            borderColor: 'border-amber-500/30',
            highlight: false
        },
        {
            icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>,
            label: 'Total',
            value: totalContributions,
            suffix: 'contributions',
            color: 'from-cyan-400 to-blue-500',
            bgColor: 'bg-gradient-to-br from-cyan-500/10 to-blue-500/10',
            borderColor: 'border-cyan-500/30',
            highlight: false
        },
        {
            icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>,
            label: 'Best Day',
            value: bestDayCount,
            suffix: 'contributions',
            color: 'from-purple-400 to-pink-500',
            bgColor: 'bg-gradient-to-br from-purple-500/10 to-pink-500/10',
            borderColor: 'border-purple-500/30',
            highlight: false
        }
    ]

    const secondaryStats = [
        {
            label: 'Active Days',
            value: activeDays,
            icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
        },
        {
            label: 'Daily Avg',
            value: averageDaily,
            icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>,
            decimals: 1
        },
        {
            label: 'Most Active',
            value: mostActiveDay || 'N/A',
            icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" /></svg>,
            isText: true
        }
    ]

    return (
        <div className="space-y-4">
            {/* Main Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {mainStats.map((stat, index) => (
                    <div 
                        key={stat.label}
                        className={`relative overflow-hidden rounded-xl p-4 border transition-all duration-300 hover:scale-[1.02] ${stat.bgColor} ${stat.borderColor}`}
                    >
                        {/* Gradient background glow */}
                        <div className={`absolute inset-0 opacity-10 bg-gradient-to-br ${stat.color} blur-2xl`} />
                        
                        <div className="relative">
                            <div className="flex items-center gap-1.5 mb-2">
                                <span className={stat.highlight ? 'animate-pulse' : ''}>
                                    {stat.icon}
                                </span>
                                <span className="text-xs font-medium text-slate-400 truncate">
                                    {stat.label}
                                </span>
                            </div>
                            
                            <div className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                                <AnimatedNumber 
                                    value={stat.value} 
                                    duration={1200} 
                                    delay={index * 100} 
                                />
                            </div>
                            
                            <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                                {stat.suffix}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Secondary Stats Row */}
            <div className="flex flex-wrap gap-3">
                {secondaryStats.map((stat, index) => (
                    <div 
                        key={stat.label}
                        className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50"
                    >
                        <span>{stat.icon}</span>
                        <div>
                            <div className="text-xs text-slate-500">{stat.label}</div>
                            <div className="text-sm font-semibold text-white">
                                {stat.isText ? stat.value : (
                                    <AnimatedNumber 
                                        value={stat.value} 
                                        duration={800} 
                                        delay={400 + index * 100}
                                        decimals={stat.decimals || 0}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default StreakCounter

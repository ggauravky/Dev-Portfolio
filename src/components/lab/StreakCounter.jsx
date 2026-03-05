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
            icon: '🔥',
            label: 'Current Streak',
            value: currentStreak,
            suffix: 'days',
            color: 'from-orange-500 to-red-500',
            bgColor: 'bg-gradient-to-br from-orange-500/10 to-red-500/10',
            borderColor: 'border-orange-500/30',
            highlight: currentStreak > 0
        },
        {
            icon: '🏆',
            label: 'Best Streak',
            value: longestStreak,
            suffix: 'days',
            color: 'from-amber-400 to-yellow-500',
            bgColor: 'bg-gradient-to-br from-amber-500/10 to-yellow-500/10',
            borderColor: 'border-amber-500/30',
            highlight: false
        },
        {
            icon: '📊',
            label: 'Total',
            value: totalContributions,
            suffix: 'contributions',
            color: 'from-cyan-400 to-blue-500',
            bgColor: 'bg-gradient-to-br from-cyan-500/10 to-blue-500/10',
            borderColor: 'border-cyan-500/30',
            highlight: false
        },
        {
            icon: '⚡',
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
            icon: '📅'
        },
        {
            label: 'Daily Avg',
            value: averageDaily,
            icon: '📈',
            decimals: 1
        },
        {
            label: 'Most Active',
            value: mostActiveDay || 'N/A',
            icon: '🗓️',
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
                                <span className={`text-lg ${stat.highlight ? 'animate-pulse' : ''}`}>
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
                        <span className="text-sm">{stat.icon}</span>
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

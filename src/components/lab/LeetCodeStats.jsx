// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

// ────────────────────────────────────────────────────────────────────────────
// LeetCodeStats — Enhanced stats with languages, streak, acceptance rate
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

function ProgressBar({ value, max, color, delay = 0 }) {
    const [width, setWidth] = useState(0)
    const percentage = max > 0 ? (value / max) * 100 : 0

    useEffect(() => {
        const timeout = setTimeout(() => {
            setWidth(percentage)
        }, delay)
        return () => clearTimeout(timeout)
    }, [percentage, delay])

    return (
        <div className="h-2.5 bg-slate-700/50 rounded-full overflow-hidden">
            <div 
                className={`h-full rounded-full transition-all duration-1000 ease-out ${color}`}
                style={{ width: `${width}%` }}
            />
        </div>
    )
}

// Circular progress for total solved
function CircularProgress({ solved, total, size = 120 }) {
    const [progress, setProgress] = useState(0)
    const percentage = total > 0 ? (solved / total) * 100 : 0
    const strokeWidth = 8
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const offset = circumference - (progress / 100) * circumference

    useEffect(() => {
        const timeout = setTimeout(() => {
            setProgress(percentage)
        }, 300)
        return () => clearTimeout(timeout)
    }, [percentage])

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90" width={size} height={size}>
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    className="text-slate-700/50"
                />
                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="url(#leetcode-gradient)"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className="transition-all duration-1000 ease-out"
                />
                <defs>
                    <linearGradient id="leetcode-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#f97316" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-white">
                    <AnimatedNumber value={solved} duration={1500} />
                </span>
                <span className="text-xs text-slate-500">solved</span>
            </div>
        </div>
    )
}

function LeetCodeStats({ stats, isLoading = false }) {
    if (isLoading) {
        return (
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 animate-pulse">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-slate-700 rounded"></div>
                    <div className="h-6 w-32 bg-slate-700 rounded"></div>
                </div>
                <div className="flex justify-center mb-6">
                    <div className="w-28 h-28 bg-slate-700 rounded-full"></div>
                </div>
                <div className="space-y-4">
                    <div className="h-10 bg-slate-700 rounded"></div>
                    <div className="h-10 bg-slate-700 rounded"></div>
                    <div className="h-10 bg-slate-700 rounded"></div>
                </div>
            </div>
        )
    }

    if (!stats) return null

    const difficulties = [
        { 
            label: 'Easy', 
            solved: stats.easySolved, 
            total: stats.totalEasy,
            color: 'bg-emerald-500',
            textColor: 'text-emerald-400',
            bgColor: 'bg-emerald-500/10'
        },
        { 
            label: 'Medium', 
            solved: stats.mediumSolved, 
            total: stats.totalMedium,
            color: 'bg-amber-500',
            textColor: 'text-amber-400',
            bgColor: 'bg-amber-500/10'
        },
        { 
            label: 'Hard', 
            solved: stats.hardSolved, 
            total: stats.totalHard,
            color: 'bg-red-500',
            textColor: 'text-red-400',
            bgColor: 'bg-red-500/10'
        }
    ]

    const totalProblems = (stats.totalEasy || 850) + (stats.totalMedium || 1800) + (stats.totalHard || 800)

    return (
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-amber-500/30 transition-all duration-300 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-700/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                        <svg className="w-6 h-6 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z"/>
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">LeetCode</h3>
                        <p className="text-xs text-slate-500">@{stats.username}</p>
                    </div>
                </div>
                <a 
                    href={`https://leetcode.com/u/${stats.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs px-3 py-1.5 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/30 hover:bg-amber-500/20 transition-colors flex items-center gap-1"
                >
                    Profile
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                </a>
            </div>

            <div className="p-5">
                {/* Circular Progress + Stats Grid */}
                <div className="flex items-center gap-6 mb-6">
                    <CircularProgress 
                        solved={stats.totalSolved} 
                        total={totalProblems}
                        size={110}
                    />
                    <div className="flex-1 space-y-2">
                        {difficulties.map((diff, index) => (
                            <div key={diff.label} className={`flex items-center justify-between px-3 py-2 rounded-lg ${diff.bgColor}`}>
                                <span className={`text-sm font-medium ${diff.textColor}`}>{diff.label}</span>
                                <span className="text-sm text-white font-semibold">
                                    <AnimatedNumber value={diff.solved} duration={800} delay={index * 100} />
                                    <span className="text-slate-500 font-normal"> / {diff.total}</span>
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Progress Bars */}
                <div className="space-y-3 mb-6">
                    {difficulties.map((diff, index) => (
                        <div key={`bar-${diff.label}`}>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-slate-500">{diff.label} Progress</span>
                                <span className="text-slate-400">
                                    {diff.total > 0 ? ((diff.solved / diff.total) * 100).toFixed(1) : 0}%
                                </span>
                            </div>
                            <ProgressBar 
                                value={diff.solved} 
                                max={diff.total} 
                                color={diff.color}
                                delay={400 + index * 150}
                            />
                        </div>
                    ))}
                </div>

                {/* Quick Stats Row */}
                <div className="grid grid-cols-3 gap-2 mb-5">
                    {stats.streak > 0 && (
                        <div className="text-center p-3 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-lg border border-orange-500/20">
                            <div className="text-lg font-bold text-orange-400">
                                🔥 <AnimatedNumber value={stats.streak} duration={800} delay={500} />
                            </div>
                            <div className="text-[10px] text-slate-500 uppercase tracking-wide">Day Streak</div>
                        </div>
                    )}
                    {stats.totalActiveDays > 0 && (
                        <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                            <div className="text-lg font-bold text-cyan-400">
                                <AnimatedNumber value={stats.totalActiveDays} duration={800} delay={600} />
                            </div>
                            <div className="text-[10px] text-slate-500 uppercase tracking-wide">Active Days</div>
                        </div>
                    )}
                    {stats.acceptanceRate && (
                        <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                            <div className="text-lg font-bold text-emerald-400">
                                {stats.acceptanceRate}%
                            </div>
                            <div className="text-[10px] text-slate-500 uppercase tracking-wide">Acceptance</div>
                        </div>
                    )}
                </div>

                {/* Languages Used */}
                {stats.languages && stats.languages.length > 0 && (
                    <div className="mb-5">
                        <h4 className="text-xs text-slate-500 uppercase tracking-wide mb-2">Top Languages</h4>
                        <div className="flex flex-wrap gap-2">
                            {stats.languages.map((lang, i) => (
                                <span 
                                    key={lang.languageName}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-700/50 rounded-full text-xs"
                                >
                                    <span className="text-slate-300">{lang.languageName}</span>
                                    <span className="text-slate-500">•</span>
                                    <span className="text-purple-400 font-medium">{lang.problemsSolved}</span>
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Contest Stats */}
                {(stats.contestRating || stats.contestAttended > 0 || stats.ranking) && (
                    <div className="pt-4 border-t border-slate-700/50">
                        <h4 className="text-xs text-slate-500 uppercase tracking-wide mb-3">Contest & Ranking</h4>
                        <div className="grid grid-cols-2 gap-2">
                            {stats.contestRating && (
                                <div className="p-3 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-500/20">
                                    <div className="text-xl font-bold text-purple-400">
                                        <AnimatedNumber value={stats.contestRating} duration={1000} delay={700} />
                                    </div>
                                    <div className="text-[10px] text-slate-500 uppercase tracking-wide">Contest Rating</div>
                                </div>
                            )}
                            {stats.contestAttended > 0 && (
                                <div className="p-3 bg-slate-700/30 rounded-lg">
                                    <div className="text-xl font-bold text-cyan-400">
                                        <AnimatedNumber value={stats.contestAttended} duration={800} delay={800} />
                                    </div>
                                    <div className="text-[10px] text-slate-500 uppercase tracking-wide">Contests</div>
                                </div>
                            )}
                            {stats.contestTopPercentage && (
                                <div className="p-3 bg-slate-700/30 rounded-lg">
                                    <div className="text-xl font-bold text-amber-400">
                                        Top {stats.contestTopPercentage}%
                                    </div>
                                    <div className="text-[10px] text-slate-500 uppercase tracking-wide">Percentile</div>
                                </div>
                            )}
                            {stats.ranking && (
                                <div className="p-3 bg-slate-700/30 rounded-lg">
                                    <div className="text-lg font-semibold text-slate-300">
                                        #<AnimatedNumber value={stats.ranking} duration={1200} delay={900} />
                                    </div>
                                    <div className="text-[10px] text-slate-500 uppercase tracking-wide">Global Rank</div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer with fallback indicator */}
            {(stats.isFallback || stats.source) && (
                <div className="px-5 py-3 bg-slate-800/80 border-t border-slate-700/30 flex items-center justify-between text-xs text-slate-500">
                    {stats.isFallback ? (
                        <span className="flex items-center gap-1">
                            <span>⚠️</span>
                            <span>Showing fallback data — API unavailable</span>
                        </span>
                    ) : (
                        <span>Data via {stats.source === 'graphql' ? 'LeetCode API' : 'alternative API'}</span>
                    )}
                    {stats.lastUpdated && (
                        <span className="text-slate-600">
                            Updated {new Date(stats.lastUpdated).toLocaleTimeString()}
                        </span>
                    )}
                </div>
            )}
        </div>
    )
}

export default LeetCodeStats

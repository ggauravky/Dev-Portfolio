// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

// ────────────────────────────────────────────────────────────────────────────
// ContributionHeatmap — GitHub-style contribution calendar with portfolio theme
// ────────────────────────────────────────────────────────────────────────────
import { useState, useMemo } from 'react'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Portfolio theme colors (purple/cyan gradient)
const LEVEL_COLORS = [
    'bg-slate-800/60',           // Level 0: No contributions
    'bg-purple-900/70',          // Level 1: 1-2 contributions
    'bg-purple-700/80',          // Level 2: 3-5 contributions
    'bg-cyan-600/90',            // Level 3: 6-9 contributions
    'bg-cyan-400',               // Level 4: 10+ contributions
]

function getContributionLevel(count) {
    if (count === 0) return 0
    if (count <= 2) return 1
    if (count <= 5) return 2
    if (count <= 9) return 3
    return 4
}

function ContributionHeatmap({ contributions = {}, contributionsArray = [] }) {
    const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, date: '', count: 0 })

    // Generate calendar data for the last 365 days
    const calendarData = useMemo(() => {
        const data = []
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        // Start from 52 weeks ago, aligned to Sunday
        const startDate = new Date(today)
        startDate.setDate(startDate.getDate() - 364)
        // Align to start of week (Sunday)
        startDate.setDate(startDate.getDate() - startDate.getDay())

        // Create a map from contributions array for easier lookup
        const contribMap = { ...contributions }
        if (contributionsArray.length > 0) {
            contributionsArray.forEach(day => {
                contribMap[day.date] = day.count
            })
        }

        // Generate weeks (columns)
        let currentDate = new Date(startDate)
        let currentWeek = []
        let weekIndex = 0
        let monthLabels = []
        let lastMonth = -1

        while (currentDate <= today || currentWeek.length > 0) {
            const dateStr = currentDate.toISOString().split('T')[0]
            const dayOfWeek = currentDate.getDay()
            const count = contribMap[dateStr] || 0
            const isFuture = currentDate > today

            // Track month changes for labels
            const month = currentDate.getMonth()
            if (month !== lastMonth && !isFuture) {
                lastMonth = month
                monthLabels.push({ weekIndex, month: MONTHS[month] })
            }

            if (!isFuture) {
                currentWeek.push({
                    date: dateStr,
                    count,
                    level: getContributionLevel(count),
                    dayOfWeek
                })
            }

            // Move to next day
            currentDate.setDate(currentDate.getDate() + 1)

            // If we completed a week (7 days) or reached today
            if (currentWeek.length === 7 || currentDate > today) {
                if (currentWeek.length > 0) {
                    data.push({ days: currentWeek, weekIndex })
                    weekIndex++
                    currentWeek = []
                }
            }
        }

        return { weeks: data, monthLabels }
    }, [contributions, contributionsArray])

    const handleMouseEnter = (e, day) => {
        const rect = e.target.getBoundingClientRect()
        setTooltip({
            show: true,
            x: rect.left + rect.width / 2,
            y: rect.top - 8,
            date: day.date,
            count: day.count
        })
    }

    const handleMouseLeave = () => {
        setTooltip({ ...tooltip, show: false })
    }

    const formatDate = (dateStr) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        })
    }

    return (
        <div className="relative">
            {/* Month labels */}
            <div className="flex mb-2 ml-8 text-xs text-slate-500 overflow-hidden">
                {calendarData.monthLabels.map((label, i) => (
                    <span 
                        key={i} 
                        className="shrink-0"
                        style={{ 
                            marginLeft: i === 0 
                                ? `${label.weekIndex * 14}px` 
                                : `${(label.weekIndex - calendarData.monthLabels[i-1].weekIndex - 1) * 14}px`
                        }}
                    >
                        {label.month}
                    </span>
                ))}
            </div>

            <div className="flex gap-0.5">
                {/* Day labels */}
                <div className="flex flex-col gap-0.5 mr-1 text-xs text-slate-500">
                    {DAYS.map((day, i) => (
                        <span 
                            key={day} 
                            className="h-[12px] leading-[12px]"
                            style={{ visibility: i % 2 === 1 ? 'visible' : 'hidden' }}
                        >
                            {day}
                        </span>
                    ))}
                </div>

                {/* Heatmap grid */}
                <div className="flex gap-[3px] overflow-x-auto pb-2">
                    {calendarData.weeks.map((week) => (
                        <div key={week.weekIndex} className="flex flex-col gap-[3px]">
                            {/* Fill empty days at start of first week */}
                            {week.days.length < 7 && week.weekIndex === 0 && 
                                Array(7 - week.days.length).fill(null).map((_, i) => (
                                    <div key={`empty-${i}`} className="w-[12px] h-[12px]" />
                                ))
                            }
                            {week.days.map((day) => (
                                <div
                                    key={day.date}
                                    className={`w-[12px] h-[12px] rounded-sm cursor-pointer transition-all duration-150 hover:ring-1 hover:ring-cyan-400/50 hover:scale-110 ${LEVEL_COLORS[day.level]}`}
                                    onMouseEnter={(e) => handleMouseEnter(e, day)}
                                    onMouseLeave={handleMouseLeave}
                                />
                            ))}
                            {/* Fill empty days at end of last week */}
                            {week.days.length < 7 && week.weekIndex > 0 && 
                                Array(7 - week.days.length).fill(null).map((_, i) => (
                                    <div key={`empty-end-${i}`} className="w-[12px] h-[12px]" />
                                ))
                            }
                        </div>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-end gap-2 mt-3 text-xs text-slate-500">
                <span>Less</span>
                {LEVEL_COLORS.map((color, i) => (
                    <div key={i} className={`w-[12px] h-[12px] rounded-sm ${color}`} />
                ))}
                <span>More</span>
            </div>

            {/* Tooltip */}
            {tooltip.show && (
                <div 
                    className="fixed z-50 px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg shadow-xl pointer-events-none transform -translate-x-1/2 -translate-y-full"
                    style={{ left: tooltip.x, top: tooltip.y }}
                >
                    <div className="font-medium text-white">
                        {tooltip.count} contribution{tooltip.count !== 1 ? 's' : ''}
                    </div>
                    <div className="text-slate-400">{formatDate(tooltip.date)}</div>
                </div>
            )}
        </div>
    )
}

export default ContributionHeatmap

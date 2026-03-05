// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

// ────────────────────────────────────────────────────────────────────────────
// GitHub API Service — Client-side fetching with localStorage caching
// ────────────────────────────────────────────────────────────────────────────

const GITHUB_USERNAME = 'ggauravky'
const CACHE_KEY = 'github_contributions_cache'
const CACHE_DURATION = 2 * 60 * 60 * 1000 // 2 hours

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/**
 * Check if cached data is still valid
 */
function getCachedData() {
    try {
        const cached = localStorage.getItem(CACHE_KEY)
        if (!cached) return null
        
        const { data, timestamp } = JSON.parse(cached)
        const isExpired = Date.now() - timestamp > CACHE_DURATION
        
        return isExpired ? null : data
    } catch {
        return null
    }
}

/**
 * Save data to localStorage cache
 */
function setCachedData(data) {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
            data,
            timestamp: Date.now()
        }))
    } catch {
        // localStorage might be full or disabled
    }
}

/**
 * Clear the cache (useful for forcing refresh)
 */
export function clearGitHubCache() {
    try {
        localStorage.removeItem(CACHE_KEY)
    } catch {
        // ignore
    }
}

/**
 * Fetch GitHub contribution data using the public contributions API
 * This uses a third-party service since GitHub's GraphQL requires auth
 */
export async function fetchGitHubContributions() {
    // Check cache first
    const cached = getCachedData()
    if (cached) {
        return { ...cached, fromCache: true }
    }

    try {
        // Using GitHub Contributions API (unofficial but reliable)
        const response = await fetch(
            `https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}?y=last`
        )
        
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`)
        }

        const data = await response.json()
        
        // Process the contribution data
        const contributions = data.contributions || []
        const totalContributions = data.total?.lastYear || contributions.reduce((sum, day) => sum + day.count, 0)
        
        // Calculate streaks
        const { currentStreak, longestStreak } = calculateStreaks(contributions)
        
        // Get contributions by day of week and hour (for heatmap)
        const contributionsByDate = {}
        contributions.forEach(day => {
            contributionsByDate[day.date] = day.count
        })

        // Calculate additional stats
        const additionalStats = calculateAdditionalStats(contributions)

        const result = {
            username: GITHUB_USERNAME,
            totalContributions,
            currentStreak,
            longestStreak,
            contributions: contributionsByDate,
            contributionsArray: contributions,
            ...additionalStats,
            lastUpdated: new Date().toISOString(),
            fromCache: false
        }

        // Cache the result
        setCachedData(result)

        return result
    } catch (error) {
        console.error('Failed to fetch GitHub contributions:', error)
        throw error
    }
}

/**
 * Calculate additional stats from contribution data
 */
function calculateAdditionalStats(contributions) {
    if (!contributions || contributions.length === 0) {
        return {
            bestDay: null,
            bestDayCount: 0,
            mostActiveDay: null,
            averageDaily: 0,
            activeDays: 0,
            monthlyBreakdown: [],
            weekdayBreakdown: []
        }
    }

    // Find best day (most contributions)
    let bestDay = null
    let bestDayCount = 0
    
    // Count contributions by day of week
    const weekdayTotals = new Array(7).fill(0)
    const weekdayCounts = new Array(7).fill(0)
    
    // Monthly breakdown
    const monthlyMap = {}
    
    // Active days count
    let activeDays = 0

    contributions.forEach(day => {
        const date = new Date(day.date)
        const dayOfWeek = date.getDay()
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        
        // Best day
        if (day.count > bestDayCount) {
            bestDayCount = day.count
            bestDay = day.date
        }
        
        // Weekday stats
        weekdayTotals[dayOfWeek] += day.count
        weekdayCounts[dayOfWeek]++
        
        // Monthly
        if (!monthlyMap[monthKey]) {
            monthlyMap[monthKey] = { total: 0, days: 0, activeDays: 0 }
        }
        monthlyMap[monthKey].total += day.count
        monthlyMap[monthKey].days++
        if (day.count > 0) {
            monthlyMap[monthKey].activeDays++
            activeDays++
        }
    })

    // Find most active day of week
    const weekdayAverages = weekdayTotals.map((total, i) => 
        weekdayCounts[i] > 0 ? total / weekdayCounts[i] : 0
    )
    const maxAvgIndex = weekdayAverages.indexOf(Math.max(...weekdayAverages))
    const mostActiveDay = DAYS_OF_WEEK[maxAvgIndex]

    // Weekday breakdown for chart
    const weekdayBreakdown = DAYS_OF_WEEK.map((name, i) => ({
        day: name.slice(0, 3),
        total: weekdayTotals[i],
        average: weekdayAverages[i].toFixed(1)
    }))

    // Monthly breakdown (last 12 months)
    const monthlyBreakdown = Object.entries(monthlyMap)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .slice(-12)
        .map(([key, data]) => {
            const [year, month] = key.split('-')
            return {
                month: MONTHS[parseInt(month) - 1],
                year,
                total: data.total,
                activeDays: data.activeDays
            }
        })

    // Average daily
    const totalDays = contributions.length
    const totalCount = contributions.reduce((sum, day) => sum + day.count, 0)
    const averageDaily = totalDays > 0 ? (totalCount / totalDays).toFixed(1) : 0

    return {
        bestDay,
        bestDayCount,
        mostActiveDay,
        averageDaily: parseFloat(averageDaily),
        activeDays,
        monthlyBreakdown,
        weekdayBreakdown
    }
}

/**
 * Calculate current and longest streaks from contribution data
 */
function calculateStreaks(contributions) {
    if (!contributions || contributions.length === 0) {
        return { currentStreak: 0, longestStreak: 0 }
    }

    // Sort by date descending (most recent first)
    const sorted = [...contributions].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0
    let lastDate = null

    // Calculate current streak (from today backwards)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    for (const day of sorted) {
        const dayDate = new Date(day.date)
        dayDate.setHours(0, 0, 0, 0)
        
        // For current streak: must be consecutive from today or yesterday
        if (currentStreak === 0) {
            const diffFromToday = Math.floor((today - dayDate) / (1000 * 60 * 60 * 24))
            if (diffFromToday <= 1 && day.count > 0) {
                currentStreak = 1
                lastDate = dayDate
            } else if (diffFromToday > 1) {
                break
            }
        } else if (lastDate) {
            const diffFromLast = Math.floor((lastDate - dayDate) / (1000 * 60 * 60 * 24))
            if (diffFromLast === 1 && day.count > 0) {
                currentStreak++
                lastDate = dayDate
            } else {
                break
            }
        }
    }

    // Calculate longest streak
    const sortedAsc = [...contributions].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    
    lastDate = null
    for (const day of sortedAsc) {
        if (day.count > 0) {
            if (!lastDate) {
                tempStreak = 1
            } else {
                const currentDate = new Date(day.date)
                const diff = Math.floor((currentDate - lastDate) / (1000 * 60 * 60 * 24))
                if (diff === 1) {
                    tempStreak++
                } else {
                    tempStreak = 1
                }
            }
            longestStreak = Math.max(longestStreak, tempStreak)
            lastDate = new Date(day.date)
        } else {
            tempStreak = 0
            lastDate = null
        }
    }

    return { currentStreak, longestStreak }
}

/**
 * Get fallback data when API fails
 */
export function getGitHubFallbackData() {
    return {
        username: GITHUB_USERNAME,
        totalContributions: 450,
        currentStreak: 5,
        longestStreak: 28,
        contributions: {},
        contributionsArray: [],
        bestDay: null,
        bestDayCount: 0,
        mostActiveDay: 'Wednesday',
        averageDaily: 1.2,
        activeDays: 120,
        monthlyBreakdown: [],
        weekdayBreakdown: [],
        lastUpdated: null,
        fromCache: false,
        isFallback: true
    }
}

export { GITHUB_USERNAME }

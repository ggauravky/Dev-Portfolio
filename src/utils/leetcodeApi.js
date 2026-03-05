// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

// ────────────────────────────────────────────────────────────────────────────
// LeetCode API Service — Using LeetCode GraphQL with localStorage caching
// ────────────────────────────────────────────────────────────────────────────

const LEETCODE_USERNAME = 'gauravky'
const CACHE_KEY = 'leetcode_stats_cache'
const CACHE_DURATION = 2 * 60 * 60 * 1000 // 2 hours

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
export function clearLeetCodeCache() {
    try {
        localStorage.removeItem(CACHE_KEY)
    } catch {
        // ignore
    }
}

/**
 * Fetch LeetCode stats using GraphQL API
 */
async function fetchFromGraphQL() {
    const query = `
        query getUserProfile($username: String!) {
            matchedUser(username: $username) {
                username
                profile {
                    ranking
                    reputation
                    starRating
                }
                submitStats {
                    acSubmissionNum {
                        difficulty
                        count
                        submissions
                    }
                    totalSubmissionNum {
                        difficulty
                        count
                        submissions
                    }
                }
                userCalendar {
                    activeYears
                    streak
                    totalActiveDays
                    submissionCalendar
                }
                badges {
                    id
                    name
                    icon
                }
                languageProblemCount {
                    languageName
                    problemsSolved
                }
            }
            userContestRanking(username: $username) {
                attendedContestsCount
                rating
                globalRanking
                totalParticipants
                topPercentage
            }
        }
    `

    const response = await fetch('https://leetcode.com/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            query,
            variables: { username: LEETCODE_USERNAME }
        })
    })

    if (!response.ok) {
        throw new Error(`GraphQL error: ${response.status}`)
    }

    const result = await response.json()
    
    if (result.errors) {
        throw new Error(result.errors[0]?.message || 'GraphQL query failed')
    }

    return result.data
}

/**
 * Fetch from alternative API (alfa-leetcode-api)
 */
async function fetchFromAlternativeAPI() {
    const [profileRes, contestRes] = await Promise.all([
        fetch(`https://alfa-leetcode-api.onrender.com/userProfile/${LEETCODE_USERNAME}`),
        fetch(`https://alfa-leetcode-api.onrender.com/${LEETCODE_USERNAME}/contest`)
    ])

    if (!profileRes.ok) {
        throw new Error(`API error: ${profileRes.status}`)
    }

    const profile = await profileRes.json()
    const contest = contestRes.ok ? await contestRes.json() : null

    return { profile, contest }
}

/**
 * Main fetch function with fallback strategies
 */
export async function fetchLeetCodeStats() {
    // Check cache first
    const cached = getCachedData()
    if (cached) {
        return { ...cached, fromCache: true }
    }

    let data = null

    // Try GraphQL first (most reliable & accurate)
    try {
        const graphqlData = await fetchFromGraphQL()
        const user = graphqlData.matchedUser
        const contest = graphqlData.userContestRanking
        
        if (user) {
            const acStats = user.submitStats?.acSubmissionNum || []
            const totalStats = user.submitStats?.totalSubmissionNum || []
            
            const getCount = (arr, diff) => arr.find(s => s.difficulty === diff)?.count || 0
            const getSubmissions = (arr, diff) => arr.find(s => s.difficulty === diff)?.submissions || 0
            
            const calendar = user.userCalendar || {}
            let submissionCalendar = {}
            try {
                submissionCalendar = calendar.submissionCalendar 
                    ? JSON.parse(calendar.submissionCalendar) 
                    : {}
            } catch {
                submissionCalendar = {}
            }

            data = {
                username: LEETCODE_USERNAME,
                // Problem counts
                totalSolved: getCount(acStats, 'All'),
                easySolved: getCount(acStats, 'Easy'),
                mediumSolved: getCount(acStats, 'Medium'),
                hardSolved: getCount(acStats, 'Hard'),
                // Total problems available on LeetCode
                totalEasy: 850,
                totalMedium: 1800,
                totalHard: 800,
                // Rankings & reputation
                ranking: user.profile?.ranking || null,
                reputation: user.profile?.reputation || 0,
                starRating: user.profile?.starRating || 0,
                // Activity stats
                streak: calendar.streak || 0,
                totalActiveDays: calendar.totalActiveDays || 0,
                activeYears: calendar.activeYears || [],
                submissionCalendar,
                // Languages used
                languages: (user.languageProblemCount || [])
                    .sort((a, b) => b.problemsSolved - a.problemsSolved)
                    .slice(0, 5),
                // Badges
                badges: (user.badges || []).slice(0, 5),
                // Contest data
                contestRating: contest?.rating ? Math.round(contest.rating) : null,
                contestGlobalRanking: contest?.globalRanking || null,
                contestAttended: contest?.attendedContestsCount || 0,
                contestTopPercentage: contest?.topPercentage 
                    ? parseFloat(contest.topPercentage).toFixed(1) 
                    : null,
                // Acceptance rate
                acceptanceRate: calculateAcceptanceRate(acStats, totalStats),
                // Meta
                source: 'graphql',
                lastUpdated: new Date().toISOString(),
                fromCache: false
            }
        }
    } catch (error) {
        console.warn('GraphQL fetch failed, trying alternative API:', error.message)
    }

    // Fallback to alternative API
    if (!data) {
        try {
            const { profile, contest } = await fetchFromAlternativeAPI()
            
            data = {
                username: LEETCODE_USERNAME,
                totalSolved: profile.totalSolved || 0,
                easySolved: profile.easySolved || 0,
                mediumSolved: profile.mediumSolved || 0,
                hardSolved: profile.hardSolved || 0,
                totalEasy: profile.totalEasy || 850,
                totalMedium: profile.totalMedium || 1800,
                totalHard: profile.totalHard || 800,
                ranking: profile.ranking || null,
                reputation: profile.reputation || 0,
                starRating: 0,
                streak: 0,
                totalActiveDays: 0,
                activeYears: [],
                submissionCalendar: {},
                languages: [],
                badges: [],
                contestRating: contest?.contestRating ? Math.round(contest.contestRating) : null,
                contestGlobalRanking: contest?.contestGlobalRanking || null,
                contestAttended: contest?.contestAttend || 0,
                contestTopPercentage: contest?.contestTopPercentage || null,
                acceptanceRate: profile.acceptanceRate || null,
                source: 'alternative',
                lastUpdated: new Date().toISOString(),
                fromCache: false
            }
        } catch (error) {
            console.error('All LeetCode APIs failed:', error)
            throw error
        }
    }

    // Cache the result
    if (data) {
        setCachedData(data)
    }

    return data
}

/**
 * Calculate acceptance rate from submission stats
 */
function calculateAcceptanceRate(acStats, totalStats) {
    const accepted = acStats.find(s => s.difficulty === 'All')?.submissions || 0
    const total = totalStats.find(s => s.difficulty === 'All')?.submissions || 0
    if (total === 0) return null
    return ((accepted / total) * 100).toFixed(1)
}

/**
 * Get fallback data when ALL APIs fail
 * Updated to match actual profile: ~120 problems solved
 */
export function getLeetCodeFallbackData() {
    return {
        username: LEETCODE_USERNAME,
        totalSolved: 120,
        easySolved: 55,
        mediumSolved: 52,
        hardSolved: 13,
        totalEasy: 850,
        totalMedium: 1800,
        totalHard: 800,
        ranking: 350000,
        reputation: 0,
        starRating: 0,
        streak: 0,
        totalActiveDays: 45,
        activeYears: [2024, 2025, 2026],
        submissionCalendar: {},
        languages: [
            { languageName: 'Python', problemsSolved: 80 },
            { languageName: 'JavaScript', problemsSolved: 25 },
            { languageName: 'Java', problemsSolved: 15 }
        ],
        badges: [],
        contestRating: null,
        contestGlobalRanking: null,
        contestAttended: 0,
        contestTopPercentage: null,
        acceptanceRate: '58.5',
        source: 'fallback',
        lastUpdated: null,
        fromCache: false,
        isFallback: true
    }
}

export { LEETCODE_USERNAME }

// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { useEffect, useMemo, useState } from 'react'
import { fetchGitHubContributions, getGitHubFallbackData } from '../utils/githubApi'
import { fetchLeetCodeStats, getLeetCodeFallbackData } from '../utils/leetcodeApi'
import './StatsCards.css'

function StatsCards() {
    const [githubStats, setGithubStats] = useState(null)
    const [leetcodeStats, setLeetcodeStats] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        let isMounted = true

        const loadStats = async () => {
            setIsLoading(true)

            const [githubResult, leetcodeResult] = await Promise.allSettled([
                fetchGitHubContributions(),
                fetchLeetCodeStats()
            ])

            if (!isMounted) {
                return
            }

            const githubData = githubResult.status === 'fulfilled'
                ? githubResult.value
                : getGitHubFallbackData()

            const leetcodeData = leetcodeResult.status === 'fulfilled'
                ? leetcodeResult.value
                : getLeetCodeFallbackData()

            setGithubStats(githubData)
            setLeetcodeStats(leetcodeData)
            setIsLoading(false)
        }

        loadStats()

        return () => {
            isMounted = false
        }
    }, [])

    const leetProgress = useMemo(() => {
        if (!leetcodeStats) {
            return { easy: 0, medium: 0, hard: 0 }
        }

        const calcPercent = (solved, total) => {
            if (!total || total <= 0) {
                return 0
            }

            return Math.min(100, Math.round((solved / total) * 100))
        }

        return {
            easy: calcPercent(leetcodeStats.easySolved, leetcodeStats.totalEasy),
            medium: calcPercent(leetcodeStats.mediumSolved, leetcodeStats.totalMedium),
            hard: calcPercent(leetcodeStats.hardSolved, leetcodeStats.totalHard)
        }
    }, [leetcodeStats])

    const weeklyActivity = useMemo(() => {
        if (!githubStats?.weekdayBreakdown?.length) {
            return [
                { day: 'Mon', total: 0 },
                { day: 'Tue', total: 0 },
                { day: 'Wed', total: 0 },
                { day: 'Thu', total: 0 },
                { day: 'Fri', total: 0 },
                { day: 'Sat', total: 0 },
                { day: 'Sun', total: 0 }
            ]
        }

        return githubStats.weekdayBreakdown
    }, [githubStats])

    const maxDayTotal = Math.max(...weeklyActivity.map((day) => day.total), 1)

    if (isLoading) {
        return (
            <div className="stats-container">
                <div className="stats-skeleton-card" aria-hidden="true"></div>
                <div className="stats-skeleton-card" aria-hidden="true"></div>
            </div>
        )
    }

    return (
        <section className="stats-container" aria-label="Coding performance snapshot">
            <a
                href="https://github.com/ggauravky"
                target="_blank"
                rel="noopener noreferrer"
                className="stats-panel"
                aria-label="Open GitHub profile"
            >
                <div className="stats-panel-head">
                    <p className="stats-chip stats-chip-blue">GitHub</p>
                    <span className="stats-visit">Open profile ↗</span>
                </div>

                <h4 className="stats-title">Contribution Momentum</h4>

                <div className="stats-grid-two">
                    <div className="stats-metric">
                        <p className="stats-metric-label">Current Streak</p>
                        <p className="stats-metric-value">{githubStats?.currentStreak ?? 0}<span> days</span></p>
                    </div>
                    <div className="stats-metric">
                        <p className="stats-metric-label">Longest Streak</p>
                        <p className="stats-metric-value">{githubStats?.longestStreak ?? 0}<span> days</span></p>
                    </div>
                </div>

                <div className="stats-total-block">
                    <p className="stats-metric-label">Last Year Contributions</p>
                    <p className="stats-total">{(githubStats?.totalContributions ?? 0).toLocaleString()}</p>
                </div>

                <div className="stats-bars" aria-label="Weekly activity overview">
                    {weeklyActivity.map((day) => (
                        <div key={day.day} className="stats-bar-item">
                            <div
                                className="stats-bar-fill"
                                style={{ height: `${Math.max(10, (day.total / maxDayTotal) * 100)}%` }}
                                title={`${day.day}: ${day.total}`}
                            ></div>
                            <span>{day.day}</span>
                        </div>
                    ))}
                </div>
            </a>

            <a
                href="https://leetcode.com/gauravky"
                target="_blank"
                rel="noopener noreferrer"
                className="stats-panel"
                aria-label="Open LeetCode profile"
            >
                <div className="stats-panel-head">
                    <p className="stats-chip stats-chip-gold">LeetCode</p>
                    <span className="stats-visit">Open profile ↗</span>
                </div>

                <h4 className="stats-title">Problem Solving Snapshot</h4>

                <div className="stats-total-block">
                    <p className="stats-metric-label">Problems Solved</p>
                    <p className="stats-total">{leetcodeStats?.totalSolved ?? 0}</p>
                </div>

                <div className="stats-progress-stack">
                    <div className="stats-progress-row">
                        <div className="stats-progress-labels">
                            <span>Easy</span>
                            <span>{leetcodeStats?.easySolved ?? 0} / {leetcodeStats?.totalEasy ?? 0}</span>
                        </div>
                        <div className="stats-progress-track">
                            <div className="stats-progress-fill stats-progress-easy" style={{ width: `${leetProgress.easy}%` }}></div>
                        </div>
                    </div>

                    <div className="stats-progress-row">
                        <div className="stats-progress-labels">
                            <span>Medium</span>
                            <span>{leetcodeStats?.mediumSolved ?? 0} / {leetcodeStats?.totalMedium ?? 0}</span>
                        </div>
                        <div className="stats-progress-track">
                            <div className="stats-progress-fill stats-progress-medium" style={{ width: `${leetProgress.medium}%` }}></div>
                        </div>
                    </div>

                    <div className="stats-progress-row">
                        <div className="stats-progress-labels">
                            <span>Hard</span>
                            <span>{leetcodeStats?.hardSolved ?? 0} / {leetcodeStats?.totalHard ?? 0}</span>
                        </div>
                        <div className="stats-progress-track">
                            <div className="stats-progress-fill stats-progress-hard" style={{ width: `${leetProgress.hard}%` }}></div>
                        </div>
                    </div>
                </div>

                <div className="stats-grid-two">
                    <div className="stats-metric">
                        <p className="stats-metric-label">Global Rank</p>
                        <p className="stats-metric-value">{leetcodeStats?.ranking ? `#${leetcodeStats.ranking.toLocaleString()}` : 'N/A'}</p>
                    </div>
                    <div className="stats-metric">
                        <p className="stats-metric-label">Acceptance Rate</p>
                        <p className="stats-metric-value">{leetcodeStats?.acceptanceRate ? `${leetcodeStats.acceptanceRate}%` : 'N/A'}</p>
                    </div>
                </div>
            </a>
        </section>
    )
}

export default StatsCards

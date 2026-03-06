// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { useState } from 'react'
import './StatsCards.css'

function StatsCards() {
    const [githubLoaded, setGithubLoaded] = useState(false)
    const [leetcodeLoaded, setLeetcodeLoaded] = useState(false)
    const [githubError, setGithubError] = useState(false)
    const [leetcodeError, setLeetcodeError] = useState(false)

    return (
        <div className="stats-container">
            {/* GitHub Stats Card */}
            <a 
                href="https://github.com/ggauravky" 
                target="_blank" 
                rel="noopener noreferrer"
                className="stat-card group"
                aria-label="Visit GitHub Profile"
            >
                <div className="stat-card-header">
                    <div className="stat-icon">🔥</div>
                    <h3 className="stat-title">GitHub Streak</h3>
                    <span className="stat-link-icon">↗</span>
                </div>
                <div className="stat-content">
                    <div className={`stat-image-wrapper ${githubLoaded ? 'loaded' : 'loading'}`}>
                        {!githubLoaded && !githubError && (
                            <div className="stat-skeleton">
                                <div className="skeleton-pulse"></div>
                                <span className="skeleton-text">Loading GitHub Stats...</span>
                            </div>
                        )}
                        {githubError ? (
                            <div className="stat-error">
                                <span className="stat-error-icon">🔥</span>
                                <span className="stat-error-text">Stats temporarily unavailable</span>
                                <a href="https://github.com/ggauravky" target="_blank" rel="noopener noreferrer" className="stat-error-link">View on GitHub ↗</a>
                            </div>
                        ) : (
                            <img 
                                src="https://nirzak-streak-stats.vercel.app/?user=ggauravky&theme=dark&hide_border=false" 
                                alt="GitHub Streak Stats - 1660+ days streak"
                                onLoad={() => setGithubLoaded(true)}
                                onError={() => { setGithubError(true); setGithubLoaded(true); }}
                                className="stat-image"
                                loading="lazy"
                            />
                        )}
                    </div>
                    <div className="stat-badge">
                        <span className="badge-emoji">⚡</span>
                        <span className="badge-text">GitHub Champion</span>
                    </div>
                </div>
            </a>

            {/* LeetCode Stats Card */}
            <a 
                href="https://leetcode.com/gauravky" 
                target="_blank" 
                rel="noopener noreferrer"
                className="stat-card group"
                aria-label="Visit LeetCode Profile"
            >
                <div className="stat-card-header">
                    <div className="stat-icon">💻</div>
                    <h3 className="stat-title">LeetCode Progress</h3>
                    <span className="stat-link-icon">↗</span>
                </div>
                <div className="stat-content">
                    <div className={`stat-image-wrapper ${leetcodeLoaded ? 'loaded' : 'loading'}`}>
                        {!leetcodeLoaded && !leetcodeError && (
                            <div className="stat-skeleton">
                                <div className="skeleton-pulse"></div>
                                <span className="skeleton-text">Loading LeetCode Stats...</span>
                            </div>
                        )}
                        {leetcodeError ? (
                            <div className="stat-error">
                                <span className="stat-error-icon">💻</span>
                                <span className="stat-error-text">Stats temporarily unavailable</span>
                                <a href="https://leetcode.com/gauravky" target="_blank" rel="noopener noreferrer" className="stat-error-link">View on LeetCode ↗</a>
                            </div>
                        ) : (
                            <img 
                                src="https://leetcard.jacoblin.cool/gauravky?theme=dark&ext=heatmap" 
                                alt="LeetCode Stats and Problem Solving Progress"
                                onLoad={() => setLeetcodeLoaded(true)}
                                onError={() => { setLeetcodeError(true); setLeetcodeLoaded(true); }}
                                className="stat-image"
                                loading="lazy"
                            />
                        )}
                    </div>
                    <div className="stat-badge">
                        <span className="badge-emoji">🎯</span>
                        <span className="badge-text">Coding Champion</span>
                    </div>
                </div>
            </a>
        </div>
    )
}

export default StatsCards

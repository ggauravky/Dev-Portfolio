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
        <div className="stats-container grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 w-full">
            {/* GitHub Stats Card */}
            <a 
                href="https://github.com/ggauravky" 
                target="_blank" 
                rel="noopener noreferrer"
                className="stat-card group"
                aria-label="Visit GitHub Profile"
            >
                <div className="stat-card-header">
                    <div className="stat-icon"><svg className="w-full h-full" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.047 8.287 8.287 0 009 9.601a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.468 5.99 5.99 0 00-1.925 3.547 5.975 5.975 0 01-2.133-1A3.75 3.75 0 0012 18z" /></svg></div>
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
                                <span className="stat-error-icon"><svg className="w-full h-full" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.047 8.287 8.287 0 009 9.601a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.468 5.99 5.99 0 00-1.925 3.547 5.975 5.975 0 01-2.133-1A3.75 3.75 0 0012 18z" /></svg></span>
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
                        <span className="badge-emoji"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg></span>
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
                    <div className="stat-icon"><svg className="w-full h-full" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" /></svg></div>
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
                                <span className="stat-error-icon"><svg className="w-full h-full" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" /></svg></span>
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
                        <span className="badge-emoji"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" /></svg></span>
                        <span className="badge-text">Coding Champion</span>
                    </div>
                </div>
            </a>
        </div>
    )
}

export default StatsCards

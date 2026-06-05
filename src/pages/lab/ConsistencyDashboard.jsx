// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { useState } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import useSEO from '../../hooks/useSEO'

const GITHUB_USERNAME = 'ggauravky'
const LEETCODE_USERNAME = 'gauravky'

// ── External service image URLs ───────────────────────────────────────────────
const STREAK_IMG       = `https://github-readme-streak-stats.herokuapp.com?user=${GITHUB_USERNAME}&theme=dark`
const GITHUB_STATS_IMG = `https://github-profile-summary-cards.vercel.app/api/cards/stats?username=${GITHUB_USERNAME}&theme=github_dark`
const TOP_LANGS_IMG    = `https://github-profile-summary-cards.vercel.app/api/cards/repos-per-language?username=${GITHUB_USERNAME}&theme=github_dark`
const GITHUB_ACTIVITY_IMG = `https://github-readme-activity-graph.vercel.app/graph?username=${GITHUB_USERNAME}&bg_color=0e0e11&color=a1a1aa&line=c5f82a&point=ff5d00&area=true&hide_border=true&area_color=c5f82a`
const LEETCODE_IMG     = `https://leetcard.jacoblin.cool/${LEETCODE_USERNAME}?theme=dark&ext=heatmap&border=0&radius=8`

// ── Stat Image — skeleton while loading, error state on failure ───────────────
function StatsImage({ src, alt, skeletonH = 'h-44', fallbackHref, className = '' }) {
    const [status, setStatus] = useState('loading') // 'loading' | 'loaded' | 'error'

    return (
        <div className={`w-full ${className}`}>
            {status === 'loading' && (
                <div className={`${skeletonH} bg-obsidian border border-[#1a1a22] rounded-md flex items-center justify-center animate-pulse`}>
                    <svg className="animate-spin h-5 w-5 text-zinc-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                </div>
            )}
            {status === 'error' && (
                <div className={`${skeletonH} bg-[#0e0e11] border border-[#1a1a22] rounded-md flex flex-col items-center justify-center gap-2 text-[#52525b]`}>
                    <svg className="h-6 w-6 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    </svg>
                    <p className="text-xs font-mono uppercase tracking-widest text-zinc-500">Could not load stats</p>
                    {fallbackHref && (
                        <a href={fallbackHref} target="_blank" rel="noopener noreferrer" className="text-xs text-toxic hover:underline">
                            Open directly →
                        </a>
                    )}
                </div>
            )}
            <img
                src={src}
                alt={alt}
                decoding="async"
                className="w-full rounded-md transition-opacity duration-500"
                style={{ display: status === 'loaded' ? 'block' : 'none' }}
                onLoad={() => setStatus('loaded')}
                onError={() => setStatus('error')}
            />
        </div>
    )
}

StatsImage.propTypes = {
    src: PropTypes.string.isRequired,
    alt: PropTypes.string.isRequired,
    skeletonH: PropTypes.string,
    fallbackHref: PropTypes.string,
    className: PropTypes.string,
}

// ── Section heading ───────────────────────────────────────────────────────────
function SectionHeading({ icon, title, subtitle, href, linkLabel }) {
    return (
        <div className="flex items-start justify-between mb-5">
            <h2 className="text-base font-display font-bold text-white flex items-center gap-2 flex-wrap">
                <span className="shrink-0">{icon}</span>
                <span>{title}</span>
                {subtitle && (
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-normal">{subtitle}</span>
                )}
            </h2>
            {href && (
                <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 hover:text-toxic transition-colors flex items-center gap-1 mt-1 shrink-0"
                >
                    {linkLabel ?? 'View profile'}
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                </a>
            )}
        </div>
    )
}

SectionHeading.propTypes = {
    icon: PropTypes.node.isRequired,
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string,
    href: PropTypes.string,
    linkLabel: PropTypes.string,
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ConsistencyDashboard() {
    useSEO({
        title: 'Consistency Dashboard · Gaurav Lab',
        description: "Real-time view of Gaurav's GitHub contribution streaks, activity graph, and LeetCode problem-solving progress.",
        keywords: 'GitHub Streak, LeetCode Stats, Coding Consistency, Contribution Graph, Developer Activity',
        ogImage: 'https://ggauravky.vercel.app/images/profile.jpg',
    })

    const [copied, setCopied] = useState(false)

    const handleShare = async () => {
        const text = `Check out my coding stats!\nGitHub: https://github.com/${GITHUB_USERNAME}\nLeetCode: https://leetcode.com/u/${LEETCODE_USERNAME}`
        try {
            await navigator.clipboard.writeText(text)
        } catch {
            globalThis.prompt('Copy and share your stats text:', text)
        }
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <main className="min-h-screen bg-[#070708] py-16 sm:py-20 px-4 relative overflow-hidden">
            {/* Ambient gradients */}
            <div className="absolute top-[-80px] right-[-80px] w-[480px] h-[480px] bg-toxic/3 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-60px] left-[-60px] w-[420px] h-[420px] bg-cyber/3 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-5xl mx-auto relative z-10">
                {/* Back nav */}
                <div className="mb-10">
                    <Link
                        to="/lab"
                        className="inline-flex items-center gap-2 text-zinc-400 hover:text-toxic text-xs font-mono uppercase tracking-wider transition-colors group"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform duration-200">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                        Back to Lab
                    </Link>
                </div>

                {/* Header */}
                <div className="text-center mb-14">
                    <span className="inline-flex items-center gap-2 text-toxic text-xs font-mono tracking-wider uppercase mb-5 px-3 py-1.5 bg-toxic/5 rounded-md border border-toxic/20">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-toxic opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-toxic" />
                        </span>{' '}
                        Real-time Data
                    </span>

                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-black mb-5 uppercase tracking-tight text-white">
                        Consistency <span className="bg-gradient-to-r from-toxic via-white to-cyber bg-clip-text text-transparent">Stats</span>
                    </h1>

                    <p className="text-[#a1a1aa] text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
                        Real-time GitHub streaks, LeetCode progress, and contribution activity — straight from the source.
                    </p>

                    {/* Action buttons */}
                    <div className="flex flex-wrap justify-center gap-3 mt-7">
                        <a href={`https://github.com/${GITHUB_USERNAME}`} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-5 py-3 border border-[#1a1a22] bg-[#0e0e11] hover:border-toxic/30 text-zinc-300 text-xs font-mono uppercase font-bold hover:text-toxic transition-all rounded-md">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                            @{GITHUB_USERNAME}
                        </a>
                        <a href={`https://leetcode.com/u/${LEETCODE_USERNAME}`} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-5 py-3 border border-[#1a1a22] bg-[#0e0e11] hover:border-cyber/30 text-zinc-300 text-xs font-mono uppercase font-bold hover:text-cyber transition-all rounded-md">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z" />
                            </svg>
                            @{LEETCODE_USERNAME}
                        </a>

                        <button onClick={handleShare}
                            className="inline-flex items-center gap-2 px-5 py-3 bg-toxic text-obsidian text-xs font-mono uppercase font-bold hover:bg-white transition-all rounded-md shadow-[2px_2px_0px_0px_rgba(197,248,42,0.3)] hover:shadow-none hover:translate-y-[2px]">
                            {copied ? (
                                <>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Copied!</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                    </svg>
                                    <span>Share Stats</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* ── ROW 1: GitHub Streak | GitHub Stats ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
                    <div className="bg-[#0e0e11] border border-[#1a1a22] rounded-lg p-5">
                        <SectionHeading
                            icon={<svg className="w-5 h-5 text-cyber" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.468 5.99 5.99 0 00-1.925 3.547 5.975 5.975 0 01-2.133-1.001A3.75 3.75 0 0012 18z" /></svg>}
                            title="Streak Stats"
                            href={`https://github.com/${GITHUB_USERNAME}`}
                            linkLabel="GitHub"
                        />
                        <StatsImage
                            src={STREAK_IMG}
                            alt="GitHub Streak Stats"
                            skeletonH="h-36"
                            fallbackHref={`https://github.com/${GITHUB_USERNAME}`}
                        />
                    </div>
                    <div className="bg-[#0e0e11] border border-[#1a1a22] rounded-lg p-5">
                        <SectionHeading
                            icon={<svg className="w-5 h-5 text-toxic" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>}
                            title="GitHub Stats"
                            href={`https://github.com/${GITHUB_USERNAME}`}
                            linkLabel="GitHub"
                        />
                        <StatsImage
                            src={GITHUB_STATS_IMG}
                            alt="GitHub Stats Card"
                            skeletonH="h-36"
                            fallbackHref={`https://github.com/${GITHUB_USERNAME}`}
                        />
                    </div>
                </div>

                {/* ── ROW 2: LeetCode | Top Languages ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
                    <div className="bg-[#0e0e11] border border-[#1a1a22] rounded-lg p-5">
                        <SectionHeading
                            icon={<svg className="w-5 h-5 text-cyber" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>}
                            title="LeetCode"
                            href={`https://leetcode.com/u/${LEETCODE_USERNAME}`}
                            linkLabel="Profile"
                        />
                        <StatsImage
                            src={LEETCODE_IMG}
                            alt="LeetCode Stats Card"
                            skeletonH="h-72"
                            fallbackHref={`https://leetcode.com/u/${LEETCODE_USERNAME}`}
                        />
                    </div>

                    <div className="bg-[#0e0e11] border border-[#1a1a22] rounded-lg p-5">
                        <SectionHeading
                            icon={<svg className="w-5 h-5 text-toxic" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" /></svg>}
                            title="Top Languages"
                            href={`https://github.com/${GITHUB_USERNAME}?tab=repositories`}
                            linkLabel="Repos"
                        />
                        <StatsImage
                            src={TOP_LANGS_IMG}
                            alt="Top Languages"
                            skeletonH="h-40"
                            fallbackHref={`https://github.com/${GITHUB_USERNAME}`}
                        />
                    </div>
                </div>

                {/* ── ROW 3: Contribution Activity Graph ── */}
                <div className="bg-[#0e0e11] border border-[#1a1a22] rounded-lg p-5 mb-5">
                    <SectionHeading
                        icon={<svg className="w-5 h-5 text-toxic" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>}
                        title="Contribution Activity"
                        subtitle="Last year"
                        href={`https://github.com/${GITHUB_USERNAME}?tab=overview`}
                        linkLabel="View on GitHub"
                    />
                    <StatsImage
                        src={GITHUB_ACTIVITY_IMG}
                        alt="GitHub Contribution Activity Graph"
                        skeletonH="h-52"
                        fallbackHref={`https://github.com/${GITHUB_USERNAME}`}
                        className="overflow-hidden"
                    />
                </div>

                {/* Footer */}
                <div className="text-center pt-6 border-t border-[#1a1a22]/60 mt-4">
                    <p className="text-[#52525b] text-xs font-mono flex flex-wrap justify-center gap-x-3 gap-y-1">
                        <span>Stats powered by</span>
                        <a href="https://github.com/DenverCoder1/github-readme-streak-stats" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-toxic">github-readme-streak-stats</a>
                        <span>·</span>
                        <a href="https://github.com/vn7n24fzkq/github-profile-summary-cards" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-toxic">profile-summary-cards</a>
                        <span>·</span>
                        <a href="https://github.com/Ashutosh00710/github-readme-activity-graph" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-toxic">activity-graph</a>
                        <span>·</span>
                        <a href="https://github.com/JacobLinCool/LeetCode-Stats-Card" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-toxic">leetcard</a>
                    </p>
                    <p className="text-[#52525b] text-[10px] font-mono mt-1.5">
                        // All data fetched live — no caching, no fallbacks, no static placeholders.
                    </p>
                </div>
            </div>
        </main>
    )
}

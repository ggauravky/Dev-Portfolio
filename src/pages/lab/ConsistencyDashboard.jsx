// ────────────────────────────────────────────────────────────────────────────
// ConsistencyDashboard — GitHub + LeetCode activity tracking
// Uses external stats image services for accurate, real-time data.
// ────────────────────────────────────────────────────────────────────────────
import { useState } from 'react'
import { Link } from 'react-router-dom'
import useSEO from '../../hooks/useSEO'

const GITHUB_USERNAME = 'ggauravky'
const LEETCODE_USERNAME = 'gauravky'

// ── External service image URLs ───────────────────────────────────────────────
// github-readme-stats.vercel.app public instance is heavily rate-limited →
// using github-profile-summary-cards (different project, different rate limits)
// for GitHub Stats and Top Languages instead.
const STREAK_IMG       = `https://nirzak-streak-stats.vercel.app/?user=${GITHUB_USERNAME}&theme=dark&hide_border=true&background=0f172a&ring=22d3ee&fire=a855f7&currStreakLabel=22d3ee&currStreakNum=f1f5f9&sideLabels=94a3b8&sideNums=f1f5f9&stroke=30363d&dates=64748b&card_width=500`
const GITHUB_STATS_IMG = `https://github-profile-summary-cards.vercel.app/api/cards/stats?username=${GITHUB_USERNAME}&theme=github_dark`
const TOP_LANGS_IMG    = `https://github-profile-summary-cards.vercel.app/api/cards/repos-per-language?username=${GITHUB_USERNAME}&theme=github_dark`
const ACTIVITY_IMG     = `https://github-readme-activity-graph.vercel.app/graph?username=${GITHUB_USERNAME}&bg_color=0f172a&color=7fdbca&line=c792ea&point=ffeb95&area=true&hide_border=true&area_color=c792ea`
const LEETCODE_IMG     = `https://leetcard.jacoblin.cool/${LEETCODE_USERNAME}?theme=dark&ext=heatmap&border=0&radius=8`

// ── Stat Image — skeleton while loading, error state on failure ───────────────
// IMPORTANT: do NOT use loading="lazy" here — browsers skip fetching images
// with height:0, so onLoad never fires and the card stays stuck on skeleton.
function StatsImage({ src, alt, skeletonH = 'h-44', fallbackHref, className = '' }) {
    const [status, setStatus] = useState('loading') // 'loading' | 'loaded' | 'error'

    return (
        <div className={`w-full ${className}`}>
            {status === 'loading' && (
                <div className={`${skeletonH} bg-slate-700/30 rounded-xl flex items-center justify-center animate-pulse`}>
                    <svg className="animate-spin h-5 w-5 text-slate-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                </div>
            )}
            {status === 'error' && (
                <div className={`${skeletonH} bg-slate-800/60 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-500`}>
                    <svg className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    </svg>
                    <p className="text-sm">Could not load stats</p>
                    {fallbackHref && (
                        <a href={fallbackHref} target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-400 hover:underline">
                            Open directly →
                        </a>
                    )}
                </div>
            )}
            {/* style display:none keeps the img in the DOM so the browser fetches it,
                but doesn't affect layout — unlike invisible+h-0 which breaks lazy loading */}
            <img
                src={src}
                alt={alt}
                decoding="async"
                className="w-full rounded-xl transition-opacity duration-500"
                style={{ display: status === 'loaded' ? 'block' : 'none' }}
                onLoad={() => setStatus('loaded')}
                onError={() => setStatus('error')}
            />
        </div>
    )
}

// ── Section heading ───────────────────────────────────────────────────────────
function SectionHeading({ icon, title, subtitle, href, linkLabel }) {
    return (
        <div className="flex items-start justify-between mb-5">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2 flex-wrap">
                <span>{icon}</span>
                <span>{title}</span>
                {subtitle && (
                    <span className="text-xs text-slate-500 font-normal">{subtitle}</span>
                )}
            </h2>
            {href && (
                <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-1 mt-1 shrink-0"
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
        const text = `🔥 Check out my coding stats!\nGitHub: https://github.com/${GITHUB_USERNAME}\n⚡ LeetCode: https://leetcode.com/u/${LEETCODE_USERNAME}`
        try {
            await navigator.clipboard.writeText(text)
        } catch {
            const el = document.createElement('textarea')
            el.value = text
            document.body.appendChild(el)
            el.select()
            document.execCommand('copy')
            document.body.removeChild(el)
        }
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <main className="min-h-screen bg-slate-900 py-16 sm:py-20 px-4 relative overflow-hidden">

            {/* Ambient background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute -top-60 -right-60 w-[500px] h-[500px] bg-cyan-600/6 rounded-full blur-3xl" />
                <div className="absolute -bottom-60 -left-60 w-[500px] h-[500px] bg-purple-600/6 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-600/3 rounded-full blur-3xl" />
            </div>

            <div className="max-w-5xl mx-auto">

                {/* ── Back nav ── */}
                <div className="mb-10">
                    <Link
                        to="/lab"
                        className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 text-sm font-medium transition-colors group"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform duration-200">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                        Back to Lab
                    </Link>
                </div>

                {/* ── Header ── */}
                <div className="text-center mb-14">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 text-sm font-semibold mb-6">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                        Live Data
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-5">
                        <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
                            Consistency Dashboard
                        </span>
                    </h1>
                    <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">
                        Real-time GitHub streaks, LeetCode progress, coding hours, and contribution activity — straight from the source.
                    </p>

                    {/* Action buttons */}
                    <div className="flex flex-wrap justify-center gap-3 mt-7">
                        <a href={`https://github.com/${GITHUB_USERNAME}`} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-full text-slate-300 text-sm font-medium hover:border-slate-500 hover:text-white transition-all">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                            @{GITHUB_USERNAME}
                        </a>
                        <a href={`https://leetcode.com/u/${LEETCODE_USERNAME}`} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-full text-slate-300 text-sm font-medium hover:border-amber-500/50 hover:text-amber-400 transition-all">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z" />
                            </svg>
                            @{LEETCODE_USERNAME}
                        </a>

                        <button onClick={handleShare}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-full text-slate-300 text-sm font-medium hover:border-emerald-500/50 hover:text-emerald-400 transition-all">
                            {copied ? (
                                <>
                                    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-emerald-400">Copied!</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                    </svg>
                                    Share
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════
                    ROW 1: GitHub Streak  |  GitHub Stats
                    ═══════════════════════════════════════════════ */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
                    <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 backdrop-blur-sm">
                        <SectionHeading
                            icon="🔥"
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
                    <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 backdrop-blur-sm">
                        <SectionHeading
                            icon="📊"
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

                {/* ═══════════════════════════════════════════════
                    ROW 2: LeetCode  |  Top Languages
                    ═══════════════════════════════════════════════ */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
                    {/* LeetCode — tall card with built-in heatmap */}
                    <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 backdrop-blur-sm">
                        <SectionHeading
                            icon="⚡"
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

                    {/* Top Languages */}
                    <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 backdrop-blur-sm">
                        <SectionHeading
                            icon="🗂️"
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

                {/* ═══════════════════════════════════════════════
                    ROW 3 (full-width): Contribution Activity Graph
                    ═══════════════════════════════════════════════ */}
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 mb-5 backdrop-blur-sm">
                    <SectionHeading
                        icon="📈"
                        title="Contribution Activity"
                        subtitle="Last year"
                        href={`https://github.com/${GITHUB_USERNAME}?tab=overview`}
                        linkLabel="View on GitHub"
                    />
                    <StatsImage
                        src={ACTIVITY_IMG}
                        alt="GitHub Contribution Activity Graph"
                        skeletonH="h-52"
                        fallbackHref={`https://github.com/${GITHUB_USERNAME}`}
                        className="overflow-hidden"
                    />
                </div>

                {/* ── Footer ── */}
                <div className="text-center pt-6 border-t border-slate-800/80 mt-4">
                    <p className="text-slate-500 text-sm flex flex-wrap justify-center gap-x-3 gap-y-1">
                        <span>Stats powered by</span>
                        <a href="https://git.io/streak-stats" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-cyan-400 transition-colors">nirzak-streak-stats</a>
                        <span className="text-slate-700">·</span>
                        <a href="https://github.com/vn7n24fzkq/github-profile-summary-cards" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-cyan-400 transition-colors">profile-summary-cards</a>
                        <span className="text-slate-700">·</span>
                        <a href="https://github.com/Ashutosh00710/github-readme-activity-graph" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-cyan-400 transition-colors">activity-graph</a>
                        <span className="text-slate-700">·</span>
                        <a href="https://github.com/JacobLinCool/LeetCode-Stats-Card" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-cyan-400 transition-colors">leetcard</a>
                    </p>
                    <p className="text-slate-600 text-xs mt-1">
                        All data fetched live — no caching, no fallbacks, no fake numbers.
                    </p>
                </div>

            </div>
        </main>
    )
}


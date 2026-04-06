// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { Link } from 'react-router-dom'
import useSEO from '../hooks/useSEO'
import './Lab.css'

function Lab() {
    useSEO({
        title: 'Lab - Gaurav Portfolio | AI, ML & Experimental Features',
        description: 'Explore live AI and ML demos in Gaurav Kumar Yadav\'s Lab, including real TensorFlow.js image classification and NLP prompt enhancement.',
        keywords: 'Gaurav Portfolio Lab, AI Demos, ML Experiments, TensorFlow.js, MobileNet, Prompt Engineering, NLP, Interactive Tools',
        ogImage: 'https://ggauravky.vercel.app/images/profile.jpg'
    })

    return (
        <main className="min-h-screen bg-slate-900 py-16 sm:py-20 px-4">
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl"></div>
            </div>

            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 text-sm font-semibold mb-6">
                        <span>Live Demos</span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
                        <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                            Lab
                        </span>
                    </h1>

                    <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
                        Production-ready AI features running on free infrastructure. Explore real browser ML and NLP workflows.
                    </p>
                </div>

                {/* ── 2×2 card grid ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-10">

                    {/* Card 1 — AI Chatbot */}
                    <Link
                        to="/lab/gaurav-chatbot"
                        className="group relative p-6 bg-slate-800/50 border border-slate-700/50 rounded-2xl hover:border-blue-500/40 hover:bg-slate-800/80 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 overflow-hidden block"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                        <div className="relative">
                            <svg className="w-8 h-8 mb-3 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z" /></svg>
                            <h3 className="text-white font-semibold text-lg mb-1">AI Chatbot</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                This module is temporarily under maintenance while response quality and stability are being improved.
                            </p>
                        </div>
                        <span className="absolute top-4 right-4 text-xs px-2 py-1 bg-amber-600/20 text-amber-300 rounded-full border border-amber-500/30 font-semibold">
                            Under Maintenance
                        </span>
                    </Link>

                    {/* Card 2 — ML Demos */}
                    <Link
                        to="/lab/ml-demos"
                        className="group relative p-6 bg-slate-800/50 border border-slate-700/50 rounded-2xl hover:border-cyan-500/40 hover:bg-slate-800/80 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 overflow-hidden block"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                        <div className="relative">
                            <svg className="w-8 h-8 mb-3 text-cyan-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .03 2.698-1.4 2.698H4.2c-1.43 0-2.4-1.698-1.4-2.698L4.8 15.3M12 12h.008v.008H12V12z" /></svg>
                            <h3 className="text-white font-semibold text-lg mb-1">ML Demos</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                This module is temporarily under maintenance while model loading and demo reliability are being upgraded.
                            </p>
                            <div className="flex flex-wrap gap-2 mt-3">
                                <span className="text-xs px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded-full border border-cyan-500/20">Image Analyzer</span>
                                <span className="text-xs px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded-full border border-purple-500/20">Prompt Improver</span>
                            </div>
                        </div>
                        <span className="absolute top-4 right-4 text-xs px-2 py-1 bg-amber-600/20 text-amber-300 rounded-full border border-amber-500/30 font-semibold">
                            Under Maintenance
                        </span>
                    </Link>

                    {/* Card 3 — Consistency Dashboard */}
                    <Link
                        to="/lab/consistency-dashboard"
                        className="group relative p-6 bg-slate-800/50 border border-slate-700/50 rounded-2xl hover:border-emerald-500/40 hover:bg-slate-800/80 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10 overflow-hidden block"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/5 to-teal-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                        <div className="relative">
                            <svg className="w-8 h-8 mb-3 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
                            <h3 className="text-white font-semibold text-lg mb-1">Consistency Dashboard</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                This module is temporarily under maintenance while data reliability and rendering consistency are being improved.
                            </p>
                            <div className="flex flex-wrap gap-2 mt-3">
                                <span className="text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">GitHub Heatmap</span>
                                <span className="text-xs px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20">LeetCode Stats</span>
                            </div>
                        </div>
                        <span className="absolute top-4 right-4 text-xs px-2 py-1 bg-amber-600/20 text-amber-300 rounded-full border border-amber-500/30 font-semibold">
                            Under Maintenance
                        </span>
                    </Link>

                    {/* Card 4 — Next Lab Drop */}
                    <div className="group relative p-6 bg-slate-800/50 border border-slate-700/50 rounded-2xl hover:border-amber-500/30 hover:bg-slate-800/70 transition-all duration-300 overflow-hidden cursor-not-allowed">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-600/3 to-orange-600/3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                        <div className="relative">
                            <svg className="w-8 h-8 mb-3 text-amber-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>
                            <h3 className="text-white font-semibold text-lg mb-1">Next Lab Drop</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                More practical ML and engineering demos are in progress for this section.
                            </p>
                        </div>
                        <span className="absolute top-4 right-4 text-xs px-2 py-1 bg-slate-700/80 text-slate-400 rounded-full border border-slate-600/50">
                            Coming Soon
                        </span>
                    </div>

                </div>

                <p className="text-center text-slate-500 text-sm mt-12">
                    Built for real-world behavior: fast loading, resilient UX, and production-safe execution.
                </p>
            </div>
        </main>
    )
}

export default Lab

// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { Link } from 'react-router-dom'
import useSEO from '../hooks/useSEO'
import NeuralNetworkCanvas from '../components/NeuralNetworkCanvas'


function Lab() {
    useSEO({
        title: 'Lab - Gaurav Portfolio | AI, ML & Experimental Features',
        description: 'Explore live AI and ML demos in Gaurav Kumar Yadav\'s Lab, including real TensorFlow.js image classification and NLP prompt enhancement.',
        keywords: 'Gaurav Portfolio Lab, AI Demos, ML Experiments, TensorFlow.js, MobileNet, Prompt Engineering, NLP, Interactive Tools',
        ogImage: 'https://ggauravky.vercel.app/images/profile.jpg'
    })

    return (
        <main className="min-h-screen bg-[#070708] py-16 sm:py-20 px-4 relative overflow-hidden">
            {/* Ambient gradients */}
            <div className="absolute top-[-80px] right-[-80px] w-[480px] h-[480px] bg-toxic/3 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-60px] left-[-60px] w-[420px] h-[420px] bg-cyber/3 rounded-full blur-3xl pointer-events-none" />

            {/* Background Neural Network Canvas in lightweight mode */}
            <NeuralNetworkCanvas lightweight={true} />

            <div className="max-w-6xl mx-auto relative z-10">
                <div className="text-center mb-12">
                    <span className="inline-flex items-center gap-2 text-toxic text-xs font-mono tracking-wider uppercase mb-5 px-3 py-1.5 bg-toxic/5 rounded-md border border-toxic/20">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-toxic opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-toxic" />
                        </span>{' '}
                        Experimental Area
                    </span>

                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-black mb-6 uppercase tracking-tight text-white">
                        The <span className="bg-gradient-to-r from-toxic via-white to-cyber bg-clip-text text-transparent">Lab</span>
                    </h1>

                    <p className="text-[#a1a1aa] text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                        Production-ready AI features running on free infrastructure. Explore real browser ML and NLP workflows.
                    </p>
                </div>

                {/* ── 2×2 card grid ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-10">

                    {/* Card 1 — AI Chatbot */}
                    <Link
                        to="/lab/gaurav-chatbot"
                        className="group relative p-6 bg-[#0e0e11] border border-[#1a1a22] rounded-lg hover:border-toxic/30 transition-all duration-300 hover:-translate-y-1 block overflow-hidden"
                    >
                        <div className="relative">
                            <svg className="w-8 h-8 mb-4 text-toxic" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z" />
                            </svg>
                            <h3 className="text-white font-display font-bold text-xl mb-2 group-hover:text-toxic transition-colors">AI Chatbot</h3>
                            <p className="text-[#a1a1aa] text-sm leading-relaxed mb-4">
                                Ask portfolio-focused and general coding questions using an integrated, highly optimized Gemini & Groq assistant.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 bg-obsidian border border-[#1a1a22] text-[#a1a1aa] rounded-md">Gemini / Groq</span>
                                <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 bg-obsidian border border-[#1a1a22] text-[#a1a1aa] rounded-md">Full-Context AI</span>
                            </div>
                        </div>
                        <span className="absolute top-4 right-4 text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 bg-toxic/10 text-toxic rounded-md border border-toxic/25 font-bold">
                            Live
                        </span>
                    </Link>

                    {/* Card 2 — ML Demos */}
                    <Link
                        to="/lab/ml-demos"
                        className="group relative p-6 bg-[#0e0e11] border border-[#1a1a22] rounded-lg hover:border-cyber/30 transition-all duration-300 hover:-translate-y-1 block overflow-hidden"
                    >
                        <div className="relative">
                            <svg className="w-8 h-8 mb-4 text-cyber" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .03 2.698-1.4 2.698H4.2c-1.43 0-2.4-1.698-1.4-2.698L4.8 15.3M12 12h.008v.008H12V12z" />
                            </svg>
                            <h3 className="text-white font-display font-bold text-xl mb-2 group-hover:text-cyber transition-colors">ML Demos</h3>
                            <p className="text-[#a1a1aa] text-sm leading-relaxed mb-4">
                                Play with client-side computer vision models and text analyzers processing completely in your browser tab.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 bg-obsidian border border-[#1a1a22] text-[#a1a1aa] rounded-md">TensorFlow.js</span>
                                <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 bg-obsidian border border-[#1a1a22] text-[#a1a1aa] rounded-md">MobileNet</span>
                            </div>
                        </div>
                        <span className="absolute top-4 right-4 text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 bg-cyber/10 text-cyber rounded-md border border-cyber/25 font-bold">
                            Live
                        </span>
                    </Link>

                    {/* Card 3 — Consistency Dashboard */}
                    <Link
                        to="/lab/consistency-dashboard"
                        className="group relative p-6 bg-[#0e0e11] border border-[#1a1a22] rounded-lg hover:border-toxic/30 transition-all duration-300 hover:-translate-y-1 block overflow-hidden"
                    >
                        <div className="relative">
                            <svg className="w-8 h-8 mb-4 text-toxic" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                            </svg>
                            <h3 className="text-white font-display font-bold text-xl mb-2 group-hover:text-toxic transition-colors">Consistency</h3>
                            <p className="text-[#a1a1aa] text-sm leading-relaxed mb-4">
                                Track live GitHub commit streaks and LeetCode problem-solving progress in a real-time tracking interface.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 bg-obsidian border border-[#1a1a22] text-[#a1a1aa] rounded-md">GitHub Heatmap</span>
                                <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 bg-obsidian border border-[#1a1a22] text-[#a1a1aa] rounded-md">LeetCode API</span>
                            </div>
                        </div>
                        <span className="absolute top-4 right-4 text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 bg-toxic/10 text-toxic rounded-md border border-toxic/25 font-bold">
                            Live
                        </span>
                    </Link>

                    {/* Card 4 — Developer Terminal */}
                    <Link
                        to="/lab/terminal"
                        className="group relative p-6 bg-[#0e0e11] border border-[#1a1a22] rounded-lg hover:border-cyber/30 transition-all duration-300 hover:-translate-y-1 block overflow-hidden"
                    >
                        <div className="relative">
                            <svg className="w-8 h-8 mb-4 text-cyber" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
                            </svg>
                            <h3 className="text-white font-display font-bold text-xl mb-2 group-hover:text-cyber transition-colors">Dev Terminal</h3>
                            <p className="text-[#a1a1aa] text-sm leading-relaxed mb-4">
                                Type Unix-like terminal commands to dynamically query skills, projects, background, and achievements in an interactive shell.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 bg-obsidian border border-[#1a1a22] text-[#a1a1aa] rounded-md">Bash / Shell</span>
                                <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 bg-obsidian border border-[#1a1a22] text-[#a1a1aa] rounded-md">Autocomplete</span>
                            </div>
                        </div>
                        <span className="absolute top-4 right-4 text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 bg-cyber/10 text-cyber rounded-md border border-cyber/25 font-bold">
                            Live
                        </span>
                    </Link>

                </div>

                <p className="text-center text-[#52525b] text-xs font-mono mt-12">
                    // Built for real-world behavior: fast loading, client-side inference, and privacy-safe.
                </p>
            </div>
        </main>
    )
}

export default Lab

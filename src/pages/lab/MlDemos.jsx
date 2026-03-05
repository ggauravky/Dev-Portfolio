// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { Link } from 'react-router-dom'
import useSEO from '../../hooks/useSEO'
import ImageAnalyzer from '../../components/lab/ImageAnalyzer'
import PromptImprover from '../../components/lab/PromptImprover'

function MlDemos() {
    useSEO({
        title: 'ML Demos - Gaurav Lab | TensorFlow.js & NLP in the Browser',
        description:
            'Run real machine learning in your browser. MobileNet image classification with TensorFlow.js and NLP-powered prompt enhancement using compromise.js.',
        keywords:
            'ML Demos, TensorFlow.js, MobileNet, Image Classification, NLP, Prompt Engineering, Browser ML, Gaurav Lab',
        ogImage: 'https://ggauravky.vercel.app/images/profile.jpg',
    })

    return (
        <main className="min-h-screen bg-slate-900 py-16 sm:py-20 px-4 relative overflow-hidden">
            {/* Background blobs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl" />
            </div>

            <div className="max-w-6xl mx-auto">
                {/* Back nav */}
                <div className="mb-10">
                    <Link
                        to="/lab"
                        className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 text-sm font-medium transition-colors group"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="group-hover:-translate-x-1 transition-transform duration-200"
                        >
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                        Back to Lab
                    </Link>
                </div>

                {/* Header */}
                <div className="text-center mb-14">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-400 text-sm font-semibold mb-6">
                        <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                        Running in your browser
                    </div>

                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-5">
                        <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                            ML Demos
                        </span>
                    </h1>

                    <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
                        Real machine learning running client-side — no servers, no API keys, no cost.
                    </p>

                    {/* Feature pills */}
                    <div className="flex flex-wrap justify-center gap-3 mt-8">
                        {[
                            { icon: '🧠', label: 'TensorFlow.js' },
                            { icon: '📷', label: 'MobileNet v2' },
                            { icon: '✍️', label: 'compromise.js NLP' },
                            { icon: '⚡', label: 'WebGL accelerated' },
                            { icon: '🔒', label: '100% client-side' },
                        ].map(({ icon, label }) => (
                            <span
                                key={label}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-full text-slate-300 text-xs font-medium"
                            >
                                <span>{icon}</span>
                                {label}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Demo section labels */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* ── Image Analyzer ── */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-7 h-7 bg-cyan-500/15 border border-cyan-500/30 rounded-lg text-xs font-bold text-cyan-400">
                                1
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">
                                    Computer Vision
                                </p>
                                <p className="text-white font-semibold text-base leading-tight">
                                    AI Image Analyzer
                                </p>
                            </div>
                            <span className="ml-auto text-xs px-2 py-1 bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 rounded-full font-medium">
                                TF.js + MobileNet
                            </span>
                        </div>
                        <ImageAnalyzer />
                    </div>

                    {/* ── Prompt Improver ── */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-7 h-7 bg-purple-500/15 border border-purple-500/30 rounded-lg text-xs font-bold text-purple-400">
                                2
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">
                                    NLP Processing
                                </p>
                                <p className="text-white font-semibold text-base leading-tight">
                                    AI Prompt Improver
                                </p>
                            </div>
                            <span className="ml-auto text-xs px-2 py-1 bg-purple-500/10 border border-purple-500/25 text-purple-400 rounded-full font-medium">
                                compromise.js
                            </span>
                        </div>
                        <PromptImprover />
                    </div>
                </div>

                {/* How it works section */}
                <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {[
                        {
                            icon: '📦',
                            title: 'Lazy Loaded',
                            desc: 'TF.js and NLP libraries load from CDN only when you open this page — zero impact on other pages.',
                            color: 'cyan',
                        },
                        {
                            icon: '🔐',
                            title: 'Private by Design',
                            desc: 'Your images and prompts never leave your browser. Inference runs entirely on your device.',
                            color: 'emerald',
                        },
                        {
                            icon: '💾',
                            title: 'Usage Logged',
                            desc: 'Anonymous usage stats (no PII, no image data) are stored in MongoDB for analytics.',
                            color: 'purple',
                        },
                    ].map(({ icon, title, desc, color }) => (
                        <div
                            key={title}
                            className={`relative p-5 bg-slate-800/40 border border-slate-700/50 rounded-2xl hover:border-${color}-500/30 transition-colors duration-300`}
                        >
                            <span className="text-2xl mb-3 block">{icon}</span>
                            <h4 className="text-white font-semibold text-sm mb-1">{title}</h4>
                            <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
                        </div>
                    ))}
                </div>

                <p className="text-center text-slate-600 text-xs mt-12">
                    Models are cached after first load — subsequent runs are instant.
                </p>
            </div>
        </main>
    )
}

export default MlDemos

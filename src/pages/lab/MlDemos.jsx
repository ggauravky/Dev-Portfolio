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
        <main className="min-h-screen bg-[#070708] py-16 sm:py-20 px-4 relative overflow-hidden">
            {/* Ambient gradients */}
            <div className="absolute top-[-80px] right-[-80px] w-[480px] h-[480px] bg-toxic/3 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-60px] left-[-60px] w-[420px] h-[420px] bg-cyber/3 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Back nav */}
                <div className="mb-10">
                    <Link
                        to="/lab"
                        className="inline-flex items-center gap-2 text-zinc-400 hover:text-toxic text-xs font-mono uppercase tracking-wider transition-colors group"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
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
                    <span className="inline-flex items-center gap-2 text-toxic text-xs font-mono tracking-wider uppercase mb-5 px-3 py-1.5 bg-toxic/5 rounded-md border border-toxic/20">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-toxic opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-toxic" />
                        </span>{' '}
                        In-Browser inference
                    </span>

                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-black mb-5 uppercase tracking-tight text-white">
                        ML <span className="bg-gradient-to-r from-toxic via-white to-cyber bg-clip-text text-transparent">Demos</span>
                    </h1>

                    <p className="text-[#a1a1aa] text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                        Real machine learning running client-side — no servers, no API keys, no latency.
                    </p>

                    {/* Feature pills */}
                    <div className="flex flex-wrap justify-center gap-3 mt-8">
                        {[
                            { icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9 3.75H6.912a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H15M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859M12 3v8.25m0 0l-3-3m3 3l3-3" /></svg>, label: 'TensorFlow.js' },
                            { icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" /></svg>, label: 'MobileNet v2' },
                            { icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>, label: 'compromise.js NLP' },
                            { icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>, label: 'GPU Accelerated' },
                            { icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>, label: '100% Client-side' },
                        ].map(({ icon, label }) => (
                            <span
                                key={label}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0e0e11] border border-[#1a1a22] rounded-md text-zinc-300 text-[10px] font-mono uppercase"
                            >
                                <span className="shrink-0">{icon}</span>
                                <span>{label}</span>
                            </span>
                        ))}
                    </div>
                </div>

                {/* Demo sections */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* ── Image Analyzer ── */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-7 h-7 bg-toxic/15 border border-toxic/30 rounded text-xs font-mono font-bold text-toxic">
                                01
                            </div>
                            <div>
                                <p className="text-[9px] uppercase tracking-widest text-[#52525b] font-mono">
                                    Computer Vision
                                </p>
                                <p className="text-white font-display font-bold text-base leading-tight">
                                    AI Image Analyzer
                                </p>
                            </div>
                            <span className="ml-auto text-[10px] font-mono px-2.5 py-1 bg-toxic/10 border border-toxic/25 text-toxic rounded-md">
                                TF.js + MobileNet
                            </span>
                        </div>
                        <ImageAnalyzer />
                    </div>

                    {/* ── Prompt Improver ── */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-7 h-7 bg-cyber/15 border border-cyber/30 rounded text-xs font-mono font-bold text-cyber">
                                02
                            </div>
                            <div>
                                <p className="text-[9px] uppercase tracking-widest text-[#52525b] font-mono">
                                    NLP Processing
                                </p>
                                <p className="text-white font-display font-bold text-base leading-tight">
                                    AI Prompt Improver
                                </p>
                            </div>
                            <span className="ml-auto text-[10px] font-mono px-2.5 py-1 bg-cyber/10 border border-cyber/25 text-cyber rounded-md">
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
                            icon: <svg className="w-6 h-6 text-toxic" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75l2.25-1.313M12 21.75V19.5m0 2.25l-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-9 5.25-9-5.25v-2.25m18 0l-9 5.25m0 0l-9-5.25" /></svg>,
                            title: 'Lazy Loaded Libraries',
                            desc: 'TF.js and NLP libraries load dynamically from CDN only when you access this page — zero bundle bloat.',
                            toneColor: 'toxic',
                        },
                        {
                            icon: <svg className="w-6 h-6 text-cyber" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>,
                            title: 'Private by Design',
                            desc: 'Your images and prompts never leave your browser. Inference runs entirely on your local device.',
                            toneColor: 'cyber',
                        },
                        {
                            icon: <svg className="w-6 h-6 text-toxic" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 2.625v2.625m0 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V9m16.5 2.625v2.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V11.625" /></svg>,
                            title: 'Performance Logging',
                            desc: 'Anonymous performance metrics (inference latency, library sizes) are recorded to MongoDB.',
                            toneColor: 'toxic',
                        },
                    ].map(({ icon, title, desc, toneColor }) => (
                        <div
                            key={title}
                            className={`p-5 bg-[#0e0e11] border border-[#1a1a22] rounded-lg transition-colors duration-300 hover:border-${toneColor}/30`}
                        >
                            <div className="mb-3">{icon}</div>
                            <h4 className="text-white font-display font-semibold text-sm mb-2">{title}</h4>
                            <p className="text-[#a1a1aa] text-xs leading-relaxed">{desc}</p>
                        </div>
                    ))}
                </div>

                <p className="text-center text-[#52525b] text-[10px] font-mono mt-12">
                    // Models are cached locally by browser after initial load — subsequent runs are instant.
                </p>
            </div>
        </main>
    )
}

export default MlDemos

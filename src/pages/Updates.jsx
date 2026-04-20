// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import ScrollReveal from '../components/ScrollReveal'
import useSEO from '../hooks/useSEO'

const updates = [
    {
        version: 'v2.0',
        date: 'April 2026',
        title: 'Payments & Analytics',
        features: [
            'Cashfree payment integration',
            'Support jar system',
            'Service purchase flow',
        ],
        improvements: [
            'Activity page redesign',
            'Better UI transitions',
            'Faster response handling',
        ],
        fixes: [
            'Payment status sync issue',
            'Email trigger inconsistency',
        ],
    },
    {
        version: 'v1.8',
        date: 'March 2026',
        title: 'Service Experience Upgrade',
        features: [
            'Detailed service pages with clear deliverables',
            'Comparison-focused service table for faster decisions',
            'Sticky mobile call-to-action for booking flow',
        ],
        improvements: [
            'Improved service card readability on smaller screens',
            'Smoother interaction states for key CTA buttons',
            'Sharper content hierarchy for trust and clarity',
        ],
        fixes: [
            'Inconsistent spacing in service sections',
            'Minor visual overlap in compact mobile layouts',
        ],
    },
    {
        version: 'v1.5',
        date: 'February 2026',
        title: 'Portfolio Structure Refresh',
        features: [
            'Enhanced project and blog presentation blocks',
            'Improved route-level page transitions',
            'Expanded trust-focused footer section',
        ],
        improvements: [
            'Cleaner navigation flow across portfolio pages',
            'Higher contrast typography in critical sections',
            'Better card consistency across desktop and mobile',
        ],
        fixes: [
            'Small route transition flicker on first-load pages',
            'Minor visual inconsistencies in interactive cards',
        ],
    },
]

function Updates() {
    useSEO({
        title: 'Updates / Changelog | Gaurav Kumar Yadav',
        description: 'Track product updates and feature releases for Gaurav Kumar Yadav portfolio platform.',
        keywords: 'updates, changelog, product updates, portfolio releases, Gaurav Kumar Yadav',
        ogImage: 'https://ggauravky.vercel.app/images/profile.jpg',
    })

    return (
        <main className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
            <div className="pointer-events-none absolute -right-20 top-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -left-20 bottom-12 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

            <div className="relative z-10 mx-auto max-w-5xl">
                <ScrollReveal className="text-center mb-12 sm:mb-14">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-100 mb-4">
                        🚀 Product Updates
                    </h1>
                    <p className="mx-auto max-w-3xl text-slate-300 text-base sm:text-lg leading-relaxed">
                        Follow my journey of building and improving this portfolio platform.
                    </p>
                </ScrollReveal>

                <section className="relative">
                    <div className="pointer-events-none absolute left-3 top-0 bottom-0 hidden sm:block w-px bg-gradient-to-b from-cyan-400/40 via-blue-400/35 to-transparent" />

                    <div className="space-y-6 sm:space-y-8">
                        {updates.map((update, index) => (
                            <ScrollReveal key={update.version} delay={index * 90}>
                                <article className="group relative rounded-3xl border border-slate-700/70 bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-slate-950/90 p-5 sm:p-7 shadow-xl shadow-black/30 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/45 hover:shadow-cyan-500/10">
                                    <span className="hidden sm:inline-block absolute left-0 top-9 -translate-x-[31px] h-3 w-3 rounded-full border border-cyan-300/50 bg-cyan-400/70 shadow-[0_0_0_4px_rgba(15,23,42,0.9)]" />

                                    <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                                        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/35 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-cyan-200">
                                            {update.version}
                                        </div>
                                        <div className="inline-flex items-center rounded-full border border-slate-600/70 bg-slate-800/70 px-3 py-1 text-xs font-medium text-slate-300">
                                            📅 {update.date}
                                        </div>
                                    </div>

                                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-100 mb-6">
                                        🚀 Version {update.version.replace('v', '')} - {update.title}
                                    </h2>

                                    <div className="grid gap-4 sm:gap-5 lg:grid-cols-3">
                                        <section className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 sm:p-5">
                                            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-300 mb-3">✨ Features</h3>
                                            <ul className="space-y-2 text-sm text-slate-200 leading-relaxed">
                                                {update.features.map((item) => (
                                                    <li key={item} className="flex items-start gap-2">
                                                        <span className="mt-[2px] text-emerald-300">•</span>
                                                        <span>{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </section>

                                        <section className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4 sm:p-5">
                                            <h3 className="text-sm font-bold uppercase tracking-wider text-blue-300 mb-3">📊 Improvements</h3>
                                            <ul className="space-y-2 text-sm text-slate-200 leading-relaxed">
                                                {update.improvements.map((item) => (
                                                    <li key={item} className="flex items-start gap-2">
                                                        <span className="mt-[2px] text-blue-300">•</span>
                                                        <span>{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </section>

                                        <section className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 sm:p-5">
                                            <h3 className="text-sm font-bold uppercase tracking-wider text-rose-300 mb-3">🐛 Fixes</h3>
                                            <ul className="space-y-2 text-sm text-slate-200 leading-relaxed">
                                                {update.fixes.map((item) => (
                                                    <li key={item} className="flex items-start gap-2">
                                                        <span className="mt-[2px] text-rose-300">•</span>
                                                        <span>{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </section>
                                    </div>
                                </article>
                            </ScrollReveal>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    )
}

export default Updates

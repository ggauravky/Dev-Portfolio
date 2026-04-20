// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { Link } from 'react-router-dom'
import useSEO from '../hooks/useSEO'

const focusAreas = [
    'Python development and automation',
    'AI and ML fundamentals with real projects',
    'Secure and responsive full-stack apps',
    'Data-driven problem solving'
]

const currentWork = [
    {
        label: 'BCA student at BBDU University, Lucknow',
        href: 'https://bbdu.ac.in/',
        accent: 'text-cyan-300',
        tag: 'University'
    },
    {
        label: 'AI and ML program through IIT Mandi x Masai School',
        href: 'https://drive.google.com/file/d/1tcL8JGUsq_TorfE5mQ-I8LNPNA3u4_yY/view?usp=drive_link',
        accent: 'text-blue-300',
        tag: 'Credential'
    },
    {
        label: 'Open to internships, freelance projects, and entry-level roles',
        accent: 'text-emerald-300',
        tag: 'Availability'
    }
]

const workflow = [
    'Break the problem into smaller tasks',
    'Build a working version quickly',
    'Measure and improve quality step by step',
    'Ship clean, practical solutions'
]

function About() {
    useSEO({
        title: 'About Gaurav Kumar Yadav | BBDU Lucknow | AI/ML and Web Developer',
        description: 'Learn about Gaurav Kumar Yadav, a BCA student at BBDU Lucknow, India, focused on AI/ML and web development. Explore his background, project mindset, and growth journey.',
        keywords: 'Gaurav Kumar Yadav BBDU, Gaurav Lucknow developer, Gaurav AI ML developer, Gaurav web developer India, BCA AI ML student India',
        ogImage: 'https://ggauravky.vercel.app/images/profile.jpg'
    })

    return (
        <div className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
            <div className="pointer-events-none absolute -right-16 top-24 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl"></div>
            <div className="pointer-events-none absolute -left-16 bottom-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl"></div>

            <div className="relative z-10 mx-auto max-w-6xl space-y-8">
                <section className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-6 sm:p-8 lg:p-10">
                    <p className="mb-3 inline-flex rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-300">
                        About Me
                    </p>

                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 sm:text-4xl lg:text-5xl">
                        About Gaurav Kumar Yadav
                    </h1>

                    <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-300 sm:text-lg">
                        I am Gaurav Kumar Yadav from Lucknow, focused on Python, AI/ML, and full-stack development.
                        My goal is to build useful products, learn fast from real-world problems, and grow into a high-impact engineering role.
                    </p>

                    <p className="mt-3 max-w-3xl text-sm text-slate-400 sm:text-base">
                        BCA student at BBD University (BBDU), Lucknow, Uttar Pradesh, India.
                    </p>

                    <div className="mt-6 flex flex-wrap gap-2">
                        <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-200">
                            Python
                        </span>
                        <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-200">
                            AI/ML
                        </span>
                        <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-200">
                            Full Stack
                        </span>
                        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                            Open for Work
                        </span>
                    </div>
                </section>

                <section className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-6 sm:p-8">
                    <div className="mb-6 text-center">
                        <h2 className="text-2xl font-bold text-slate-100 sm:text-3xl">Coding Consistency Showcase</h2>
                        <p className="mt-2 text-sm text-slate-400 sm:text-base">
                            Live cards from your public profiles
                        </p>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                        <a
                            href="https://github.com/ggauravky"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group rounded-2xl border border-slate-800 bg-slate-900/70 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10"
                            aria-label="Open GitHub profile"
                        >
                            <div className="mb-3 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-cyan-300">GitHub Streak</h3>
                                <span className="text-sm text-slate-400 group-hover:text-cyan-300">Open ↗</span>
                            </div>
                            <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950 p-2">
                                <img
                                    src="https://streak-stats.demolab.com/?user=ggauravky&theme=dark&hide_border=true"
                                    alt="GitHub streak stats for ggauravky"
                                    className="block h-auto w-full transition-transform duration-500 group-hover:scale-[1.02]"
                                    loading="lazy"
                                    referrerPolicy="no-referrer"
                                />
                            </div>
                        </a>

                        <a
                            href="https://leetcode.com/u/gauravky/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group rounded-2xl border border-slate-800 bg-slate-900/70 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10"
                            aria-label="Open LeetCode profile"
                        >
                            <div className="mb-3 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-blue-300">LeetCode Stats</h3>
                                <span className="text-sm text-slate-400 group-hover:text-blue-300">Open ↗</span>
                            </div>
                            <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950 p-2">
                                <img
                                    src="https://leetcard.jacoblin.cool/gauravky?theme=dark&ext=heatmap"
                                    alt="LeetCode stats for gauravky"
                                    className="block h-auto w-full transition-transform duration-500 group-hover:scale-[1.02]"
                                    loading="lazy"
                                    referrerPolicy="no-referrer"
                                />
                            </div>
                        </a>
                    </div>
                </section>

                <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {currentWork.map((item) => {
                        const commonClassName = `group rounded-2xl border border-slate-800 bg-slate-900/70 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-slate-700 ${item.href ? 'cursor-pointer' : ''}`

                        const content = (
                            <>
                                <div className="mb-3 flex items-center justify-between gap-3">
                                    <span className={`text-xs font-semibold uppercase tracking-wider ${item.accent}`}>{item.tag}</span>
                                    {item.href ? <span className="text-sm text-slate-500 group-hover:text-slate-300">Open ↗</span> : null}
                                </div>
                                <p className="text-sm leading-relaxed text-slate-300 sm:text-base">{item.label}</p>
                            </>
                        )

                        if (item.href) {
                            return (
                                <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" className={commonClassName}>
                                    {content}
                                </a>
                            )
                        }

                        return (
                            <article key={item.label} className={commonClassName}>
                                {content}
                            </article>
                        )
                    })}
                </section>

                <section className="grid gap-6 lg:grid-cols-2">
                    <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
                        <h2 className="text-xl font-bold text-cyan-300 sm:text-2xl">What I Focus On</h2>
                        <ul className="mt-4 space-y-3">
                            {focusAreas.map((item) => (
                                <li key={item} className="flex items-start gap-3 text-slate-300">
                                    <span className="mt-1 text-cyan-400">▹</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </article>

                    <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
                        <h2 className="text-xl font-bold text-blue-300 sm:text-2xl">How I Work</h2>
                        <ul className="mt-4 space-y-3">
                            {workflow.map((item) => (
                                <li key={item} className="flex items-start gap-3 text-slate-300">
                                    <span className="mt-1 text-blue-400">▹</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </article>
                </section>

                <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 text-center sm:p-8">
                    <h2 className="text-2xl font-bold text-slate-100 sm:text-3xl">Open to Collaborate</h2>
                    <p className="mx-auto mt-3 max-w-2xl text-slate-300">
                        I am currently available for internships, freelance opportunities, and entry-level developer roles where I can contribute and keep growing.
                    </p>
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                        <Link
                            to="/contact"
                            className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-transform duration-300 hover:scale-105"
                        >
                            Start a Conversation
                        </Link>
                        <Link
                            to="/services"
                            className="rounded-full border border-slate-700 bg-slate-800 px-6 py-2.5 text-sm font-semibold text-slate-200 transition-colors duration-300 hover:border-cyan-500/40 hover:text-cyan-300"
                        >
                            Book Service
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    )
}

export default About

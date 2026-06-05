// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import useSEO from '../hooks/useSEO'
import ScrollReveal from '../components/ScrollReveal'

const focusAreas = [
    'Python development and automation',
    'AI and ML fundamentals with real projects',
    'Secure and responsive full-stack apps',
    'Data-driven problem solving'
]

const currentWork = [
    {
        label: 'BCA student at BBD University, Lucknow',
        href: 'https://bbdu.ac.in/',
        tag: 'University'
    },
    {
        label: 'AI and ML program through IIT Mandi x Masai School',
        href: 'https://drive.google.com/file/d/1tcL8JGUsq_TorfE5mQ-I8LNPNA3u4_yY/view?usp=drive_link',
        tag: 'Credential'
    },
    {
        label: 'Open to internships, freelance projects, and entry-level roles',
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
        <main className="about-page bg-obsidian min-h-screen overflow-hidden px-4 py-24 sm:px-6 lg:px-8 relative w-full">
            {/* Ambient Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-obsidian via-obsidian-card to-obsidian"></div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-toxic/5 via-transparent to-transparent"></div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-cyber/5 via-transparent to-transparent"></div>

            <div className="relative z-10 mx-auto max-w-6xl space-y-12">
                <ScrollReveal>
                    <section className="relative overflow-hidden bg-obsidian-card border border-obsidian-border rounded-lg p-8 sm:p-10 lg:p-12">
                        <div className="absolute inset-0 bg-gradient-to-br from-toxic/[0.02] to-transparent pointer-events-none"></div>
                        
                        <span className="inline-flex items-center gap-2 text-toxic text-xs font-bold tracking-widest uppercase px-4 py-2 bg-toxic/5 rounded-full border border-toxic/15 backdrop-blur-sm mb-6">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-toxic opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-toxic"></span>
                            </span>
                            About Me
                        </span>

                        <h1 className="text-3xl sm:text-4xl lg:text-6xl font-display font-extrabold uppercase leading-[0.95] tracking-tighter text-white mb-6">
                            Gaurav Kumar <span className="text-transparent bg-gradient-to-r from-white via-zinc-400 to-toxic bg-clip-text">Yadav</span>
                        </h1>

                        <p className="max-w-3xl text-base sm:text-lg text-zinc-300 leading-relaxed mb-6">
                            I am Gaurav Kumar Yadav from Lucknow, focused on Python, AI/ML, and full-stack development.
                            My goal is to build useful products, learn fast from real-world problems, and grow into a high-impact engineering role.
                        </p>

                        <p className="max-w-3xl text-xs sm:text-sm font-mono text-zinc-500 uppercase tracking-wider mb-8">
                            // BCA student at BBD University (BBDU), Lucknow, Uttar Pradesh, India.
                        </p>

                        <div className="flex flex-wrap gap-2.5 font-mono text-xs">
                            <span className="px-3 py-1.5 bg-obsidian border border-obsidian-border text-zinc-300 rounded-md hover:border-toxic hover:text-white transition-all cursor-default font-semibold">
                                Python
                            </span>
                            <span className="px-3 py-1.5 bg-obsidian border border-obsidian-border text-zinc-300 rounded-md hover:border-cyber hover:text-white transition-all cursor-default font-semibold">
                                AI/ML
                            </span>
                            <span className="px-3 py-1.5 bg-obsidian border border-obsidian-border text-zinc-300 rounded-md hover:border-toxic hover:text-white transition-all cursor-default font-semibold">
                                Full Stack
                            </span>
                            <span className="px-3 py-1.5 bg-toxic/5 border border-toxic/20 text-toxic rounded-md cursor-default font-semibold">
                                Open for Work
                            </span>
                        </div>
                    </section>
                </ScrollReveal>

                <ScrollReveal delay={40}>
                    <section className="relative overflow-hidden bg-obsidian-card border border-obsidian-border rounded-lg p-8 sm:p-10">
                        <div className="mb-8 text-center">
                            <h2 className="text-2xl sm:text-3xl font-display font-bold uppercase text-white">Coding Consistency Showcase</h2>
                            <p className="mt-2 text-xs sm:text-sm font-mono text-zinc-500 uppercase tracking-widest">
                                // Live cards from your public profiles
                            </p>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-2">
                            <a
                                href="https://github.com/ggauravky"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group rounded-lg border border-obsidian-border bg-obsidian/60 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-toxic/30 hover:shadow-lg hover:shadow-toxic/5"
                                aria-label="Open GitHub profile"
                            >
                                <div className="mb-3 flex items-center justify-between">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-toxic font-mono">// GitHub Streak</h3>
                                    <span className="text-xs text-zinc-500 group-hover:text-toxic font-mono">Open ↗</span>
                                </div>
                                <div className="overflow-hidden rounded-lg border border-obsidian-border bg-obsidian p-2">
                                    <img
                                        src="https://camo.githubusercontent.com/80d675df3c581caef2a3fc4af3ab8bd8aeeff7037e331312e09e106dea1b3130/68747470733a2f2f73747265616b2d73746174732e64656d6f6c61622e636f6d3f757365723d676761757261766b79267468656d653d64726163756c6126686964655f626f726465723d74727565266261636b67726f756e643d3064306432622672696e673d37633361656426666972653d613738626661266375727253747265616b4c6162656c3d613738626661"
                                        alt="GitHub streak stats for ggauravky"
                                        className="block h-auto w-full transition-transform duration-500 group-hover:scale-[1.015]"
                                        loading="lazy"
                                        referrerPolicy="no-referrer"
                                    />
                                </div>
                            </a>

                            <a
                                href="https://leetcode.com/u/gauravky/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group rounded-lg border border-obsidian-border bg-obsidian/60 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-cyber/30 hover:shadow-lg hover:shadow-cyber/5"
                                aria-label="Open LeetCode profile"
                            >
                                <div className="mb-3 flex items-center justify-between">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-cyber font-mono">// LeetCode Stats</h3>
                                    <span className="text-xs text-zinc-500 group-hover:text-cyber font-mono">Open ↗</span>
                                </div>
                                <div className="overflow-hidden rounded-lg border border-obsidian-border bg-obsidian p-2">
                                    <img
                                        src="https://leetcard.jacoblin.cool/gauravky?theme=dark&ext=heatmap"
                                        alt="LeetCode stats for gauravky"
                                        className="block h-auto w-full transition-transform duration-500 group-hover:scale-[1.015]"
                                        loading="lazy"
                                        referrerPolicy="no-referrer"
                                    />
                                </div>
                            </a>
                        </div>
                    </section>
                </ScrollReveal>

                <ScrollReveal delay={60}>
                    <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {currentWork.map((item, idx) => {
                            const isEven = idx % 2 === 0
                            const accentBg = isEven ? 'bg-toxic/5 border-toxic/15 text-toxic' : 'bg-cyber/5 border-cyber/15 text-cyber'
                            
                            const commonClassName = `group relative rounded-lg border border-obsidian-border bg-obsidian-card p-6 transition-all duration-350 hover:-translate-y-1 hover:border-toxic/30 overflow-hidden ${item.href ? 'cursor-pointer' : ''}`

                            const content = (
                                <>
                                    <div className="absolute inset-0 bg-gradient-to-br from-toxic/[0.01] to-transparent pointer-events-none"></div>
                                    <div className="relative z-10 flex flex-col h-full justify-between">
                                        <div className="mb-4 flex items-center justify-between gap-3">
                                            <span className={`inline-block px-3 py-1 rounded font-mono text-[10px] uppercase tracking-wider border ${accentBg}`}>{item.tag}</span>
                                            {item.href ? <span className="text-[11px] font-mono text-zinc-500 group-hover:text-toxic transition-colors">Open ↗</span> : null}
                                        </div>
                                        <p className="text-sm sm:text-base font-semibold leading-relaxed text-zinc-300 group-hover:text-white transition-colors">{item.label}</p>
                                    </div>
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
                </ScrollReveal>

                <ScrollReveal delay={80}>
                    <section className="grid gap-6 lg:grid-cols-2">
                        <article className="relative overflow-hidden rounded-lg border border-obsidian-border bg-obsidian-card p-8 sm:p-10">
                            <div className="absolute inset-0 bg-gradient-to-br from-toxic/[0.01] to-transparent pointer-events-none"></div>
                            <h2 className="text-xl sm:text-2xl font-display font-bold uppercase text-white mb-6 border-b border-obsidian-border pb-4">// What I Focus On</h2>
                            <ul className="space-y-4">
                                {focusAreas.map((item) => (
                                    <li key={item} className="flex items-start gap-3 text-zinc-300 text-sm sm:text-base leading-relaxed hover:text-white transition-colors">
                                        <span className="text-toxic font-mono shrink-0 select-none">→</span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </article>

                        <article className="relative overflow-hidden rounded-lg border border-obsidian-border bg-obsidian-card p-8 sm:p-10">
                            <div className="absolute inset-0 bg-gradient-to-br from-cyber/[0.01] to-transparent pointer-events-none"></div>
                            <h2 className="text-xl sm:text-2xl font-display font-bold uppercase text-white mb-6 border-b border-obsidian-border pb-4">// How I Work</h2>
                            <ul className="space-y-4">
                                {workflow.map((item) => (
                                    <li key={item} className="flex items-start gap-3 text-zinc-300 text-sm sm:text-base leading-relaxed hover:text-white transition-colors">
                                        <span className="text-cyber font-mono shrink-0 select-none">→</span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </article>
                    </section>
                </ScrollReveal>

                <ScrollReveal delay={100}>
                    <section className="relative overflow-hidden rounded-lg border border-obsidian-border bg-obsidian-card p-8 text-center sm:p-12">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-toxic/5 via-transparent to-transparent pointer-events-none"></div>
                        <h2 className="text-2xl sm:text-4xl font-display font-bold uppercase text-white mb-4">Open to Collaborate</h2>
                        <p className="mx-auto max-w-2xl text-zinc-400 text-sm sm:text-base leading-relaxed mb-8">
                            I am currently available for internships, freelance opportunities, and entry-level developer roles where I can contribute and keep growing.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-4">
                            <Link
                                to="/contact"
                                className="group relative px-6 py-3 bg-toxic text-obsidian rounded-full font-bold text-xs tracking-wider uppercase hover:bg-white hover:scale-105 transition-all duration-300 shadow-lg shadow-toxic/15 hover:shadow-white/20 text-center overflow-hidden inline-flex items-center justify-center"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2 leading-none">
                                    <span>Start a Conversation</span>
                                    <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                                </span>
                            </Link>
                            <Link
                                to="/services"
                                className="group relative px-6 py-3 border border-zinc-700 hover:border-toxic rounded-full font-bold text-xs tracking-wider uppercase bg-transparent text-zinc-300 hover:text-toxic hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-toxic/5 text-center backdrop-blur-sm inline-flex items-center justify-center"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2 leading-none">
                                    <span>Book Service</span>
                                    <svg className="w-3.5 h-3.5 shrink-0 group-hover:rotate-12 transition-transform duration-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                                </span>
                            </Link>
                        </div>
                    </section>
                </ScrollReveal>
            </div>
        </main>
    )
}

export default About

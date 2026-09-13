// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { ArrowRight, ArrowUpRight, Download } from 'lucide-react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import useSEO from '../hooks/useSEO'
import ScrollReveal from '../components/ScrollReveal'
import LazyImage from '../components/LazyImage'

const githubStreakUrl = 'https://camo.githubusercontent.com/80d675df3c581caef2a3fc4af3ab8bd8aeeff7037e331312e09e106dea1b3130/68747470733a2f2f73747265616b2d73746174732e64656d6f6c61622e636f6d3f757365723d676761757261766b79267468656d653d64726163756c6126686964655f626f726465723d74727565266261636b67726f756e643d3064306432622672696e673d37633361656426666972653d613738626661266375727253747265616b4c6162656c3d613738626661'

const currentChapter = [
    {
        type: 'Education',
        logo: '/images/about/bbdu.png',
        logoAlt: 'Babu Banarasi Das University logo',
        shortTitle: 'BCA',
        title: 'Bachelor of Computer Applications',
        organization: 'Babu Banarasi Das University',
        meta: '2024 to Present · Lucknow',
        status: 'In Progress',
        accent: 'toxic',
    },
    {
        type: 'Specialization',
        logo: '/images/about/mandi.png',
        logoAlt: 'IIT Mandi logo',
        title: 'Minor in AI & Data Science',
        organization: 'IIT Mandi × Masai',
        meta: 'Machine Learning · Deep Learning · Data Science',
        status: 'In Progress',
        accent: 'cyber',
        certificate: '/images/about/mandi_cert.png',
    },
    {
        type: 'Experience',
        logo: '/images/about/ashok.png',
        logoAlt: 'Ashoksoft Technologies logo',
        title: 'FullStack Intern',
        organization: 'Ashoksoft Technologies',
        meta: 'Aug 2026 to Present · Remote',
        status: 'Current',
        accent: 'toxic',
        certificate: '/images/about/ashok_cert.png',
    },
]

const focusAreas = [
    {
        label: 'AI / ML Engineering',
        accent: 'toxic',
        items: [
            'RAG & retrieval systems',
            'LLM-powered applications',
            'Machine-learning workflows',
            'Data & automation',
        ],
    },
    {
        label: 'Full-Stack Engineering',
        accent: 'cyber',
        items: [
            'React / Next.js interfaces',
            'Node.js / Express APIs',
            'SQL & NoSQL systems',
            'Real-time & production apps',
        ],
    },
]

const workflowSteps = [
    { title: 'Understand', detail: 'Problem & constraints' },
    { title: 'Build', detail: 'Working solution' },
    { title: 'Measure', detail: 'Test & evaluate' },
    { title: 'Improve', detail: 'Iterate' },
    { title: 'Ship', detail: 'Practical result' },
]

const primaryButtonClass = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-toxic px-5 py-3 font-mono text-[11px] font-bold uppercase tracking-wider text-obsidian transition-colors duration-300 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-toxic focus-visible:ring-offset-2 focus-visible:ring-offset-obsidian'
const secondaryButtonClass = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-obsidian-border bg-obsidian/60 px-5 py-3 font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-300 transition-colors duration-300 hover:border-toxic/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-toxic focus-visible:ring-offset-2 focus-visible:ring-offset-obsidian'

function SectionHeading({ id, title, subtitle }) {
    return (
        <header className="mb-8 sm:mb-10">
            <h2 id={id} className="font-display text-2xl font-bold uppercase tracking-tight text-white sm:text-3xl lg:text-4xl">
                {title}
            </h2>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500 sm:text-xs">
                {subtitle}
            </p>
        </header>
    )
}

SectionHeading.propTypes = {
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string.isRequired,
}

function ChapterCard({ item, index }) {
    const isCyber = item.accent === 'cyber'
    const CardElement = item.certificate ? 'a' : 'article'
    const certificateProps = item.certificate
        ? {
            href: item.certificate,
            target: '_blank',
            rel: 'noopener noreferrer',
            'aria-label': `View certificate for ${item.title} at ${item.organization}`,
        }
        : {}

    return (
        <CardElement
            {...certificateProps}
            className={`group relative flex min-h-[320px] flex-col overflow-hidden rounded-lg border bg-obsidian-card p-5 transition-[transform,border-color] duration-300 hover:-translate-y-1 sm:p-6 ${isCyber ? 'border-obsidian-border hover:border-cyber/35' : 'border-obsidian-border hover:border-toxic/35'} ${index === 2 ? 'md:col-span-2 lg:col-span-1' : ''} ${item.certificate ? 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-toxic focus-visible:ring-offset-2 focus-visible:ring-offset-obsidian' : ''}`}
        >
            <div className={`absolute inset-x-0 top-0 h-px ${isCyber ? 'bg-gradient-to-r from-transparent via-cyber/55 to-transparent' : 'bg-gradient-to-r from-transparent via-toxic/55 to-transparent'}`} />

            <div className="flex items-center justify-between gap-4">
                <span className={`font-mono text-[10px] font-bold uppercase tracking-[0.18em] ${isCyber ? 'text-cyber' : 'text-toxic'}`}>
                    {item.type}
                </span>
                <span className="flex items-center gap-2 text-zinc-700" aria-hidden="true">
                    <span className="font-mono text-[10px]">
                        {String(index + 1).padStart(2, '0')}
                    </span>
                    {item.certificate ? (
                        <ArrowUpRight className="h-3.5 w-3.5 transition-colors duration-300 group-hover:text-zinc-300" />
                    ) : null}
                </span>
            </div>

            <div className="mt-7 flex h-16 w-20 items-center justify-center rounded-md border border-white/10 bg-zinc-100 p-2.5">
                <img
                    src={item.logo}
                    alt={item.logoAlt}
                    width="64"
                    height="48"
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-contain"
                />
            </div>

            <div className="mt-7 flex flex-1 flex-col">
                {item.shortTitle ? (
                    <span className="mb-2 font-mono text-xs font-bold uppercase tracking-wider text-zinc-500">
                        {item.shortTitle}
                    </span>
                ) : null}
                <h3 className="font-display text-xl font-bold leading-tight text-white sm:text-2xl">
                    {item.title}
                </h3>
                <p className="mt-2 text-sm font-semibold text-zinc-300">
                    {item.organization}
                </p>
                <p className="mt-4 font-mono text-[11px] leading-relaxed text-zinc-500">
                    {item.meta}
                </p>
                <p className={`mt-auto flex items-center gap-2 pt-6 font-mono text-[10px] font-bold uppercase tracking-[0.16em] ${isCyber ? 'text-cyber' : 'text-toxic'}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${isCyber ? 'bg-cyber' : 'bg-toxic'}`} aria-hidden="true" />
                    {item.status}
                </p>
            </div>
        </CardElement>
    )
}

ChapterCard.propTypes = {
    item: PropTypes.shape({
        type: PropTypes.string.isRequired,
        logo: PropTypes.string.isRequired,
        logoAlt: PropTypes.string.isRequired,
        shortTitle: PropTypes.string,
        title: PropTypes.string.isRequired,
        organization: PropTypes.string.isRequired,
        meta: PropTypes.string.isRequired,
        status: PropTypes.string.isRequired,
        accent: PropTypes.oneOf(['toxic', 'cyber']).isRequired,
        certificate: PropTypes.string,
    }).isRequired,
    index: PropTypes.number.isRequired,
}

function About() {
    useSEO({
        title: 'About Gaurav Kumar Yadav | Full-Stack & AI/ML Developer',
        description: 'Meet Gaurav Kumar Yadav, a BCA student at BBD University specializing in AI and Data Science and working as a FullStack Intern at Ashoksoft Technologies.',
        keywords: 'Gaurav Kumar Yadav, full-stack developer, AI ML developer, BBD University, IIT Mandi Masai, Ashoksoft Technologies',
        ogImage: 'https://ggauravky.vercel.app/images/profile.jpg',
    })

    return (
        <main className="about-page relative min-h-screen w-full overflow-hidden bg-obsidian px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-obsidian-card/70 via-obsidian to-obsidian" />
            <div className="pointer-events-none absolute -right-40 top-0 h-[30rem] w-[30rem] rounded-full bg-toxic/[0.035] blur-[120px]" />
            <div className="pointer-events-none absolute -left-40 top-[46rem] h-[28rem] w-[28rem] rounded-full bg-cyber/[0.025] blur-[120px]" />

            <div className="relative z-10 mx-auto max-w-6xl space-y-20 sm:space-y-24 lg:space-y-28">
                <ScrollReveal>
                    <section aria-labelledby="about-title" className="relative overflow-hidden rounded-lg border border-obsidian-border bg-obsidian-card p-5 sm:p-8 lg:p-10">
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-toxic/[0.035] via-transparent to-cyber/[0.025]" />
                        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-toxic/60 to-transparent" />

                        <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end lg:gap-12">
                            <div className="min-w-0">
                                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-toxic sm:text-xs">
                                    About me
                                </p>
                                <h1 id="about-title" className="mt-5 max-w-4xl font-display text-[clamp(2.8rem,8vw,5.75rem)] font-extrabold uppercase leading-[0.82] tracking-[-0.065em] text-white">
                                    <span className="block">Gaurav Kumar</span>
                                    <span className="block text-transparent bg-gradient-to-r from-white via-zinc-400 to-toxic bg-clip-text">Yadav</span>
                                </h1>

                                <p className="mt-7 font-mono text-xs font-bold uppercase tracking-[0.14em] text-cyber sm:text-sm">
                                    Full-Stack Developer · AI/ML
                                </p>
                                <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-300 sm:text-base">
                                    I&apos;m Gaurav Kumar Yadav, a full-stack developer and AI/ML learner pursuing BCA at BBD University alongside a Minor in AI & Data Science, while gaining hands-on industry experience as a FullStack Intern at Ashoksoft Technologies.
                                </p>
                                <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-500 sm:text-base">
                                    I build practical web and AI products, from full-stack applications and APIs to RAG systems, automation, and machine-learning projects.
                                </p>

                                <div className="mt-7 flex flex-wrap gap-2 font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-300 sm:text-[11px]">
                                    {['Full Stack', 'Python', 'AI/ML', 'LLM / RAG', 'Open Source'].map((skill) => (
                                        <span key={skill} className="rounded-md border border-obsidian-border bg-obsidian/70 px-3 py-1.5">
                                            {skill}
                                        </span>
                                    ))}
                                </div>

                                <div className="mt-8 flex flex-col gap-3 min-[390px]:flex-row min-[390px]:flex-wrap">
                                    <a href="/resume.pdf" target="_blank" rel="noopener noreferrer" className={primaryButtonClass}>
                                        View Resume
                                        <Download className="h-3.5 w-3.5" aria-hidden="true" />
                                    </a>
                                    <Link to="/journey" className={secondaryButtonClass}>
                                        My Journey
                                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                                    </Link>
                                </div>
                            </div>

                            <aside aria-label="Current role" className="relative border-l border-obsidian-border pl-5 sm:pl-6 lg:mb-1 lg:pl-7">
                                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Currently</p>
                                <p className="mt-4 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-toxic">
                                    <span className="h-2 w-2 rounded-full bg-toxic shadow-[0_0_10px_rgba(197,248,42,0.45)]" aria-hidden="true" />
                                    FullStack Intern
                                </p>
                                <p className="mt-3 font-display text-xl font-bold leading-tight text-white">
                                    Ashoksoft Technologies
                                </p>
                                <p className="mt-3 font-mono text-[11px] leading-relaxed text-zinc-500">
                                    Remote · Aug 2026 to Present
                                </p>
                            </aside>
                        </div>
                    </section>
                </ScrollReveal>

                <ScrollReveal delay={40}>
                    <section aria-labelledby="current-chapter-title">
                        <SectionHeading id="current-chapter-title" title="Current Chapter" subtitle="Education · Specialization · Experience" />
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
                            {currentChapter.map((item, index) => (
                                <ChapterCard key={item.type} item={item} index={index} />
                            ))}
                        </div>
                    </section>
                </ScrollReveal>

                <ScrollReveal delay={60}>
                    <section aria-labelledby="what-i-build-title">
                        <SectionHeading id="what-i-build-title" title="What I Build" subtitle="Applied AI · Production software" />
                        <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
                            {focusAreas.map((area, index) => {
                                const isCyber = area.accent === 'cyber'

                                return (
                                    <article key={area.label} className={`relative overflow-hidden rounded-lg border border-obsidian-border bg-obsidian-card p-6 transition-colors duration-300 sm:p-8 ${isCyber ? 'hover:border-cyber/35' : 'hover:border-toxic/35'}`}>
                                        <div className="flex items-start justify-between gap-4">
                                            <h3 className="font-display text-xl font-bold uppercase text-white sm:text-2xl">
                                                {area.label}
                                            </h3>
                                            <span className={`font-mono text-xs font-bold ${isCyber ? 'text-cyber' : 'text-toxic'}`} aria-hidden="true">
                                                0{index + 1}
                                            </span>
                                        </div>
                                        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                                            {area.items.map((item) => (
                                                <li key={item} className="flex items-start gap-3 text-sm leading-6 text-zinc-400">
                                                    <span className={`mt-2 h-1 w-1 shrink-0 ${isCyber ? 'bg-cyber' : 'bg-toxic'}`} aria-hidden="true" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </article>
                                )
                            })}
                        </div>
                    </section>
                </ScrollReveal>

                <ScrollReveal delay={70}>
                    <section aria-labelledby="workflow-title">
                        <SectionHeading id="workflow-title" title="How I Work" subtitle="A practical path from problem to product" />
                        <ol className="grid overflow-hidden rounded-lg border border-obsidian-border bg-obsidian-card sm:grid-cols-2 lg:grid-cols-5">
                            {workflowSteps.map((step, index) => (
                                <li key={step.title} className={`relative min-w-0 p-5 sm:p-6 ${index > 0 ? 'border-t border-obsidian-border sm:border-t-0' : ''} ${index % 2 === 1 ? 'sm:border-l' : ''} ${index > 1 ? 'sm:border-t' : ''} ${index > 0 ? 'lg:border-l lg:border-t-0' : ''} ${index === 4 ? 'sm:col-span-2 lg:col-span-1' : ''}`}>
                                    <span className="font-mono text-[10px] font-bold text-toxic">{String(index + 1).padStart(2, '0')}</span>
                                    <h3 className="mt-5 font-display text-base font-bold uppercase text-white sm:text-lg">
                                        {step.title}
                                    </h3>
                                    <p className="mt-2 text-xs leading-5 text-zinc-500">
                                        {step.detail}
                                    </p>
                                    {index < workflowSteps.length - 1 ? (
                                        <ArrowRight className="absolute -right-2.5 top-7 z-10 hidden h-5 w-5 rounded-full bg-obsidian-card p-1 text-zinc-600 lg:block" aria-hidden="true" />
                                    ) : null}
                                </li>
                            ))}
                        </ol>
                    </section>
                </ScrollReveal>

                <ScrollReveal delay={80}>
                    <section aria-labelledby="consistency-title" className="rounded-lg border border-obsidian-border bg-obsidian-card p-4 sm:p-6 lg:p-8">
                        <SectionHeading id="consistency-title" title="Consistency in Practice" subtitle="GitHub activity · Problem solving" />
                        <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
                            <a
                                href="https://github.com/ggauravky"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group min-w-0 rounded-lg border border-obsidian-border bg-obsidian/60 p-3 transition-colors duration-300 hover:border-toxic/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-toxic sm:p-4"
                                aria-label="Open Gaurav Kumar Yadav's GitHub profile"
                            >
                                <div className="mb-3 flex items-center justify-between gap-4">
                                    <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-toxic sm:text-xs">GitHub Streak</h3>
                                    <ArrowUpRight className="h-4 w-4 text-zinc-600 transition-colors group-hover:text-toxic" aria-hidden="true" />
                                </div>
                                <div className="overflow-hidden rounded-md border border-obsidian-border bg-obsidian p-1.5 sm:p-2">
                                    <LazyImage
                                        src={githubStreakUrl}
                                        alt="GitHub streak statistics for ggauravky"
                                        responsive={false}
                                        className="block h-auto w-full"
                                    />
                                </div>
                            </a>

                            <a
                                href="https://leetcode.com/u/gauravky/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group min-w-0 rounded-lg border border-obsidian-border bg-obsidian/60 p-3 transition-colors duration-300 hover:border-cyber/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyber sm:p-4"
                                aria-label="Open Gaurav Kumar Yadav's LeetCode profile"
                            >
                                <div className="mb-3 flex items-center justify-between gap-4">
                                    <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-cyber sm:text-xs">LeetCode Stats</h3>
                                    <ArrowUpRight className="h-4 w-4 text-zinc-600 transition-colors group-hover:text-cyber" aria-hidden="true" />
                                </div>
                                <div className="overflow-hidden rounded-md border border-obsidian-border bg-obsidian p-1.5 sm:p-2">
                                    <LazyImage
                                        src="https://leetcard.jacoblin.cool/gauravky?theme=dark&ext=heatmap"
                                        alt="LeetCode statistics and heatmap for gauravky"
                                        responsive={false}
                                        className="block h-auto w-full"
                                    />
                                </div>
                            </a>
                        </div>
                    </section>
                </ScrollReveal>

                <ScrollReveal delay={90}>
                    <section aria-labelledby="about-cta-title" className="relative overflow-hidden rounded-lg border border-obsidian-border bg-obsidian-card px-5 py-10 text-center sm:px-8 sm:py-12">
                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-toxic/[0.05] via-transparent to-transparent" />
                        <div className="relative">
                            <h2 id="about-cta-title" className="font-display text-2xl font-bold uppercase tracking-tight text-white sm:text-3xl lg:text-4xl">
                                Let&apos;s Build Something Useful
                            </h2>
                            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
                                Open to software engineering, AI/ML opportunities, open-source work, and meaningful collaborations.
                            </p>
                            <div className="mt-7 flex flex-col items-stretch justify-center gap-3 min-[390px]:flex-row min-[390px]:items-center min-[390px]:flex-wrap">
                                <Link to="/contact" className={primaryButtonClass}>
                                    Get in Touch
                                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                                </Link>
                                <a href="/resume.pdf" target="_blank" rel="noopener noreferrer" className={secondaryButtonClass}>
                                    View Resume
                                    <Download className="h-3.5 w-3.5" aria-hidden="true" />
                                </a>
                            </div>
                            <Link to="/journey" className="mt-6 inline-flex min-h-11 items-center gap-2 px-3 font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-500 transition-colors hover:text-toxic focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-toxic">
                                View Journey
                                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                            </Link>
                        </div>
                    </section>
                </ScrollReveal>
            </div>
        </main>
    )
}

export default About

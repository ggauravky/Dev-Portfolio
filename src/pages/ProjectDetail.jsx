// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { useParams, Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import useSEO from '../hooks/useSEO'
import { projectsData } from '../data/projectsData'
import LazyImage from '../components/LazyImage'
import ScrollReveal from '../components/ScrollReveal'

function ProjectDetail() {
    const { slug } = useParams()
    const navigate = useNavigate()
    const [project, setProject] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' })
        setLoading(true)

        const found = projectsData.find(p => p.slug === slug)
        if (!found) {
            // keep loading=true so the spinner shows while we wait to redirect
            setTimeout(() => navigate('/projects', { replace: true }), 1500)
        } else {
            setProject(found)
            setLoading(false)
        }
    }, [slug, navigate])

    // Related projects — same category, excluding current
    const relatedProjects = project
        ? projectsData
            .filter(p => p.slug !== slug && p.categories.some(c => project.categories.includes(c)))
            .slice(0, 3)
        : []

    useSEO({
        title: project
            ? `${project.title} — Case Study | Gaurav Kumar Yadav`
            : 'Project | Gaurav Kumar Yadav',
        description: project ? project.description : 'Explore a project case study by Gaurav Kumar Yadav.',
        keywords: project ? project.techStack.join(', ') : '',
        ogImage: project ? `https://ggauravky.vercel.app${project.image}` : 'https://ggauravky.vercel.app/images/profile.jpg'
    })

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
                    <p className="text-slate-300 font-medium">Loading project...</p>
                </div>
            </div>
        )
    }

    if (!project) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-center px-4">
                    <div className="flex justify-center mb-4"><svg className="w-20 h-20 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z" /></svg></div>
                    <h2 className="text-2xl font-bold text-slate-300 mb-2">Project Not Found</h2>
                    <p className="text-slate-400 mb-6">Redirecting you back to Projects...</p>
                    <Link to="/projects" className="px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl font-semibold hover:scale-105 transition-all">
                        ← Back to Projects
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-900 relative overflow-x-hidden">
            {/* Ambient background */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className="absolute top-40 -right-40 w-96 h-96 bg-purple-600/8 rounded-full blur-3xl"></div>
                <div className="absolute bottom-40 -left-40 w-96 h-96 bg-cyan-600/8 rounded-full blur-3xl"></div>
            </div>

            {/* ── Hero ── */}
            <div className="relative h-64 sm:h-80 md:h-96 overflow-hidden">
                <LazyImage
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/70 to-slate-900/30"></div>

                {/* Back button */}
                <div className="absolute top-6 left-4 sm:left-8">
                    <Link
                        to="/projects"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/80 backdrop-blur-md border border-slate-700/50 rounded-xl text-slate-300 hover:text-white hover:border-purple-500/50 transition-all duration-300 text-sm font-medium"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Projects
                    </Link>
                </div>
            </div>

            {/* ── Main content ── */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">

                {/* Title + meta */}
                <div className="-mt-16 relative z-10 mb-10">
                    <div className="flex flex-wrap gap-2 mb-4">
                        {project.categories.map((cat, i) => (
                            <span key={i} className="px-3 py-1 bg-purple-600/80 backdrop-blur-sm text-white text-xs font-semibold rounded-full border border-purple-400/30">
                                {cat}
                            </span>
                        ))}
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-4 leading-tight">
                        {project.title}
                    </h1>
                    <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-3xl">
                        {project.description}
                    </p>

                    {/* Tech stack pills */}
                    <div className="flex flex-wrap gap-2 mt-5">
                        {project.techStack.map((tech, i) => (
                            <span key={i} className="px-3 py-1.5 bg-slate-800 border border-slate-700/60 text-slate-300 rounded-lg text-sm hover:border-purple-500/50 hover:text-purple-300 transition-all duration-200">
                                {tech}
                            </span>
                        ))}
                    </div>

                    {/* Action links */}
                    <div className="flex flex-wrap gap-3 mt-6">
                        <a
                            href={project.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-5 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-purple-500/50 text-slate-300 hover:text-white rounded-xl font-medium transition-all duration-300 hover:scale-105 text-sm"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                            View Code
                        </a>
                        {project.demo && project.demo !== '#' && (
                            <a
                                href={project.demo}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/30 text-sm"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                Live Demo
                            </a>
                        )}
                    </div>
                </div>

                {/* ── Case Study Sections ── */}
                <div className="space-y-8">

                    {/* Problem Statement */}
                    <ScrollReveal>
                        <div className="bg-gradient-to-br from-red-500/10 to-orange-500/5 border border-red-500/20 rounded-2xl p-6 sm:p-8">
                            <div className="flex items-center gap-3 mb-5">
                                <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
                                <h2 className="text-2xl font-bold text-red-400">Problem Statement</h2>
                            </div>
                            <p className="text-slate-300 leading-relaxed text-base sm:text-lg">
                                {project.problem}
                            </p>
                        </div>
                    </ScrollReveal>

                    {/* Solution */}
                    <ScrollReveal delay={80}>
                        <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 rounded-2xl p-6 sm:p-8">
                            <div className="flex items-center gap-3 mb-5">
                                <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" /></svg>
                                <h2 className="text-2xl font-bold text-emerald-400">My Solution</h2>
                            </div>
                            <p className="text-slate-300 leading-relaxed text-base sm:text-lg">
                                {project.solution}
                            </p>
                        </div>
                    </ScrollReveal>

                    {/* Architecture */}
                    <ScrollReveal delay={120}>
                        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/20 rounded-2xl p-6 sm:p-8">
                            <div className="flex items-center gap-3 mb-5">
                                <svg className="w-7 h-7 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" /></svg>
                                <h2 className="text-2xl font-bold text-blue-400">Architecture Overview</h2>
                            </div>
                            <div className="bg-slate-900/60 rounded-xl px-5 py-4 border border-slate-700/40">
                                <code className="text-cyan-300 text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-mono">
                                    {project.architecture}
                                </code>
                            </div>
                        </div>
                    </ScrollReveal>

                    {/* Key Technical Decisions */}
                    <ScrollReveal delay={160}>
                        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/5 border border-purple-500/20 rounded-2xl p-6 sm:p-8">
                            <div className="flex items-center gap-3 mb-5">
                                <svg className="w-7 h-7 text-purple-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                <h2 className="text-2xl font-bold text-purple-400">Key Technical Decisions</h2>
                            </div>
                            <ul className="space-y-3">
                                {project.keyDecisions.map((decision, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <span className="mt-1 shrink-0 w-6 h-6 rounded-full bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 text-xs font-bold">
                                            {i + 1}
                                        </span>
                                        <span className="text-slate-300 leading-relaxed">{decision}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </ScrollReveal>

                    {/* Lessons Learned */}
                    <ScrollReveal delay={200}>
                        <div className="bg-gradient-to-br from-amber-500/10 to-yellow-500/5 border border-amber-500/20 rounded-2xl p-6 sm:p-8">
                            <div className="flex items-center gap-3 mb-5">
                                <svg className="w-7 h-7 text-amber-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
                                <h2 className="text-2xl font-bold text-amber-400">Lessons Learned</h2>
                            </div>
                            <ul className="space-y-3">
                                {project.lessonsLearned.map((lesson, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <span className="text-amber-400 mt-1 shrink-0">▹</span>
                                        <span className="text-slate-300 leading-relaxed">{lesson}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </ScrollReveal>

                    {/* Screenshots Gallery */}
                    {project.screenshots && project.screenshots.length > 0 && (
                        <ScrollReveal delay={240}>
                            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 rounded-2xl p-6 sm:p-8">
                                <div className="flex items-center gap-3 mb-5">
                                    <svg className="w-7 h-7 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
                                    <h2 className="text-2xl font-bold text-slate-300">Screenshots</h2>
                                </div>
                                <div className={`grid gap-4 ${project.screenshots.length === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
                                    {project.screenshots.map((src, i) => (
                                        <div key={i} className="rounded-xl overflow-hidden border border-slate-700/40 hover:border-purple-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
                                            <LazyImage
                                                src={src}
                                                alt={`${project.title} screenshot ${i + 1}`}
                                                className="w-full h-56 sm:h-64 object-cover hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </ScrollReveal>
                    )}
                </div>

                {/* ── Related Projects ── */}
                {relatedProjects.length > 0 && (
                    <ScrollReveal delay={280} className="mt-16">
                        <h2 className="text-2xl font-bold text-slate-300 mb-6 flex items-center gap-2">
                            <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" /></svg> Related Projects
                        </h2>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {relatedProjects.map(rel => (
                                <Link
                                    key={rel.id}
                                    to={`/projects/${rel.slug}`}
                                    className="group bg-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden hover:border-purple-500/50 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/15 transition-all duration-300"
                                >
                                    <div className="card-img-wrap h-36 overflow-hidden">
                                        <LazyImage
                                            src={rel.image}
                                            alt={rel.title}
                                            className="w-full h-full object-cover card-img-zoom"
                                        />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-semibold text-purple-300 group-hover:text-purple-200 transition-colors mb-1 line-clamp-1">
                                            {rel.title}
                                        </h3>
                                        <p className="text-slate-400 text-xs line-clamp-2">{rel.description}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </ScrollReveal>
                )}

                {/* Bottom CTA */}
                <ScrollReveal delay={320} className="mt-16 text-center">
                    <div className="bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-cyan-600/20 border border-slate-600/50 rounded-2xl p-8">
                        <h3 className="text-xl font-bold text-slate-200 mb-2">Like what you see?</h3>
                        <p className="text-slate-400 mb-6">Let's discuss how I can bring this kind of thinking to your project.</p>
                        <div className="flex flex-wrap gap-4 justify-center">
                            <Link
                                to="/contact"
                                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/40 text-sm"
                            >
                                Get In Touch
                            </Link>
                            <Link
                                to="/projects"
                                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-xl font-semibold text-slate-300 transition-all duration-300 hover:scale-105 text-sm"
                            >
                                ← All Projects
                            </Link>
                        </div>
                    </div>
                </ScrollReveal>
            </div>
        </div>
    )
}

export default ProjectDetail

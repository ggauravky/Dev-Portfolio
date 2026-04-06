// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import useSEO from '../hooks/useSEO'
import LazyImage from '../components/LazyImage'
import { projectsData, projectCategories } from '../data/projectsData'

function Projects() {
    useSEO({
        title: 'Projects - Gaurav Portfolio | Python, AI/ML & Full Stack Development Projects',
        description: 'Explore Gaurav Portfolio Projects! Student developer portfolio featuring innovative Python projects, AI/ML applications, Data Science tools, and Full Stack web applications by Gaurav Kumar Yadav. Projects include AI Video Editing platform, Real-Time Chat App, MERN stack applications, Data Analysis dashboards, and more. Portfolio showcasing real-world solutions. Open for internships and freelance work.',
        keywords: 'Gaurav Portfolio Projects, Portfolio Projects, Python Projects, AI ML Projects, Data Science Projects, Full Stack Projects, React Projects, Node.js Projects, Student Developer Portfolio, AI Video Editor, Web Applications, Internship Portfolio, Developer Projects, Portfolio Gallery',
        ogImage: 'https://ggauravky.vercel.app/images/projects/chatapp.png',
        additionalJsonLd: {
            '@type': 'ItemList',
            name: 'Gaurav Kumar Yadav Project Portfolio',
            itemListElement: projectsData.map((project, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                url: `https://ggauravky.vercel.app/projects/${project.slug}`,
                name: project.title
            }))
        }
    })

    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('All')
    const [sortBy, setSortBy] = useState('featured')

    // Filter projects based on search and category
    const filteredProjects = useMemo(() => {
        const filtered = projectsData.filter(project => {
            const matchesSearch =
                project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                project.techStack.some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase()))

            const matchesCategory = selectedCategory === 'All' || project.categories.includes(selectedCategory)

            return matchesSearch && matchesCategory
        })

        const sorted = [...filtered]

        switch (sortBy) {
            case 'newest':
                sorted.sort((a, b) => b.id - a.id)
                break
            case 'alphabetical':
                sorted.sort((a, b) => a.title.localeCompare(b.title))
                break
            case 'tech-depth':
                sorted.sort((a, b) => b.techStack.length - a.techStack.length)
                break
            case 'featured':
            default:
                sorted.sort((a, b) => (Number(Boolean(b.featured)) - Number(Boolean(a.featured))) || (b.id - a.id))
                break
        }

        return sorted
    }, [searchQuery, selectedCategory, sortBy])

    const recommendedProjects = useMemo(() => {
        const scoped = projectsData.filter((project) => selectedCategory === 'All' || project.categories.includes(selectedCategory))
        const sorted = [...scoped].sort((a, b) => (Number(Boolean(b.featured)) - Number(Boolean(a.featured))) || (b.id - a.id))
        return sorted.slice(0, 3)
    }, [selectedCategory])

    return (
        <div className="min-h-screen bg-slate-900 px-6 py-16 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute top-20 right-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-20 left-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-12 animate-fadeIn">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                        My Projects
                    </h1>
                    <p className="text-xl text-slate-400 max-w-3xl mx-auto">
                        Real-world applications built with modern technologies and best practices
                    </p>
                </div>

                {/* Search Bar */}
                <div className="max-w-2xl mx-auto mb-8 animate-slideUp">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search projects by name, tech stack, or description..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-6 py-4 bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-2xl text-slate-300 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>

                {/* Filter Buttons */}
                <div className="flex flex-wrap justify-center gap-3 mb-12 animate-slideUp" style={{ animationDelay: '0.1s' }}>
                    {projectCategories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${selectedCategory === category
                                ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-lg shadow-purple-500/50 scale-105'
                                : 'bg-slate-800/80 backdrop-blur-sm border border-slate-700 text-slate-400 hover:text-slate-300 hover:border-purple-500/50 hover:scale-105'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                <div className="max-w-xs mx-auto mb-8 animate-slideUp" style={{ animationDelay: '0.15s' }}>
                    <label htmlFor="projects-sort" className="block text-xs font-semibold tracking-widest uppercase text-slate-500 mb-2 text-center">Sort Projects</label>
                    <select
                        id="projects-sort"
                        value={sortBy}
                        onChange={(event) => setSortBy(event.target.value)}
                        className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
                    >
                        <option value="featured">Featured First</option>
                        <option value="newest">Newest First</option>
                        <option value="alphabetical">Alphabetical</option>
                        <option value="tech-depth">Most Tech Stack Depth</option>
                    </select>
                </div>

                {/* Results Count */}
                <div className="text-center mb-8 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                    <p className="text-slate-400">
                        {filteredProjects.length === 0 ? (
                            <span className="text-red-400">No projects found matching your criteria</span>
                        ) : (
                            <span>
                                Showing <span className="text-purple-400 font-semibold">{filteredProjects.length}</span>
                                {filteredProjects.length === 1 ? ' project' : ' projects'}
                            </span>
                        )}
                    </p>
                </div>

                {/* Projects Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {filteredProjects.length === 0 ? (
                        <div className="col-span-full text-center py-20">
                            <div className="flex justify-center mb-6"><svg className="w-24 h-24 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z" /></svg></div>
                            <h3 className="text-2xl font-bold text-slate-400 mb-4">No Projects Found</h3>
                            <p className="text-slate-500 mb-8">Try adjusting your search or filters</p>
                            <button
                                onClick={() => {
                                    setSearchQuery('')
                                    setSelectedCategory('All')
                                }}
                                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full font-semibold hover:scale-105 transition-all duration-300"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    ) : (
                        filteredProjects.map((project, index) => (
                            <div
                                key={project.id}
                                className="group bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 hover:scale-[1.02] animate-slideUp"
                                style={{ animationDelay: `${Math.min(0.3 + index * 0.1, 0.8)}s` }}
                            >
                                {/* Project Image - Lazy Loaded */}
                                <div className="card-img-wrap relative h-56 bg-slate-700/50 overflow-hidden">
                                    <LazyImage
                                        src={project.image}
                                        alt={project.title}
                                        sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                                        fetchPriority={index < 2 ? 'high' : 'auto'}
                                        className="w-full h-full object-cover card-img-zoom"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent opacity-70"></div>

                                    {/* Category Badges — show first 2 to avoid overflow-hidden clipping */}
                                    <div className="absolute top-4 right-4 flex flex-col gap-1.5 items-end">
                                        {project.categories.slice(0, 2).map((category) => (
                                            <span key={`${project.id}-cat-${category}`} className="px-3 py-1 bg-purple-600/90 backdrop-blur-sm text-white text-xs font-semibold rounded-full border border-purple-400/50 whitespace-nowrap">
                                                {category}
                                            </span>
                                        ))}
                                        {project.categories.length > 2 && (
                                            <span className="px-3 py-1 bg-slate-700/90 backdrop-blur-sm text-slate-300 text-xs font-semibold rounded-full border border-slate-500/50">
                                                +{project.categories.length - 2}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Project Content */}
                                <div className="p-6">
                                    <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent group-hover:from-pink-400 group-hover:to-purple-400 transition-all duration-300">
                                        {project.title}
                                    </h3>
                                    <p className="text-slate-400 leading-relaxed mb-5 line-clamp-3">
                                        {project.description}
                                    </p>

                                    {/* Tech Stack */}
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {project.techStack.map((tech) => (
                                            <span
                                                key={`${project.id}-tech-${tech}`}
                                                className="bg-slate-800/80 text-slate-300 px-3 py-1.5 rounded-lg text-sm border border-slate-700/50 hover:border-purple-500/50 hover:text-purple-400 transition-all duration-200"
                                            >
                                                {tech}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Links */}
                                    <div className="flex flex-col gap-3">
                                        <Link
                                            to={`/projects/${project.slug}`}
                                            className="w-full text-center bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold px-4 py-3 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/40"
                                        >
                                            <span className="flex items-center justify-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                View Case Study
                                            </span>
                                        </Link>
                                        <div className="flex gap-3">
                                            <a
                                                href={project.github}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 text-center bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium px-4 py-2.5 rounded-xl transition-all duration-300 border border-slate-700 hover:border-purple-500 hover:scale-105 text-sm"
                                            >
                                                <span className="flex items-center justify-center gap-1.5">
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                                    </svg>
                                                    Code
                                                </span>
                                            </a>
                                            {project.demo && project.demo !== "#" && (
                                                <a
                                                    href={project.demo}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex-1 text-center bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium px-4 py-2.5 rounded-xl transition-all duration-300 hover:scale-105 text-sm"
                                                >
                                                    <span className="flex items-center justify-center gap-1.5">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                        </svg>
                                                        Demo
                                                    </span>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {recommendedProjects.length > 0 ? (
                    <div className="mt-14 animate-fadeIn" style={{ animationDelay: '0.5s' }}>
                        <div className="flex items-center justify-between gap-3 mb-5">
                            <h2 className="text-2xl md:text-3xl font-bold text-slate-100">Recommended to Explore Next</h2>
                            <span className="text-xs text-slate-500 uppercase tracking-widest">Discovery</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {recommendedProjects.map((project) => (
                                <Link
                                    key={`recommended-${project.id}`}
                                    to={`/projects/${project.slug}`}
                                    className="group rounded-2xl border border-slate-700/70 bg-slate-800/60 p-4 hover:border-cyan-500/40 hover:-translate-y-1 transition-all duration-300"
                                >
                                    <p className="text-xs text-cyan-300 uppercase tracking-wider">{(project.categories || [])[0] || 'Project'}</p>
                                    <p className="mt-2 text-base font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors">{project.title}</p>
                                    <p className="mt-2 text-sm text-slate-400 line-clamp-2">{project.description}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                ) : null}

                {/* Call to Action */}
                {filteredProjects.length > 0 && (
                    <div className="mt-16 text-center animate-fadeIn" style={{ animationDelay: '0.8s' }}>
                        <div className="bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-cyan-600/20 backdrop-blur-sm p-8 md:p-10 rounded-2xl border border-slate-600/50">
                            <h3 className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                                Want Similar Delivery for Your Project?
                            </h3>
                            <p className="text-slate-300 text-lg mb-6 max-w-2xl mx-auto">
                                Move from inspiration to execution with a focused build plan.
                            </p>
                            <div className="flex flex-wrap items-center justify-center gap-3">
                                <Link
                                    to="/services"
                                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 rounded-full font-semibold transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-purple-500/50"
                                >
                                    Book Service
                                </Link>
                                <Link
                                    to="/contact"
                                    className="inline-flex items-center gap-2 px-8 py-4 border border-slate-600 hover:border-cyan-500/50 rounded-full font-semibold text-slate-100 hover:text-cyan-300 transition-all duration-300"
                                >
                                    Start a Conversation
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Projects

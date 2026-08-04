// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useSEO from '../hooks/useSEO'
import LazyImage from '../components/LazyImage'
import TechIcon from '../components/TechIcon'
import { projectsData, projectCategories } from '../data/projectsData'

function Projects() {
    useSEO({
        title: 'Projects | Gaurav Kumar Yadav | AI/ML and Web Developer Portfolio',
        description: 'Explore portfolio case studies by Gaurav Kumar Yadav, a BCA student at BBDU Lucknow, India. AI/ML and web development projects built with Python, React, Node.js, and MERN stack tools.',
        keywords: 'Gaurav Kumar Yadav projects, Gaurav AI ML developer, Gaurav web developer India, ggauravky portfolio, AI ML developer Lucknow, MERN stack developer student, machine learning beginner projects',
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
        <main className="projects-page bg-obsidian min-h-screen px-4 py-24 sm:px-6 lg:px-8 relative overflow-hidden w-full">
            {/* Animated Background */}
            <div className="absolute top-20 right-10 w-72 h-72 bg-toxic/5 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-20 left-10 w-96 h-96 bg-cyber/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>

            <div className="max-w-7xl mx-auto relative z-10 space-y-10">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto animate-fadeIn">
                    <span className="inline-block text-toxic text-xs font-bold tracking-widest uppercase mb-4 px-4 py-2 bg-toxic/5 rounded-full border border-toxic/15">
                        My Portfolio
                    </span>
                    <h1 className="text-4xl sm:text-5xl lg:text-7xl font-display font-extrabold uppercase leading-[0.95] tracking-tighter text-white mb-6">
                        Case Studies
                    </h1>
                    <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">
                        AI/ML and web development projects built with Python, React, Node.js, and MERN stack workflows.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="max-w-2xl mx-auto animate-slideUp">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search projects by name, tech stack, or description..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-6 py-4 bg-obsidian-card border border-obsidian-border rounded-lg text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-toxic focus:ring-1 focus:ring-toxic/20 transition-all font-mono text-xs sm:text-sm"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-toxic transition-colors font-mono text-sm"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>

                {/* Filter Buttons */}
                <div className="flex flex-wrap justify-center gap-3 animate-slideUp" style={{ animationDelay: '0.1s' }}>
                    {projectCategories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-5 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all duration-300 font-mono ${selectedCategory === category
                                ? 'bg-toxic text-obsidian scale-105'
                                : 'bg-obsidian-card border border-obsidian-border text-zinc-400 hover:text-white hover:border-toxic hover:scale-105'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* Sorting options */}
                <div className="max-w-xs mx-auto animate-slideUp" style={{ animationDelay: '0.15s' }}>
                    <label htmlFor="projects-sort" className="block text-[10px] font-mono font-bold tracking-widest uppercase text-zinc-500 mb-2.5 text-center">// Sort Projects</label>
                    <select
                        id="projects-sort"
                        value={sortBy}
                        onChange={(event) => setSortBy(event.target.value)}
                        className="w-full bg-obsidian-card border border-obsidian-border text-zinc-300 focus:outline-none focus:border-toxic rounded-lg px-4 py-3 text-xs font-mono uppercase tracking-wider cursor-pointer transition-colors"
                    >
                        <option value="featured">Featured First</option>
                        <option value="newest">Newest First</option>
                        <option value="alphabetical">Alphabetical</option>
                        <option value="tech-depth">Most Tech Stack Depth</option>
                    </select>
                </div>

                {/* Results Count */}
                <div className="text-center animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                    <p className="text-zinc-500 font-mono text-xs uppercase tracking-wider">
                        {filteredProjects.length === 0 ? (
                            <span className="text-cyber font-bold">// No projects found matching your criteria</span>
                        ) : (
                            <span>
                                // Showing <span className="text-toxic font-bold">{filteredProjects.length}</span>
                                {filteredProjects.length === 1 ? ' project' : ' projects'}
                            </span>
                        )}
                    </p>
                </div>

                {/* Projects Grid with Framer Motion Layout animations */}
                <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <AnimatePresence mode="popLayout">
                        {filteredProjects.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                key="no-results"
                                className="col-span-full text-center py-20 bg-obsidian-card border border-obsidian-border rounded-lg"
                            >
                                <div className="flex justify-center mb-6">
                                    <svg className="w-16 h-16 text-zinc-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-display font-bold uppercase text-white mb-2">No Projects Found</h3>
                                <p className="text-zinc-500 text-sm mb-6 font-mono uppercase tracking-wider">// Try adjusting your search or filters</p>
                                <button
                                    onClick={() => {
                                        setSearchQuery('')
                                        setSelectedCategory('All')
                                    }}
                                    className="px-6 py-3 bg-toxic text-obsidian rounded-full font-bold text-xs uppercase tracking-wider hover:bg-white transition-all duration-300"
                                >
                                    Clear All Filters
                                </button>
                            </motion.div>
                        ) : (
                            filteredProjects.map((project, index) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.3 }}
                                    key={project.id}
                                    className="group bg-obsidian-card border border-obsidian-border rounded-lg overflow-hidden hover:border-toxic/30 transition-all duration-300 flex flex-col h-full"
                                >
                                    {/* Project Image - Lazy Loaded */}
                                    <div className="card-img-wrap relative h-56 bg-obsidian overflow-hidden">
                                        <LazyImage
                                            src={project.image}
                                            alt={`${project.title} case study by Gaurav Kumar Yadav - AI ML and web developer portfolio`}
                                            sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                                            fetchPriority={index < 2 ? 'high' : 'auto'}
                                            className="w-full h-full object-cover card-img-zoom"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-transparent opacity-80"></div>

                                        {/* Category Badges */}
                                        <div className="absolute top-4 right-4 flex flex-col gap-1.5 items-end z-25">
                                            {project.categories.slice(0, 2).map((category) => (
                                                <span key={`${project.id}-cat-${category}`} className="px-2.5 py-1 bg-toxic text-obsidian text-[10px] font-mono font-bold rounded uppercase border border-obsidian whitespace-nowrap">
                                                    {category}
                                                </span>
                                            ))}
                                            {project.categories.length > 2 && (
                                                <span className="px-2.5 py-1 bg-obsidian text-zinc-400 text-[10px] font-mono font-bold rounded uppercase border border-obsidian-border whitespace-nowrap">
                                                    +{project.categories.length - 2}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Project Content */}
                                    <div className="p-6 flex flex-col flex-grow">
                                        <h3 className="text-xl font-display font-bold uppercase text-white mb-2 group-hover:text-toxic transition-colors">
                                            {project.title}
                                        </h3>

                                        {/* Ownership Badge — Directly below title */}
                                        <div className="mb-3">
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-[10px] font-mono tracking-wider uppercase ${
                                                    project.isCollaborative
                                                        ? 'bg-obsidian/80 border-cyber/30 text-cyber'
                                                        : 'bg-obsidian/80 border-obsidian-border text-zinc-400'
                                                }`}
                                            >
                                                {project.isCollaborative ? (
                                                    <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                                    </svg>
                                                )}
                                                <span>{project.isCollaborative ? 'Team Project' : 'Solo Project'}</span>
                                            </span>
                                        </div>

                                        <p className="text-zinc-400 text-sm leading-relaxed mb-5 line-clamp-3 flex-grow">
                                            {project.description}
                                        </p>

                                        {/* Tech Stack */}
                                        <div className="flex flex-wrap gap-1.5 mb-6">
                                            {project.techStack.map((tech) => (
                                                <span
                                                    key={`${project.id}-tech-${tech}`}
                                                    className="inline-flex items-center gap-1 bg-obsidian text-zinc-400 border border-obsidian-border px-2.5 py-1.5 rounded font-mono text-[10px] hover:border-toxic hover:text-white transition-all"
                                                >
                                                    <TechIcon name={tech} className="w-3.5 h-3.5 shrink-0" />
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Links */}
                                        <div className="flex flex-col gap-3 mt-auto">
                                            <Link
                                                to={`/projects/${project.slug}`}
                                                className="w-full text-center bg-toxic hover:bg-white text-obsidian font-bold px-4 py-3 rounded-full transition-all duration-300 hover:scale-[1.02] text-xs uppercase tracking-wider font-mono"
                                            >
                                                View Case Study
                                            </Link>
                                            <div className="flex gap-2">
                                                <a
                                                    href={project.github}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex-1 inline-flex items-center justify-center border border-zinc-800 hover:border-toxic text-zinc-300 hover:text-toxic font-bold px-4 py-2.5 rounded-full transition-all duration-300 hover:scale-[1.02] text-xs uppercase tracking-wider font-mono"
                                                >
                                                    Code
                                                </a>
                                                {project.demo && project.demo !== "#" && (
                                                    <a
                                                        href={project.demo}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex-1 inline-flex items-center justify-center bg-cyber hover:bg-white text-obsidian font-bold px-4 py-2.5 rounded-full transition-all duration-300 hover:scale-[1.02] text-xs uppercase tracking-wider font-mono"
                                                    >
                                                        Demo
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Recommendation row */}
                {recommendedProjects.length > 0 ? (
                    <div className="mt-14 animate-fadeIn" style={{ animationDelay: '0.5s' }}>
                        <div className="flex items-center justify-between gap-3 mb-6">
                            <h2 className="text-xl sm:text-2xl font-display font-bold uppercase text-white">Recommended Projects</h2>
                            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">// Discovery</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            {recommendedProjects.map((project) => (
                                <Link
                                    key={`recommended-${project.id}`}
                                    to={`/projects/${project.slug}`}
                                    className="group rounded-lg border border-obsidian-border bg-obsidian-card p-6 hover:border-toxic/30 transition-all duration-300"
                                >
                                    <p className="text-[10px] font-mono font-bold text-toxic uppercase tracking-wider">{(project.categories || [])[0] || 'Project'}</p>
                                    <p className="mt-2 text-lg font-display font-bold uppercase text-white group-hover:text-toxic transition-colors">{project.title}</p>
                                    <p className="mt-2 text-xs text-zinc-400 leading-relaxed line-clamp-2">{project.description}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                ) : null}

                {/* Call to Action */}
                {filteredProjects.length > 0 && (
                    <div className="mt-16 text-center animate-fadeIn" style={{ animationDelay: '0.8s' }}>
                        <div className="bg-obsidian-card p-8 md:p-12 rounded-lg border border-obsidian-border relative overflow-hidden">
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-toxic/5 via-transparent to-transparent pointer-events-none"></div>
                            <h3 className="text-2xl md:text-3xl font-display font-bold uppercase text-white mb-4">
                                Want Similar Delivery for Your Project?
                            </h3>
                            <p className="text-zinc-400 text-sm sm:text-base mb-8 max-w-2xl mx-auto leading-relaxed">
                                Move from inspiration to execution with a focused, premium build plan.
                            </p>
                            <div className="flex flex-wrap items-center justify-center gap-4">
                                <Link
                                    to="/services"
                                    className="group relative px-8 py-4 bg-toxic text-obsidian rounded-full font-bold text-xs tracking-wider uppercase hover:bg-white hover:scale-105 transition-all duration-300 shadow-lg shadow-toxic/15 hover:shadow-white/20 text-center overflow-hidden inline-flex items-center justify-center"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2 leading-none">
                                        <span>Book Service</span>
                                        <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                                    </span>
                                </Link>
                                <Link
                                    to="/contact"
                                    className="group relative px-8 py-4 border border-zinc-700 hover:border-toxic rounded-full font-bold text-xs tracking-wider uppercase bg-transparent text-zinc-300 hover:text-toxic hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-toxic/5 text-center backdrop-blur-sm inline-flex items-center justify-center"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2 leading-none">
                                        <span>Start a Conversation</span>
                                        <svg className="w-3.5 h-3.5 shrink-0 group-hover:rotate-12 transition-transform duration-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                                    </span>
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    )
}

export default Projects

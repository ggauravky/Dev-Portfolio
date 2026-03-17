// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { Link } from 'react-router-dom'
import { useMemo, useEffect } from 'react'
import useSEO from '../hooks/useSEO'
import { blogsData } from '../data/blogsData'
import { projectsData } from '../data/projectsData'
import { pingBackend } from '../utils/backendPing'
import LazyImage from '../components/LazyImage'
import StatsCards from '../components/StatsCards'
import ScrollReveal from '../components/ScrollReveal'
import TechIcon from '../components/TechIcon'

function Home() {
    // Wake up backend server on component mount
    useEffect(() => {
        // Ping backend silently to prevent cold start
        pingBackend()
    }, [])

    // SEO Optimization
    useSEO({
        title: 'Gaurav Kumar Yadav | Best Python & AI Developer in Lucknow | Full Stack Portfolio',
        description: 'Gaurav Kumar Yadav - Top Python Developer, AI/ML Engineer & Full Stack Developer from Lucknow, India. Explore innovative projects in Data Science, Machine Learning, React, Node.js & MongoDB. Award-winning portfolio of a student developer specializing in artificial intelligence, deep learning, and modern web development. Hire for internships, freelance & collaboration.',
        keywords: 'Gaurav Kumar Yadav, best developer in Lucknow, top Python developer India, AI developer Lucknow, best portfolio website, Gaurav Portfolio, developer portfolio, Python developer, AI engineer, machine learning developer, data science portfolio, full stack developer Lucknow, React developer India, Node.js developer, best student developer, web developer Lucknow, freelance developer India, hire Python developer, hire AI developer, MERN stack developer, software engineer Lucknow, best coder Lucknow, top programmer India, Gaurav Yadav developer, ggauravky, best developer portfolio 2026, AI projects portfolio, Lucknow IT developer, UP developer, Indian developer portfolio, BCA developer, BBDU developer, coding portfolio, tech blog India, JavaScript developer',
        ogImage: 'https://ggauravky.vercel.app/og-image.jpg'
    })

    // Featured projects for home page - driven by featured:true flag in projectsData
    const featuredProjects = useMemo(() => projectsData.filter(p => p.featured), [])

    const skills = useMemo(() => ({
        ai: ["Python", "Machine Learning", "Data Analysis", "Pandas", "NumPy"],
        web: ["React", "JavaScript", "Tailwind CSS", "Node.js", "Git"],
        languages: ["Python", "JavaScript", "C", "SQL"]
    }), [])

    // Dynamically get featured blogs from the shared data
    const featuredBlogs = useMemo(() => blogsData.filter(blog => blog.featured), [])

    return (
        <div className="home-page bg-slate-900 overflow-x-hidden w-full">
            {/* Hero Section */}
            <section className="hero-section relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-10 lg:pt-14 lg:pb-0 overflow-hidden w-full">
                {/* Subtle Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900/20 to-purple-900/15"></div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-transparent"></div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-600/10 via-transparent to-transparent"></div>
                
                {/* Soft ambient orbs */}
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <div className="absolute top-10 -left-10 w-72 h-72 bg-purple-500 rounded-full filter blur-3xl animate-float"></div>
                    <div className="absolute bottom-10 -right-10 w-72 h-72 bg-blue-500 rounded-full filter blur-3xl animate-float" style={{animationDelay: '3s'}}></div>
                </div>

                <div className="relative max-w-7xl w-full mx-auto z-10">
                    <div className="grid lg:grid-cols-2 gap-6 lg:gap-10 items-center">
                        {/* Left Content */}
                        <div className="text-center lg:text-left space-y-4 order-2 lg:order-1">
                            {/* Welcome Badge */}
                            <span className="inline-flex items-center gap-2 text-blue-400 text-xs sm:text-sm font-semibold tracking-widest uppercase px-4 py-1.5 bg-blue-500/10 rounded-full border border-blue-500/25 backdrop-blur-sm">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                </span>{' '}
                                Welcome to my portfolio
                            </span>
                            
                            {/* Name */}
                            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight">
                                <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-gradient">
                                    Gaurav Kumar
                                </span>
                                <span className="block bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
                                    Yadav
                                </span>
                            </h1>

                            {/* Role Tags - Compact inline pills */}
                            <div className="flex flex-wrap gap-2.5 justify-center lg:justify-start">
                                {/* Python Developer */}
                                <div className="group flex items-center gap-2.5 px-3.5 py-2 bg-blue-500/10 border border-blue-500/25 rounded-lg hover:border-blue-400/50 hover:bg-blue-500/20 transition-all duration-300 backdrop-blur-sm cursor-default">
                                    <svg className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M11.914 0C5.82 0 6.2 2.656 6.2 2.656l.007 2.752h5.814v.826H3.9S0 5.789 0 11.969c0 6.18 3.403 5.96 3.403 5.96h2.034v-2.867s-.11-3.402 3.35-3.402h5.766s3.24.052 3.24-3.13V3.188S18.27 0 11.914 0zm-3.26 1.838a1.051 1.051 0 1 1 0 2.101 1.05 1.05 0 0 1 0-2.101z" fill="#4B91CC"/>
                                        <path d="M12.086 24c6.094 0 5.714-2.656 5.714-2.656l-.007-2.752H12v-.826h8.1S24 18.211 24 12.031c0-6.18-3.403-5.96-3.403-5.96H18.56v2.867s.114 3.402-3.347 3.402H9.448s-3.24-.052-3.24 3.13v5.342S5.73 24 12.086 24zm3.26-1.838a1.051 1.051 0 1 1 0-2.101 1.051 1.051 0 0 1 0 2.1z" fill="#FFD444"/>
                                    </svg>
                                    <span className="text-sm sm:text-base font-semibold text-blue-300">Python Developer</span>
                                </div>

                                {/* AI & Data Science */}
                                <div className="group flex items-center gap-2.5 px-3.5 py-2 bg-purple-500/10 border border-purple-500/25 rounded-lg hover:border-purple-400/50 hover:bg-purple-500/20 transition-all duration-300 backdrop-blur-sm cursor-default">
                                    <svg className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                                        <path d="M18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                                        <path d="M16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                                    </svg>
                                    <span className="text-sm sm:text-base font-semibold text-purple-300">AI & Data Science</span>
                                </div>

                                {/* Full Stack Developer */}
                                <div className="group flex items-center gap-2.5 px-3.5 py-2 bg-cyan-500/10 border border-cyan-500/25 rounded-lg hover:border-cyan-400/50 hover:bg-cyan-500/20 transition-all duration-300 backdrop-blur-sm cursor-default">
                                    <svg className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <path d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" />
                                    </svg>
                                    <span className="text-sm sm:text-base font-semibold text-cyan-300">Full Stack Developer</span>
                                </div>
                            </div>

                            {/* Status Info - Compact */}
                            <div className="flex flex-col gap-2">
                                <div className="inline-flex items-center justify-center lg:justify-start gap-2 px-3.5 py-1.5 text-sm text-slate-300">
                                    <svg className="w-4 h-4 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" /></svg>
                                    <span>Student Developer from <span className="text-blue-400 font-semibold">Lucknow, India</span></span>
                                </div>
                                
                                <div className="inline-flex items-center justify-center lg:justify-start gap-2 px-3.5 py-1.5 bg-emerald-500/10 border border-emerald-500/25 rounded-lg w-fit mx-auto lg:mx-0">
                                    <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.82m5.84-2.56a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.82m2.56 5.84a14.98 14.98 0 00-2.58-5.96m0 0a14.98 14.98 0 00-5.96-2.58" /></svg>
                                    <span className="text-emerald-300 font-semibold text-sm">Open for Internships & Freelance</span>
                                </div>
                            </div>

                            {/* CTA Buttons */}
                            <div className="flex flex-row gap-3 pt-2 justify-center lg:justify-start">
                                <Link 
                                    to="/projects" 
                                    className="group relative px-6 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 rounded-xl font-bold text-sm sm:text-base hover:from-blue-500 hover:via-purple-500 hover:to-cyan-500 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/40 text-center overflow-hidden inline-flex items-center justify-center"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2 leading-none">
                                        <span>View Projects</span>
                                        <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                                    </span>
                                </Link>
                                <Link 
                                    to="/contact" 
                                    className="group relative px-6 py-3 border-2 border-blue-500/40 rounded-xl font-bold text-sm sm:text-base hover:bg-blue-500/10 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30 text-center backdrop-blur-sm hover:border-blue-400/60 inline-flex items-center justify-center"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2 leading-none">
                                        <span>Contact Me</span>
                                        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                                    </span>
                                </Link>
                            </div>

                            {/* Divider line after buttons */}
                            <div className="pt-6 flex justify-center lg:justify-start">
                                <div className="w-full max-w-xl h-px bg-gradient-to-r from-blue-500/50 via-purple-500/30 to-transparent"></div>
                            </div>
                        </div>

                        {/* Right - Profile Image */}
                        <div className="flex justify-center items-center order-1 lg:order-2">
                            <div className="relative group">
                                {/* Clean glow behind image */}
                                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500 animate-pulse"></div>
                                
                                {/* Profile Image Container - Explicit square for perfect circle */}
                                <div className="relative">
                                    <div className="relative w-52 h-52 sm:w-60 sm:h-60 md:w-72 md:h-72 lg:w-80 lg:h-80 xl:w-[340px] xl:h-[340px] rounded-full overflow-hidden border-[3px] border-blue-500/30 shadow-2xl shadow-blue-500/20 group-hover:border-purple-500/50 transition-all duration-500 ring-2 ring-blue-500/15 ring-offset-2 ring-offset-slate-900">
                                        <img
                                            src="/images/profile.jpg"
                                            alt="Gaurav Kumar Yadav"
                                            loading="eager"
                                            decoding="async"
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                    </div>
                                    
                                    {/* Available badge */}
                                    <div className="absolute -bottom-2 right-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 py-1.5 rounded-full font-bold text-xs shadow-lg border-2 border-slate-900">
                                        <div className="flex items-center gap-1.5">
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                                            </span>
                                            <span>Available!</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="hidden lg:flex absolute bottom-4 left-1/2 transform -translate-x-1/2 flex-col items-center gap-1.5 animate-bounce cursor-pointer">
                    <span className="text-slate-500 text-xs font-medium">Scroll Down</span>
                    <div className="w-5 h-8 border-2 border-slate-600/50 rounded-full flex justify-center p-1 bg-slate-800/30">
                        <div className="w-1 h-1.5 bg-gradient-to-b from-blue-400 to-purple-500 rounded-full animate-scroll"></div>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-900 via-slate-800/50 to-slate-900 relative overflow-hidden">
                {/* Background Elements */}
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
                </div>
                
                <ScrollReveal className="max-w-6xl mx-auto relative z-10">
                    <div className="text-center mb-16 animate-fadeIn">
                        <span className="inline-block text-blue-400 text-sm font-bold tracking-widest uppercase mb-4 px-4 py-2 bg-blue-500/10 rounded-full border border-blue-500/20">Get to know me</span>
                        <h2 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mt-4 mb-6">
                            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                                About Me
                            </span>
                        </h2>
                        <p className="text-slate-400 text-lg md:text-xl max-w-3xl mx-auto">
                            Learn about my journey as a developer and what drives my passion for technology
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 mb-12">
                        <div className="group relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl p-8 md:p-10 rounded-3xl border border-slate-700/50 hover:border-blue-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-2 overflow-hidden">
                            {/* Card Background Effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            
                            <div className="relative z-10">
                                <svg className="w-16 h-16 mx-auto text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" /></svg>
                                <h3 className="text-3xl font-bold text-blue-400 mb-5 group-hover:text-blue-300 transition-colors">Who I Am</h3>
                                <p className="text-slate-300 leading-relaxed text-base md:text-lg">
                                    I'm a <span className="text-blue-400 font-semibold">BCA 2nd year student</span> passionate about AI, Data Science, and Software Development. I love solving real-world problems with code and building innovative solutions that make a meaningful impact.
                                </p>
                                <div className="mt-6 flex flex-wrap gap-2">
                                    <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-300 text-sm">Student</span>
                                    <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-300 text-sm">Problem Solver</span>
                                    <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-300 text-sm">Innovator</span>
                                </div>
                            </div>
                        </div>

                        <div className="group relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl p-8 md:p-10 rounded-3xl border border-slate-700/50 hover:border-purple-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-2 overflow-hidden">
                            {/* Card Background Effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            
                            <div className="relative z-10">
                                <svg className="w-16 h-16 mx-auto text-purple-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.82m5.84-2.56a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.82m2.56 5.84a14.98 14.98 0 00-2.58-5.96m0 0a14.98 14.98 0 00-5.96-2.58" /></svg>
                                <h3 className="text-3xl font-bold text-purple-400 mb-5 group-hover:text-purple-300 transition-colors">What I Do</h3>
                                <p className="text-slate-300 leading-relaxed text-base md:text-lg">
                                    I specialize in <span className="text-purple-400 font-semibold">machine learning models</span>, building powerful Python applications, and creating modern, responsive web experiences using React and cutting-edge technologies.
                                </p>
                                <div className="mt-6 flex flex-wrap gap-2">
                                    <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-300 text-sm">AI/ML</span>
                                    <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-300 text-sm">Python</span>
                                    <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-300 text-sm">React</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Section - GitHub & LeetCode */}
                    <div className="mt-16 mb-12 animate-fadeIn">
                        <div className="text-center mb-8">
                            <h3 className="text-2xl md:text-3xl font-bold text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text mb-2">
                                Coding Journey
                            </h3>
                            <p className="text-slate-400 text-sm md:text-base">
                                Consistent practice & problem-solving every day
                            </p>
                        </div>
                        <StatsCards />
                    </div>

                    <div className="text-center mt-12 animate-fadeIn">
                        <Link to="/about" className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/50">
                            <span>Learn More About Me</span>
                            <span className="text-xl group-hover:translate-x-2 transition-transform duration-300">→</span>
                        </Link>
                    </div>
                </ScrollReveal>
            </section>

            {/* Skills Section */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                {/* Background Elements */}
                <div className="absolute inset-0">
                    <div className="absolute top-1/2 -left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
                    <div className="absolute top-1/4 -right-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
                </div>

                <ScrollReveal className="max-w-7xl mx-auto relative z-10" delay={80}>
                    <div className="text-center mb-16 animate-fadeIn">
                        <span className="inline-block text-purple-400 text-sm font-bold tracking-widest uppercase mb-4 px-4 py-2 bg-purple-500/10 rounded-full border border-purple-500/20">What I know</span>
                        <h2 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mt-4 mb-6">
                            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                                My Skills
                            </span>
                        </h2>
                        <p className="text-slate-400 text-lg md:text-xl max-w-3xl mx-auto">
                            Technologies and tools I use to bring ideas to life
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                        {/* AI & Data Science Card */}
                        <div className="group relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl p-8 rounded-3xl border border-slate-700/50 hover:border-blue-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-3 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            
                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-8">
                                    <svg className="w-12 h-12 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z" /></svg>
                                    <h3 className="text-2xl md:text-3xl font-bold text-blue-400 group-hover:text-blue-300 transition-colors">AI & Data Science</h3>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {skills.ai.map((skill) => (
                                        <span key={skill} className="bg-blue-500/20 border border-blue-500/40 text-blue-300 px-4 py-2.5 rounded-xl hover:bg-blue-500/40 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 cursor-default font-medium text-sm">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Corner Accent */}
                            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl group-hover:bg-blue-500/30 transition-all duration-500"></div>
                        </div>

                        {/* Web Development Card */}
                        <div className="group relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl p-8 rounded-3xl border border-slate-700/50 hover:border-purple-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-3 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            
                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-8">
                                    <svg className="w-12 h-12 text-purple-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" /></svg>
                                    <h3 className="text-2xl md:text-3xl font-bold text-purple-400 group-hover:text-purple-300 transition-colors">Web Development</h3>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {skills.web.map((skill) => (
                                        <span key={skill} className="bg-purple-500/20 border border-purple-500/40 text-purple-300 px-4 py-2.5 rounded-xl hover:bg-purple-500/40 hover:scale-110 hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 cursor-default font-medium text-sm">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Corner Accent */}
                            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl group-hover:bg-purple-500/30 transition-all duration-500"></div>
                        </div>

                        {/* Languages Card */}
                        <div className="group relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl p-8 rounded-3xl border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/20 hover:-translate-y-3 overflow-hidden md:col-span-2 lg:col-span-1">
                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            
                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-8">
                                    <svg className="w-12 h-12 text-cyan-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" /></svg>
                                    <h3 className="text-2xl md:text-3xl font-bold text-cyan-400 group-hover:text-cyan-300 transition-colors">Languages</h3>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {skills.languages.map((skill) => (
                                        <span key={skill} className="bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 px-4 py-2.5 rounded-xl hover:bg-cyan-500/40 hover:scale-110 hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 cursor-default font-medium text-sm">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Corner Accent */}
                            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl group-hover:bg-cyan-500/30 transition-all duration-500"></div>
                        </div>
                    </div>

                    <div className="text-center mt-16 animate-fadeIn">
                        <Link to="/skills" className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/50">
                            <span>View All Skills & Expertise</span>
                            <span className="text-xl group-hover:translate-x-2 transition-transform duration-300">→</span>
                        </Link>
                    </div>
                </ScrollReveal>
            </section>

            {/* Projects Section */}
            <section className="py-20 px-6 bg-slate-800/30 backdrop-blur-sm relative">
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-purple-900/5 to-transparent"></div>
                <ScrollReveal className="max-w-7xl mx-auto relative z-10" delay={60}>
                    <div className="text-center mb-12">
                        <span className="text-cyan-400 text-sm font-semibold tracking-wider uppercase">My work</span>
                        <h2 className="text-4xl md:text-5xl font-bold mt-2 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                            Featured Projects
                        </h2>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {featuredProjects.map(project => (
                            <div key={project.id} className="group bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden hover:border-purple-500/50 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300">
                                {/* Project Image */}
                                <div className="card-img-wrap relative h-40 bg-slate-700 overflow-hidden">
                                    <LazyImage
                                        src={project.image}
                                        alt={project.title}
                                        className="w-full h-full object-cover card-img-zoom"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60"></div>
                                </div>

                                {/* Project Content */}
                                <div className="p-4">
                                    <h3 className="text-lg font-semibold mb-2 text-blue-300 group-hover:text-blue-400 transition-colors">{project.title}</h3>
                                    <p className="text-slate-400 text-xs mb-3 line-clamp-2">{project.description}</p>
                                    <div className="flex flex-wrap gap-1 mb-3">
                                        {project.techStack.map((tech) => (
                                            <span key={`${project.id}-${tech}`} className="inline-flex items-center gap-1 bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs">
                                                <TechIcon name={tech} className="w-3 h-3 shrink-0" />
                                                {tech}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Links */}
                                    <div className="flex gap-2">
                                        <a
                                            href={project.github}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 inline-flex items-center justify-center bg-slate-700 hover:bg-purple-600 text-slate-300 hover:text-white font-medium px-2 py-2 rounded-lg transition-all duration-300 border border-slate-600 hover:border-purple-500 hover:scale-105 text-xs"
                                        >
                                            <span className="flex items-center justify-center gap-1 leading-none">
                                                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
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
                                                className="flex-1 inline-flex items-center justify-center bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-medium px-2 py-2 rounded-lg transition-all duration-300 hover:scale-105 text-xs"
                                            >
                                                <span className="flex items-center justify-center gap-1 leading-none">
                                                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                    Demo
                                                </span>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* View More Projects Card */}
                        <Link to="/projects" className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 border-2 border-transparent rounded-2xl hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 flex flex-col items-center justify-center text-center group p-8">
                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="relative z-10">
                                <svg className="w-14 h-14 mx-auto mb-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.82m5.84-2.56a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.82m2.56 5.84a14.98 14.98 0 00-2.58-5.96m0 0a14.98 14.98 0 00-5.96-2.58" /></svg>
                                <h3 className="text-2xl font-bold text-white mb-2">View All Projects</h3>
                                <p className="text-blue-100 text-sm">See more of my work</p>
                            </div>
                        </Link>
                    </div>
                </ScrollReveal>
            </section>

            {/* Blog Section */}
            <section className="py-20 px-6 relative">
                <ScrollReveal className="max-w-7xl mx-auto" delay={60}>
                    <div className="text-center mb-12">
                        <span className="text-pink-400 text-sm font-semibold tracking-wider uppercase">Latest from blog</span>
                        <h2 className="text-4xl md:text-5xl font-bold mt-2 bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                            Recent Blog Posts
                        </h2>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {featuredBlogs.map((blog, index) => (
                            <div key={blog.id} className="group bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden hover:border-pink-500/50 hover:-translate-y-2 hover:shadow-2xl hover:shadow-pink-500/20 transition-all duration-300">
                                {/* Blog Image */}
                                <div className="card-img-wrap relative h-40 bg-slate-700 overflow-hidden">
                                    <LazyImage
                                        src={blog.image}
                                        alt={blog.title}
                                        className="w-full h-full object-cover card-img-zoom"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60"></div>
                                </div>

                                {/* Blog Content */}
                                <div className="p-4">
                                    <div className="flex items-center gap-2 mb-2 text-xs text-slate-400">
                                        <span>{blog.date}</span>
                                        <span>•</span>
                                        <span>{blog.readTime}</span>
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2 text-pink-300 group-hover:text-pink-400 transition-colors line-clamp-2">{blog.title}</h3>
                                    <p className="text-slate-400 text-xs mb-3 line-clamp-2">{blog.excerpt}</p>
                                    <span className="inline-block bg-slate-700 text-purple-300 px-3 py-1 rounded-lg text-xs mb-3">
                                        {blog.category}
                                    </span>

                                    {/* Read More Button */}
                                    <Link
                                        to={`/blog/${blog.slug}`}
                                        className="flex items-center justify-center bg-slate-700 hover:bg-gradient-to-r hover:from-pink-600 hover:to-purple-600 text-slate-300 hover:text-white font-medium px-2 py-2 rounded-lg transition-all duration-300 border border-slate-600 hover:border-pink-500 hover:scale-105 text-xs leading-none"
                                    >
                                        Read More →
                                    </Link>
                                </div>
                            </div>
                        ))}

                        {/* View More Blogs Card */}
                        <Link to="/blog" className="relative overflow-hidden bg-gradient-to-br from-pink-500 via-purple-500 to-cyan-500 border-2 border-transparent rounded-2xl hover:-translate-y-2 hover:shadow-2xl hover:shadow-pink-500/40 transition-all duration-300 flex flex-col items-center justify-center text-center group p-8">
                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="relative z-10">
                                <svg className="w-14 h-14 mx-auto mb-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                                <h3 className="text-2xl font-bold text-white mb-2">View All Blogs</h3>
                                <p className="text-pink-100 text-sm">Read more articles</p>
                            </div>
                        </Link>
                    </div>
                </ScrollReveal>
            </section>

            {/* Contact Section */}
            <section className="py-24 px-6 relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/10 to-transparent"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
                <ScrollReveal className="max-w-4xl mx-auto text-center relative z-10" delay={60}>
                    <div className="mb-8">
                        <span className="text-blue-400 text-sm font-semibold tracking-wider uppercase">Get in touch</span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                        Let's Work Together
                    </h2>
                    <p className="text-slate-300 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
                        Have a project in mind? Let's discuss how we can work together to bring your ideas to life.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <Link to="/contact" className="group relative bg-gradient-to-r from-blue-500 to-purple-500 px-10 py-5 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/50 overflow-hidden">
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                Get In Touch
                                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </Link>
                        <Link to="/links" className="group border-2 border-cyan-500 px-10 py-5 rounded-xl font-semibold text-lg hover:bg-cyan-500 hover:bg-opacity-20 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/30 backdrop-blur-sm flex items-center justify-center gap-2">
                            Social Links
                            <svg className="w-5 h-5 shrink-0 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>
                        </Link>
                    </div>
                </ScrollReveal>
            </section>
        </div>
    )
}

export default Home

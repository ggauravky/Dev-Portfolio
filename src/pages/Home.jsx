// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { Link } from 'react-router-dom'
import { useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import useSEO from '../hooks/useSEO'
import { use3DTilt } from '../hooks/use3DTilt'
import { blogsData } from '../data/blogsData'
import { projectsData } from '../data/projectsData'
import { journeyData } from '../data/journeyData'
import { pingBackend } from '../utils/backendPing'
import LazyImage from '../components/LazyImage'
import ScrollReveal from '../components/ScrollReveal'
import TechIcon from '../components/TechIcon'
import NeuralNetworkCanvas from '../components/NeuralNetworkCanvas'
import { useOpeningState } from '../context/OpeningContext'

function Home() {
    const profileTilt = use3DTilt({ maxTilt: 10, glint: true })
    const openingState = useOpeningState()
    // Hero reveals once the interface is fully ready
    const heroReady = openingState === 'ready'

    // Shared hero group animation — subtle 8px rise, no blur, no scale
    const heroGroupVariants = {
        hidden: { opacity: 0, y: 8 },
        visible: (delay) => ({
            opacity: 1,
            y: 0,
            transition: { duration: 0.52, ease: [0.22, 1, 0.36, 1], delay }
        }),
    }

    const handleCtaHover = (e, active) => {
        const rect = e.currentTarget.getBoundingClientRect()
        window.dispatchEvent(
            new CustomEvent('neural-cta-hover', {
                detail: {
                    x: rect.left + rect.width / 2,
                    y: rect.top + rect.height / 2,
                    active,
                },
            })
        )
    }

    // Wake up backend server on component mount
    useEffect(() => {
        // Ping backend silently to prevent cold start
        pingBackend()
    }, [])

    // SEO Optimization
    useSEO({
        title: 'Gaurav Kumar Yadav | AI/ML Developer & Web Developer | BBDU Lucknow | Portfolio',
        description: 'Gaurav Kumar Yadav is a BCA student at BBD University (BBDU), Lucknow, India, building AI/ML and web development projects. Explore portfolio case studies in machine learning, data science basics, React, MERN stack, and Python.',
        keywords: 'Gaurav Kumar Yadav, Gaurav Kumar Yadav BBDU, Gaurav Lucknow developer, Gaurav AI ML developer, Gaurav web developer India, ggauravky portfolio, BCA AI ML student India, AI ML developer Lucknow, frontend developer portfolio India, MERN stack developer student, machine learning beginner projects',
        ogImage: 'https://ggauravky.vercel.app/og-image.jpg'
    })

    // Keep homepage featured projects fixed and ordered
    const featuredProjects = useMemo(() => {
        const orderedSlugs = ['smartmess', 'real-time-chat-app', 'buildmyteam']
        return orderedSlugs
            .map((slug) => projectsData.find((project) => project.slug === slug))
            .filter(Boolean)
    }, [])

    const skills = useMemo(() => ({
        ai: ["Python", "Machine Learning", "Data Analysis", "Pandas", "NumPy"],
        web: ["React", "JavaScript", "Tailwind CSS", "Node.js", "Git"],
        languages: ["Python", "JavaScript", "C", "SQL"]
    }), [])

    // Dynamically get featured blogs from the shared data
    const featuredBlogs = useMemo(() => blogsData.filter(blog => blog.featured), [])

    // Get latest 3 experiences for Home page section
    const featuredJourney = useMemo(() => {
        return [...journeyData]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 3)
    }, [])

    return (
        <main className="home-page bg-obsidian overflow-x-hidden w-full">
            {/* Hero Section */}
            <section className="hero-section relative min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4 lg:pt-3 pb-12 lg:pb-8 overflow-hidden w-full">
                {/* Subtle Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-obsidian via-obsidian-card to-obsidian"></div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-toxic/5 via-transparent to-transparent"></div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-cyber/5 via-transparent to-transparent"></div>
                
                {/* Interactive Neural Canvas */}
                <NeuralNetworkCanvas />
                
                {/* Kinetic Marquee Background */}
                <div className="absolute inset-x-0 top-1/4 sm:top-1/3 pointer-events-none opacity-[0.03] select-none whitespace-nowrap overflow-hidden">
                    <motion.div
                        animate={{ x: [0, -1000] }}
                        transition={{ repeat: Infinity, ease: 'linear', duration: 30 }}
                        className="inline-block text-[16vw] font-display font-black uppercase leading-none tracking-tighter text-white"
                    >
                        Developer · AI/ML · Full-Stack · Python · Innovator ·&nbsp;
                    </motion.div>
                </div>

                {/* Soft ambient orbs */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute top-10 -left-10 w-96 h-96 bg-toxic rounded-full filter blur-3xl animate-float"></div>
                    <div className="absolute bottom-10 -right-10 w-96 h-96 bg-cyber rounded-full filter blur-3xl animate-float" style={{animationDelay: '3s'}}></div>
                </div>

                <div className="relative max-w-7xl w-full mx-auto z-10">
                    <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-center">
                        {/* Left Content */}
                        <div className="text-center lg:text-left space-y-6 order-2 lg:order-1">

                            {/* ─── Hero Group A: Badge + Name ─────────────────── */}
                            <motion.div
                                variants={heroGroupVariants}
                                initial="hidden"
                                animate={heroReady ? 'visible' : 'hidden'}
                                custom={0}
                            >
                                {/* Welcome Badge */}
                                <span className="inline-flex items-center gap-2 text-toxic text-xs sm:text-sm font-bold tracking-widest uppercase px-4 py-2 bg-toxic/5 rounded-full border border-toxic/15 backdrop-blur-sm mb-6 block w-fit mx-auto lg:mx-0">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-toxic opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-toxic"></span>
                                    </span>{' '}
                                    Welcome to my portfolio
                                </span>
                                
                                {/* Name */}
                                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-display font-extrabold uppercase leading-[0.95] tracking-tighter">
                                    <span className="block text-white">
                                        Gaurav Kumar
                                    </span>
                                    <span className="block text-transparent bg-gradient-to-r from-white via-zinc-400 to-toxic bg-clip-text">
                                        Yadav
                                    </span>
                                    <span className="block mt-4 text-xs sm:text-sm font-mono font-bold tracking-widest uppercase text-toxic">
                                        // AI/ML & Web Developer
                                    </span>
                                </h1>
                            </motion.div>

                            {/* ─── Hero Group B: Role tags + Status ──────────── */}
                            <motion.div
                                variants={heroGroupVariants}
                                initial="hidden"
                                animate={heroReady ? 'visible' : 'hidden'}
                                custom={0.08}
                                className="space-y-4"
                            >
                                {/* Role Tags - Compact inline pills */}
                                <div className="flex flex-wrap gap-2.5 justify-center lg:justify-start">
                                {/* Python Developer */}
                                <div className="group flex items-center gap-2 px-3 py-2 bg-obsidian-card border border-obsidian-border rounded-md text-zinc-300 font-mono text-xs hover:border-toxic hover:text-white transition-all duration-300 cursor-default">
                                    <svg className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M11.914 0C5.82 0 6.2 2.656 6.2 2.656l.007 2.752h5.814v.826H3.9S0 5.789 0 11.969c0 6.18 3.403 5.96 3.403 5.96h2.034v-2.867s-.11-3.402 3.35-3.402h5.766s3.24.052 3.24-3.13V3.188S18.27 0 11.914 0zm-3.26 1.838a1.051 1.051 0 1 1 0 2.101 1.05 1.05 0 0 1 0-2.101z" fill="#c5f82a"/>
                                        <path d="M12.086 24c6.094 0 5.714-2.656 5.714-2.656l-.007-2.752H12v-.826h8.1S24 18.211 24 12.031c0-6.18-3.403-5.96-3.403-5.96H18.56v2.867s.114 3.402-3.347 3.402H9.448s-3.24-.052-3.24 3.13v5.342S5.73 24 12.086 24zm3.26-1.838a1.051 1.051 0 1 1 0-2.101 1.051 1.051 0 0 1 0 2.1z" fill="#ff5d00"/>
                                    </svg>
                                    <span className="font-semibold">Python</span>
                                </div>

                                {/* AI & Data Science */}
                                <div className="group flex items-center gap-2 px-3 py-2 bg-obsidian-card border border-obsidian-border rounded-md text-zinc-300 font-mono text-xs hover:border-toxic hover:text-white transition-all duration-300 cursor-default">
                                    <svg className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="#c5f82a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                                        <path d="M18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 00-2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                                    </svg>
                                    <span className="font-semibold">AI & ML</span>
                                </div>

                                {/* Full Stack Developer */}
                                <div className="group flex items-center gap-2 px-3 py-2 bg-obsidian-card border border-obsidian-border rounded-md text-zinc-300 font-mono text-xs hover:border-toxic hover:text-white transition-all duration-300 cursor-default">
                                    <svg className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="#ff5d00" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <path d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" />
                                    </svg>
                                    <span className="font-semibold">Full Stack</span>
                                </div>
                                </div>

                                {/* Status Info - Compact */}
                                <div className="flex flex-col gap-2 pt-2">
                                <div className="inline-flex items-center justify-center lg:justify-start gap-2 text-zinc-400 font-mono text-xs">
                                    <svg className="w-3.5 h-3.5 text-toxic shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" /></svg>
                                    <span>BCA at <span className="text-white font-semibold">BBDU Lucknow, India</span></span>
                                </div>
                                
                                <div className="inline-flex items-center justify-center lg:justify-start gap-2 px-3 py-1.5 bg-toxic/5 border border-toxic/20 rounded-md w-fit mx-auto lg:mx-0 font-mono text-[11px]">
                                    <svg className="w-3.5 h-3.5 text-toxic shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.82m5.84-2.56a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.82m2.56 5.84a14.98 14.98 0 00-2.58-5.96m0 0a14.98 14.98 0 00-5.96-2.58" /></svg>
                                    <span className="text-toxic font-bold">Open for Internships & Freelance</span>
                                </div>
                                </div>
                            </motion.div>

                            {/* ─── Hero Group C: CTAs + Divider ───────────────── */}
                            <motion.div
                                variants={heroGroupVariants}
                                initial="hidden"
                                animate={heroReady ? 'visible' : 'hidden'}
                                custom={0.16}
                            >
                                {/* CTA Buttons */}
                                <div className="flex flex-wrap gap-3 pt-4 justify-center lg:justify-start">
                                <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }}>
                                    <Link 
                                        to="/services" 
                                        onMouseEnter={(e) => handleCtaHover(e, true)}
                                        onMouseLeave={(e) => handleCtaHover(e, false)}
                                        className="group relative px-6 py-3.5 bg-toxic text-obsidian rounded-full font-bold text-xs tracking-wider uppercase hover:bg-white transition-all duration-300 shadow-lg shadow-toxic/15 hover:shadow-white/20 text-center overflow-hidden inline-flex items-center justify-center"
                                    >
                                        <span className="relative z-10 flex items-center justify-center gap-2 leading-none">
                                            <span>Book Service</span>
                                            <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                                        </span>
                                    </Link>
                                </motion.div>
                                <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }}>
                                    <Link 
                                        to="/projects" 
                                        onMouseEnter={(e) => handleCtaHover(e, true)}
                                        onMouseLeave={(e) => handleCtaHover(e, false)}
                                        className="group relative px-6 py-3.5 border border-zinc-700 hover:border-toxic rounded-full font-bold text-xs tracking-wider uppercase bg-transparent text-zinc-300 hover:text-toxic transition-all duration-300 hover:shadow-lg hover:shadow-toxic/5 text-center backdrop-blur-sm inline-flex items-center justify-center"
                                    >
                                        <span className="relative z-10 flex items-center justify-center gap-2 leading-none">
                                            <span>View Projects</span>
                                            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>
                                        </span>
                                    </Link>
                                </motion.div>
                                <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }}>
                                    <Link 
                                        to="/contact" 
                                        onMouseEnter={(e) => handleCtaHover(e, true)}
                                        onMouseLeave={(e) => handleCtaHover(e, false)}
                                        className="group relative px-6 py-3.5 border border-zinc-700 hover:border-toxic rounded-full font-bold text-xs tracking-wider uppercase bg-transparent text-zinc-300 hover:text-toxic transition-all duration-300 hover:shadow-lg hover:shadow-toxic/5 text-center backdrop-blur-sm inline-flex items-center justify-center"
                                    >
                                        <span className="relative z-10 flex items-center justify-center gap-2 leading-none">
                                            <span>Contact Me</span>
                                            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                                        </span>
                                    </Link>
                                </motion.div>
                                </div>

                                {/* Divider line after buttons */}
                                <div className="pt-4 flex justify-center lg:justify-start">
                                    <div className="w-full max-w-xl h-px bg-gradient-to-r from-toxic/30 via-zinc-800 to-transparent"></div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Right - Profile Image (Physical 3D Object with Specular Glint) */}
                        <motion.div
                            className="flex justify-center items-center order-1 lg:order-2 perspective-1000"
                            variants={heroGroupVariants}
                            initial="hidden"
                            animate={heroReady ? 'visible' : 'hidden'}
                            custom={0.22}
                        >
                            <motion.div 

                                ref={profileTilt.ref}
                                onMouseMove={profileTilt.handleMouseMove}
                                onMouseEnter={profileTilt.handleMouseEnter}
                                onMouseLeave={profileTilt.handleMouseLeave}
                                style={{
                                    rotateX: profileTilt.rotateX,
                                    rotateY: profileTilt.rotateY,
                                    transformStyle: 'preserve-3d',
                                }}
                                className="relative group cursor-pointer"
                            >
                                {/* Clean glow behind image */}
                                <div className="absolute -inset-4 bg-gradient-to-r from-toxic via-cyber to-purple-600 rounded-full blur-2xl opacity-20 group-hover:opacity-45 transition-opacity duration-500"></div>
                                
                                {/* Profile Image Container - Explicit square with organic warp */}
                                <div className="relative">
                                    <div className="relative w-52 h-52 sm:w-60 sm:h-60 md:w-72 md:h-72 lg:w-80 lg:h-80 xl:w-[340px] xl:h-[340px] overflow-hidden border-2 border-toxic bg-obsidian-card shadow-2xl shadow-toxic/10 transition-all duration-700 animate-morph ring-1 ring-toxic/20 ring-offset-4 ring-offset-obsidian">
                                        <LazyImage
                                            src="/images/profile.jpg"
                                            alt="Gaurav Kumar Yadav portfolio - AI ML developer and web developer in Lucknow India"
                                            priority={true}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        />

                                        {/* Dynamic Specular Glint Sheen */}
                                        <motion.div
                                            className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-40 transition-opacity duration-300"
                                            style={{
                                                background: profileTilt.isHovered
                                                    ? `radial-gradient(circle at ${profileTilt.glintPercentX.get()}% ${profileTilt.glintPercentY.get()}%, rgba(255,255,255,0.4) 0%, rgba(197,248,42,0.15) 35%, transparent 70%)`
                                                    : 'none',
                                            }}
                                        />
                                    </div>
                                    
                                    {/* Available badge */}
                                    <div className="absolute bottom-2 right-2 bg-toxic text-obsidian px-3.5 py-1.5 rounded-full font-bold text-xs shadow-lg border border-obsidian">
                                        <div className="flex items-center gap-1.5 font-mono uppercase tracking-wider">
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-obsidian opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-obsidian"></span>
                                            </span>
                                            <span>Available!</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="hidden lg:flex absolute bottom-4 left-1/2 transform -translate-x-1/2 flex-col items-center gap-1.5 animate-bounce cursor-pointer">
                    <span className="text-zinc-500 text-[10px] font-mono tracking-widest uppercase">Scroll Down</span>
                    <div className="w-5 h-8 border-2 border-zinc-700 rounded-full flex justify-center p-1 bg-obsidian-card">
                        <div className="w-1 h-1.5 bg-toxic rounded-full animate-scroll"></div>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-obsidian via-obsidian-card to-obsidian relative overflow-hidden">
                {/* Background Elements */}
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-toxic/5 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyber/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
                </div>
                
                <ScrollReveal className="max-w-6xl mx-auto relative z-10">
                    <div className="text-center mb-16 animate-fadeIn">
                        <span className="inline-block text-toxic text-xs font-bold tracking-widest uppercase mb-4 px-4 py-2 bg-toxic/5 rounded-full border border-toxic/15">Get to know me</span>
                        <h2 className="text-4xl sm:text-5xl lg:text-7xl font-display font-extrabold uppercase mt-4 mb-6">
                            <span className="text-white">
                                About Me
                            </span>
                        </h2>
                        <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                            My journey as a student developer and what drives my passion for engineering
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 lg:gap-8 mb-12">
                        <div className="group relative bg-obsidian-card p-8 md:p-10 rounded-xl border border-obsidian-border hover:border-toxic/30 transition-all duration-350 hover:-translate-y-1.5 overflow-hidden">
                            {/* Card Background Effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-toxic/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-350"></div>
                            
                            <div className="relative z-10">
                                <svg className="w-10 h-10 text-toxic mb-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.4} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" /></svg>
                                <h3 className="text-xl sm:text-2xl font-display font-bold uppercase text-white mb-4">Who I Am</h3>
                                <p className="text-zinc-400 leading-relaxed text-sm sm:text-base">
                                    I am <span className="text-toxic font-semibold">Gaurav Kumar Yadav</span>, a BCA student at BBD University (BBDU), Lucknow. I am focused on becoming an AI/ML Developer and Web Developer by solving real-world problems with practical, user-first software.
                                </p>
                                <div className="mt-6 flex flex-wrap gap-2 font-mono text-[10px] sm:text-xs">
                                    <span className="px-3 py-1 bg-toxic/5 border border-toxic/15 rounded-md text-toxic">Student</span>
                                    <span className="px-3 py-1 bg-toxic/5 border border-toxic/15 rounded-md text-toxic">Problem Solver</span>
                                    <span className="px-3 py-1 bg-toxic/5 border border-toxic/15 rounded-md text-toxic">Innovator</span>
                                </div>
                            </div>
                        </div>

                        <div className="group relative bg-obsidian-card p-8 md:p-10 rounded-xl border border-obsidian-border hover:border-cyber/30 transition-all duration-350 hover:-translate-y-1.5 overflow-hidden">
                            {/* Card Background Effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-cyber/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-350"></div>
                            
                            <div className="relative z-10">
                                <svg className="w-10 h-10 text-cyber mb-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.4} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.82m5.84-2.56a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.82m2.56 5.84a14.98 14.98 0 00-2.58-5.96m0 0a14.98 14.98 0 00-5.96-2.58" /></svg>
                                <h3 className="text-xl sm:text-2xl font-display font-bold uppercase text-white mb-4">What I Do</h3>
                                <p className="text-zinc-400 leading-relaxed text-sm sm:text-base">
                                    I build <span className="text-cyber font-semibold">machine learning beginner projects</span>, data science foundations, and production-ready web interfaces with React, Node.js, and MERN stack workflows powered by Python.
                                </p>
                                <div className="mt-6 flex flex-wrap gap-2 font-mono text-[10px] sm:text-xs">
                                    <span className="px-3 py-1 bg-cyber/5 border border-cyber/15 rounded-md text-cyber">AI/ML</span>
                                    <span className="px-3 py-1 bg-cyber/5 border border-cyber/15 rounded-md text-cyber">Python</span>
                                    <span className="px-3 py-1 bg-cyber/5 border border-cyber/15 rounded-md text-cyber">React</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Section - GitHub & LeetCode */}
                    <div className="mt-20 mb-12 animate-fadeIn">
                        <div className="text-center mb-8">
                            <h3 className="text-xl sm:text-2xl font-display font-bold uppercase text-white mb-2">
                                Coding Consistency Showcase
                            </h3>
                            <p className="text-zinc-500 text-xs sm:text-sm font-mono uppercase tracking-widest">
                                // Live cards from your public profiles
                            </p>
                        </div>
                        <div className="grid gap-6 lg:grid-cols-2">
                            <a
                                href="https://github.com/ggauravky"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group rounded-xl border border-obsidian-border bg-obsidian-card/60 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-toxic/30 hover:shadow-lg hover:shadow-toxic/5"
                                aria-label="Open GitHub profile"
                            >
                                <div className="mb-3 flex items-center justify-between">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-toxic font-mono">// GitHub Streak</h3>
                                    <span className="text-xs text-zinc-500 group-hover:text-toxic font-mono">Open ↗</span>
                                </div>
                                <div className="overflow-hidden rounded-lg border border-obsidian-border bg-obsidian p-2">
                                    <LazyImage
                                        src="https://camo.githubusercontent.com/80d675df3c581caef2a3fc4af3ab8bd8aeeff7037e331312e09e106dea1b3130/68747470733a2f2f73747265616b2d73746174732e64656d6f6c61622e636f6d3f757365723d676761757261766b79267468656d653d64726163756c6126686964655f626f726465723d74727565266261636b67726f756e643d3064306432622672696e673d37633361656426666972653d613738626661266375727253747265616b4c6162656c3d613738626661"
                                        alt="GitHub streak stats for ggauravky"
                                        responsive={false}
                                        className="block h-auto w-full transition-transform duration-500 group-hover:scale-[1.015]"
                                    />
                                </div>
                            </a>

                            <a
                                href="https://leetcode.com/u/gauravky/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group rounded-xl border border-obsidian-border bg-obsidian-card/60 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-cyber/30 hover:shadow-lg hover:shadow-cyber/5"
                                aria-label="Open LeetCode profile"
                            >
                                <div className="mb-3 flex items-center justify-between">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-cyber font-mono">// LeetCode Stats</h3>
                                    <span className="text-xs text-zinc-500 group-hover:text-cyber font-mono">Open ↗</span>
                                </div>
                                <div className="overflow-hidden rounded-lg border border-obsidian-border bg-obsidian p-2">
                                    <LazyImage
                                        src="https://leetcard.jacoblin.cool/gauravky?theme=dark&ext=heatmap"
                                        alt="LeetCode stats for gauravky"
                                        responsive={false}
                                        className="block h-auto w-full transition-transform duration-500 group-hover:scale-[1.015]"
                                    />
                                </div>
                            </a>
                        </div>
                    </div>

                    <div className="text-center mt-12 animate-fadeIn">
                        <Link to="/about" className="group inline-flex items-center gap-3 px-8 py-4 border border-zinc-800 hover:border-toxic rounded-full font-bold text-xs tracking-wider uppercase text-zinc-300 hover:text-toxic transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-toxic/5">
                            <span>Learn More About Me</span>
                            <span className="text-sm group-hover:translate-x-1 transition-transform duration-300">→</span>
                        </Link>
                    </div>
                </ScrollReveal>
            </section>

            {/* Skills Section */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-obsidian">
                {/* Background Elements */}
                <div className="absolute inset-0">
                    <div className="absolute top-1/2 -left-20 w-96 h-96 bg-toxic/5 rounded-full blur-3xl"></div>
                    <div className="absolute top-1/4 -right-20 w-96 h-96 bg-cyber/5 rounded-full blur-3xl"></div>
                </div>

                <ScrollReveal className="max-w-7xl mx-auto relative z-10" delay={80}>
                    <div className="text-center mb-16 animate-fadeIn">
                        <span className="inline-block text-toxic text-xs font-bold tracking-widest uppercase mb-4 px-4 py-2 bg-toxic/5 rounded-full border border-toxic/15">What I know</span>
                        <h2 className="text-4xl sm:text-5xl lg:text-7xl font-display font-extrabold uppercase mt-4 mb-6">
                            <span className="text-white">
                                My Skills
                            </span>
                        </h2>
                        <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                            Technologies and tools I use to bring ideas to life and build production-ready solutions
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                        {/* AI & Data Science Card */}
                        <div className="group relative bg-obsidian-card p-8 rounded-lg border border-obsidian-border hover:border-toxic/30 transition-all duration-350 hover:-translate-y-1.5 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-toxic/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-350"></div>
                            
                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-8">
                                    <svg className="w-10 h-10 text-toxic shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.4} stroke="currentColor" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                                    </svg>
                                    <h3 className="text-xl sm:text-2xl font-display font-bold uppercase text-white">AI & ML</h3>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {skills.ai.map((skill) => (
                                        <span key={skill} className="bg-obsidian border border-obsidian-border text-zinc-300 px-3 py-1.5 rounded-md hover:border-toxic hover:text-white transition-all duration-300 cursor-default font-mono text-xs">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Web Development Card */}
                        <div className="group relative bg-obsidian-card p-8 rounded-lg border border-obsidian-border hover:border-cyber/30 transition-all duration-350 hover:-translate-y-1.5 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-cyber/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-350"></div>
                            
                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-8">
                                    <svg className="w-10 h-10 text-cyber shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.4} stroke="currentColor" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" />
                                    </svg>
                                    <h3 className="text-xl sm:text-2xl font-display font-bold uppercase text-white">Web Dev</h3>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {skills.web.map((skill) => (
                                        <span key={skill} className="bg-obsidian border border-obsidian-border text-zinc-300 px-3 py-1.5 rounded-md hover:border-cyber hover:text-white transition-all duration-300 cursor-default font-mono text-xs">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Languages Card */}
                        <div className="group relative bg-obsidian-card p-8 rounded-lg border border-obsidian-border hover:border-toxic/30 transition-all duration-350 hover:-translate-y-1.5 overflow-hidden md:col-span-2 lg:col-span-1">
                            <div className="absolute inset-0 bg-gradient-to-br from-toxic/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-350"></div>
                            
                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-8">
                                    <svg className="w-10 h-10 text-toxic shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.4} stroke="currentColor" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                                    </svg>
                                    <h3 className="text-xl sm:text-2xl font-display font-bold uppercase text-white">Languages</h3>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {skills.languages.map((skill) => (
                                        <span key={skill} className="bg-obsidian border border-obsidian-border text-zinc-300 px-3 py-1.5 rounded-md hover:border-toxic hover:text-white transition-all duration-300 cursor-default font-mono text-xs">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="text-center mt-16 animate-fadeIn">
                        <Link to="/skills" className="group inline-flex items-center gap-3 px-8 py-4 border border-zinc-800 hover:border-toxic rounded-full font-bold text-xs tracking-wider uppercase text-zinc-300 hover:text-toxic transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-toxic/5">
                            <span>View All Skills & Expertise</span>
                            <span className="text-sm group-hover:translate-x-1 transition-transform duration-300">→</span>
                        </Link>
                    </div>
                </ScrollReveal>
            </section>

            {/* Projects Section */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-b from-obsidian via-obsidian-card to-obsidian border-t border-b border-obsidian-border">
                <div className="absolute inset-0">
                    <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-toxic/5 rounded-full blur-3xl"></div>
                </div>

                <ScrollReveal className="max-w-7xl mx-auto relative z-10" delay={60}>
                    <div className="text-center mb-16">
                        <span className="inline-block text-cyber text-xs font-bold tracking-widest uppercase mb-4 px-4 py-2 bg-cyber/5 rounded-full border border-cyber/15">My work</span>
                        <h2 className="text-4xl sm:text-5xl lg:text-7xl font-display font-extrabold uppercase mt-4 mb-6">
                            <span className="text-white">
                                Featured Projects
                            </span>
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {featuredProjects.map(project => (
                            <motion.div 
                                key={project.id} 
                                whileHover={{ y: -4 }}
                                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                                className="group bg-obsidian-card border border-obsidian-border rounded-lg overflow-hidden hover:border-toxic/30 transition-colors duration-300 flex flex-col h-full cursor-pointer"
                            >
                                {/* Project Image */}
                                <div className="card-img-wrap relative h-44 bg-obsidian overflow-hidden">
                                    <LazyImage
                                        src={project.image}
                                        alt={`${project.title} by Gaurav Kumar Yadav - web developer portfolio India`}
                                        className="w-full h-full object-cover card-img-zoom"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-transparent opacity-80"></div>
                                </div>

                                {/* Project Content */}
                                <div className="p-5 flex flex-col flex-grow">
                                    <h3 className="text-lg font-display font-bold uppercase text-white mb-2 group-hover:text-toxic transition-colors">{project.title}</h3>
                                    <p className="text-zinc-400 text-xs mb-4 line-clamp-2 leading-relaxed flex-grow">{project.description}</p>
                                    <div className="flex flex-wrap gap-1.5 mb-5">
                                        {project.techStack.map((tech) => (
                                            <span key={`${project.id}-${tech}`} className="inline-flex items-center gap-1 bg-obsidian text-zinc-400 border border-obsidian-border px-2 py-1 rounded font-mono text-[10px]">
                                                <TechIcon name={tech} className="w-3 h-3 shrink-0" />
                                                {tech}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Links */}
                                    <div className="flex gap-2 mt-auto">
                                        <a
                                            href={project.github}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 inline-flex items-center justify-center gap-1.5 border border-zinc-800 hover:border-toxic text-zinc-300 hover:text-toxic font-bold px-3 py-2 rounded-full transition-all duration-300 hover:scale-[1.02] text-xs uppercase tracking-wider font-mono"
                                        >
                                            <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
                                            Code
                                        </a>
                                        <Link
                                            to={`/projects/${project.slug}`}
                                            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-toxic text-black font-bold px-3 py-2 rounded-full hover:bg-white transition-all duration-300 hover:scale-[1.02] text-xs uppercase tracking-wider font-mono text-center"
                                        >
                                            Details
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        {/* View More Projects Card */}
                        <Link to="/projects" className="relative overflow-hidden bg-obsidian-card border border-obsidian-border hover:border-cyber/30 rounded-lg transition-all duration-300 flex flex-col items-center justify-center text-center group p-8 min-h-[320px]">
                            <div className="absolute inset-0 bg-gradient-to-br from-cyber/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative z-10 space-y-4">
                                <div className="w-12 h-12 rounded-full border border-cyber/20 bg-cyber/5 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-6 h-6 text-cyber" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.82m5.84-2.56a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.82m2.56 5.84a14.98 14.98 0 00-2.58-5.96m0 0a14.98 14.98 0 00-5.96-2.58" /></svg>
                                </div>
                                <h3 className="text-xl font-display font-bold uppercase text-white group-hover:text-cyber transition-colors">View All Projects</h3>
                                <p className="text-zinc-500 font-mono text-xs uppercase tracking-wider">// See more of my work</p>
                            </div>
                        </Link>
                    </div>
                </ScrollReveal>
            </section>

            {/* Blog Section */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-obsidian">
                <div className="absolute inset-0">
                    <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-cyber/5 rounded-full blur-3xl"></div>
                </div>

                <ScrollReveal className="max-w-7xl mx-auto" delay={60}>
                    <div className="text-center mb-16">
                        <span className="inline-block text-toxic text-xs font-bold tracking-widest uppercase mb-4 px-4 py-2 bg-toxic/5 rounded-full border border-toxic/15">Latest from blog</span>
                        <h2 className="text-4xl sm:text-5xl lg:text-7xl font-display font-extrabold uppercase mt-4 mb-6">
                            <span className="text-white">
                                Recent Blog Posts
                            </span>
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {featuredBlogs.map((blog, index) => (
                            <div key={blog.id} className="group bg-obsidian-card border border-obsidian-border rounded-lg overflow-hidden hover:border-toxic/30 transition-all duration-300 flex flex-col h-full">
                                {/* Blog Image */}
                                <div className="card-img-wrap relative h-44 bg-obsidian overflow-hidden">
                                    <LazyImage
                                        src={blog.image}
                                        alt={`${blog.title} by Gaurav Kumar Yadav - AI ML developer projects and insights`}
                                        className="w-full h-full object-cover card-img-zoom"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-transparent opacity-80"></div>
                                </div>

                                {/* Blog Content */}
                                <div className="p-5 flex flex-col flex-grow">
                                    <div className="flex items-center gap-2 mb-2 text-xs font-mono text-zinc-500 uppercase">
                                        <span>{blog.date}</span>
                                        <span>•</span>
                                        <span>{blog.readTime}</span>
                                    </div>
                                    <h3 className="text-lg font-display font-bold uppercase text-white mb-2 group-hover:text-toxic transition-colors line-clamp-2">{blog.title}</h3>
                                    <p className="text-zinc-400 text-xs mb-4 line-clamp-2 leading-relaxed flex-grow">{blog.excerpt}</p>
                                    <span className="inline-block bg-toxic/5 text-toxic border border-toxic/15 px-3 py-1 rounded font-mono text-[10px] mb-5 w-fit">
                                        {blog.category}
                                    </span>

                                    {/* Read More Button */}
                                    <Link
                                        to={`/blog/${blog.slug}`}
                                        className="w-full inline-flex items-center justify-center border border-zinc-800 hover:border-toxic text-zinc-300 hover:text-toxic font-bold px-3 py-2.5 rounded-full transition-all duration-300 hover:scale-[1.02] text-xs uppercase tracking-wider font-mono mt-auto"
                                    >
                                        Read More →
                                    </Link>
                                </div>
                            </div>
                        ))}

                        {/* View More Blogs Card */}
                        <Link to="/blog" className="relative overflow-hidden bg-obsidian-card border border-obsidian-border hover:border-cyber/30 rounded-lg transition-all duration-300 flex flex-col items-center justify-center text-center group p-8 min-h-[320px]">
                            <div className="absolute inset-0 bg-gradient-to-br from-cyber/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative z-10 space-y-4">
                                <div className="w-12 h-12 rounded-full border border-cyber/20 bg-cyber/5 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-6 h-6 text-cyber" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                                </div>
                                <h3 className="text-xl font-display font-bold uppercase text-white group-hover:text-cyber transition-colors">View All Blogs</h3>
                                <p className="text-zinc-500 font-mono text-xs uppercase tracking-wider">// Read more articles</p>
                            </div>
                        </Link>
                    </div>
                </ScrollReveal>
            </section>

            {/* Professional Journey Section */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-obsidian border-t border-obsidian-border/50">
                <div className="absolute inset-0">
                    <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-toxic/5 rounded-full blur-[120px]"></div>
                </div>

                <ScrollReveal className="max-w-7xl mx-auto" delay={60}>
                    <div className="text-center mb-16">
                        <span className="inline-block text-toxic text-xs font-bold tracking-widest uppercase mb-4 px-4 py-2 bg-toxic/5 rounded-full border border-toxic/15">Continuous Learning & Growth</span>
                        <h2 className="text-4xl sm:text-5xl lg:text-7xl font-display font-extrabold uppercase mt-4 mb-6">
                            <span className="text-white">
                                Professional Journey
                            </span>
                        </h2>
                        <p className="max-w-2xl mx-auto text-zinc-400 text-sm md:text-base leading-relaxed">
                            Explore my experiences beyond projects and blogs, including internships, workshops, hackathons, conferences, certifications, industrial visits, and technical events.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 mb-12">
                        {featuredJourney.map((item) => (
                            <div key={item.id} className="group bg-obsidian-card border border-obsidian-border rounded-lg overflow-hidden hover:border-toxic/30 transition-all duration-300 flex flex-col h-full">
                                {item.coverImage && (
                                    <div className="relative h-44 bg-obsidian overflow-hidden">
                                        <LazyImage
                                            src={item.coverImage}
                                            alt={item.title}
                                            responsive={false}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-obsidian-card via-transparent to-transparent opacity-90"></div>
                                    </div>
                                )}
                                <div className="p-6 flex flex-col flex-grow">
                                    <div className="flex items-center justify-between gap-2 mb-3 text-xs font-mono text-zinc-500 uppercase">
                                        <span className="bg-toxic/5 text-toxic border border-toxic/15 px-2 py-0.5 rounded text-[10px] font-bold">{item.category}</span>
                                        <span>{item.dateLabel}</span>
                                    </div>
                                    <h3 className="text-base font-display font-bold uppercase text-white mb-2 group-hover:text-toxic transition-colors line-clamp-2">{item.title}</h3>
                                    <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-wider mb-3">// {item.organization}</p>
                                    <p className="text-zinc-400 text-xs mb-4 line-clamp-3 leading-relaxed flex-grow">{item.description}</p>
                                    
                                    {/* Skills list */}
                                    <div className="flex flex-wrap gap-1.5 mt-auto pt-4 border-t border-obsidian-border/50">
                                        {item.skills.slice(0, 3).map((skill) => (
                                            <span key={skill} className="bg-[#16161a] border border-[#1a1a22] text-zinc-400 text-[9px] font-mono px-2 py-0.5 rounded">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="text-center">
                        <Link
                            to="/journey"
                            className="inline-flex items-center justify-center rounded-full bg-toxic text-black hover:bg-white px-8 py-4 font-bold text-xs uppercase tracking-wider font-mono transition-all duration-300 hover:scale-105 shadow-lg shadow-toxic/10 hover:shadow-white/10"
                        >
                            Explore Complete Journey →
                        </Link>
                    </div>
                </ScrollReveal>
            </section>

            {/* Contact Section */}
            <section className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-obsidian border-t border-obsidian-border">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-toxic/5 via-transparent to-transparent"></div>
                
                <ScrollReveal className="max-w-4xl mx-auto text-center relative z-10" delay={60}>
                    <span className="inline-block text-toxic text-xs font-bold tracking-widest uppercase mb-4 px-4 py-2 bg-toxic/5 rounded-full border border-toxic/15">Get in touch</span>
                    <h2 className="text-4xl sm:text-5xl lg:text-7xl font-display font-extrabold uppercase mt-4 mb-6 leading-[0.95] tracking-tighter">
                        <span className="text-white">
                            Let's Build
                        </span>
                        <span className="block text-transparent bg-gradient-to-r from-white via-zinc-400 to-toxic bg-clip-text">
                            Something Great
                        </span>
                    </h2>
                    <p className="text-zinc-400 text-base sm:text-lg mb-12 max-w-2xl mx-auto leading-relaxed">
                        Based in Lucknow, Uttar Pradesh, India. Have a project in mind? Let's discuss how we can turn your idea into a practical, premium product.
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <Link 
                            to="/contact" 
                            className="group relative px-8 py-4.5 bg-toxic text-obsidian rounded-full font-bold text-xs tracking-wider uppercase hover:bg-white hover:scale-105 transition-all duration-300 shadow-lg shadow-toxic/15 hover:shadow-white/20 text-center overflow-hidden inline-flex items-center justify-center"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2 leading-none">
                                <span>Get In Touch</span>
                                <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                            </span>
                        </Link>
                        <Link 
                            to="/contact" 
                            className="group relative px-8 py-4.5 border border-zinc-700 hover:border-toxic rounded-full font-bold text-xs tracking-wider uppercase bg-transparent text-zinc-300 hover:text-toxic hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-toxic/5 text-center backdrop-blur-sm inline-flex items-center justify-center"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2 leading-none">
                                <span>All Platforms</span>
                                <svg className="w-3.5 h-3.5 shrink-0 group-hover:rotate-12 transition-transform duration-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>
                            </span>
                        </Link>
                    </div>
                </ScrollReveal>
            </section>
        </main>
    )
}

export default Home

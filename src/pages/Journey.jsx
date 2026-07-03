// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { useState, useMemo, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import useSEO from '../hooks/useSEO'
import ScrollReveal from '../components/ScrollReveal'
import LazyImage from '../components/LazyImage'
import { journeyData, journeyCategories } from '../data/journeyData'

// Inline SVG Icon components for design consistency and zero bundle size bloat
const CalendarIcon = () => (
    <svg className="w-3.5 h-3.5 mr-1 text-toxic" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
)

const MapPinIcon = () => (
    <svg className="w-3.5 h-3.5 mr-1 text-cyber" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
)

const ClockIcon = () => (
    <svg className="w-3.5 h-3.5 mr-1 text-[#ff5d00]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
)

const BriefcaseIcon = () => (
    <svg className="w-4 h-4 mr-2 text-toxic" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
)

const BookOpenIcon = () => (
    <svg className="w-4 h-4 mr-2 text-cyber" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
)

const AwardIcon = () => (
    <svg className="w-4 h-4 mr-2 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="8" r="7" />
        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
    </svg>
)

const SearchIcon = () => (
    <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
)

const LayoutGridIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
    </svg>
)

const ListIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" />
        <line x1="3" y1="12" x2="3.01" y2="12" />
        <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
)

const XIcon = () => (
    <svg className="w-5 h-5 text-zinc-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
)

const DownloadIcon = () => (
    <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
)

const ExternalLinkIcon = () => (
    <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        <polyline points="15 3 21 3 21 9" />
        <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
)

const InfoIcon = () => (
    <svg className="w-4 h-4 mr-1.5 text-toxic" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
)

const BoltIcon = () => (
    <svg className="w-3.5 h-3.5 mr-1.5 text-toxic" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
)

const GlobeIcon = () => (
    <svg className="w-3.5 h-3.5 mr-1 text-cyber" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
)

const CameraIcon = () => (
    <svg className="w-3.5 h-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
    </svg>
)

const ChevronDownIcon = () => (
    <svg className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <polyline points="6 9 12 15 18 9" />
    </svg>
)

const ChevronUpIcon = () => (
    <svg className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <polyline points="18 15 12 9 6 15" />
    </svg>
)

const FilterIcon = () => (
    <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
)

const AwardBadgeIcon = () => (
    <svg className="w-3.5 h-3.5 mr-1 text-toxic" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <circle cx="12" cy="11" r="3" />
    </svg>
)

const CertificateBadgeIcon = () => (
    <svg className="w-3.5 h-3.5 mr-1 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <circle cx="12" cy="11" r="3" />
    </svg>
)

// Helper to get category icons
const getCategoryIcon = (category) => {
    switch (category) {
        case 'Internships':
        case 'Open Source':
            return <BriefcaseIcon />
        case 'Workshops':
        case 'Bootcamps':
        case 'Training Programs':
        case 'Seminars':
        case 'Guest Lectures':
        case 'Academic Programs':
            return <BookOpenIcon />
        case 'Certifications':
        case 'Hackathons':
        case 'Competitions':
        case 'Startup Events':
            return <AwardIcon />
        case 'Industrial Visits':
            return <MapPinIcon />
        default:
            return (
                <svg className="w-4 h-4 mr-2 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 14 14" />
                </svg>
            )
    }
}

function Journey() {
    // 1. SEO Configuration
    useSEO({
        title: 'Professional Journey | Gaurav Kumar Yadav | AI/ML & Web Developer',
        description: 'Explore my internships, workshops, hackathons, conferences, certifications, industrial visits, and technical experiences throughout my journey as an AI/ML Developer and Web Developer.',
        keywords: 'Gaurav Kumar Yadav journey, AI ML learning timeline, web developer experiences Lucknow, certifications Gaurav Kumar, workshops hackathons Lucknow',
        ogImage: 'https://ggauravky.vercel.app/images/profile.jpg',
    })

    // 2. States for Filter, Search, ViewMode, SelectedCard, Lightbox, and Scroll Ref
    const [filters, setFilters] = useState({
        category: 'All',
        year: 'All',
        organization: 'All',
        location: 'All',
        mode: 'All',
        technology: 'All'
    })
    const [showFiltersPanel, setShowFiltersPanel] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [viewMode, setViewMode] = useState(() => {
        return localStorage.getItem('journey-view-mode') || 'timeline'
    })
    const [selectedJourneyId, setSelectedJourneyId] = useState(null)
    const [lightboxImageInfo, setLightboxImageInfo] = useState(null)
    const [hoveredJourneyId, setHoveredJourneyId] = useState(null)
    const [activeYear, setActiveYear] = useState('')

    // Category Filter Horizontal Scroll Hooks & Fade States
    const filterScrollRef = useRef(null)
    const [showLeftFade, setShowLeftFade] = useState(false)
    const [showRightFade, setShowRightFade] = useState(true)

    const handleScroll = () => {
        const el = filterScrollRef.current
        if (!el) return
        setShowLeftFade(el.scrollLeft > 5)
        setShowRightFade(el.scrollLeft < el.scrollWidth - el.clientWidth - 5)
    }

    useEffect(() => {
        const el = filterScrollRef.current
        if (!el) return

        const handleWheel = (e) => {
            if (e.deltaY !== 0) {
                e.preventDefault()
                el.scrollLeft += e.deltaY * 0.8
                handleScroll()
            }
        }

        el.addEventListener('wheel', handleWheel, { passive: false })
        handleScroll()

        const resizeObserver = new ResizeObserver(() => {
            handleScroll()
        })
        resizeObserver.observe(el)

        return () => {
            el.removeEventListener('wheel', handleWheel)
            resizeObserver.disconnect()
        }
    }, [filters.category])

    // Timeline Scroll Progress Line Hooks
    const timelineContainerRef = useRef(null)
    const { scrollYProgress } = useScroll({
        target: timelineContainerRef,
        offset: ["start end", "end end"]
    })
    const scaleY = useTransform(scrollYProgress, [0, 0.9], [0, 1])

    // Save view mode selection
    const handleToggleViewMode = (mode) => {
        setViewMode(mode)
        localStorage.setItem('journey-view-mode', mode)
    }

    const stats = useMemo(() => {
        const total = journeyData.length
        const internships = journeyData.filter((item) => item.category === 'Internships').length
        const workshops = journeyData.filter((item) => ['Workshops', 'Startup Events', 'Open Source'].includes(item.category)).length
        const hackathons = journeyData.filter((item) => item.category === 'Hackathons').length
        const certs = journeyData.filter((item) => ['Certifications', 'Academic Programs'].includes(item.category)).length
        const conferences = journeyData.filter((item) => item.category === 'Conferences').length
        
        return {
            total,
            internships,
            workshops,
            hackathons,
            certs,
            conferences,
        }
    }, [])

    // 4. Learning duration calculation
    const journeyDuration = useMemo(() => {
        const startYear = 2024
        const currentYear = new Date().getFullYear()
        const diff = currentYear - startYear + 1
        return diff <= 1 ? '1 Year' : `${diff} Years`
    }, [])

    // Extract unique options from journeyData for advanced filters
    const uniqueOptions = useMemo(() => {
        const years = new Set()
        const orgs = new Set()
        const locations = new Set()
        const modes = new Set()
        const technologies = new Set()

        journeyData.forEach(item => {
            if (item.date) {
                years.add(new Date(item.date).getFullYear().toString())
            }
            if (item.organization) {
                orgs.add(item.organization)
            }
            if (item.location) {
                const parts = item.location.split(',')
                const city = parts.length > 1 ? parts[parts.length - 2].trim() : item.location.trim()
                locations.add(city)
            }
            if (item.mode) {
                modes.add(item.mode)
            }
            if (item.technologies) {
                item.technologies.forEach(tech => technologies.add(tech))
            }
        })

        return {
            years: ['All', ...Array.from(years).sort((a, b) => b - a)],
            organizations: ['All', ...Array.from(orgs).sort()],
            locations: ['All', ...Array.from(locations).sort()],
            modes: ['All', ...Array.from(modes).sort()],
            technologies: ['All', ...Array.from(technologies).sort()]
        }
    }, [])

    // 5. Filtering and sorting data (Sorted by date ascending - oldest first)
    const filteredJourney = useMemo(() => {
        return [...journeyData]
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .filter((item) => {
                const matchesCategory = filters.category === 'All' || item.category === filters.category
                
                const itemYear = new Date(item.date).getFullYear().toString()
                const matchesYear = filters.year === 'All' || itemYear === filters.year

                const matchesOrg = filters.organization === 'All' || item.organization === filters.organization

                const cleanItemLocation = (() => {
                    const parts = item.location.split(',')
                    return parts.length > 1 ? parts[parts.length - 2].trim() : item.location.trim()
                })()
                const matchesLocation = filters.location === 'All' || cleanItemLocation === filters.location

                const matchesMode = filters.mode === 'All' || item.mode === filters.mode

                const matchesTech = filters.technology === 'All' || (item.technologies && item.technologies.includes(filters.technology))

                const searchLower = searchQuery.toLowerCase()
                const matchesSearch = 
                    searchQuery === '' ||
                    item.title.toLowerCase().includes(searchLower) ||
                    item.organization.toLowerCase().includes(searchLower) ||
                    item.location.toLowerCase().includes(searchLower) ||
                    item.description.toLowerCase().includes(searchLower) ||
                    item.category.toLowerCase().includes(searchLower) ||
                    (item.skills || []).some(skill => skill.toLowerCase().includes(searchLower)) ||
                    item.date.includes(searchLower)

                return matchesCategory && matchesYear && matchesOrg && matchesLocation && matchesMode && matchesTech && matchesSearch
            })
    }, [filters, searchQuery])

    // Grouping by Year for Timeline view (Ascending order)
    const groupedByYear = useMemo(() => {
        const groups = {}
        filteredJourney.forEach((item) => {
            const year = new Date(item.date).getFullYear()
            if (!groups[year]) {
                groups[year] = []
            }
            groups[year].push(item)
        })
        // Sort years ascending (oldest first)
        return Object.keys(groups)
            .sort((a, b) => a - b)
            .reduce((obj, key) => {
                obj[key] = groups[key]
                return obj
            }, {})
    }, [filteredJourney])

    // List of active visible years from filtered content
    const activeYearsList = useMemo(() => {
        return Object.keys(groupedByYear).sort((a, b) => a - b)
    }, [groupedByYear])

    // IntersectionObserver to set current visible year for navigation
    useEffect(() => {
        if (viewMode !== 'timeline') return

        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -65% 0px',
            threshold: 0
        }

        const handleIntersect = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const year = entry.target.getAttribute('data-year-section')
                    if (year) {
                        setActiveYear(year)
                    }
                }
            })
        }

        const observer = new IntersectionObserver(handleIntersect, observerOptions)
        const elements = document.querySelectorAll('[data-year-section]')
        elements.forEach(el => observer.observe(el))

        return () => {
            elements.forEach(el => observer.unobserve(el))
            observer.disconnect()
        }
    }, [filteredJourney, viewMode])

    // Get the selected journey detail
    const selectedJourney = useMemo(() => {
        return journeyData.find((item) => item.id === selectedJourneyId) || null
    }, [selectedJourneyId])

    // Lock body scroll when drawer/modal is open
    const scrollToYear = (year) => {
        const el = document.getElementById(`year-sec-${year}`)
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
    }

    return (
        <main className="relative min-h-screen overflow-hidden bg-[#070708] px-4 py-20 sm:px-6 lg:px-8 lg:py-24 w-full">
            {/* Sticky Year Navigation (Desktop) */}
            {activeYearsList.length > 1 && viewMode === 'timeline' && (
                <div className="desktop-year-nav fixed right-8 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-2 p-2 bg-[#0e0e11]/85 backdrop-blur-md border border-obsidian-border rounded-xl shadow-2xl">
                    <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest text-center mb-1 block">Years</span>
                    {activeYearsList.map((year) => (
                        <button
                            key={year}
                            onClick={() => scrollToYear(year)}
                            className={`px-3 py-2 rounded-lg font-mono text-xs font-bold uppercase transition-all duration-300 ${
                                activeYear === year
                                    ? 'bg-toxic text-black shadow-lg shadow-toxic/15 scale-105'
                                    : 'text-zinc-500 hover:text-white hover:bg-zinc-900/35'
                            }`}
                        >
                            {year}
                        </button>
                    ))}
                </div>
            )}

            {/* Sticky Year Navigation (Mobile/Tablet) */}
            {activeYearsList.length > 1 && viewMode === 'timeline' && (
                <div className="mobile-year-nav sticky top-[72px] sm:top-[80px] z-30 lg:hidden w-full flex justify-center py-2 bg-[#070708]/90 backdrop-blur-md border-b border-obsidian-border/50 mb-6">
                    <div className="flex gap-2 p-1 bg-obsidian-card border border-obsidian-border rounded-xl">
                        {activeYearsList.map((year) => (
                            <button
                                key={year}
                                onClick={() => scrollToYear(year)}
                                className={`px-4 py-1.5 rounded-lg font-mono text-xs font-bold transition-all duration-300 ${
                                    activeYear === year
                                        ? 'bg-toxic text-black font-extrabold shadow-md shadow-toxic/10'
                                        : 'text-zinc-500 hover:text-white'
                                }`}
                            >
                                {year}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Ambient Background Elements */}
            <div className="pointer-events-none absolute -right-20 top-24 h-96 w-96 rounded-full bg-toxic/5 blur-[120px]" />
            <div className="pointer-events-none absolute -left-20 bottom-12 h-96 w-96 rounded-full bg-cyber/5 blur-[120px]" />
            
            <div className="relative z-10 mx-auto max-w-6xl">
                {/* ── HEADER SECTION ── */}
                <ScrollReveal className="text-center mb-12">
                    <span className="inline-flex items-center gap-1.5 text-toxic text-xs font-mono font-bold tracking-widest uppercase px-4 py-2 bg-toxic/5 rounded-full border border-toxic/15 backdrop-blur-sm mb-4">
                        <BoltIcon /> Professional Growth
                    </span>
                    <h1 className="text-4xl sm:text-5xl lg:text-7xl font-display font-extrabold uppercase leading-[0.95] tracking-tighter text-white mb-6">
                        Professional <span className="text-transparent bg-gradient-to-r from-white via-zinc-400 to-toxic bg-clip-text">Journey</span>
                    </h1>
                    <p className="mx-auto max-w-3xl text-zinc-400 text-sm sm:text-base leading-relaxed mb-8">
                        A timeline of my learning, internships, workshops, hackathons, certifications, industrial visits, conferences, and technical experiences that shaped my journey as an AI/ML Developer and Web Developer.
                    </p>

                    {/* Header metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto p-4 bg-obsidian-card border border-obsidian-border rounded-xl">
                        <div className="text-center p-2 border-r border-obsidian-border/55 last:border-0">
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono">Started Journey</p>
                            <p className="text-base sm:text-lg font-bold text-white mt-1">2024</p>
                        </div>
                        <div className="text-center p-2 border-r border-obsidian-border/55 last:border-0">
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono">Current Year</p>
                            <p className="text-base sm:text-lg font-bold text-toxic mt-1">2026</p>
                        </div>
                        <div className="text-center p-2 border-r border-obsidian-border/55 last:border-0">
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono">Learning Span</p>
                            <p className="text-base sm:text-lg font-bold text-white mt-1">{journeyDuration}</p>
                        </div>
                        <div className="text-center p-2 last:border-0">
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono">Active Status</p>
                            <p className="text-xs font-bold text-cyber mt-1.5 uppercase tracking-wide">Learning & Building</p>
                        </div>
                    </div>
                </ScrollReveal>

                {/* ── OVERVIEW STATISTICS ── */}
                <ScrollReveal delay={100} className="mb-12">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                        <div className="bg-[#0e0e11] border border-[#1a1a22] p-5 rounded-xl hover:border-toxic/30 transition-all duration-300">
                            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">Total Experiences</span>
                            <span className="text-3xl font-display font-black text-white mt-1 block">{stats.total}</span>
                        </div>
                        <div className="bg-[#0e0e11] border border-[#1a1a22] p-5 rounded-xl hover:border-cyber/30 transition-all duration-300">
                            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">Internships</span>
                            <span className="text-3xl font-display font-black text-white mt-1 block">{stats.internships}</span>
                        </div>
                        <div className="bg-[#0e0e11] border border-[#1a1a22] p-5 rounded-xl hover:border-toxic/30 transition-all duration-300">
                            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">Workshops & Events</span>
                            <span className="text-3xl font-display font-black text-white mt-1 block">{stats.workshops + stats.hackathons}</span>
                        </div>
                        <div className="bg-[#0e0e11] border border-[#1a1a22] p-5 rounded-xl hover:border-amber-500/30 transition-all duration-300">
                            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">Certifications</span>
                            <span className="text-3xl font-display font-black text-white mt-1 block">{stats.certs}</span>
                        </div>
                        <div className="bg-[#0e0e11] border border-[#1a1a22] p-5 rounded-xl hover:border-purple-500/30 transition-all duration-300 col-span-2 sm:col-span-1">
                            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">Conferences</span>
                            <span className="text-3xl font-display font-black text-white mt-1 block">{stats.conferences}</span>
                        </div>
                    </div>
                </ScrollReveal>

                {/* ── SEARCH & FILTER CONTROLS ── */}
                <ScrollReveal delay={150} className="mb-10 space-y-4">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        {/* Search Input & Filters Toggle */}
                        <div className="flex gap-2 w-full md:max-w-lg items-center">
                            <div className="relative flex-grow group">
                                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <SearchIcon />
                                </span>
                                <input
                                    type="text"
                                    placeholder="Search by title, organization, skill, or year..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-10 py-2.5 bg-obsidian-card border border-obsidian-border rounded-xl text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-toxic focus:ring-2 focus:ring-toxic/10 hover:border-zinc-700/80 transition-all duration-300"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-white"
                                        aria-label="Clear search"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                            <button
                                onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                                className={`px-4 py-2.5 rounded-xl border flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider transition-all duration-300 ${
                                    showFiltersPanel || Object.entries(filters).some(([k, v]) => k !== 'category' && v !== 'All')
                                        ? 'bg-toxic/10 text-toxic border-toxic/40'
                                        : 'bg-obsidian-card border-obsidian-border text-zinc-400 hover:border-zinc-700 hover:text-white'
                                }`}
                                aria-label="Toggle Advanced Filters"
                            >
                                <FilterIcon />
                                <span className="hidden sm:inline">Filters</span>
                                {showFiltersPanel ? <ChevronUpIcon /> : <ChevronDownIcon />}
                            </button>
                        </div>

                        {/* View Mode Toggle */}
                        <div className="flex items-center gap-1.5 p-1 bg-obsidian-card border border-obsidian-border rounded-xl self-end md:self-auto">
                            <button
                                onClick={() => handleToggleViewMode('timeline')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                                    viewMode === 'timeline'
                                        ? 'bg-toxic text-black shadow-md shadow-toxic/20'
                                        : 'text-zinc-400 hover:text-white'
                                }`}
                                aria-label="Timeline View"
                            >
                                <ListIcon />
                                Timeline
                            </button>
                            <button
                                onClick={() => handleToggleViewMode('grid')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                                    viewMode === 'grid'
                                        ? 'bg-toxic text-black shadow-md shadow-toxic/20'
                                        : 'text-zinc-400 hover:text-white'
                                }`}
                                aria-label="Grid View"
                            >
                                <LayoutGridIcon />
                                Grid
                            </button>
                        </div>
                    </div>

                    {/* Collapsible Advanced Filters Panel */}
                    <AnimatePresence>
                        {showFiltersPanel && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25, ease: 'easeInOut' }}
                                className="overflow-hidden border border-obsidian-border bg-[#0e0e11]/50 backdrop-blur-md rounded-xl p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3"
                            >
                                {/* Year Select */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">Year</label>
                                    <select
                                        value={filters.year}
                                        onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
                                        className="w-full bg-[#070708] border border-obsidian-border text-zinc-300 rounded-lg p-2 font-mono text-xs focus:outline-none focus:border-toxic cursor-pointer"
                                    >
                                        {uniqueOptions.years.map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                </div>
                                {/* Location Select */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">Location</label>
                                    <select
                                        value={filters.location}
                                        onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                                        className="w-full bg-[#070708] border border-obsidian-border text-zinc-300 rounded-lg p-2 font-mono text-xs focus:outline-none focus:border-toxic cursor-pointer"
                                    >
                                        {uniqueOptions.locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                                    </select>
                                </div>
                                {/* Mode Select */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">Mode</label>
                                    <select
                                        value={filters.mode}
                                        onChange={(e) => setFilters(prev => ({ ...prev, mode: e.target.value }))}
                                        className="w-full bg-[#070708] border border-obsidian-border text-zinc-300 rounded-lg p-2 font-mono text-xs focus:outline-none focus:border-toxic cursor-pointer"
                                    >
                                        {uniqueOptions.modes.map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </div>
                                {/* Technology Select */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">Technology</label>
                                    <select
                                        value={filters.technology}
                                        onChange={(e) => setFilters(prev => ({ ...prev, technology: e.target.value }))}
                                        className="w-full bg-[#070708] border border-obsidian-border text-zinc-300 rounded-lg p-2 font-mono text-xs focus:outline-none focus:border-toxic cursor-pointer"
                                    >
                                        {uniqueOptions.technologies.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                {/* Organization Select */}
                                <div className="space-y-1 col-span-2 sm:col-span-1">
                                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">Organization</label>
                                    <select
                                        value={filters.organization}
                                        onChange={(e) => setFilters(prev => ({ ...prev, organization: e.target.value }))}
                                        className="w-full bg-[#070708] border border-obsidian-border text-zinc-300 rounded-lg p-2 font-mono text-xs focus:outline-none focus:border-toxic cursor-pointer"
                                    >
                                        {uniqueOptions.organizations.map(org => <option key={org} value={org}>{org}</option>)}
                                    </select>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Active Filter Tags */}
                    {(() => {
                        const activeFilters = Object.entries(filters).filter(([key, val]) => val !== 'All')
                        if (activeFilters.length === 0 && !searchQuery) return null
                        return (
                            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
                                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mr-1">Active:</span>
                                {activeFilters.map(([key, val]) => (
                                    <span
                                        key={key}
                                        className="inline-flex items-center gap-1.5 bg-toxic/5 border border-toxic/15 text-toxic font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-lg"
                                    >
                                        <span className="text-zinc-500">{key}:</span> {val}
                                        <button
                                            onClick={() => setFilters(prev => ({ ...prev, [key]: 'All' }))}
                                            className="hover:text-white transition-colors ml-0.5 text-zinc-500"
                                            aria-label={`Remove ${key} filter`}
                                        >
                                            ✕
                                        </button>
                                    </span>
                                ))}
                                {searchQuery && (
                                    <span className="inline-flex items-center gap-1.5 bg-cyber/5 border border-cyber/15 text-cyber font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-lg">
                                        <span className="text-zinc-500">Query:</span> "{searchQuery}"
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="hover:text-white transition-colors ml-0.5 text-zinc-500"
                                            aria-label="Clear search query"
                                        >
                                            ✕
                                        </button>
                                    </span>
                                )}
                                <button
                                    onClick={() => {
                                        setFilters({
                                            category: 'All',
                                            year: 'All',
                                            organization: 'All',
                                            location: 'All',
                                            mode: 'All',
                                            technology: 'All'
                                        })
                                        setSearchQuery('')
                                    }}
                                    className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 hover:text-white border border-[#1a1a22] bg-[#0e0e11] px-2.5 py-1 rounded-lg transition-colors"
                                >
                                    Clear All
                                </button>
                            </div>
                        )
                    })()}

                    {/* Scrollable Category Filter Chips Redesign */}
                    <div className="relative w-full">
                        {/* Inline styles to completely hide scrollbar on categories filter */}
                        <style>{`
                            .no-scrollbar::-webkit-scrollbar {
                                display: none !important;
                            }
                            .no-scrollbar {
                                -ms-overflow-style: none !important;
                                scrollbar-width: none !important;
                            }
                            
                            @media (max-width: 1023px) {
                                .desktop-year-nav {
                                    display: none !important;
                                }
                                .mobile-year-nav {
                                    display: flex !important;
                                }
                            }
                            @media (min-width: 1024px) {
                                .desktop-year-nav {
                                    display: flex !important;
                                }
                                .mobile-year-nav {
                                    display: none !important;
                                }
                            }

                            /* Premium Sequential Timeline Reveal */
                            .timeline-item-reveal {
                                opacity: 1 !important;
                                transform: none !important;
                            }
                            .timeline-item-reveal .timeline-dot-glow {
                                opacity: 0.3;
                                transform: scale(0.85);
                                transition: opacity 0.5s ease-out, transform 0.5s ease-out, border-color 0.5s ease-out, box-shadow 0.5s ease-out;
                                transition-delay: 0ms;
                            }
                            .scroll-visible .timeline-dot-glow {
                                opacity: 1;
                                transform: scale(1);
                                border-color: rgba(197, 248, 42, 0.4);
                                box-shadow: 0 0 15px rgba(197, 248, 42, 0.25);
                            }
                            .timeline-item-reveal .timeline-connector-line {
                                transform: scaleX(0);
                                transform-origin: left;
                                transition: transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                                transition-delay: 100ms;
                            }
                            .timeline-item-reveal.is-even-line .timeline-connector-line {
                                transform-origin: right;
                            }
                            .scroll-visible .timeline-connector-line {
                                transform: scaleX(1);
                            }
                            .timeline-item-reveal .timeline-card-container {
                                opacity: 0;
                                transform: translateY(18px);
                                transition: opacity 0.55s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.55s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                                transition-delay: 200ms;
                            }
                            .scroll-visible .timeline-card-container {
                                opacity: 1;
                                transform: translateY(0);
                            }
                            @media (prefers-reduced-motion: reduce) {
                                .timeline-item-reveal .timeline-dot-glow,
                                .timeline-item-reveal .timeline-connector-line,
                                .timeline-item-reveal .timeline-card-container {
                                    opacity: 1 !important;
                                    transform: none !important;
                                    transition: none !important;
                                    box-shadow: none !important;
                                }
                            }
                        `}</style>

                        {/* Left edge fade */}
                        <div className={`absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#070708] to-transparent z-10 pointer-events-none transition-opacity duration-300 ${
                            showLeftFade ? 'opacity-100' : 'opacity-0'
                        }`} />

                        {/* Right edge fade */}
                        <div className={`absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#070708] to-transparent z-10 pointer-events-none transition-opacity duration-300 ${
                            showRightFade ? 'opacity-100' : 'opacity-0'
                        }`} />

                        {/* Scrollable Chip Row */}
                        <div
                            ref={filterScrollRef}
                            onScroll={handleScroll}
                            className="w-full overflow-x-auto pb-1 no-scrollbar scroll-smooth"
                            style={{ scrollBehavior: 'smooth' }}
                        >
                            <div 
                                className="flex gap-2 min-w-max py-1"
                                style={{ display: 'flex', gap: '8px', width: 'max-content' }}
                            >
                                {journeyCategories.map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => setFilters(prev => ({ ...prev, category }))}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider border transition-all duration-200 whitespace-nowrap min-h-0 min-w-0 h-auto flex items-center justify-center ${
                                            filters.category === category
                                                ? 'bg-toxic text-black border-toxic shadow-lg shadow-toxic/15 scale-102 font-extrabold'
                                                : 'bg-[#0e0e11]/80 backdrop-blur-sm border-[#1a1a22] text-zinc-400 hover:border-zinc-700 hover:text-white'
                                        }`}
                                        style={{ flexShrink: 0, width: 'auto', minWidth: 'max-content' }}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </ScrollReveal>

                {/* ── EMPTY STATE ── */}
                {filteredJourney.length === 0 ? (
                    <ScrollReveal className="text-center py-20 bg-obsidian-card border border-obsidian-border rounded-2xl">
                        <div className="w-12 h-12 rounded-full bg-obsidian-light border border-obsidian-border flex items-center justify-center mx-auto mb-4 text-zinc-500">
                            ✕
                        </div>
                        <h3 className="text-base font-bold text-white">No experiences found</h3>
                        <p className="text-xs text-zinc-500 mt-1">Try resetting filters or adjusting search terms.</p>
                        <button
                            onClick={() => {
                                setFilters({
                                    category: 'All',
                                    year: 'All',
                                    organization: 'All',
                                    location: 'All',
                                    mode: 'All',
                                    technology: 'All'
                                })
                                setSearchQuery('')
                            }}
                            className="mt-4 px-4 py-2 bg-toxic/15 border border-toxic/30 text-toxic hover:bg-toxic hover:text-black rounded-lg text-xs font-bold font-mono uppercase tracking-wider transition-all"
                        >
                            Reset Filter
                        </button>
                    </ScrollReveal>
                ) : (
                    <>
                        {/* ── TIMELINE VIEW ── */}
                        {viewMode === 'timeline' && (
                            <div ref={timelineContainerRef} className="relative">
                                {/* Static background timeline line */}
                                <div className="absolute left-4 lg:left-1/2 top-0 bottom-0 w-[2px] bg-[#1a1a22]/60 -translate-x-[1px]" />
                                
                                {/* Scroll-linked animated glowing timeline line */}
                                <motion.div
                                    style={{ scaleY }}
                                    className="absolute left-4 lg:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-toxic via-cyber to-transparent -translate-x-[1px] origin-top"
                                />

                                <div className="space-y-16">
                                    {Object.entries(groupedByYear).map(([year, items]) => (
                                        <div key={year} id={`year-sec-${year}`} data-year-section={year} className="relative scroll-mt-28">
                                            {/* Year separator */}
                                            <div className="sticky top-20 z-20 flex lg:justify-center mb-8 pl-8 lg:pl-0">
                                                <div className="inline-flex flex-col items-center justify-center bg-[#070708] px-4 py-2 border border-obsidian-border rounded-xl">
                                                    <span className="text-lg font-display font-black text-toxic">{year}</span>
                                                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
                                                        {year === '2024' ? 'Journey Started' : 'Progress'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Cards for the Year */}
                                            <div className="space-y-12">
                                                {items.map((item, idx) => {
                                                    const isEven = idx % 2 === 0
                                                    return (
                                                        <ScrollReveal
                                                            key={item.id}
                                                            className={`relative flex flex-col lg:flex-row lg:items-center justify-between gap-3 lg:gap-0 timeline-item-reveal ${
                                                                isEven ? 'lg:flex-row-reverse is-even-line' : ''
                                                            }`}
                                                        >
                                                            {/* Experience Card */}
                                                            <div className="w-full lg:w-[calc(50%-3rem)] pl-12 lg:pl-0 lg:px-6 timeline-card-container">
                                                                <JourneyCard
                                                                    item={item}
                                                                    onOpenLightbox={setLightboxImageInfo}
                                                                    onHoverCard={setHoveredJourneyId}
                                                                />
                                                            </div>

                                                            {/* Central Timeline Dot */}
                                                            <div className={`absolute left-4 lg:left-1/2 -translate-x-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[#070708] border transition-all duration-300 timeline-dot-glow ${
                                                                hoveredJourneyId === item.id 
                                                                    ? 'border-toxic shadow-[0_0_15px_rgba(197,248,42,0.4)] scale-110' 
                                                                    : 'border-obsidian-border'
                                                            }`}>
                                                                <span className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                                                                    hoveredJourneyId === item.id ? 'bg-toxic scale-125' : 'bg-zinc-700 animate-pulse'
                                                                }`} />
                                                            </div>

                                                            {/* Horizontal Connector Line (desktop only) */}
                                                            <div className={`hidden lg:block absolute top-1/2 -translate-y-1/2 h-px border-t border-dashed border-[#1a1a22]/80 transition-colors duration-300 timeline-connector-line ${
                                                                isEven 
                                                                    ? 'left-[calc(50%+1.5rem)] right-[calc(50%-2.5rem)]' 
                                                                    : 'right-[calc(50%+1.5rem)] left-[calc(50%-2.5rem)]'
                                                            } ${hoveredJourneyId === item.id ? 'border-toxic/30' : ''}`} />

                                                            {/* Date Badge on Timeline */}
                                                            <div className={`w-full lg:w-[calc(50%-3rem)] pl-12 lg:pl-0 lg:px-6 flex ${
                                                                isEven ? 'lg:justify-start' : 'lg:justify-end'
                                                            }`}>
                                                                <div className={`inline-flex items-center gap-2 bg-[#0e0e11]/80 backdrop-blur-sm border px-3 py-1.5 rounded-xl transition-all duration-300 font-mono text-xs uppercase tracking-wider ${
                                                                    hoveredJourneyId === item.id
                                                                        ? 'border-toxic/40 text-toxic shadow-lg shadow-toxic/5 scale-102'
                                                                        : 'border-[#1a1a22] text-zinc-500'
                                                                }`}>
                                                                    <CalendarIcon />
                                                                    <span>{item.dateLabel}</span>
                                                                </div>
                                                            </div>
                                                        </ScrollReveal>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── GRID VIEW ── */}
                        {viewMode === 'grid' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredJourney.map((item, idx) => (
                                    <ScrollReveal key={item.id} delay={idx * 50}>
                                        <JourneyCard
                                            item={item}
                                            onOpenLightbox={setLightboxImageInfo}
                                            onHoverCard={setHoveredJourneyId}
                                        />
                                    </ScrollReveal>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* ── LIGHTBOX LIGHTWEIGHT MODAL ── */}
            <AnimatePresence>
                {lightboxImageInfo && (
                    <Lightbox
                        imageInfo={lightboxImageInfo}
                        onClose={() => setLightboxImageInfo(null)}
                    />
                )}
            </AnimatePresence>
        </main>
    )
}

// ────────────────────────────────────────────────────────
// SUB-COMPONENT: JOURNEY CARD
// ────────────────────────────────────────────────────────
function JourneyCard({ item, onOpenLightbox, onHoverCard }) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [hoveringThumbnail, setHoveringThumbnail] = useState(false)

    // A single line summary from description
    const shortSummary = useMemo(() => {
        if (!item.description) return ''
        const sentences = item.description.match(/[^.!?]+[.!?]+/g) || [item.description]
        const firstTwoSentences = sentences.slice(0, 2).join(' ').trim()
        return firstTwoSentences || item.description
    }, [item.description])

    // Determine if the coverImage is a brand/org logo instead of a fullscreen bleed screenshot
    const isLogo = useMemo(() => {
        if (!item.coverImage) return false
        const path = item.coverImage.toLowerCase()
        return path.includes('logo') || path.includes('nsdc') || path.includes('masai') || item.category === 'Education'
    }, [item.coverImage, item.category])

    return (
        <article 
            onMouseEnter={() => onHoverCard && onHoverCard(item.id)}
            onMouseLeave={() => onHoverCard && onHoverCard(null)}
            className="group bg-[#0e0e11] border border-[#1a1a22] rounded-xl overflow-hidden hover:border-toxic/30 transition-all duration-300 shadow-xl flex flex-col h-full font-sans"
        >
            {/* Top portion: Large Cover Image or Custom Tech Gradient Area */}
            <div className="relative w-full aspect-video sm:aspect-[16/10] bg-obsidian-dark overflow-hidden border-b border-[#1a1a22] group/cover">
                {item.coverImage ? (
                    <div className={`w-full h-full flex items-center justify-center ${isLogo ? 'p-6 bg-[#0c0c0f]/60' : 'p-0'}`}>
                        <LazyImage
                            src={item.coverImage}
                            alt={item.title}
                            responsive={false}
                            className={`transition-transform duration-500 group-hover/cover:scale-[1.03] ${
                                isLogo ? 'max-w-full max-h-full object-contain' : 'w-full h-full object-cover'
                            }`}
                        />
                    </div>
                ) : (
                    // Beautiful custom gradient placeholder for certifications/events without images
                    <div className="w-full h-full bg-gradient-to-br from-toxic/10 via-[#0e0e11] to-cyber/10 flex flex-col items-center justify-center p-6 text-center">
                        <svg className="w-8 h-8 text-toxic/60 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                            <path d="M12 14l9-5-9-5-9 5 9 5z" />
                            <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                        </svg>
                        <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">{item.organization}</span>
                        <span className="text-xs font-display font-extrabold text-white uppercase tracking-wider mt-1">{item.title}</span>
                    </div>
                )}

                {/* View Gallery overlay on desktop hover */}
                {item.coverImage && (
                    <div 
                        onClick={() => onOpenLightbox({ src: item.coverImage, gallery: item.images || [item.coverImage] })}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover/cover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[1px] cursor-zoom-in"
                    >
                        <span className="text-[10px] font-mono text-toxic uppercase tracking-widest font-black bg-black/80 px-3 py-1.5 rounded-lg border border-toxic/20 shadow-lg shadow-toxic/10">
                            {item.images && item.images.length > 1 ? 'View Gallery' : 'View Image'}
                        </span>
                    </div>
                )}

                {/* Gallery count badge in top-right */}
                {item.images && item.images.length > 1 && (
                    <div className="absolute top-3 right-3 z-10 bg-black/75 px-2.5 py-1 rounded-lg border border-zinc-800/80 text-[9px] font-mono text-zinc-300 uppercase tracking-wider flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 text-toxic" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>+{item.images.length - 1} Photos</span>
                    </div>
                )}
            </div>

            {/* Card Content Body */}
            <div className="p-6 flex-grow flex flex-col">
                {/* Badges row */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <div className="flex flex-wrap gap-1.5 items-center">
                        <span className="inline-flex items-center gap-1 bg-toxic/5 text-toxic border border-toxic/15 px-2.5 py-0.5 rounded-full font-mono text-[10px] uppercase tracking-wider font-bold">
                            {item.category}
                        </span>
                        
                        {item.certificateUrl && (
                            <a
                                href={item.certificateUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 bg-emerald-500/5 hover:bg-emerald-500/15 border border-emerald-500/25 hover:border-emerald-500/40 text-emerald-400 text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded-full transition-all duration-300 cursor-pointer"
                            >
                                <CertificateBadgeIcon />
                                Certificate Available
                            </a>
                        )}
                    </div>

                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                        {item.mode === 'Offline' ? <MapPinIcon /> : <GlobeIcon />} {item.mode}
                    </span>
                </div>

                {/* Title */}
                <h3 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-lg sm:text-xl font-display font-extrabold uppercase text-white hover:text-toxic transition-colors cursor-pointer leading-tight mb-2"
                >
                    {item.title}
                </h3>

                {/* Organization and course details */}
                <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-xs uppercase font-bold tracking-wider mb-4">
                    {getCategoryIcon(item.category)}
                    <span>{item.organization}</span>
                </div>

                {/* Date & Location metadata details */}
                <div className="space-y-1.5 text-[11px] text-zinc-500 font-mono mb-4 border-l border-obsidian-border pl-3.5 py-0.5">
                    <div className="flex items-center">
                        <CalendarIcon />
                        <span>{item.dateLabel}</span>
                    </div>
                    <div className="flex items-center">
                        <ClockIcon />
                        <span>Duration: {item.duration}</span>
                    </div>
                    <div className="flex items-center">
                        <MapPinIcon />
                        <span className="truncate">{item.location}</span>
                    </div>
                </div>

                {/* Short Summary (2-3 sentences max) with fading style */}
                <div className="relative mb-5">
                    <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed font-sans italic border-l-2 border-zinc-700/80 pl-3 line-clamp-3">
                        {shortSummary}
                    </p>
                </div>

                {/* Collapsible details layout */}
                <AnimatePresence initial={false}>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="overflow-hidden space-y-6 border-t border-[#1a1a22]/60 pt-5 mt-2"
                        >
                            {/* Metadata Table (for education/milestones if available) */}
                            {item.metadata && (
                                <div className="grid grid-cols-2 gap-3.5 p-4 bg-[#09090b]/80 border border-obsidian-border rounded-xl font-mono text-xs text-zinc-400">
                                    {Object.entries(item.metadata).map(([key, val]) => (
                                        <div key={key} className="col-span-2 sm:col-span-1">
                                            <span className="text-[9px] text-zinc-600 block uppercase font-bold mb-0.5">{key}</span>
                                            <span className="text-white font-bold">{val}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Full description */}
                            <div className="space-y-1.5">
                                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-black">// Overview</span>
                                <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed font-sans">
                                    {item.description}
                                </p>
                            </div>

                            {/* Learning objectives & outcomes */}
                            {item.objectives && (
                                <div className="space-y-1.5">
                                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-black">// Objectives</span>
                                    <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed font-sans">
                                        {item.objectives}
                                    </p>
                                </div>
                            )}
                            {item.outcomes && (
                                <div className="space-y-1.5">
                                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-black">// Outcomes</span>
                                    <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed font-sans">
                                        {item.outcomes}
                                    </p>
                                </div>
                            )}

                            {/* What I Learned areas list */}
                            {item.whatILearned && item.whatILearned.length > 0 && (
                                <div>
                                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block mb-2 font-black">
                                        {item.category === 'Education' ? '// Areas of Study' : '// Key Takeaways'}
                                    </span>
                                    <ul className="space-y-2">
                                        {item.whatILearned.map((bullet, idx) => (
                                            <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-300 leading-normal font-sans">
                                                <span className="text-toxic mt-1 font-bold">→</span>
                                                <span>{bullet}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Gallery grid layout */}
                            {item.images && item.images.length > 0 && (
                                <div className="space-y-2">
                                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-black">// Gallery Preview</span>
                                    <div className="grid grid-cols-4 gap-2">
                                        {item.images.map((imgSrc, index) => (
                                            <div
                                                key={index}
                                                onClick={() => onOpenLightbox({ src: imgSrc, gallery: item.images })}
                                                className="relative h-12 sm:h-14 bg-obsidian border border-obsidian-border rounded-lg overflow-hidden cursor-zoom-in hover:border-toxic/40 transition-colors"
                                            >
                                                <LazyImage
                                                    src={imgSrc}
                                                    alt="gallery preview"
                                                    responsive={false}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Skills gained */}
                            {item.skills && item.skills.length > 0 && (
                                <div>
                                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block mb-2 font-black">// Skills Gained</span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {item.skills.map((skill) => (
                                            <span 
                                                key={skill}
                                                className="bg-[#16161a] border border-[#1a1a22] text-zinc-400 hover:border-toxic/30 hover:text-white px-2.5 py-1 rounded text-[10px] font-mono tracking-wide transition-colors"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Technologies used */}
                            {item.technologies && item.technologies.length > 0 && (
                                <div>
                                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block mb-2 font-black">// Technologies Covered</span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {item.technologies.map((tech) => (
                                            <span 
                                                key={tech}
                                                className="bg-obsidian border border-obsidian-border text-zinc-300 px-2.5 py-1 rounded text-[10px] font-mono tracking-wide"
                                            >
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Certificate download / Blog read links */}
                            {(item.certificateUrl || item.relatedBlogSlug) && (
                                <div className="flex gap-2.5 pt-3 border-t border-[#1a1a22]/30">
                                    {item.certificateUrl && (
                                        <a
                                            href={item.certificateUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 inline-flex items-center justify-center rounded-lg bg-toxic hover:bg-white text-black font-bold font-mono text-[10px] uppercase tracking-wider py-2.5 transition-all shadow-md shadow-toxic/5"
                                        >
                                            <DownloadIcon />
                                            Certificate
                                        </a>
                                    )}
                                    {item.relatedBlogSlug && (
                                        <Link
                                            to={`/blog/${item.relatedBlogSlug}`}
                                            className="flex-1 inline-flex items-center justify-center rounded-lg border border-obsidian-border bg-obsidian-card text-zinc-300 hover:text-toxic hover:border-toxic/30 font-bold font-mono text-[10px] uppercase tracking-wider py-2.5 transition-all"
                                        >
                                            <ExternalLinkIcon />
                                            Blog
                                        </Link>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Bottom expand action button */}
                <div className="mt-auto pt-5 border-t border-[#1a1a22]/60 flex items-center justify-between">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-xs font-mono font-bold uppercase tracking-wider text-toxic hover:text-white transition-colors flex items-center gap-1.5 group/btn"
                    >
                        <InfoIcon />
                        <span>{isExpanded ? 'Hide Details' : 'View Details'}</span>
                        <span className="transform group-hover/btn:translate-y-0.5 transition-transform duration-200">
                            {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                        </span>
                    </button>
                    {item.images && item.images.length > 0 && (
                        <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest flex items-center gap-1">
                            <CameraIcon /> {item.images.length} Photos
                        </span>
                    )}
                </div>
            </div>
        </article>
    )
}

// ────────────────────────────────────────────────────────
// SUB-COMPONENT: LIGHTBOX MODAL
// ────────────────────────────────────────────────────────
function Lightbox({ imageInfo, onClose }) {
    const { src, gallery = [] } = imageInfo
    const [currentIndex, setCurrentIndex] = useState(() => {
        const idx = gallery.indexOf(src)
        return idx !== -1 ? idx : 0
    })

    const handlePrev = (e) => {
        e?.stopPropagation()
        setCurrentIndex((prev) => (prev === 0 ? gallery.length - 1 : prev - 1))
    }

    const handleNext = (e) => {
        e?.stopPropagation()
        setCurrentIndex((prev) => (prev === gallery.length - 1 ? 0 : prev + 1))
    }

    // Keyboard controls
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose()
            if (e.key === 'ArrowLeft' && gallery.length > 1) handlePrev()
            if (e.key === 'ArrowRight' && gallery.length > 1) handleNext()
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [gallery, currentIndex])

    // Swipe controls for mobile touch support
    const touchStartX = useRef(0)
    const touchEndX = useRef(0)

    const handleTouchStart = (e) => {
        touchStartX.current = e.changedTouches[0].clientX
    }

    const handleTouchEnd = (e) => {
        touchEndX.current = e.changedTouches[0].clientX
        handleSwipe()
    }

    const handleSwipe = () => {
        const threshold = 60
        const diffX = touchStartX.current - touchEndX.current
        if (Math.abs(diffX) > threshold) {
            if (diffX > 0) {
                if (gallery.length > 1) handleNext()
            } else {
                if (gallery.length > 1) handlePrev()
            }
        }
    }

    const currentImageSrc = gallery[currentIndex] || src

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/95 cursor-zoom-out"
            />

            {/* Main content */}
            <div className="relative z-10 flex items-center justify-center max-w-[90vw] max-h-[85vh]">
                {/* Left Arrow */}
                {gallery.length > 1 && (
                    <button
                        onClick={handlePrev}
                        className="absolute -left-12 sm:left-4 z-20 group p-3 rounded-full bg-black/70 border border-zinc-800 hover:border-toxic text-white hover:text-toxic transition-all min-h-0 min-w-0 h-10 w-10 flex items-center justify-center font-bold"
                        aria-label="Previous image"
                    >
                        ←
                    </button>
                )}

                {/* Image display with touch listeners */}
                <motion.div
                    key={currentImageSrc}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 210 }}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    className="relative rounded-xl border border-obsidian-border bg-obsidian-card p-1 shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing select-none"
                >
                    <img
                        src={currentImageSrc}
                        alt="Enlarged gallery view"
                        className="max-w-full max-h-[75vh] object-contain rounded-lg pointer-events-none"
                    />

                    {/* Counter label */}
                    {gallery.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/75 px-3 py-1 rounded-full text-[10px] font-mono text-zinc-400">
                            {currentIndex + 1} / {gallery.length}
                        </div>
                    )}
                </motion.div>

                {/* Right Arrow */}
                {gallery.length > 1 && (
                    <button
                        onClick={handleNext}
                        className="absolute -right-12 sm:right-4 z-20 group p-3 rounded-full bg-black/70 border border-zinc-800 hover:border-toxic text-white hover:text-toxic transition-all min-h-0 min-w-0 h-10 w-10 flex items-center justify-center font-bold"
                        aria-label="Next image"
                    >
                        →
                    </button>
                )}
            </div>

            {/* Close Button overlay */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 group p-2.5 rounded-full bg-black/70 border border-zinc-800 hover:bg-toxic hover:text-black transition-colors min-h-0 min-w-0 h-10 w-10 flex items-center justify-center"
                aria-label="Close Lightbox"
            >
                ✕
            </button>
        </div>
    )
}

export default Journey

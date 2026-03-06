// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect, useCallback, useMemo } from 'react'

function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const location = useLocation()

    const navLinks = useMemo(() => [
        { path: '/', name: 'Home',     icon: '🏠' },
        { path: '/about', name: 'About',   icon: '👤' },
        { path: '/lab', name: 'Lab',     icon: '🧪' },
        { path: '/skills', name: 'Skills',  icon: '⚡' },
        { path: '/projects', name: 'Projects', icon: '💼' },
        { path: '/blog', name: 'Blog',    icon: '📝' },
        { path: '/contact', name: 'Contact',  icon: '📬' },
        { path: '/links', name: 'Find Me', icon: '🔗' },
    ], [])

    const isActive = useCallback((path) => location.pathname === path, [location.pathname])
    const closeMenu = useCallback(() => setIsMenuOpen(false), [])

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 12)
        handleScroll()
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        document.body.style.overflow = isMenuOpen ? 'hidden' : ''
        return () => { document.body.style.overflow = '' }
    }, [isMenuOpen])

    useEffect(() => {
        closeMenu()
    }, [location, closeMenu])

    return (
        <>
            {/* ── Top navbar bar ────────────────────────────────────────── */}
            <nav className={`border-b backdrop-blur-xl transition-all duration-300 ${
                scrolled
                    ? 'bg-slate-900/98 border-slate-700/60 shadow-xl shadow-black/40'
                    : 'bg-slate-900/90 border-slate-700/40 shadow-lg shadow-slate-900/20'
            }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center justify-between">

                        {/* Logo */}
                        <Link
                            to="/"
                            onClick={closeMenu}
                            className="group text-base sm:text-lg md:text-xl font-bold flex items-center gap-1 sm:gap-2 relative"
                        >
                            <span className="text-xl sm:text-2xl md:text-3xl group-hover:scale-125 transition-transform duration-300">✨</span>
                            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent group-hover:from-cyan-400 group-hover:via-blue-400 group-hover:to-purple-400 transition-all duration-500">
                                <span className="hidden sm:inline">Gaurav Kumar Yadav</span>
                                <span className="sm:hidden">Gaurav</span>
                            </span>
                            <div className="absolute -inset-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                        </Link>

                        {/* Desktop links */}
                        <div className="hidden lg:flex items-center gap-1 xl:gap-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`relative px-3 xl:px-4 py-2.5 rounded-xl font-medium transition-all duration-300 text-sm xl:text-base group ${isActive(link.path)
                                        ? 'text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-purple-500/50 scale-105'
                                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                                        }`}
                                >
                                    {link.name}
                                    {!isActive(link.path) && (
                                        <>
                                            <span className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full"></span>
                                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                                        </>
                                    )}
                                </Link>
                            ))}
                        </div>

                        {/* Desktop Resume button */}
                        <a
                            href="/resume.pdf"
                            download
                            className="hidden lg:flex items-center gap-2 ml-2 xl:ml-3 px-4 xl:px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-cyan-500/40 hover:shadow-cyan-500/60 hover:scale-105 text-sm xl:text-base cursor-pointer whitespace-nowrap group relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                            <svg className="w-4 h-4 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            <span className="relative z-10">Resume</span>
                        </a>

                        {/* Hamburger — mobile only */}
                        <button
                            onClick={() => setIsMenuOpen(prev => !prev)}
                            className="lg:hidden flex flex-col items-center justify-center w-10 h-10 rounded-xl hover:bg-slate-800/70 active:scale-95 transition-all duration-200 shrink-0"
                            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                            aria-expanded={isMenuOpen}
                        >
                            <span className={`block h-0.5 w-5 bg-slate-300 rounded-full transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-[6px]' : '-translate-y-[5px]'}`}></span>
                            <span className={`block h-0.5 w-5 bg-slate-300 rounded-full transition-all duration-300 ${isMenuOpen ? 'opacity-0 scale-x-0' : 'opacity-100'}`}></span>
                            <span className={`block h-0.5 w-5 bg-slate-300 rounded-full transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-[6px]' : 'translate-y-[5px]'}`}></span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* ── Mobile drawer — slides in from RIGHT ────────────────── */}

            {/* Backdrop */}
            <button
                type="button"
                aria-label="Close menu"
                tabIndex={isMenuOpen ? 0 : -1}
                className={`fixed inset-0 z-[190] lg:hidden w-full bg-black/60 backdrop-blur-sm transition-opacity duration-300 cursor-default ${
                    isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
                }`}
                onClick={closeMenu}
                onKeyDown={(e) => e.key === 'Escape' && closeMenu()}
            />

            {/* Drawer panel — full viewport height, slides from right */}
            <div
                style={{ height: '100dvh' }}
                className={`fixed inset-y-0 right-0 z-[200] lg:hidden
                    flex flex-col w-[85vw] max-w-sm
                    bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950
                    border-l border-slate-700/50 shadow-2xl shadow-black/70
                    transition-transform duration-300 ease-out
                    ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {/* ── Header ── */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/50 shrink-0">
                    <Link to="/" onClick={closeMenu} className="flex items-center gap-2.5 min-w-0">
                        <span className="text-2xl shrink-0">✨</span>
                        <span className="font-bold text-base bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent truncate">
                            Gaurav
                        </span>
                    </Link>
                    <button
                        onClick={closeMenu}
                        className="shrink-0 flex items-center justify-center w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/60 text-slate-400 hover:text-white transition-all duration-200 active:scale-90"
                        aria-label="Close menu"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* ── Nav links (scrollable, fills all available space) ── */}
                <nav className="flex-1 overflow-y-auto px-3 py-3" style={{ minHeight: 0 }}>
                    <p className="text-slate-500 text-[11px] font-semibold uppercase tracking-widest px-3 pb-2">
                        Navigation
                    </p>
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            onClick={closeMenu}
                            className={`group flex items-center gap-3.5 px-3.5 py-3.5 rounded-2xl font-semibold transition-all duration-200 mb-1 ${
                                isActive(link.path)
                                    ? 'text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-purple-500/30'
                                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80 active:scale-[0.98]'
                            }`}
                        >
                            <span className="text-xl shrink-0">{link.icon}</span>
                            <span className="flex-1 text-[15px]">{link.name}</span>
                            {isActive(link.path) ? (
                                <span className="w-2 h-2 rounded-full bg-white/70 shrink-0" />
                            ) : (
                                <svg className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            )}
                        </Link>
                    ))}
                </nav>

                {/* ── Resume + footer (pinned to bottom) ── */}
                <div className="shrink-0 px-4 pt-4 pb-8 border-t border-slate-700/50 space-y-3">
                    <a
                        href="/resume.pdf"
                        download
                        onClick={closeMenu}
                        className="flex items-center justify-center gap-2.5 w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-base rounded-2xl transition-all duration-300 shadow-lg shadow-cyan-500/30 active:scale-95"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download Resume
                    </a>
                    <p className="text-slate-600 text-xs text-center flex items-center justify-center gap-1.5">
                        Made with <span className="text-red-400 animate-pulse">❤️</span> by Gaurav
                    </p>
                </div>
            </div>
        </>
    )
}

export default Navbar

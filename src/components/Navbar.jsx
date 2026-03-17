// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'

function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const location = useLocation()

    const navLinks = useMemo(() => [
        { path: '/', name: 'Home', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg> },
        { path: '/about', name: 'About', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg> },
        { path: '/lab', name: 'Lab', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .03 2.798-1.414 2.798H4.213c-1.444 0-2.414-1.798-1.414-2.798L5 14.5" /></svg> },
        { path: '/skills', name: 'Skills', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg> },
        { path: '/projects', name: 'Projects', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 14.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" /></svg> },
        { path: '/blog', name: 'Blog', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg> },
        { path: '/contact', name: 'Contact', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg> },
        { path: '/links', name: 'Find Me', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg> },
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
                            <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 group-hover:scale-125 transition-transform duration-300 text-yellow-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" /></svg>
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
                                    className={`relative px-3 xl:px-4 py-2.5 rounded-xl font-medium transition-colors duration-200 text-sm xl:text-base group ${isActive(link.path)
                                        ? 'text-white'
                                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                                        }`}
                                >
                                    {isActive(link.path) && (
                                        <motion.span
                                            layoutId="nav-active-pill"
                                            className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-purple-500/50"
                                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                        />
                                    )}
                                    <span className="relative z-10">{link.name}</span>
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
                            href="https://drive.google.com/file/d/12p8A0rchFoZ1q2JlQJEaAWiGiXhSq3ev/view?usp=sharing"
                            target="_blank"
                            rel="noopener noreferrer"
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
                        <svg className="w-6 h-6 shrink-0 text-yellow-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" /></svg>
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
                        href="https://drive.google.com/file/d/12p8A0rchFoZ1q2JlQJEaAWiGiXhSq3ev/view?usp=sharing"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={closeMenu}
                        className="flex items-center justify-center gap-2.5 w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-base rounded-2xl transition-all duration-300 shadow-lg shadow-cyan-500/30 active:scale-95"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download Resume
                    </a>
                    <p className="text-slate-600 text-xs text-center flex items-center justify-center gap-1.5">
                        Made with <svg className="w-4 h-4 text-red-400 animate-pulse inline" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" /></svg> by Gaurav
                    </p>
                </div>
            </div>
        </>
    )
}

export default Navbar

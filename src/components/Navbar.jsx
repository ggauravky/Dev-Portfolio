// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import useAuth from '../hooks/useAuth'

const getProfileInitial = (user) => String(user?.name || user?.email || 'U').slice(0, 1)

const renderDesktopProfileMenu = ({
    user,
    isProfileMenuOpen,
    profileMenuRef,
    setIsProfileMenuOpen,
    handleLogout,
}) => (
    <div ref={profileMenuRef} className="relative hidden lg:block ml-2">
        <button
            type="button"
            onClick={() => setIsProfileMenuOpen((previous) => !previous)}
            className="group inline-flex items-center justify-center h-9 gap-2 rounded-full border border-obsidian-border bg-obsidian-card px-3 text-zinc-300 hover:border-toxic/50 hover:text-white transition-colors leading-none"
            aria-label="Open profile menu"
        >
            {user.picture ? (
                <img
                    src={user.picture}
                    alt={user.name || 'User'}
                    className="h-6 w-6 rounded-full border border-obsidian-border object-cover shrink-0"
                    referrerPolicy="no-referrer"
                />
            ) : (
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-obsidian-border bg-obsidian-light text-xs font-bold uppercase text-toxic shrink-0">
                    {getProfileInitial(user)}
                </span>
            )}
            <svg className={`h-3.5 w-3.5 shrink-0 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
        </button>

        {isProfileMenuOpen ? (
            <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-obsidian-border bg-obsidian-card p-2 shadow-2xl shadow-black/85">
                <div className="px-3 pb-2 pt-1 border-b border-obsidian-border/60 mb-2">
                    <p className="text-sm font-semibold text-white truncate">{user.name || 'Google User'}</p>
                    <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                </div>
                <Link
                    to="/my-activity"
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-zinc-300 hover:bg-obsidian-light hover:text-toxic transition-colors"
                    onClick={() => setIsProfileMenuOpen(false)}
                >
                    <span>❤️</span>
                    <span>My Activity</span>
                </Link>
                <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                    <span>↩</span>
                    <span>Logout</span>
                </button>
            </div>
        ) : null}
    </div>
)

const renderMobileProfileCard = ({ user, closeMenu, handleLogout }) => (
    <div className="rounded-2xl border border-obsidian-border bg-obsidian-card p-3">
        <div className="flex items-center gap-3">
            {user.picture ? (
                <img
                    src={user.picture}
                    alt={user.name || 'User'}
                    className="h-10 w-10 rounded-full border border-obsidian-border object-cover"
                    referrerPolicy="no-referrer"
                />
            ) : (
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-obsidian-border bg-obsidian-light text-sm font-bold uppercase text-toxic">
                    {getProfileInitial(user)}
                </span>
            )}
            <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user.name || 'Google User'}</p>
                <p className="text-xs text-zinc-500 truncate">{user.email}</p>
            </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
            <Link
                to="/my-activity"
                onClick={closeMenu}
                className="inline-flex items-center justify-center rounded-xl border border-toxic/35 bg-toxic/10 px-3 py-2 text-xs font-semibold text-toxic"
            >
                My Activity
            </Link>
            <button
                type="button"
                onClick={async () => {
                    await handleLogout()
                    closeMenu()
                }}
                className="inline-flex items-center justify-center rounded-xl border border-rose-400/35 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-400"
            >
                Logout
            </button>
        </div>
    </div>
)

function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
    const profileMenuRef = useRef(null)
    const location = useLocation()
    const { user, isAuthenticated, signOut } = useAuth()

    const navLinks = useMemo(() => [
        { path: '/', name: 'Home', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg> },
        { path: '/about', name: 'About', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg> },
        { path: '/journey', name: 'Journey', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75h12m-12 5.25h12m-12 5.25h12M3 6.75h.008v.008H3V6.75zm0 5.25h.008v.008H3V12zm0 5.25h.008v.008H3v-.008z" /></svg> },
        { path: '/lab', name: 'Lab', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .03 2.798-1.414 2.798H4.213c-1.444 0-2.414-1.798-1.414-2.798L5 14.5" /></svg> },
        { path: '/skills', name: 'Skills', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg> },
        { path: '/projects', name: 'Projects', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 14.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" /></svg> },
        { path: '/services', name: 'Services', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75h19.5M2.25 12h19.5m-19.5 5.25h19.5" /></svg> },
        { path: '/blog', name: 'Blog', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg> },
        { path: '/contact', name: 'Contact', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg> },
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
        setIsProfileMenuOpen(false)
    }, [location, closeMenu])

    useEffect(() => {
        if (!isProfileMenuOpen) {
            return undefined
        }

        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setIsProfileMenuOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isProfileMenuOpen])

    const handleLogout = useCallback(async () => {
        try {
            await signOut()
            setIsProfileMenuOpen(false)
            toast.success('Logged out successfully')
        } catch (error) {
            toast.error(error?.message || 'Unable to logout right now')
        }
    }, [signOut])

    return (
        <>
            <nav className={`w-[94%] max-w-7xl mx-auto z-50 transition-all duration-500`}>
                <div className={`px-5 py-3 rounded-full border transition-all duration-300 backdrop-blur-md ${
                    scrolled
                        ? 'shadow-2xl shadow-black/80 bg-obsidian-card/95 border-obsidian-border/95 max-w-6xl mx-auto'
                        : 'shadow-xl shadow-black/20 bg-obsidian-card/75 border-obsidian-border/50 max-w-7xl'
                }`}>
                    <div className="flex items-center justify-between">

                        {/* Logo */}
                        <Link
                            to="/"
                            onClick={closeMenu}
                            className="group inline-flex items-center h-9 text-base sm:text-lg md:text-xl font-display font-extrabold uppercase tracking-wider gap-1.5 sm:gap-2 relative shrink-0 mr-3 xl:mr-6 leading-none"
                        >
                            <span className="text-white group-hover:text-toxic transition-colors duration-300 leading-none flex items-center">
                                <span className="hidden sm:inline leading-none">Gaurav</span>
                                <span className="sm:hidden leading-none">Gaurav</span>
                            </span>
                            <div className="absolute -inset-2 bg-toxic/5 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                        </Link>

                        {/* Desktop links */}
                        <div className="hidden lg:flex items-center gap-0.5 xl:gap-1.5 min-w-0">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`relative inline-flex items-center justify-center h-9 px-3 xl:px-3.5 rounded-full font-medium transition-colors duration-300 text-[13px] xl:text-[13.5px] leading-none whitespace-nowrap group shrink-0 ${isActive(link.path)
                                        ? 'text-obsidian font-bold'
                                        : 'text-zinc-400 hover:text-white'
                                        }`}
                                >
                                    {isActive(link.path) && (
                                        <motion.span
                                            layoutId="nav-active-pill"
                                            className="absolute inset-0 rounded-full bg-toxic shadow-md shadow-toxic/25"
                                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                        />
                                    )}
                                    <span className="relative z-10 leading-none">{link.name}</span>
                                    {!isActive(link.path) && (
                                        <>
                                            <span className="absolute inset-x-3 bottom-1.5 h-0.5 bg-toxic transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full"></span>
                                            <div className="absolute inset-0 bg-white/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                                        </>
                                    )}
                                </Link>
                            ))}
                        </div>

                        {/* Right Header Action Group */}
                        <div className="flex items-center gap-2 shrink-0">
                            {/* Search / Command Palette Trigger Button (Desktop & Tablet) */}
                            <button
                                type="button"
                                onClick={() => window.dispatchEvent(new CustomEvent('open-command-palette'))}
                                className="hidden sm:inline-flex items-center justify-center h-9 gap-2 px-3.5 rounded-full border border-obsidian-border bg-obsidian-card text-zinc-300 hover:text-white hover:border-toxic/50 transition-all duration-200 text-xs font-mono leading-none"
                                aria-label="Open Command Search"
                            >
                                <svg className="w-3.5 h-3.5 text-toxic shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <span className="font-sans text-xs leading-none">Search</span>
                                <kbd className="inline-flex items-center justify-center h-5 px-1.5 text-[10px] leading-none bg-obsidian border border-obsidian-border text-zinc-400 font-mono rounded">⌘K</kbd>
                            </button>

                            {/* Mobile Search Button (Extra Small Viewports) */}
                            <button
                                type="button"
                                onClick={() => window.dispatchEvent(new CustomEvent('open-command-palette'))}
                                className="sm:hidden inline-flex items-center justify-center w-9 h-9 rounded-full border border-obsidian-border bg-obsidian-card hover:bg-obsidian-light text-toxic active:scale-95 transition-all duration-200 shrink-0"
                                aria-label="Open Search Command Palette"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </button>

                            {/* Desktop Resume button */}
                            <a
                                href="/resume.pdf"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Open resume PDF in a new tab"
                                className="hidden lg:inline-flex items-center justify-center h-9 min-h-0 gap-2 ml-1 px-4 border border-toxic bg-transparent text-toxic hover:bg-toxic hover:text-obsidian font-bold rounded-full transition-all duration-300 text-xs xl:text-sm cursor-pointer whitespace-nowrap leading-none group relative hover:shadow-lg hover:shadow-toxic/20 hover:scale-105"
                            >
                                <svg className="w-3.5 h-3.5 shrink-0 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                <span className="relative z-10 leading-none">Resume</span>
                            </a>

                            {isAuthenticated && user
                                ? renderDesktopProfileMenu({
                                    user,
                                    isProfileMenuOpen,
                                    profileMenuRef,
                                    setIsProfileMenuOpen,
                                    handleLogout,
                                })
                                : null}

                            {/* Hamburger — mobile only */}
                            <button
                                onClick={() => setIsMenuOpen(prev => !prev)}
                                className="lg:hidden inline-flex flex-col items-center justify-center w-9 h-9 rounded-full border border-obsidian-border bg-obsidian-card hover:bg-obsidian-light active:scale-95 transition-all duration-200 shrink-0"
                                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                                aria-expanded={isMenuOpen}
                            >
                                <span className={`block h-0.5 w-4 bg-zinc-300 rounded-full transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-[5px]' : '-translate-y-[4px]'}`}></span>
                                <span className={`block h-0.5 w-4 bg-zinc-300 rounded-full transition-all duration-300 ${isMenuOpen ? 'opacity-0 scale-x-0' : 'opacity-100'}`}></span>
                                <span className={`block h-0.5 w-4 bg-zinc-300 rounded-full transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-[5px]' : 'translate-y-[4px]'}`}></span>
                            </button>
                        </div>
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
                    bg-gradient-to-b from-obsidian via-obsidian-card to-obsidian
                    border-l border-obsidian-border shadow-2xl shadow-black/90
                    transition-transform duration-300 ease-out
                    ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {/* ── Header ── */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-obsidian-border shrink-0">
                    <Link to="/" onClick={closeMenu} className="flex items-center gap-2 min-w-0 font-display font-extrabold uppercase tracking-wider">
                        <span className="text-white truncate">
                            Gaurav
                        </span>
                    </Link>
                    <button
                        onClick={closeMenu}
                        className="shrink-0 flex items-center justify-center w-9 h-9 rounded-full bg-obsidian-light hover:bg-obsidian border border-obsidian-border text-zinc-400 hover:text-white transition-all duration-200 active:scale-90"
                        aria-label="Close menu"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* ── Nav links (scrollable, fills all available space) ── */}
                <nav className="flex-1 overflow-y-auto px-3 py-3" style={{ minHeight: 0 }}>
                    <p className="text-zinc-600 text-[10px] font-display font-bold uppercase tracking-widest px-3.5 pb-2">
                        Navigation
                    </p>
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            onClick={closeMenu}
                            className={`group flex items-center gap-3.5 px-4 py-3 rounded-full font-semibold transition-all duration-200 mb-1 ${
                                isActive(link.path)
                                    ? 'text-obsidian bg-toxic shadow-lg shadow-toxic/20'
                                    : 'text-zinc-300 hover:text-white hover:bg-obsidian-light active:scale-[0.98]'
                            }`}
                        >
                            <span className="text-lg shrink-0">{link.icon}</span>
                            <span className="flex-1 text-[14px]">{link.name}</span>
                            {isActive(link.path) ? (
                                <span className="w-1.5 h-1.5 rounded-full bg-obsidian shrink-0" />
                            ) : (
                                <svg className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                </svg>
                            )}
                        </Link>
                    ))}
                </nav>

                {/* ── Resume + footer (pinned to bottom) ── */}
                <div className="shrink-0 px-4 pt-4 pb-8 border-t border-obsidian-border space-y-3">
                    {isAuthenticated && user ? renderMobileProfileCard({ user, closeMenu, handleLogout }) : null}

                    <a
                        href="/resume.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Open resume PDF in a new tab"
                        onClick={closeMenu}
                        className="flex items-center justify-center gap-2.5 w-full py-3.5 border border-toxic bg-toxic text-obsidian font-bold text-sm rounded-full transition-all duration-300 shadow-lg shadow-toxic/15 active:scale-95"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        View Resume
                    </a>
                    <p className="text-zinc-600 text-xs text-center flex items-center justify-center gap-1.5 font-mono">
                        Made with <svg className="w-3.5 h-3.5 text-toxic animate-pulse inline" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" /></svg> by Gaurav
                    </p>
                </div>
            </div>
        </>
    )
}

export default Navbar

// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect, useCallback, useRef } from 'react'
import PropTypes from 'prop-types'
import toast from 'react-hot-toast'
import useAuth from '../hooks/useAuth'
import { useFocusTrap } from '../hooks/useFocusTrap'
import TextLink from './ui/TextLink'
import './Navbar.css'

// Desktop nav: six sections (D-002/D-018). Home is the wordmark; Skills, Updates
// and the rest stay in the drawer, the footer and ⌘K.
const PRIMARY_LINKS = [
    { path: '/about', name: 'About' },
    { path: '/projects', name: 'Projects' },
    { path: '/journey', name: 'Journey' },
    { path: '/services', name: 'Services' },
    { path: '/blog', name: 'Blog' },
    { path: '/contact', name: 'Contact' },
]

const DRAWER_LINKS = [
    { path: '/', name: 'Home' },
    { path: '/about', name: 'About' },
    { path: '/projects', name: 'Projects' },
    { path: '/journey', name: 'Journey' },
    { path: '/skills', name: 'Skills' },
    { path: '/services', name: 'Services' },
    { path: '/blog', name: 'Blog' },
    { path: '/contact', name: 'Contact' },
]

const SHORTCUT_LABEL = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent)
    ? '⌘K'
    : 'Ctrl K'

const openPalette = () => window.dispatchEvent(new CustomEvent('open-command-palette'))

// A section is current on its own path and on its children (/projects/:slug).
const isCurrentPath = (pathname, path) =>
    path === '/' ? pathname === '/' : pathname === path || pathname.startsWith(`${path}/`)

const getProfileInitial = (user) => String(user?.name || user?.email || 'U').slice(0, 1).toUpperCase()

function ProfileAvatar({ user, size }) {
    const [imageFailed, setImageFailed] = useState(false)

    useEffect(() => setImageFailed(false), [user?.picture])

    const box = size === 'lg' ? 'h-10 w-10' : 'h-7 w-7'

    if (user?.picture && !imageFailed) {
        return (
            <img
                src={user.picture}
                alt=""
                className={`${box} shrink-0 rounded-control object-cover`}
                referrerPolicy="no-referrer"
                onError={() => setImageFailed(true)}
            />
        )
    }

    return (
        <span className={`${box} inline-flex shrink-0 items-center justify-center rounded-control border border-rule text-small text-paper`} aria-hidden="true">
            {getProfileInitial(user)}
        </span>
    )
}

ProfileAvatar.propTypes = {
    user: PropTypes.object,
    size: PropTypes.oneOf(['sm', 'lg']),
}

function ProfileMenu({ user, onLogout }) {
    const [open, setOpen] = useState(false)
    const rootRef = useRef(null)
    const buttonRef = useRef(null)
    const { pathname } = useLocation()

    useEffect(() => setOpen(false), [pathname])

    useEffect(() => {
        if (!open) return undefined
        // Close on a click or keyboard focus outside the menu.
        const closeIfOutside = (event) => {
            if (!rootRef.current?.contains(event.target)) setOpen(false)
        }
        const handleKey = (event) => {
            if (event.key === 'Escape') {
                setOpen(false)
                buttonRef.current?.focus()
            }
        }
        document.addEventListener('mousedown', closeIfOutside)
        document.addEventListener('keydown', handleKey)
        document.addEventListener('focusin', closeIfOutside)
        return () => {
            document.removeEventListener('mousedown', closeIfOutside)
            document.removeEventListener('keydown', handleKey)
            document.removeEventListener('focusin', closeIfOutside)
        }
    }, [open])

    return (
        <div ref={rootRef} className="relative hidden lg:block">
            <button
                ref={buttonRef}
                type="button"
                onClick={() => setOpen((previous) => !previous)}
                className="nav-icon-button"
                aria-label="Account menu"
                aria-expanded={open}
                aria-controls="nav-account-menu"
            >
                <ProfileAvatar user={user} size="sm" />
            </button>

            {open ? (
                <div
                    id="nav-account-menu"
                    className="absolute right-0 top-full mt-2 w-64 rounded-dialog border border-rule bg-ink-raised py-2 shadow-dialog"
                >
                    <div className="border-b border-rule px-4 pb-3 pt-1">
                        <p className="truncate text-small text-paper">{user.name || 'Google account'}</p>
                        <p className="truncate text-small text-muted">{user.email}</p>
                    </div>
                    <Link to="/my-activity" className="nav-menu-item">My activity</Link>
                    <button type="button" onClick={onLogout} className="nav-menu-item">Log out</button>
                </div>
            ) : null}
        </div>
    )
}

ProfileMenu.propTypes = {
    user: PropTypes.object.isRequired,
    onLogout: PropTypes.func.isRequired,
}

function Navbar({ navReady = true, logoRef }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const drawerRef = useRef(null)
    const { pathname } = useLocation()
    const { user, isAuthenticated, signOut } = useAuth()
    const signedIn = isAuthenticated && Boolean(user)

    const closeMenu = useCallback(() => setIsMenuOpen(false), [])

    useFocusTrap(drawerRef, isMenuOpen, { onEscape: closeMenu })

    // Lock body scroll while the drawer is open.
    useEffect(() => {
        if (!isMenuOpen) return undefined
        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => { document.body.style.overflow = previousOverflow }
    }, [isMenuOpen])

    useEffect(() => closeMenu(), [pathname, closeMenu])

    const handleLogout = useCallback(async () => {
        try {
            await signOut()
            closeMenu()
            toast.success('Logged out successfully')
        } catch (error) {
            toast.error(error?.message || 'Unable to logout right now')
        }
    }, [signOut, closeMenu])

    return (
        <>
            <nav
                aria-label="Main"
                className="nav-bar"
                style={{
                    opacity: navReady ? 1 : 0,
                    pointerEvents: navReady ? undefined : 'none',
                }}
            >
                <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                    <Link to="/" className="nav-wordmark" aria-label="Gaurav Kumar Yadav, home">
                        <span ref={logoRef}>Gaurav Kumar Yadav</span>
                    </Link>

                    <ul className="hidden items-center gap-6 lg:flex xl:gap-8">
                        {PRIMARY_LINKS.map((link) => {
                            const current = isCurrentPath(pathname, link.path)
                            return (
                                <li key={link.path}>
                                    <TextLink
                                        to={link.path}
                                        tone="muted"
                                        className="nav-link inline-flex"
                                        aria-current={current ? 'page' : undefined}
                                    >
                                        {link.name}
                                    </TextLink>
                                </li>
                            )
                        })}
                    </ul>

                    <div className="flex items-center gap-2 sm:gap-4">
                        <button type="button" onClick={openPalette} className="nav-search" aria-label="Search the site" aria-keyshortcuts="Control+K Meta+K">
                            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.2-5.2M17 10.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z" />
                            </svg>
                            <span className="hidden sm:inline lg:hidden xl:inline">Search</span>
                            <kbd className="hidden font-mono text-[12px] text-muted sm:inline lg:hidden xl:inline">{SHORTCUT_LABEL}</kbd>
                        </button>

                        <TextLink href="/resume.pdf" external tone="muted" className="nav-link hidden lg:inline-flex" aria-label="Resume (PDF, opens in a new tab)">
                            Resume
                        </TextLink>

                        {signedIn ? <ProfileMenu user={user} onLogout={handleLogout} /> : null}

                        <button
                            type="button"
                            onClick={() => setIsMenuOpen((previous) => !previous)}
                            className="nav-icon-button lg:hidden"
                            aria-label="Open menu"
                            aria-expanded={isMenuOpen}
                            aria-controls="nav-drawer"
                        >
                            <span className="nav-burger" aria-hidden="true" />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile drawer — a contents page. `inert` keeps it out of the tab order when closed. */}
            <div
                className={`nav-scrim lg:hidden ${isMenuOpen ? 'is-open' : ''}`}
                onClick={closeMenu}
                aria-hidden="true"
            />
            <div
                id="nav-drawer"
                ref={drawerRef}
                role="dialog"
                aria-modal="true"
                aria-label="Site menu"
                className={`nav-drawer lg:hidden ${isMenuOpen ? 'is-open' : ''}`}
                {...(isMenuOpen ? {} : { inert: '' })}
            >
                <div className="flex h-16 shrink-0 items-center justify-between border-b border-rule px-4 sm:px-6">
                    <span className="font-serif text-[22px] leading-none text-paper">Contents</span>
                    <button type="button" onClick={closeMenu} className="nav-icon-button" aria-label="Close menu">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <nav aria-label="Site" className="min-h-0 flex-1 overflow-y-auto px-4 sm:px-6">
                    <ol>
                        {DRAWER_LINKS.map((link) => {
                            const current = isCurrentPath(pathname, link.path)
                            return (
                                <li key={link.path} className="border-b border-rule">
                                    <Link
                                        to={link.path}
                                        onClick={closeMenu}
                                        className="nav-drawer-link"
                                        aria-current={current ? 'page' : undefined}
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            )
                        })}
                    </ol>
                </nav>

                <div className="shrink-0 space-y-4 border-t border-rule px-4 pb-8 pt-4 sm:px-6">
                    {signedIn ? (
                        <div className="flex items-center gap-4">
                            <ProfileAvatar user={user} size="lg" />
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-small text-paper">{user.name || 'Google account'}</p>
                                <p className="truncate text-small text-muted">{user.email}</p>
                            </div>
                        </div>
                    ) : null}
                    <div className="flex flex-wrap items-center gap-x-6">
                        <TextLink href="/resume.pdf" external className="nav-link inline-flex" onClick={closeMenu} aria-label="Resume (PDF, opens in a new tab)">
                            Resume
                        </TextLink>
                        {signedIn ? (
                            <>
                                <TextLink to="/my-activity" tone="muted" className="nav-link inline-flex">My activity</TextLink>
                                <button type="button" onClick={handleLogout} className="nav-link inline-flex text-link text-link--muted">
                                    <span className="text-link__label">Log out</span>
                                </button>
                            </>
                        ) : null}
                    </div>
                </div>
            </div>
        </>
    )
}

Navbar.propTypes = {
    navReady: PropTypes.bool,
    logoRef: PropTypes.shape({ current: PropTypes.object }),
}

export default Navbar

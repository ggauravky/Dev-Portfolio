// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// S1 — bottom pill dock (DESIGN.md "Signature layer"). Replaces B's top navbar
// and drawer.
// - Idle: a compact pill — scroll-progress ring, "03 / Projects", availability dot.
// - Hover (mouse), keyboard focus or tap: morphs into the full menu. A tap/click
//   or Enter "pins" it open with a focus trap; Esc closes and returns focus.
// - The morph and the sliding indicator use framer `layout`/`layoutId`, with the
//   features loaded asynchronously so the idle dock costs no framer runtime.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import PropTypes from 'prop-types'
import { LazyMotion, m } from 'framer-motion'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import { useMagnetic } from '../../hooks/useMagnetic'
import { siteStatus, isAvailable } from '../../data/siteStatus'
import { SPRING } from '../../lib/motion'
import './Dock.css'

// If the chunk fails, the dock still works: it just doesn't morph.
const loadFeatures = () => import('../../lib/framerFeatures')
    .then((mod) => mod.default)
    .catch(() => ({}))

export const DOCK_PAGES = [
    { path: '/', name: 'Home' },
    { path: '/about', name: 'About' },
    { path: '/projects', name: 'Projects' },
    { path: '/journey', name: 'Journey' },
    { path: '/skills', name: 'Skills' },
    { path: '/services', name: 'Services' },
    { path: '/blog', name: 'Blog' },
    { path: '/contact', name: 'Contact' },
]

// Pages outside the dock still get a readable name in the idle pill.
const OTHER_PAGES = [
    { path: '/updates', name: 'Updates' },
    { path: '/booknow', name: 'Book' },
    { path: '/support', name: 'Support' },
    { path: '/payment-success', name: 'Payment' },
    { path: '/my-activity', name: 'Activity' },
    { path: '/my-supports', name: 'Activity' },
    { path: '/privacy', name: 'Privacy' },
    { path: '/terms', name: 'Terms' },
    { path: '/refund', name: 'Refund' },
    { path: '/frontend-development', name: 'Services' },
    { path: '/backend-development', name: 'Services' },
    { path: '/full-stack-development', name: 'Services' },
    { path: '/ai-data-science-guidance', name: 'Services' },
]

const isCurrentPath = (pathname, path) =>
    path === '/' ? pathname === '/' : pathname === path || pathname.startsWith(`${path}/`)

function describePage(pathname) {
    const index = DOCK_PAGES.findIndex((page) => isCurrentPath(pathname, page.path))
    if (index >= 0) return { index: String(index + 1).padStart(2, '0'), name: DOCK_PAGES[index].name }
    const other = OTHER_PAGES.find((page) => isCurrentPath(pathname, page.path))
    return { index: '··', name: other ? other.name : 'Not found' }
}

const SHORTCUT_LABEL = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent)
    ? '⌘K'
    : 'Ctrl K'

const openPalette = () => window.dispatchEvent(new CustomEvent('open-command-palette'))

// Scroll-progress ring: one passive listener, writes the stroke directly (no
// React state per frame).
function ProgressRing() {
    const circleRef = useRef(null)
    const { pathname } = useLocation()

    useEffect(() => {
        const circle = circleRef.current
        if (!circle) return undefined
        let frame = 0
        const update = () => {
            frame = 0
            const max = document.documentElement.scrollHeight - window.innerHeight
            const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
            circle.style.strokeDashoffset = String(1 - progress)
        }
        const onScroll = () => {
            if (!frame) frame = requestAnimationFrame(update)
        }
        update()
        window.addEventListener('scroll', onScroll, { passive: true })
        window.addEventListener('resize', onScroll, { passive: true })
        return () => {
            cancelAnimationFrame(frame)
            window.removeEventListener('scroll', onScroll)
            window.removeEventListener('resize', onScroll)
        }
    }, [pathname])

    return (
        <svg className="dock-ring" viewBox="0 0 20 20" aria-hidden="true">
            <circle cx="10" cy="10" r="8" className="dock-ring__track" />
            <circle ref={circleRef} cx="10" cy="10" r="8" pathLength="1" className="dock-ring__value" />
        </svg>
    )
}

// The sliding hover/current highlight; one shared layoutId so it glides between cells.
function HoverIndicator() {
    return <m.span layoutId="dock-hover" className="dock-item__hover" transition={SPRING.snappy} aria-hidden="true" />
}

function DockItem({ to, href, external, current, onSelect, onHover, children, label }) {
    const ref = useRef(null)
    useMagnetic(ref, { max: 4, strength: 0.2 })
    const shared = {
        ref,
        className: 'dock-item',
        onPointerEnter: onHover,
        onFocus: onHover,
        onClick: onSelect,
        'aria-label': label,
    }
    const content = <span className="dock-item__label">{children}</span>
    if (to) {
        return <Link to={to} aria-current={current ? 'page' : undefined} {...shared}>{content}</Link>
    }
    if (href) {
        return (
            <a href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...shared}>
                {content}
            </a>
        )
    }
    return <button type="button" {...shared}>{content}</button>
}

DockItem.propTypes = {
    to: PropTypes.string,
    href: PropTypes.string,
    external: PropTypes.bool,
    current: PropTypes.bool,
    onSelect: PropTypes.func,
    onHover: PropTypes.func,
    children: PropTypes.node,
    label: PropTypes.string,
}

function Dock() {
    const { pathname } = useLocation()
    const page = useMemo(() => describePage(pathname), [pathname])
    const available = isAvailable()

    const [hoverOpen, setHoverOpen] = useState(false)
    const [focusOpen, setFocusOpen] = useState(false)
    const [pinned, setPinned] = useState(false)
    const [hovered, setHovered] = useState(null)
    const open = hoverOpen || focusOpen || pinned

    const rootRef = useRef(null)
    const panelRef = useRef(null)
    const triggerRef = useRef(null)
    const suppressRef = useRef(false)
    const leaveTimer = useRef(0)

    const closeAll = useCallback(() => {
        setPinned(false)
        setHoverOpen(false)
        setFocusOpen(false)
        setHovered(null)
    }, [])

    const closeToTrigger = useCallback(() => {
        suppressRef.current = true
        closeAll()
        triggerRef.current?.focus({ preventScroll: true })
    }, [closeAll])

    // After choosing a page, keyboard focus starts at the new page's content
    // instead of dropping to <body> when the menu unmounts.
    const selectPage = useCallback(() => {
        closeAll()
        requestAnimationFrame(() => document.getElementById('main-content')?.focus({ preventScroll: true }))
    }, [closeAll])

    useFocusTrap(panelRef, pinned, { onEscape: closeToTrigger, returnFocusTo: triggerRef.current })

    // Close on navigation.
    useEffect(() => {
        closeAll()
    }, [pathname, closeAll])

    // Esc also closes a hover/focus-opened dock.
    useEffect(() => {
        if (!open || pinned) return undefined
        const onKey = (event) => {
            if (event.key === 'Escape') closeToTrigger()
        }
        document.addEventListener('keydown', onKey)
        return () => document.removeEventListener('keydown', onKey)
    }, [open, pinned, closeToTrigger])

    // A pinned dock closes on an outside tap/click.
    useEffect(() => {
        if (!pinned) return undefined
        const onDown = (event) => {
            if (!rootRef.current?.contains(event.target)) closeAll()
        }
        document.addEventListener('pointerdown', onDown)
        return () => document.removeEventListener('pointerdown', onDown)
    }, [pinned, closeAll])

    useEffect(() => () => window.clearTimeout(leaveTimer.current), [])

    const onPointerEnter = (event) => {
        if (event.pointerType !== 'mouse') return
        window.clearTimeout(leaveTimer.current)
        if (!suppressRef.current) setHoverOpen(true)
    }
    const onPointerLeave = (event) => {
        if (event.pointerType !== 'mouse') return
        suppressRef.current = false
        leaveTimer.current = window.setTimeout(() => {
            setHoverOpen(false)
            setHovered(null)
        }, 180)
    }
    const onFocusIn = (event) => {
        if (!suppressRef.current && event.target.matches?.(':focus-visible')) setFocusOpen(true)
    }
    const onFocusOut = (event) => {
        const next = event.relatedTarget
        if (next && rootRef.current?.contains(next)) return
        suppressRef.current = false
        setFocusOpen(false)
        // A click on the dock's own padding blurs to null; the outside-pointer
        // handler owns closing a pinned dock in that case.
        if (next) setPinned(false)
    }
    // Click/tap/Enter pins the dock open (focus trap); on a pinned dock it closes.
    // A dock already opened by hover or keyboard focus gets pinned, not closed.
    const onTrigger = () => {
        if (pinned) {
            suppressRef.current = true
            closeAll()
        } else {
            setPinned(true)
        }
    }

    const statusLabel = available ? siteStatus.availability?.label || 'Available' : null
    const indicatorKey = hovered ?? (open ? pathname : null)

    return (
        <LazyMotion features={loadFeatures} strict>
            <nav
                ref={rootRef}
                aria-label="Main"
                className={`dock ${open ? 'is-open' : ''}`}
                onPointerEnter={onPointerEnter}
                onPointerLeave={onPointerLeave}
                onFocus={onFocusIn}
                onBlur={onFocusOut}
            >
                <m.div
                    ref={panelRef}
                    layout
                    transition={SPRING.snappy}
                    style={{ borderRadius: 26 }}
                    className="dock-panel"
                >
                    <button
                        ref={triggerRef}
                        type="button"
                        className="dock-trigger"
                        aria-expanded={open}
                        aria-controls="dock-menu"
                        aria-label={open ? 'Close menu' : `Open menu. Current page: ${page.name}`}
                        onClick={onTrigger}
                    >
                        <ProgressRing />
                        {open ? (
                            <span className="dock-trigger__label dock-trigger__close" aria-hidden="true">Close</span>
                        ) : (
                            <m.span layout="position" className="dock-trigger__label" aria-hidden="true">
                                <span className="dock-trigger__index">{page.index}</span>
                                <span className="dock-trigger__slash">/</span>
                                <span>{page.name}</span>
                            </m.span>
                        )}
                        {available && !open ? (
                            <span className="dock-status" title={statusLabel}>
                                <span className="sr-only">{statusLabel}</span>
                            </span>
                        ) : null}
                    </button>

                    {open ? (
                        <div
                            id="dock-menu"
                            className="dock-menu"
                            onPointerLeave={() => setHovered(null)}
                        >
                            <ul className="dock-menu__pages">
                                {DOCK_PAGES.map((item, i) => {
                                    const current = isCurrentPath(pathname, item.path)
                                    return (
                                        <li key={item.path} className="dock-menu__cell">
                                            {indicatorKey === item.path || (indicatorKey === pathname && current) ? (
                                                <HoverIndicator />
                                            ) : null}
                                            <DockItem
                                                to={item.path}
                                                current={current}
                                                onSelect={selectPage}
                                                onHover={() => setHovered(item.path)}
                                            >
                                                <span className="dock-item__index" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                                                {item.name}
                                            </DockItem>
                                        </li>
                                    )
                                })}
                            </ul>
                            <ul className="dock-menu__tools">
                                <li className="dock-menu__cell">
                                    {indicatorKey === 'search' ? (
                                        <HoverIndicator />
                                    ) : null}
                                    <DockItem
                                        label={`Search the site (${SHORTCUT_LABEL})`}
                                        onSelect={() => {
                                            // Park focus on the trigger so the palette returns it there.
                                            closeToTrigger()
                                            openPalette()
                                        }}
                                        onHover={() => setHovered('search')}
                                    >
                                        Search <kbd className="dock-kbd">{SHORTCUT_LABEL}</kbd>
                                    </DockItem>
                                </li>
                                <li className="dock-menu__cell">
                                    {indicatorKey === 'resume' ? (
                                        <HoverIndicator />
                                    ) : null}
                                    <DockItem
                                        href={siteStatus.resumeUrl}
                                        external
                                        label="Resume (PDF, opens in a new tab)"
                                        onSelect={closeAll}
                                        onHover={() => setHovered('resume')}
                                    >
                                        Resume <span aria-hidden="true">↗</span>
                                    </DockItem>
                                </li>
                            </ul>
                        </div>
                    ) : null}
                </m.div>
            </nav>
        </LazyMotion>
    )
}

export default Dock

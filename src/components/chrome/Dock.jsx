// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// S1 — bottom pill dock (DESIGN.md "Signature layer"). Replaces B's top navbar
// and drawer.
// - Idle: a compact pill — scroll-progress ring, "03 / Projects", availability dot.
// - Mouse hover on the page trigger opens the full menu; a click, tap or Enter
//   pins it open with a focus trap; Esc or Close shuts it and returns focus.
// - Compositor-only motion (D-132): the open menu is always mounted and only its
//   transforms and opacity change. On desktop its skin is three pieces (two caps
//   that translate, a middle that scales on X), so the pill grows into the menu
//   without stretching its corners or text. Below 1024px the sheet rises from the
//   pill. The hover highlight is one element slid by CSS custom properties
//   (translate + scaleX, CSS transition): hovering never re-renders React.
//   Geometry is read once per resize in a ResizeObserver callback (layout is
//   already clean there), never per hover or per frame. It uses offset* rather
//   than getBoundingClientRect because the closed mobile sheet is scaled, and
//   offsets ignore transforms.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import PropTypes from 'prop-types'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import { siteStatus, isAvailable } from '../../data/siteStatus'
import ChatTrigger from '../chat/ChatTrigger'
import { CHAT_ENABLED, openChat, prefetchChat } from '../chat/chatEvents'
import './Dock.css'

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

// Hover intent: a pointer crossing the pill on its way elsewhere doesn't open it,
// and a short exit gap doesn't close it.
const OPEN_DELAY = 60
const CLOSE_DELAY = 180

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

function DockItem({ id, to, href, external, current, onSelect, children, label }) {
    const shared = {
        className: 'dock-item',
        'data-dock-key': id,
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
    id: PropTypes.string.isRequired,
    to: PropTypes.string,
    href: PropTypes.string,
    external: PropTypes.bool,
    current: PropTypes.bool,
    onSelect: PropTypes.func,
    children: PropTypes.node,
    label: PropTypes.string,
}

function Dock() {
    const { pathname } = useLocation()
    const page = useMemo(() => describePage(pathname), [pathname])
    const available = isAvailable()

    const [hoverOpen, setHoverOpen] = useState(false)
    const [pinned, setPinned] = useState(false)
    const open = hoverOpen || pinned

    const clusterRef = useRef(null)
    const pillRef = useRef(null)
    const menuRef = useRef(null)
    const listsRef = useRef(null)
    const triggerRef = useRef(null)
    const closeRef = useRef(null)
    const suppressRef = useRef(false)
    const openTimer = useRef(0)
    const closeTimer = useRef(0)
    // Highlight geometry: dock key -> { x, y, w } relative to the lists box.
    const geometry = useRef(new Map())
    const hl = useRef({ key: null, pending: null, frame: 0 })

    const currentKey = DOCK_PAGES.find((item) => isCurrentPath(pathname, item.path))?.path ?? null
    const currentKeyRef = useRef(currentKey)
    currentKeyRef.current = currentKey

    // --- Hover highlight: CSS custom properties, one write per frame at most ---
    const applyHighlight = useCallback(() => {
        const state = hl.current
        state.frame = 0
        const lists = listsRef.current
        if (!lists || state.pending === state.key) return
        const box = state.pending ? geometry.current.get(state.pending) : null
        state.key = box ? state.pending : null
        if (box) {
            lists.style.setProperty('--hx', String(box.x))
            lists.style.setProperty('--hy', String(box.y))
            lists.style.setProperty('--hw', String(box.w))
        }
        lists.classList.toggle('has-hl', Boolean(box))
    }, [])

    const moveHighlight = useCallback((key) => {
        const state = hl.current
        state.pending = key
        if (!state.frame) state.frame = requestAnimationFrame(applyHighlight)
    }, [applyHighlight])

    // --- Geometry: measured after layout, never on hover ---
    useEffect(() => {
        const cluster = clusterRef.current
        const pill = pillRef.current
        const menu = menuRef.current
        const lists = listsRef.current
        if (!cluster || !pill || !menu || !lists || typeof ResizeObserver === 'undefined') return undefined
        const measure = () => {
            // Reads first (layout is clean inside a ResizeObserver callback)...
            const pillW = pill.offsetWidth
            const menuW = menu.offsetWidth
            const inset = 25 // .dock-skin__m left/right: the caps' width less the 1px tuck
            const boxes = new Map()
            lists.querySelectorAll('[data-dock-key]').forEach((el) => {
                boxes.set(el.dataset.dockKey, { x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth })
            })
            // ...then writes. The highlight's base width is the median item width,
            // so its scaleX stays near 1 (exactly 1 in the equal-width mobile grid).
            const widths = [...boxes.values()].map((b) => b.w).sort((a, b) => a - b)
            if (widths.length) lists.style.setProperty('--hb', String(widths[Math.floor(widths.length / 2)]))
            geometry.current = boxes
            cluster.style.setProperty('--dock-d', String(Math.max(0, (menuW - pillW) / 2)))
            cluster.style.setProperty('--dock-sm', String(Math.max(0.01, (pillW - 2 * inset) / Math.max(1, menuW - 2 * inset))))
            hl.current.key = undefined // force a re-apply with the new geometry
            moveHighlight(hl.current.pending ?? currentKeyRef.current)
        }
        const ro = new ResizeObserver(measure)
        ro.observe(pill)
        ro.observe(menu)
        ro.observe(lists)
        return () => ro.disconnect()
    }, [moveHighlight])

    // The highlight rests on the current page (instantly while the menu is shut).
    useEffect(() => {
        if (!open) moveHighlight(currentKey)
    }, [open, currentKey, moveHighlight])

    useEffect(() => () => {
        window.clearTimeout(openTimer.current)
        window.clearTimeout(closeTimer.current)
        cancelAnimationFrame(hl.current.frame)
    }, [])

    // --- Open / close ---
    const closeAll = useCallback(() => {
        window.clearTimeout(openTimer.current)
        window.clearTimeout(closeTimer.current)
        setPinned(false)
        setHoverOpen(false)
    }, [])

    // Focus moves in the next frame, once the close has rendered: the pill is no
    // longer inert, and focus() doesn't force a style recalc inside the click.
    // `then` runs after it (the palette and chat return focus to the trigger).
    const closeToTrigger = useCallback((then) => {
        suppressRef.current = true
        closeAll()
        requestAnimationFrame(() => {
            triggerRef.current?.focus({ preventScroll: true })
            if (typeof then === 'function') then()
        })
    }, [closeAll])

    // After choosing a page, keyboard focus starts at the new page's content
    // instead of staying in the closed menu.
    const selectPage = useCallback(() => {
        closeAll()
        requestAnimationFrame(() => document.getElementById('main-content')?.focus({ preventScroll: true }))
    }, [closeAll])

    useFocusTrap(menuRef, pinned, { onEscape: closeToTrigger, initialFocusRef: closeRef, returnFocusTo: triggerRef.current, deferFocus: true })

    // Close on navigation.
    useEffect(() => {
        closeAll()
    }, [pathname, closeAll])

    // Esc also closes a hover-opened dock.
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
            if (!clusterRef.current?.contains(event.target)) closeAll()
        }
        document.addEventListener('pointerdown', onDown)
        return () => document.removeEventListener('pointerdown', onDown)
    }, [pinned, closeAll])

    const onTriggerEnter = (event) => {
        if (event.pointerType !== 'mouse' || suppressRef.current) return
        window.clearTimeout(closeTimer.current)
        window.clearTimeout(openTimer.current)
        openTimer.current = window.setTimeout(() => setHoverOpen(true), OPEN_DELAY)
    }
    const onMenuEnter = (event) => {
        if (event.pointerType === 'mouse') window.clearTimeout(closeTimer.current)
    }
    const onClusterLeave = (event) => {
        if (event.pointerType !== 'mouse') return
        suppressRef.current = false
        window.clearTimeout(openTimer.current)
        window.clearTimeout(closeTimer.current)
        closeTimer.current = window.setTimeout(() => setHoverOpen(false), CLOSE_DELAY)
    }
    // Click/tap/Enter on the trigger pins the dock open; the trap moves focus to Close.
    const onTrigger = () => {
        window.clearTimeout(openTimer.current)
        setPinned(true)
    }

    // Delegated hover/focus over the items: move the highlight, prefetch on intent.
    const onItemIntent = (event) => {
        const key = event.target.closest?.('[data-dock-key]')?.dataset.dockKey
        if (!key) return
        moveHighlight(key)
        if (key === 'ask') prefetchChat()
        if (key === 'search') window.dispatchEvent(new CustomEvent('prefetch-command-palette'))
    }
    const onListsLeave = () => moveHighlight(currentKeyRef.current)

    const statusLabel = available ? siteStatus.availability?.label || 'Available' : null

    return (
        <div ref={clusterRef} className="dock-cluster" onPointerLeave={onClusterLeave}>
            <nav aria-label="Main" className={`dock ${open ? 'is-open' : ''}`}>
                <div ref={pillRef} className="dock-pill" inert={open ? '' : undefined}>
                    <button
                        ref={triggerRef}
                        type="button"
                        className="dock-trigger"
                        aria-expanded={open}
                        aria-controls="dock-menu"
                        aria-label={`Open menu. Current page: ${page.name}`}
                        onClick={onTrigger}
                        onPointerEnter={onTriggerEnter}
                    >
                        <ProgressRing />
                        <span className="dock-trigger__label" aria-hidden="true">
                            <span className="dock-trigger__index">{page.index}</span>
                            <span className="dock-trigger__slash">/</span>
                            <span>{page.name}</span>
                        </span>
                        {available ? (
                            <span className="dock-status" title={statusLabel}>
                                <span className="sr-only">{statusLabel}</span>
                            </span>
                        ) : null}
                    </button>
                    {/* Hover opens the menu from the page trigger only (above), so the
                        Ask segment beside it can be reached without opening it. */}
                    <ChatTrigger />
                </div>

                <div
                    ref={menuRef}
                    id="dock-menu"
                    className="dock-menu"
                    inert={open ? undefined : ''}
                    onPointerEnter={onMenuEnter}
                >
                    <div className="dock-menu__frame">
                        <span className="dock-skin" aria-hidden="true">
                            <span className="dock-skin__l" />
                            <span className="dock-skin__m" />
                            <span className="dock-skin__r" />
                        </span>
                        <div className="dock-menu__body">
                            <button
                                ref={closeRef}
                                type="button"
                                className="dock-trigger dock-close"
                                aria-label="Close menu"
                                onClick={closeToTrigger}
                            >
                                <ProgressRing />
                                <span className="dock-trigger__label" aria-hidden="true">Close</span>
                            </button>
                            <div
                                ref={listsRef}
                                className="dock-menu__lists"
                                onPointerOver={onItemIntent}
                                onFocus={onItemIntent}
                                onPointerLeave={onListsLeave}
                            >
                                <span className="dock-hl" aria-hidden="true" />
                                <ul className="dock-menu__pages">
                                    {DOCK_PAGES.map((item, i) => (
                                        <li key={item.path}>
                                            <DockItem
                                                id={item.path}
                                                to={item.path}
                                                current={isCurrentPath(pathname, item.path)}
                                                onSelect={selectPage}
                                            >
                                                <span className="dock-item__index" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                                                {item.name}
                                            </DockItem>
                                        </li>
                                    ))}
                                </ul>
                                <ul className="dock-menu__tools">
                                    {CHAT_ENABLED ? (
                                        <li>
                                            <DockItem
                                                id="ask"
                                                label="Ask the site assistant about Gaurav"
                                                onSelect={() => closeToTrigger(openChat)}
                                            >
                                                Ask
                                            </DockItem>
                                        </li>
                                    ) : null}
                                    <li>
                                        <DockItem
                                            id="search"
                                            label={`Search the site (${SHORTCUT_LABEL})`}
                                            // Focus parks on the trigger first, so the palette returns it there.
                                            onSelect={() => closeToTrigger(openPalette)}
                                        >
                                            Search <kbd className="dock-kbd">{SHORTCUT_LABEL}</kbd>
                                        </DockItem>
                                    </li>
                                    <li>
                                        <DockItem
                                            id="resume"
                                            href={siteStatus.resumeUrl}
                                            external
                                            label="Resume (PDF, opens in a new tab)"
                                            onSelect={closeAll}
                                        >
                                            Resume <span aria-hidden="true">↗</span>
                                        </DockItem>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </div>
    )
}

export default Dock

// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { BrowserRouter as Router, Routes, Route, useLocation, useNavigationType } from 'react-router-dom'
import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react'
import { MotionConfig } from 'framer-motion'
import PropTypes from 'prop-types'

import { Toaster } from 'react-hot-toast'
import './App.css'
import Footer from './components/Footer'
import ErrorBoundary from './components/ErrorBoundary'
import TopChrome from './components/chrome/TopChrome'
import Dock from './components/chrome/Dock'
import Cursor from './components/chrome/Cursor'
import RouteWipe from './components/chrome/RouteWipe'
import NetworkStatusBanner from './components/NetworkStatusBanner'
import { pingBackend } from './utils/backendPing'
import { initializeAnalytics, trackPageView } from './utils/analytics'
import { OPEN_CHAT_EVENT, loadChatSurface } from './components/chat/chatEvents'
import { About, Blog, BlogPost, Contact, Journey, Projects, ProjectDetail, ServiceDetail, Services, Skills } from './lib/routeChunks'

import Home from './pages/Home'

const loadCommandPalette = () => import('./components/CommandPalette')
const CommandPalette = lazy(loadCommandPalette)
// The chat surface is its own lazy chunk, fetched on intent (P-chat-2, D-104).
const ChatSurface = lazy(loadChatSurface)

// Routes with a static header shell (Projects, case studies and the P5 pages)
// come from src/lib/routeChunks.js (D-057). Projects is prefetched at once, as
// before; the other secondary routes load lazily.
void Projects.preload()
const ActivityTimeline = lazy(() => import('./pages/ActivityTimeline'))
const BookNow = lazy(() => import('./pages/BookNow'))
const Support = lazy(() => import('./pages/Support'))
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'))
const Updates = lazy(() => import('./pages/Updates'))
const Privacy = lazy(() => import('./pages/Privacy'))
const Terms = lazy(() => import('./pages/Terms'))
const Refund = lazy(() => import('./pages/Refund'))
const NotFound = lazy(() => import('./pages/NotFound'))
const AdminRedirect = lazy(() => import('./pages/AdminRedirect'))
// Dev-only UI kit sheet; the DEV check removes it (and its chunk) from production builds.
const Kit = import.meta.env.DEV ? lazy(() => import('./pages/_Kit')) : null

// Per-route loading fallback (P6): a quiet skeleton of the page head (rail,
// h1, lede) in hairline blocks, announced to screen readers. The route wipe
// usually covers it; it shows only on slow chunk loads.
const PageLoader = () => (
    <div className="pg-skel min-h-screen" role="status">
        <span className="sr-only">Loading page…</span>
        <div className="pg-head page-wrap page-grid" aria-hidden="true">
            <span className="pg-skel__bar pg-skel__bar--rail" />
            <div className="page-main">
                <span className="pg-skel__bar pg-skel__bar--h1" />
                <span className="pg-skel__bar pg-skel__bar--lede" />
                <span className="pg-skel__bar pg-skel__bar--lede pg-skel__bar--short" />
            </div>
        </div>
    </div>
)

// Each route gets its own Suspense so a lazy chunk never blanks the whole shell.
function R({ children }) {
    return <Suspense fallback={<PageLoader />}>{children}</Suspense>
}

R.propTypes = {
    children: PropTypes.node.isRequired,
}

// Scroll restoration (P6): back/forward (POP) returns to the position saved for
// that history entry; push/replace goes to the top, or to the #hash target.
// Positions are keyed by location.key in sessionStorage, so a reload keeps them.
const SCROLL_KEY = 'scroll-positions'
const readPositions = () => {
    try { return JSON.parse(sessionStorage.getItem(SCROLL_KEY)) || {} } catch { return {} }
}

function ScrollManager() {
    const location = useLocation()
    const navType = useNavigationType()
    const { key, hash } = location

    useEffect(() => {
        if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual'
    }, [])

    // Remember this entry's position as the user scrolls (rAF-throttled).
    useEffect(() => {
        let frame = 0
        const save = () => {
            frame = 0
            const positions = readPositions()
            positions[key] = window.scrollY
            try { sessionStorage.setItem(SCROLL_KEY, JSON.stringify(positions)) } catch { /* private mode */ }
        }
        const onScroll = () => { if (!frame) frame = requestAnimationFrame(save) }
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => {
            window.removeEventListener('scroll', onScroll)
            if (frame) cancelAnimationFrame(frame)
        }
    }, [key])

    useEffect(() => {
        // An in-page `#hash` link makes a history entry the router didn't create,
        // so it has the same key ("default") as the page's first entry. Restoring
        // that key would cut the anchor's scroll short; let the hash scroll win.
        const inPageAnchor = hash && key === 'default'
        if (navType === 'POP' && !inPageAnchor) {
            const target = readPositions()[key]
            if (typeof target === 'number') {
                // Lazy routes grow after first paint: retry until the page is
                // tall enough to reach the saved position (max ~1 s).
                let tries = 0
                let frame = 0
                const restore = () => {
                    const reachable = document.documentElement.scrollHeight - window.innerHeight >= target
                    if (reachable || tries++ > 60) {
                        window.scrollTo({ top: target, left: 0, behavior: 'instant' })
                        return
                    }
                    frame = requestAnimationFrame(restore)
                }
                restore()
                return () => cancelAnimationFrame(frame)
            }
        }
        if (hash) {
            const timer = setTimeout(() => {
                document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
            }, 0)
            return () => clearTimeout(timer)
        }
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
        return undefined
    }, [key, hash, navType])

    return null
}

// D-123: wake the Render backend only on routes that call it, at idle time,
// so a cold instance (6–11 s) never sits on the first-paint path elsewhere.
const BACKEND_ROUTES = /^\/(contact|booknow|support|payment-success|my-activity|my-supports|blog\/?$)/
function BackendWarmup() {
    const { pathname } = useLocation()
    const warmedRef = useRef(false)

    useEffect(() => {
        if (warmedRef.current || !BACKEND_ROUTES.test(pathname)) return undefined
        warmedRef.current = true
        const ping = () => { void pingBackend() }
        if ('requestIdleCallback' in window) {
            const id = window.requestIdleCallback(ping, { timeout: 2000 })
            return () => window.cancelIdleCallback(id)
        }
        const timer = window.setTimeout(ping, 1000)
        return () => window.clearTimeout(timer)
    }, [pathname])

    return null
}

function AnalyticsRouteTracker() {
    const { pathname, search } = useLocation()
    const lastRouteRef = useRef('')

    useEffect(() => {
        const routeKey = `${pathname}${search}`
        if (lastRouteRef.current === routeKey) {
            return
        }

        lastRouteRef.current = routeKey
        void trackPageView({ pathname, search })
    }, [pathname, search])

    return null
}

// Routes that should render without the chrome / footer (full-screen layouts)
const FULL_SCREEN_ROUTES = new Set([])

// The top chrome is transparent and fixed (var(--chrome-h)); the dock floats at
// the bottom, so the page reserves var(--dock-space) to keep the footer clear.
function AppLayout({ children }) {
    const { pathname } = useLocation()
    const isFullScreen = FULL_SCREEN_ROUTES.has(pathname)

    return (
        <div className="App">
            <a href="#main-content" className="skip-link">Skip to content</a>
            {!isFullScreen && <TopChrome />}
            <div
                id="main-content"
                tabIndex={-1}
                style={isFullScreen ? undefined : { paddingTop: 'var(--chrome-h)', paddingBottom: 'var(--dock-space)' }}
            >
                {children}
                {!isFullScreen && <Footer />}
            </div>
            {!isFullScreen && <Dock />}
        </div>
    )
}

AppLayout.propTypes = {
    children: PropTypes.node.isRequired,
}

function AppRoutes() {
    const location = useLocation()
    return (
        <Routes location={location} key={location.pathname}>
            <Route path="/"                           element={<R><Home /></R>} />
            <Route path="/about"                      element={<R><About /></R>} />
            <Route path="/journey"                    element={<R><Journey /></R>} />
            <Route path="/skills"                     element={<R><Skills /></R>} />
            <Route path="/projects"                   element={<R><Projects /></R>} />
            <Route path="/projects/:slug"              element={<R><ProjectDetail /></R>} />
            <Route path="/blog"                       element={<R><Blog /></R>} />
            <Route path="/blog/:slug"                 element={<R><BlogPost /></R>} />
            <Route path="/updates"                    element={<R><Updates /></R>} />
            <Route path="/services"                   element={<R><Services /></R>} />
            <Route path="/services/:slug"             element={<R><ServiceDetail /></R>} />
            <Route path="/booknow"                    element={<R><BookNow /></R>} />
            <Route path="/support"                    element={<R><Support /></R>} />
            <Route path="/payment-success/:transactionId" element={<R><PaymentSuccess /></R>} />
            <Route path="/payment-success"            element={<R><PaymentSuccess /></R>} />
            <Route path="/frontend-development"       element={<R><ServiceDetail forcedSlug="frontend-development" /></R>} />
            <Route path="/backend-development"        element={<R><ServiceDetail forcedSlug="backend-development" /></R>} />
            <Route path="/full-stack-development"     element={<R><ServiceDetail forcedSlug="fullstack-development" /></R>} />
            <Route path="/ai-data-science-guidance"   element={<R><ServiceDetail forcedSlug="ai-data-guidance" /></R>} />
            <Route path="/contact"                    element={<R><Contact /></R>} />
            <Route path="/my-activity"               element={<R><ActivityTimeline /></R>} />
            <Route path="/my-supports"                element={<R><ActivityTimeline /></R>} />
            <Route path="/admin"                      element={<R><AdminRedirect /></R>} />
            <Route path="/privacy"                    element={<R><Privacy /></R>} />
            <Route path="/terms"                      element={<R><Terms /></R>} />
            <Route path="/refund"                     element={<R><Refund /></R>} />
            {Kit ? <Route path="/_kit" element={<R><Kit /></R>} /> : null}
            <Route path="*"                           element={<R><NotFound /></R>} />
        </Routes>
    )
}

function App() {
    const [isPaletteOpen, setIsPaletteOpen] = useState(false)
    // The palette (and its search index over every data file) is a lazy chunk:
    // mounted on first open, prefetched on intent (D-056, D-125).
    const [paletteMounted, setPaletteMounted] = useState(false)

    // ⌘/Ctrl+K toggles; the dock and other components open it with an event.
    useEffect(() => {
        const open = () => {
            setPaletteMounted(true)
            setIsPaletteOpen(true)
        }
        const onKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault()
                setPaletteMounted(true)
                setIsPaletteOpen((wasOpen) => !wasOpen)
            }
        }
        window.addEventListener('open-command-palette', open)
        window.addEventListener('keydown', onKeyDown)
        return () => {
            window.removeEventListener('open-command-palette', open)
            window.removeEventListener('keydown', onKeyDown)
        }
    }, [])

    // Chat: mounted on first open (the chunk was prefetched on intent).
    const [chat, setChat] = useState({ mounted: false, open: false, question: '', opener: null })
    useEffect(() => {
        const onOpen = (event) => setChat({
            mounted: true,
            open: true,
            question: event.detail?.question || '',
            opener: document.activeElement instanceof HTMLElement ? document.activeElement : null,
        })
        window.addEventListener(OPEN_CHAT_EVENT, onOpen)
        return () => window.removeEventListener(OPEN_CHAT_EVENT, onOpen)
    }, [])
    const closeChat = useCallback(() => setChat((c) => ({ ...c, open: false, question: '' })), [])

    // Prefetch on intent, not at idle (D-125): holding ⌘/Ctrl (the K follows)
    // or hovering the dock's Search item. The keydown above still opens it on
    // the first ⌘K even if the chunk has not arrived; Suspense covers the gap.
    useEffect(() => {
        let fetched = false
        const prefetch = () => {
            if (fetched) return
            fetched = true
            loadCommandPalette().catch(() => { fetched = false })
        }
        const onKeyDown = (e) => {
            if (e.key === 'Meta' || e.key === 'Control') prefetch()
        }
        window.addEventListener('keydown', onKeyDown, { passive: true })
        window.addEventListener('prefetch-command-palette', prefetch)
        return () => {
            window.removeEventListener('keydown', onKeyDown)
            window.removeEventListener('prefetch-command-palette', prefetch)
        }
    }, [])

    // Initialize analytics silently in the background
    useEffect(() => {
        initializeAnalytics()
    }, [])

    return (
        <>
            <Router>
                {/* framer-motion follows the OS reduced-motion setting everywhere */}
                <MotionConfig reducedMotion="user">
                <ScrollManager />
                <AnalyticsRouteTracker />
                <BackendWarmup />
                {paletteMounted ? (
                    <Suspense fallback={null}>
                        <CommandPalette isOpen={isPaletteOpen} onClose={() => setIsPaletteOpen(false)} />
                    </Suspense>
                ) : null}
                {chat.mounted ? (
                    <Suspense fallback={null}>
                        <ChatSurface open={chat.open} question={chat.question} onClose={closeChat} returnFocusTo={chat.opener} />
                    </Suspense>
                ) : null}
                <NetworkStatusBanner />
                <RouteWipe />
                <Cursor />
                <Toaster
                    position="top-center"
                    reverseOrder={false}
                    toastOptions={{
                        duration: 4000,
                        // v2 tokens: ink-raised surface, rule hairline, no shadow
                        style: {
                            background: 'rgb(var(--ink-raised))',
                            color: 'rgb(var(--paper))',
                            border: '1px solid rgb(var(--rule))',
                            borderRadius: 'var(--radius-dialog)',
                            boxShadow: 'none',
                            padding: '16px',
                            fontSize: '14px',
                            fontWeight: '500',
                        },
                        success: {
                            iconTheme: {
                                primary: 'rgb(var(--paper))',
                                secondary: 'rgb(var(--ink))',
                            },
                        },
                        error: {
                            iconTheme: {
                                primary: '#ef4444',
                                secondary: 'rgb(var(--ink))',
                            },
                        },
                        loading: {
                            iconTheme: {
                                primary: 'rgb(var(--paper))',
                                secondary: 'rgb(var(--rule))',
                            },
                        },
                    }}
                />
                <ErrorBoundary>
                    <AppLayout>
                        <AppRoutes />
                    </AppLayout>
                </ErrorBoundary>
                </MotionConfig>

            </Router>
        </>
    )
}

export default App

// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { useState, useEffect, useRef, lazy, Suspense } from 'react'
import { MotionConfig } from 'framer-motion'
import PropTypes from 'prop-types'

import { Toaster } from 'react-hot-toast'
import './App.css'
import './components/journey/JourneyNavigator.css'
import './pages/Blog.css'
import './pages/BlogPost.css'
import Footer from './components/Footer'
import ErrorBoundary from './components/ErrorBoundary'
import TopChrome from './components/chrome/TopChrome'
import Dock from './components/chrome/Dock'
import Cursor from './components/chrome/Cursor'
import RouteWipe from './components/chrome/RouteWipe'
import NetworkStatusBanner from './components/NetworkStatusBanner'
import { pingBackend } from './utils/backendPing'
import { initializeAnalytics, trackPageView } from './utils/analytics'
import { Projects, ProjectDetail } from './lib/routeChunks'

import Home from './pages/Home'

const loadCommandPalette = () => import('./components/CommandPalette')
const CommandPalette = lazy(loadCommandPalette)

// Lazy load secondary routes for better performance
const About = lazy(() => import('./pages/About'))
const Skills = lazy(() => import('./pages/Skills'))

// Projects and ProjectDetail come from src/lib/routeChunks.js (static route
// shells, D-057). Pre-fetch Blog and Projects chunks immediately so they're
// ready before the user navigates — eliminates the Suspense spinner + CSS-animation race that
// causes a blank page on first navigation to these pages.
const _blogChunk     = import('./pages/Blog')
void Projects.preload()
const Blog     = lazy(() => _blogChunk)
const BlogPost = lazy(() => import('./pages/BlogPost'))
const Contact = lazy(() => import('./pages/Contact'))
const Services = lazy(() => import('./pages/Services'))
const ServiceDetail = lazy(() => import('./pages/ServiceDetail'))
const ActivityTimeline = lazy(() => import('./pages/ActivityTimeline'))
const BookNow = lazy(() => import('./pages/BookNow'))
const Support = lazy(() => import('./pages/Support'))
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'))
const Journey = lazy(() => import('./pages/Journey'))
const Updates = lazy(() => import('./pages/Updates'))
const Privacy = lazy(() => import('./pages/Privacy'))
const Terms = lazy(() => import('./pages/Terms'))
const Refund = lazy(() => import('./pages/Refund'))
const NotFound = lazy(() => import('./pages/NotFound'))
const AdminRedirect = lazy(() => import('./pages/AdminRedirect'))
// Dev-only UI kit sheet; the DEV check removes it (and its chunk) from production builds.
const Kit = import.meta.env.DEV ? lazy(() => import('./pages/_Kit')) : null

// Per-route loading fallback: an empty page-height block (the route wipe
// covers the swap), announced to screen readers.
const PageLoader = () => (
    <div className="min-h-screen" role="status">
        <span className="sr-only">Loading page…</span>
    </div>
)

// Each route gets its own Suspense so a lazy chunk never blanks the whole shell.
function R({ children }) {
    return <Suspense fallback={<PageLoader />}>{children}</Suspense>
}

R.propTypes = {
    children: PropTypes.node.isRequired,
}

function ScrollToTop() {
    const { pathname, hash } = useLocation()

    useEffect(() => {
        if (hash) {
            setTimeout(() => {
                const element = document.querySelector(hash)
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' })
                }
            }, 0)
        } else {
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
        }
    }, [pathname, hash])

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
    // mounted on first open, prefetched once the browser is idle (D-056).
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

    useEffect(() => {
        const prefetch = () => { loadCommandPalette().catch(() => {}) }
        if ('requestIdleCallback' in window) {
            const id = window.requestIdleCallback(prefetch, { timeout: 4000 })
            return () => window.cancelIdleCallback(id)
        }
        const timer = window.setTimeout(prefetch, 3000)
        return () => window.clearTimeout(timer)
    }, [])

    // Ping backend & initialize analytics silently in the background
    useEffect(() => {
        pingBackend()
        initializeAnalytics()
    }, [])

    return (
        <>
            <Router>
                {/* framer-motion follows the OS reduced-motion setting everywhere */}
                <MotionConfig reducedMotion="user">
                <ScrollToTop />
                <AnalyticsRouteTracker />
                {paletteMounted ? (
                    <Suspense fallback={null}>
                        <CommandPalette isOpen={isPaletteOpen} onClose={() => setIsPaletteOpen(false)} />
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

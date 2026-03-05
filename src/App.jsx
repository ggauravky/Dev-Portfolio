// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { useState, useEffect, lazy, Suspense } from 'react'
import { AnimatePresence } from 'framer-motion'

// ─── Copyright watermark — embedded in the compiled bundle ───────────────────
// Visible in DevTools Console to anyone who inspects the running app.
console.log(
    '%c© 2026 Gaurav Kumar Yadav — All Rights Reserved.',
    'color:#60a5fa;font-weight:bold;font-size:15px;font-family:monospace;'
)
console.log(
    '%cUnauthorized copying, modification, or redistribution is strictly prohibited.\n%cSee: https://github.com/ggauravky/Dev-Portfolio/blob/main/LICENSE',
    'color:#f87171;font-size:12px;font-family:monospace;',
    'color:#94a3b8;font-size:11px;font-family:monospace;'
)
// ─────────────────────────────────────────────────────────────────────────────
import { Toaster } from 'react-hot-toast'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import './App.css'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import BackToTop from './components/BackToTop'
import ErrorBoundary from './components/ErrorBoundary'
import PageTransition from './components/PageTransition'
import SplashScreen from './components/SplashScreen'
import CursorSpotlight from './components/CursorSpotlight'
import AvailabilityBanner from './components/AvailabilityBanner'
import { pingBackend } from './utils/backendPing'

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))
const Skills = lazy(() => import('./pages/Skills'))

// Pre-fetch Blog and Projects chunks immediately so they're ready before the
// user navigates — eliminates the Suspense spinner + CSS-animation race that
// causes a blank page on first navigation to these pages.
const _blogChunk     = import('./pages/Blog')
const _projectsChunk = import('./pages/Projects')
const Blog     = lazy(() => _blogChunk)
const Projects = lazy(() => _projectsChunk)
const BlogPost = lazy(() => import('./pages/BlogPost'))
const Contact = lazy(() => import('./pages/Contact'))
const Lab = lazy(() => import('./pages/Lab'))
const GauravChatbot = lazy(() => import('./pages/lab/GauravChatbot'))
const MlDemos = lazy(() => import('./pages/lab/MlDemos'))
const ConsistencyDashboard = lazy(() => import('./pages/lab/ConsistencyDashboard'))
const Links = lazy(() => import('./pages/Links'))
const Privacy = lazy(() => import('./pages/Privacy'))
const Terms = lazy(() => import('./pages/Terms'))
const NotFound = lazy(() => import('./pages/NotFound'))
const AdminRedirect = lazy(() => import('./pages/AdminRedirect'))
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'))

// Per-route loading fallback — keeps loading state isolated per route
// so AnimatePresence exit animations are never interrupted by a Suspense bubble
const PageLoader = () => (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-slate-300 font-medium">Loading...</p>
        </div>
    </div>
)

// Wraps each route with its own Suspense so lazy loading never bubbles
// past AnimatePresence and causes a blank screen during page transitions
function R({ children }) {
    return (
        <PageTransition>
            <Suspense fallback={<PageLoader />}>
                {children}
            </Suspense>
        </PageTransition>
    )
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

// Routes that should render without Navbar / Footer (full-screen layouts)
const FULL_SCREEN_ROUTES = ['/lab/gaurav-chatbot']

function AppLayout({ children }) {
    const { pathname } = useLocation()
    const isFullScreen = FULL_SCREEN_ROUTES.includes(pathname)
    return (
        <div className="App">
            {!isFullScreen && <AvailabilityBanner />}
            {!isFullScreen && <Navbar />}
            {children}
            {!isFullScreen && <Footer />}
            {!isFullScreen && <BackToTop />}
        </div>
    )
}

function AnimatedRoutes() {
    const location = useLocation()
    return (
        <AnimatePresence mode="sync">
            <Routes location={location} key={location.pathname}>
                <Route path="/"                           element={<R><Home /></R>} />
                <Route path="/about"                      element={<R><About /></R>} />
                <Route path="/lab"                        element={<R><Lab /></R>} />
                <Route path="/lab/gaurav-chatbot"         element={<R><GauravChatbot /></R>} />
                <Route path="/lab/ml-demos"               element={<R><MlDemos /></R>} />
                <Route path="/lab/consistency-dashboard"  element={<R><ConsistencyDashboard /></R>} />
                <Route path="/skills"                     element={<R><Skills /></R>} />
                <Route path="/projects"                   element={<R><Projects /></R>} />
                <Route path="/projects/:slug"              element={<R><ProjectDetail /></R>} />
                <Route path="/blog"                       element={<R><Blog /></R>} />
                <Route path="/blog/:slug"                 element={<R><BlogPost /></R>} />
                <Route path="/contact"                    element={<R><Contact /></R>} />
                <Route path="/links"                      element={<R><Links /></R>} />
                <Route path="/admin"                      element={<R><AdminRedirect /></R>} />
                <Route path="/privacy"                    element={<R><Privacy /></R>} />
                <Route path="/terms"                      element={<R><Terms /></R>} />
                <Route path="*"                           element={<R><NotFound /></R>} />
            </Routes>
        </AnimatePresence>
    )
}

function App() {
    // Show splash screen only once per browser session
    const [appReady, setAppReady] = useState(() => !!sessionStorage.getItem('splashShown'))

    const handleSplashDone = () => {
        sessionStorage.setItem('splashShown', '1')
        setAppReady(true)
    }

    // Ping backend as soon as JS loads (even during splash)
    useEffect(() => {
        pingBackend()
    }, [])

    if (!appReady) {
        return <SplashScreen onDone={handleSplashDone} />
    }

    return (
        <Router>
            <CursorSpotlight />
            <ScrollToTop />
            <Toaster
                position="top-center"
                reverseOrder={false}
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#1e293b',
                        color: '#e2e8f0',
                        border: '1px solid #475569',
                        borderRadius: '12px',
                        padding: '16px',
                        fontSize: '14px',
                        fontWeight: '500',
                    },
                    success: {
                        iconTheme: {
                            primary: '#10b981',
                            secondary: '#fff',
                        },
                        style: {
                            border: '1px solid #10b981',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#fff',
                        },
                        style: {
                            border: '1px solid #ef4444',
                        },
                    },
                    loading: {
                        iconTheme: {
                            primary: '#3b82f6',
                            secondary: '#fff',
                        },
                    },
                }}
            />
            <ErrorBoundary>
                <AppLayout>
                    <AnimatedRoutes />
                </AppLayout>
            </ErrorBoundary>

            {/* Vercel Analytics & Speed Insights */}
            <Analytics />
            <SpeedInsights />   

        </Router>
    )
}

export default App

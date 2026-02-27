import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { useState, useEffect, lazy, Suspense } from 'react'
import { AnimatePresence } from 'framer-motion'
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
import { pingBackend } from './utils/backendPing'

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))
const Skills = lazy(() => import('./pages/Skills'))
const Projects = lazy(() => import('./pages/Projects'))
const Blog = lazy(() => import('./pages/Blog'))
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
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route path="/"                           element={<PageTransition><Home /></PageTransition>} />
                <Route path="/about"                      element={<PageTransition><About /></PageTransition>} />
                <Route path="/lab"                        element={<PageTransition><Lab /></PageTransition>} />
                <Route path="/lab/gaurav-chatbot"         element={<PageTransition><GauravChatbot /></PageTransition>} />
                <Route path="/lab/ml-demos"               element={<PageTransition><MlDemos /></PageTransition>} />
                <Route path="/lab/consistency-dashboard"  element={<PageTransition><ConsistencyDashboard /></PageTransition>} />
                <Route path="/skills"                     element={<PageTransition><Skills /></PageTransition>} />
                <Route path="/projects"                   element={<PageTransition><Projects /></PageTransition>} />
                <Route path="/blog"                       element={<PageTransition><Blog /></PageTransition>} />
                <Route path="/blog/:slug"                 element={<PageTransition><BlogPost /></PageTransition>} />
                <Route path="/contact"                    element={<PageTransition><Contact /></PageTransition>} />
                <Route path="/links"                      element={<PageTransition><Links /></PageTransition>} />
                <Route path="/admin"                      element={<PageTransition><AdminRedirect /></PageTransition>} />
                <Route path="/privacy"                    element={<PageTransition><Privacy /></PageTransition>} />
                <Route path="/terms"                      element={<PageTransition><Terms /></PageTransition>} />
                <Route path="*"                           element={<PageTransition><NotFound /></PageTransition>} />
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
                    <Suspense fallback={
                        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                            <div className="text-center">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                                <p className="mt-4 text-slate-300 font-medium">Loading...</p>
                            </div>
                        </div>
                    }>
                        <AnimatedRoutes />
                    </Suspense>
                </AppLayout>
            </ErrorBoundary>

            {/* Vercel Analytics & Speed Insights */}
            <Analytics />
            <SpeedInsights />   

        </Router>
    )
}

export default App

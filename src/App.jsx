import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'
import { Toaster } from 'react-hot-toast'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'   // ✅ ADDED
import './App.css'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import BackToTop from './components/BackToTop'
import ErrorBoundary from './components/ErrorBoundary'
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

function App() {
    useEffect(() => {
        pingBackend()
    }, [])

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
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/about" element={<About />} />
                            <Route path="/lab" element={<Lab />} />
                            <Route path="/lab/gaurav-chatbot" element={<GauravChatbot />} />
                            <Route path="/lab/ml-demos" element={<MlDemos />} />
                            <Route path="/lab/consistency-dashboard" element={<ConsistencyDashboard />} />
                            <Route path="/skills" element={<Skills />} />
                            <Route path="/projects" element={<Projects />} />
                            <Route path="/blog" element={<Blog />} />
                            <Route path="/blog/:slug" element={<BlogPost />} />
                            <Route path="/contact" element={<Contact />} />
                            <Route path="/links" element={<Links />} />
                            <Route path="/admin" element={<AdminRedirect />} />
                            <Route path="/privacy" element={<Privacy />} />
                            <Route path="/terms" element={<Terms />} />
                            <Route path="*" element={<NotFound />} />
                        </Routes>
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

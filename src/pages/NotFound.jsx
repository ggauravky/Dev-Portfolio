// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import useSEO from '../hooks/useSEO'

// Defined outside component to avoid recreating on every render
const funMessages = [
    "The page you're looking for seems to have vanished into the void... 🕳️",
    "Houston, we have a 404 problem! 🚀",
    "This page is on a coffee break... indefinitely ☕",
    "The intern deleted this page. We're looking for them now... 🔍",
    "Page.exe has stopped working 💻",
    "Even Google can't find this page 🤷‍♂️"
]

function NotFound() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
    const [countdown, setCountdown] = useState(10)
    const [easterEggFound, setEasterEggFound] = useState(false)
    const [clickCount, setClickCount] = useState(0)
    const [konami, setKonami] = useState([])
    const [showSecret, setShowSecret] = useState(false)

    const [currentMessage, setCurrentMessage] = useState(0)

    useSEO({
        title: '404 - Page Not Found | Gaurav Kumar Yadav',
        description: 'Oops! The page you\'re looking for doesn\'t exist. Navigate back to Gaurav Kumar Yadav\'s portfolio homepage.',
        keywords: '404, Page Not Found, Error Page',
        ogImage: 'https://ggauravky.vercel.app/images/profile.jpg'
    })

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY })
        }
        globalThis.addEventListener('mousemove', handleMouseMove)
        return () => globalThis.removeEventListener('mousemove', handleMouseMove)
    }, [])

    // Countdown timer
    useEffect(() => {
        if (countdown > 0 && !easterEggFound) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
            return () => clearTimeout(timer)
        } else if (countdown === 0 && !easterEggFound) {
            globalThis.location.href = '/'
        }
    }, [countdown, easterEggFound])

    // Rotate messages every 3 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentMessage((prev) => (prev + 1) % funMessages.length)
        }, 3000)
        return () => clearInterval(interval)
    }, [])

    // Secret Word Easter Egg - Type "gaurav"
    useEffect(() => {
        const secretWord = 'gaurav'

        const handleKeyPress = (e) => {
            // Only capture letter keys
            if (e.key.length === 1 && /[a-z]/i.test(e.key)) {
                const newKonami = [...konami, e.key.toLowerCase()]
                setKonami(newKonami.slice(-6)) // Keep only last 6 characters

                // Check if last 6 characters spell "gaurav"
                if (newKonami.slice(-6).join('') === secretWord) {
                    setShowSecret(true)
                    setTimeout(() => setShowSecret(false), 5000)
                }
            }
        }

        globalThis.addEventListener('keydown', handleKeyPress)
        return () => globalThis.removeEventListener('keydown', handleKeyPress)
    }, [konami])

    // Calculate eye position based on mouse
    const calculateEyePosition = (eyeX, eyeY) => {
        const dx = mousePosition.x - eyeX
        const dy = mousePosition.y - eyeY
        const angle = Math.atan2(dy, dx)
        const distance = Math.min(8, Math.hypot(dx, dy) / 50)
        return {
            x: Math.cos(angle) * distance,
            y: Math.sin(angle) * distance
        }
    }

    // Easter egg - click 404 multiple times
    const handle404Click = () => {
        const newCount = clickCount + 1
        setClickCount(newCount)

        if (newCount === 5) {
            setEasterEggFound(true)
        }
    }

    // Safe window check for SSR compatibility
    const browserWindow = globalThis.window
    const centerX = browserWindow ? browserWindow.innerWidth / 2 : 400
    const centerY = browserWindow ? browserWindow.innerHeight / 2 : 300

    const leftEye = calculateEyePosition(centerX - 50, centerY - 50)
    const rightEye = calculateEyePosition(centerX + 50, centerY - 50)

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center px-6 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900"></div>
            <div className="absolute top-20 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

            <div className="relative z-10 max-w-4xl w-full text-center">
                {/* Secret Easter Egg Message */}
                {showSecret && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-20 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-4 rounded-2xl shadow-2xl animate-bounce z-50 border-4 border-yellow-300">
                        <p className="text-xl font-bold">🎉 Secret Name Unlocked! ✨</p>
                        <p className="text-sm mt-1">You found the secret! Welcome to Gaurav's world! 🚀</p>
                    </div>
                )}

                {/* Easter Egg Found Message */}
                {easterEggFound && (
                    <div className="mb-8 bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm border-2 border-green-500 p-6 rounded-2xl animate-pulse">
                        <p className="text-2xl font-bold text-green-400 mb-2">🎉 Easter Egg Found! 🥚</p>
                        <p className="text-green-300">You clicked the 404 five times! Auto-redirect paused. You're curious, I like that! 😎</p>
                    </div>
                )}

                {/* 404 with Eyes */}
                <div className="mb-8 relative">
                    <button
                        type="button"
                        onClick={handle404Click}
                        className="text-[200px] md:text-[280px] font-black leading-none bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent select-none cursor-pointer hover:scale-105 transition-transform duration-300 bg-transparent border-0 p-0"
                        title="Click me 5 times 😉"
                        aria-label="Interactive 404 heading"
                    >
                        {'4'}
                        <span className="relative inline-block">
                            <span className="relative">
                                {'0'}
                                {/* Eyes */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    {/* Left Eye */}
                                    <div className="absolute" style={{ left: '35%', top: '45%' }}>
                                        <div className="w-8 h-8 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center">
                                            <div
                                                className="w-3 h-3 md:w-5 md:h-5 bg-slate-900 rounded-full transition-transform duration-100"
                                                style={{
                                                    transform: `translate(${leftEye.x}px, ${leftEye.y}px)`
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                    {/* Right Eye */}
                                    <div className="absolute" style={{ right: '35%', top: '45%' }}>
                                        <div className="w-8 h-8 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center">
                                            <div
                                                className="w-3 h-3 md:w-5 md:h-5 bg-slate-900 rounded-full transition-transform duration-100"
                                                style={{
                                                    transform: `translate(${rightEye.x}px, ${rightEye.y}px)`
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </span>
                        </span>
                        {'4'}
                    </button>

                    {/* Glitch Effect Text */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <p className="text-2xl md:text-4xl font-bold text-red-500 opacity-20 animate-pulse" style={{
                            textShadow: '2px 2px #00ff00, -2px -2px #ff00ff',
                            animation: 'glitch 1s infinite'
                        }}>
                            ERROR
                        </p>
                    </div>
                </div>

                {/* Message */}
                <div className="space-y-6 animate-fade-in">
                    <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
                        Oops! Page Not Found
                    </h2>
                    <p className="text-xl md:text-2xl text-slate-400 mb-6 transition-all duration-500">
                        {funMessages[currentMessage]}
                    </p>
                    <p className="text-lg text-slate-500">
                        Don't worry, even the best developers get lost sometimes! 🧭
                    </p>

                    {/* Click Counter Hint */}
                    {clickCount > 0 && clickCount < 5 && (
                        <p className="text-sm text-blue-400 animate-pulse">
                            🤔 Keep clicking the 404... ({clickCount}/5)
                        </p>
                    )}

                    {/* Fun Messages */}
                    <div className="flex flex-wrap justify-center gap-4 mt-8 mb-8">
                        <div className="bg-slate-800/50 backdrop-blur-sm px-6 py-3 rounded-full border border-slate-700/50 hover:border-red-500 transition-colors duration-300 hover:scale-110 transform">
                            <span className="text-red-400">❌ Status Code:</span>
                            <span className="text-white font-bold ml-2">404</span>
                        </div>
                        <div className="bg-slate-800/50 backdrop-blur-sm px-6 py-3 rounded-full border border-slate-700/50 hover:border-purple-500 transition-colors duration-300 hover:scale-110 transform">
                            <span className="text-purple-400">🤖 AI Analysis:</span>
                            <span className="text-white font-bold ml-2">Lost in Space</span>
                        </div>
                        <div className="bg-slate-800/50 backdrop-blur-sm px-6 py-3 rounded-full border border-slate-700/50 hover:border-yellow-500 transition-colors duration-300 hover:scale-110 transform">
                            <span className="text-yellow-400">⚠️ Error Type:</span>
                            <span className="text-white font-bold ml-2">Not Found</span>
                        </div>
                    </div>

                    {/* Countdown Timer */}
                    {!easterEggFound && (
                        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 inline-block hover:border-blue-500 transition-all duration-300">
                            <p className="text-slate-300 mb-2">Redirecting to homepage in</p>
                            <div className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
                                {countdown}
                            </div>
                            <p className="text-slate-500 text-sm mt-2">seconds</p>
                            <button
                                onClick={() => setEasterEggFound(true)}
                                className="mt-3 text-xs text-slate-500 hover:text-blue-400 underline transition-colors"
                            >
                                Cancel redirect
                            </button>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                        <Link
                            to="/"
                            className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/50 text-lg overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                🏠 Take Me Home
                                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </Link>

                        <Link
                            to="/projects"
                            className="group px-8 py-4 border-2 border-cyan-500 rounded-xl font-semibold hover:bg-cyan-500 hover:bg-opacity-20 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/50 text-lg backdrop-blur-sm"
                        >
                            <span className="flex items-center justify-center gap-2">
                                🚀 View Projects
                            </span>
                        </Link>

                        <Link
                            to="/contact"
                            className="group px-8 py-4 border-2 border-purple-500 rounded-xl font-semibold hover:bg-purple-500 hover:bg-opacity-20 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/50 text-lg backdrop-blur-sm"
                        >
                            <span className="flex items-center justify-center gap-2">
                                📧 Contact Me
                            </span>
                        </Link>
                    </div>

                    {/* Helpful Links */}
                    <div className="mt-12 pt-8 border-t border-slate-800/50">
                        <p className="text-slate-400 mb-4 flex items-center justify-center gap-2">
                            <span className="text-2xl">🔗</span>
                            {' '}
                            Maybe you were looking for:
                        </p>
                        <div className="flex flex-wrap justify-center gap-3">
                            <Link to="/about" className="text-blue-400 hover:text-blue-300 underline decoration-blue-400/30 hover:decoration-blue-300 transition-all hover:scale-110 inline-block">
                                About Me
                            </Link>
                            <span className="text-slate-600">•</span>
                            <Link to="/skills" className="text-purple-400 hover:text-purple-300 underline decoration-purple-400/30 hover:decoration-purple-300 transition-all hover:scale-110 inline-block">
                                Skills
                            </Link>
                            <span className="text-slate-600">•</span>
                            <Link to="/blog" className="text-pink-400 hover:text-pink-300 underline decoration-pink-400/30 hover:decoration-pink-300 transition-all hover:scale-110 inline-block">
                                Blog
                            </Link>
                            <span className="text-slate-600">•</span>
                            <Link to="/projects" className="text-cyan-400 hover:text-cyan-300 underline decoration-cyan-400/30 hover:decoration-cyan-300 transition-all hover:scale-110 inline-block">
                                Projects
                            </Link>
                            <span className="text-slate-600">•</span>
                            <Link to="/contact" className="text-green-400 hover:text-green-300 underline decoration-green-400/30 hover:decoration-green-300 transition-all hover:scale-110 inline-block">
                                Contact & Platforms
                            </Link>
                        </div>
                    </div>

                    {/* Fun Error Message */}
                    <div className="mt-8 text-slate-600 text-sm space-y-2">
                        <p className="flex items-center justify-center gap-2">
                            💡 <span className="font-semibold">Pro Tip:</span> Check the URL or use the navigation menu
                        </p>
                        <p className="italic text-slate-700">— Debugging life, one 404 at a time ☕</p>
                        <p className="text-xs text-slate-700 mt-4">
                            🎮 <span className="text-purple-400">Easter Egg Hint:</span> Try typing the creator's name...
                        </p>
                    </div>
                </div>

                {/* Floating Code Snippets */}
                <div className="absolute top-20 left-10 opacity-20 text-blue-400 font-mono text-sm animate-float hidden md:block">
                    {'{ status: 404 }'}
                </div>
                <div className="absolute bottom-20 right-10 opacity-20 text-purple-400 font-mono text-sm animate-float hidden md:block" style={{ animationDelay: '1s' }}>
                    {'throw new Error()'}
                </div>
            </div>

            <style>{`
                @keyframes glitch {
                    0%, 100% { 
                        transform: translate(0); 
                    }
                    25% { 
                        transform: translate(-2px, 2px); 
                    }
                    50% { 
                        transform: translate(2px, -2px); 
                    }
                    75% { 
                        transform: translate(-2px, -2px); 
                    }
                }
                
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-fade-in {
                    animation: fade-in 0.8s ease-out;
                }

                @keyframes float {
                    0%, 100% {
                        transform: translateY(0px);
                    }
                    50% {
                        transform: translateY(-20px);
                    }
                }

                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
            `}</style>
        </div>
    )
}

export default NotFound

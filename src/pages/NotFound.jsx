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
        <div className="min-h-screen bg-[#070708] flex items-center justify-center px-6 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-[#070708]"></div>
            <div className="absolute top-20 left-10 w-96 h-96 bg-[#ff5d00]/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#c5f82a]/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

            <div className="relative z-10 max-w-4xl w-full text-center">
                {/* Secret Easter Egg Message */}
                {showSecret && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-20 bg-[#16161a] text-white px-8 py-4 border border-[#ff5d00] rounded-md shadow-2xl animate-bounce z-50">
                        <p className="text-lg font-display font-bold">🎉 Secret Name Unlocked! ✨</p>
                        <p className="text-xs font-mono uppercase text-[#ff5d00] mt-1">You found the secret! Welcome to Gaurav's world! 🚀</p>
                    </div>
                )}

                {/* Easter Egg Found Message */}
                {easterEggFound && (
                    <div className="mb-8 bg-[#c5f82a]/5 backdrop-blur-sm border border-[#c5f82a] p-6 rounded-md animate-pulse">
                        <p className="text-xl font-display font-bold text-[#c5f82a] mb-2">🎉 Easter Egg Found! 🥚</p>
                        <p className="text-[#a1a1aa] text-sm leading-relaxed">You clicked the 404 five times! Auto-redirect paused. You're curious, I like that! 😎</p>
                    </div>
                )}

                {/* 404 with Eyes */}
                <div className="mb-8 relative">
                    <button
                        type="button"
                        onClick={handle404Click}
                        className="text-[200px] md:text-[280px] font-black leading-none bg-gradient-to-r from-[#c5f82a] via-[#ff5d00] to-[#c5f82a] bg-clip-text text-transparent select-none cursor-pointer hover:scale-105 transition-transform duration-300 bg-transparent border-0 p-0"
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
                                                className="w-3 h-3 md:w-5 md:h-5 bg-[#070708] rounded-full transition-transform duration-100"
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
                                                className="w-3 h-3 md:w-5 md:h-5 bg-[#070708] rounded-full transition-transform duration-100"
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
                        <p className="text-2xl md:text-4xl font-mono font-bold text-[#ff5d00] opacity-20 animate-pulse" style={{
                            textShadow: '2px 2px #c5f82a, -2px -2px #ff5d00',
                            animation: 'glitch 1s infinite'
                        }}>
                            ERROR
                        </p>
                    </div>
                </div>

                {/* Message */}
                <div className="space-y-6 animate-fade-in">
                    <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
                        Oops! Page Not Found
                    </h2>
                    <p className="text-xl md:text-2xl font-display text-[#a1a1aa] mb-6 transition-all duration-500">
                        {funMessages[currentMessage]}
                    </p>
                    <p className="text-sm text-[#a1a1aa]/80 font-mono uppercase tracking-wider">
                        Don't worry, even the best developers get lost sometimes! 🧭
                    </p>

                    {/* Click Counter Hint */}
                    {clickCount > 0 && clickCount < 5 && (
                        <p className="text-xs font-mono uppercase tracking-wider text-[#c5f82a] animate-pulse">
                            🤔 Keep clicking the 404... ({clickCount}/5)
                        </p>
                    )}

                    {/* Fun Messages */}
                    <div className="flex flex-wrap justify-center gap-4 mt-8 mb-8">
                        <div className="bg-[#0e0e11] backdrop-blur-sm px-6 py-3 rounded-md border border-[#1a1a22] hover:border-[#ff5d00]/50 transition-colors duration-300 transform">
                            <span className="text-[#ff5d00] font-mono text-xs uppercase tracking-wider">❌ Status:</span>
                            <span className="text-white font-mono text-xs uppercase font-bold ml-2">404</span>
                        </div>
                        <div className="bg-[#0e0e11] backdrop-blur-sm px-6 py-3 rounded-md border border-[#1a1a22] hover:border-[#c5f82a]/50 transition-colors duration-300 transform">
                            <span className="text-[#c5f82a] font-mono text-xs uppercase tracking-wider">🤖 AI Status:</span>
                            <span className="text-white font-mono text-xs uppercase font-bold ml-2">Lost in Space</span>
                        </div>
                        <div className="bg-[#0e0e11] backdrop-blur-sm px-6 py-3 rounded-md border border-[#1a1a22] hover:border-[#a1a1aa]/50 transition-colors duration-300 transform">
                            <span className="text-[#a1a1aa] font-mono text-xs uppercase tracking-wider">⚠️ Error:</span>
                            <span className="text-white font-mono text-xs uppercase font-bold ml-2">Not Found</span>
                        </div>
                    </div>

                    {/* Countdown Timer */}
                    {!easterEggFound && (
                        <div className="bg-[#0e0e11] backdrop-blur-sm p-6 rounded-md border border-[#1a1a22] inline-block hover:border-[#c5f82a]/30 transition-all duration-300">
                            <p className="text-xs font-mono uppercase tracking-wider text-[#a1a1aa] mb-2">Redirecting to homepage in</p>
                            <div className="text-5xl font-mono font-bold bg-gradient-to-r from-[#c5f82a] to-[#ff5d00] bg-clip-text text-transparent animate-pulse">
                                {countdown}
                            </div>
                            <p className="text-[#a1a1aa]/50 font-mono text-xs uppercase tracking-wider mt-2">seconds</p>
                            <button
                                onClick={() => setEasterEggFound(true)}
                                className="mt-3 text-[10px] font-mono uppercase tracking-wider text-[#a1a1aa]/50 hover:text-[#c5f82a] underline transition-colors"
                            >
                                Cancel redirect
                            </button>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                        <Link
                            to="/"
                            className="inline-flex items-center justify-center rounded-md bg-[#c5f82a] text-[#070708] border-none shadow-[2px_2px_0px_0px_rgba(197,248,42,0.3)] hover:shadow-none hover:translate-y-[2px] transition-all duration-200 font-mono text-xs uppercase font-bold px-8 py-4"
                        >
                            🏠 Take Me Home
                        </Link>

                        <Link
                            to="/projects"
                            className="rounded-md border border-[#1a1a22] text-[#a1a1aa] hover:text-[#c5f82a] hover:border-[#c5f82a]/30 font-mono text-xs uppercase px-8 py-4 transition-all duration-200 backdrop-blur-sm"
                        >
                            🚀 View Projects
                        </Link>

                        <Link
                            to="/contact"
                            className="rounded-md border border-[#1a1a22] text-[#a1a1aa] hover:text-[#ff5d00] hover:border-[#ff5d00]/30 font-mono text-xs uppercase px-8 py-4 transition-all duration-200 backdrop-blur-sm"
                        >
                            📧 Contact Me
                        </Link>
                    </div>

                    {/* Helpful Links */}
                    <div className="mt-12 pt-8 border-t border-[#1a1a22]">
                        <p className="text-[#a1a1aa] font-mono text-xs uppercase tracking-wider mb-4 flex items-center justify-center gap-2">
                            <span className="text-xl">🔗</span>
                            {' '}
                            Maybe you were looking for:
                        </p>
                        <div className="flex flex-wrap justify-center gap-3">
                            <Link to="/about" className="text-[#a1a1aa] hover:text-[#c5f82a] font-mono text-xs uppercase tracking-wider underline transition-all">
                                About Me
                            </Link>
                            <span className="text-[#242430] font-mono text-xs">/</span>
                            <Link to="/skills" className="text-[#a1a1aa] hover:text-[#c5f82a] font-mono text-xs uppercase tracking-wider underline transition-all">
                                Skills
                            </Link>
                            <span className="text-[#242430] font-mono text-xs">/</span>
                            <Link to="/blog" className="text-[#a1a1aa] hover:text-[#c5f82a] font-mono text-xs uppercase tracking-wider underline transition-all">
                                Blog
                            </Link>
                            <span className="text-[#242430] font-mono text-xs">/</span>
                            <Link to="/projects" className="text-[#a1a1aa] hover:text-[#c5f82a] font-mono text-xs uppercase tracking-wider underline transition-all">
                                Projects
                            </Link>
                            <span className="text-[#242430] font-mono text-xs">/</span>
                            <Link to="/contact" className="text-[#a1a1aa] hover:text-[#c5f82a] font-mono text-xs uppercase tracking-wider underline transition-all">
                                Contact &amp; Platforms
                            </Link>
                        </div>
                    </div>

                    {/* Agent / Crawler Discovery Links */}
                    <div className="mt-6 pt-5 border-t border-[#1a1a22]/50">
                        <p className="text-[#a1a1aa]/50 font-mono text-[10px] uppercase tracking-wider mb-3">
                            🤖 Machine-readable resources
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <a href="/sitemap.xml" className="text-[#a1a1aa]/50 hover:text-[#c5f82a] font-mono text-[10px] uppercase tracking-wider transition-colors">
                                /sitemap.xml
                            </a>
                            <a href="/llms.txt" className="text-[#a1a1aa]/50 hover:text-[#c5f82a] font-mono text-[10px] uppercase tracking-wider transition-colors">
                                /llms.txt
                            </a>
                            <a href="/openapi.json" className="text-[#a1a1aa]/50 hover:text-[#c5f82a] font-mono text-[10px] uppercase tracking-wider transition-colors">
                                /openapi.json
                            </a>
                            <Link to="/" className="text-[#a1a1aa]/50 hover:text-[#c5f82a] font-mono text-[10px] uppercase tracking-wider transition-colors">
                                / home
                            </Link>
                        </div>
                    </div>

                    {/* Fun Error Message */}
                    <div className="mt-8 text-[#a1a1aa]/60 text-xs font-mono space-y-1.5 leading-relaxed">
                        <p className="flex items-center justify-center gap-2">
                            💡 <span className="font-semibold">Pro Tip:</span> Check the URL or use the navigation menu
                        </p>
                        <p className="italic">— Debugging life, one 404 at a time ☕</p>
                        <p className="text-[10px] text-[#a1a1aa]/40 mt-4">
                            🎮 <span className="text-[#ff5d00]">Easter Egg Hint:</span> Try typing the creator's name...
                        </p>
                    </div>
                </div>

                {/* Floating Code Snippets */}
                <div className="absolute top-20 left-10 opacity-20 text-[#c5f82a] font-mono text-sm animate-float hidden md:block">
                    {'{ status: 404 }'}
                </div>
                <div className="absolute bottom-20 right-10 opacity-20 text-[#ff5d00] font-mono text-sm animate-float hidden md:block" style={{ animationDelay: '1s' }}>
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

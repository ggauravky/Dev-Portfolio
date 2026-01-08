import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import useSEO from '../hooks/useSEO'

function NotFound() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
    const [countdown, setCountdown] = useState(10)

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
        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [])

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
            return () => clearTimeout(timer)
        } else {
            window.location.href = '/'
        }
    }, [countdown])

    // Calculate eye position based on mouse
    const calculateEyePosition = (eyeX, eyeY) => {
        const dx = mousePosition.x - eyeX
        const dy = mousePosition.y - eyeY
        const angle = Math.atan2(dy, dx)
        const distance = Math.min(8, Math.sqrt(dx * dx + dy * dy) / 50)
        return {
            x: Math.cos(angle) * distance,
            y: Math.sin(angle) * distance
        }
    }

    // Safe window check for SSR compatibility
    const centerX = typeof window !== 'undefined' ? window.innerWidth / 2 : 400
    const centerY = typeof window !== 'undefined' ? window.innerHeight / 2 : 300

    const leftEye = calculateEyePosition(centerX - 50, centerY - 50)
    const rightEye = calculateEyePosition(centerX + 50, centerY - 50)

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center px-6 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900"></div>
            <div className="absolute top-20 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

            <div className="relative z-10 max-w-4xl w-full text-center">
                {/* 404 with Eyes */}
                <div className="mb-8 relative">
                    <h1 className="text-[200px] md:text-[280px] font-black leading-none bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent select-none">
                        4
                        <span className="relative inline-block">
                            <span className="relative">
                                0
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
                        4
                    </h1>

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
                    <p className="text-xl md:text-2xl text-slate-400 mb-6">
                        The page you're looking for seems to have vanished into the void... 🕳️
                    </p>
                    <p className="text-lg text-slate-500">
                        Don't worry, even the best developers get lost sometimes!
                    </p>

                    {/* Fun Messages */}
                    <div className="flex flex-wrap justify-center gap-4 mt-8 mb-8">
                        <div className="bg-slate-800/50 backdrop-blur-sm px-6 py-3 rounded-full border border-slate-700/50">
                            <span className="text-blue-400">🔍 Status Code:</span>
                            <span className="text-white font-bold ml-2">404</span>
                        </div>
                        <div className="bg-slate-800/50 backdrop-blur-sm px-6 py-3 rounded-full border border-slate-700/50">
                            <span className="text-purple-400">🤖 AI Analysis:</span>
                            <span className="text-white font-bold ml-2">Lost in Space</span>
                        </div>
                    </div>

                    {/* Countdown Timer */}
                    <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 inline-block">
                        <p className="text-slate-300 mb-2">Redirecting to homepage in</p>
                        <div className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            {countdown}
                        </div>
                        <p className="text-slate-500 text-sm mt-2">seconds</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                        <Link
                            to="/"
                            className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/50 text-lg"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                🏠 Go Home
                            </span>
                        </Link>

                        <Link
                            to="/projects"
                            className="group px-8 py-4 border-2 border-blue-500 rounded-xl font-semibold hover:bg-blue-500 hover:bg-opacity-20 transition-all duration-300 hover:scale-105 hover:shadow-xl text-lg backdrop-blur-sm"
                        >
                            <span className="flex items-center justify-center gap-2">
                                🚀 View Projects
                            </span>
                        </Link>

                        <Link
                            to="/contact"
                            className="group px-8 py-4 border-2 border-purple-500 rounded-xl font-semibold hover:bg-purple-500 hover:bg-opacity-20 transition-all duration-300 hover:scale-105 hover:shadow-xl text-lg backdrop-blur-sm"
                        >
                            <span className="flex items-center justify-center gap-2">
                                📧 Contact Me
                            </span>
                        </Link>
                    </div>

                    {/* Helpful Links */}
                    <div className="mt-12 pt-8 border-t border-slate-800/50">
                        <p className="text-slate-400 mb-4">Maybe you were looking for:</p>
                        <div className="flex flex-wrap justify-center gap-3">
                            <Link to="/about" className="text-blue-400 hover:text-blue-300 underline decoration-blue-400/30 hover:decoration-blue-300 transition-colors">
                                About Me
                            </Link>
                            <span className="text-slate-600">•</span>
                            <Link to="/skills" className="text-purple-400 hover:text-purple-300 underline decoration-purple-400/30 hover:decoration-purple-300 transition-colors">
                                Skills
                            </Link>
                            <span className="text-slate-600">•</span>
                            <Link to="/projects" className="text-cyan-400 hover:text-cyan-300 underline decoration-cyan-400/30 hover:decoration-cyan-300 transition-colors">
                                Projects
                            </Link>
                            <span className="text-slate-600">•</span>
                            <Link to="/links" className="text-green-400 hover:text-green-300 underline decoration-green-400/30 hover:decoration-green-300 transition-colors">
                                Find Me
                            </Link>
                        </div>
                    </div>

                    {/* Fun Error Message */}
                    <div className="mt-8 text-slate-600 text-sm">
                        <p>💡 Pro Tip: Check the URL or use the navigation above</p>
                        <p className="mt-2 italic">— Debugging life, one 404 at a time</p>
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

            <style jsx>{`
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

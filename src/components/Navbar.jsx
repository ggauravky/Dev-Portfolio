import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'

function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const location = useLocation()

    const navLinks = [
        { path: '/', name: 'Home' },
        { path: '/about', name: 'About' },
        { path: '/skills', name: 'Skills' },
        { path: '/projects', name: 'Projects' },
        { path: '/contact', name: 'Contact' },
        { path: '/links', name: 'Find Me' }
    ]

    const isActive = (path) => location.pathname === path

    return (
        <nav className="bg-slate-900/95 border-b border-slate-800/50 sticky top-0 z-50 backdrop-blur-md shadow-lg shadow-slate-900/50">
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link
                        to="/"
                        className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent hover:scale-105 transition-transform duration-300 flex items-center gap-1 sm:gap-2"
                    >
                        <span className="text-2xl sm:text-3xl">✨</span>
                        <span className="hidden sm:inline">Gaurav Kumar Yadav</span>
                        <span className="sm:hidden">Gaurav</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`px-3 xl:px-4 py-2 rounded-lg font-medium transition-all duration-300 relative group text-sm xl:text-base ${isActive(link.path)
                                    ? 'text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-purple-500/50'
                                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                                    }`}
                            >
                                {link.name}
                                {!isActive(link.path) && (
                                    <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
                                )}
                            </Link>
                        ))}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="lg:hidden text-slate-300 hover:text-white transition-colors duration-200 p-2"
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="lg:hidden mt-4 pb-4 space-y-2 animate-slideDown">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => setIsMenuOpen(false)}
                                className={`block px-4 py-3 rounded-lg font-medium transition-all duration-300 ${isActive(link.path)
                                    ? 'text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-purple-500/50'
                                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50 hover:translate-x-2'
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </nav>
    )
}

export default Navbar

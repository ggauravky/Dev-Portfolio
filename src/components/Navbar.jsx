import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect, useCallback, useMemo } from 'react'

function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const location = useLocation()

    const navLinks = useMemo(() => [
        { path: '/', name: 'Home' },
        { path: '/about', name: 'About' },
        { path: '/skills', name: 'Skills' },
        { path: '/projects', name: 'Projects' },
        { path: '/blog', name: 'Blog' },
        { path: '/contact', name: 'Contact' },
        { path: '/links', name: 'Find Me' }
    ], [])

    const isActive = useCallback((path) => location.pathname === path, [location.pathname])

    const closeMenu = useCallback(() => setIsMenuOpen(false), [])

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isMenuOpen && !event.target.closest('nav')) {
                closeMenu()
            }
        }

        if (isMenuOpen) {
            document.addEventListener('click', handleClickOutside)
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }

        return () => {
            document.removeEventListener('click', handleClickOutside)
            document.body.style.overflow = 'unset'
        }
    }, [isMenuOpen, closeMenu])

    useEffect(() => {
        closeMenu()
    }, [location, closeMenu])

    return (
        <>
            <nav className="bg-slate-900/90 border-b border-slate-700/50 sticky top-0 z-50 backdrop-blur-xl shadow-lg shadow-slate-900/30 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center justify-between">
                        <Link
                            to="/"
                            onClick={closeMenu}
                            className="group text-base sm:text-lg md:text-xl font-bold flex items-center gap-1 sm:gap-2 relative"
                        >
                            <span className="text-xl sm:text-2xl md:text-3xl group-hover:scale-125 transition-transform duration-300">✨</span>
                            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent group-hover:from-cyan-400 group-hover:via-blue-400 group-hover:to-purple-400 transition-all duration-500">
                                <span className="hidden sm:inline">Gaurav Kumar Yadav</span>
                                <span className="sm:hidden">Gaurav</span>
                            </span>
                            <div className="absolute -inset-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                        </Link>

                        <div className="hidden lg:flex items-center gap-1 xl:gap-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`relative px-3 xl:px-4 py-2.5 rounded-xl font-medium transition-all duration-300 text-sm xl:text-base group ${isActive(link.path)
                                        ? 'text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-purple-500/50 scale-105'
                                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                                        }`}
                                >
                                    {link.name}
                                    {!isActive(link.path) && (
                                        <>
                                            <span className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full"></span>
                                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                                        </>
                                    )}
                                </Link>
                            ))}
                        </div>

                        <a
                            href="/resume.pdf"
                            download
                            className="hidden lg:flex items-center gap-2 ml-2 xl:ml-3 px-4 xl:px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-cyan-500/40 hover:shadow-cyan-500/60 hover:scale-105 text-sm xl:text-base cursor-pointer whitespace-nowrap group relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                            <svg className="w-4 h-4 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            <span className="relative z-10">Resume</span>
                        </a>

                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                setIsMenuOpen(!isMenuOpen)
                            }}
                            className="lg:hidden text-slate-300 hover:text-white transition-colors duration-200 p-2 rounded-lg hover:bg-slate-800/50 relative z-50"
                            aria-label="Toggle menu"
                        >
                            <div className="w-6 h-5 flex flex-col justify-between">
                                <span className={`block h-0.5 w-full bg-current transform transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                                <span className={`block h-0.5 w-full bg-current transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
                                <span className={`block h-0.5 w-full bg-current transform transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
                            </div>
                        </button>
                    </div>
                </div>
            </nav>

            {isMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/70 backdrop-blur-md z-40 lg:hidden animate-fadeIn"
                    onClick={closeMenu}
                />
            )}

            <div className={`fixed top-0 right-0 h-full w-80 sm:w-96 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-l border-slate-700/50 shadow-2xl shadow-purple-500/20 z-40 lg:hidden transform transition-all duration-500 ease-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} overflow-y-auto`}>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-cyan-600/5"></div>
                <div className="relative flex flex-col h-full pt-20 px-6">
                    <div className="flex-1 space-y-3 overflow-y-auto pb-6">
                        {navLinks.map((link, index) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={closeMenu}
                                style={{ animationDelay: `${index * 60}ms` }}
                                className={`group block px-6 py-4 rounded-2xl font-semibold transition-all duration-300 animate-slideInRight relative overflow-hidden ${isActive(link.path)
                                    ? 'text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-purple-500/50 scale-105'
                                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60 hover:translate-x-2 hover:shadow-lg hover:shadow-blue-500/20'
                                    }`}
                            >
                                {!isActive(link.path) && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                )}
                                <div className="relative flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">
                                            {link.path === '/' && '🏠'}
                                            {link.path === '/about' && '👤'}
                                            {link.path === '/skills' && '⚡'}
                                            {link.path === '/projects' && '💼'}
                                            {link.path === '/blog' && '📝'}
                                            {link.path === '/contact' && '📬'}
                                            {link.path === '/links' && '🔗'}
                                        </span>
                                        <span>{link.name}</span>
                                    </div>
                                    {isActive(link.path) && (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>

                    <div className="px-2 pb-6 border-t border-slate-700/50 pt-6">
                        <a
                            href="/resume.pdf"
                            download
                            onClick={closeMenu}
                            className="group flex items-center justify-center gap-3 w-full px-6 py-5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-2xl transition-all duration-300 shadow-lg shadow-cyan-500/40 hover:shadow-cyan-500/60 hover:scale-105 cursor-pointer relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-400 opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                            <svg className="w-6 h-6 relative z-10 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            <span className="relative z-10">Download Resume</span>
                        </a>
                    </div>

                    <div className="py-4 border-t border-slate-700/50">
                        <p className="text-slate-400 text-sm text-center flex items-center justify-center gap-2">
                            Made with <span className="text-red-500 animate-pulse">❤️</span> by Gaurav
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Navbar

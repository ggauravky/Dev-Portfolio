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
            <nav className="bg-slate-900/95 border-b border-slate-800/50 sticky top-0 z-50 backdrop-blur-md shadow-lg shadow-slate-900/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center justify-between">
                        <Link
                            to="/"
                            onClick={closeMenu}
                            className="text-base sm:text-lg md:text-xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent hover:scale-105 transition-transform duration-300 flex items-center gap-1 sm:gap-2"
                        >
                            <span className="text-xl sm:text-2xl md:text-3xl">✨</span>
                            <span className="hidden sm:inline">Gaurav Kumar Yadav</span>
                            <span className="sm:hidden">Gaurav</span>
                        </Link>

                        <div className="hidden lg:flex items-center gap-1 xl:gap-2">
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

                        <a
                            href="/resume.pdf"
                            download
                            className="hidden lg:flex items-center gap-2 ml-2 xl:ml-3 px-4 xl:px-5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium rounded-lg transition-all duration-300 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105 text-sm xl:text-base cursor-pointer whitespace-nowrap"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            <span>Resume</span>
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
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={closeMenu}
                />
            )}

            <div className={`fixed top-0 right-0 h-full w-72 sm:w-80 bg-slate-900 border-l border-slate-800 shadow-2xl z-40 lg:hidden transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} overflow-y-auto`}>
                <div className="flex flex-col h-full pt-20 px-4">
                    <div className="flex-1 space-y-2 overflow-y-auto pb-4">
                        {navLinks.map((link, index) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={closeMenu}
                                style={{ animationDelay: `${index * 50}ms` }}
                                className={`block px-5 py-4 rounded-xl font-medium transition-all duration-300 animate-slideInRight ${isActive(link.path)
                                    ? 'text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-purple-500/50 transform scale-105'
                                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50 hover:translate-x-2'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span>{link.name}</span>
                                    {isActive(link.path) && (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>

                    <div className="px-4 pb-4 border-t border-slate-800 pt-4">
                        <a
                            href="/resume.pdf"
                            download
                            onClick={closeMenu}
                            className="flex items-center justify-center gap-2 w-full px-5 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-cyan-500/30 cursor-pointer"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download Resume
                        </a>
                    </div>

                    <div className="py-4 border-t border-slate-800">
                        <p className="text-slate-500 text-sm text-center">
                            Made with ❤️ by Gaurav
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Navbar

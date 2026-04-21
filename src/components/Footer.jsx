// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { Link } from 'react-router-dom'
import './Footer.css'

function Footer() {
    const footerLinks = {
        quickLinks: [
            { name: 'Home', path: '/' },
            { name: 'About', path: '/about' },
            { name: 'Projects', path: '/projects' },
            { name: 'Services', path: '/services' },
            { name: 'Blog', path: '/blog' },
            { name: 'Updates', path: '/updates' },
            { name: 'Skills', path: '/skills' },
            { name: 'Contact', path: '/contact' },
        ],
        legal: [
            { name: 'Privacy Policy', path: '/privacy' },
            { name: 'Terms of Service', path: '/terms' },
            { name: 'Refund Policy', path: '/refund' },
        ],
    }

    const handleBackToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    return (
        <footer className="footer-shell relative overflow-hidden border-t border-slate-700/60 bg-gradient-to-b from-slate-900 to-slate-950">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" aria-hidden="true" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-blue-950/25 via-slate-900/45 to-slate-900/65" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent" />
            <div className="pointer-events-none absolute -left-24 top-0 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl" />

            <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
                <div className="footer-main-grid grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-12 xl:grid-cols-3 xl:gap-16">
                    <section className="min-w-0 text-center md:text-left">
                        <h3 className="text-2xl font-black tracking-tight text-slate-100 sm:text-3xl">
                            Gaurav Kumar Yadav
                        </h3>
                        <p className="mt-3 text-sm font-semibold text-cyan-300 sm:text-base">
                            AI/ML & Web Developer building real-world projects
                        </p>
                        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-400 md:mx-0">
                            Building practical, user-focused digital products with modern frontend, data, and problem-solving workflows.
                        </p>
                    </section>

                    <section className="min-w-0 text-center md:text-left">
                        <h4 className="text-base font-bold uppercase tracking-[0.12em] text-slate-200 sm:text-lg">
                            Quick Navigation
                        </h4>
                        <nav aria-label="Footer quick navigation" className="mt-4">
                            <ul className="grid grid-cols-2 justify-items-center gap-x-4 gap-y-2 text-sm sm:gap-y-3 sm:text-base md:justify-items-start">
                                {footerLinks.quickLinks.map((link) => (
                                    <li key={link.path}>
                                        <Link
                                            to={link.path}
                                            className="footer-link group inline-flex min-h-[44px] items-center text-slate-400 transition-colors duration-300 hover:text-blue-400"
                                        >
                                            <span className="relative">
                                                {link.name}
                                                <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300 group-hover:w-full" />
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </section>

                    <section className="min-w-0 text-center md:col-span-2 md:text-left xl:col-span-1">
                        <h4 className="text-sm font-bold uppercase tracking-[0.12em] text-slate-300 sm:text-base">
                            Legal / Extra
                        </h4>
                        <ul className="mt-4 space-y-1.5 text-xs sm:text-sm">
                            {footerLinks.legal.map((link) => (
                                <li key={link.path}>
                                    <Link
                                        to={link.path}
                                        className="footer-link inline-flex min-h-[40px] items-center text-slate-500 transition-colors duration-300 hover:text-blue-400"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>

                        <button
                            type="button"
                            onClick={handleBackToTop}
                            className="footer-back-to-top mt-6 inline-flex min-h-[44px] items-center rounded-xl border border-slate-700/70 bg-slate-800/60 px-4 text-sm font-medium text-slate-300 transition-all duration-300 hover:border-cyan-500/50 hover:text-cyan-300"
                        >
                            Back to top ↑
                        </button>
                    </section>
                </div>

                <div className="mt-10 border-t border-slate-700/60 pt-6 sm:pt-7">
                    <div className="flex flex-col items-center gap-2 text-center">
                        <p className="text-sm text-slate-300 sm:text-base">
                            © 2026 Gaurav Kumar Yadav. All rights reserved.
                        </p>
                        <p className="text-xs text-slate-500 sm:text-sm">
                            Designed & Developed by <Link to="/admin" className="text-slate-500 hover:text-blue-400 transition-colors duration-200 font-medium">Gaurav Kumar Yadav</Link> | Student Developer Portfolio 2026
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer

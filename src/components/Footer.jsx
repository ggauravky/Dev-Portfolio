// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { Link } from 'react-router-dom'
import './Footer.css'

function Footer() {
    const currentYear = new Date().getFullYear()

    const footerLinks = {
        quickLinks: [
            { name: 'Home', path: '/' },
            { name: 'About', path: '/about' },
            { name: 'Projects', path: '/projects' },
            { name: 'Blog', path: '/blog' },
            { name: 'Skills', path: '/skills' },
            { name: 'Contact', path: '/contact' }
        ],
        social: [
            {
                name: 'GitHub', url: 'https://github.com/ggauravky',
                icon: <svg className="w-12 h-12 sm:w-14 sm:h-14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            },
            {
                name: 'LinkedIn', url: 'https://www.linkedin.com/in/gauravky/',
                icon: <svg className="w-12 h-12 sm:w-14 sm:h-14" viewBox="0 0 24 24" fill="#0A66C2" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            },
            {
                name: 'Twitter', url: 'https://x.com/xgauravky',
                icon: <svg className="w-12 h-12 sm:w-14 sm:h-14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            },
            {
                name: 'Email', url: 'mailto:kumar.gaurav.yadav2007@gmail.com',
                icon: <svg className="w-12 h-12 sm:w-14 sm:h-14" viewBox="0 0 24 24" fill="#EA4335" aria-hidden="true"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
            }
        ],
        legal: [
            { name: 'Privacy Policy', path: '/privacy' },
            { name: 'Terms of Service', path: '/terms' }
        ]
    }

    return (
        <footer className="relative bg-gradient-to-b from-slate-900 to-slate-950 border-t border-slate-700/50 backdrop-blur-sm overflow-hidden">
            {/* Enhanced Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-t from-blue-950/30 via-purple-950/20 to-slate-900/50"></div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>
            
            {/* Animated background elements */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
                {/* Main Footer Content - Enhanced */}
                <div className="text-center mb-20">
                    <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-6 animate-text-gradient">
                        Gaurav Kumar Yadav
                    </h3>
                    {/* Role badges — SVG icons replace emoji for a professional look */}
                    <div className="flex flex-wrap justify-center items-center gap-3 mb-6">
                        {/* Python */}
                        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-500/10 border border-blue-500/25 rounded-full text-blue-300 text-sm font-semibold">
                            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M11.914 0C5.82 0 6.2 2.656 6.2 2.656l.007 2.752h5.814v.826H3.9S0 5.789 0 11.969c0 6.18 3.403 5.96 3.403 5.96h2.034v-2.867s-.11-3.402 3.35-3.402h5.766s3.24.052 3.24-3.13V3.188S18.27 0 11.914 0zm-3.26 1.838a1.051 1.051 0 1 1 0 2.101 1.05 1.05 0 0 1 0-2.101z" fill="#4B91CC"/>
                                <path d="M12.086 24c6.094 0 5.714-2.656 5.714-2.656l-.007-2.752H12v-.826h8.1S24 18.211 24 12.031c0-6.18-3.403-5.96-3.403-5.96H18.56v2.867s.114 3.402-3.347 3.402H9.448s-3.24-.052-3.24 3.13v5.342S5.73 24 12.086 24zm3.26-1.838a1.051 1.051 0 1 1 0-2.101 1.051 1.051 0 0 1 0 2.1z" fill="#FFD444"/>
                            </svg>
                            Python Developer
                        </span>

                        <span className="text-slate-600 hidden sm:inline">·</span>

                        {/* AI & Data Science */}
                        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-purple-500/10 border border-purple-500/25 rounded-full text-purple-300 text-sm font-semibold">
                            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
                                <path d="M18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"/>
                            </svg>
                            AI & Data Science
                        </span>

                        <span className="text-slate-600 hidden sm:inline">·</span>

                        {/* Full Stack Developer */}
                        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-cyan-500/10 border border-cyan-500/25 rounded-full text-cyan-300 text-sm font-semibold">
                            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3"/>
                            </svg>
                            Full Stack Developer
                        </span>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm sm:text-base">
                        <p className="text-slate-400 flex items-center gap-2">
                            <svg className="w-4 h-4 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg> Based in Lucknow, India
                        </p>
                        <span className="hidden sm:inline text-slate-600">|</span>
                        <p className="text-green-400 font-bold flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-lg border border-green-500/30">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            Open for Internships & Freelance
                        </p>
                    </div>
                </div>

                {/* Social Links - Enhanced Grid Layout */}
                <div className="mb-20">
                    <h4 className="text-2xl sm:text-3xl font-bold text-center text-slate-200 mb-10 flex items-center justify-center gap-3">
                        <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>
                        Connect With Me
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto">
                        {footerLinks.social.map((link, index) => (
                            <a
                                key={index}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative flex flex-col items-center justify-center p-8 sm:p-10 bg-gradient-to-br from-slate-800/60 to-slate-900/60 hover:from-slate-800/90 hover:to-slate-900/90 border border-slate-700/50 hover:border-blue-500/60 rounded-2xl transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-blue-500/30 backdrop-blur-sm overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="mb-4 flex items-center justify-center group-hover:scale-125 group-hover:rotate-12 transition-all duration-300 relative z-10">{link.icon}</div>
                                <span className="text-slate-300 group-hover:text-blue-400 font-semibold text-sm sm:text-base transition-colors duration-300 relative z-10">{link.name}</span>
                            </a>
                        ))}
                    </div>
                </div>

                {/* Quick Links & CTA - Enhanced Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 sm:gap-16 mb-20 max-w-6xl mx-auto">
                    {/* Quick Links */}
                    <div className="text-center md:text-left">
                        <h4 className="text-xl sm:text-2xl font-bold text-slate-200 mb-8 flex items-center justify-center md:justify-start gap-2">
                            <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>
                            Quick Navigation
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {footerLinks.quickLinks.map((link, index) => (
                                <Link
                                    key={index}
                                    to={link.path}
                                    className="group text-slate-400 hover:text-blue-400 transition-all duration-300 text-sm sm:text-base hover:translate-x-1 inline-block font-medium relative"
                                >
                                    <span className="relative z-10">{link.name}</span>
                                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300"></span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* CTA Section - Enhanced */}
                    <div className="text-center md:text-right">
                        <h4 className="text-xl sm:text-2xl font-bold text-slate-200 mb-6 flex items-center justify-center md:justify-end gap-2">
                            <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg>
                            Let's Work Together
                        </h4>
                        <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-8">
                            Have a project in mind? Need a skilled developer? <br className="hidden sm:inline" />
                            <span className="text-blue-400 font-semibold">Let's build something amazing!</span>
                        </p>
                        <Link
                            to="/contact"
                            className="group inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 hover:from-blue-500 hover:via-purple-500 hover:to-cyan-500 rounded-2xl font-bold transition-all duration-300 hover:scale-110 text-base sm:text-lg shadow-2xl hover:shadow-purple-500/60 relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                            <span className="relative z-10">Let's Talk</span>
                            <svg className="w-5 h-5 relative z-10 group-hover:scale-125 transition-transform" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg>
                        </Link>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-slate-700/50 pt-10 mt-10">
                    <div className="flex flex-col items-center gap-6 text-center">
                        {/* Legal Links */}
                        <div className="flex flex-wrap gap-6 justify-center text-sm sm:text-base">
                            {footerLinks.legal.map((link, index) => (
                                <Link
                                    key={index}
                                    to={link.path}
                                    className="text-slate-400 hover:text-blue-400 transition-all duration-200 hover:scale-105 font-medium"
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>

                        {/* Copyright */}
                        <div className="space-y-2">
                            <p className="text-slate-300 text-sm sm:text-base">
                                © {currentYear} <span className="font-bold text-blue-400">Gaurav Kumar Yadav</span>. All rights reserved.
                            </p>
                            <p className="text-slate-500 text-xs sm:text-sm">
                                Built with <svg className="w-4 h-4 text-red-400 inline" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" /></svg> using React, Vite, Tailwind CSS &amp; Node.js
                            </p>
                        </div>

                        {/* Developer Tag */}
                        <p className="text-slate-600 text-xs sm:text-sm border-t border-slate-800/30 pt-4 w-full">
                            Designed & Developed by <Link to="/admin" className="text-slate-500 hover:text-blue-400 transition-colors duration-200 font-medium">Gaurav Kumar Yadav</Link> | Student Developer Portfolio 2026
                        </p>
                    </div>
                </div>
            </div>

            {/* Floating Background Elements */}
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -z-10"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -z-10"></div>
        </footer>
    )
}

export default Footer

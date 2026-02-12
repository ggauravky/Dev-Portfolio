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
            { name: 'GitHub', url: 'https://github.com/ggauravky', icon: '📦' },
            { name: 'LinkedIn', url: 'https://www.linkedin.com/in/gauravky/', icon: '💼' },
            { name: 'Twitter', url: 'https://x.com/xgauravky', icon: '🐦' },
            { name: 'Email', url: 'mailto:kumar.gaurav.yadav2007@gmail.com', icon: '📧' }
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
                    <p className="text-slate-300 text-lg sm:text-xl mb-6 max-w-2xl mx-auto font-medium">
                        🐍 Python Developer | 🤖 AI & Data Science | 💻 Full Stack Developer
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm sm:text-base">
                        <p className="text-slate-400 flex items-center gap-2">
                            <span className="text-blue-400">📍</span> Based in Lucknow, India 🇮🇳
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
                        <span className="text-3xl">🌐</span>
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
                                <span className="text-5xl sm:text-6xl mb-4 group-hover:scale-125 group-hover:rotate-12 transition-all duration-300 relative z-10">{link.icon}</span>
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
                            <span className="text-2xl">🔗</span>
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
                            <span className="text-2xl">💬</span>
                            Let's Work Together
                        </h4>
                        <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-8">
                            Have a project in mind? Need a skilled developer? <br className="hidden sm:inline" />
                            <span className="text-blue-400 font-semibold">Let's build something amazing!</span>
                        </p>
                        <Link
                            to="/contact"
                            className="group inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 hover:from-blue-500 hover:via-purple-500 hover:to -cyan-500 rounded-2xl font-bold transition-all duration-300 hover:scale-110 text-base sm:text-lg shadow-2xl hover:shadow-purple-500/60 relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                            <span className="relative z-10">Let's Talk</span>
                            <span className="text-2xl relative z-10 group-hover:scale-125 transition-transform">💬</span>
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
                                Built with ❤️ using React, Vite, Tailwind CSS & Node.js
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

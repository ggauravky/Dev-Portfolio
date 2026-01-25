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
        <footer className="relative bg-slate-900 border-t border-slate-800/50 backdrop-blur-sm">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-slate-900/50"></div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
                {/* Main Footer Content - Centered */}
                <div className="text-center mb-16">
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-6">
                        Gaurav Kumar Yadav
                    </h3>
                    <p className="text-slate-300 text-base sm:text-lg mb-4 max-w-2xl mx-auto">
                        🐍 Python Developer | 🤖 AI & Data Science | 💻 Full Stack Developer
                    </p>
                    <p className="text-slate-400 text-sm sm:text-base mb-3">
                        📍 Based in Lucknow, India
                    </p>
                    <p className="text-green-400 text-sm sm:text-base font-semibold">
                        ✅ Open for Internships & Freelance
                    </p>
                </div>

                {/* Social Links - Grid Layout */}
                <div className="mb-16">
                    <h4 className="text-xl sm:text-2xl font-bold text-center text-slate-200 mb-8">Connect With Me</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto">
                        {footerLinks.social.map((link, index) => (
                            <a
                                key={index}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex flex-col items-center justify-center p-6 sm:p-8 bg-slate-800/40 hover:bg-slate-800/70 border border-slate-700/50 hover:border-blue-500/50 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20"
                            >
                                <span className="text-4xl sm:text-5xl mb-3 group-hover:scale-110 transition-transform duration-300">{link.icon}</span>
                                <span className="text-slate-300 group-hover:text-blue-400 font-medium text-sm sm:text-base transition-colors duration-300">{link.name}</span>
                            </a>
                        ))}
                    </div>
                </div>

                {/* Quick Links & CTA - Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 mb-16 max-w-5xl mx-auto">
                    {/* Quick Links */}
                    <div className="text-center md:text-left">
                        <h4 className="text-lg sm:text-xl font-bold text-slate-200 mb-6">Quick Navigation</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                            {footerLinks.quickLinks.map((link, index) => (
                                <Link
                                    key={index}
                                    to={link.path}
                                    className="text-slate-400 hover:text-blue-400 transition-all duration-200 text-sm sm:text-base hover:translate-x-1 inline-block font-medium"
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="text-center md:text-right">
                        <h4 className="text-lg sm:text-xl font-bold text-slate-200 mb-4">Get In Touch</h4>
                        <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-6">
                            Looking for a dedicated developer for your project?
                        </p>
                        <Link
                            to="/contact"
                            className="inline-block px-8 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 hover:from-blue-600 hover:via-purple-600 hover:to-cyan-600 rounded-xl font-bold transition-all duration-300 hover:scale-105 text-base sm:text-lg shadow-xl hover:shadow-2xl hover:shadow-blue-500/50"
                        >
                            Let's Talk 💬
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

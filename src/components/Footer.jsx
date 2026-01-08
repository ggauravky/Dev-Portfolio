import { Link } from 'react-router-dom'
import './Footer.css'

function Footer() {
    const currentYear = new Date().getFullYear()

    const footerLinks = {
        quickLinks: [
            { name: 'Home', path: '/' },
            { name: 'About', path: '/about' },
            { name: 'Projects', path: '/projects' },
            { name: 'Skills', path: '/skills' },
            { name: 'Contact', path: '/contact' }
        ],
        social: [
            { name: 'GitHub', url: 'https://github.com/ggauravky', icon: '📦' },
            { name: 'LinkedIn', url: 'https://www.linkedin.com/in/gauravkumaryadav05', icon: '💼' },
            { name: 'Twitter', url: 'https://twitter.com/ggauravky', icon: '🐦' },
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

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
                    {/* About Section */}
                    <div className="space-y-3 sm:space-y-4 text-center sm:text-left">
                        <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            Gaurav Kumar Yadav
                        </h3>
                        <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                            🐍 Python Developer | 🤖 AI & Data Science | 💻 Full Stack Developer
                        </p>
                        <p className="text-slate-500 text-xs sm:text-sm">
                            📍 Based in Lucknow, India
                        </p>
                        <p className="text-green-400 text-xs sm:text-sm font-semibold">
                            ✅ Open for Internships & Freelance
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-3 sm:space-y-4 text-center sm:text-left">
                        <h4 className="text-base sm:text-lg font-semibold text-slate-300">Quick Links</h4>
                        <ul className="space-y-2 flex flex-col items-center sm:items-start">
                            {footerLinks.quickLinks.map((link, index) => (
                                <li key={index}>
                                    <Link
                                        to={link.path}
                                        className="text-slate-400 hover:text-blue-400 transition-colors duration-200 text-xs sm:text-sm block"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Social Links */}
                    <div className="space-y-3 sm:space-y-4 text-center sm:text-left">
                        <h4 className="text-base sm:text-lg font-semibold text-slate-300">Connect With Me</h4>
                        <ul className="space-y-2 flex flex-col items-center sm:items-start">
                            {footerLinks.social.map((link, index) => (
                                <li key={index}>
                                    <a
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-slate-400 hover:text-blue-400 transition-colors duration-200 text-xs sm:text-sm flex items-center gap-2"
                                    >
                                        <span className="text-base">{link.icon}</span>
                                        {link.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter/CTA */}
                    <div className="space-y-3 sm:space-y-4 text-center sm:text-left flex flex-col items-center sm:items-start">
                        <h4 className="text-base sm:text-lg font-semibold text-slate-300">Get In Touch</h4>
                        <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                            Looking for a dedicated developer for your project?
                        </p>
                        <Link
                            to="/contact"
                            className="inline-block px-4 sm:px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-lg font-semibold transition-all duration-300 hover:scale-105 text-xs sm:text-sm shadow-lg hover:shadow-blue-500/50"
                        >
                            Let's Talk 💬
                        </Link>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-slate-800/50 pt-6 sm:pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
                        {/* Copyright */}
                        <div className="text-center md:text-left">
                            <p className="text-slate-400 text-xs sm:text-sm">
                                © {currentYear} <span className="font-semibold text-blue-400">Gaurav Kumar Yadav</span>. All rights reserved.
                            </p>
                            <p className="text-slate-500 text-[10px] sm:text-xs mt-1">
                                Built with ❤️ using React, Vite, Tailwind CSS & Node.js
                            </p>
                        </div>

                        {/* Legal Links */}
                        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm">
                            {footerLinks.legal.map((link, index) => (
                                <Link
                                    key={index}
                                    to={link.path}
                                    className="text-slate-400 hover:text-blue-400 transition-colors duration-200 whitespace-nowrap"
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Developer Tag */}
                <div className="mt-4 sm:mt-6 text-center px-4">
                    <p className="text-slate-600 text-[10px] sm:text-xs leading-relaxed">
                        Designed & Developed by Gaurav Kumar Yadav | Student Developer Portfolio 2026
                    </p>
                </div>
            </div>

            {/* Floating Background Elements */}
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -z-10"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -z-10"></div>
        </footer>
    )
}

export default Footer

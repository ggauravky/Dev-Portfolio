import { useState } from 'react'
import toast from 'react-hot-toast'
import useSEO from '../hooks/useSEO'

function Contact() {
    useSEO({
        title: 'Contact - Gaurav Portfolio | Hire Python & AI Developer | Get in Touch',
        description: 'Contact Gaurav Kumar Yadav through Portfolio! Reach out for internship opportunities, entry-level positions, freelance projects, or collaborations. Python Developer & AI enthusiast from Lucknow, India specializing in Data Science and Full Stack Development. Open to remote work and project-based opportunities. Let\'s build something amazing together!',
        keywords: 'Contact Gaurav Portfolio, Contact Gaurav Kumar Yadav, Portfolio Contact, Hire Python Developer, Hire AI Developer, Internship Developer Lucknow, Freelance Developer India, Student Developer Contact, Remote Work, Entry Level Developer, Collaboration, Get in Touch Portfolio',
        ogImage: 'https://ggauravky.vercel.app/images/profile.jpg'
    })

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    })
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        // Show loading toast
        const loadingToast = toast.loading('Sending your message...')

        try {
            // Remove trailing slash if present
            const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '')

            const response = await fetch(`${API_URL}/api/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            })

            const data = await response.json()

            if (response.ok) {
                toast.success('✅ Message sent successfully! I\'ll get back to you soon.', {
                    id: loadingToast,
                    duration: 5000,
                })
                setFormData({ name: '', email: '', subject: '', message: '' })
            } else {
                // Show detailed validation errors
                let errorMessage = data.message || 'Failed to send message. Please try again.'

                if (data.errors && Array.isArray(data.errors)) {
                    const errorList = data.errors.map(err => `${err.field}: ${err.message}`).join('\n')
                    errorMessage = `${errorMessage}\n${errorList}`
                }

                toast.error(errorMessage, {
                    id: loadingToast,
                    duration: 6000,
                })

                console.error('Validation errors:', data.errors)
            }
        } catch (error) {
            console.error('Error sending message:', error)
            toast.error('❌ Network error. Please check your connection and try again.', {
                id: loadingToast,
                duration: 5000,
            })
        } finally {
            setLoading(false)
        }
    }

    const contactInfo = [
        {
            icon: <svg className="w-10 h-10" viewBox="0 0 24 24" fill="white" aria-hidden="true"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>,
            title: "GitHub",
            value: "@ggauravky",
            link: "https://github.com/ggauravky",
            color: "purple"
        },
        {
            icon: <svg className="w-10 h-10" viewBox="0 0 24 24" fill="white" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
            title: "LinkedIn",
            value: "@gauravky",
            link: "https://www.linkedin.com/in/gauravky/",
            color: "cyan"
        },
        {
            icon: <svg className="w-10 h-10" viewBox="0 0 24 24" fill="white" aria-hidden="true"><path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z"/></svg>,
            title: "LeetCode",
            value: "@gauravky",
            link: "https://leetcode.com/u/gauravky/",
            color: "orange"
        },
        {
            icon: <svg className="w-10 h-10" viewBox="0 0 24 24" fill="white" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
            title: "Twitter (X)",
            value: "@xgauravky",
            link: "https://x.com/xgauravky",
            color: "sky"
        }
    ]

    const colorClasses = {
        blue: "from-blue-500/20 to-blue-600/20 border-blue-500/30 hover:border-blue-400",
        cyan: "from-cyan-500/20 to-cyan-600/20 border-cyan-500/30 hover:border-cyan-400",
        purple: "from-purple-500/20 to-purple-600/20 border-purple-500/30 hover:border-purple-400",
        sky: "from-sky-500/20 to-sky-600/20 border-sky-500/30 hover:border-sky-400",
        orange: "from-orange-500/20 to-orange-600/20 border-orange-500/30 hover:border-orange-400"
    }

    return (
        <div className="min-h-screen bg-slate-900 px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute top-20 right-10 w-64 h-64 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-cyan-500/10 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-20 left-10 w-64 h-64 sm:w-96 sm:h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-12 sm:mb-16 animate-fadeIn">
                    <span className="inline-block text-cyan-400 text-xs sm:text-sm font-bold tracking-widest uppercase mb-4 px-4 py-2 bg-cyan-500/10 rounded-full border border-cyan-500/20">
                        Let's Connect
                    </span>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Get In Touch
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed px-4">
                        Have a project in mind, want to collaborate, or just say hi?
                        I'd love to hear from you! 💬
                    </p>
                </div>

                {/* Resume Download Banner */}
                <div className="bg-gradient-to-br from-cyan-600/20 to-blue-600/20 backdrop-blur-sm p-4 sm:p-6 md:p-8 rounded-2xl border border-cyan-500/30 mb-8 sm:mb-12 hover:border-cyan-400/50 transition-all duration-300 animate-slideDown">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                        <div className="flex items-center gap-4">
                            <div className="text-5xl">📄</div>
                            <div>
                                <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                                    Want to Know More About Me?
                                </h3>
                                <p className="text-slate-300">
                                    Download my resume for complete details about my experience and skills
                                </p>
                            </div>
                        </div>
                        <a
                            href="/resume.pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg shadow-cyan-500/30 whitespace-nowrap"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            View Resume
                        </a>
                    </div>
                </div>

                {/* Contact Info Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16 animate-slideUp">
                    {contactInfo.map((info, index) => (
                        <a
                            key={index}
                            href={info.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`bg-gradient-to-br ${colorClasses[info.color]} backdrop-blur-sm p-6 rounded-2xl border transition-all duration-300 hover:scale-105 hover:shadow-lg text-center group`}
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className="mb-3 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                {info.icon}
                            </div>
                            <h3 className="text-lg font-semibold text-slate-300 mb-1">
                                {info.title}
                            </h3>
                            <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                                {info.value}
                            </p>
                        </a>
                    ))}
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Contact Form */}
                    <div className="animate-slideRight">
                        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:border-purple-500/50 transition-all duration-300">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="text-3xl">✉️</span>
                                <h2 className="text-2xl font-bold text-purple-400">Send a Message</h2>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="name" className="flex items-center gap-2 text-slate-300 font-medium mb-2">
                                        <span>👤</span> Your Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        placeholder="Gaurav"
                                        className="w-full bg-slate-900/80 border border-slate-700 text-slate-300 px-4 py-3 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 placeholder-slate-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="flex items-center gap-2 text-slate-300 font-medium mb-2">
                                        <span>📧</span> Your Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="gaurav@example.com"
                                        className="w-full bg-slate-900/80 border border-slate-700 text-slate-300 px-4 py-3 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 placeholder-slate-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="subject" className="flex items-center gap-2 text-slate-300 font-medium mb-2">
                                        <span>📋</span> Subject
                                    </label>
                                    <input
                                        type="text"
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                        placeholder="Project inquiry, collaboration, etc."
                                        className="w-full bg-slate-900/80 border border-slate-700 text-slate-300 px-4 py-3 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 placeholder-slate-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="message" className="flex items-center gap-2 text-slate-300 font-medium mb-2">
                                        <span>💬</span> Your Message
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        rows="5"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        placeholder="Tell me about your project or just say hi..."
                                        className="w-full bg-slate-900/80 border border-slate-700 text-slate-300 px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 resize-none placeholder-slate-500"
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 hover:from-cyan-500 hover:via-blue-500 hover:to-purple-500 text-white font-semibold py-4 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/50 flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>Sending...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Send Message</span>
                                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div className="space-y-6 animate-slideUp" style={{ animationDelay: '0.2s' }}>
                        {/* Why Contact Me */}
                        <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm p-8 rounded-2xl border border-blue-500/30">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="text-3xl">💡</span>
                                <h2 className="text-2xl font-bold text-blue-400">Let's Work Together</h2>
                            </div>
                            <div className="space-y-4 text-slate-300">
                                <div className="flex items-start gap-3">
                                    <span className="text-cyan-400 text-xl">✓</span>
                                    <p><strong className="text-cyan-400">Available for:</strong> Freelance projects, collaborations, and internships</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="text-purple-400 text-xl">✓</span>
                                    <p><strong className="text-purple-400">Response Time:</strong> Usually within 24 hours</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="text-blue-400 text-xl">✓</span>
                                    <p><strong className="text-blue-400">Open to:</strong> Full-stack, Python, AI/ML, and Web Development projects</p>
                                </div>
                            </div>
                        </div>

                        {/* Fun Fact */}
                        <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-sm p-8 rounded-2xl border border-cyan-500/30">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-3xl">🚀</span>
                                <h2 className="text-2xl font-bold text-cyan-400">Quick Response</h2>
                            </div>
                            <p className="text-slate-300 leading-relaxed">
                                I'm always excited to discuss new projects and opportunities.
                                Whether you have a question, a project idea, or just want to connect,
                                don't hesitate to reach out! ⚡
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Contact

// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import useSEO from '../hooks/useSEO'
import StickyMobileCTA from '../components/StickyMobileCTA'

const CONTACT_EMAIL = 'kumar.gaurav.yadav2007@gmail.com'
const CONTACT_MESSAGE_LIMIT = 2000

/* ─── Data ──────────────────────────────────────────────────────── */
const majorPlatforms = [
    {
        label: 'GitHub',
        href: 'https://github.com/ggauravky',
        username: '@ggauravky',
        subtitle: 'Code, projects and open source',
        tone: 'from-slate-700 via-slate-800 to-slate-900',
        icon: (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
        ),
    },
    {
        label: 'LinkedIn',
        href: 'https://www.linkedin.com/in/gauravky/',
        username: '@gauravky',
        subtitle: 'Professional updates and experience',
        tone: 'from-blue-700 via-blue-600 to-cyan-600',
        icon: (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
        ),
    },
    {
        label: 'LeetCode',
        href: 'https://leetcode.com/u/gauravky/',
        username: '@gauravky',
        subtitle: 'Problem solving and DSA consistency',
        tone: 'from-orange-600 via-yellow-600 to-orange-700',
        icon: (
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z"/></svg>
        ),
    },
    {
        label: 'WhatsApp',
        href: 'https://wa.me/918542036499',
        username: '+91 8542036499',
        subtitle: 'Fastest way to reach me',
        tone: 'from-green-600 via-green-500 to-emerald-600',
        icon: (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
            </svg>
        ),
    },
]

const allPlatforms = [
    ...majorPlatforms,
    {
        label: 'Kaggle',
        href: 'https://www.kaggle.com/kgauravky',
        username: '@kgauravky',
        subtitle: 'ML notebooks and data experiments',
        tone: 'from-cyan-600 via-blue-600 to-cyan-700',
        icon: (
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.825 23.859c-.022.092-.117.141-.281.141h-3.139c-.187 0-.351-.082-.492-.248l-5.178-6.589-1.448 1.374v5.111c0 .235-.117.352-.351.352H5.505c-.236 0-.354-.117-.354-.352V.353c0-.233.118-.353.354-.353h2.431c.234 0 .351.12.351.353v14.343l6.203-6.272c.165-.165.33-.246.495-.246h3.239c.144 0 .236.06.285.18.046.149.034.255-.036.315l-6.555 6.344 6.836 8.507c.095.104.117.208.011.336z"/></svg>
        ),
    },
    {
        label: 'GeeksforGeeks',
        href: 'https://www.geeksforgeeks.org/profile/gauravky',
        username: '@gauravky',
        subtitle: 'DSA notes and practice profile',
        tone: 'from-green-600 via-emerald-600 to-green-700',
        icon: (
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21.45 14.315c-.143.28-.334.532-.565.745a3.691 3.691 0 0 1-1.104.695 4.51 4.51 0 0 1-3.116-.016 3.79 3.79 0 0 1-2.135-2.078 3.571 3.571 0 0 1-.13-.353h7.418a4.26 4.26 0 0 1-.368 1.008zm-11.99-.654a3.793 3.793 0 0 1-2.134 2.078 4.51 4.51 0 0 1-3.117.016 3.7 3.7 0 0 1-1.104-.695 2.652 2.652 0 0 1-.564-.745 4.221 4.221 0 0 1-.368-1.006H9.59c-.038.12-.08.238-.13.352zm14.501-1.758a3.849 3.849 0 0 0-.082-.475l-9.634-.008a3.932 3.932 0 0 1 1.143-2.348c.363-.35.79-.625 1.26-.809a3.97 3.97 0 0 1 4.484.957l1.521-1.49a5.7 5.7 0 0 0-1.922-1.357 6.283 6.283 0 0 0-2.544-.49 6.35 6.35 0 0 0-2.405.457 6.007 6.007 0 0 0-1.963 1.276 6.142 6.142 0 0 0-1.325 1.94 5.862 5.862 0 0 0-.466 1.864h-.063a5.857 5.857 0 0 0-.467-1.865 6.13 6.13 0 0 0-1.325-1.939A6 6 0 0 0 8.21 6.34a6.698 6.698 0 0 0-4.949.031A5.708 5.708 0 0 0 1.34 7.73l1.52 1.49a4.166 4.166 0 0 1 4.484-.958c.47.184.898.46 1.26.81.368.36.66.792.859 1.268.146.344.242.708.285 1.08l-9.635.008A4.714 4.714 0 0 0 0 12.457a6.493 6.493 0 0 0 .345 2.127 4.927 4.927 0 0 0 1.08 1.783c.528.56 1.17 1 1.88 1.293a6.454 6.454 0 0 0 2.504.457c.824.005 1.64-.15 2.404-.457a5.986 5.986 0 0 0 1.964-1.277 6.116 6.116 0 0 0 1.686-3.076h.273a6.13 6.13 0 0 0 1.686 3.077 5.99 5.99 0 0 0 1.964 1.276 6.345 6.345 0 0 0 2.405.457 6.45 6.45 0 0 0 2.502-.457 5.42 5.42 0 0 0 1.882-1.293 4.928 4.928 0 0 0 1.08-1.783A6.52 6.52 0 0 0 24 12.457a4.757 4.757 0 0 0-.039-.554z"/></svg>
        ),
    },
    {
        label: 'Instagram',
        href: 'https://www.instagram.com/the_gau_rav/',
        username: '@the_gau_rav',
        subtitle: 'Behind the scenes and daily moments',
        tone: 'from-pink-600 via-purple-600 to-pink-700',
        icon: (
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 3.252.148 4.771 1.691 4.919 4.919.049 1.265.064 1.645.064 4.849 0 3.205-.015 3.585-.074 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.072-4.85.072-3.204 0-3.584-.014-4.849-.072-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.072-1.644-.072-4.849 0-3.204.013-3.583.072-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.071 4.849-.071zM12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
        ),
    },
    {
        label: 'Twitter / X',
        href: 'https://x.com/xgauravky',
        username: '@xgauravky',
        subtitle: 'Thoughts, updates and tech notes',
        tone: 'from-slate-700 via-slate-800 to-slate-900',
        icon: (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
        ),
    },
]

/* ─── Component ─────────────────────────────────────────────────── */
function Contact() {
    useSEO({
        title: 'Contact - Gaurav Portfolio | Hire Python & AI Developer | Get in Touch',
        description: 'Contact Gaurav Kumar Yadav. Reach out for internship opportunities, entry-level positions, freelance projects, or collaborations. Python Developer & AI enthusiast from Lucknow, India.',
        keywords: 'Contact Gaurav Portfolio, Contact Gaurav Kumar Yadav, Portfolio Contact, Hire Python Developer, Hire AI Developer, Internship Developer Lucknow, Freelance Developer India',
        ogImage: 'https://ggauravky.vercel.app/images/profile.jpg',
    })

    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })
        const featuredPlatforms = useMemo(() => majorPlatforms, [])

    const [loading, setLoading]   = useState(false)
    const [focused, setFocused]   = useState('')
    const [copied, setCopied]     = useState(false)

    const copyEmail = () => {
        navigator.clipboard.writeText(CONTACT_EMAIL).then(() => {
            setCopied(true)
            toast.success('Email copied to clipboard!')
            setTimeout(() => setCopied(false), 2000)
        })
    }

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        const loadingToast = toast.loading('Sending your message…')
        try {
            const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '')
            const response = await fetch(`${API_URL}/api/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })
            const data = await response.json()
            if (response.ok) {
                toast.success("Message sent! I'll get back to you soon.", { id: loadingToast, duration: 5000 })
                setFormData({ name: '', email: '', subject: '', message: '' })
            } else {
                let msg = data.message || 'Failed to send. Please try again.'
                if (data.errors?.length) msg = data.errors.map(e => `${e.field}: ${e.message}`).join('\n')
                toast.error(msg, { id: loadingToast, duration: 6000 })
            }
        } catch {
            toast.error('Network error. Check your connection and try again.', { id: loadingToast, duration: 5000 })
        } finally {
            setLoading(false)
        }
    }

    const ringColor = { name: 'cyan', email: 'cyan', subject: 'purple', message: 'blue' }
    const fieldClass = (key) => {
        const ring = ringColor[key] || 'cyan'
        const ringMap = {
            cyan:   'border-cyan-500 shadow-[0_0_0_3px_rgba(6,182,212,0.12)]',
            purple: 'border-purple-500 shadow-[0_0_0_3px_rgba(168,85,247,0.12)]',
            blue:   'border-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.12)]',
        }
        return `rounded-xl border transition-all duration-200 ${focused === key ? ringMap[ring] : 'border-slate-700/80'}`
    }

    return (
        <div className="min-h-screen bg-slate-900 relative overflow-hidden">

            {/* Ambient blobs */}
            <div className="absolute top-[-80px] right-[-80px] w-[480px] h-[480px] bg-cyan-500/6 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-60px] left-[-60px] w-[420px] h-[420px] bg-purple-500/6 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] bg-blue-500/4 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-28">

                {/* Header */}
                <div className="text-center mb-12 sm:mb-16">
                    <span className="inline-flex items-center gap-2 text-emerald-400 text-xs font-bold tracking-widest uppercase mb-5 px-4 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                        </span>{' '}
                        Open to new opportunities
                    </span>

                    <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold mb-5 leading-tight tracking-tight">
                        <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                            Let&apos;s Build
                        </span>
                        <br />
                        <span className="text-white">Something Great</span>
                    </h1>

                    <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        Freelance project, internship, collaboration&nbsp;— or just a good idea.
                        <br className="hidden sm:block" />
                        Drop me a message and let&apos;s make it happen.
                    </p>

                </div>

                {/* Major platforms first */}
                <section className="mb-10 sm:mb-12">
                    <div className="flex items-center justify-between gap-3 mb-5">
                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">Major Platforms</h2>
                        <span className="text-xs text-slate-500 uppercase tracking-widest">Start Here</span>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {featuredPlatforms.map((platform) => (
                            <a
                                key={platform.label}
                                href={platform.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-800/60 p-4 hover:border-cyan-500/50 transition-all duration-300 hover:-translate-y-1"
                            >
                                <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 bg-gradient-to-br ${platform.tone} transition-opacity duration-300`} />
                                <div className="relative z-10">
                                    <div className="w-11 h-11 rounded-xl border border-slate-600/60 bg-slate-900/70 text-white flex items-center justify-center mb-3">
                                        {platform.icon}
                                    </div>
                                    <p className="text-white font-semibold text-base">{platform.label}</p>
                                    <p className="text-cyan-300 text-xs mt-0.5">{platform.username}</p>
                                    <p className="text-slate-400 text-xs mt-2">{platform.subtitle}</p>
                                </div>
                            </a>
                        ))}
                    </div>
                </section>

                {/* Resume strip */}
                <div className="mb-10 sm:mb-12 rounded-2xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 hover:border-slate-600/60 transition-colors duration-300">
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div className="text-center sm:text-left">
                            <p className="text-white font-semibold text-sm">Want my full resume?</p>
                            <p className="text-slate-400 text-xs mt-0.5">Experience &middot; Skills &middot; Education&nbsp;— all in one PDF</p>
                        </div>
                    </div>
                    <a
                        href="/resume.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Open resume PDF in a new tab"
                        className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-sm font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/20"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        View Resume
                    </a>
                </div>

                {/* Proper message form */}
                <section id="contact-form" className="mb-12 sm:mb-14">
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-9 hover:border-slate-600/60 transition-colors duration-300">

                            <div className="mb-7">
                                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1.5">Send a message</h2>
                                <p className="text-slate-400 text-sm">I read every message and reply personally.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">

                                {/* Name + Email */}
                                <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
                                    <div className="space-y-1.5">
                                        <label htmlFor="name" className="flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                            Full Name <span className="text-rose-400 normal-case font-normal tracking-normal text-[13px] leading-none">*</span>
                                        </label>
                                        <div className={fieldClass('name')}>
                                            <input
                                                type="text" id="name" name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                onFocus={() => setFocused('name')}
                                                onBlur={() => setFocused('')}
                                                required
                                                autoComplete="name"
                                                placeholder="Gaurav Kumar"
                                                className="w-full bg-slate-900/60 text-slate-200 px-4 py-3 rounded-xl focus:outline-none placeholder-slate-600 text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label htmlFor="email" className="flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                            Email Address <span className="text-rose-400 normal-case font-normal tracking-normal text-[13px] leading-none">*</span>
                                        </label>
                                        <div className={fieldClass('email')}>
                                            <input
                                                type="email" id="email" name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                onFocus={() => setFocused('email')}
                                                onBlur={() => setFocused('')}
                                                required
                                                autoComplete="email"
                                                placeholder="you@example.com"
                                                className="w-full bg-slate-900/60 text-slate-200 px-4 py-3 rounded-xl focus:outline-none placeholder-slate-600 text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Subject */}
                                <div className="space-y-1.5">
                                    <label htmlFor="subject" className="flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                        Subject <span className="text-rose-400 normal-case font-normal tracking-normal text-[13px] leading-none">*</span>
                                    </label>
                                    <div className={fieldClass('subject')}>
                                        <input
                                            type="text" id="subject" name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            onFocus={() => setFocused('subject')}
                                            onBlur={() => setFocused('')}
                                            required
                                            placeholder="Freelance project · Internship · Collaboration · Just saying hi"
                                            className="w-full bg-slate-900/60 text-slate-200 px-4 py-3 rounded-xl focus:outline-none placeholder-slate-600 text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Message */}
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <label htmlFor="message" className="flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                            Message <span className="text-rose-400 normal-case font-normal tracking-normal text-[13px] leading-none">*</span>
                                        </label>
                                        <span className={`text-xs tabular-nums font-medium transition-colors ${formData.message.length > 1800 ? 'text-rose-400' : 'text-slate-600'}`}>
                                            {formData.message.length}&thinsp;/&thinsp;{CONTACT_MESSAGE_LIMIT}
                                        </span>
                                    </div>
                                    <div className={fieldClass('message')}>
                                        <textarea
                                            id="message" name="message"
                                            rows="7"
                                            maxLength={CONTACT_MESSAGE_LIMIT}
                                            value={formData.message}
                                            onChange={handleChange}
                                            onFocus={() => setFocused('message')}
                                            onBlur={() => setFocused('')}
                                            required
                                            placeholder="Tell me about your project, idea, or just say hi. The more detail, the better I can help."
                                            className="w-full bg-slate-900/60 text-slate-200 px-4 py-3.5 rounded-xl focus:outline-none resize-none placeholder-slate-600 text-sm leading-relaxed"
                                        />
                                    </div>
                                </div>

                                {/* Submit button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 hover:from-cyan-500 hover:via-blue-500 hover:to-purple-500 text-white font-semibold py-4 rounded-xl transition-all duration-300 hover:scale-[1.015] hover:shadow-xl hover:shadow-blue-500/20 flex items-center justify-center gap-3 group disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none text-sm sm:text-base"
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Sending&hellip;
                                        </>
                                    ) : (
                                        <>
                                            Send Message
                                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                            </svg>
                                        </>
                                    )}
                                </button>

                                {/* Footer row */}
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1">
                                    <p className="text-xs text-slate-600 text-center sm:text-left">
                                        Your data is never shared with third parties.
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <a
                                            href={`mailto:${CONTACT_EMAIL}`}
                                            className="text-xs text-cyan-500 hover:text-cyan-400 transition-colors underline underline-offset-2 whitespace-nowrap"
                                        >
                                            Or email me directly
                                        </a>
                                        <button
                                            type="button"
                                            onClick={copyEmail}
                                            className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all duration-200 ${
                                                copied
                                                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                                                    : 'bg-slate-700/40 border-slate-600/50 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 hover:bg-cyan-500/8'
                                            }`}
                                            aria-label="Copy email"
                                        >
                                            {copied ? (
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                                </svg>
                                            ) : (
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>

                            </form>
                        </div>
                </section>

                {/* All Find Me links in stronger UI */}
                <section>
                    <div className="flex items-center justify-between gap-3 mb-5">
                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">Find Me Everywhere</h2>
                        <span className="text-xs text-slate-500 uppercase tracking-widest">All Links</span>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                        {allPlatforms.map((platform, index) => (
                            <a
                                key={platform.label}
                                href={platform.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative rounded-2xl border border-slate-700/60 bg-slate-800/60 p-5 overflow-hidden isolate hover:border-slate-500/10 transition-all duration-500 hover:-translate-y-2 hover:scale-[1.015] hover:shadow-2xl hover:shadow-cyan-500/20"
                            >
                                <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100 bg-gradient-to-br from-cyan-400/30 via-blue-500/20 to-purple-500/30" />
                                <div className={`absolute inset-0 bg-gradient-to-br ${platform.tone} opacity-0 group-hover:opacity-95 transition-opacity duration-500`} />
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 [background:radial-gradient(130%_90%_at_20%_15%,rgba(255,255,255,.30),rgba(255,255,255,0))]" />

                                <div
                                    className="pointer-events-none absolute -top-10 -right-10 w-28 h-28 rounded-full border border-white/0 group-hover:border-white/30 transition-all duration-700"
                                    style={{ transform: `rotate(${16 + index * 9}deg)` }}
                                />
                                <div
                                    className="pointer-events-none absolute -bottom-12 -left-8 w-28 h-28 rounded-full border border-white/0 group-hover:border-white/20 transition-all duration-700"
                                    style={{ transform: `rotate(${-14 - index * 6}deg)` }}
                                />

                                <div className="relative z-10">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="w-11 h-11 rounded-xl border border-slate-600/60 bg-slate-900/70 flex items-center justify-center text-white transition-all duration-500 group-hover:border-white/45 group-hover:bg-white/10 group-hover:scale-110 group-hover:rotate-3">
                                            {platform.icon}
                                        </div>
                                        <svg className="w-5 h-5 text-slate-500 group-hover:text-white group-hover:translate-x-1.5 group-hover:-translate-y-1.5 group-hover:scale-110 transition-all duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    </div>

                                    <h3 className="text-white font-bold text-lg mt-4 tracking-tight transition-transform duration-500 group-hover:translate-x-0.5">{platform.label}</h3>
                                    <p className="text-cyan-300 text-sm mt-0.5 transition-colors duration-500 group-hover:text-white">{platform.username}</p>
                                    <p className="text-slate-400 group-hover:text-slate-100 text-sm mt-2 transition-colors duration-500">{platform.subtitle}</p>
                                    <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-white/0 to-transparent group-hover:via-white/45 transition-all duration-700" />
                                </div>
                            </a>
                        ))}
                    </div>
                </section>

                <StickyMobileCTA
                    badge="Primary Action"
                    title="Start a conversation now"
                    primaryLabel="Start a Conversation"
                    primaryTo="/contact#contact-form"
                    secondaryLabel="Book Service"
                    secondaryTo="/services"
                />
            </div>
        </div>
    )
}

export default Contact

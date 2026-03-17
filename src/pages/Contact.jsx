// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

﻿import { useState } from 'react'
import toast from 'react-hot-toast'
import useSEO from '../hooks/useSEO'

const CONTACT_EMAIL = 'kumar.gaurav.yadav2007@gmail.com'

/* ─── Data ──────────────────────────────────────────────────────── */
const services = [
    {
        color: 'blue',
        icon: (
            <svg viewBox="-11.5 -10.23 23 20.46" width="22" height="22" aria-label="React">
                <circle r="2.05" fill="#61DAFB" />
                <g stroke="#61DAFB" strokeWidth="1" fill="none">
                    <ellipse rx="11" ry="4.2" />
                    <ellipse rx="11" ry="4.2" transform="rotate(60)" />
                    <ellipse rx="11" ry="4.2" transform="rotate(120)" />
                </g>
            </svg>
        ),
        label: 'Full Stack Web Apps',
        desc: 'MERN stack, REST APIs, real-time features',
    },
    {
        color: 'violet',
        icon: (
            <svg viewBox="0 0 32 32" width="22" height="22" aria-label="AI / ML">
                <circle cx="4"  cy="8"  r="2.8" fill="#a78bfa" />
                <circle cx="4"  cy="16" r="2.8" fill="#a78bfa" />
                <circle cx="4"  cy="24" r="2.8" fill="#a78bfa" />
                <circle cx="16" cy="6"  r="2.8" fill="#818cf8" />
                <circle cx="16" cy="14" r="2.8" fill="#818cf8" />
                <circle cx="16" cy="22" r="2.8" fill="#818cf8" />
                <circle cx="28" cy="11" r="2.8" fill="#60a5fa" />
                <circle cx="28" cy="21" r="2.8" fill="#60a5fa" />
                <g stroke="#6366f1" strokeWidth="0.9" opacity="0.8">
                    <line x1="6.7" y1="8"  x2="13.2" y2="6"  />
                    <line x1="6.7" y1="8"  x2="13.2" y2="14" />
                    <line x1="6.7" y1="8"  x2="13.2" y2="22" />
                    <line x1="6.7" y1="16" x2="13.2" y2="6"  />
                    <line x1="6.7" y1="16" x2="13.2" y2="14" />
                    <line x1="6.7" y1="16" x2="13.2" y2="22" />
                    <line x1="6.7" y1="24" x2="13.2" y2="6"  />
                    <line x1="6.7" y1="24" x2="13.2" y2="14" />
                    <line x1="6.7" y1="24" x2="13.2" y2="22" />
                    <line x1="18.7" y1="6"  x2="25.3" y2="11" />
                    <line x1="18.7" y1="6"  x2="25.3" y2="21" />
                    <line x1="18.7" y1="14" x2="25.3" y2="11" />
                    <line x1="18.7" y1="14" x2="25.3" y2="21" />
                    <line x1="18.7" y1="22" x2="25.3" y2="11" />
                    <line x1="18.7" y1="22" x2="25.3" y2="21" />
                </g>
            </svg>
        ),
        label: 'AI / ML Integration',
        desc: 'Model integration, data pipelines, automation',
    },
    {
        color: 'yellow',
        icon: (
            <svg viewBox="0 0 128 128" width="22" height="22" aria-label="Python">
                <linearGradient id="py-a" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#387EB8" />
                    <stop offset="1" stopColor="#366994" />
                </linearGradient>
                <linearGradient id="py-b" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#FFE052" />
                    <stop offset="1" stopColor="#FFC331" />
                </linearGradient>
                <path fill="url(#py-a)" d="M63.391 1.988c-4.222.02-8.252.379-11.8 1.007-10.45 1.846-12.346 5.71-12.346 12.837v9.411h24.693v3.137H29.977c-7.176 0-13.46 4.313-15.426 12.521-2.268 9.405-2.368 15.275 0 25.096 1.755 7.311 5.947 12.519 13.124 12.519h8.491V67.234c0-8.151 7.051-15.34 15.426-15.34h24.665c6.866 0 12.346-5.654 12.346-12.548V15.833c0-6.693-5.646-11.72-12.346-12.837-4.244-.706-8.645-1.027-12.866-1.008zM50.037 9.557c2.55 0 4.634 2.117 4.634 4.721 0 2.593-2.083 4.69-4.634 4.69-2.56 0-4.633-2.097-4.633-4.69-.001-2.604 2.073-4.721 4.633-4.721z" />
                <path fill="url(#py-b)" d="M91.682 28.38v10.966c0 8.5-7.208 15.655-15.426 15.655H51.591c-6.756 0-12.346 5.783-12.346 12.548v23.515c0 6.693 5.818 10.628 12.346 12.547 7.816 2.297 15.312 2.713 24.665 0 6.216-1.801 12.346-5.423 12.346-12.547v-9.412H63.938v-3.138h37.012c7.176 0 9.852-5.005 12.348-12.519 2.578-7.735 2.467-15.174 0-25.096-1.774-7.145-5.161-12.521-12.348-12.521h-9.268zM77.809 87.927c2.561 0 4.634 2.097 4.634 4.692 0 2.602-2.074 4.719-4.634 4.719-2.55 0-4.633-2.117-4.633-4.719 0-2.595 2.083-4.692 4.633-4.692z" />
            </svg>
        ),
        label: 'Python Development',
        desc: 'Scripts, automation, data processing tools',
    },
    {
        color: 'green',
        icon: (
            <svg viewBox="0 0 256 289" width="22" height="22" aria-label="Node.js">
                <path fill="#539E43" d="M128 288.464c-3.975 0-7.685-1.06-11.13-2.915l-35.247-20.936c-5.3-2.979-2.713-4.022-.954-4.633 7.023-2.449 8.436-3.008 15.888-7.27.787-.453 1.821-.283 2.626.198l27.076 16.099c.973.548 2.352.548 3.233 0l105.624-61.004c.975-.548 1.6-1.653 1.6-2.797V83.74c0-1.165-.625-2.27-1.617-2.84L129.433 20.04c-.975-.548-2.275-.548-3.25 0L20.574 81.052c-1.01.567-1.635 1.674-1.635 2.84v121.82c0 1.14.625 2.226 1.617 2.793l28.944 16.72c15.72 7.87 25.338-1.4 25.338-10.71V94.281c0-1.712 1.364-3.054 3.073-3.054h13.405c1.69 0 3.073 1.342 3.073 3.054v119.233c0 20.955-11.405 32.98-31.257 32.98-6.107 0-10.919 0-24.338-6.627l-27.685-15.894C4.48 219.856 0 212.107 0 203.811V81.991c0-8.298 4.48-16.04 11.717-20.224L117.342 1.633c7.063-3.897 16.436-3.897 23.498 0L246.26 61.767c7.235 4.185 11.717 11.927 11.717 20.224v121.82c0 8.298-4.482 16.04-11.717 20.225L139.13 285.55c-3.428 1.856-7.237 2.914-11.13 2.914z" />
                <path fill="#539E43" d="M160.259 203.453c-46.2 0-55.876-21.215-55.876-39.05 0-1.712 1.364-3.054 3.073-3.054h13.663c1.52 0 2.804 1.1 3.054 2.6 2.08 14.028 8.302 21.11 36.086 21.11 22.198 0 31.63-5.02 31.63-16.8 0-6.79-2.69-11.826-37.18-15.21-28.79-2.87-46.6-9.22-46.6-32.28 0-21.264 17.906-33.93 47.948-33.93 33.724 0 50.394 11.7 52.474 36.89.08.87-.207 1.71-.76 2.34-.548.604-1.33.97-2.147.97h-13.72c-1.43 0-2.69-.98-2.994-2.37-3.295-14.6-11.325-19.27-32.853-19.27-24.197 0-27.01 8.43-27.01 14.74 0 7.65 3.32 9.893 36.047 14.212 32.38 4.298 47.73 10.372 47.73 33.148 0 22.96-19.13 36.154-52.565 36.154z" />
            </svg>
        ),
        label: 'UI / UX Frontend',
        desc: 'React, Tailwind, responsive & animated UIs',
    },
]

const serviceIconBg = {
    blue:   'bg-cyan-500/10 border-cyan-500/20',
    violet: 'bg-violet-500/10 border-violet-500/20',
    yellow: 'bg-yellow-500/10 border-yellow-500/20',
    green:  'bg-emerald-500/10 border-emerald-500/20',
}

const steps = [
    { step: '01', title: 'You reach out',      desc: 'Fill the form or email me directly', color: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/20 text-cyan-400' },
    { step: '02', title: 'I review & respond', desc: 'Within 24 hours, always',             color: 'from-blue-500/20 to-violet-500/20 border-blue-500/20 text-blue-400' },
    { step: '03', title: 'We discuss details', desc: 'Requirements, timeline, scope',        color: 'from-violet-500/20 to-purple-500/20 border-violet-500/20 text-violet-400' },
    { step: '04', title: 'We start building',  desc: 'Clean code, regular updates',          color: 'from-purple-500/20 to-pink-500/20 border-purple-500/20 text-purple-400' },
]

const socials = [
    {
        label: 'GitHub',
        href: 'https://github.com/ggauravky',
        color: 'hover:border-slate-500/60 hover:bg-slate-700/40',
        icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
        ),
    },
    {
        label: 'LinkedIn',
        href: 'https://www.linkedin.com/in/gauravky/',
        color: 'hover:border-blue-500/40 hover:bg-blue-500/10',
        icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
        ),
    },
    {
        label: 'Twitter / X',
        href: 'https://twitter.com/gauravky_',
        color: 'hover:border-slate-500/40 hover:bg-slate-700/30',
        icon: (
            <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
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

                {/* ── Header ─────────────────────────────────────── */}
                <div className="text-center mb-12 sm:mb-16">
                    <span className="inline-flex items-center gap-2 text-emerald-400 text-xs font-bold tracking-widest uppercase mb-5 px-4 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                        </span>
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

                    {/* Quick social row */}
                    <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mt-7">
                        {socials.map((s) => (
                            <a
                                key={s.label}
                                href={s.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={s.label}
                                className={`flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-400 transition-all duration-200 hover:text-white hover:scale-110 hover:shadow-lg ${s.color}`}
                            >
                                {s.icon}
                            </a>
                        ))}
                        <span className="hidden sm:block w-px h-6 bg-slate-700/80 mx-1" />
                        <a
                            href="mailto:kumar.gaurav.yadav2007@gmail.com"
                            className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-400 text-xs sm:text-sm hover:text-cyan-400 hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-all duration-200"
                        >
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span className="hidden xs:inline">kumar.gaurav.yadav2007@gmail.com</span>
                            <span className="inline xs:hidden">Email me</span>
                        </a>
                    </div>
                </div>

                {/* ── Resume strip ───────────────────────────────── */}
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
                        href="https://drive.google.com/file/d/12p8A0rchFoZ1q2JlQJEaAWiGiXhSq3ev/view?usp=sharing"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-sm font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/20"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download Resume
                    </a>
                </div>

                {/* ── Main grid ──────────────────────────────────── */}
                <div className="grid lg:grid-cols-5 gap-7 lg:gap-10 items-start">

                    {/* ─ RIGHT info panel (first on mobile via order) ─ */}
                    <div className="lg:col-span-2 flex flex-col gap-5 order-1 lg:order-2">

                        {/* Availability card */}
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5 sm:p-6 hover:border-slate-600/60 transition-colors duration-300">
                            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-5">Current status</h3>
                            <div className="space-y-4">
                                {[
                                    {
                                        bg: 'bg-emerald-500/10 border-emerald-500/20',
                                        dot: true,
                                        title: 'Available for work',
                                        sub: 'Freelance · Internship · Part-time remote',
                                    },
                                    {
                                        bg: 'bg-blue-500/10 border-blue-500/20',
                                        icon: (
                                            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        ),
                                        title: 'Responds within 24 h',
                                        sub: 'Usually much faster',
                                    },
                                    {
                                        bg: 'bg-purple-500/10 border-purple-500/20',
                                        icon: (
                                            <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        ),
                                        title: 'Lucknow, India',
                                        sub: 'IST · UTC +5:30',
                                    },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3.5">
                                        <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${item.bg}`}>
                                            {item.dot ? (
                                                <span className="relative flex h-2.5 w-2.5">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                                                </span>
                                            ) : item.icon}
                                        </div>
                                        <div>
                                            <p className="text-white text-sm font-semibold leading-none mb-0.5">{item.title}</p>
                                            <p className="text-slate-500 text-xs">{item.sub}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Direct contact */}
                            <div className="mt-5 pt-4 border-t border-slate-700/50">
                                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">Direct contact</p>
                                <div className="flex items-center gap-2">
                                    <a href={`mailto:${CONTACT_EMAIL}`} className="flex items-center gap-2.5 group min-w-0">
                                        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                                            <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <span className="text-cyan-400 text-xs font-medium group-hover:text-cyan-300 transition-colors break-all leading-snug">
                                            {CONTACT_EMAIL}
                                        </span>
                                    </a>
                                    <button
                                        onClick={copyEmail}
                                        title="Copy email address"
                                        className={`shrink-0 w-7 h-7 rounded-lg border flex items-center justify-center transition-all duration-200 ${
                                            copied
                                                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                                                : 'bg-slate-700/40 border-slate-600/50 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 hover:bg-cyan-500/8'
                                        }`}
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
                        </div>

                        {/* Services card */}
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5 sm:p-6 hover:border-slate-600/60 transition-colors duration-300">
                            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">What I can help with</h3>
                            <div className="grid grid-cols-2 gap-2.5">
                                {services.map((s, i) => (
                                    <div
                                        key={i}
                                        className="group bg-slate-900/50 border border-slate-700/40 rounded-xl p-3.5 hover:border-slate-600/70 hover:bg-slate-800/60 transition-all duration-200 cursor-default"
                                    >
                                        <div className={`w-9 h-9 rounded-lg border flex items-center justify-center mb-2.5 transition-all duration-200 ${serviceIconBg[s.color]}`}>
                                            {s.icon}
                                        </div>
                                        <p className="text-white text-xs font-semibold leading-snug mb-1">{s.label}</p>
                                        <p className="text-slate-500 text-[11px] leading-snug">{s.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Process card */}
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5 sm:p-6 hover:border-slate-600/60 transition-colors duration-300">
                            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-5">How it works</h3>
                            <div>
                                {steps.map((p, i) => (
                                    <div key={i} className="flex items-start gap-3 relative">
                                        {i < steps.length - 1 && (
                                            <div className="absolute left-[17px] top-9 w-px h-6 bg-slate-700/70" />
                                        )}
                                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br border flex items-center justify-center shrink-0 ${p.color}`}>
                                            <span className="text-[11px] font-bold">{p.step}</span>
                                        </div>
                                        <div className="pb-6">
                                            <p className="text-white text-sm font-semibold">{p.title}</p>
                                            <p className="text-slate-500 text-xs">{p.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* ─ LEFT form ─────────────────────────────────── */}
                    <div className="lg:col-span-3 order-2 lg:order-1">
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
                                        <span className={`text-xs tabular-nums font-medium transition-colors ${formData.message.length > 900 ? 'text-rose-400' : 'text-slate-600'}`}>
                                            {formData.message.length}&thinsp;/&thinsp;1000
                                        </span>
                                    </div>
                                    <div className={fieldClass('message')}>
                                        <textarea
                                            id="message" name="message"
                                            rows="7"
                                            maxLength={1000}
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
                                    <a
                                        href="mailto:kumar.gaurav.yadav2007@gmail.com"
                                        className="text-xs text-cyan-500 hover:text-cyan-400 transition-colors underline underline-offset-2 whitespace-nowrap"
                                    >
                                        Or email me directly &rarr;
                                    </a>
                                </div>

                            </form>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default Contact

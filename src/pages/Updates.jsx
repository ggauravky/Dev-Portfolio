// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import ScrollReveal from '../components/ScrollReveal'
import useSEO from '../hooks/useSEO'

const updates = [
    {
        version: 'v1.0.0',
        date: 'Jan 10, 2026',
        title: 'Initial Portfolio Release',
        headline: '🎉 v1.0.0 - First Stable Release of Dev-Portfolio',
        description: 'This marks the first official and stable release of my personal developer portfolio project - Dev-Portfolio - designed to showcase who I am, what I build, and how I think as a BCA student, developer, and tech enthusiast.',
        sections: [
            {
                title: 'What This Release Includes',
                icon: '✨',
                tone: 'emerald',
                items: [
                    'A modern and responsive UI built with React + Vite and styled using Tailwind CSS.',
                    'Clean navigation and well-structured pages: Home, About, Skills, Projects, Contact, and Links.',
                    'A professional portfolio layout highlighting my skills in AI, Data Science, Python, and Web Development.',
                    'Integrated GitHub statistics, social links, and more in the About section.',
                    'Smooth performance and accessibility for mobile, tablet, and desktop users.',
                    'A personalized developer introduction written in simple and clear content.',
                ],
            },
            {
                title: 'Tech Stack',
                icon: '🛠️',
                tone: 'blue',
                items: [
                    'Frontend: React, Vite, Tailwind CSS, React Router',
                    'Design: Responsive layouts with utility-first styling',
                    'Version Control: Git & GitHub',
                ],
            },
            {
                title: 'Notes',
                icon: '📌',
                tone: 'amber',
                items: [
                    'This project is developed incrementally with real-world development patterns and will be improved regularly.',
                    'Future updates will include backend integration, contact admin panel enhancements, and additional UI/UX improvements.',
                    'Thank you for checking out my portfolio! Feedback and suggestions are welcome.',
                ],
            },
        ],
    },
    {
        version: 'v2.0.0',
        date: 'Jan 26, 2026',
        title: 'Portfolio Website - Major UI & Performance Update',
        headline: 'Portfolio Website - Major UI & Performance Update',
        description: 'This update focuses on better design, discoverability, and user experience.',
        sections: [
            {
                title: "What's New in This Release",
                icon: '✨',
                tone: 'cyan',
                items: [
                    '🎨 Major UI Improvements: Revamped the user interface across all pages for a cleaner, more modern look.',
                    '🔍 SEO Enhancements: Improved meta tags, structure, and content optimization to boost search visibility.',
                    '🧩 New Blogs & Projects Added: Added fresh blog posts and new projects to better showcase work and learning.',
                    '📱 Improved Responsiveness: Enhanced responsiveness across devices for a smoother experience on mobile, tablet, and desktop.',
                    '⚙️ Performance & Minor Fixes: General refinements, bug fixes, and small improvements for better usability.',
                ],
            },
            {
                title: 'Release Notes',
                icon: '🚀',
                tone: 'blue',
                items: [
                    'This update focuses on better design, discoverability, and user experience.',
                    'Full Changelog: v1.0.0...v2.0.0',
                ],
            },
        ],
    },
    {
        version: 'v2.1.0',
        date: 'Feb 12, 2026',
        title: 'SEO Overhaul, Project Data Refactor & UI Enhancements',
        headline: 'v2.1.0 - SEO Overhaul, Project Data Refactor & UI Enhancements',
        description: 'Focused on SEO quality, cleaner project data architecture, and visual consistency updates.',
        sections: [
            {
                title: 'Added',
                icon: '✨',
                tone: 'emerald',
                items: [
                    'Centralized projects data structure (src/data/projectsData.js)',
                    'Project categories system for better organization',
                    'Improved structured data (JSON-LD) implementation',
                    'Enhanced SEO metadata (titles, descriptions, social links)',
                    'Added prop-types dependency for better component validation',
                ],
            },
            {
                title: 'Improved',
                icon: '🎨',
                tone: 'blue',
                items: [
                    'Revamped Navbar (animations, gradients, responsive tweaks)',
                    'Enhanced Footer styling and interaction polish',
                    'Updated global CSS variables in src/index.css',
                    'Visual consistency updates across Home page, Projects page, and Blog page',
                ],
            },
            {
                title: 'SEO & Metadata',
                icon: '🔍',
                tone: 'rose',
                items: [
                    'Updated index.html metadata',
                    'Improved useSEO hook logic',
                    'Enhanced Open Graph & social sharing metadata',
                    'Refined JSON-LD structured data fields',
                ],
            },
        ],
    },
    {
        version: 'Latest',
        date: 'Apr 17, 2026',
        title: 'Major Platform Upgrade',
        headline: '🚀 Major Platform Upgrade - Payments, Analytics & UX Improvements',
        description: 'This release introduces a complete upgrade to the portfolio platform, including real-time payment handling, analytics tracking, and a refined user experience.',
        sections: [
            {
                title: 'Payment System (Cashfree Integration)',
                icon: '💳',
                tone: 'emerald',
                items: [
                    'Integrated secure payment gateway using Cashfree',
                    'Support Jar and Service Purchase flows fully implemented',
                    'Webhook-based payment verification (backend-first confirmation)',
                    'Real-time payment status reconciliation',
                    'Dedicated success page with transaction details',
                    'Robust error handling and retry-safe logic',
                ],
            },
            {
                title: 'Receipt & PDF System',
                icon: '📄',
                tone: 'blue',
                items: [
                    'Automatic PDF receipt generation after successful payment',
                    'Includes transaction ID, order ID, user details, timestamp, amount, and service info',
                    'Downloadable receipt (PDF + image)',
                    'Email delivery of receipt to user and admin',
                ],
            },
            {
                title: 'Authentication System',
                icon: '🔐',
                tone: 'violet',
                items: [
                    'Google Sign-In implemented',
                    'Automatic user data handling (name & email)',
                    'Email-based welcome & welcome-back system',
                    'Improved session handling and auth state sync',
                ],
            },
            {
                title: 'Umami Analytics Integration',
                icon: '📊',
                tone: 'cyan',
                items: [
                    'Added Umami analytics for privacy-friendly tracking',
                    'SPA route tracking implemented',
                    'Custom event tracking for blog support clicks, Google login, payment start & success, receipt downloads, and activity page visits',
                    'First-party proxy integration to improve compatibility with ad blockers',
                ],
            },
            {
                title: 'Activity System (My Activity Page)',
                icon: '📈',
                tone: 'amber',
                items: [
                    'Unified timeline for all user actions',
                    'Tracks payments, blog support, and login activity',
                    'Clean UI with aggregated events (no backend noise)',
                    'Receipt download and success navigation from activity',
                ],
            },
            {
                title: 'UX Improvements',
                icon: '🎯',
                tone: 'blue',
                items: [
                    'Post-payment processing screen (loading / waiting UI)',
                    'Cleaner success flow after transactions',
                    'Optimized activity timeline (single event per transaction)',
                    'Improved visual hierarchy and card-based layout',
                    'Better feedback for user actions',
                ],
            },
            {
                title: 'Technical Improvements',
                icon: '🛠️',
                tone: 'rose',
                items: [
                    'Refactored payment controller and lifecycle logic',
                    'Improved webhook validation and signature handling',
                    'Idempotent payment processing (duplicate-safe)',
                    'Optimized frontend state handling for payment success',
                    'Improved error handling across flows',
                    'Reduced unnecessary re-renders and duplicate tracking',
                ],
            },
            {
                title: 'Notes',
                icon: '⚠️',
                tone: 'amber',
                items: [
                    'Some analytics scripts may be blocked by browser extensions (expected behavior).',
                    'Minor non-critical warnings may appear from third-party scripts (Cashfree / Google).',
                ],
            },
            {
                title: 'Summary',
                icon: '🎉',
                tone: 'cyan',
                items: [
                    'Secure payments',
                    'Real-time tracking',
                    'Clean activity system',
                    'Professional UX',
                ],
            },
        ],
    },
]

const sectionToneClasses = {
    emerald: {
        border: 'border-emerald-500/30',
        bg: 'bg-emerald-500/10',
        title: 'text-emerald-300',
        bullet: 'text-emerald-300',
    },
    blue: {
        border: 'border-blue-500/30',
        bg: 'bg-blue-500/10',
        title: 'text-blue-300',
        bullet: 'text-blue-300',
    },
    rose: {
        border: 'border-rose-500/30',
        bg: 'bg-rose-500/10',
        title: 'text-rose-300',
        bullet: 'text-rose-300',
    },
    cyan: {
        border: 'border-cyan-500/30',
        bg: 'bg-cyan-500/10',
        title: 'text-cyan-300',
        bullet: 'text-cyan-300',
    },
    amber: {
        border: 'border-amber-500/30',
        bg: 'bg-amber-500/10',
        title: 'text-amber-300',
        bullet: 'text-amber-300',
    },
    violet: {
        border: 'border-violet-500/30',
        bg: 'bg-violet-500/10',
        title: 'text-violet-300',
        bullet: 'text-violet-300',
    },
    slate: {
        border: 'border-slate-500/30',
        bg: 'bg-slate-500/10',
        title: 'text-slate-200',
        bullet: 'text-slate-200',
    },
}

function Updates() {
    useSEO({
        title: 'Updates / Changelog | Gaurav Kumar Yadav',
        description: 'Track product updates and feature releases for Gaurav Kumar Yadav portfolio platform.',
        keywords: 'updates, changelog, product updates, portfolio releases, Gaurav Kumar Yadav',
        ogImage: 'https://ggauravky.vercel.app/images/profile.jpg',
    })

    return (
        <main className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
            <div className="pointer-events-none absolute -right-20 top-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -left-20 bottom-12 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

            <div className="relative z-10 mx-auto max-w-5xl">
                <ScrollReveal className="text-center mb-12 sm:mb-14">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-100 mb-4">
                        🚀 Product Updates
                    </h1>
                    <p className="mx-auto max-w-3xl text-slate-300 text-base sm:text-lg leading-relaxed">
                        Follow my journey of building and improving this portfolio platform.
                    </p>
                </ScrollReveal>

                <section className="relative">
                    <div className="pointer-events-none absolute left-3 top-0 bottom-0 hidden sm:block w-px bg-gradient-to-b from-cyan-400/40 via-blue-400/35 to-transparent" />

                    <div className="space-y-6 sm:space-y-8">
                        {updates.map((update, index) => (
                            <ScrollReveal key={update.version} delay={index * 90}>
                                <article className="group relative rounded-3xl border border-slate-700/70 bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-slate-950/90 p-5 sm:p-7 shadow-xl shadow-black/30 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/45 hover:shadow-cyan-500/10">
                                    <span className="hidden sm:inline-block absolute left-0 top-9 -translate-x-[31px] h-3 w-3 rounded-full border border-cyan-300/50 bg-cyan-400/70 shadow-[0_0_0_4px_rgba(15,23,42,0.9)]" />

                                    <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                                        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/35 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-cyan-200">
                                            {update.version}
                                        </div>
                                        <div className="inline-flex items-center rounded-full border border-slate-600/70 bg-slate-800/70 px-3 py-1 text-xs font-medium text-slate-300">
                                            📅 {update.date}
                                        </div>
                                    </div>

                                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-100 mb-6">
                                        {update.headline || `${update.version} - ${update.title}`}
                                    </h2>

                                    <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
                                        {update.description}
                                    </p>

                                    <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
                                        {update.sections.map((section) => {
                                            const tone = sectionToneClasses[section.tone] || sectionToneClasses.slate

                                            return (
                                                <section key={`${update.version}-${section.title}`} className={`rounded-2xl border ${tone.border} ${tone.bg} p-4 sm:p-5`}>
                                                    <h3 className={`text-sm font-bold uppercase tracking-wider ${tone.title} mb-3`}>
                                                        {section.icon} {section.title}
                                                    </h3>
                                                    <ul className="space-y-2 text-sm text-slate-200 leading-relaxed">
                                                        {section.items.map((item) => (
                                                            <li key={`${section.title}-${item}`} className="flex items-start gap-2">
                                                                <span className={`mt-[2px] ${tone.bullet}`}>•</span>
                                                                <span>{item}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </section>
                                            )
                                        })}
                                    </div>
                                </article>
                            </ScrollReveal>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    )
}

export default Updates

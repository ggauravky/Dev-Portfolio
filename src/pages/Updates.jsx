// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

// Updates (P6). The site changelog, newest release first. Each release is a
// section: version, date, type and status in the margin rail, the headline as
// a line-masked h2, the summary, then one hairline row per change group.
// "Now" (the accent's job) = the latest release.
// Motion moments: (1) line-masked release headings.

import PropTypes from 'prop-types'
import Reveal from '../components/Reveal'
import PageHead from '../components/page/PageHead'
import useSEO from '../hooks/useSEO'
import { staticSeo } from '../lib/seo'
import '../styles/updates.css'

const SEO = staticSeo('/updates')

const updates = [
    {
        version: 'v1.0.0',
        date: 'Jan 10, 2026',
        title: 'Initial Portfolio Release',
        headline: 'v1.0.0 - First Stable Release of Dev-Portfolio',
        description: 'This marks the first official and stable release of my personal developer portfolio project - Dev-Portfolio - designed to showcase who I am, what I build, and how I think as a BCA student, developer, and tech enthusiast.',
        sections: [
            {
                title: 'What This Release Includes',
                icon: 'sparkles',
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
                icon: 'wrench',
                tone: 'blue',
                items: [
                    'Frontend: React, Vite, Tailwind CSS, React Router',
                    'Design: Responsive layouts with utility-first styling',
                    'Version Control: Git & GitHub',
                ],
            },
            {
                title: 'Notes',
                icon: 'pin',
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
        headline: 'v2.0.0 - Major UI & Performance Update',
        description: 'This update focuses on better design, discoverability, and user experience.',
        sections: [
            {
                title: "What's New in This Release",
                icon: 'sparkles',
                tone: 'cyan',
                items: [
                    'Major UI Improvements: Revamped the user interface across all pages for a cleaner, more modern look.',
                    'SEO Enhancements: Improved meta tags, structure, and content optimization to boost search visibility.',
                    'New Blogs & Projects Added: Added fresh blog posts and new projects to better showcase work and learning.',
                    'Improved Responsiveness: Enhanced responsiveness across devices for a smoother experience on mobile, tablet, and desktop.',
                    'Performance & Minor Fixes: General refinements, bug fixes, and small improvements for better usability.',
                ],
            },
            {
                title: 'Release Notes',
                icon: 'rocket',
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
                icon: 'sparkles',
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
                icon: 'grid',
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
                icon: 'search',
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
        version: 'v3.0.0',
        date: 'Apr 17, 2026',
        title: 'Major Platform Upgrade',
        headline: 'v3.0.0 - Major Platform Upgrade',
        description: 'This release introduces a complete upgrade to the portfolio platform, including real-time payment handling, analytics tracking, and a refined user experience.',
        sections: [
            {
                title: 'Legacy Payment System',
                icon: 'credit-card',
                tone: 'emerald',
                items: [
                    'Integrated the former secure payment gateway',
                    'Support Jar and Service Purchase flows fully implemented',
                    'Webhook-based payment verification (backend-first confirmation)',
                    'Real-time payment status reconciliation',
                    'Dedicated success page with transaction details',
                    'Robust error handling and retry-safe logic',
                ],
            },
            {
                title: 'Legacy Receipt & PDF System',
                icon: 'file-text',
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
                icon: 'lock',
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
                icon: 'bar-chart',
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
                icon: 'trending-up',
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
                icon: 'target',
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
                icon: 'wrench',
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
                icon: 'alert',
                tone: 'amber',
                items: [
                    'Some analytics scripts may be blocked by browser extensions (expected behavior).',
                    'Minor non-critical warnings may appear from third-party scripts.',
                ],
            },
            {
                title: 'Summary',
                icon: 'check',
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
    {
        version: 'v4.0.0',
        date: 'Jun 05, 2026',
        title: 'System UI/UX Overhaul & Optimization',
        headline: 'v4.0.0 - Premium Visual System & Page Refinements',
        description: 'A comprehensive visual upgrade that introduces a premium editorial brutalist theme, optimizes navbar behavior, refines layouts, and styles core subpages and legal documents.',
        sections: [
            {
                title: 'Visual Core Overhaul',
                icon: 'grid',
                tone: 'emerald',
                items: [
                    'Migrated global layout theme to premium obsidian dark (#070708 & #0e0e11).',
                    'Redesigned components to use sharp, modular borders (#1a1a22) and rounded-lg geometries.',
                    'Optimized typography pairings utilizing high-contrast avant-garde Syne headings and Plus Jakarta Sans body structures.',
                ],
            },
            {
                title: 'Navbar & Layout Mechanics',
                icon: 'zap',
                tone: 'blue',
                items: [
                    'Removed generic logo icons to align name branding clearly on desktop and mobile views.',
                    'Shifted top relative offsets to site-header padding, resolving overlap issues and ensuring layout height calculation matches actual viewport render space.',
                    'Refined desktop floating bar and mobile full-screen slide-down drawer with backdrop-blur effects.', // design-allow: historical changelog text, not a style
                ],
            },
            {
                title: 'Subpages & Legal Pages',
                icon: 'wrench',
                tone: 'rose',
                items: [
                    'Re-themed browser ML demos (Image Analyzer and Prompt Improver) using obsidian inputs and custom status badges.',
                    'Redesigned Privacy, Terms, and Refund pages to align with dark editorial branding.',
                    'Overhauled legal list styling using clean Space Mono arrow indicators (→) and styled inline hyperlinks.',
                ],
            },
        ],
    },
    {
        version: 'v4.1.0',
        date: 'Jun 26, 2026',
        title: 'Lab Upgrades & Dev Terminal Release',
        headline: 'v4.1.0 - Lab Upgrades: Dev Terminal & Interactive Canvas',
        description: 'Introduces a fully interactive Unix-like bash terminal emulator inside the developer lab, along with cursor-reactive neural networks and mobile assistive command buttons.',
        sections: [
            {
                title: 'Developer Terminal Emulator',
                icon: 'terminal',
                tone: 'emerald',
                items: [
                    'Built a terminal emulator accepting system commands (help, about, skills, projects, clear).',
                    'Implemented tab autocomplete suggestions and keyboard history scrolling (ArrowUp/ArrowDown).',
                    'Designed a baseline-aligned block cursor with precise character tracking.',
                    'Added responsive auxiliary virtual touch buttons for mobile-friendly command execution.',
                ],
            },
            {
                title: 'Interactive Neural Physics',
                icon: 'brain',
                tone: 'rose',
                items: [
                    'Added HTML5 Canvas node grid to the homepage hero background.',
                    'Coded cursor anti-gravity repulsion physics pushing node clusters dynamically on hover.',
                    'Wired hover excitation ripples to main CTA buttons to enhance micro-interactions.',
                ],
            },
            {
                title: 'Lab Architecture',
                icon: 'zap',
                tone: 'blue',
                items: [
                    'Consolidated experimental utilities under a unified 2x2 card grid layout.',
                    'Optimized canvas frame rates with dynamic tab-visibility state checking.',
                    'Improved performance metrics across responsive viewports.',
                ],
            },
        ],
    },
    {
        version: 'v5.0.0',
        date: 'Jul 04, 2026',
        title: 'Flagship Interactive Journey & Algorithm Lab',
        headline: 'v5.0.0 - Flagship Interactive Journey & Algorithm Lab',
        description: 'A major release introducing the flagship professional timeline story, along with a real-time responsive Algorithm Lab for interactive DSA visualizations.',
        sections: [
            {
                title: 'Flagship Interactive Journey',
                icon: 'trending-up',
                tone: 'emerald',
                items: [
                    'Centralized data-driven model under src/data/journeyData.js for seamless scaling.',
                    'Premium story cards with high-ratio cover previews, dynamic badges, and responsive image galleries.',
                    'Contextual study-focus rendering for BCA academic milestones and educational timelines.',
                    'Smooth scroll-linked glow effects and IntersectionObserver active-year triggers.',
                ],
            },
            {
                title: 'Interactive Algorithm Lab',
                icon: 'sliders',
                tone: 'rose',
                items: [
                    'Real-time pathfinding visualization (Dijkstra, A* Search) with custom grid drawing controls.',
                    'Sorting visualizer (Bubble, Selection, Insertion, Quick, Merge) with adjustable speed slider.',
                    'Responsive control bars designed to remain fully interactive across mobile and desktop.',
                ],
            },
            {
                title: 'Core Upgrades',
                icon: 'zap',
                tone: 'blue',
                items: [
                    'BBD University BCA learning milestone added to timeline.',
                    'Completely responsive year navigators for desktop and mobile viewports.',
                    'Optimized rendering for canvas animations and lightweight obfuscated bundles.',
                ],
            },
        ],
    },
    {
        version: 'v5.1.0',
        date: 'Jul 24, 2026',
        title: 'Developer Experience & Navigation Update',
        headline: 'v5.1.0 - Developer Experience & Navigation Update',
        type: 'Major Feature Update',
        status: 'Stable',
        description: 'A major feature release introducing Developer Terminal 2.0, a brand-new Radial Navigation Menu, a Universal Command Palette, and a redesigned site loading experience.',
        sections: [
            {
                title: 'Developer Terminal 2.0',
                icon: 'terminal',
                tone: 'emerald',
                items: [
                    'Rebuilt with a premium UI & enhanced terminal experience.',
                    'Improved responsiveness across desktop, tablet, and mobile.',
                    'Better command handling and intelligent autocomplete.',
                    'Enhanced keyboard navigation and command history.',
                    'Better overall performance and execution speed.',
                ],
            },
            {
                title: 'Radial Navigation Menu',
                icon: 'compass',
                tone: 'violet',
                items: [
                    'Opens on right-click (desktop) and long-press (mobile).',
                    'Quick access to important portfolio sections and lab tools.',
                    'Smooth animations and responsive positioning.',
                    'Better accessibility and focus management.',
                    'Premium interaction design with subtle feedback.',
                ],
            },
            {
                title: 'Universal Command Palette',
                icon: 'search',
                tone: 'cyan',
                items: [
                    'Ctrl + K / Cmd + K global shortcut support.',
                    'Intelligent search with instant result ranking.',
                    'Faster access to pages, projects, and site actions.',
                    'Improved keyboard controls and fluid transitions.',
                ],
            },
            {
                title: 'New Loading Experience',
                icon: 'gauge',
                tone: 'blue',
                items: [
                    'Cleaner startup animation and brand preloader.',
                    'Better overall performance and reduced visual layout shift.',
                    'Smoother page entry transitions for a great first impression.',
                    'Reduced visual clutter and faster initial load.',
                ],
            },
        ],
    },
]

const NEWEST_FIRST = [...updates].reverse()
const monthYear = (date) => `${date.split(' ')[0]} ${date.slice(-4)}`
const releaseId = (version) => `release-${version.replace(/\./g, '-')}`

const HEAD = {
    rail: [`${updates.length} releases`, `${monthYear(updates[0].date)} to ${monthYear(updates[updates.length - 1].date)}`],
    title: 'Updates',
    lede: 'Follow my journey of building, refining, and scaling this personal portfolio platform.',
}

function Release({ update, latest }) {
    const id = releaseId(update.version)
    const headingId = `${id}-title`
    return (
        <section id={id} className="pg-section" aria-labelledby={headingId}>
            <Reveal className="page-wrap page-grid">
                <dl className="page-rail up-rail">
                    <div><dt className="sr-only">Version</dt><dd className="up-rail__version">{update.version}</dd></div>
                    <div><dt className="sr-only">Released</dt><dd><time>{update.date}</time></dd></div>
                    {update.type ? <div><dt className="sr-only">Type</dt><dd>{update.type}</dd></div> : null}
                    {update.status ? <div><dt className="sr-only">Status</dt><dd>{update.status}</dd></div> : null}
                    {latest ? (
                        <div>
                            <dt className="sr-only">Release</dt>
                            <dd className="pg-now"><span className="pg-dot" aria-hidden="true" />Latest</dd>
                        </div>
                    ) : null}
                </dl>
                <div className="page-main">
                    <h2 id={headingId} className="pg-h2 up-h2">
                        <span className="line-mask"><span className="line-mask__line">{update.headline || `${update.version} - ${update.title}`}</span></span>
                    </h2>
                    <p className="pg-intro">{update.description}</p>
                    <ul className="pg-rows">
                        {update.sections.map((section) => (
                            <li key={section.title} className="pg-row">
                                <h3 className="pg-row__label up-group">{section.title}</h3>
                                <ul className="pg-row__body up-items">
                                    {section.items.map((item) => <li key={item}>{item}</li>)}
                                </ul>
                            </li>
                        ))}
                    </ul>
                </div>
            </Reveal>
        </section>
    )
}

Release.propTypes = {
    update: PropTypes.shape({
        version: PropTypes.string.isRequired,
        date: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        headline: PropTypes.string,
        type: PropTypes.string,
        status: PropTypes.string,
        description: PropTypes.string.isRequired,
        sections: PropTypes.arrayOf(PropTypes.shape({
            title: PropTypes.string.isRequired,
            items: PropTypes.arrayOf(PropTypes.string).isRequired,
        })).isRequired,
    }).isRequired,
    latest: PropTypes.bool,
}

function Updates() {
    useSEO({
        ...SEO,
    })

    return (
        <main className="pg updates">
            <PageHead head={HEAD} />
            {NEWEST_FIRST.length ? (
                NEWEST_FIRST.map((update, i) => <Release key={update.version} update={update} latest={i === 0} />)
            ) : (
                <section className="pg-section">
                    <div className="page-wrap page-grid">
                        <p className="page-main pg-intro">No releases yet.</p>
                    </div>
                </section>
            )}
        </main>
    )
}

export default Updates

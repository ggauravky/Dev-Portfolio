// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

const TRUST_VARIANTS = {
    home: {
        eyebrow: 'Trust Signals',
        title: 'Secure Checkout. Clear Timeline. Public Proof.',
        subtitle: 'Everything important is visible before you take the next step.',
        checkout: 'Cashfree secure checkout',
        timeline: 'Clear delivery windows',
        response: 'First response usually within 24h',
        proof: 'Projects + GitHub are public',
    },
    services: {
        eyebrow: 'Book With Confidence',
        title: 'Trust Layer for Every Service',
        subtitle: 'Scope clarity, payment protection, and public work proof in one place.',
        checkout: 'Cashfree protected payments',
        timeline: 'Delivery window shown per service',
        response: 'Fast replies on service questions',
        proof: 'Live portfolio and repository proof',
    },
    booknow: {
        eyebrow: 'Secure Booking',
        title: 'Your Booking Flow Is Fully Traceable',
        subtitle: 'Payment verification, schedule clarity, and proof-backed delivery standards.',
        checkout: 'Gateway secured by Cashfree',
        timeline: 'Booking timeline shown up front',
        response: 'Booking updates within 24h',
        proof: 'Public project quality references',
    },
    support: {
        eyebrow: 'Safe Support',
        title: 'Support Flow With Verified Trust Signals',
        subtitle: 'Secure payment, transparent handling, and visible engineering proof.',
        checkout: 'Cashfree secure support checkout',
        timeline: 'Receipt and confirmation after verification',
        response: 'Support acknowledgements within 24h',
        proof: 'Projects and GitHub stay open to review',
    },
}

function TrustStrip({ variant = 'home', className = '' }) {
    const content = TRUST_VARIANTS[variant] || TRUST_VARIANTS.home

    return (
        <section className={`rounded-lg border border-[#1a1a22] bg-[#0e0e11] p-6 sm:p-8 hover:border-toxic/30 hover:shadow-2xl hover:shadow-toxic/5 transition-all duration-350 relative overflow-hidden ${className}`.trim()}>
            {/* Subtle glow orb */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-toxic/3 rounded-full blur-3xl pointer-events-none" />

            <span className="inline-flex items-center gap-2 text-toxic text-[10px] font-mono tracking-widest uppercase mb-4 px-2.5 py-1 bg-toxic/5 rounded border border-toxic/20">
                <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-toxic opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-toxic" />
                </span>
                {content.eyebrow}
            </span>

            <h3 className="text-2xl sm:text-3xl font-display font-black text-slate-100 tracking-tight leading-tight">{content.title}</h3>
            <p className="mt-2 text-zinc-400 text-sm leading-relaxed max-w-2xl">{content.subtitle}</p>

            <div className="mt-6 grid grid-cols-1 min-[470px]:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Secure Checkout */}
                <div className="rounded border border-[#1a1a22] bg-[#070708] p-4 hover:border-toxic/20 transition-colors duration-300">
                    <div className="flex items-center gap-2.5 mb-2">
                        <svg className="w-4 h-4 text-toxic shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                        <p className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">Secure Checkout</p>
                    </div>
                    <p className="text-sm font-semibold text-white leading-relaxed">{content.checkout}</p>
                </div>

                {/* Delivery Timeline */}
                <div className="rounded border border-[#1a1a22] bg-[#070708] p-4 hover:border-cyber/20 transition-colors duration-300">
                    <div className="flex items-center gap-2.5 mb-2">
                        <svg className="w-4 h-4 text-cyber shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
                        </svg>
                        <p className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">Delivery Timeline</p>
                    </div>
                    <p className="text-sm font-semibold text-white leading-relaxed">{content.timeline}</p>
                </div>

                {/* Response SLA */}
                <div className="rounded border border-[#1a1a22] bg-[#070708] p-4 hover:border-toxic/20 transition-colors duration-300">
                    <div className="flex items-center gap-2.5 mb-2">
                        <svg className="w-4 h-4 text-toxic shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025 4.486 4.486 0 00-.407-3.407C3.57 14.124 3 13.124 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                        </svg>
                        <p className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">Response SLA</p>
                    </div>
                    <p className="text-sm font-semibold text-white leading-relaxed">{content.response}</p>
                </div>

                {/* Public Proof */}
                <div className="rounded border border-[#1a1a22] bg-[#070708] p-4 hover:border-cyber/20 transition-colors duration-300">
                    <div className="flex items-center gap-2.5 mb-2">
                        <svg className="w-4 h-4 text-cyber shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                        </svg>
                        <p className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">Public Proof</p>
                    </div>
                    <p className="text-sm font-semibold text-white leading-relaxed">{content.proof}</p>
                </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3 relative z-10">
                <Link
                    to="/projects"
                    className="inline-flex items-center justify-center rounded bg-[#c5f82a] text-[#070708] px-5 py-3 text-xs font-mono uppercase font-bold border-none shadow-[2px_2px_0px_0px_rgba(197,248,42,0.3)] hover:shadow-none hover:translate-y-[2px] transition-all duration-200"
                >
                    View Public Projects
                </Link>
                <a
                    href="https://github.com/ggauravky"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded px-5 py-3 text-xs font-mono uppercase font-bold text-white border border-[#1a1a22] bg-[#0e0e11] hover:border-toxic/30 hover:text-toxic transition-all duration-200"
                >
                    Open GitHub Proof
                </a>
            </div>
        </section>
    )
}

TrustStrip.propTypes = {
    variant: PropTypes.oneOf(['home', 'services', 'booknow', 'support']),
    className: PropTypes.string,
}

export default TrustStrip

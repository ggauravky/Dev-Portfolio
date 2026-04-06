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
        <section className={`rounded-3xl border border-slate-700/70 bg-gradient-to-br from-slate-800/70 to-slate-900/80 p-5 sm:p-7 ${className}`.trim()}>
            <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-300 font-semibold">{content.eyebrow}</p>
            <h3 className="mt-2 text-2xl sm:text-3xl font-black text-slate-100 leading-tight">{content.title}</h3>
            <p className="mt-2 text-slate-400 text-sm sm:text-base">{content.subtitle}</p>

            <div className="mt-5 grid grid-cols-1 min-[470px]:grid-cols-2 lg:grid-cols-4 gap-3.5">
                <div className="rounded-2xl border border-cyan-500/25 bg-cyan-500/10 p-4">
                    <p className="text-[10px] uppercase tracking-widest text-cyan-300">Secure Checkout</p>
                    <p className="mt-1 text-sm text-cyan-100 leading-relaxed">{content.checkout}</p>
                </div>
                <div className="rounded-2xl border border-blue-500/25 bg-blue-500/10 p-4">
                    <p className="text-[10px] uppercase tracking-widest text-blue-300">Delivery Timeline</p>
                    <p className="mt-1 text-sm text-blue-100 leading-relaxed">{content.timeline}</p>
                </div>
                <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-4">
                    <p className="text-[10px] uppercase tracking-widest text-emerald-300">Response SLA</p>
                    <p className="mt-1 text-sm text-emerald-100 leading-relaxed">{content.response}</p>
                </div>
                <div className="rounded-2xl border border-violet-500/25 bg-violet-500/10 p-4">
                    <p className="text-[10px] uppercase tracking-widest text-violet-300">Public Proof Links</p>
                    <p className="mt-1 text-sm text-violet-100 leading-relaxed">{content.proof}</p>
                </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2.5">
                <Link
                    to="/projects"
                    className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 transition-all duration-300"
                >
                    View Public Projects
                </Link>
                <a
                    href="https://github.com/ggauravky"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-200 border border-slate-600 hover:border-cyan-500/50 hover:text-cyan-300 transition-all duration-300"
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

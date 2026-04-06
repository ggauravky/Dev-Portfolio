// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { Link, useSearchParams } from 'react-router-dom'
import PropTypes from 'prop-types'
import useSEO from '../hooks/useSEO'
import { getServiceBySlug } from '../data/servicesData'

const MAINTENANCE_CONFIG = {
    payment: {
        badge: 'Payment Gateway Update',
        heading: 'Checkout Under Maintenance',
        description: 'Secure payment flow is being upgraded for better reliability and clarity. Booking and payments are temporarily paused.',
        seoTitle: 'Payment Gateway Under Construction | Gaurav Kumar Yadav',
        seoDescription: 'Payment gateway is under maintenance. Please check back soon to complete secure service booking.',
        primaryCta: { label: 'Back to Services', to: '/services' },
        secondaryCta: { label: 'Start a Conversation', to: '/contact' },
        status: [
            { title: 'Gateway reliability patch', state: 'in-progress' },
            { title: 'Checkout callback hardening', state: 'in-progress' },
            { title: 'Final payment verification checks', state: 'queued' },
        ],
    },
    'lab-chatbot': {
        badge: 'Lab Feature Update',
        heading: 'AI Chatbot Under Maintenance',
        description: 'The chatbot experience is being tuned for more reliable responses and better context handling.',
        seoTitle: 'AI Chatbot Under Construction | Gaurav Lab',
        seoDescription: 'Gaurav Lab AI Chatbot is under maintenance. Please check back soon.',
        primaryCta: { label: 'Back to Lab', to: '/lab' },
        secondaryCta: { label: 'Start a Conversation', to: '/contact' },
        status: [
            { title: 'Model response stability tuning', state: 'in-progress' },
            { title: 'Conversation context optimization', state: 'in-progress' },
            { title: 'Monitoring and quality checks', state: 'queued' },
        ],
    },
    'lab-ml': {
        badge: 'Lab Feature Update',
        heading: 'ML Demos Under Maintenance',
        description: 'Browser ML demos are being refreshed for smoother performance, clearer outputs, and more stable loading behavior.',
        seoTitle: 'ML Demos Under Construction | Gaurav Lab',
        seoDescription: 'Gaurav Lab ML demos are under maintenance. Please check back soon.',
        primaryCta: { label: 'Back to Lab', to: '/lab' },
        secondaryCta: { label: 'Start a Conversation', to: '/contact' },
        status: [
            { title: 'Model loading reliability improvements', state: 'in-progress' },
            { title: 'Inference UI clarity updates', state: 'in-progress' },
            { title: 'Cross-device QA pass', state: 'queued' },
        ],
    },
    'lab-consistency': {
        badge: 'Lab Feature Update',
        heading: 'Consistency Dashboard Under Maintenance',
        description: 'Live stat cards and data-loading behavior are being refined to deliver more consistent performance.',
        seoTitle: 'Consistency Dashboard Under Construction | Gaurav Lab',
        seoDescription: 'Gaurav Lab consistency dashboard is under maintenance. Please check back soon.',
        primaryCta: { label: 'Back to Lab', to: '/lab' },
        secondaryCta: { label: 'Start a Conversation', to: '/contact' },
        status: [
            { title: 'External stats source health checks', state: 'in-progress' },
            { title: 'Fallback rendering polish', state: 'in-progress' },
            { title: 'Final UI consistency pass', state: 'queued' },
        ],
    },
}

const resolveVariantFromPath = (variant, pathname) => {
    if (variant) return variant

    if (pathname === '/lab/gaurav-chatbot') return 'lab-chatbot'
    if (pathname === '/lab/ml-demos') return 'lab-ml'
    if (pathname === '/lab/consistency-dashboard') return 'lab-consistency'

    return 'payment'
}

const statusPillClass = {
    done: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    'in-progress': 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    queued: 'border-slate-600/50 bg-slate-800/80 text-slate-300',
}

const statusLabel = {
    done: 'Done',
    'in-progress': 'In Progress',
    queued: 'Queued',
}

function UnderConstruction({ variant = '' }) {
    const [params] = useSearchParams()
    const pathname = globalThis.location?.pathname || ''

    const serviceSlug = params.get('service') || ''
    const service = getServiceBySlug(serviceSlug)

    const resolvedVariant = resolveVariantFromPath(variant, pathname)
    const config = MAINTENANCE_CONFIG[resolvedVariant] || MAINTENANCE_CONFIG.payment

    useSEO({
        title: config.seoTitle,
        description: config.seoDescription,
        keywords: 'payment gateway under construction, booking temporarily unavailable',
        ogImage: 'https://ggauravky.vercel.app/images/profile.jpg',
    })

    return (
        <div className="min-h-screen bg-slate-950 relative overflow-hidden">
            <div className="absolute -top-20 -right-24 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
                <div className="mx-auto max-w-3xl rounded-3xl border border-slate-700/70 bg-gradient-to-br from-slate-900/90 via-slate-900/95 to-indigo-950/95 p-7 sm:p-10 lg:p-12 text-center shadow-2xl shadow-black/50">
                    <span className="inline-flex items-center rounded-full border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-amber-300">
                        {config.badge}
                    </span>

                    <h1 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-black leading-tight text-slate-100">
                        {config.heading}
                    </h1>

                    <p className="mt-4 text-slate-300 text-base sm:text-lg leading-relaxed">
                        {config.description}
                    </p>

                    {service && resolvedVariant === 'payment' ? (
                        <div className="mt-6 rounded-2xl border border-cyan-500/25 bg-slate-900/65 p-4 sm:p-5">
                            <p className="text-xs uppercase tracking-[0.18em] text-cyan-300 font-semibold">Selected Service</p>
                            <p className="mt-2 text-2xl font-bold text-slate-100">{service.title}</p>
                            <p className="mt-1 text-slate-400 text-sm">Pricing: {service.priceLabel}</p>
                        </div>
                    ) : null}

                    <div className="mt-6 rounded-2xl border border-slate-700/70 bg-slate-900/70 p-4 sm:p-5 text-left">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 font-semibold">Status Updates</p>
                        <div className="mt-3 space-y-2.5">
                            {config.status.map((item) => (
                                <div key={item.title} className="flex items-center justify-between gap-3 rounded-xl border border-slate-700 bg-slate-800/75 px-3 py-2.5">
                                    <p className="text-sm text-slate-200">{item.title}</p>
                                    <span className={`inline-flex shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${statusPillClass[item.state] || statusPillClass.queued}`}>
                                        {statusLabel[item.state] || 'Queued'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-8 grid sm:grid-cols-2 gap-3.5">
                        <Link
                            to={config.primaryCta.to}
                            className="inline-flex items-center justify-center rounded-xl px-5 py-3 font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 transition-all duration-300 hover:scale-[1.02]"
                        >
                            {config.primaryCta.label}
                        </Link>
                        <Link
                            to={config.secondaryCta.to}
                            className="inline-flex items-center justify-center rounded-xl px-5 py-3 font-semibold text-slate-100 border border-slate-600 hover:border-cyan-400/50 hover:text-cyan-300 transition-all duration-300"
                        >
                            {config.secondaryCta.label}
                        </Link>
                    </div>

                    <p className="mt-5 text-xs text-slate-500">
                        Thank you for your patience. This module will be available again after final checks.
                    </p>
                </div>
            </div>
        </div>
    )
}

UnderConstruction.propTypes = {
    variant: PropTypes.oneOf(['', 'payment', 'lab-chatbot', 'lab-ml', 'lab-consistency']),
}

export default UnderConstruction

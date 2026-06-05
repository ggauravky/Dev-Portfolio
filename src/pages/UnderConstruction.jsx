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
    done: 'border-toxic/30 bg-toxic/10 text-toxic',
    'in-progress': 'border-cyber/30 bg-cyber/10 text-cyber',
    queued: 'border-[#1a1a22] bg-[#070708] text-[#52525b]',
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
        <div className="min-h-screen bg-[#070708] relative overflow-hidden">
            {/* Ambient gradients */}
            <div className="absolute top-[-80px] right-[-80px] w-[480px] h-[480px] bg-toxic/3 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-60px] left-[-60px] w-[420px] h-[420px] bg-cyber/3 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
                <div className="mx-auto max-w-3xl rounded-lg border border-[#1a1a22] bg-[#0e0e11] p-7 sm:p-10 lg:p-12 text-center shadow-2xl">
                    <span className="inline-flex items-center gap-2 text-cyber text-[10px] font-mono tracking-widest uppercase mb-5 px-3 py-1.5 bg-cyber/5 rounded border border-cyber/20">
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber opacity-75" />
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyber" />
                        </span>{' '}
                        {config.badge}
                    </span>

                    <h1 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-display font-black leading-tight text-white uppercase tracking-tight">
                        {config.heading}
                    </h1>

                    <p className="mt-4 text-[#a1a1aa] text-base leading-relaxed max-w-xl mx-auto">
                        {config.description}
                    </p>

                    {service && resolvedVariant === 'payment' ? (
                        <div className="mt-6 rounded border border-toxic/20 bg-toxic/5 p-4 sm:p-5">
                            <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-toxic font-bold">Selected Service</p>
                            <p className="mt-2 text-2xl font-display font-bold text-slate-100">{service.title}</p>
                            <p className="mt-1 text-[#a1a1aa] text-sm font-mono">Pricing: {service.priceLabel}</p>
                        </div>
                    ) : null}

                    <div className="mt-6 rounded border border-[#1a1a22] bg-[#070708] p-4 sm:p-5 text-left">
                        <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#52525b] font-bold">Status Updates</p>
                        <div className="mt-3 space-y-2.5">
                            {config.status.map((item) => (
                                <div key={item.title} className="flex items-center justify-between gap-3 rounded border border-[#1a1a22] bg-[#0e0e11] px-4 py-3">
                                    <p className="text-sm text-zinc-300 font-sans">{item.title}</p>
                                    <span className={`inline-flex shrink-0 rounded border px-2.5 py-1 text-[9px] font-mono uppercase tracking-wider ${statusPillClass[item.state] || statusPillClass.queued}`}>
                                        {statusLabel[item.state] || 'Queued'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-8 grid sm:grid-cols-2 gap-3.5">
                        <Link
                            to={config.primaryCta.to}
                            className="inline-flex items-center justify-center rounded bg-[#c5f82a] text-[#070708] px-5 py-3.5 text-xs font-mono uppercase font-bold border-none shadow-[2px_2px_0px_0px_rgba(197,248,42,0.3)] hover:shadow-none hover:translate-y-[2px] transition-all duration-200"
                        >
                            {config.primaryCta.label}
                        </Link>
                        <Link
                            to={config.secondaryCta.to}
                            className="inline-flex items-center justify-center rounded px-5 py-3.5 text-xs font-mono uppercase font-bold text-white border border-[#1a1a22] bg-[#0e0e11] hover:border-toxic/30 hover:text-toxic transition-all duration-200"
                        >
                            {config.secondaryCta.label}
                        </Link>
                    </div>

                    <p className="mt-6 text-xs text-[#52525b] font-mono">
                        // Thank you for your patience. This module will be available again after final checks.
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

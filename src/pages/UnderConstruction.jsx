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
}

const resolveVariantFromPath = (variant) => {
    if (variant) return variant
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

    const serviceSlug = params.get('service') || ''
    const service = getServiceBySlug(serviceSlug)

    const resolvedVariant = resolveVariantFromPath(variant)
    const config = MAINTENANCE_CONFIG[resolvedVariant] || MAINTENANCE_CONFIG.payment

    useSEO({
        title: service ? `${service.title} Checkout Under Maintenance` : config.seoTitle,
        description: service
            ? `Checkout for ${service.title} is currently under maintenance. Contact Gaurav Kumar Yadav directly.`
            : config.seoDescription,
        keywords: 'payment gateway under construction, booking temporarily unavailable',
    })

    return (
        <div className="min-h-screen bg-[#070708] text-white flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <div className="max-w-xl w-full bg-[#0e0e11] border border-[#1a1a22] rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-toxic/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-toxic/10 border border-toxic/20 text-toxic mb-6">
                        <span className="w-2 h-2 rounded-full bg-toxic animate-pulse" />
                        {config.badge}
                    </span>

                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-black tracking-tight mb-4">
                        {config.heading}
                    </h1>

                    <p className="text-[#a1a1aa] text-sm sm:text-base leading-relaxed mb-6">
                        {config.description}
                    </p>

                    {service && (
                        <div className="mb-6 p-4 rounded-2xl bg-[#141419] border border-[#22222c]">
                            <p className="text-xs text-[#71717a] uppercase font-mono tracking-wider">Service Requested</p>
                            <p className="text-base font-bold text-white mt-1">{service.title}</p>
                            <p className="mt-1 text-[#a1a1aa] text-sm font-mono">Pricing: {service.priceLabel}</p>
                        </div>
                    )}

                    <div className="space-y-3 mb-8">
                        <p className="text-xs font-mono uppercase tracking-wider text-[#71717a]">System Update Checklist</p>
                        {config.status.map((item) => (
                            <div key={item.title} className="flex items-center justify-between p-3 rounded-xl bg-[#141419] border border-[#1a1a22] text-xs font-mono">
                                <span className="text-[#d4d4d8]">{item.title}</span>
                                <span className={`px-2.5 py-0.5 rounded-full border text-[10px] uppercase tracking-wider ${statusPillClass[item.state]}`}>
                                    {statusLabel[item.state] || 'Queued'}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3">
                        <Link
                            to={config.primaryCta.to}
                            className="w-full sm:w-auto text-center px-6 py-3 rounded-2xl bg-toxic text-black font-semibold text-sm hover:opacity-90 transition-opacity"
                        >
                            {config.primaryCta.label}
                        </Link>
                        <Link
                            to={config.secondaryCta.to}
                            className="w-full sm:w-auto text-center px-6 py-3 rounded-2xl bg-[#141419] border border-[#22222c] text-white font-semibold text-sm hover:bg-[#1a1a22] transition-colors"
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
    variant: PropTypes.oneOf(['', 'payment']),
}

export default UnderConstruction

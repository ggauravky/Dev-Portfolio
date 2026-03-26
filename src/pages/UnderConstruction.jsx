// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { Link, useSearchParams } from 'react-router-dom'
import useSEO from '../hooks/useSEO'
import { getServiceBySlug } from '../data/servicesData'

function UnderConstruction() {
    const [params] = useSearchParams()
    const serviceSlug = params.get('service') || ''
    const service = getServiceBySlug(serviceSlug)

    useSEO({
        title: 'Payment Gateway Under Construction | Gaurav Kumar Yadav',
        description: 'Payment gateway is under construction. Please check back soon to complete secure service booking.',
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
                        Payment Gateway Update
                    </span>

                    <h1 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-black leading-tight text-slate-100">
                        Under Construction
                    </h1>

                    <p className="mt-4 text-slate-300 text-base sm:text-lg leading-relaxed">
                        Secure payment gateway is being improved for a better checkout experience.
                        Booking and payments are temporarily paused.
                    </p>

                    {service ? (
                        <div className="mt-6 rounded-2xl border border-cyan-500/25 bg-slate-900/65 p-4 sm:p-5">
                            <p className="text-xs uppercase tracking-[0.18em] text-cyan-300 font-semibold">Selected Service</p>
                            <p className="mt-2 text-2xl font-bold text-slate-100">{service.title}</p>
                            <p className="mt-1 text-slate-400 text-sm">Pricing: {service.priceLabel}</p>
                        </div>
                    ) : null}

                    <div className="mt-8 grid sm:grid-cols-2 gap-3.5">
                        <Link
                            to="/services"
                            className="inline-flex items-center justify-center rounded-xl px-5 py-3 font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 transition-all duration-300 hover:scale-[1.02]"
                        >
                            Back to Services
                        </Link>
                        <Link
                            to="/contact"
                            className="inline-flex items-center justify-center rounded-xl px-5 py-3 font-semibold text-slate-100 border border-slate-600 hover:border-cyan-400/50 hover:text-cyan-300 transition-all duration-300"
                        >
                            Contact for Updates
                        </Link>
                    </div>

                    <p className="mt-5 text-xs text-slate-500">
                        Thank you for your patience. Payments will be enabled again very soon.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default UnderConstruction

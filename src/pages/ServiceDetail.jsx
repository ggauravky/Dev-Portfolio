// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { Link, Navigate, useParams } from 'react-router-dom'
import PropTypes from 'prop-types'
import useSEO from '../hooks/useSEO'
import { getServiceBySlug } from '../data/servicesData'

function SectionCard({ title, items }) {
    return (
        <div className="rounded-2xl border border-slate-700/70 bg-slate-800/60 p-5 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold text-slate-100 mb-4">{title}</h3>
            <ul className="space-y-3">
                {items.map((item) => (
                    <li key={item} className="text-slate-300 text-sm sm:text-base flex gap-2.5 leading-relaxed">
                        <span className="mt-[7px] h-2 w-2 shrink-0 rounded-full bg-cyan-400" />
                        <span>{item}</span>
                    </li>
                ))}
            </ul>
        </div>
    )
}

SectionCard.propTypes = {
    title: PropTypes.string.isRequired,
    items: PropTypes.arrayOf(PropTypes.string).isRequired,
}

function ServiceDetail({ forcedSlug = '' }) {
    const params = useParams()
    const slug = forcedSlug || params.slug || ''
    const service = getServiceBySlug(slug)

    if (!service) {
        return <Navigate to="/services" replace />
    }

    useSEO({
        title: `${service.title} - Gaurav Kumar Yadav Services`,
        description: `${service.summary} Pricing: ${service.priceLabel}. Secure checkout via Cashfree with UPI, cards, and netbanking.`,
        keywords: `${service.title}, developer service, ${service.category}, secure checkout, cashfree`,
        ogImage: 'https://ggauravky.vercel.app/images/profile.jpg',
    })

    return (
        <div className="min-h-screen bg-slate-900 relative overflow-hidden">
            <div className="absolute -top-24 right-0 w-[420px] h-[420px] rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 left-0 w-[420px] h-[420px] rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
                <div className="mb-8 sm:mb-10">
                    <Link
                        to="/services"
                        className="inline-flex items-center gap-2 text-sm text-cyan-300 hover:text-cyan-200 transition-colors"
                    >
                        <span>←</span>
                        <span>Back to Services</span>
                    </Link>
                </div>

                <section className="rounded-3xl border border-slate-700/70 bg-gradient-to-br from-slate-800/70 via-slate-900/80 to-slate-900/90 p-6 sm:p-8 lg:p-10 mb-8 sm:mb-10">
                    <div className="flex flex-wrap items-center gap-3 mb-5">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
                            {service.category}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
                            Secure Booking
                        </span>
                        {service.badge ? (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase border border-blue-500/30 bg-blue-500/10 text-blue-300">
                                {service.badge}
                            </span>
                        ) : null}
                    </div>

                    <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 items-start">
                        <div className="lg:col-span-2">
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight text-slate-100 mb-4">
                                {service.title}
                            </h1>
                            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-3xl">
                                {service.summary}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/60 p-5 sm:p-6">
                            <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Pricing</p>
                            <p className="text-2xl sm:text-3xl font-extrabold text-cyan-300">{service.priceLabel}</p>
                            <p className="text-xs text-slate-400 mt-3">Secure checkout via Cashfree. Supports UPI, cards, and netbanking.</p>
                            <div className="mt-5 flex flex-col gap-3">
                                <Link
                                    to={`/booknow?service=${service.slug}`}
                                    className="inline-flex justify-center items-center rounded-xl px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all duration-300 hover:scale-[1.02]"
                                >
                                    Book This Service
                                </Link>
                                <Link
                                    to="/projects"
                                    className="inline-flex justify-center items-center rounded-xl px-4 py-3 text-sm font-semibold text-slate-200 border border-slate-700 hover:border-cyan-500/40 hover:text-cyan-300 transition-colors"
                                >
                                    See Related Projects
                                </Link>
                                <a
                                    href="https://github.com/ggauravky"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex justify-center items-center rounded-xl px-4 py-3 text-sm font-semibold text-slate-200 border border-slate-700 hover:border-slate-500 hover:text-white transition-colors"
                                >
                                    View GitHub Work
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="grid md:grid-cols-2 gap-5 sm:gap-6 mb-8 sm:mb-10">
                    <SectionCard title="What You Get" items={service.deliverables} />
                    <SectionCard title="Core Features" items={service.features} />
                    <SectionCard title="What You Need to Provide" items={service.youProvide} />
                    <SectionCard title="Best For" items={service.bestFor} />
                </section>

                <section className="rounded-2xl border border-slate-700/70 bg-slate-800/55 p-6 sm:p-7 mb-8 sm:mb-10">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-100 mb-3">Process and Trust</h2>
                    <div className="grid lg:grid-cols-2 gap-5 sm:gap-6">
                        <ul className="space-y-3 text-slate-300 text-sm sm:text-base">
                            <li className="flex gap-2.5"><span className="text-cyan-400">01</span><span>Scope confirmation before execution</span></li>
                            <li className="flex gap-2.5"><span className="text-cyan-400">02</span><span>Transparent communication and status updates</span></li>
                            <li className="flex gap-2.5"><span className="text-cyan-400">03</span><span>Delivery focused on production quality</span></li>
                        </ul>
                        <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-4 sm:p-5">
                            <p className="text-sm text-slate-300 leading-relaxed">
                                Timeline: {service.timeline}
                            </p>
                            <p className="text-xs text-slate-400 mt-3">
                                For confidence, check my work quality in the Projects section and public repositories before booking.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-slate-800/80 via-slate-900/90 to-slate-800/80 p-6 sm:p-8 text-center">
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-3">Ready to Start {service.title}?</h2>
                    <p className="text-slate-300 max-w-2xl mx-auto">
                        Go to the Services page and book securely. If you want to evaluate my experience first, explore projects and GitHub profile.
                    </p>
                    <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                            to={`/booknow?service=${service.slug}`}
                            className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 transition-all duration-300"
                        >
                            Book This Service
                        </Link>
                        <Link
                            to="/projects"
                            className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-slate-200 border border-slate-700 hover:border-cyan-500/40 hover:text-cyan-300 transition-colors"
                        >
                            Open Projects
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    )
}

ServiceDetail.propTypes = {
    forcedSlug: PropTypes.string,
}

export default ServiceDetail

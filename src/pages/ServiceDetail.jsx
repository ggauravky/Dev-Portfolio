// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { Link, Navigate, useParams } from 'react-router-dom'
import PropTypes from 'prop-types'
import useSEO from '../hooks/useSEO'
import { getServiceBySlug } from '../data/servicesData'
import StickyMobileCTA from '../components/StickyMobileCTA'

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

function PricingFaq({ items }) {
    if (!Array.isArray(items) || items.length === 0) {
        return null
    }

    return (
        <div className="mt-4 rounded-xl border border-slate-700/70 bg-slate-900/60 p-3.5">
            <p className="text-[11px] uppercase tracking-widest text-slate-500 mb-2">Pricing Micro-FAQ</p>
            <div className="space-y-2">
                {items.map((item) => (
                    <details key={item.question} className="group rounded-lg border border-slate-700/70 bg-slate-800/60 px-3 py-2.5">
                        <summary className="cursor-pointer list-none text-xs text-slate-200 font-semibold flex items-center justify-between gap-2">
                            <span>{item.question}</span>
                            <span className="text-slate-400 group-open:hidden">+</span>
                            <span className="text-slate-400 hidden group-open:inline">-</span>
                        </summary>
                        <p className="mt-2 text-xs text-slate-400 leading-relaxed">{item.answer}</p>
                    </details>
                ))}
            </div>
        </div>
    )
}

PricingFaq.propTypes = {
    items: PropTypes.arrayOf(
        PropTypes.shape({
            question: PropTypes.string.isRequired,
            answer: PropTypes.string.isRequired,
        })
    ).isRequired,
}

function ServiceDetail({ forcedSlug = '' }) {
    const params = useParams()
    const slug = forcedSlug || params.slug || ''
    const service = getServiceBySlug(slug)

    const seoTitle = service
        ? `${service.title} - Gaurav Kumar Yadav Services`
        : 'Services - Gaurav Kumar Yadav'
    const seoDescription = service
        ? `${service.summary} Pricing: ${service.priceLabel}. Secure checkout via Cashfree with UPI, cards, and netbanking.`
        : 'Explore development services with secure checkout and fast delivery.'
    const seoKeywords = service
        ? `${service.title}, developer service, ${service.category}, secure checkout, cashfree`
        : 'developer services, secure checkout, cashfree'

    useSEO({
        title: seoTitle,
        description: seoDescription,
        keywords: seoKeywords,
        ogImage: 'https://ggauravky.vercel.app/images/profile.jpg',
    })

    if (!service) {
        return <Navigate to="/services" replace />
    }

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
                            {service.outcomePromise ? (
                                <div className="mt-4 inline-flex items-start rounded-xl border border-cyan-500/35 bg-cyan-500/10 px-4 py-2.5 text-sm text-cyan-100">
                                    {service.outcomePromise}
                                </div>
                            ) : null}

                            <div className="mt-5 grid sm:grid-cols-2 gap-3.5">
                                <div className="rounded-2xl border border-slate-700/70 bg-slate-900/45 p-4">
                                    <p className="text-[11px] uppercase tracking-widest text-slate-500 mb-2">Who this is for</p>
                                    <ul className="space-y-2">
                                        {(service.whoThisIsFor || service.bestFor || []).slice(0, 3).map((item) => (
                                            <li key={item} className="text-sm text-slate-300 flex gap-2.5 leading-relaxed">
                                                <span className="mt-[7px] h-2 w-2 shrink-0 rounded-full bg-cyan-400" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                                    <p className="text-[11px] uppercase tracking-widest text-emerald-300 mb-2">Expected result</p>
                                    <ul className="space-y-2">
                                        {(service.expectedResults || []).slice(0, 3).map((item) => (
                                            <li key={item} className="text-sm text-emerald-100 flex gap-2.5 leading-relaxed">
                                                <span className="mt-[7px] h-2 w-2 shrink-0 rounded-full bg-emerald-300" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="mt-3.5 rounded-2xl border border-blue-500/25 bg-blue-500/10 p-4">
                                <div className="grid sm:grid-cols-2 gap-3.5">
                                    <div>
                                        <p className="text-[11px] uppercase tracking-widest text-blue-300 mb-1.5">Delivery window</p>
                                        <p className="text-sm text-blue-100 leading-relaxed">{service.deliveryWindow || service.timeline}</p>
                                    </div>
                                    <div>
                                        <p className="text-[11px] uppercase tracking-widest text-blue-300 mb-1.5">Exact deliverables</p>
                                        <ul className="space-y-1.5">
                                            {(service.exactDeliverables || service.deliverables || []).slice(0, 2).map((item) => (
                                                <li key={item} className="text-sm text-blue-100 leading-relaxed">• {item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/60 p-5 sm:p-6">
                            <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Pricing</p>
                            <p className="text-2xl sm:text-3xl font-extrabold text-cyan-300">{service.priceLabel}</p>
                            <p className="text-xs text-slate-400 mt-3">Secure checkout via Cashfree. Supports UPI, cards, and netbanking.</p>

                            <div className="mt-4 grid grid-cols-1 gap-2">
                                <div className="rounded-lg border border-slate-700/70 bg-slate-800/70 px-3 py-2 text-xs text-slate-300">No card or UPI PIN stored on this portfolio</div>
                                <div className="rounded-lg border border-slate-700/70 bg-slate-800/70 px-3 py-2 text-xs text-slate-300">Verification done on backend before confirmation</div>
                            </div>

                            <PricingFaq items={service.pricingFaq || []} />

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

                <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 sm:mb-10">
                    <div className="rounded-xl border border-slate-700/70 bg-slate-800/60 p-4">
                        <p className="text-[11px] uppercase tracking-widest text-slate-500">Step 1</p>
                        <p className="text-sm text-slate-200 mt-1">Review full service details and confirm fit</p>
                    </div>
                    <div className="rounded-xl border border-slate-700/70 bg-slate-800/60 p-4">
                        <p className="text-[11px] uppercase tracking-widest text-slate-500">Step 2</p>
                        <p className="text-sm text-slate-200 mt-1">Book securely with your preferred schedule</p>
                    </div>
                    <div className="rounded-xl border border-cyan-500/35 bg-cyan-500/10 p-4">
                        <p className="text-[11px] uppercase tracking-widest text-cyan-300">Step 3</p>
                        <p className="text-sm text-cyan-100 mt-1">Get confirmation and start execution quickly</p>
                    </div>
                </section>

                <section className="grid md:grid-cols-2 gap-5 sm:gap-6 mb-8 sm:mb-10">
                    <SectionCard title="What You Get" items={service.exactDeliverables || service.deliverables} />
                    <SectionCard title="Core Features" items={service.features} />
                    <SectionCard title="What You Need to Provide" items={service.youProvide} />
                    <SectionCard title="Best For" items={service.whoThisIsFor || service.bestFor} />
                </section>

                <section className="rounded-2xl border border-slate-700/70 bg-slate-800/55 p-6 sm:p-7 mb-8 sm:mb-10">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-100 mb-3">Process and Trust</h2>
                    <div className="grid lg:grid-cols-2 gap-5 sm:gap-6">
                        <ul className="space-y-3 text-slate-300 text-sm sm:text-base">
                            <li className="flex gap-2.5"><span className="text-cyan-400">01</span><span>Scope confirmation before execution</span></li>
                            <li className="flex gap-2.5"><span className="text-cyan-400">02</span><span>Transparent communication and status updates</span></li>
                            <li className="flex gap-2.5"><span className="text-cyan-400">03</span><span>Delivery focused on production quality</span></li>
                            <li className="flex gap-2.5"><span className="text-cyan-400">04</span><span>Clear handover, notes, and actionable next steps</span></li>
                        </ul>
                        <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-4 sm:p-5">
                            <p className="text-sm text-slate-300 leading-relaxed">
                                Timeline: {service.timeline}
                            </p>
                            <p className="text-xs text-slate-400 mt-3">
                                For confidence, check my work quality in the Projects section and public repositories before booking.
                            </p>
                            <div className="mt-4 grid grid-cols-1 gap-2">
                                <div className="rounded-lg border border-slate-700/70 bg-slate-800/70 px-3 py-2 text-xs text-slate-300">Data is used only for booking and delivery communication</div>
                                <div className="rounded-lg border border-slate-700/70 bg-slate-800/70 px-3 py-2 text-xs text-slate-300">Payment confirmation is verified before service is marked booked</div>
                            </div>
                        </div>
                    </div>
                </section>

                {service.proofArtifact ? (
                    <section className="rounded-2xl border border-cyan-500/25 bg-gradient-to-br from-slate-900 to-slate-800 p-6 sm:p-7 mb-8 sm:mb-10">
                        <p className="text-[11px] uppercase tracking-widest text-cyan-300 mb-2">Proof Artifact</p>
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-100">Validate Before You Book</h2>
                        <p className="text-slate-300 text-sm sm:text-base mt-2 leading-relaxed">
                            {service.proofArtifact.summary}
                        </p>
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
                            <a
                                href={service.proofArtifact.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 transition-all duration-300"
                            >
                                {service.proofArtifact.label}
                            </a>
                            <Link
                                to="/projects"
                                className="inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold text-slate-100 border border-slate-600 hover:border-cyan-500/40 hover:text-cyan-300 transition-colors"
                            >
                                Open Live Project Gallery
                            </Link>
                        </div>
                    </section>
                ) : null}

                <section className="rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-slate-800/80 via-slate-900/90 to-slate-800/80 p-6 sm:p-8 text-center">
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-3">Ready to Start {service.title}?</h2>
                    <p className="text-slate-300 max-w-2xl mx-auto">
                        Go to the Services page and book securely. If you want to evaluate my experience first, explore projects and GitHub profile.
                    </p>
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto">
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

                <StickyMobileCTA
                    badge="Primary Action"
                    title={`Book ${service.title}`}
                    primaryLabel="Book Service"
                    primaryTo={`/booknow?service=${service.slug}`}
                    secondaryLabel="Start a Conversation"
                    secondaryTo="/contact"
                />
            </div>
        </div>
    )
}

ServiceDetail.propTypes = {
    forcedSlug: PropTypes.string,
}

export default ServiceDetail

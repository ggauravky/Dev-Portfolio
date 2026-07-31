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
        <div className="relative overflow-hidden rounded-lg border border-obsidian-border bg-obsidian-card p-6 sm:p-8">
            <div className="absolute inset-0 bg-gradient-to-br from-toxic/[0.01] to-transparent pointer-events-none"></div>
            <h3 className="text-lg sm:text-xl font-display font-bold uppercase text-white mb-6 border-b border-obsidian-border pb-4">{title}</h3>
            <ul className="space-y-4">
                {items.map((item) => (
                    <li key={item} className="text-zinc-300 text-sm sm:text-base flex items-start gap-2.5 leading-relaxed">
                        <span className="text-toxic font-mono shrink-0 select-none">→</span>
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
        <div className="mt-6 rounded-lg border border-obsidian-border bg-obsidian/50 p-4">
            <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 mb-3">// Pricing Micro-FAQ</p>
            <div className="space-y-2.5">
                {items.map((item) => (
                    <details key={item.question} className="group rounded border border-obsidian-border bg-obsidian-card px-4 py-3">
                        <summary className="cursor-pointer list-none text-xs text-zinc-200 font-semibold flex items-center justify-between gap-2">
                            <span>{item.question}</span>
                            <span className="text-zinc-500 group-open:hidden">+</span>
                            <span className="text-zinc-500 hidden group-open:inline">-</span>
                        </summary>
                        <p className="mt-2.5 text-xs text-zinc-400 leading-relaxed font-mono">{item.answer}</p>
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

    const siteUrl = 'https://ggauravky.vercel.app'
    const seoTitle = service
        ? `${service.title} | Gaurav Kumar Yadav | AI/ML & Web Developer Lucknow`
        : 'Services | Gaurav Kumar Yadav | AI/ML & Web Developer'
    const seoDescription = service
        ? `${service.summary} ${service.outcomePromise} Offered by Gaurav Kumar Yadav, BCA student at BBDU Lucknow. Pricing: ${service.priceLabel}. Secure booking via Cashfree.`
        : 'Work with Gaurav Kumar Yadav — BCA student at BBDU Lucknow — for mentorship, debugging, portfolio reviews, and full-stack delivery. Secure booking via Cashfree.'
    const seoKeywords = service
        ? `${service.title} Gaurav Kumar Yadav, ${service.category} developer service Lucknow, Gaurav Kumar Yadav services, AI ML developer services India, web developer booking BBDU`
        : 'Gaurav Kumar Yadav developer services, AI ML developer Lucknow, web developer booking India, BBDU student developer'

    const serviceJsonLd = service ? {
        '@type': 'Service',
        '@id': `${siteUrl}/${service.slug}`,
        name: service.title,
        description: service.summary,
        url: `${siteUrl}/${service.slug}`,
        provider: {
            '@type': 'Person',
            '@id': `${siteUrl}/#person`,
            name: 'Gaurav Kumar Yadav',
            url: siteUrl,
            jobTitle: 'AI/ML Developer & Web Developer',
            address: {
                '@type': 'PostalAddress',
                addressLocality: 'Lucknow',
                addressRegion: 'Uttar Pradesh',
                addressCountry: 'India'
            }
        },
        areaServed: { '@type': 'Country', name: 'India' },
        offers: {
            '@type': 'Offer',
            price: service.amount,
            priceCurrency: 'INR',
            availability: 'https://schema.org/InStock',
            url: `${siteUrl}/booknow?service=${service.slug}`
        },
        category: service.category
    } : null

    useSEO({
        title: seoTitle,
        description: seoDescription,
        keywords: seoKeywords,
        ogImage: 'https://ggauravky.vercel.app/images/profile.jpg',
        additionalJsonLd: serviceJsonLd
    })

    if (!service) {
        return <Navigate to="/services" replace />
    }

    return (
        <main className="service-detail-page min-h-screen bg-obsidian relative overflow-x-hidden w-full">
            {/* Ambient background */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-40 right-0 w-[420px] h-[420px] rounded-full bg-toxic/5 blur-3xl" />
                <div className="absolute bottom-40 left-0 w-[420px] h-[420px] rounded-full bg-cyber/5 blur-3xl" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-28">
                {/* Back button */}
                <div className="mb-8 sm:mb-10">
                    <Link
                        to="/services"
                        className="inline-flex items-center gap-2 text-xs font-mono text-zinc-500 hover:text-toxic transition-colors uppercase tracking-wider"
                    >
                        <span>← Back to Services</span>
                    </Link>
                </div>

                <section className="relative overflow-hidden bg-obsidian-card border border-obsidian-border rounded-lg p-6 sm:p-10 lg:p-12 mb-8 sm:mb-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-toxic/[0.01] to-transparent pointer-events-none"></div>
                    <div className="relative z-10 flex flex-wrap items-center gap-2 mb-6">
                        <span className="px-2.5 py-1 bg-toxic text-obsidian text-[10px] font-mono font-bold rounded uppercase border border-obsidian whitespace-nowrap">
                            {service.category}
                        </span>
                        <span className="px-2.5 py-1 bg-cyber text-obsidian text-[10px] font-mono font-bold rounded uppercase border border-obsidian whitespace-nowrap">
                            Secure Booking
                        </span>
                        {service.badge ? (
                            <span className="px-2.5 py-1 bg-obsidian border border-obsidian-border text-zinc-400 text-[10px] font-mono font-bold rounded uppercase whitespace-nowrap">
                                {service.badge}
                            </span>
                        ) : null}
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8 items-start relative z-10">
                        <div className="lg:col-span-2 space-y-6">
                            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-display font-extrabold uppercase leading-[0.95] tracking-tighter text-white">
                                {service.title}
                            </h1>
                            <p className="text-zinc-300 text-base sm:text-lg leading-relaxed">
                                {service.summary}
                            </p>
                            {service.outcomePromise ? (
                                <div className="inline-flex items-start rounded border border-toxic/20 bg-toxic/5 px-4 py-3 text-xs sm:text-sm font-semibold text-toxic font-mono">
                                    // {service.outcomePromise}
                                </div>
                            ) : null}

                            <div className="grid sm:grid-cols-2 gap-4 pt-2">
                                <div className="rounded border border-obsidian-border bg-obsidian/40 p-5">
                                    <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 mb-3">// Who this is for</p>
                                    <ul className="space-y-2">
                                        {(service.whoThisIsFor || service.bestFor || []).slice(0, 3).map((item) => (
                                            <li key={item} className="text-xs sm:text-sm text-zinc-300 flex items-start gap-2 leading-relaxed">
                                                <span className="text-toxic font-mono shrink-0">→</span>
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="rounded border border-emerald-500/20 bg-emerald-500/5 p-5">
                                    <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400 mb-3">// Expected result</p>
                                    <ul className="space-y-2">
                                        {(service.expectedResults || []).slice(0, 3).map((item) => (
                                            <li key={item} className="text-xs sm:text-sm text-emerald-200 flex items-start gap-2 leading-relaxed">
                                                <span className="text-emerald-400 font-mono shrink-0">→</span>
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="rounded border border-cyber/20 bg-cyber/5 p-6">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyber mb-1.5">// Delivery window</p>
                                        <p className="text-sm text-white font-semibold leading-relaxed">{service.deliveryWindow || service.timeline}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyber mb-1.5">// Exact deliverables</p>
                                        <ul className="space-y-1 text-xs text-zinc-300">
                                            {(service.exactDeliverables || service.deliverables || []).slice(0, 2).map((item) => (
                                                <li key={item} className="leading-relaxed">• {item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border border-obsidian-border bg-obsidian/45 p-6 space-y-4">
                            <div>
                                <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 mb-1">// Pricing</p>
                                <p className="text-3xl font-display font-black text-toxic">{service.priceLabel}</p>
                            </div>
                            <p className="text-xs text-zinc-400 font-mono leading-relaxed">// Secure checkout via Cashfree. UPI, cards, and netbanking supported.</p>

                            <div className="grid grid-cols-1 gap-2 pt-2 text-[10px] font-mono uppercase text-zinc-500">
                                <div className="rounded border border-obsidian-border bg-obsidian px-3 py-2">No payment pin stored here</div>
                                <div className="rounded border border-obsidian-border bg-obsidian px-3 py-2">Manual check before confirmation</div>
                            </div>

                            <PricingFaq items={service.pricingFaq || []} />

                            <div className="flex flex-col gap-2.5 pt-4">
                                <Link
                                    to={`/booknow?service=${service.slug}`}
                                    className="w-full text-center bg-toxic hover:bg-white text-obsidian font-bold px-4 py-3.5 rounded-full transition-all duration-300 hover:scale-[1.02] text-xs uppercase tracking-wider font-mono"
                                >
                                    Book This Service
                                </Link>
                                <Link
                                    to="/projects"
                                    className="w-full text-center border border-zinc-850 hover:border-toxic text-zinc-300 hover:text-toxic font-bold px-4 py-3 rounded-full transition-all duration-300 hover:scale-[1.02] text-xs uppercase tracking-wider font-mono"
                                >
                                    See Related Projects
                                </Link>
                                <a
                                    href="https://github.com/ggauravky"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full text-center border border-zinc-850 hover:border-cyber text-zinc-300 hover:text-cyber font-bold px-4 py-3 rounded-full transition-all duration-300 hover:scale-[1.02] text-xs uppercase tracking-wider font-mono"
                                >
                                    View GitHub Work
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 sm:mb-10">
                    <div className="rounded border border-obsidian-border bg-obsidian-card p-5">
                        <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500">// Step 1</p>
                        <p className="text-sm font-semibold text-white mt-1">Review full service details and confirm fit</p>
                    </div>
                    <div className="rounded border border-obsidian-border bg-obsidian-card p-5">
                        <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500">// Step 2</p>
                        <p className="text-sm font-semibold text-white mt-1">Book securely with your preferred schedule</p>
                    </div>
                    <div className="rounded border border-toxic/20 bg-toxic/5 p-5">
                        <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-toxic">// Step 3</p>
                        <p className="text-sm font-semibold text-toxic mt-1">Get confirmation and start execution quickly</p>
                    </div>
                </section>

                <section className="grid md:grid-cols-2 gap-6 mb-8 sm:mb-10">
                    <SectionCard title="What You Get" items={service.exactDeliverables || service.deliverables} />
                    <SectionCard title="Core Features" items={service.features} />
                    <SectionCard title="What You Need to Provide" items={service.youProvide} />
                    <SectionCard title="Best For" items={service.whoThisIsFor || service.bestFor} />
                </section>

                <section className="relative overflow-hidden rounded-lg border border-obsidian-border bg-obsidian-card p-6 sm:p-8 mb-8 sm:mb-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-toxic/[0.01] to-transparent pointer-events-none"></div>
                    <div className="relative z-10">
                        <h2 className="text-xl sm:text-2xl font-display font-bold uppercase text-white mb-6 border-b border-obsidian-border pb-4">// Process and Trust</h2>
                        <div className="grid lg:grid-cols-2 gap-6">
                            <ul className="space-y-4 text-zinc-300 text-sm sm:text-base">
                                <li className="flex gap-2.5"><span className="text-toxic font-mono">01</span><span>Scope confirmation before execution</span></li>
                                <li className="flex gap-2.5"><span className="text-toxic font-mono">02</span><span>Transparent communication and status updates</span></li>
                                <li className="flex gap-2.5"><span className="text-toxic font-mono">03</span><span>Delivery focused on production quality</span></li>
                                <li className="flex gap-2.5"><span className="text-toxic font-mono">04</span><span>Clear handover, notes, and actionable next steps</span></li>
                            </ul>
                            <div className="rounded border border-obsidian-border bg-obsidian p-5 space-y-4">
                                <p className="text-sm font-semibold text-white leading-relaxed">
                                    Timeline: {service.timeline}
                                </p>
                                <p className="text-xs text-zinc-400 leading-relaxed font-mono">
                                    // For confidence, check my work quality in the Projects section and public repositories before booking.
                                </p>
                                <div className="grid grid-cols-1 gap-2 pt-2 text-[10px] font-mono uppercase text-zinc-500">
                                    <div className="rounded border border-obsidian-border bg-obsidian-card px-3 py-2">Data is used only for booking and delivery communication</div>
                                    <div className="rounded border border-obsidian-border bg-obsidian-card px-3 py-2">Payment confirmation is verified before service is marked booked</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {service.proofArtifact ? (
                    <section className="relative overflow-hidden rounded-lg border border-cyber/20 bg-cyber/5 p-6 sm:p-8 mb-8 sm:mb-10">
                        <p className="text-[10px] font-mono font-bold text-cyber uppercase tracking-widest mb-2">// Proof Artifact</p>
                        <h2 className="text-2xl font-display font-bold uppercase text-white mb-2">Validate Before You Book</h2>
                        <p className="text-zinc-300 text-sm sm:text-base mt-2 leading-relaxed">
                            {service.proofArtifact.summary}
                        </p>
                        <div className="mt-6 flex flex-wrap gap-4 max-w-2xl">
                            <a
                                href={service.proofArtifact.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative px-6 py-3 bg-cyber text-obsidian rounded-full font-bold text-xs tracking-wider uppercase hover:bg-white hover:scale-105 transition-all duration-300 text-center overflow-hidden inline-flex items-center justify-center font-mono"
                            >
                                {service.proofArtifact.label}
                            </a>
                            <Link
                                to="/projects"
                                className="group relative px-6 py-3 border border-zinc-700 hover:border-cyber rounded-full font-bold text-xs tracking-wider uppercase bg-transparent text-zinc-300 hover:text-cyber hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-cyber/5 text-center backdrop-blur-sm inline-flex items-center justify-center font-mono"
                            >
                                Open Live Project Gallery
                            </Link>
                        </div>
                    </section>
                ) : null}

                <section className="relative overflow-hidden rounded-lg border border-toxic/20 bg-toxic/5 p-8 text-center">
                    <h2 className="text-2xl sm:text-3xl font-display font-bold uppercase text-white mb-3">Ready to Start {service.title}?</h2>
                    <p className="text-zinc-400 text-sm max-w-2xl mx-auto leading-relaxed mb-6">
                        Go to the Services page and book securely. If you want to evaluate my experience first, explore projects and GitHub profile.
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <Link
                            to={`/booknow?service=${service.slug}`}
                            className="group relative px-6 py-3 bg-toxic text-obsidian rounded-full font-bold text-xs tracking-wider uppercase hover:bg-white hover:scale-105 transition-all duration-300 shadow-lg shadow-toxic/15 text-center overflow-hidden inline-flex items-center justify-center font-mono"
                        >
                            Book This Service
                        </Link>
                        <Link
                            to="/projects"
                            className="group relative px-6 py-3 border border-zinc-700 hover:border-toxic rounded-full font-bold text-xs tracking-wider uppercase bg-transparent text-zinc-300 hover:text-toxic hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-toxic/5 text-center backdrop-blur-sm inline-flex items-center justify-center font-mono"
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
        </main>
    )
}

ServiceDetail.propTypes = {
    forcedSlug: PropTypes.string,
}

export default ServiceDetail

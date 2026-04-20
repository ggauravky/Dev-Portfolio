// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import useSEO from '../hooks/useSEO'
import ScrollReveal from '../components/ScrollReveal'
import ServiceCard from '../components/ServiceCard'
import TrustStrip from '../components/TrustStrip'
import StickyMobileCTA from '../components/StickyMobileCTA'
import { servicesData } from '../data/servicesData'

function Services() {
    useSEO({
        title: 'Services | Gaurav Kumar Yadav | AI/ML and Web Development Support',
        description: 'Work with Gaurav Kumar Yadav for mentorship, debugging, portfolio reviews, and full-stack delivery support. AI/ML and web development guidance from a BCA student developer in Lucknow, India.',
        keywords: 'Gaurav Kumar Yadav services, AI ML developer Lucknow, web developer India, mentorship for developers, MERN stack developer student, portfolio review service, debugging help',
        ogImage: 'https://ggauravky.vercel.app/images/profile.jpg',
    })

    const allServices = useMemo(() => servicesData, [])
    const coreServices = useMemo(() => allServices.filter((service) => service.category === 'Career and Growth' || service.category === 'Code and Engineering'), [allServices])
    const buildServices = useMemo(() => allServices.filter((service) => service.category === 'Build Services' || service.category === 'Specialized Guidance'), [allServices])
    const comparisonServices = useMemo(() => allServices, [allServices])
    const testimonials = useMemo(() => [
        {
            quote: 'The resume review removed generic lines and improved ATS readability. I started receiving shortlist calls in the next application cycle.',
            name: 'Aayush Verma',
            role: 'Final Year CSE Student',
            city: 'Noida',
            result: '5 interview shortlists in 3 weeks',
        },
        {
            quote: 'Debugging support was practical. I got the root cause quickly and fixed production behavior with clear validation steps.',
            name: 'Priya Nair',
            role: 'React Developer',
            city: 'Bengaluru',
            result: 'Critical issue resolved same day',
        },
        {
            quote: 'Portfolio recommendations made the project narrative clearer. Recruiter conversations improved after the updates.',
            name: 'Ritwik Sharma',
            role: 'Fresher Developer',
            city: 'Pune',
            result: '2 recruiter callbacks in 10 days',
        },
        {
            quote: 'Full stack delivery followed clear milestones with transparent communication. The MVP launch timeline stayed realistic.',
            name: 'Neha Khanna',
            role: 'Startup Founder',
            city: 'Pune',
            result: 'MVP scope delivered in planned phases',
        },
        {
            quote: 'Mentorship gave me practical direction instead of random tutorials. I started following a weekly plan consistently.',
            name: 'Harsh Mehta',
            role: 'B.Tech CSE Student',
            city: 'Jaipur',
            result: '30-day roadmap with execution checklist',
        },
    ], [])

    return (
        <div className="services-page min-h-screen bg-slate-900 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
            <div className="absolute top-[35%] left-[42%] h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

            <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-14">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    <ScrollReveal className="space-y-6 min-w-0">
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs font-semibold tracking-widest uppercase">
                            Verified Services
                        </span>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-slate-100">
                            Build With Confidence
                        </h1>
                        <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-xl">
                            Real services, transparent pricing, and delivery-focused execution.
                            Explore every service in detail before booking. Available for remote work across India, with a base in Lucknow, Uttar Pradesh.
                        </p>

                        <div className="flex flex-wrap items-center gap-2.5">
                            <Link
                                to="/booknow?service=fullstack-development"
                                className="inline-flex items-center justify-center whitespace-nowrap px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all duration-300"
                            >
                                Book Service
                            </Link>
                            <Link
                                to="/support"
                                className="inline-flex items-center justify-center whitespace-nowrap px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 transition-all duration-300"
                            >
                                Open Support Jar
                            </Link>
                            <Link
                                to="/contact"
                                className="inline-flex items-center justify-center whitespace-nowrap px-4 py-2.5 rounded-lg text-sm font-semibold border border-slate-600 text-slate-200 hover:border-cyan-400/50 hover:text-cyan-300 transition-all duration-300"
                            >
                                Contact Me
                            </Link>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <div className="rounded-full border border-slate-700/80 bg-slate-800/60 px-3 py-1.5 text-[11px] text-slate-300">
                                Clear scope before payment
                            </div>
                            <div className="rounded-full border border-slate-700/80 bg-slate-800/60 px-3 py-1.5 text-[11px] text-slate-300">
                                Mobile-friendly delivery updates
                            </div>
                            <div className="rounded-full border border-cyan-500/35 bg-cyan-500/10 px-3 py-1.5 text-[11px] text-cyan-200">
                                Secure checkout via Cashfree
                            </div>
                        </div>

                        <div className="pt-2 max-w-3xl">
                            <p className="text-[11px] uppercase tracking-widest text-slate-500 mb-2">Jump to service</p>
                            <div className="flex gap-2.5 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                            {allServices.map((service) => (
                                <Link
                                    key={service.slug}
                                    to={service.path}
                                    className="inline-flex shrink-0 items-center justify-center whitespace-nowrap text-xs leading-none px-3 py-2 rounded-full border border-slate-700/70 bg-slate-800/65 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 transition-all duration-300 hover:-translate-y-0.5"
                                >
                                    {service.title}
                                </Link>
                            ))}
                            </div>
                        </div>
                    </ScrollReveal>

                    <ScrollReveal delay={100} className="relative min-w-0">
                        <div className="rounded-3xl border border-slate-700/70 bg-gradient-to-br from-slate-800/70 to-slate-900/80 p-6 sm:p-8 shadow-2xl shadow-black/40">
                            <div className="grid grid-cols-2 gap-2 sm:gap-4">
                                <div className="min-w-0 rounded-xl border border-slate-700 bg-slate-800/60 px-2.5 py-2 sm:p-4">
                                    <p className="text-slate-400 text-[10px] uppercase tracking-[0.12em] leading-tight">Projects Done</p>
                                    <p className="text-base sm:text-2xl font-bold text-cyan-300 mt-1">20+</p>
                                </div>
                                <div className="min-w-0 rounded-xl border border-slate-700 bg-slate-800/60 px-2.5 py-2 sm:p-4">
                                    <p className="text-slate-400 text-[10px] uppercase tracking-[0.12em] leading-tight">Quick Response</p>
                                    <p className="text-base sm:text-2xl font-bold text-blue-300 mt-1">&lt; 24h</p>
                                </div>
                                <div className="min-w-0 rounded-xl border border-slate-700 bg-slate-800/60 px-2.5 py-2 sm:p-4">
                                    <p className="text-slate-400 text-[10px] uppercase tracking-[0.12em] leading-tight">Secure Checkout</p>
                                    <p className="text-base sm:text-2xl font-bold text-purple-300 mt-1">Cashfree</p>
                                </div>
                                <div className="min-w-0 rounded-xl border border-slate-700 bg-slate-800/60 px-2.5 py-2 sm:p-4">
                                    <p className="text-slate-400 text-[10px] uppercase tracking-[0.12em] leading-tight">View Details</p>
                                    <p className="text-base sm:text-2xl font-bold text-emerald-300 mt-1">8 Detailed</p>
                                </div>
                            </div>
                            <p className="mt-3 sm:mt-5 text-[11px] sm:text-sm leading-relaxed text-slate-400">
                                Every service has a detailed page with deliverables, process, and trust signals.
                            </p>
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-2 sm:pb-4">
                <TrustStrip variant="services" />
            </section>

            <section id="core-services" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                <ScrollReveal>
                    <h2 className="text-3xl sm:text-4xl font-bold text-slate-100 mb-3">Career and Debug Services</h2>
                    <p className="text-slate-400 mb-8">Affordable, practical, and execution-focused support for students and early-career developers.</p>
                </ScrollReveal>
                <div className="grid md:grid-cols-2 gap-6 sm:gap-7">
                    {coreServices.map((service, index) => (
                        <ScrollReveal key={service.slug} delay={index * 70}>
                            <ServiceCard service={service} />
                        </ScrollReveal>
                    ))}
                </div>
            </section>

            <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                <ScrollReveal>
                    <h2 className="text-3xl sm:text-4xl font-bold text-slate-100 mb-3">Build and Delivery Services</h2>
                    <p className="text-slate-400 mb-8">Product-grade implementation with clear milestones, secure practices, and transparent communication.</p>
                </ScrollReveal>
                <div className="grid md:grid-cols-2 gap-5 sm:gap-6">
                    {buildServices.map((service, index) => (
                        <ScrollReveal key={service.slug} delay={index * 80}>
                            <ServiceCard service={service} featured={service.slug === 'fullstack-development'} />
                        </ScrollReveal>
                    ))}
                </div>
            </section>

            <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                <ScrollReveal>
                    <div className="rounded-3xl border border-slate-700/70 bg-slate-800/70 p-6 sm:p-8">
                        <h3 className="text-2xl sm:text-3xl font-black text-slate-100">Service Comparison</h3>
                        <p className="text-slate-400 text-sm sm:text-base mt-2">Pick faster by comparing price, delivery time, best fit, deliverable style, and support level.</p>

                        <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-700/70">
                            <table className="min-w-[880px] w-full text-left text-sm">
                                <thead className="bg-slate-900/80">
                                    <tr className="text-slate-300">
                                        <th className="px-4 py-3 font-semibold">Service</th>
                                        <th className="px-4 py-3 font-semibold">Price</th>
                                        <th className="px-4 py-3 font-semibold">Delivery Time</th>
                                        <th className="px-4 py-3 font-semibold">Best For</th>
                                        <th className="px-4 py-3 font-semibold">Deliverable</th>
                                        <th className="px-4 py-3 font-semibold">Support Level</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {comparisonServices.map((service) => (
                                        <tr key={service.slug} className="border-t border-slate-700/70 bg-slate-900/45 text-slate-200 align-top">
                                            <td className="px-4 py-3.5">
                                                <Link to={service.path} className="font-semibold text-cyan-300 hover:text-cyan-200 transition-colors">
                                                    {service.title}
                                                </Link>
                                            </td>
                                            <td className="px-4 py-3.5">{service.priceLabel}</td>
                                            <td className="px-4 py-3.5">{service.deliveryWindow || service.timeline}</td>
                                            <td className="px-4 py-3.5">{(service.whoThisIsFor || service.bestFor || [])[0]}</td>
                                            <td className="px-4 py-3.5">{service.comparisonDeliverable || (service.exactDeliverables || [])[0] || 'Defined in detail page'}</td>
                                            <td className="px-4 py-3.5">{service.supportLevel || 'Standard support'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </ScrollReveal>
            </section>

            <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                <ScrollReveal>
                    <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-slate-900 p-6 sm:p-8 lg:p-10 mb-8">
                        <h3 className="text-2xl sm:text-3xl font-black text-slate-100 mb-5">Why choose me</h3>
                        <div className="grid md:grid-cols-2 gap-4 sm:gap-5">
                            <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/55 p-4 sm:p-5">
                                <p className="text-cyan-300 text-sm font-bold uppercase tracking-widest mb-2">Execution First</p>
                                <p className="text-slate-200 text-sm sm:text-base">Actionable delivery, not generic consultation. You get concrete outcomes and implementation guidance.</p>
                            </div>
                            <div className="rounded-2xl border border-blue-500/20 bg-slate-900/55 p-4 sm:p-5">
                                <p className="text-blue-300 text-sm font-bold uppercase tracking-widest mb-2">Transparent Proof</p>
                                <p className="text-slate-200 text-sm sm:text-base">Projects and GitHub work are public. You can verify quality before spending even one rupee.</p>
                            </div>
                            <div className="rounded-2xl border border-violet-500/20 bg-slate-900/55 p-4 sm:p-5">
                                <p className="text-violet-300 text-sm font-bold uppercase tracking-widest mb-2">Clear Communication</p>
                                <p className="text-slate-200 text-sm sm:text-base">Scope and timeline are discussed before execution. You always know what is being delivered.</p>
                            </div>
                            <div className="rounded-2xl border border-emerald-500/20 bg-slate-900/55 p-4 sm:p-5">
                                <p className="text-emerald-300 text-sm font-bold uppercase tracking-widest mb-2">Secure Process</p>
                                <p className="text-slate-200 text-sm sm:text-base">Booking flow and delivery communication are being upgraded with reliability in mind.</p>
                            </div>
                        </div>
                    </div>
                </ScrollReveal>

                <ScrollReveal delay={120}>
                    <div className="rounded-3xl border border-slate-700/70 bg-slate-800/70 p-6 sm:p-8">
                        <div className="flex items-center justify-between gap-3 mb-5">
                            <h3 className="text-2xl sm:text-3xl font-black text-slate-100">What clients say</h3>
                            <span className="text-xs text-slate-500 uppercase tracking-widest">Live Feedback</span>
                        </div>

                        <div className="group overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
                            <div className="flex gap-4 sm:gap-5 w-max animate-[serviceMarquee_34s_linear_infinite] [animation-play-state:running] group-hover:[animation-play-state:paused]">
                                {[...testimonials, ...testimonials].map((item, index) => (
                                    <blockquote
                                        key={`${item.name}-${index}`}
                                        className="w-[300px] sm:w-[360px] rounded-2xl border border-slate-700 bg-slate-900/70 p-4 sm:p-5"
                                    >
                                        <p className="text-slate-200 text-sm leading-relaxed">&ldquo;{item.quote}&rdquo;</p>
                                        <footer className="mt-3 text-xs text-cyan-300">{item.name} · {item.role} · {item.city}</footer>
                                        <p className="mt-2 text-[11px] text-emerald-300">Result: {item.result}</p>
                                    </blockquote>
                                ))}
                            </div>
                        </div>
                    </div>
                </ScrollReveal>
            </section>

            <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                <ScrollReveal>
                    <div className="relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-slate-800/85 via-slate-900/90 to-slate-900 p-6 sm:p-8">
                        <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-16 -left-12 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

                        <div className="relative z-10 grid lg:grid-cols-3 gap-6 lg:gap-7 items-start">
                            <div className="lg:col-span-2">
                                <p className="text-xs text-cyan-300 uppercase tracking-[0.2em] font-semibold mb-3">Secure payments and trust</p>
                                <h3 className="text-2xl sm:text-3xl font-black text-slate-100 mb-4 leading-tight">Protected Checkout. Clear Privacy. Public Proof.</h3>

                                <div className="grid sm:grid-cols-2 gap-3.5 sm:gap-4">
                                    <div className="rounded-2xl border border-slate-700/80 bg-slate-800/50 p-4">
                                        <p className="text-cyan-300 font-semibold text-sm mb-1">Cashfree Checkout</p>
                                        <p className="text-slate-300 text-sm">Live secure payments with UPI, cards, wallets, netbanking, and pay later.</p>
                                    </div>
                                    <div className="rounded-2xl border border-slate-700/80 bg-slate-800/50 p-4">
                                        <p className="text-blue-300 font-semibold text-sm mb-1">Card data safety</p>
                                        <p className="text-slate-300 text-sm">No card data is stored on this portfolio.</p>
                                    </div>
                                    <div className="rounded-2xl border border-slate-700/80 bg-slate-800/50 p-4">
                                        <p className="text-violet-300 font-semibold text-sm mb-1">Limited data usage</p>
                                        <p className="text-slate-300 text-sm">Booking information is used only for service delivery and communication.</p>
                                    </div>
                                    <div className="rounded-2xl border border-slate-700/80 bg-slate-800/50 p-4">
                                        <p className="text-emerald-300 font-semibold text-sm mb-1">Transparent credibility</p>
                                        <p className="text-slate-300 text-sm">Public project proof available in Projects and GitHub profile.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-cyan-500/25 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 p-4 sm:p-5">
                                <p className="text-slate-100 text-sm font-semibold">Verify before booking</p>
                                <p className="text-slate-300 text-xs mt-1.5">Check live work and repository quality before making payment.</p>

                                <div className="mt-4 grid grid-cols-1 gap-3">
                                    <Link
                                        to="/projects"
                                        className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 transition-all duration-300 hover:scale-[1.02]"
                                    >
                                        Open Projects
                                    </Link>
                                    <a
                                        href="https://github.com/ggauravky"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-100 border border-slate-600 hover:border-cyan-400/50 hover:text-cyan-300 transition-all duration-300"
                                    >
                                        Open GitHub
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="relative z-10 mt-5 flex items-center justify-center lg:justify-start gap-2 text-[11px] sm:text-xs text-slate-400">
                            <span className="h-2 w-2 rounded-full bg-emerald-400" />
                            <span>Cashfree secure checkout + minimal data handling + verifiable public work</span>
                        </div>
                    </div>
                </ScrollReveal>
            </section>

            <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16 sm:pb-20">
                <ScrollReveal>
                    <div className="rounded-3xl border border-slate-700/80 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-cyan-600/10 p-8 sm:p-10 text-center">
                        <h2 className="text-3xl sm:text-4xl font-bold text-slate-100">Ready to build something real?</h2>
                        <p className="text-slate-300 mt-3 max-w-2xl mx-auto">
                            Choose any service and review full details before booking. Premium quality, clean delivery, and practical outcomes.
                        </p>
                        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto">
                            <Link
                                to="/booknow?service=fullstack-development"
                                className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all duration-300 hover:scale-105"
                            >
                                <span>Book Now</span>
                                <span>→</span>
                            </Link>
                            <Link
                                to="/support"
                                className="inline-flex items-center justify-center rounded-xl px-6 py-3.5 font-semibold text-cyan-200 border border-cyan-500/35 bg-cyan-500/5 hover:bg-cyan-500/10 hover:border-cyan-400 transition-all duration-300"
                            >
                                Open Support Jar
                            </Link>
                        </div>
                    </div>
                </ScrollReveal>
            </section>

            <StickyMobileCTA
                badge="Primary Action"
                title="Ready to book your service?"
                primaryLabel="Book Service"
                primaryTo="/booknow?service=fullstack-development"
                secondaryLabel="Start a Conversation"
                secondaryTo="/contact"
            />

            <style>{`
                @keyframes serviceMarquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
            `}</style>
        </div>
    )
}

export default Services

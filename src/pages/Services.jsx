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
import { servicesData } from '../data/servicesData'

function Services() {
    useSEO({
        title: 'Services - Work With Me | Gaurav Kumar Yadav',
        description: 'Book mentorship, resume review, debugging help, portfolio review, and full stack development services.',
        keywords: 'developer services, mentorship, resume review, debugging help, portfolio review, full stack development',
        ogImage: 'https://ggauravky.vercel.app/images/profile.jpg',
    })

    const allServices = useMemo(() => servicesData, [])
    const coreServices = useMemo(() => allServices.filter((service) => service.category === 'Career and Growth' || service.category === 'Code and Engineering'), [allServices])
    const buildServices = useMemo(() => allServices.filter((service) => service.category === 'Build Services' || service.category === 'Specialized Guidance'), [allServices])
    const testimonials = useMemo(() => [
        {
            quote: 'My resume finally started getting shortlist calls after this review. Clear and practical feedback.',
            author: 'Aayush, Final Year Student',
        },
        {
            quote: 'Debugging support was fast and clean. I not only fixed the bug, I understood the root cause.',
            author: 'Priya, React Developer',
        },
        {
            quote: 'Portfolio review gave me exact points to improve trust. Recruiters started spending more time on it.',
            author: 'Ritwik, Fresher Developer',
        },
        {
            quote: 'Full stack delivery was well-structured with proper communication and realistic milestones.',
            author: 'Startup Founder, Pune',
        },
        {
            quote: 'Mentorship gave me direction when I was confused about what to learn next and why.',
            author: 'Harsh, B.Tech CSE',
        },
    ], [])

    return (
        <div className="services-page min-h-screen bg-slate-900 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
            <div className="absolute top-[35%] left-[42%] h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

            <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-14">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    <ScrollReveal className="space-y-6">
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs font-semibold tracking-widest uppercase">
                            Verified Services
                        </span>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-slate-100">
                            Build With Confidence
                        </h1>
                        <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-xl">
                            Real services, transparent pricing, and delivery-focused execution.
                            Explore every service in detail before booking.
                        </p>

                        <div className="flex flex-wrap items-center gap-2.5">
                            <Link
                                to="/booknow?service=fullstack-development"
                                className="inline-flex items-center justify-center whitespace-nowrap px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all duration-300"
                            >
                                Book Full Stack Service
                            </Link>
                            <Link
                                to="/support"
                                className="inline-flex items-center justify-center whitespace-nowrap px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 transition-all duration-300"
                            >
                                Open Support Jar
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

                    <ScrollReveal delay={100} className="relative">
                        <div className="rounded-3xl border border-slate-700/70 bg-gradient-to-br from-slate-800/70 to-slate-900/80 p-6 sm:p-8 shadow-2xl shadow-black/40">
                            <div className="grid grid-cols-2 gap-4 sm:gap-5">
                                <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-4">
                                    <p className="text-slate-400 text-xs uppercase tracking-widest">Projects Done</p>
                                    <p className="text-2xl font-bold text-cyan-300 mt-2">20+</p>
                                </div>
                                <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-4">
                                    <p className="text-slate-400 text-xs uppercase tracking-widest">Quick Response</p>
                                    <p className="text-2xl font-bold text-blue-300 mt-2">&lt; 24h</p>
                                </div>
                                <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-4">
                                    <p className="text-slate-400 text-xs uppercase tracking-widest">Secure Checkout</p>
                                     <p className="text-2xl font-bold text-purple-300 mt-2">Cashfree</p>
                                </div>
                                <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-4">
                                    <p className="text-slate-400 text-xs uppercase tracking-widest">View Details</p>
                                    <p className="text-2xl font-bold text-emerald-300 mt-2">8 Detailed</p>
                                </div>
                            </div>
                            <p className="mt-6 text-sm text-slate-400">
                                Every service has its own detailed page with deliverables, process, requirements, and trust signals.
                            </p>
                        </div>
                    </ScrollReveal>
                </div>
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
                                        key={`${item.author}-${index}`}
                                        className="w-[300px] sm:w-[360px] rounded-2xl border border-slate-700 bg-slate-900/70 p-4 sm:p-5"
                                    >
                                        <p className="text-slate-200 text-sm leading-relaxed">&ldquo;{item.quote}&rdquo;</p>
                                        <footer className="mt-3 text-xs text-cyan-300">{item.author}</footer>
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

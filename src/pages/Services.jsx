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
        additionalJsonLd: {
            '@type': 'FAQPage',
            mainEntity: [
                {
                    '@type': 'Question',
                    name: 'What services does Gaurav Kumar Yadav offer?',
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'Gaurav Kumar Yadav offers 8 developer services: Mentorship (1:1 career roadmaps), Resume Review (ATS optimisation), Debugging Help (root-cause code fixes), Portfolio Review, Frontend Development, Backend Development, Full Stack Development, and AI & Data Science Guidance. All services are booked securely via Cashfree.'
                    }
                },
                {
                    '@type': 'Question',
                    name: 'How can I book a session with Gaurav Kumar Yadav?',
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'Visit https://ggauravky.vercel.app/booknow, select your service, fill in your project brief, and complete payment via Cashfree (UPI, cards, netbanking, wallets). Sessions are confirmed within 24-48 hours.'
                    }
                },
                {
                    '@type': 'Question',
                    name: 'What is the price for mentorship with Gaurav Kumar Yadav?',
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'Mentorship and Resume Review sessions are priced at INR 49. Debugging Help and Portfolio Review are INR 99. Build services (Frontend, Backend, Full Stack) are priced based on project scope. All prices are in Indian Rupees (INR).'
                    }
                },
                {
                    '@type': 'Question',
                    name: 'Where is Gaurav Kumar Yadav based?',
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'Gaurav Kumar Yadav is based in Lucknow, Uttar Pradesh, India. He is a BCA student at BBD University (BBDU) and serves clients across India remotely.'
                    }
                },
                {
                    '@type': 'Question',
                    name: 'What technologies does Gaurav Kumar Yadav work with?',
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'Gaurav Kumar Yadav specialises in Python, React, Node.js, Express.js, MongoDB (MERN stack), Machine Learning, and AI/ML projects. He has completed the AI and Machine Learning Program through IIT Mandi x Masai School.'
                    }
                }
            ]
        }
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
        <main className="services-page min-h-screen bg-obsidian relative overflow-hidden w-full">
            {/* Background Orbs */}
            <div className="absolute top-20 right-10 w-96 h-96 bg-toxic/5 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-20 left-10 w-96 h-96 bg-cyber/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>

            <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-10">
                <div className="grid lg:grid-cols-[1.25fr_0.75fr] gap-8 lg:gap-12 items-center">
                    <ScrollReveal className="space-y-6 min-w-0">
                        <span className="inline-flex items-center gap-2 text-toxic text-xs font-bold tracking-widest uppercase px-4 py-2 bg-toxic/5 rounded-full border border-toxic/15">
                            Verified Services
                        </span>
                        <h1 className="text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-display font-extrabold uppercase leading-[0.95] tracking-tighter text-white">
                            Build With <span className="text-transparent bg-gradient-to-r from-white via-zinc-400 to-toxic bg-clip-text">Confidence</span>
                        </h1>
                        <p className="text-zinc-400 text-base sm:text-lg leading-relaxed max-w-xl">
                            Real services, transparent pricing, and delivery-focused execution. Available for remote collaboration.
                        </p>

                        <div className="flex flex-wrap items-center gap-3">
                            <Link
                                to="/booknow?service=fullstack-development"
                                className="group relative px-6 py-3.5 bg-toxic text-obsidian rounded-full font-bold text-xs tracking-wider uppercase hover:bg-white hover:scale-105 transition-all duration-300 shadow-lg shadow-toxic/15 text-center overflow-hidden inline-flex items-center justify-center font-mono"
                            >
                                Book Service
                            </Link>
                            <Link
                                to="/support"
                                className="group relative px-6 py-3.5 border border-zinc-700 hover:border-toxic rounded-full font-bold text-xs tracking-wider uppercase bg-transparent text-zinc-300 hover:text-toxic hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-toxic/5 text-center backdrop-blur-sm inline-flex items-center justify-center font-mono"
                            >
                                ❤️ Support My Work
                            </Link>
                            <Link
                                to="/contact"
                                className="group relative px-6 py-3.5 border border-zinc-700 hover:border-toxic rounded-full font-bold text-xs tracking-wider uppercase bg-transparent text-zinc-300 hover:text-toxic hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-toxic/5 text-center backdrop-blur-sm inline-flex items-center justify-center font-mono"
                            >
                                Contact Me
                            </Link>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-2">
                            <div className="rounded border border-obsidian-border bg-obsidian px-3 py-1.5 text-[10px] font-mono uppercase text-zinc-400">
                                Clear scope before payment
                            </div>
                            <div className="rounded border border-obsidian-border bg-obsidian px-3 py-1.5 text-[10px] font-mono uppercase text-zinc-400">
                                Mobile-friendly delivery updates
                            </div>
                            <div className="rounded border border-toxic/20 bg-toxic/5 px-3 py-1.5 text-[10px] font-mono uppercase text-toxic">
                                Secure checkout via Cashfree
                            </div>
                        </div>

                        <div className="pt-4 max-w-3xl">
                            <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 mb-3">// Jump to service</p>
                            <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                                {allServices.map((service) => (
                                    <Link
                                        key={service.slug}
                                        to={service.path}
                                        className="inline-flex shrink-0 items-center justify-center whitespace-nowrap text-[10px] font-mono uppercase tracking-wider px-3.5 py-2.5 rounded border border-obsidian-border bg-obsidian-card text-zinc-400 hover:text-toxic hover:border-toxic/30 transition-all duration-300 hover:-translate-y-0.5"
                                    >
                                        {service.title}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </ScrollReveal>

                    <ScrollReveal delay={100} className="relative min-w-0">
                        <div className="relative overflow-hidden bg-obsidian-card border border-obsidian-border rounded-lg p-6 sm:p-8 shadow-2xl">
                            <div className="absolute inset-0 bg-gradient-to-br from-toxic/[0.01] to-transparent pointer-events-none"></div>
                            <div className="grid grid-cols-2 gap-3.5 sm:gap-4 relative z-10">
                                <div className="min-w-0 rounded border border-obsidian-border bg-obsidian px-4 py-3.5">
                                    <p className="text-zinc-500 font-mono text-[9px] uppercase tracking-wider">Projects Done</p>
                                    <p className="text-xl sm:text-2xl font-display font-black text-toxic mt-1">20+</p>
                                </div>
                                <div className="min-w-0 rounded border border-obsidian-border bg-obsidian px-4 py-3.5">
                                    <p className="text-zinc-500 font-mono text-[9px] uppercase tracking-wider">Quick Response</p>
                                    <p className="text-xl sm:text-2xl font-display font-black text-cyber mt-1">&lt; 24h</p>
                                </div>
                                <div className="min-w-0 rounded border border-obsidian-border bg-obsidian px-4 py-3.5">
                                    <p className="text-zinc-500 font-mono text-[9px] uppercase tracking-wider">Secure Checkout</p>
                                    <p className="text-xl sm:text-2xl font-display font-black text-toxic mt-1">Cashfree</p>
                                </div>
                                <div className="min-w-0 rounded border border-obsidian-border bg-obsidian px-4 py-3.5">
                                    <p className="text-zinc-500 font-mono text-[9px] uppercase tracking-wider">View Details</p>
                                    <p className="text-xl sm:text-2xl font-display font-black text-cyber mt-1">8 Detailed</p>
                                </div>
                            </div>
                            <p className="mt-4 text-xs font-mono uppercase tracking-wider text-zinc-500 relative z-10">
                                // Every service page lists full deliverables, process details, and trust signals.
                            </p>
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <TrustStrip variant="services" />
            </section>

            <section id="core-services" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 border-t border-obsidian-border">
                <ScrollReveal>
                    <span className="inline-block text-toxic text-xs font-bold tracking-widest uppercase mb-4 px-4 py-2 bg-toxic/5 rounded-full border border-toxic/15">Career and Debug Services</span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold uppercase text-white mb-8">Affordable Support</h2>
                </ScrollReveal>
                <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
                    {coreServices.map((service, index) => (
                        <ScrollReveal key={service.slug} delay={index * 70}>
                            <ServiceCard service={service} />
                        </ScrollReveal>
                    ))}
                </div>
            </section>

            <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 border-t border-obsidian-border">
                <ScrollReveal>
                    <span className="inline-block text-cyber text-xs font-bold tracking-widest uppercase mb-4 px-4 py-2 bg-cyber/5 rounded-full border border-cyber/15">Build and Delivery Services</span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold uppercase text-white mb-8">Product Implementation</h2>
                </ScrollReveal>
                <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
                    {buildServices.map((service, index) => (
                        <ScrollReveal key={service.slug} delay={index * 80}>
                            <ServiceCard service={service} featured={service.slug === 'fullstack-development'} />
                        </ScrollReveal>
                    ))}
                </div>
            </section>

            {/* Comparison section */}
            <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 border-t border-obsidian-border">
                <ScrollReveal>
                    <div className="relative overflow-hidden bg-obsidian-card border border-obsidian-border rounded-lg p-6 sm:p-8">
                        <div className="absolute inset-0 bg-gradient-to-br from-toxic/[0.01] to-transparent pointer-events-none"></div>
                        <div className="relative z-10">
                            <h3 className="text-2xl sm:text-3xl font-display font-bold uppercase text-white mb-2">Service Comparison</h3>
                            <p className="text-zinc-500 font-mono text-xs uppercase tracking-wider mb-6">// Price, timeline, deliverables, and support comparison</p>

                            <div className="overflow-x-auto rounded border border-obsidian-border">
                                <table className="min-w-[880px] w-full text-left text-xs font-mono">
                                    <thead className="bg-obsidian">
                                        <tr className="text-zinc-500 uppercase border-b border-obsidian-border font-bold">
                                            <th className="px-4 py-4.5">Service</th>
                                            <th className="px-4 py-4.5">Price</th>
                                            <th className="px-4 py-4.5">Delivery Time</th>
                                            <th className="px-4 py-4.5">Best For</th>
                                            <th className="px-4 py-4.5">Deliverable</th>
                                            <th className="px-4 py-4.5">Support Level</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {comparisonServices.map((service) => (
                                            <tr key={service.slug} className="border-t border-obsidian-border bg-obsidian-card/40 text-zinc-300 align-top hover:bg-obsidian-card/75 transition-colors">
                                                <td className="px-4 py-4">
                                                    <Link to={service.path} className="font-display font-bold uppercase text-toxic hover:text-white transition-colors">
                                                        {service.title}
                                                    </Link>
                                                </td>
                                                <td className="px-4 py-4 font-bold text-white">{service.priceLabel}</td>
                                                <td className="px-4 py-4">{service.deliveryWindow || service.timeline}</td>
                                                <td className="px-4 py-4 text-zinc-400">{(service.whoThisIsFor || service.bestFor || [])[0]}</td>
                                                <td className="px-4 py-4 text-zinc-400">{service.comparisonDeliverable || (service.exactDeliverables || [])[0] || 'Defined in detail page'}</td>
                                                <td className="px-4 py-4">{service.supportLevel || 'Standard support'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </ScrollReveal>
            </section>

            {/* Why choose me */}
            <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 border-t border-obsidian-border">
                <ScrollReveal>
                    <div className="relative overflow-hidden bg-obsidian-card border border-obsidian-border rounded-lg p-6 sm:p-8 lg:p-10 mb-8">
                        <div className="absolute inset-0 bg-gradient-to-br from-cyber/[0.01] to-transparent pointer-events-none pointer-events-none"></div>
                        <div className="relative z-10">
                            <h3 className="text-2xl sm:text-3xl font-display font-bold uppercase text-white mb-6">Why Choose Me</h3>
                            <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                                <div className="rounded border border-obsidian-border bg-obsidian/40 p-5 hover:border-toxic/20 transition-all">
                                    <p className="text-toxic text-xs font-mono font-bold uppercase tracking-widest mb-2">// Execution First</p>
                                    <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">Actionable deliverables, not generic consultation. You get concrete outcomes and code implementation guidance.</p>
                                </div>
                                <div className="rounded border border-obsidian-border bg-obsidian/40 p-5 hover:border-cyber/20 transition-all">
                                    <p className="text-cyber text-xs font-mono font-bold uppercase tracking-widest mb-2">// Transparent Proof</p>
                                    <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">Projects and GitHub repositories are fully public. You can verify quality standards before booking.</p>
                                </div>
                                <div className="rounded border border-obsidian-border bg-obsidian/40 p-5 hover:border-toxic/20 transition-all">
                                    <p className="text-toxic text-xs font-mono font-bold uppercase tracking-widest mb-2">// Clear Communication</p>
                                    <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">Scope and milestones are aligned before payment. You always know what is being delivered.</p>
                                </div>
                                <div className="rounded border border-obsidian-border bg-obsidian/40 p-5 hover:border-cyber/20 transition-all">
                                    <p className="text-cyber text-xs font-mono font-bold uppercase tracking-widest mb-2">// Secure Process</p>
                                    <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">Payments are processed securely via Cashfree, with restricted data usage standards.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollReveal>

                {/* Testimonials */}
                <ScrollReveal delay={120}>
                    <div className="relative overflow-hidden bg-obsidian-card border border-obsidian-border rounded-lg p-6 sm:p-8">
                        <div className="flex items-center justify-between gap-3 mb-6">
                            <h3 className="text-xl sm:text-2xl font-display font-bold uppercase text-white">What Clients Say</h3>
                            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">// Live Feedback</span>
                        </div>

                        <div className="group overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
                            <div className="flex gap-4 sm:gap-5 w-max animate-[serviceMarquee_34s_linear_infinite] [animation-play-state:running] group-hover:[animation-play-state:paused]">
                                {[...testimonials, ...testimonials].map((item, index) => (
                                    <blockquote
                                        key={`${item.name}-${index}`}
                                        className="w-[300px] sm:w-[360px] rounded-lg border border-obsidian-border bg-obsidian p-5 flex flex-col justify-between"
                                    >
                                        <div>
                                            <p className="text-zinc-300 text-sm leading-relaxed">&ldquo;{item.quote}&rdquo;</p>
                                        </div>
                                        <div className="mt-4">
                                            <footer className="text-xs font-mono text-toxic uppercase tracking-wider">{item.name} · {item.role}</footer>
                                            <p className="mt-1.5 text-[10px] font-mono text-emerald-400 uppercase tracking-wider">Result: {item.result}</p>
                                        </div>
                                    </blockquote>
                                ))}
                            </div>
                        </div>
                    </div>
                </ScrollReveal>
            </section>


            {/* Payments Panel */}
            <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 border-t border-obsidian-border">
                <ScrollReveal>
                    <div className="relative overflow-hidden bg-obsidian-card border border-obsidian-border rounded-lg p-6 sm:p-10">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-toxic/5 via-transparent to-transparent pointer-events-none"></div>

                        <div className="relative z-10 grid lg:grid-cols-3 gap-8 items-start">
                            <div className="lg:col-span-2 space-y-6">
                                <div>
                                    <p className="text-[10px] font-mono font-bold text-toxic uppercase tracking-[0.2em] mb-2">// Payments & Trust</p>
                                    <h3 className="text-2xl sm:text-4xl font-display font-bold uppercase text-white leading-[0.95] tracking-tighter">Protected Checkout.</h3>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="rounded border border-obsidian-border bg-obsidian/45 p-4">
                                        <p className="text-toxic font-mono font-bold text-xs uppercase tracking-wider mb-1">Cashfree Checkout</p>
                                        <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">Live secure payments with UPI, cards, wallets, netbanking, and pay later.</p>
                                    </div>
                                    <div className="rounded border border-obsidian-border bg-obsidian/45 p-4">
                                        <p className="text-cyber font-mono font-bold text-xs uppercase tracking-wider mb-1">Card Data Safety</p>
                                        <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">No card credentials are processed or stored on this portfolio server.</p>
                                    </div>
                                    <div className="rounded border border-obsidian-border bg-obsidian/45 p-4">
                                        <p className="text-toxic font-mono font-bold text-xs uppercase tracking-wider mb-1">Limited Data Usage</p>
                                        <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">Booking info is exclusively used for shipping service outcomes.</p>
                                    </div>
                                    <div className="rounded border border-obsidian-border bg-obsidian/45 p-4">
                                        <p className="text-cyber font-mono font-bold text-xs uppercase tracking-wider mb-1">Credibility Proof</p>
                                        <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">Direct code metrics and repository proofs are public in GitHub.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-lg border border-cyber/20 bg-cyber/5 p-6 space-y-4">
                                <p className="text-white font-display font-bold uppercase text-lg">Verify First</p>
                                <p className="text-zinc-400 text-xs leading-relaxed font-mono">// Check live repository quality metrics before booking.</p>

                                <div className="flex flex-col gap-3 pt-2">
                                    <Link
                                        to="/projects"
                                        className="w-full text-center bg-cyber hover:bg-white text-obsidian font-bold px-4 py-2.5 rounded-full transition-all duration-300 text-xs uppercase tracking-wider font-mono"
                                    >
                                        Open Projects
                                    </Link>
                                    <a
                                        href="https://github.com/ggauravky"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full text-center border border-zinc-850 hover:border-cyber text-zinc-300 hover:text-cyber font-bold px-4 py-2.5 rounded-full transition-all duration-300 text-xs uppercase tracking-wider font-mono"
                                    >
                                        Open GitHub
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="relative z-10 mt-6 flex items-center justify-center lg:justify-start gap-2 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                            <span className="h-1.5 w-1.5 rounded-full bg-toxic" />
                            <span>Cashfree Checkout + Verified Public Work Only</span>
                        </div>
                    </div>
                </ScrollReveal>
            </section>

            {/* Bottom CTA */}
            <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
                <ScrollReveal>
                    <div className="bg-obsidian-card border border-obsidian-border rounded-lg p-8 sm:p-12 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-toxic/5 via-transparent to-transparent pointer-events-none"></div>
                        <h2 className="text-3xl sm:text-4xl font-display font-bold uppercase text-white mb-3">Ready to Build Something Real?</h2>
                        <p className="text-zinc-400 text-sm sm:text-base mb-8 max-w-xl mx-auto leading-relaxed">
                            Review process details on the service page, align the scope, and begin shipping.
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center">
                            <Link
                                to="/booknow?service=fullstack-development"
                                className="group relative px-8 py-4 bg-toxic text-obsidian rounded-full font-bold text-xs tracking-wider uppercase hover:bg-white hover:scale-105 transition-all duration-300 shadow-lg shadow-toxic/15 text-center overflow-hidden inline-flex items-center justify-center font-mono"
                            >
                                Book Now
                            </Link>
                            <Link
                                to="/support"
                                className="group relative px-8 py-4 border border-zinc-700 hover:border-toxic rounded-full font-bold text-xs tracking-wider uppercase bg-transparent text-zinc-300 hover:text-toxic hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-toxic/5 text-center backdrop-blur-sm inline-flex items-center justify-center font-mono"
                            >
                                ❤️ Support My Work
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
        </main>
    )
}

export default Services

// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import useSEO from '../hooks/useSEO'
import { getServiceBySlug, servicesData } from '../data/servicesData'

const getMinBookDate = () => {
    const date = new Date()
    date.setDate(date.getDate() + 2)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

function BookNow() {
    const navigate = useNavigate()
    const [params] = useSearchParams()
    const requestedService = params.get('service')
    const selectedService = getServiceBySlug(requestedService) || servicesData[0]

    useSEO({
        title: `Book Now - ${selectedService.title} | Gaurav Kumar Yadav`,
        description: 'Booking request form. Payment gateway is currently under construction.',
        keywords: 'book service, booking request, payment under construction',
        ogImage: 'https://ggauravky.vercel.app/images/profile.jpg',
    })

    const minDate = useMemo(() => getMinBookDate(), [])

    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        service: selectedService.slug,
        preferredDate: minDate,
        preferredTime: '10:00',
        projectBrief: '',
    })

    const currentService = useMemo(
        () => servicesData.find((service) => service.slug === form.service) || selectedService,
        [form.service, selectedService]
    )

    const handleChange = (event) => {
        const { name, value } = event.target
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        const search = new URLSearchParams({
            service: currentService.slug,
            name: form.name,
            date: form.preferredDate,
            time: form.preferredTime,
        })
        navigate(`/payment-under-construction?${search.toString()}`)
    }

    return (
        <div className="min-h-screen bg-slate-900 relative overflow-hidden">
            <div className="absolute -top-24 right-0 w-[420px] h-[420px] rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 left-0 w-[420px] h-[420px] rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-18">
                <div className="mb-8">
                    <Link to="/services" className="inline-flex items-center gap-2 text-sm text-cyan-300 hover:text-cyan-200 transition-colors">
                        <span>←</span>
                        <span>Back to Services</span>
                    </Link>
                </div>

                <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">
                    <section className="lg:col-span-3 rounded-3xl border border-slate-700/70 bg-gradient-to-br from-slate-800/80 via-slate-900/90 to-slate-900 p-6 sm:p-8">
                        <h1 className="text-3xl sm:text-4xl font-black text-slate-100">Book a Service</h1>
                        <p className="text-slate-400 mt-2">Fill details and continue. Payment gateway is currently under construction.</p>

                        <form onSubmit={handleSubmit} className="mt-6 space-y-4 sm:space-y-5">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="name" className="block text-xs font-semibold tracking-wider uppercase text-slate-400 mb-1.5">Full Name</label>
                                    <input
                                        id="name"
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        maxLength={80}
                                        required
                                        placeholder="Your full name"
                                        className="w-full rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-xs font-semibold tracking-wider uppercase text-slate-400 mb-1.5">Email</label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        maxLength={120}
                                        required
                                        placeholder="you@example.com"
                                        className="w-full rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                                    />
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="phone" className="block text-xs font-semibold tracking-wider uppercase text-slate-400 mb-1.5">Phone</label>
                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        value={form.phone}
                                        onChange={handleChange}
                                        maxLength={15}
                                        required
                                        placeholder="10-digit number"
                                        className="w-full rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="service" className="block text-xs font-semibold tracking-wider uppercase text-slate-400 mb-1.5">Service</label>
                                    <select
                                        id="service"
                                        name="service"
                                        value={form.service}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-slate-100 focus:outline-none focus:border-cyan-500"
                                    >
                                        {servicesData.map((service) => (
                                            <option key={service.slug} value={service.slug}>
                                                {service.title} ({service.priceLabel})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="preferredDate" className="block text-xs font-semibold tracking-wider uppercase text-slate-400 mb-1.5">Preferred Date</label>
                                    <input
                                        id="preferredDate"
                                        name="preferredDate"
                                        type="date"
                                        min={minDate}
                                        value={form.preferredDate}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-slate-100 focus:outline-none focus:border-cyan-500"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Earliest booking is after 2 days from today.</p>
                                </div>
                                <div>
                                    <label htmlFor="preferredTime" className="block text-xs font-semibold tracking-wider uppercase text-slate-400 mb-1.5">Preferred Time</label>
                                    <input
                                        id="preferredTime"
                                        name="preferredTime"
                                        type="time"
                                        value={form.preferredTime}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-slate-100 focus:outline-none focus:border-cyan-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="projectBrief" className="block text-xs font-semibold tracking-wider uppercase text-slate-400 mb-1.5">Project Brief</label>
                                <textarea
                                    id="projectBrief"
                                    name="projectBrief"
                                    rows="5"
                                    value={form.projectBrief}
                                    onChange={handleChange}
                                    maxLength={1200}
                                    placeholder="Share your requirement, deadline, goals, and any important context."
                                    className="w-full rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full rounded-xl px-5 py-3.5 font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all duration-300 hover:scale-[1.01]"
                            >
                                Proceed to Payment Gateway
                            </button>
                        </form>
                    </section>

                    <aside className="lg:col-span-2 rounded-3xl border border-cyan-500/20 bg-slate-800/65 p-6 sm:p-7 h-fit sticky top-28">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-100">{currentService.title}</h2>
                        <p className="text-cyan-300 text-2xl font-extrabold mt-3">{currentService.priceLabel}</p>
                        <p className="text-xs text-slate-400 mt-2">Gateway status: under construction</p>

                        <ul className="mt-5 space-y-3">
                            {currentService.features.slice(0, 3).map((item) => (
                                <li key={item} className="text-slate-300 text-sm flex gap-2">
                                    <span className="mt-[7px] h-2 w-2 rounded-full bg-cyan-400 shrink-0" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
                            <p className="text-sm text-slate-200">Current update</p>
                            <ul className="mt-2 space-y-2 text-xs text-slate-400">
                                <li>Payment gateway integration is paused</li>
                                <li>You will be redirected to an under construction page</li>
                                <li>Use Contact page for direct updates</li>
                            </ul>
                        </div>

                        <div className="mt-5 grid grid-cols-1 gap-2.5">
                            <Link to="/projects" className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm text-slate-200 hover:border-cyan-500/40 hover:text-cyan-300 transition-colors text-center">
                                See Projects
                            </Link>
                            <Link to="/contact" className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm text-slate-200 hover:border-slate-500 hover:text-white transition-colors text-center">
                                Contact Me
                            </Link>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    )
}

export default BookNow

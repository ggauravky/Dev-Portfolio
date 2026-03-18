// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import useSEO from '../hooks/useSEO'
import { createPaymentOrder, loadRazorpayScript, verifyPayment } from '../services/payment'
import { getServiceBySlug, servicesData } from '../data/servicesData'
import { downloadBookingPdf, downloadGreetingCard, formatDateLabel, formatTimeLabel } from '../utils/bookingArtifacts'

const getMinBookDate = () => {
    const date = new Date()
    date.setDate(date.getDate() + 2)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

function BookNow() {
    const [params] = useSearchParams()
    const requestedService = params.get('service')
    const selectedService = getServiceBySlug(requestedService) || servicesData[0]

    useSEO({
        title: `Book Now - ${selectedService.title} | Gaurav Kumar Yadav`,
        description: 'Secure booking page for services with advanced details and Razorpay checkout.',
        keywords: 'book service, razorpay, developer booking, mentorship booking',
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
    const [paying, setPaying] = useState(false)
    const [showSuccessPopup, setShowSuccessPopup] = useState(false)
    const [bookingSummary, setBookingSummary] = useState(null)

    const currentService = useMemo(
        () => servicesData.find((service) => service.slug === form.service) || selectedService,
        [form.service, selectedService]
    )

    const handleChange = (event) => {
        const { name, value } = event.target
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setPaying(true)
        const loadingToast = toast.loading('Preparing secure checkout...')

        try {
            const scriptLoaded = await loadRazorpayScript()
            if (!scriptLoaded) {
                throw new Error('Unable to load Razorpay checkout. Please refresh and try again.')
            }

            const payload = {
                ...form,
                service: currentService.slug,
            }

            const orderResponse = await createPaymentOrder(payload)

            const options = {
                key: orderResponse.data.keyId,
                amount: orderResponse.data.amount,
                currency: orderResponse.data.currency,
                name: 'Gaurav Kumar Yadav',
                description: `${currentService.title} Booking`,
                order_id: orderResponse.data.orderId,
                prefill: {
                    name: form.name,
                    email: form.email,
                    contact: form.phone,
                },
                notes: {
                    service: currentService.title,
                    preferredDate: form.preferredDate,
                    preferredTime: form.preferredTime,
                },
                theme: {
                    color: '#2563eb',
                },
                handler: async (response) => {
                    try {
                        const verifyResponse = await verifyPayment({
                            ...payload,
                            amount: orderResponse.data.amount,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        })

                        setBookingSummary({
                            bookingId: verifyResponse?.data?.bookingId || `BK-${Date.now()}`,
                            name: payload.name,
                            email: payload.email,
                            serviceTitle: verifyResponse?.data?.service || currentService.title,
                            amount: verifyResponse?.data?.amount || currentService.amount,
                            preferredDate: payload.preferredDate,
                            preferredTime: payload.preferredTime,
                            paymentId: response.razorpay_payment_id,
                            orderId: response.razorpay_order_id,
                        })
                        setShowSuccessPopup(true)

                        toast.success('Payment successful. Your booking is confirmed.', { id: loadingToast, duration: 5000 })
                        setForm({
                            name: '',
                            email: '',
                            phone: '',
                            service: selectedService.slug,
                            preferredDate: minDate,
                            preferredTime: '10:00',
                            projectBrief: '',
                        })
                    } catch (verifyError) {
                        toast.error(verifyError.message || 'Payment verification failed.', { id: loadingToast, duration: 6000 })
                    } finally {
                        setPaying(false)
                    }
                },
                modal: {
                    ondismiss: () => {
                        toast.error('Payment cancelled.', { id: loadingToast })
                        setPaying(false)
                    },
                },
            }

            const razorpay = new globalThis.Razorpay(options)
            razorpay.on('payment.failed', (response) => {
                toast.error(response?.error?.description || 'Payment failed. Please try again.', {
                    id: loadingToast,
                    duration: 6000,
                })
                setPaying(false)
            })
            razorpay.open()
        } catch (error) {
            toast.error(error.message || 'Unable to start payment. Try again in a moment.', {
                id: loadingToast,
                duration: 6000,
            })
            setPaying(false)
        }
    }

    const handleDownloadPdf = async () => {
        if (!bookingSummary) return
        try {
            await downloadBookingPdf(bookingSummary)
        } catch {
            toast.error('Unable to generate PDF right now. Please try again.')
        }
    }

    const handleDownloadCard = () => {
        if (!bookingSummary) return
        try {
            downloadGreetingCard(bookingSummary)
        } catch {
            toast.error('Unable to generate greeting card right now. Please try again.')
        }
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
                        <p className="text-slate-400 mt-2">Advanced booking form with secure Razorpay checkout.</p>

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
                                disabled={paying}
                                className="w-full rounded-xl px-5 py-3.5 font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all duration-300 hover:scale-[1.01] disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {paying ? 'Processing...' : 'Proceed to Secure Payment'}
                            </button>
                        </form>
                    </section>

                    <aside className="lg:col-span-2 rounded-3xl border border-cyan-500/20 bg-slate-800/65 p-6 sm:p-7 h-fit sticky top-28">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-100">{currentService.title}</h2>
                        <p className="text-cyan-300 text-2xl font-extrabold mt-3">{currentService.priceLabel}</p>
                        <p className="text-xs text-slate-400 mt-2">Payable now: {currentService.checkoutLabel || currentService.priceLabel}</p>
                        <p className="text-sm text-slate-200 mt-1.5">
                            Exact Razorpay charge: <span className="font-semibold text-cyan-300">INR {currentService.amount}</span>
                        </p>

                        <ul className="mt-5 space-y-3">
                            {currentService.features.slice(0, 3).map((item) => (
                                <li key={item} className="text-slate-300 text-sm flex gap-2">
                                    <span className="mt-[7px] h-2 w-2 rounded-full bg-cyan-400 shrink-0" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
                            <p className="text-sm text-slate-200">Security and trust</p>
                            <ul className="mt-2 space-y-2 text-xs text-slate-400">
                                <li>Razorpay secure checkout</li>
                                <li>No card data stored by this website</li>
                                <li>Booking details stored securely for service delivery</li>
                            </ul>
                        </div>

                        <div className="mt-5 grid grid-cols-1 gap-2.5">
                            <Link to="/projects" className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm text-slate-200 hover:border-cyan-500/40 hover:text-cyan-300 transition-colors text-center">
                                See Projects
                            </Link>
                            <a href="https://github.com/ggauravky" target="_blank" rel="noopener noreferrer" className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm text-slate-200 hover:border-slate-500 hover:text-white transition-colors text-center">
                                View GitHub
                            </a>
                        </div>
                    </aside>
                </div>
            </div>

            {showSuccessPopup && bookingSummary ? (
                <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 sm:p-6">
                    <button
                        type="button"
                        aria-label="Close success popup"
                        onClick={() => setShowSuccessPopup(false)}
                        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                    />

                    <div className="relative w-full max-w-2xl rounded-3xl border border-cyan-500/25 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 p-6 sm:p-8 shadow-2xl shadow-black/60">
                        <div className="absolute -top-12 -right-10 h-36 w-36 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-12 -left-8 h-32 w-32 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />

                        <div className="relative z-10">
                            <div className="flex items-start justify-between gap-4 mb-5">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.2em] text-cyan-300 font-semibold">Payment Success</p>
                                    <h3 className="text-2xl sm:text-3xl font-black text-slate-100 mt-2">You are enrolled successfully</h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowSuccessPopup(false)}
                                    className="h-9 w-9 rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 transition-colors"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="rounded-2xl border border-slate-700/70 bg-slate-800/60 p-4 sm:p-5">
                                <p className="text-slate-100 text-lg font-semibold">{bookingSummary.serviceTitle}</p>
                                <div className="grid sm:grid-cols-2 gap-3 mt-4 text-sm">
                                    <p className="text-slate-300">Booking ID: <span className="text-cyan-300 font-semibold">{bookingSummary.bookingId}</span></p>
                                    <p className="text-slate-300">Amount Paid: <span className="text-cyan-300 font-semibold">INR {bookingSummary.amount}</span></p>
                                    <p className="text-slate-300">Preferred Date: <span className="text-blue-300 font-semibold">{formatDateLabel(bookingSummary.preferredDate)}</span></p>
                                    <p className="text-slate-300">Preferred Time: <span className="text-blue-300 font-semibold">{formatTimeLabel(bookingSummary.preferredTime)}</span></p>
                                </div>
                            </div>

                            <div className="mt-5 grid sm:grid-cols-2 gap-3.5">
                                <button
                                    type="button"
                                    onClick={handleDownloadPdf}
                                    className="inline-flex items-center justify-center rounded-xl px-4 py-3 font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 transition-all duration-300 hover:scale-[1.02]"
                                >
                                    Download Booking PDF
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDownloadCard}
                                    className="inline-flex items-center justify-center rounded-xl px-4 py-3 font-semibold text-slate-100 border border-slate-600 hover:border-cyan-400/50 hover:text-cyan-300 transition-all duration-300 hover:scale-[1.02]"
                                >
                                    Download Greeting Card
                                </button>
                            </div>

                            <p className="mt-4 text-xs text-slate-400">
                                Keep these files for future reference. Need any changes in schedule? Reach out from Contact page.
                            </p>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    )
}

export default BookNow

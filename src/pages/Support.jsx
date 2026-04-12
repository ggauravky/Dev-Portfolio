// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import useSEO from '../hooks/useSEO'
import { createSupportOrder, fetchSupportReceiptPdf, openCashfreeCheckout, verifySupportPayment } from '../services/payment'
import TrustStrip from '../components/TrustStrip'

const quickAmounts = [49, 99, 199, 499, 999, 1999]

function Support() {
    useSEO({
        title: 'Support Jar | Gaurav Kumar Yadav',
        description: 'Support my work directly with any amount through secure Cashfree checkout.',
        keywords: 'support, tip jar, direct contribution, cashfree payment',
        ogImage: 'https://ggauravky.vercel.app/images/profile.jpg',
    })

    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        amount: '199',
        message: '',
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [supportSuccess, setSupportSuccess] = useState(null)
    const [thankYouNote, setThankYouNote] = useState('')
    const [paymentFailure, setPaymentFailure] = useState('')
    const [isDownloadingReceipt, setIsDownloadingReceipt] = useState(false)
    const [receiptDownloadError, setReceiptDownloadError] = useState('')

    const pendingSupportKey = 'pendingSupportOrder'

    const handleChange = (event) => {
        const { name, value } = event.target

        if (name === 'phone') {
            const digitsOnly = value.replaceAll(/\D/g, '').slice(0, 10)
            setForm((prev) => ({ ...prev, phone: digitsOnly }))
            return
        }

        setForm((prev) => ({ ...prev, [name]: value }))
    }

    const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
    const getRetryDelay = (attempt) => [1200, 2000, 3200, 5000, 7000][attempt] || 7000
    const isTransientVerificationFailure = (message, statusCode) => {
        const text = String(message || '')
        if ([429, 500, 502, 503, 504].includes(Number(statusCode))) {
            return true
        }

        return /not completed yet|processing|finaliz|temporarily unavailable|timed out|timeout|network|gateway|reconcil|unable to verify support payment|try again shortly/i.test(text)
    }
    const isTerminalPaymentFailure = (message) => /cancelled|canceled|failed|dropped|expired|not completed(?! yet)/i.test(String(message || ''))

    const saveBlobAsFile = (blob, filename) => {
        const url = URL.createObjectURL(blob)
        const link = globalThis.document.createElement('a')
        link.href = url
        link.download = filename
        globalThis.document.body.appendChild(link)
        link.click()
        link.remove()
        URL.revokeObjectURL(url)
    }

    const downloadBlob = (content, filename, mimeType) => {
        const blob = new Blob([content], { type: mimeType })
        const url = URL.createObjectURL(blob)
        const link = globalThis.document.createElement('a')
        link.href = url
        link.download = filename
        globalThis.document.body.appendChild(link)
        link.click()
        link.remove()
        URL.revokeObjectURL(url)
    }

    const downloadSupportReceipt = (details) => {
        const html = `<!doctype html>
<html>
    <head>
        <meta charset="utf-8" />
        <title>Support Receipt</title>
        <style>
            body { font-family: Arial, sans-serif; background:#0f172a; color:#e2e8f0; padding:20px; }
            .card { max-width:620px; margin:0 auto; border:1px solid #334155; border-radius:16px; padding:24px; background:#111827; }
            h1 { color:#22d3ee; margin:0 0 10px 0; }
            p { margin:8px 0; line-height:1.5; }
            .meta { color:#94a3b8; font-size:14px; }
            .tag { display:inline-block; padding:6px 12px; border-radius:999px; background:#0f2740; color:#7dd3fc; border:1px solid #164e63; font-size:12px; margin-bottom:16px; }
        </style>
    </head>
    <body>
        <div class="card">
            <div class="tag">Support Confirmed</div>
            <h1>Thank You for Supporting</h1>
            <p><strong>Name:</strong> ${details.contributorName || 'Supporter'}</p>
            <p><strong>Amount:</strong> INR ${details.amount}</p>
            <p><strong>Order ID:</strong> ${details.orderId}</p>
            <p><strong>Payment ID:</strong> ${details.paymentId}</p>
            <p class="meta">Your support helps me continue building and sharing practical developer work.</p>
        </div>
    </body>
</html>`

        downloadBlob(html, `support-receipt-${details.orderId}.html`, 'text/html;charset=utf-8')
    }

    const downloadSupportReceiptPdf = async (details, options = {}) => {
        const { silent = false, auto = false } = options

        if (!details?.orderId || !details?.email) {
            if (!silent) {
                toast.error('Receipt details are incomplete for PDF download')
            }
            return false
        }

        setIsDownloadingReceipt(true)

        try {
            const blob = await fetchSupportReceiptPdf(details.orderId, details.email)
            saveBlobAsFile(blob, `support-receipt-${details.orderId}.pdf`)
            setReceiptDownloadError('')

            if (!silent) {
                toast.success('Support receipt PDF downloaded')
            }

            return true
        } catch (error) {
            const message = String(error?.message || 'Unable to download support receipt PDF')
            setReceiptDownloadError(
                auto
                    ? 'Automatic PDF download was blocked. Use the button below to download your receipt.'
                    : message
            )

            if (!silent) {
                toast.error(message)
            }

            return false
        } finally {
            setIsDownloadingReceipt(false)
        }
    }

    const applyVerifiedSupport = (pendingDetails, verification, silent) => {
        const merged = {
            ...pendingDetails,
            amount: verification.amount,
            contributorName: verification.contributorName,
            paymentId: verification.paymentId,
            emailDispatchQueued: Boolean(verification.emailDispatchQueued),
        }

        setSupportSuccess(merged)
        setPaymentFailure('')
        setReceiptDownloadError('')
        sessionStorage.removeItem(pendingSupportKey)
        setThankYouNote('Thank you for helping me grow. Your support means a lot!')

        if (!silent) {
            toast.success('Support payment verified. Thank you!')
        }

        void downloadSupportReceiptPdf(merged, { silent: true, auto: true })

        return true
    }

    const handleSupportVerificationError = async (error, attempt, silent) => {
        const message = String(error?.message || '')
        const statusCode = Number(error?.status)
        const transientFailure = isTransientVerificationFailure(message, statusCode)
        const shouldRetry = transientFailure && attempt < 4

        if (shouldRetry) {
            await pause(getRetryDelay(attempt))
            return { shouldRetry: true, result: false }
        }

        if (isTerminalPaymentFailure(message)) {
            setPaymentFailure(message || 'Payment was not completed. No support amount has been confirmed.')
            sessionStorage.removeItem(pendingSupportKey)
            if (!silent) {
                toast.error(message || 'Payment was not completed. No support amount has been confirmed.')
            }
            return { shouldRetry: false, result: false }
        }

        if (transientFailure) {
            const pendingMessage = 'Payment is still processing on gateway. Please wait a moment and retry with the same email.'
            setPaymentFailure(pendingMessage)
            if (!silent) {
                toast.error(pendingMessage)
            }
            return { shouldRetry: false, result: false }
        }

        setPaymentFailure(message || 'Unable to verify support payment')
        if (!silent) {
            toast.error(message || 'Unable to verify support payment')
        }

        return { shouldRetry: false, result: false }
    }

    const finalizeSupportVerification = async (orderId, pendingDetails, options = {}) => {
        const { silent = false } = options

        for (let attempt = 0; attempt < 5; attempt += 1) {
            try {
                const verification = await verifySupportPayment(orderId, pendingDetails.email)
                return applyVerifiedSupport(pendingDetails, verification, silent)
            } catch (error) {
                const outcome = await handleSupportVerificationError(error, attempt, silent)
                if (outcome.shouldRetry) {
                    continue
                }
                return outcome.result
            }
        }

        if (!silent) {
            toast.error('Verification timed out. Please try again with same email.')
        }
        return false
    }

    useEffect(() => {
        if (!thankYouNote) {
            return
        }

        const timer = setTimeout(() => {
            setThankYouNote('')
        }, 9000)

        return () => clearTimeout(timer)
    }, [thankYouNote])

    useEffect(() => {
        const pendingRaw = sessionStorage.getItem(pendingSupportKey)
        if (!pendingRaw) {
            return
        }

        let pending = null
        try {
            pending = JSON.parse(pendingRaw)
        } catch {
            pending = null
        }

        if (!pending?.orderId || !pending?.email) {
            sessionStorage.removeItem(pendingSupportKey)
            return
        }

        finalizeSupportVerification(pending.orderId, pending, { silent: true })
    }, [])

    const handleSubmit = (event) => {
        event.preventDefault()

        const runCheckout = async () => {
            setIsSubmitting(true)
            setPaymentFailure('')
            try {
                if (!/^[6-9]\d{9}$/.test(String(form.phone || '').trim())) {
                    throw new Error('Phone must be a valid 10-digit Indian mobile number')
                }

                const numericAmount = Number.parseInt(form.amount, 10)
                if (!Number.isFinite(numericAmount) || numericAmount < 1 || numericAmount > 100000) {
                    throw new Error('Amount must be between INR 1 and INR 100000')
                }

                const order = await createSupportOrder({
                    ...form,
                    amount: numericAmount,
                })

                const pending = {
                    orderId: order.orderId,
                    email: form.email,
                    contributorName: form.name,
                    amount: numericAmount,
                }
                sessionStorage.setItem(pendingSupportKey, JSON.stringify(pending))

                const checkoutResult = await openCashfreeCheckout({
                    paymentSessionId: order.paymentSessionId,
                    environment: order.environment,
                })

                if (checkoutResult?.error) {
                    throw new Error(
                        `Payment was not completed. ${checkoutResult.error.message || 'Checkout was cancelled or failed.'} No support amount has been confirmed.`
                    )
                }

                await finalizeSupportVerification(order.orderId, pending)
            } catch (error) {
                const message = error?.message || 'Unable to start support checkout'
                setPaymentFailure(message)
                if (isTerminalPaymentFailure(message)) {
                    sessionStorage.removeItem(pendingSupportKey)
                }
                toast.error(message)
            } finally {
                setIsSubmitting(false)
            }
        }

        runCheckout()
    }

    return (
        <div className="min-h-screen bg-slate-900 relative overflow-hidden">
            <div className="absolute -top-20 right-0 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 left-0 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-18">
                {thankYouNote ? (
                    <div className="mb-4 rounded-xl border border-emerald-500/35 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                        {thankYouNote}
                    </div>
                ) : null}

                <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
                    <Link to="/services" className="inline-flex items-center gap-2 text-sm text-cyan-300 hover:text-cyan-200 transition-colors">
                        <span>{'<-'}</span>
                        <span>Back to Services</span>
                    </Link>
                    <span className="inline-flex items-center rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-cyan-300">
                        Support Jar
                    </span>
                </div>

                <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">
                    <section className="lg:col-span-3 rounded-3xl border border-slate-700/70 bg-gradient-to-br from-slate-800/80 via-slate-900/90 to-slate-900 p-6 sm:p-8">
                        <h1 className="text-3xl sm:text-4xl font-black text-slate-100">Support My Work</h1>
                        <p className="text-slate-400 mt-2">
                            If my work helped you, you can send any amount directly. Secure checkout is powered by Cashfree.
                        </p>

                        <div className="mt-5 rounded-xl border border-slate-700/80 bg-slate-900/45 px-4 py-3">
                            <p className="text-xs uppercase tracking-wider text-slate-400">How It Works</p>
                            <p className="text-sm text-slate-200 mt-1">Choose or type an amount, complete payment, and get instant confirmation.</p>
                        </div>

                        {paymentFailure ? (
                            <div className="mt-4 rounded-xl border border-rose-500/35 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                                {paymentFailure}
                            </div>
                        ) : null}

                        <div className="mt-4 grid sm:grid-cols-3 gap-3">
                            <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3">
                                <p className="text-[11px] uppercase tracking-wider text-cyan-300">100%</p>
                                <p className="text-sm text-slate-100 mt-1">Secure checkout</p>
                            </div>
                            <div className="rounded-xl border border-slate-700 bg-slate-900/45 p-3">
                                <p className="text-[11px] uppercase tracking-wider text-slate-500">Instant</p>
                                <p className="text-sm text-slate-200 mt-1">Order tracking</p>
                            </div>
                            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
                                <p className="text-[11px] uppercase tracking-wider text-emerald-300">Download</p>
                                <p className="text-sm text-slate-100 mt-1">Receipt proof</p>
                            </div>
                        </div>

                        <div className="mt-4 grid sm:grid-cols-3 gap-3">
                            <div className="rounded-xl border border-slate-700 bg-slate-900/45 p-3">
                                <p className="text-[11px] uppercase tracking-wider text-slate-500">Step 1</p>
                                <p className="text-sm text-slate-200 mt-1">Set amount</p>
                            </div>
                            <div className="rounded-xl border border-slate-700 bg-slate-900/45 p-3">
                                <p className="text-[11px] uppercase tracking-wider text-slate-500">Step 2</p>
                                <p className="text-sm text-slate-200 mt-1">Pay securely</p>
                            </div>
                            <div className="rounded-xl border border-slate-700 bg-slate-900/45 p-3">
                                <p className="text-[11px] uppercase tracking-wider text-slate-500">Step 3</p>
                                <p className="text-sm text-slate-200 mt-1">Download receipt</p>
                            </div>
                        </div>

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
                                        placeholder="Your name"
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
                                        minLength={10}
                                        maxLength={10}
                                        inputMode="numeric"
                                        pattern="[6-9][0-9]{9}"
                                        autoComplete="tel-national"
                                        required
                                        placeholder="10-digit number"
                                        className="w-full rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="amount" className="block text-xs font-semibold tracking-wider uppercase text-slate-400 mb-1.5">Amount (INR)</label>
                                    <input
                                        id="amount"
                                        name="amount"
                                        type="number"
                                        min="1"
                                        max="100000"
                                        value={form.amount}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter any amount"
                                        className="w-full rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <p className="block text-xs font-semibold tracking-wider uppercase text-slate-400 mb-2">Quick Amounts</p>
                                <div className="flex flex-wrap gap-2.5">
                                    {quickAmounts.map((amt) => (
                                        <button
                                            key={amt}
                                            type="button"
                                            onClick={() => setForm((prev) => ({ ...prev, amount: String(amt) }))}
                                            className={`rounded-lg px-3 py-2 text-sm font-semibold border transition-colors ${
                                                Number.parseInt(form.amount, 10) === amt
                                                    ? 'border-cyan-400 bg-cyan-500/10 text-cyan-300'
                                                    : 'border-slate-700 bg-slate-800/80 text-slate-300 hover:border-cyan-500/40'
                                            }`}
                                        >
                                            INR {amt}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-xs font-semibold tracking-wider uppercase text-slate-400 mb-1.5">Message (optional)</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    rows="4"
                                    value={form.message}
                                    onChange={handleChange}
                                    maxLength={300}
                                    placeholder="Write a short note"
                                    className="w-full rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full rounded-xl px-5 py-3.5 font-semibold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 transition-all duration-300"
                            >
                                {isSubmitting ? 'Starting Secure Checkout...' : 'Support with Cashfree'}
                            </button>
                        </form>
                    </section>

                    <aside className="lg:col-span-2 rounded-3xl border border-cyan-500/20 bg-slate-800/65 p-6 sm:p-7 h-fit sticky top-28">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-100">Why this Support Jar?</h2>
                        <p className="text-slate-300 text-sm mt-3 leading-relaxed">
                            This helps me keep sharing useful projects, guides, and learning content consistently.
                        </p>

                        <div className="mt-5 rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
                            <p className="text-sm text-slate-200">Trust and Security</p>
                            <ul className="mt-2 space-y-2 text-xs text-slate-400">
                                <li>Secure checkout via Cashfree</li>
                                <li>UPI, cards, netbanking, wallets, pay later</li>
                                <li>No card number or UPI PIN stored on this site</li>
                            </ul>
                        </div>

                        <div className="mt-5 grid grid-cols-1 gap-2.5">
                            <Link to="/projects" className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm text-slate-200 hover:border-cyan-500/40 hover:text-cyan-300 transition-colors text-center">
                                Explore Projects
                            </Link>
                            <Link to="/contact" className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm text-slate-200 hover:border-slate-500 hover:text-white transition-colors text-center">
                                Contact Me
                            </Link>
                        </div>
                    </aside>
                </div>

                <section className="mt-8 sm:mt-10">
                    <TrustStrip variant="support" />
                </section>

                {supportSuccess ? (
                    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm px-4 py-8 overflow-y-auto">
                        <div className="relative max-w-xl mx-auto overflow-hidden rounded-3xl border border-emerald-400/25 bg-gradient-to-b from-slate-900 to-slate-950 p-6 sm:p-8">
                            <div className="pointer-events-none absolute -top-20 -right-16 h-52 w-52 rounded-full bg-emerald-500/20 blur-3xl" />
                            <div className="relative">
                                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/35 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold tracking-widest uppercase text-emerald-200">
                                    <span>Support Confirmed</span>
                                </div>
                                <h2 className="mt-4 text-2xl sm:text-3xl font-black text-slate-100">Thank You for Supporting</h2>
                                <p className="mt-2 text-slate-300 text-sm sm:text-base">
                                    Your contribution has been received successfully.
                                </p>
                                <p className="mt-2 text-xs text-slate-400">
                                    Your PDF receipt download starts automatically. A copy is also sent to your email.
                                </p>

                                <div className="mt-5 rounded-2xl border border-slate-700 bg-slate-800/55 p-4 text-sm text-slate-300 space-y-1.5">
                                    <p><span className="text-slate-400">Name:</span> {supportSuccess.contributorName || supportSuccess.contributor}</p>
                                    <p><span className="text-slate-400">Amount:</span> INR {supportSuccess.amount}</p>
                                    <p><span className="text-slate-400">Order ID:</span> {supportSuccess.orderId}</p>
                                    <p><span className="text-slate-400">Payment ID:</span> {supportSuccess.paymentId}</p>
                                </div>

                                <div className="mt-4">
                                    <button
                                        type="button"
                                        disabled={isDownloadingReceipt}
                                        onClick={() => downloadSupportReceiptPdf(supportSuccess)}
                                        className="w-full rounded-xl px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 transition-all duration-300"
                                    >
                                        {isDownloadingReceipt ? 'Downloading PDF Receipt...' : 'Download Support Receipt PDF'}
                                    </button>
                                </div>

                                <div className="mt-3">
                                    <button
                                        type="button"
                                        onClick={() => downloadSupportReceipt(supportSuccess)}
                                        className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-100 border border-slate-600 hover:border-slate-500 transition-colors"
                                    >
                                        Download HTML Backup Receipt
                                    </button>
                                </div>

                                {receiptDownloadError ? (
                                    <div className="mt-3 rounded-xl border border-amber-500/35 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                                        {receiptDownloadError}
                                    </div>
                                ) : null}

                                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSupportSuccess(null)
                                            setReceiptDownloadError('')
                                            setForm((prev) => ({ ...prev, message: '' }))
                                        }}
                                        className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-100 border border-slate-600 hover:border-slate-500 transition-colors"
                                    >
                                        Close
                                    </button>
                                    <Link
                                        to="/services"
                                        className="inline-flex justify-center rounded-xl px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all duration-300"
                                    >
                                        Explore Services
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    )
}

export default Support

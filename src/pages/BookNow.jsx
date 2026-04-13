// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import useSEO from '../hooks/useSEO'
import useAuth from '../hooks/useAuth'
import { getServiceBySlug, servicesData } from '../data/servicesData'
import {
    createCashfreeOrder,
    fetchServiceReceiptImage,
    fetchServiceReceiptPdf,
    openCashfreeCheckout,
    verifyCashfreePayment,
} from '../services/payment'
import TrustStrip from '../components/TrustStrip'
import StickyMobileCTA from '../components/StickyMobileCTA'
import GoogleSignInModal from '../components/support/GoogleSignInModal'

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
    const { user, isAuthenticated, isLoading, refreshSession, updateProfile } = useAuth()
    const requestedService = params.get('service')
    const selectedService = getServiceBySlug(requestedService) || servicesData[0]

    useSEO({
        title: `Book Now - ${selectedService.title} | Gaurav Kumar Yadav`,
        description: 'Secure service booking with Cashfree checkout. Supports UPI, cards, netbanking, wallets, and pay later.',
        keywords: 'book service, cashfree payment, secure checkout, upi payment',
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
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [paymentSuccess, setPaymentSuccess] = useState(null)
    const [paymentFailure, setPaymentFailure] = useState('')
    const [isDownloadingReceipt, setIsDownloadingReceipt] = useState(false)
    const [receiptDownloadError, setReceiptDownloadError] = useState('')
    const [showSignInModal, setShowSignInModal] = useState(false)

    const pendingOrderKey = 'pendingCashfreeOrder'
    const requiresSignIn = isAuthenticated !== true

    const currentService = useMemo(
        () => servicesData.find((service) => service.slug === form.service) || selectedService,
        [form.service, selectedService]
    )
    const getCheckoutButtonLabel = () => {
        if (isLoading) {
            return 'Checking Sign-In...'
        }

        if (requiresSignIn) {
            return 'Sign In to Continue'
        }

        if (isSubmitting) {
            return 'Starting Secure Checkout...'
        }

        return 'Proceed to Secure Checkout'
    }
    const checkoutButtonLabel = getCheckoutButtonLabel()

    const handleChange = (event) => {
        const { name, value } = event.target

        if (name === 'phone') {
            const digitsOnly = value.replaceAll(/\D/g, '').slice(0, 10)
            setForm((prev) => ({ ...prev, phone: digitsOnly }))
            return
        }

        setForm((prev) => ({ ...prev, [name]: value }))
    }

    useEffect(() => {
        if (!isAuthenticated || !user) {
            return
        }

        setForm((prev) => ({
            ...prev,
            name: prev.name || user.displayName || user.name || '',
            email: user.email || prev.email,
        }))
    }, [isAuthenticated, user])

    const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
    const getRetryDelay = (attempt) => [1200, 2000, 3200, 5000, 7000][attempt] || 7000
    const classifyVerificationFailure = (message, statusCode) => {
        const text = String(message || '')
        const normalizedStatus = Number(statusCode)
        const isPendingGatewayState = /not completed yet|processing|finaliz|reconcil/i.test(text)
        const isRetryableServerState =
            [429, 500, 502, 503, 504].includes(normalizedStatus) ||
            /temporarily unavailable|timed out|timeout|network|gateway|try again shortly/i.test(text)

        return {
            isPendingGatewayState,
            isRetryable: isPendingGatewayState || isRetryableServerState,
        }
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

    const downloadServiceReceiptPdf = async (details, options = {}) => {
        const { silent = false, auto = false } = options

        if (!details?.orderId || !details?.email) {
            if (!silent) {
                toast.error('Receipt details are incomplete for PDF download')
            }
            return false
        }

        setIsDownloadingReceipt(true)

        try {
            const blob = await fetchServiceReceiptPdf(details.orderId, details.email)
            saveBlobAsFile(blob, `service-confirmation-${details.orderId}.pdf`)
            setReceiptDownloadError('')

            if (!silent) {
                toast.success('Service confirmation PDF downloaded')
            }

            return true
        } catch (error) {
            if (auto) {
                const imageFallbackDownloaded = await downloadServiceReceiptImage(details, {
                    silent: true,
                    auto: true,
                })

                if (imageFallbackDownloaded) {
                    return true
                }
            }

            const message = String(error?.message || 'Unable to download service confirmation PDF')
            setReceiptDownloadError(
                auto
                    ? 'Automatic PDF download was blocked. Use the image backup button below.'
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

    const downloadServiceReceiptImage = async (details, options = {}) => {
        const { silent = false, auto = false } = options

        if (!details?.orderId || !details?.email) {
            if (!silent) {
                toast.error('Receipt details are incomplete for image download')
            }
            return false
        }

        setIsDownloadingReceipt(true)

        try {
            const blob = await fetchServiceReceiptImage(details.orderId, details.email)
            saveBlobAsFile(blob, `service-confirmation-${details.orderId}.svg`)
            setReceiptDownloadError(
                auto
                    ? 'PDF download was unavailable, so an image backup receipt was downloaded instead.'
                    : ''
            )

            if (!silent) {
                toast.success('Service confirmation image downloaded')
            }

            return true
        } catch (error) {
            const message = String(error?.message || 'Unable to download service confirmation image')
            if (!auto) {
                setReceiptDownloadError(message)
            }

            if (!silent) {
                toast.error(message)
            }

            return false
        } finally {
            setIsDownloadingReceipt(false)
        }
    }

    const formatDateForDisplay = (dateString) => {
        const value = new Date(dateString)
        if (Number.isNaN(value.getTime())) {
            return dateString
        }
        return value.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        })
    }

    const escapeHtml = (value) =>
        String(value || '')
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#39;')

    const downloadInvitationCard = (details) => {
                const safeName = escapeHtml(details.name)
                const safeService = escapeHtml(details.service)
                const safeDate = escapeHtml(formatDateForDisplay(details.preferredDate))
                const safeTime = escapeHtml(details.preferredTime)
                const safeAmount = escapeHtml(details.amount)
                const safeOrderId = escapeHtml(details.orderId)
                const safePaymentId = escapeHtml(details.paymentId)
                const safeEmail = escapeHtml(details.email)
                const safeBrief = escapeHtml(details.projectBrief || 'Not provided')

        const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Booking Invitation</title>
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
      <div class="tag">Booking Confirmed</div>
            <h1>${safeService}</h1>
            <p>Hi ${safeName}, your booking request has been confirmed successfully.</p>
            <p><strong>Date:</strong> ${safeDate}</p>
            <p><strong>Time:</strong> ${safeTime}</p>
            <p><strong>Amount Paid:</strong> INR ${safeAmount}</p>
            <p><strong>Order ID:</strong> ${safeOrderId}</p>
            <p><strong>Payment ID:</strong> ${safePaymentId}</p>
            <p><strong>Email:</strong> ${safeEmail}</p>
            <p class="meta">Project Brief: ${safeBrief}</p>
      <p class="meta">Thanks for booking with Gaurav Kumar Yadav.</p>
    </div>
  </body>
</html>`

        downloadBlob(html, `booking-invitation-${details.orderId}.html`, 'text/html;charset=utf-8')
    }

    const downloadCalendarInvite = (details) => {
        const [hours, minutes] = String(details.preferredTime || '10:00').split(':').map((value) => Number.parseInt(value, 10) || 0)
        const start = new Date(details.preferredDate)
        start.setHours(hours, minutes, 0, 0)
        const end = new Date(start.getTime() + 60 * 60 * 1000)

        const toUtc = (value) =>
            value
                .toISOString()
                .replaceAll('-', '')
                .replaceAll(':', '')
                .replaceAll('.000', '')

        const ics = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Gaurav Kumar Yadav//Service Booking//EN',
            'BEGIN:VEVENT',
            `UID:${details.orderId}@ggauravky.vercel.app`,
            `DTSTAMP:${toUtc(new Date())}`,
            `DTSTART:${toUtc(start)}`,
            `DTEND:${toUtc(end)}`,
            `SUMMARY:${details.service} - Booking Session`,
            `DESCRIPTION:Booking ID ${details.orderId} | Payment ID ${details.paymentId}`,
            'END:VEVENT',
            'END:VCALENDAR',
        ].join('\r\n')

        downloadBlob(ics, `booking-calendar-${details.orderId}.ics`, 'text/calendar;charset=utf-8')
    }

    const applyVerifiedOrder = (orderId, pendingDetails, verification, silent) => {
        const mergedDetails = {
            ...pendingDetails,
            bookingId: verification.bookingId,
            amount: verification.amount,
            service: verification.service,
            paymentId: verification.paymentId || pendingDetails.paymentId || `cf_${orderId}`,
            emailDispatchQueued: Boolean(verification.emailDispatchQueued),
        }

        setPaymentSuccess(mergedDetails)
        setPaymentFailure('')
        setReceiptDownloadError('')
        sessionStorage.removeItem(pendingOrderKey)

        if (!silent) {
            toast.success('Payment verified and booking confirmed')
        }

        void downloadServiceReceiptPdf(mergedDetails, { silent: true, auto: true })

        return true
    }

    const handleOrderVerificationError = async (error, attempt, silent) => {
        const message = String(error?.message || '')
        const statusCode = Number(error?.status)
        const failure = classifyVerificationFailure(message, statusCode)
        const shouldRetry = failure.isRetryable && attempt < 4

        if (shouldRetry) {
            await pause(getRetryDelay(attempt))
            return { shouldRetry: true, result: false }
        }

        if (isTerminalPaymentFailure(message)) {
            setPaymentFailure(message || 'Payment was not completed. No booking has been confirmed yet.')
            sessionStorage.removeItem(pendingOrderKey)

            if (!silent) {
                toast.error(message || 'Payment was not completed. No booking has been confirmed yet.')
            }

            return { shouldRetry: false, result: false }
        }

        if (failure.isPendingGatewayState) {
            const pendingMessage = 'Payment is still processing on gateway. Please wait a moment and retry with the same email.'
            setPaymentFailure(pendingMessage)

            if (!silent) {
                toast.error(pendingMessage)
            }

            return { shouldRetry: false, result: false }
        }

        if (failure.isRetryable) {
            const retryableServerMessage =
                'Payment was captured but verification is temporarily unavailable on server. Please retry shortly with the same email, or contact support with your order ID.'
            setPaymentFailure(retryableServerMessage)

            if (!silent) {
                toast.error(retryableServerMessage)
            }

            return { shouldRetry: false, result: false }
        }

        setPaymentFailure(message || 'Payment verification failed')

        if (!silent) {
            toast.error(message || 'Payment verification failed')
        }

        return { shouldRetry: false, result: false }
    }

    const finalizeOrderVerification = async (orderId, pendingDetails, options = {}) => {
        const { silent = false } = options

        for (let attempt = 0; attempt < 5; attempt += 1) {
            try {
                const verification = await verifyCashfreePayment(orderId, pendingDetails.email)
                return applyVerifiedOrder(orderId, pendingDetails, verification, silent)
            } catch (error) {
                const outcome = await handleOrderVerificationError(error, attempt, silent)
                if (outcome.shouldRetry) {
                    continue
                }
                return outcome.result
            }
        }

        if (!silent) {
            toast.error('Payment verification timed out. Please contact support with your order ID.')
        }
        return false
    }

    const copyConfirmationSummary = async (details) => {
        const summary = [
            'Booking Confirmation',
            `Service: ${details.service}`,
            `Date: ${formatDateForDisplay(details.preferredDate)}`,
            `Time: ${details.preferredTime}`,
            `Order ID: ${details.orderId}`,
            `Booking ID: ${details.bookingId}`,
            `Payment ID: ${details.paymentId}`,
            `Amount Paid: INR ${details.amount}`,
        ].join('\n')

        try {
            await navigator.clipboard.writeText(summary)
            toast.success('Booking details copied')
        } catch {
            toast.error('Unable to copy details on this browser')
        }
    }

    useEffect(() => {
        if (isLoading || !isAuthenticated) {
            return
        }

        const pendingOrderRaw = sessionStorage.getItem(pendingOrderKey)
        if (!pendingOrderRaw) {
            return
        }

        let pending = null
        try {
            pending = JSON.parse(pendingOrderRaw)
        } catch {
            pending = null
        }

        if (!pending?.orderId || !pending?.email) {
            sessionStorage.removeItem(pendingOrderKey)
            return
        }

        finalizeOrderVerification(pending.orderId, pending, { silent: true })
    }, [isAuthenticated, isLoading])

    const handleSubmit = (event) => {
        event.preventDefault()

        if (isLoading) {
            toast.error('Checking your sign-in session. Please wait a second.')
            return
        }

        if (!isAuthenticated || !user?.email) {
            setShowSignInModal(true)
            toast.error('Please sign in with Google before booking a service.')
            return
        }

        const runCheckout = async () => {
            setIsSubmitting(true)
            setPaymentFailure('')

            try {
                const resolvedName = String(form.name || '').trim()
                const profileName = String(user?.displayName || user?.name || '').trim()

                if (!resolvedName) {
                    throw new Error('Name is required')
                }

                if (resolvedName !== profileName) {
                    try {
                        await updateProfile({ displayName: resolvedName })
                    } catch (profileError) {
                        toast.error(profileError?.message || 'Unable to save your profile name right now')
                    }
                }

                if (!/^[6-9]\d{9}$/.test(String(form.phone || '').trim())) {
                    throw new Error('Phone must be a valid 10-digit Indian mobile number')
                }

                const order = await createCashfreeOrder({
                    ...form,
                    email: user.email,
                    service: currentService.slug,
                })

                const pending = {
                    orderId: order.orderId,
                    paymentId: '',
                    name: resolvedName,
                    email: user.email,
                    service: order.serviceTitle,
                    preferredDate: form.preferredDate,
                    preferredTime: form.preferredTime,
                    projectBrief: form.projectBrief,
                    amount: currentService.amount,
                }
                sessionStorage.setItem(pendingOrderKey, JSON.stringify(pending))

                const checkoutResult = await openCashfreeCheckout({
                    paymentSessionId: order.paymentSessionId,
                    environment: order.environment,
                })

                if (checkoutResult?.error) {
                    throw new Error(
                        `Payment was not completed. ${checkoutResult.error.message || 'Checkout was cancelled or failed.'} No booking has been confirmed yet.`
                    )
                }

                if (checkoutResult?.paymentDetails?.cf_payment_id) {
                    pending.paymentId = String(checkoutResult.paymentDetails.cf_payment_id)
                    sessionStorage.setItem(pendingOrderKey, JSON.stringify(pending))
                }

                await finalizeOrderVerification(order.orderId, pending)
            } catch (error) {
                const message = error?.message || 'Unable to start secure checkout'
                setPaymentFailure(message)
                if (isTerminalPaymentFailure(message)) {
                    sessionStorage.removeItem(pendingOrderKey)
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
            <div className="absolute -top-24 right-0 w-[420px] h-[420px] rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 left-0 w-[420px] h-[420px] rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-18">
                <div className="mb-8">
                    <Link to="/services" className="inline-flex items-center gap-2 text-sm text-cyan-300 hover:text-cyan-200 transition-colors">
                        <span>←</span>
                        <span>Back to Services</span>
                    </Link>
                </div>

                <div className="mb-6 flex flex-wrap items-center gap-2.5">
                    <span className="inline-flex items-center rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-cyan-300">
                        Secure Checkout
                    </span>
                    <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-800/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                        Instant Booking Confirmation
                    </span>
                    <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-800/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                        Invitation + Calendar Download
                    </span>
                </div>

                <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">
                    <section className="lg:col-span-3 rounded-3xl border border-slate-700/70 bg-gradient-to-br from-slate-800/80 via-slate-900/90 to-slate-900 p-6 sm:p-8">
                        <h1 className="text-3xl sm:text-4xl font-black text-slate-100">Book a Service</h1>
                        <p className="text-slate-400 mt-2">Fill details and continue with secure Cashfree checkout. Supports UPI, cards, netbanking, wallets, and pay later.</p>

                        <div className="mt-4 rounded-xl border border-slate-700/80 bg-slate-900/45 px-4 py-3">
                            <p className="text-xs text-slate-400 uppercase tracking-wider">Step 1</p>
                            <p className="text-sm text-slate-200 mt-1">Share your details and preferred schedule to create a secure payment order.</p>
                        </div>

                        {paymentFailure ? (
                            <div className="mt-4 rounded-xl border border-rose-500/35 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                                {paymentFailure}
                            </div>
                        ) : null}

                        {requiresSignIn ? (
                            <div className="mt-4 rounded-xl border border-cyan-500/35 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">
                                <p>Sign in with Google to continue. Your email is auto-filled and locked for secure booking history.</p>
                                <button
                                    type="button"
                                    onClick={() => setShowSignInModal(true)}
                                    className="mt-2 inline-flex items-center rounded-lg border border-cyan-400/35 bg-cyan-500/15 px-2.5 py-1 text-xs font-semibold text-cyan-100 hover:bg-cyan-500/25 transition-colors"
                                >
                                    Sign In with Google
                                </button>
                            </div>
                        ) : null}

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
                                        disabled={requiresSignIn || isLoading}
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
                                        readOnly
                                        disabled
                                        maxLength={120}
                                        required
                                        placeholder="Sign in with Google to auto-fill"
                                        className="w-full rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                                    />
                                    <p className="mt-1 text-[11px] text-slate-500">Email is locked to your signed-in Google account.</p>
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
                                        disabled={requiresSignIn || isLoading}
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
                                        disabled={requiresSignIn || isLoading}
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
                                        disabled={requiresSignIn || isLoading}
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
                                        disabled={requiresSignIn || isLoading}
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
                                    disabled={requiresSignIn || isLoading}
                                    maxLength={1200}
                                    placeholder="Share your requirement, deadline, goals, and any important context."
                                    className="w-full rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting || requiresSignIn || isLoading}
                                className="w-full rounded-xl px-5 py-3.5 font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all duration-300 hover:scale-[1.01]"
                            >
                                {checkoutButtonLabel}
                            </button>
                        </form>
                    </section>

                    <aside className="lg:col-span-2 rounded-3xl border border-cyan-500/20 bg-slate-800/65 p-6 sm:p-7 h-fit sticky top-28">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-300">Booking Summary</p>
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-100">{currentService.title}</h2>
                        <p className="text-cyan-300 text-2xl font-extrabold mt-3">{currentService.priceLabel}</p>
                        <p className="text-xs text-slate-400 mt-2">Gateway status: live via Cashfree</p>

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
                                <li>Server-side order creation and verification enabled</li>
                                <li>Supports UPI, cards, netbanking, wallets, and pay later</li>
                                <li>No card or UPI PIN data is stored on this website</li>
                            </ul>
                        </div>

                        <div className="mt-5 grid grid-cols-1 gap-2.5">
                            <Link to="/support" className="rounded-xl border border-cyan-500/35 px-4 py-2.5 text-sm text-cyan-200 hover:border-cyan-400 hover:text-cyan-100 transition-colors text-center bg-cyan-500/5">
                                Support Jar (Any Amount)
                            </Link>
                            <Link to="/projects" className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm text-slate-200 hover:border-cyan-500/40 hover:text-cyan-300 transition-colors text-center">
                                See Projects
                            </Link>
                            <Link to="/contact" className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm text-slate-200 hover:border-slate-500 hover:text-white transition-colors text-center">
                                Contact Me
                            </Link>
                        </div>
                    </aside>
                </div>

                <section className="mt-8 sm:mt-10">
                    <TrustStrip variant="booknow" />
                </section>

                <StickyMobileCTA
                    badge="Need Help Booking"
                    title="Start a conversation before checkout"
                    primaryLabel="Start a Conversation"
                    primaryTo="/contact"
                    secondaryLabel="View Services"
                    secondaryTo="/services"
                />

                {paymentSuccess ? (
                    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm px-4 py-8 overflow-y-auto">
                        <div className="relative max-w-2xl mx-auto overflow-hidden rounded-3xl border border-emerald-400/25 bg-gradient-to-b from-slate-900 to-slate-950 p-6 sm:p-8">
                            <div className="pointer-events-none absolute -top-20 -right-16 h-52 w-52 rounded-full bg-emerald-500/20 blur-3xl" />
                            <div className="pointer-events-none absolute -bottom-20 -left-16 h-52 w-52 rounded-full bg-cyan-500/20 blur-3xl" />

                            <div className="relative">
                                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/35 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold tracking-widest uppercase text-emerald-200">
                                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-200">OK</span>
                                    <span>Payment Confirmed</span>
                                </div>

                                <h2 className="mt-4 text-2xl sm:text-3xl font-black text-slate-100">Your Booking Is Confirmed</h2>
                                <p className="mt-2 text-slate-300 text-sm sm:text-base">
                                    Payment verification is complete. Save your invitation and calendar file to keep session details handy.
                                </p>
                                <p className="mt-2 text-xs text-slate-400">
                                    {paymentSuccess.emailDispatchQueued
                                        ? 'Your confirmation PDF starts downloading automatically. A copy is also sent to your email.'
                                        : 'Your confirmation PDF starts downloading automatically. Email delivery is temporarily unavailable, so please keep the downloaded files.'}
                                </p>

                                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                                    <div className="rounded-2xl border border-slate-700/80 bg-slate-800/70 p-4">
                                        <p className="text-[11px] uppercase tracking-wider text-slate-400">Service</p>
                                        <p className="mt-1 text-sm font-semibold text-slate-100">{paymentSuccess.service}</p>
                                    </div>
                                    <div className="rounded-2xl border border-slate-700/80 bg-slate-800/70 p-4">
                                        <p className="text-[11px] uppercase tracking-wider text-slate-400">Session Date</p>
                                        <p className="mt-1 text-sm font-semibold text-slate-100">{formatDateForDisplay(paymentSuccess.preferredDate)}</p>
                                    </div>
                                    <div className="rounded-2xl border border-slate-700/80 bg-slate-800/70 p-4">
                                        <p className="text-[11px] uppercase tracking-wider text-slate-400">Session Time</p>
                                        <p className="mt-1 text-sm font-semibold text-slate-100">{paymentSuccess.preferredTime}</p>
                                    </div>
                                </div>

                                <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-800/55 p-4 text-sm text-slate-300">
                                    <p><span className="text-slate-400">Order ID:</span> {paymentSuccess.orderId}</p>
                                    <p><span className="text-slate-400">Booking ID:</span> {paymentSuccess.bookingId}</p>
                                    <p><span className="text-slate-400">Payment ID:</span> {paymentSuccess.paymentId}</p>
                                </div>

                                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                                    <button
                                        type="button"
                                        disabled={isDownloadingReceipt}
                                        onClick={() => downloadServiceReceiptPdf(paymentSuccess)}
                                        className="rounded-xl px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 transition-all duration-300"
                                    >
                                        {isDownloadingReceipt ? 'Downloading PDF...' : 'Download Confirmation PDF'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => downloadInvitationCard(paymentSuccess)}
                                        className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-100 border border-slate-600 hover:border-cyan-500/40 hover:text-cyan-300 transition-colors"
                                    >
                                        Download Invitation Pass
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => downloadCalendarInvite(paymentSuccess)}
                                        className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-100 border border-slate-600 hover:border-cyan-500/40 hover:text-cyan-300 transition-colors"
                                    >
                                        Download Calendar File
                                    </button>
                                </div>

                                <div className="mt-3">
                                    <button
                                        type="button"
                                        disabled={isDownloadingReceipt}
                                        onClick={() => downloadServiceReceiptImage(paymentSuccess)}
                                        className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-100 border border-slate-600 hover:border-slate-500 transition-colors"
                                    >
                                        {isDownloadingReceipt ? 'Downloading Image Receipt...' : 'Download Image Backup Receipt'}
                                    </button>
                                </div>

                                {receiptDownloadError ? (
                                    <div className="mt-3 rounded-xl border border-amber-500/35 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                                        {receiptDownloadError}
                                    </div>
                                ) : null}

                                <div className="mt-3">
                                    <button
                                        type="button"
                                        onClick={() => copyConfirmationSummary(paymentSuccess)}
                                        className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-cyan-200 border border-cyan-500/35 bg-cyan-500/5 hover:bg-cyan-500/10 transition-colors"
                                    >
                                        Copy Booking Details
                                    </button>
                                </div>

                                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPaymentSuccess(null)
                                            setReceiptDownloadError('')
                                            setForm((prev) => ({ ...prev, projectBrief: '' }))
                                        }}
                                        className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-100 border border-slate-600 hover:border-slate-500 transition-colors"
                                    >
                                        Close
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => navigate('/services')}
                                        className="rounded-xl px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all duration-300"
                                    >
                                        Explore More Services
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>

            <GoogleSignInModal
                isOpen={showSignInModal}
                onClose={() => setShowSignInModal(false)}
                onAuthenticated={async () => {
                    await refreshSession()
                    setShowSignInModal(false)
                }}
            />
        </div>
    )
}

export default BookNow

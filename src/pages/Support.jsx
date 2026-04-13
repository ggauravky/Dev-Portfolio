// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import useSEO from '../hooks/useSEO'
import useAuth from '../hooks/useAuth'
import {
    createSupportOrder,
    fetchPaymentStatus,
    fetchSupportReceiptImage,
    fetchSupportReceiptPdf,
    openCashfreeCheckout,
    verifySupportPayment,
} from '../services/payment'
import TrustStrip from '../components/TrustStrip'
import GoogleSignInModal from '../components/support/GoogleSignInModal'

const quickAmounts = [49, 99, 199, 499, 999, 1999]

function Support() {
    const { user, isAuthenticated, isLoading, refreshSession, updateProfile } = useAuth()

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
    const [showSignInModal, setShowSignInModal] = useState(false)

    const pendingSupportKey = 'pendingSupportOrder'
    const requiresSignIn = isAuthenticated !== true
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

        return 'Support with Cashfree'
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
    const isPendingVerificationPayload = (verification) => {
        const verificationState = String(verification?.verificationStatus || '').toLowerCase()
        const paymentState = String(verification?.paymentStatus || '').toLowerCase()

        if (verificationState === 'complete' || paymentState === 'paid') {
            return false
        }

        return ['pending_gateway', 'pending_local', 'queued', 'processing', 'pending', 'created'].includes(verificationState || paymentState)
    }

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

    const downloadSupportReceipt = async (details, options = {}) => {
        const { silent = false, auto = false } = options

        if (!details?.orderId || !details?.email) {
            if (!silent) {
                toast.error('Receipt details are incomplete for image download')
            }
            return false
        }

        setIsDownloadingReceipt(true)

        try {
            const blob = await fetchSupportReceiptImage(details.orderId, details.email)
            saveBlobAsFile(blob, `support-receipt-${details.orderId}.svg`)
            setReceiptDownloadError(
                auto
                    ? 'PDF download was unavailable, so an image backup receipt was downloaded instead.'
                    : ''
            )

            if (!silent) {
                toast.success('Support receipt image downloaded')
            }

            return true
        } catch (error) {
            const message = String(error?.message || 'Unable to download support receipt image')
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
            if (auto) {
                const imageFallbackDownloaded = await downloadSupportReceipt(details, {
                    silent: true,
                    auto: true,
                })

                if (imageFallbackDownloaded) {
                    return true
                }
            }

            const message = String(error?.message || 'Unable to download support receipt PDF')
            setReceiptDownloadError(
                auto
                    ? 'Automatic PDF download was blocked. Use the image backup receipt button below.'
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
            amount: Number(verification.amount || pendingDetails.amount || 0),
            contributorName: verification.contributorName || pendingDetails.contributorName || 'Supporter',
            paymentId: verification.paymentId || pendingDetails.paymentId || `cf_${pendingDetails.orderId}`,
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

    const pollSupportStatusUntilResolved = async (orderId, pendingDetails, options = {}) => {
        const { silent = false } = options
        const activeEmail = String(user?.email || pendingDetails?.email || '').trim()

        for (let attempt = 0; attempt < 10; attempt += 1) {
            try {
                const status = await fetchPaymentStatus(orderId, activeEmail)
                const verificationState = String(status?.verificationStatus || '').toLowerCase()
                const paymentState = String(status?.paymentStatus || '').toLowerCase()

                if (verificationState === 'complete' || paymentState === 'paid') {
                    return applyVerifiedSupport(pendingDetails, status, silent)
                }

                if (verificationState === 'failed' || paymentState === 'failed') {
                    const failedMessage =
                        'Payment could not be confirmed. If amount was deducted, gateway will auto-reconcile it.'
                    setPaymentFailure(failedMessage)
                    sessionStorage.removeItem(pendingSupportKey)
                    if (!silent) {
                        toast.error(failedMessage)
                    }
                    return false
                }

                const nextDelay = Number(status?.nextPollMs || getRetryDelay(Math.min(attempt, 4)))
                await pause(Math.max(1200, Math.min(nextDelay, 9000)))
            } catch (statusError) {
                const message = String(statusError?.message || '')
                const statusCode = Number(statusError?.status)
                const failure = classifyVerificationFailure(message, statusCode)

                if (!failure.isRetryable) {
                    break
                }

                await pause(getRetryDelay(Math.min(attempt, 4)))
            }
        }

        const pendingMessage =
            'Payment is still being finalized. Keep this page open, or check My Activity in a minute with the same email.'
        setPaymentFailure(pendingMessage)
        if (!silent) {
            toast.error(pendingMessage)
        }

        return false
    }

    const handleSupportVerificationError = async (error, attempt, silent) => {
        const message = String(error?.message || '')
        const statusCode = Number(error?.status)
        const failure = classifyVerificationFailure(message, statusCode)
        const shouldRetry = failure.isRetryable && attempt < 4

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

        if (failure.isPendingGatewayState) {
            return { shouldRetry: false, shouldPollStatus: true, result: false }
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

        setPaymentFailure(message || 'Unable to verify support payment')
        if (!silent) {
            toast.error(message || 'Unable to verify support payment')
        }

        return { shouldRetry: false, result: false }
    }

    const finalizeSupportVerification = async (orderId, pendingDetails, options = {}) => {
        const { silent = false } = options
        const activeEmail = String(user?.email || pendingDetails?.email || '').trim()

        for (let attempt = 0; attempt < 5; attempt += 1) {
            try {
                const verification = await verifySupportPayment(orderId, activeEmail)

                if (isPendingVerificationPayload(verification)) {
                    return pollSupportStatusUntilResolved(orderId, pendingDetails, { silent })
                }

                return applyVerifiedSupport(pendingDetails, verification, silent)
            } catch (error) {
                const outcome = await handleSupportVerificationError(error, attempt, silent)
                if (outcome.shouldRetry) {
                    continue
                }

                if (outcome.shouldPollStatus) {
                    return pollSupportStatusUntilResolved(orderId, pendingDetails, { silent })
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
        if (isLoading || !isAuthenticated) {
            return
        }

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

        const activeEmail = String(user?.email || '').trim().toLowerCase()
        if (activeEmail && activeEmail !== String(pending.email || '').trim().toLowerCase()) {
            pending.email = activeEmail
            sessionStorage.setItem(pendingSupportKey, JSON.stringify(pending))
        }

        finalizeSupportVerification(pending.orderId, pending, { silent: true })
    }, [isAuthenticated, isLoading, user?.email])

    const handleSubmit = (event) => {
        event.preventDefault()

        if (isLoading) {
            toast.error('Checking your sign-in session. Please wait a second.')
            return
        }

        if (!isAuthenticated || !user?.email) {
            setShowSignInModal(true)
            toast.error('Please sign in with Google before starting support payment.')
            return
        }

        const runCheckout = async () => {
            setIsSubmitting(true)
            setPaymentFailure('')
            try {
                const refreshedUser = await refreshSession()
                const activeEmail = String(refreshedUser?.email || user?.email || '').trim()

                if (!activeEmail) {
                    throw new Error('Your sign-in session is not ready. Please sign in again.')
                }

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

                const numericAmount = Number.parseInt(form.amount, 10)
                if (!Number.isFinite(numericAmount) || numericAmount < 1 || numericAmount > 100000) {
                    throw new Error('Amount must be between INR 1 and INR 100000')
                }

                const order = await createSupportOrder({
                    ...form,
                    name: resolvedName,
                    email: activeEmail,
                    amount: numericAmount,
                })

                const pending = {
                    orderId: order.orderId,
                    email: activeEmail,
                    contributorName: resolvedName,
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

                        {requiresSignIn ? (
                            <div className="mt-4 rounded-xl border border-cyan-500/35 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">
                                <p>Sign in with Google to continue. Your email is auto-filled and locked for secure support receipts.</p>
                                <button
                                    type="button"
                                    onClick={() => setShowSignInModal(true)}
                                    className="mt-2 inline-flex items-center rounded-lg border border-cyan-400/35 bg-cyan-500/15 px-2.5 py-1 text-xs font-semibold text-cyan-100 hover:bg-cyan-500/25 transition-colors"
                                >
                                    Sign In with Google
                                </button>
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
                                        disabled={requiresSignIn || isLoading}
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
                                    <label htmlFor="amount" className="block text-xs font-semibold tracking-wider uppercase text-slate-400 mb-1.5">Amount (INR)</label>
                                    <input
                                        id="amount"
                                        name="amount"
                                        type="number"
                                        min="1"
                                        max="100000"
                                        value={form.amount}
                                        onChange={handleChange}
                                        disabled={requiresSignIn || isLoading}
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
                                            disabled={requiresSignIn || isLoading}
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
                                    disabled={requiresSignIn || isLoading}
                                    maxLength={300}
                                    placeholder="Write a short note"
                                    className="w-full rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting || requiresSignIn || isLoading}
                                className="w-full rounded-xl px-5 py-3.5 font-semibold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 transition-all duration-300"
                            >
                                {checkoutButtonLabel}
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
                                    {supportSuccess.emailDispatchQueued
                                        ? 'Your PDF receipt download starts automatically. A copy is also sent to your email.'
                                        : 'Your PDF receipt download starts automatically. Email delivery is temporarily unavailable, so please keep the downloaded receipt.'}
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
                                        disabled={isDownloadingReceipt}
                                        onClick={() => downloadSupportReceipt(supportSuccess)}
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

export default Support

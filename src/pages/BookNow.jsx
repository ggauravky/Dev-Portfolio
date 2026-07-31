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
    fetchPaymentStatus,
    fetchServiceReceiptImage,
    fetchServiceReceiptPdf,
    openCashfreeCheckout,
    verifyCashfreePayment,
} from '../services/payment'
import TrustStrip from '../components/TrustStrip'
import StickyMobileCTA from '../components/StickyMobileCTA'
import GoogleSignInModal from '../components/support/GoogleSignInModal'
import { trackEvent } from '../utils/analytics'

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
        title: `Book ${selectedService.title} | Gaurav Kumar Yadav | Secure Service Booking`,
        description: `Book a ${selectedService.title} session with Gaurav Kumar Yadav — AI/ML developer and web developer from BBDU Lucknow. ${selectedService.outcomePromise || ''} Secure checkout via Cashfree: UPI, cards, netbanking, and wallets accepted.`,
        keywords: `book ${selectedService.title} Gaurav Kumar Yadav, developer service booking India, Gaurav Kumar Yadav services, AI ML developer booking Lucknow, web developer session booking, Cashfree payment UPI`,
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
    const paymentSuccessStorageKey = 'paymentSuccess:service'
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
    const maxStatusPollingAttempts = 20
    const maxBackgroundVerificationRetries = 6
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
            bookingId: verification.bookingId || pendingDetails.bookingId,
            amount: Number(verification.amount || pendingDetails.amount || 0),
            service: verification.service || pendingDetails.service,
            paymentId: verification.paymentId || pendingDetails.paymentId || `cf_${orderId}`,
        }
        const successDetails = {
            ...mergedDetails,
            orderId: String(orderId || mergedDetails.orderId || '').trim(),
        }

        setPaymentSuccess(null)
        setPaymentFailure('')
        setReceiptDownloadError('')
        sessionStorage.removeItem(pendingOrderKey)
        sessionStorage.setItem(paymentSuccessStorageKey, JSON.stringify(successDetails))

        if (!silent) {
            toast.success('Payment verified and booking confirmed. Thanks for booking. Check your mail.')
        }

        const successOrderId = encodeURIComponent(successDetails.orderId)
        const transactionId = encodeURIComponent(String(successDetails.paymentId || successDetails.orderId || '').trim())

        navigate(`/payment-success/${transactionId}?flow=service&orderId=${successOrderId}`, {
            state: {
                flow: 'service',
                checkoutOrigin: 'callback-success',
                details: successDetails,
            },
        })

        return true
    }

    const scheduleOrderBackgroundVerification = (orderId, pendingDetails, attempt = 1) => {
        if (attempt > maxBackgroundVerificationRetries) {
            return
        }

        const retryDelay = Math.max(6000, getRetryDelay(Math.min(attempt + 1, 4)))

        setTimeout(async () => {
            const pendingRaw = sessionStorage.getItem(pendingOrderKey)
            if (!pendingRaw) {
                return
            }

            let nextPending = pendingDetails
            try {
                const parsed = JSON.parse(pendingRaw)
                if (parsed?.orderId === orderId) {
                    nextPending = parsed
                }
            } catch {
                nextPending = pendingDetails
            }

            const activeEmail = String(user?.email || nextPending?.email || '').trim()
            if (!activeEmail || !nextPending?.orderId) {
                return
            }

            if (activeEmail.toLowerCase() !== String(nextPending.email || '').trim().toLowerCase()) {
                sessionStorage.removeItem(pendingOrderKey)
                setPaymentFailure('Your signed-in account changed. Please start checkout again with this account.')
                return
            }

            const resolved = await finalizeOrderVerification(orderId, nextPending, {
                silent: true,
            })

            if (!resolved) {
                scheduleOrderBackgroundVerification(orderId, nextPending, attempt + 1)
            }
        }, retryDelay)
    }

    const pollOrderStatusUntilResolved = async (orderId, pendingDetails, options = {}) => {
        const { silent = false, scheduleBackgroundRetry = true } = options
        const activeEmail = String(user?.email || pendingDetails?.email || '').trim()
        setPaymentFailure('')

        for (let attempt = 0; attempt < maxStatusPollingAttempts; attempt += 1) {
            try {
                const status = await fetchPaymentStatus(orderId, activeEmail)
                const verificationState = String(status?.verificationStatus || '').toLowerCase()
                const paymentState = String(status?.paymentStatus || '').toLowerCase()

                if (verificationState === 'complete' || paymentState === 'paid') {
                    return applyVerifiedOrder(orderId, pendingDetails, status, silent)
                }

                if (verificationState === 'failed' || paymentState === 'failed') {
                    const failedMessage =
                        'Payment could not be confirmed. If amount was deducted, gateway will auto-reconcile it.'
                    setPaymentFailure(failedMessage)
                    sessionStorage.removeItem(pendingOrderKey)
                    if (!silent) {
                        toast.error(failedMessage)
                    }
                    return false
                }

                const nextDelay = Number(status?.nextPollMs || getRetryDelay(Math.min(attempt, 4)))
                await pause(Math.max(1200, Math.min(nextDelay, 12000)))
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

        if (scheduleBackgroundRetry) {
            scheduleOrderBackgroundVerification(orderId, pendingDetails)
        }

        return false
    }

    const handleOrderVerificationError = async (error, attempt, silent, options = {}) => {
        const { skipStatusPollingOnPending = false } = options
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
            if (skipStatusPollingOnPending) {
                if (attempt < 4) {
                    await pause(getRetryDelay(attempt))
                    return { shouldRetry: true, result: false }
                }

                return { shouldRetry: false, result: false }
            }

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

        setPaymentFailure(message || 'Payment verification failed')

        if (!silent) {
            toast.error(message || 'Payment verification failed')
        }

        return { shouldRetry: false, result: false }
    }

    const handlePendingOrderVerification = async ({
        verification,
        attempt,
        orderId,
        pendingDetails,
        silent,
        skipStatusPollingOnPending,
    }) => {
        if (!isPendingVerificationPayload(verification)) {
            return { shouldContinue: false, shouldReturn: false, result: false }
        }

        if (skipStatusPollingOnPending) {
            if (attempt < 4) {
                await pause(getRetryDelay(attempt))
                return { shouldContinue: true, shouldReturn: false, result: false }
            }

            return { shouldContinue: false, shouldReturn: true, result: false }
        }

        const pollResult = await pollOrderStatusUntilResolved(orderId, pendingDetails, { silent })
        return { shouldContinue: false, shouldReturn: true, result: pollResult }
    }

    const resolveOrderVerificationError = async ({
        error,
        attempt,
        silent,
        skipStatusPollingOnPending,
        orderId,
        pendingDetails,
    }) => {
        const outcome = await handleOrderVerificationError(error, attempt, silent, {
            skipStatusPollingOnPending,
        })

        if (outcome.shouldRetry) {
            return { shouldContinue: true, result: false }
        }

        if (outcome.shouldPollStatus && !skipStatusPollingOnPending) {
            const pollResult = await pollOrderStatusUntilResolved(orderId, pendingDetails, { silent })
            return { shouldContinue: false, result: pollResult }
        }

        return { shouldContinue: false, result: outcome.result }
    }

    const finalizeOrderVerification = async (orderId, pendingDetails, options = {}) => {
        const { silent = false, skipStatusPollingOnPending = false } = options
        const activeEmail = String(user?.email || pendingDetails?.email || '').trim()

        for (let attempt = 0; attempt < 5; attempt += 1) {
            try {
                const verification = await verifyCashfreePayment(orderId, activeEmail)

                const pendingOutcome = await handlePendingOrderVerification({
                    verification,
                    attempt,
                    orderId,
                    pendingDetails,
                    silent,
                    skipStatusPollingOnPending,
                })

                if (pendingOutcome.shouldContinue) {
                    continue
                }

                if (pendingOutcome.shouldReturn) {
                    return pendingOutcome.result
                }

                return applyVerifiedOrder(orderId, pendingDetails, verification, silent)
            } catch (error) {
                const errorOutcome = await resolveOrderVerificationError({
                    error,
                    attempt,
                    silent,
                    skipStatusPollingOnPending,
                    orderId,
                    pendingDetails,
                })

                if (errorOutcome.shouldContinue) {
                    continue
                }

                return errorOutcome.result
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

        const activeEmail = String(user?.email || '').trim().toLowerCase()
        if (activeEmail && activeEmail !== String(pending.email || '').trim().toLowerCase()) {
            sessionStorage.removeItem(pendingOrderKey)
            setPaymentFailure('Your signed-in account changed. Please start checkout again with this account.')
            return
        }

        setPaymentFailure('')
        void finalizeOrderVerification(pending.orderId, pending, { silent: true })
    }, [isAuthenticated, isLoading, user?.email])

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

                const order = await createCashfreeOrder({
                    ...form,
                    email: activeEmail,
                    service: currentService.slug,
                })

                const pending = {
                    orderId: order.orderId,
                    paymentId: '',
                    name: resolvedName,
                    email: activeEmail,
                    service: order.serviceTitle,
                    preferredDate: form.preferredDate,
                    preferredTime: form.preferredTime,
                    projectBrief: form.projectBrief,
                    amount: currentService.amount,
                }
                sessionStorage.setItem(pendingOrderKey, JSON.stringify(pending))

                void trackEvent('service_payment_started', {
                    flow: 'service',
                    order_id: String(order.orderId || '').trim(),
                    service_slug: String(currentService.slug || '').trim(),
                    amount: Number(currentService.amount || 0),
                })

                const checkoutResult = await openCashfreeCheckout({
                    paymentSessionId: order.paymentSessionId,
                    environment: order.environment,
                })

                if (checkoutResult?.paymentDetails?.cf_payment_id) {
                    pending.paymentId = String(checkoutResult.paymentDetails.cf_payment_id)
                    sessionStorage.setItem(pendingOrderKey, JSON.stringify(pending))
                }

                if (checkoutResult?.error) {
                    const recovered = await finalizeOrderVerification(order.orderId, pending, {
                        silent: true,
                    })

                    if (recovered) {
                        return
                    }

                    const checkoutMessage = String(checkoutResult.error.message || '').trim()
                    throw new Error(
                        checkoutMessage
                            ? `Payment window closed: ${checkoutMessage}. We are still verifying your payment in background. Keep this page open, or check My Activity.`
                            : 'Payment window closed before confirmation. We are still verifying your payment in background. Keep this page open, or check My Activity.'
                    )
                }

                await finalizeOrderVerification(order.orderId, pending)
            } catch (error) {
                const message = error?.message || 'Unable to start secure checkout'
                setPaymentFailure(message)
                toast.error(message)
            } finally {
                setIsSubmitting(false)
            }
        }

        runCheckout()
    }

    return (
        <div className="min-h-screen bg-obsidian relative overflow-hidden">
            {/* Ambient gradients */}
            <div className="absolute -top-24 right-0 w-[420px] h-[420px] rounded-full bg-toxic/5 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 left-0 w-[420px] h-[420px] rounded-full bg-cyber/5 blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-18">
                <div className="mb-8">
                    <Link to="/services" className="inline-flex items-center gap-2 text-xs font-mono tracking-wider text-slate-400 hover:text-toxic transition-colors">
                        <span>←</span>
                        <span>Back to Services</span>
                    </Link>
                </div>

                <div className="mb-6 flex flex-wrap items-center gap-2.5">
                    <span className="inline-flex items-center rounded-md border border-toxic/30 bg-toxic/5 px-3 py-1 text-[10px] font-mono tracking-wider uppercase text-toxic">
                        Secure Checkout
                    </span>
                    <span className="inline-flex items-center rounded-md border border-obsidian-border bg-obsidian-card/85 px-3 py-1 text-[10px] font-mono tracking-wider uppercase text-slate-400">
                        Instant Booking Confirmation
                    </span>
                    <span className="inline-flex items-center rounded-md border border-obsidian-border bg-obsidian-card/85 px-3 py-1 text-[10px] font-mono tracking-wider uppercase text-slate-400">
                        Invitation + Calendar Download
                    </span>
                </div>

                <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">
                    <section className="lg:col-span-3 rounded-lg border border-obsidian-border bg-obsidian-card p-6 sm:p-8">
                        <h1 className="text-3xl sm:text-4xl font-display font-bold text-slate-100 tracking-tight">Book a Service</h1>
                        <p className="text-slate-400 mt-2 text-sm">Fill details and continue with secure Cashfree checkout. Supports UPI, cards, netbanking, wallets, and pay later.</p>

                        {/* 4-Step Progressive Journey Header */}
                        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                            <div className={`rounded-lg border p-3 transition-all ${requiresSignIn ? 'border-toxic bg-toxic/10 ring-1 ring-toxic/40' : 'border-emerald-500/30 bg-emerald-500/5'}`}>
                                <p className="text-[10px] font-mono uppercase tracking-wider text-toxic">Step 1</p>
                                <p className="text-xs font-semibold text-white mt-1 flex items-center justify-between">
                                    <span>Google Auth</span>
                                    {!requiresSignIn && <span className="text-emerald-400">✓</span>}
                                </p>
                            </div>
                            <div className={`rounded-lg border p-3 transition-all ${!requiresSignIn ? 'border-toxic/40 bg-toxic/5' : 'border-obsidian-border bg-obsidian/60 opacity-60'}`}>
                                <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Step 2</p>
                                <p className="text-xs font-semibold text-white mt-1">Booking Brief</p>
                            </div>
                            <div className="rounded-lg border border-obsidian-border bg-obsidian/60 p-3 opacity-60">
                                <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Step 3</p>
                                <p className="text-xs font-semibold text-white mt-1">Cashfree Checkout</p>
                            </div>
                            <div className="rounded-lg border border-obsidian-border bg-obsidian/60 p-3 opacity-60">
                                <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Step 4</p>
                                <p className="text-xs font-semibold text-white mt-1">Confirmation</p>
                            </div>
                        </div>

                        {paymentFailure ? (
                            <div className="mt-4 rounded-md border border-cyber/35 bg-cyber/10 px-4 py-3 text-sm font-mono text-cyber">
                                {paymentFailure}
                            </div>
                        ) : null}

                        {/* Step 1 Prominent Identity Callout Card */}
                        {requiresSignIn ? (
                            <div className="mt-5 rounded-xl border border-toxic/40 bg-toxic/5 p-5 shadow-lg shadow-toxic/5">
                                <div className="flex items-center gap-2">
                                    <span className="flex h-2 w-2 rounded-full bg-toxic animate-pulse" />
                                    <span className="text-xs font-mono uppercase tracking-wider text-toxic font-bold">Step 1 Required — Google Authentication</span>
                                </div>
                                <h3 className="text-lg font-bold text-white mt-2">Sign In with Google to Book Service</h3>
                                <p className="text-xs text-zinc-300 mt-1.5 leading-relaxed">
                                    Google authentication is required before booking. Your email is auto-filled and locked to generate verified service receipts, schedule invites, and order tracking in <span className="font-mono text-toxic">My Activity</span>.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setShowSignInModal(true)}
                                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-toxic text-obsidian px-5 py-3 text-xs font-mono uppercase font-bold shadow-[0_0_20px_rgba(197,248,42,0.25)] hover:shadow-[0_0_30px_rgba(197,248,42,0.4)] hover:bg-[#b0e620] transition-all duration-200"
                                >
                                    <span>Continue with Google</span>
                                    <span>↗</span>
                                </button>
                            </div>
                        ) : (
                            <div className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold">✓</span>
                                    <div>
                                        <p className="text-xs font-semibold text-white">Signed in as {user?.email}</p>
                                        <p className="text-[10px] font-mono text-zinc-400">Email is locked for booking confirmation & calendar updates.</p>
                                    </div>
                                </div>
                                <span className="text-[10px] font-mono uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded">Verified</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="mt-6 space-y-4 sm:space-y-5">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="name" className="block text-[10px] font-mono tracking-wider uppercase text-slate-400 mb-1.5">Full Name</label>
                                    <input
                                        id="name"
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        maxLength={80}
                                        disabled={requiresSignIn || isLoading}
                                        required
                                        placeholder="Your full name"
                                        className="w-full rounded-md border border-obsidian-border bg-obsidian-light/50 px-4 py-3 text-slate-100 placeholder:text-zinc-750 focus:outline-none focus:border-toxic focus:ring-1 focus:ring-toxic/30 transition-all font-sans text-sm"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-[10px] font-mono tracking-wider uppercase text-slate-400 mb-1.5">Email</label>
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
                                        className="w-full rounded-md border border-obsidian-border bg-obsidian-light/50 px-4 py-3 text-slate-400 placeholder:text-zinc-750 focus:outline-none font-sans text-sm cursor-not-allowed opacity-75"
                                    />
                                    <p className="mt-1 text-[10px] font-mono text-slate-500">Email is locked to your signed-in Google account.</p>
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="phone" className="block text-[10px] font-mono tracking-wider uppercase text-slate-400 mb-1.5">Phone</label>
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
                                        className="w-full rounded-md border border-obsidian-border bg-obsidian-light/50 px-4 py-3 text-slate-100 placeholder:text-zinc-750 focus:outline-none focus:border-toxic focus:ring-1 focus:ring-toxic/30 transition-all font-mono text-sm"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="service" className="block text-[10px] font-mono tracking-wider uppercase text-slate-400 mb-1.5">Service</label>
                                    <select
                                        id="service"
                                        name="service"
                                        value={form.service}
                                        onChange={handleChange}
                                        disabled={requiresSignIn || isLoading}
                                        required
                                        className="w-full rounded-md border border-obsidian-border bg-obsidian-light/50 px-4 py-3 text-slate-100 focus:outline-none focus:border-toxic focus:ring-1 focus:ring-toxic/30 transition-all font-sans text-sm"
                                    >
                                        {servicesData.map((service) => (
                                            <option key={service.slug} value={service.slug} className="bg-obsidian text-slate-100">
                                                {service.title} ({service.priceLabel})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="preferredDate" className="block text-[10px] font-mono tracking-wider uppercase text-slate-400 mb-1.5">Preferred Date</label>
                                    <input
                                        id="preferredDate"
                                        name="preferredDate"
                                        type="date"
                                        min={minDate}
                                        value={form.preferredDate}
                                        onChange={handleChange}
                                        disabled={requiresSignIn || isLoading}
                                        required
                                        className="w-full rounded-md border border-obsidian-border bg-obsidian-light/50 px-4 py-3 text-slate-100 focus:outline-none focus:border-toxic focus:ring-1 focus:ring-toxic/30 transition-all font-mono text-sm"
                                    />
                                    <p className="text-[10px] font-mono text-slate-500 mt-1">Earliest booking is after 2 days from today.</p>
                                </div>
                                <div>
                                    <label htmlFor="preferredTime" className="block text-[10px] font-mono tracking-wider uppercase text-slate-400 mb-1.5">Preferred Time</label>
                                    <input
                                        id="preferredTime"
                                        name="preferredTime"
                                        type="time"
                                        value={form.preferredTime}
                                        onChange={handleChange}
                                        disabled={requiresSignIn || isLoading}
                                        required
                                        className="w-full rounded-md border border-obsidian-border bg-obsidian-light/50 px-4 py-3 text-slate-100 focus:outline-none focus:border-toxic focus:ring-1 focus:ring-toxic/30 transition-all font-mono text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="projectBrief" className="block text-[10px] font-mono tracking-wider uppercase text-slate-400 mb-1.5">Project Brief</label>
                                <textarea
                                    id="projectBrief"
                                    name="projectBrief"
                                    rows="5"
                                    value={form.projectBrief}
                                    onChange={handleChange}
                                    disabled={requiresSignIn || isLoading}
                                    maxLength={1200}
                                    placeholder="Share your requirement, deadline, goals, and any important context."
                                    className="w-full rounded-md border border-obsidian-border bg-obsidian-light/50 px-4 py-3 text-slate-100 placeholder:text-zinc-750 focus:outline-none focus:border-toxic focus:ring-1 focus:ring-toxic/30 transition-all font-sans text-sm resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting || requiresSignIn || isLoading}
                                className="w-full rounded-md border border-toxic/40 bg-toxic/10 hover:bg-toxic hover:text-black font-semibold text-toxic px-5 py-3.5 hover:shadow-[0_0_20px_rgba(197,248,42,0.25)] transition-all duration-300 uppercase tracking-wider font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-toxic/10 disabled:hover:text-toxic disabled:hover:shadow-none"
                            >
                                {checkoutButtonLabel}
                            </button>
                        </form>
                    </section>

                    <aside className="lg:col-span-2 rounded-lg border border-obsidian-border bg-obsidian-card p-6 sm:p-7 h-fit sticky top-28">
                        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-toxic">Booking Summary</p>
                        <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-100 mt-2">{currentService.title}</h2>
                        <p className="text-cyber text-2xl font-display font-extrabold mt-3">{currentService.priceLabel}</p>
                        <p className="text-[10px] font-mono text-slate-500 mt-2">Gateway status: live via Cashfree</p>

                        <ul className="mt-5 space-y-3">
                            {currentService.features.slice(0, 3).map((item) => (
                                <li key={item} className="text-slate-350 text-sm flex gap-2">
                                    <span className="text-toxic font-mono text-xs select-none">→</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-6 rounded-md border border-obsidian-border bg-obsidian/45 p-4">
                            <p className="text-xs font-mono uppercase text-slate-300">Trust & Security</p>
                            <ul className="mt-2 space-y-2 text-[11px] font-sans text-slate-450">
                                <li>• Server-side order creation and verification enabled</li>
                                <li>• Supports UPI, cards, netbanking, wallets, and pay later</li>
                                <li>• No card or UPI PIN data is stored on this website</li>
                            </ul>
                        </div>

                        <div className="mt-5 grid grid-cols-1 gap-2.5">
                            <Link to="/support" className="rounded-md border border-toxic/30 bg-toxic/5 px-4 py-2.5 text-xs font-mono uppercase tracking-wider text-toxic hover:bg-toxic hover:text-black transition-all text-center">
                                Support Jar (Any Amount)
                            </Link>
                            <Link to="/projects" className="rounded-md border border-obsidian-border px-4 py-2.5 text-xs font-mono uppercase tracking-wider text-slate-300 hover:border-toxic/30 hover:text-toxic transition-all text-center">
                                See Projects
                            </Link>
                            <Link to="/contact" className="rounded-md border border-obsidian-border px-4 py-2.5 text-xs font-mono uppercase tracking-wider text-slate-300 hover:border-toxic/30 hover:text-toxic transition-all text-center">
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
                    <div className="fixed inset-0 z-50 bg-obsidian/85 backdrop-blur-md px-4 py-8 overflow-y-auto">
                        <div className="relative max-w-2xl mx-auto overflow-hidden rounded-lg border border-obsidian-border bg-obsidian-card p-6 sm:p-8">
                            <div className="pointer-events-none absolute -top-20 -right-16 h-52 w-52 rounded-full bg-toxic/10 blur-3xl" />
                            <div className="pointer-events-none absolute -bottom-20 -left-16 h-52 w-52 rounded-full bg-cyber/10 blur-3xl" />

                            <div className="relative">
                                <div className="inline-flex items-center gap-2 rounded-md border border-toxic/30 bg-toxic/5 px-3.5 py-1.5 text-[10px] font-mono tracking-widest uppercase text-toxic">
                                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-toxic/20 text-toxic text-[9px] font-bold">✓</span>
                                    <span>Payment Confirmed</span>
                                </div>

                                <h2 className="mt-4 text-2xl sm:text-3xl font-display font-bold text-slate-100 tracking-tight">Your Booking Is Confirmed</h2>
                                <p className="mt-2 text-slate-300 text-sm">
                                    Payment verification is complete. Save your invitation and calendar file to keep session details handy.
                                </p>
                                <p className="mt-2 text-[11px] font-sans text-slate-450">
                                    Your confirmation PDF starts downloading automatically. Thank you for booking, and check your mail for updates.
                                </p>

                                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                                    <div className="rounded-md border border-obsidian-border bg-obsidian/45 p-4">
                                        <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Service</p>
                                        <p className="mt-1 text-sm font-semibold text-slate-200">{paymentSuccess.service}</p>
                                    </div>
                                    <div className="rounded-md border border-obsidian-border bg-obsidian/45 p-4">
                                        <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Session Date</p>
                                        <p className="mt-1 text-sm font-semibold text-slate-200">{formatDateForDisplay(paymentSuccess.preferredDate)}</p>
                                    </div>
                                    <div className="rounded-md border border-obsidian-border bg-obsidian/45 p-4">
                                        <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Session Time</p>
                                        <p className="mt-1 text-sm font-semibold text-slate-200">{paymentSuccess.preferredTime}</p>
                                    </div>
                                </div>

                                <div className="mt-4 rounded-md border border-obsidian-border bg-obsidian/45 p-4 text-xs font-mono text-slate-300 space-y-1">
                                    <p><span className="text-slate-500">Order ID:</span> {paymentSuccess.orderId}</p>
                                    <p><span className="text-slate-500">Booking ID:</span> {paymentSuccess.bookingId}</p>
                                    <p><span className="text-slate-500">Payment ID:</span> {paymentSuccess.paymentId}</p>
                                </div>

                                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                                    <button
                                        type="button"
                                        disabled={isDownloadingReceipt}
                                        onClick={() => downloadServiceReceiptPdf(paymentSuccess)}
                                        className="rounded-md px-4 py-3 text-xs font-mono uppercase tracking-wider font-semibold text-black bg-toxic hover:bg-toxic/95 hover:shadow-[0_0_15px_rgba(197,248,42,0.25)] transition-all disabled:opacity-50"
                                    >
                                        {isDownloadingReceipt ? 'Downloading...' : 'Download PDF'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => downloadInvitationCard(paymentSuccess)}
                                        className="rounded-md px-4 py-3 text-xs font-mono uppercase tracking-wider font-semibold text-slate-200 border border-obsidian-border hover:border-toxic hover:text-toxic transition-all"
                                    >
                                        Download Pass
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => downloadCalendarInvite(paymentSuccess)}
                                        className="rounded-md px-4 py-3 text-xs font-mono uppercase tracking-wider font-semibold text-slate-200 border border-obsidian-border hover:border-toxic hover:text-toxic transition-all"
                                    >
                                        Download ICS
                                    </button>
                                </div>

                                <div className="mt-3">
                                    <button
                                        type="button"
                                        disabled={isDownloadingReceipt}
                                        onClick={() => downloadServiceReceiptImage(paymentSuccess)}
                                        className="w-full rounded-md px-4 py-2.5 text-xs font-mono uppercase tracking-wider text-slate-400 border border-obsidian-border hover:text-slate-200 transition-colors"
                                    >
                                        {isDownloadingReceipt ? 'Downloading Image...' : 'Download Image Backup Receipt'}
                                    </button>
                                </div>

                                {receiptDownloadError ? (
                                    <div className="mt-3 rounded-md border border-cyber/30 bg-cyber/5 px-3 py-2 text-xs font-mono text-cyber">
                                        {receiptDownloadError}
                                    </div>
                                ) : null}

                                <div className="mt-3">
                                    <button
                                        type="button"
                                        onClick={() => copyConfirmationSummary(paymentSuccess)}
                                        className="w-full rounded-md px-4 py-2.5 text-xs font-mono uppercase tracking-wider text-toxic border border-toxic/20 bg-toxic/5 hover:bg-toxic/10 transition-colors"
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
                                        className="rounded-md px-4 py-3 text-xs font-mono uppercase tracking-wider text-slate-300 border border-obsidian-border hover:text-white transition-colors"
                                    >
                                        Close
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => navigate('/services')}
                                        className="rounded-md px-4 py-3 text-xs font-mono uppercase tracking-wider text-black bg-cyber hover:bg-cyber/90 hover:shadow-[0_0_15px_rgba(255,93,0,0.25)] transition-all"
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
                title="Sign In to Book Service"
                description="Sign in with Google to enable secure service booking, verified receipts, and calendar schedule updates."
                badgeText="Step 1: Identity Verification"
                onAuthenticated={async () => {
                    await refreshSession()
                    setShowSignInModal(false)
                }}
            />
        </div>
    )
}

export default BookNow

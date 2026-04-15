import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import PropTypes from 'prop-types'
import toast from 'react-hot-toast'
import useAuth from '../hooks/useAuth'
import useSEO from '../hooks/useSEO'
import {
    fetchTransactionStatus,
    fetchServiceReceiptImage,
    fetchServiceReceiptPdf,
    fetchSupportReceiptImage,
    fetchSupportReceiptPdf,
} from '../services/payment'

const normalizeFlow = (value) => (String(value || '').trim().toLowerCase() === 'support' ? 'support' : 'service')

const getStorageKey = (flow) => `paymentSuccess:${flow}`
const CALLBACK_BOARD_MIN_DURATION_MS = 1600
const HYDRATION_BOARD_TIMEOUT_MS = 30000

const getProcessingSteps = (flow) =>
    flow === 'support'
        ? ['Creating secure session', 'Verifying support payment', 'Preparing receipt and activity links']
        : ['Creating secure session', 'Verifying booking payment', 'Preparing confirmation and receipt links']

const getProcessingStepClassName = ({ isActive, isCompleted }) => {
    if (isActive) {
        return 'border-cyan-500/35 bg-cyan-500/10 text-cyan-100'
    }

    if (isCompleted) {
        return 'border-emerald-500/35 bg-emerald-500/10 text-emerald-100'
    }

    return 'border-slate-700 bg-slate-800/60 text-slate-400'
}

const getProcessingStepBadge = ({ isActive, isCompleted, index }) => {
    if (isCompleted) {
        return 'OK'
    }

    if (isActive) {
        return '.'
    }

    return String(index + 1)
}

const buildActivityUrl = (details, effectiveFlow) => {
    if (!details?.orderId) {
        return '/my-activity'
    }

    const activityParams = new URLSearchParams({
        source: 'payment',
        status: 'success',
        flow: effectiveFlow,
        tab: 'payments',
        orderId: String(details.orderId || '').trim(),
    })

    const paymentId = String(details.paymentId || '').trim()
    if (paymentId) {
        activityParams.set('paymentId', paymentId)
    }

    return `/my-activity?${activityParams.toString()}`
}

function ProcessingBoard({
    effectiveFlow,
    isHydrationBoardVisible,
    processingStepIndex,
    processingSteps,
}) {
    const heading =
        effectiveFlow === 'support'
            ? 'Finalizing your support confirmation'
            : 'Finalizing your booking confirmation'

    const subtitle = isHydrationBoardVisible
        ? 'Fetching your latest verified transaction details from server.'
        : 'Preparing your confirmation screen with receipt actions.'

    const progressWidth = `${((processingStepIndex + 1) / processingSteps.length) * 100}%`

    return (
        <div className="fixed inset-0 z-40 bg-slate-950/75 backdrop-blur-sm px-4 py-6">
            <div className="mx-auto flex min-h-full max-w-xl items-center justify-center">
                <div className="w-full overflow-hidden rounded-3xl border border-cyan-400/25 bg-gradient-to-b from-slate-900 to-slate-950 p-6 sm:p-8 shadow-[0_30px_120px_rgba(2,132,199,0.2)]">
                    <div className="inline-flex items-center rounded-full border border-cyan-500/35 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-cyan-200">
                        Processing Payment
                    </div>
                    <h2 className="mt-4 text-2xl sm:text-3xl font-black text-slate-100">{heading}</h2>
                    <p className="mt-2 text-sm sm:text-base text-slate-300">{subtitle}</p>

                    <div className="mt-5 h-2 w-full rounded-full bg-slate-800/90">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-500 transition-all duration-700"
                            style={{ width: progressWidth }}
                        />
                    </div>

                    <ul className="mt-5 space-y-2.5">
                        {processingSteps.map((step, index) => {
                            const isActive = index === processingStepIndex
                            const isCompleted = index < processingStepIndex
                            const stepClassName = getProcessingStepClassName({
                                isActive,
                                isCompleted,
                            })
                            const stepBadge = getProcessingStepBadge({
                                isActive,
                                isCompleted,
                                index,
                            })

                            return (
                                <li
                                    key={step}
                                    className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors ${stepClassName}`}
                                >
                                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-current text-xs">
                                        {stepBadge}
                                    </span>
                                    <span>{step}</span>
                                </li>
                            )
                        })}
                    </ul>

                    <p className="mt-4 text-xs text-slate-500">
                        Please keep this page open while we finish the final confirmation checks.
                    </p>
                </div>
            </div>
        </div>
    )
}

ProcessingBoard.propTypes = {
    effectiveFlow: PropTypes.string.isRequired,
    isHydrationBoardVisible: PropTypes.bool.isRequired,
    processingStepIndex: PropTypes.number.isRequired,
    processingSteps: PropTypes.arrayOf(PropTypes.string).isRequired,
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
    saveBlobAsFile(blob, filename)
}

const formatDateForDisplay = (dateString) => {
    const value = new Date(dateString)
    if (Number.isNaN(value.getTime())) {
        return String(dateString || 'Not available')
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

// eslint-disable-next-line sonarjs/cognitive-complexity
function PaymentSuccess() {
    const navigate = useNavigate()
    const location = useLocation()
    const { transactionId: routeTransactionId } = useParams()
    const { isAuthenticated, isLoading, user } = useAuth()
    const [params] = useSearchParams()
    const flow = normalizeFlow(params.get('flow') || location.state?.flow)
    const checkoutOrigin = String(location.state?.checkoutOrigin || '').trim().toLowerCase()

    useSEO({
        title: flow === 'support' ? 'Support Payment Success | Gaurav Kumar Yadav' : 'Booking Payment Success | Gaurav Kumar Yadav',
        description: 'Payment verified successfully. Download your confirmation files and check your email for updates.',
        keywords: 'payment success, receipt download, confirmation',
        ogImage: 'https://ggauravky.vercel.app/images/profile.jpg',
    })

    const [details, setDetails] = useState(() => {
        const stateDetails = location.state?.details
        if (stateDetails && typeof stateDetails === 'object') {
            return stateDetails
        }

        try {
            const raw = sessionStorage.getItem(getStorageKey(flow))
            return raw ? JSON.parse(raw) : null
        } catch {
            return null
        }
    })

    const [isDownloadingReceipt, setIsDownloadingReceipt] = useState(false)
    const [isHydratingDetails, setIsHydratingDetails] = useState(false)
    const [detailsLoadError, setDetailsLoadError] = useState('')
    const [receiptDownloadError, setReceiptDownloadError] = useState('')
    const [isCallbackBoardVisible, setIsCallbackBoardVisible] = useState(false)
    const [isHydrationTimedOut, setIsHydrationTimedOut] = useState(false)
    const [processingStepIndex, setProcessingStepIndex] = useState(0)
    const autoDownloadKeyRef = useRef('')
    const callbackBoardTimerRef = useRef(null)
    const hydrationBoardTimerRef = useRef(null)
    const stepIntervalRef = useRef(null)
    const callbackBoardKeyRef = useRef('')
    const effectiveFlow = normalizeFlow(details?.type || flow)
    const processingSteps = useMemo(() => getProcessingSteps(effectiveFlow), [effectiveFlow])
    const isHydrationBoardVisible = isHydratingDetails && isAuthenticated && !detailsLoadError && !isHydrationTimedOut
    const isProcessingBoardVisible = isCallbackBoardVisible || isHydrationBoardVisible

    useEffect(
        () => () => {
            clearTimeout(callbackBoardTimerRef.current)
            callbackBoardTimerRef.current = null

            clearTimeout(hydrationBoardTimerRef.current)
            hydrationBoardTimerRef.current = null

            clearInterval(stepIntervalRef.current)
            stepIntervalRef.current = null
        },
        []
    )

    useEffect(() => {
        const callbackKey = `${flow}:${routeTransactionId || location.key || 'payment-success'}`
        if (checkoutOrigin !== 'callback-success' || callbackBoardKeyRef.current === callbackKey) {
            return
        }

        callbackBoardKeyRef.current = callbackKey
        setIsCallbackBoardVisible(true)
        clearTimeout(callbackBoardTimerRef.current)

        callbackBoardTimerRef.current = setTimeout(() => {
            setIsCallbackBoardVisible(false)
            callbackBoardTimerRef.current = null
        }, CALLBACK_BOARD_MIN_DURATION_MS)
    }, [checkoutOrigin, flow, location.key, routeTransactionId])

    useEffect(() => {
        if (!isHydrationBoardVisible) {
            clearTimeout(hydrationBoardTimerRef.current)
            hydrationBoardTimerRef.current = null
            setIsHydrationTimedOut(false)
            return
        }

        clearTimeout(hydrationBoardTimerRef.current)

        hydrationBoardTimerRef.current = setTimeout(() => {
            setIsHydrationTimedOut(true)
            setDetailsLoadError((previous) =>
                previous || 'Loading is taking longer than expected. Please refresh this page.'
            )
            setIsHydratingDetails(false)
        }, HYDRATION_BOARD_TIMEOUT_MS)

        return () => {
            clearTimeout(hydrationBoardTimerRef.current)
            hydrationBoardTimerRef.current = null
        }
    }, [isHydrationBoardVisible])

    useEffect(() => {
        if (!isProcessingBoardVisible) {
            setProcessingStepIndex(0)
            clearInterval(stepIntervalRef.current)
            stepIntervalRef.current = null
            return
        }

        clearInterval(stepIntervalRef.current)

        stepIntervalRef.current = setInterval(() => {
            setProcessingStepIndex((previous) => (previous + 1) % processingSteps.length)
        }, 1200)

        return () => {
            clearInterval(stepIntervalRef.current)
            stepIntervalRef.current = null
        }
    }, [isProcessingBoardVisible, processingSteps.length])

    useEffect(() => {
        const stateDetails = location.state?.details
        if (stateDetails && typeof stateDetails === 'object') {
            setDetails(stateDetails)
            sessionStorage.setItem(getStorageKey(flow), JSON.stringify(stateDetails))
            return
        }

        try {
            const raw = sessionStorage.getItem(getStorageKey(flow))
            setDetails(raw ? JSON.parse(raw) : null)
        } catch {
            setDetails(null)
        }
    }, [flow, location.state])

    useEffect(() => {
        if (!routeTransactionId || isLoading) {
            return
        }

        if (!isAuthenticated || !user?.email) {
            setDetailsLoadError('Please sign in with your payment account to view this transaction.')
            return
        }

        let isCancelled = false

        const hydrateDetails = async () => {
            setIsHydrationTimedOut(false)
            setIsHydratingDetails(true)
            setDetailsLoadError('')

            try {
                const transaction = await fetchTransactionStatus(routeTransactionId)
                if (isCancelled || !transaction) {
                    return
                }

                const transactionFlow = normalizeFlow(transaction.type || flow)

                setDetails((previous) => {
                    const mergedDetails = {
                        ...previous,
                        ...transaction,
                        type: transactionFlow,
                        flow: transactionFlow,
                        orderId: String(transaction.orderId || previous?.orderId || '').trim(),
                        paymentId: String(
                            transaction.paymentId ||
                            transaction.transactionId ||
                            previous?.paymentId ||
                            routeTransactionId
                        ).trim(),
                        email: String(transaction.email || previous?.email || user.email || '').trim(),
                    }

                    sessionStorage.setItem(getStorageKey(transactionFlow), JSON.stringify(mergedDetails))
                    return mergedDetails
                })
            } catch (error) {
                if (isCancelled) {
                    return
                }

                const message = String(error?.message || 'Unable to load payment details right now.')
                setDetailsLoadError(message)
            } finally {
                if (!isCancelled) {
                    setIsHydratingDetails(false)
                }
            }
        }

        void hydrateDetails()

        return () => {
            isCancelled = true
        }
    }, [flow, isAuthenticated, isLoading, routeTransactionId, user?.email])

    const activityUrl = useMemo(() => buildActivityUrl(details, effectiveFlow), [details, effectiveFlow])

    const downloadReceiptImage = async (options = {}) => {
        const { silent = false, auto = false } = options

        if (!details?.orderId || !details?.email) {
            if (!silent) {
                toast.error('Receipt details are incomplete for image download')
            }
            return false
        }

        setIsDownloadingReceipt(true)

        try {
            const blob = effectiveFlow === 'support'
                ? await fetchSupportReceiptImage(details.orderId, details.email)
                : await fetchServiceReceiptImage(details.orderId, details.email)

            const filenamePrefix = effectiveFlow === 'support' ? 'support-receipt' : 'service-confirmation'
            saveBlobAsFile(blob, `${filenamePrefix}-${details.orderId}.svg`)

            setReceiptDownloadError(
                auto
                    ? 'PDF was unavailable, so an image backup receipt was downloaded instead.'
                    : ''
            )

            if (!silent) {
                toast.success('Receipt image downloaded')
            }
            return true
        } catch (error) {
            const message = String(error?.message || 'Unable to download receipt image')
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

    const handlePdfDownloadFailure = async ({ error, auto, silent }) => {
        if (auto) {
            const downloadedFallback = await downloadReceiptImage({ silent: true, auto: true })
            if (downloadedFallback) {
                return true
            }
        }

        const message = String(error?.message || 'Unable to download receipt PDF')
        setReceiptDownloadError(
            auto
                ? 'Automatic PDF download was blocked. Use the image backup receipt button below.'
                : message
        )

        if (!silent) {
            toast.error(message)
        }

        return false
    }

    const downloadReceiptPdf = async (options = {}) => {
        const { silent = false, auto = false } = options

        if (!details?.orderId || !details?.email) {
            if (!silent) {
                toast.error('Receipt details are incomplete for PDF download')
            }
            return false
        }

        setIsDownloadingReceipt(true)

        try {
            const blob = effectiveFlow === 'support'
                ? await fetchSupportReceiptPdf(details.orderId, details.email)
                : await fetchServiceReceiptPdf(details.orderId, details.email)

            const filenamePrefix = effectiveFlow === 'support' ? 'support-receipt' : 'service-confirmation'
            saveBlobAsFile(blob, `${filenamePrefix}-${details.orderId}.pdf`)
            setReceiptDownloadError('')

            if (!silent) {
                toast.success('Receipt PDF downloaded')
            }
            return true
        } catch (error) {
            return handlePdfDownloadFailure({ error, auto, silent })
        } finally {
            setIsDownloadingReceipt(false)
        }
    }

    const downloadInvitationCard = () => {
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
        toast.success('Invitation pass downloaded')
    }

    const downloadCalendarInvite = () => {
        const preferredDate = String(details?.preferredDate || '').trim() || new Date().toISOString().slice(0, 10)
        const preferredTime = String(details?.preferredTime || '').trim() || '10:00'
        const orderId = String(details?.orderId || details?.paymentId || 'booking').trim()
        const paymentId = String(details?.paymentId || orderId).trim()
        const service = String(details?.service || 'Service Session').trim()

        const [hours, minutes] = preferredTime.split(':').map((value) => Number.parseInt(value, 10) || 0)
        const start = new Date(preferredDate)
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
            `UID:${orderId}@ggauravky.vercel.app`,
            `DTSTAMP:${toUtc(new Date())}`,
            `DTSTART:${toUtc(start)}`,
            `DTEND:${toUtc(end)}`,
            `SUMMARY:${service} - Booking Session`,
            `DESCRIPTION:Booking ID ${orderId} | Payment ID ${paymentId}`,
            'END:VEVENT',
            'END:VCALENDAR',
        ].join('\r\n')

        downloadBlob(ics, `booking-calendar-${orderId}.ics`, 'text/calendar;charset=utf-8')
        toast.success('Calendar file downloaded')
    }

    useEffect(() => {
        if (!details?.orderId) {
            return
        }

        const autoDownloadKey = `${effectiveFlow}:${details.orderId}`
        if (autoDownloadKeyRef.current === autoDownloadKey) {
            return
        }

        autoDownloadKeyRef.current = autoDownloadKey
        void downloadReceiptPdf({ silent: true, auto: true })
    }, [details, effectiveFlow])

    return (
        <div className="min-h-screen bg-slate-900 relative overflow-hidden">
            <div className="absolute -top-20 right-0 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 left-0 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

            {isProcessingBoardVisible ? (
                <ProcessingBoard
                    effectiveFlow={effectiveFlow}
                    isHydrationBoardVisible={isHydrationBoardVisible}
                    processingStepIndex={processingStepIndex}
                    processingSteps={processingSteps}
                />
            ) : null}

            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-18">
                <div className="mb-6 flex items-center justify-between gap-3">
                    <button
                        type="button"
                        onClick={() => navigate(effectiveFlow === 'support' ? '/support' : '/booknow')}
                        className="inline-flex items-center gap-2 text-sm text-cyan-300 hover:text-cyan-200 transition-colors"
                    >
                        <span>{'<-'}</span>
                        <span>Back</span>
                    </button>
                    <span className="inline-flex items-center rounded-full border border-emerald-500/35 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-200">
                        Payment Successful
                    </span>
                </div>

                <div className="rounded-3xl border border-emerald-400/25 bg-gradient-to-b from-slate-900 to-slate-950 p-6 sm:p-8">
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-100">
                        {effectiveFlow === 'support' ? 'Support Payment Confirmed' : 'Booking Payment Confirmed'}
                    </h1>
                    <p className="mt-2 text-slate-300 text-sm sm:text-base">
                        Payment is verified successfully. Thank you, and check your mail for updates.
                    </p>
                    <p className="mt-2 text-xs text-slate-400">
                        This page is your next step: download your receipt files and open My Activity if you need history.
                    </p>

                    {isHydratingDetails ? (
                        <div className="mt-3 rounded-xl border border-cyan-500/35 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-100">
                            Loading latest payment details from server...
                        </div>
                    ) : null}

                    {detailsLoadError ? (
                        <div className="mt-3 rounded-xl border border-amber-500/35 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                            {detailsLoadError}
                        </div>
                    ) : null}

                    {details ? (
                        <>
                            <div className="mt-5 rounded-2xl border border-slate-700 bg-slate-800/55 p-4 text-sm text-slate-300 space-y-1.5">
                                <p><span className="text-slate-400">Order ID:</span> {details.orderId}</p>
                                <p><span className="text-slate-400">Payment ID:</span> {details.paymentId || 'Not available'}</p>
                                {effectiveFlow === 'support' ? (
                                    <>
                                        <p><span className="text-slate-400">Name:</span> {details.contributorName || details.contributor || 'Supporter'}</p>
                                        <p><span className="text-slate-400">Amount:</span> INR {details.amount}</p>
                                    </>
                                ) : (
                                    <>
                                        <p><span className="text-slate-400">Service:</span> {details.service}</p>
                                        <p><span className="text-slate-400">Session Date:</span> {formatDateForDisplay(details.preferredDate)}</p>
                                        <p><span className="text-slate-400">Session Time:</span> {details.preferredTime}</p>
                                    </>
                                )}
                            </div>

                            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                <button
                                    type="button"
                                    disabled={isDownloadingReceipt}
                                    onClick={() => {
                                        void downloadReceiptPdf({ silent: false, auto: false })
                                    }}
                                    className="rounded-xl px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 transition-all duration-300"
                                >
                                    {isDownloadingReceipt ? 'Downloading PDF...' : 'Download Receipt PDF'}
                                </button>
                                <button
                                    type="button"
                                    disabled={isDownloadingReceipt}
                                    onClick={() => {
                                        void downloadReceiptImage({ silent: false, auto: false })
                                    }}
                                    className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-100 border border-slate-600 hover:border-slate-500 transition-colors"
                                >
                                    {isDownloadingReceipt ? 'Downloading Image...' : 'Download Image Backup Receipt'}
                                </button>
                            </div>

                            {effectiveFlow === 'service' ? (
                                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                    <button
                                        type="button"
                                        onClick={downloadInvitationCard}
                                        className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-100 border border-slate-600 hover:border-cyan-500/40 hover:text-cyan-300 transition-colors"
                                    >
                                        Download Invitation Pass
                                    </button>
                                    <button
                                        type="button"
                                        onClick={downloadCalendarInvite}
                                        className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-100 border border-slate-600 hover:border-cyan-500/40 hover:text-cyan-300 transition-colors"
                                    >
                                        Download Calendar File
                                    </button>
                                </div>
                            ) : null}

                            {receiptDownloadError ? (
                                <div className="mt-3 rounded-xl border border-amber-500/35 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                                    {receiptDownloadError}
                                </div>
                            ) : null}
                        </>
                    ) : (
                        <div className="mt-6 rounded-2xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                            Payment details are not available right now. Please open My Activity to view your latest transaction.
                        </div>
                    )}

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <Link
                            to={activityUrl}
                            className="inline-flex justify-center rounded-xl px-4 py-3 text-sm font-semibold text-cyan-200 border border-cyan-500/35 bg-cyan-500/5 hover:bg-cyan-500/10 transition-colors"
                        >
                            Open My Activity
                        </Link>
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
    )
}

export default PaymentSuccess

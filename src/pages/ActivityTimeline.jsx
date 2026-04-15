import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import useSEO from '../hooks/useSEO'
import useAuth from '../hooks/useAuth'
import { fetchMyActivityTimeline } from '../services/activity'
import {
    fetchServiceReceiptImage,
    fetchServiceReceiptPdf,
    fetchSupportReceiptImage,
    fetchSupportReceiptPdf,
} from '../services/payment'

const humanizeToken = (value, fallback = 'Event') => {
    const raw = String(value || '')
        .trim()
        .replaceAll(/[_-]+/g, ' ')

    if (!raw) {
        return fallback
    }

    return raw
        .split(' ')
        .filter(Boolean)
        .map((token) => token.charAt(0).toUpperCase() + token.slice(1).toLowerCase())
        .join(' ')
}

const formatDateTime = (value) => {
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) {
        return 'Not available'
    }

    return parsed.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
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

const getStatusBadgeClass = (status) => {
    const normalized = String(status || '').trim().toLowerCase()

    if (normalized === 'success') {
        return 'border-emerald-500/35 bg-emerald-500/10 text-emerald-200'
    }

    if (normalized === 'pending') {
        return 'border-amber-500/35 bg-amber-500/10 text-amber-200'
    }

    if (normalized === 'failed') {
        return 'border-rose-500/35 bg-rose-500/10 text-rose-200'
    }

    return 'border-slate-600/60 bg-slate-800/70 text-slate-300'
}

const getEventIcon = (event) => {
    const normalizedAction = String(event?.actionType || '').trim().toLowerCase()

    if (normalizedAction.includes('success')) {
        return '✓'
    }

    if (normalizedAction.includes('failed')) {
        return '!'
    }

    if (normalizedAction.includes('email')) {
        return '@'
    }

    if (normalizedAction.includes('receipt')) {
        return '#'
    }

    return '•'
}

const isPendingEvent = (event) => {
    const normalizedStatus = String(event?.status || '').trim().toLowerCase()
    return normalizedStatus === 'pending'
}

function ActivityTimeline() {
    const { user, isLoading, isAuthenticated } = useAuth()

    useSEO({
        title: 'My Activity | Gaurav Kumar Yadav',
        description: 'Unified payment, receipt, and account activity timeline with downloadable receipts.',
        keywords: 'activity timeline, payments, receipts, order history',
        ogImage: 'https://ggauravky.vercel.app/images/profile.jpg',
    })

    const [timeline, setTimeline] = useState([])
    const [isPageLoading, setIsPageLoading] = useState(true)
    const [pageError, setPageError] = useState('')
    const [downloadingKey, setDownloadingKey] = useState('')

    const hasPendingEvents = useMemo(() => timeline.some((item) => isPendingEvent(item)), [timeline])

    const loadTimeline = async ({ silent = false } = {}) => {
        if (!isAuthenticated) {
            setTimeline([])
            setIsPageLoading(false)
            setPageError('')
            return
        }

        if (!silent) {
            setIsPageLoading(true)
        }

        try {
            const response = await fetchMyActivityTimeline({ limit: 120 })
            setTimeline(Array.isArray(response?.items) ? response.items : [])
            setPageError('')
        } catch (error) {
            const message = String(error?.message || 'Unable to load your activity timeline right now.')
            setPageError(message)

            if (silent) {
                return
            }

            toast.error(message)
        } finally {
            setIsPageLoading(false)
        }
    }

    useEffect(() => {
        if (isLoading) {
            return
        }

        void loadTimeline({ silent: false })
    }, [isAuthenticated, isLoading])

    useEffect(() => {
        if (!hasPendingEvents || !isAuthenticated || isLoading) {
            return
        }

        const timerId = setInterval(() => {
            void loadTimeline({ silent: true })
        }, 7000)

        return () => {
            clearInterval(timerId)
        }
    }, [hasPendingEvents, isAuthenticated, isLoading])

    const downloadReceipt = async ({ item, format }) => {
        const receipt = item?.receipt
        const orderId = String(receipt?.orderId || '').trim()
        const kind = String(receipt?.kind || '').trim().toLowerCase()

        if (!orderId || !kind || !user?.email) {
            toast.error('Receipt metadata is incomplete for this activity entry.')
            return
        }

        const extension = format === 'pdf' ? 'pdf' : 'svg'
        const key = `${format}:${kind}:${orderId}`

        setDownloadingKey(key)

        try {
            const blob = await (
                kind === 'support'
                    ? format === 'pdf'
                        ? fetchSupportReceiptPdf(orderId, user.email)
                        : fetchSupportReceiptImage(orderId, user.email)
                    : format === 'pdf'
                        ? fetchServiceReceiptPdf(orderId, user.email)
                        : fetchServiceReceiptImage(orderId, user.email)
            )

            const prefix = kind === 'support' ? 'support-receipt' : 'service-confirmation'
            saveBlobAsFile(blob, `${prefix}-${orderId}.${extension}`)
            toast.success(format === 'pdf' ? 'Receipt PDF downloaded' : 'Receipt image downloaded')
        } catch (error) {
            const message = String(error?.message || 'Unable to download receipt')
            toast.error(message)
        } finally {
            setDownloadingKey('')
        }
    }

    if (isLoading || isPageLoading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
                <div className="rounded-2xl border border-slate-700 bg-slate-800/70 px-6 py-5 text-slate-200">
                    Loading activity timeline...
                </div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-slate-900 px-4 py-16">
                <div className="mx-auto max-w-3xl rounded-3xl border border-slate-700 bg-slate-800/70 p-8 text-center">
                    <h1 className="text-3xl font-black text-slate-100">Sign In Required</h1>
                    <p className="mt-3 text-slate-300">
                        Sign in with your Google account to view your unified payment and receipt activity timeline.
                    </p>
                    <div className="mt-5">
                        <Link
                            to="/booknow"
                            className="inline-flex rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-500 transition-colors"
                        >
                            Continue to Booking
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-900 relative overflow-hidden">
            <div className="absolute -top-20 right-0 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 left-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-14">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-[11px] uppercase tracking-wider text-cyan-300">Unified Timeline</p>
                        <h1 className="text-3xl sm:text-4xl font-black text-slate-100">My Activity</h1>
                        <p className="mt-2 text-slate-300 text-sm sm:text-base">
                            Payments, receipts, and related events from one source of truth.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Link
                            to="/services"
                            className="rounded-xl border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-cyan-500/40 hover:text-cyan-300 transition-colors"
                        >
                            Explore Services
                        </Link>
                        <button
                            type="button"
                            onClick={() => {
                                void loadTimeline({ silent: false })
                            }}
                            className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500 transition-colors"
                        >
                            Refresh
                        </button>
                    </div>
                </div>

                {pageError ? (
                    <div className="mb-4 rounded-xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                        {pageError}
                    </div>
                ) : null}

                {!timeline.length ? (
                    <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-6 text-slate-300">
                        No timeline events yet. Complete a payment and this page will show your full activity.
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {timeline.map((item) => {
                            const statusToken = String(item.status || 'info').toLowerCase()
                            const showReceiptActions = Boolean(item.receipt?.kind && item.receipt?.orderId)
                            const transactionId = String(item.transactionId || '').trim()
                            const flow = String(item.receipt?.kind || item.type || 'service').trim().toLowerCase() === 'support'
                                ? 'support'
                                : 'service'

                            const pdfDownloadKey = `pdf:${item.receipt?.kind}:${item.receipt?.orderId}`
                            const imageDownloadKey = `image:${item.receipt?.kind}:${item.receipt?.orderId}`

                            return (
                                <article
                                    key={item.id}
                                    className="rounded-2xl border border-slate-700/75 bg-slate-800/65 p-5"
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-600 text-xs text-slate-200">
                                                    {getEventIcon(item)}
                                                </span>
                                                <p className="text-base sm:text-lg font-semibold text-slate-100">
                                                    {item.title || humanizeToken(item.actionType)}
                                                </p>
                                            </div>
                                            <p className="mt-1 text-xs text-slate-400">
                                                {humanizeToken(item.domain, 'Payment')} • {humanizeToken(item.actionType)} • {formatDateTime(item.timestamp)}
                                            </p>
                                        </div>
                                        <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${getStatusBadgeClass(statusToken)}`}>
                                            {statusToken}
                                        </span>
                                    </div>

                                    <div className="mt-3 grid gap-1 text-sm text-slate-300">
                                        {Number.isFinite(Number(item.amount)) && Number(item.amount) > 0 ? (
                                            <p><span className="text-slate-400">Amount:</span> INR {Number(item.amount).toLocaleString('en-IN')}</p>
                                        ) : null}
                                        {item.orderId ? (
                                            <p><span className="text-slate-400">Order ID:</span> {item.orderId}</p>
                                        ) : null}
                                        {item.paymentId ? (
                                            <p><span className="text-slate-400">Payment ID:</span> {item.paymentId}</p>
                                        ) : null}
                                        {transactionId ? (
                                            <p><span className="text-slate-400">Transaction:</span> {transactionId}</p>
                                        ) : null}
                                    </div>

                                    {showReceiptActions ? (
                                        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                            <button
                                                type="button"
                                                disabled={downloadingKey === pdfDownloadKey}
                                                onClick={() => {
                                                    void downloadReceipt({ item, format: 'pdf' })
                                                }}
                                                className="rounded-xl border border-emerald-500/35 bg-emerald-500/10 px-4 py-2.5 text-xs font-semibold text-emerald-200 hover:bg-emerald-500/20 disabled:opacity-60 transition-colors"
                                            >
                                                {downloadingKey === pdfDownloadKey ? 'Downloading PDF...' : 'Download PDF Receipt'}
                                            </button>
                                            <button
                                                type="button"
                                                disabled={downloadingKey === imageDownloadKey}
                                                onClick={() => {
                                                    void downloadReceipt({ item, format: 'image' })
                                                }}
                                                className="rounded-xl border border-cyan-500/35 bg-cyan-500/10 px-4 py-2.5 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/20 disabled:opacity-60 transition-colors"
                                            >
                                                {downloadingKey === imageDownloadKey ? 'Downloading Image...' : 'Download Image Receipt'}
                                            </button>

                                            {transactionId ? (
                                                <Link
                                                    to={`/payment-success/${encodeURIComponent(transactionId)}?flow=${flow}&orderId=${encodeURIComponent(String(item.orderId || '').trim())}`}
                                                    className="inline-flex items-center justify-center rounded-xl border border-slate-600 px-4 py-2.5 text-xs font-semibold text-slate-100 hover:border-slate-500 transition-colors"
                                                >
                                                    Open Success Page
                                                </Link>
                                            ) : null}
                                        </div>
                                    ) : null}
                                </article>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}

export default ActivityTimeline

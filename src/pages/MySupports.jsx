import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import useSEO from '../hooks/useSEO'
import useAuth from '../hooks/useAuth'
import { fetchMySupports } from '../services/blogSupport'
import {
    fetchMyBookings,
    fetchMySupportPayments,
    fetchPaymentStatus,
    fetchServiceReceiptImage,
    fetchServiceReceiptPdf,
    fetchSupportReceiptImage,
    fetchSupportReceiptPdf,
} from '../services/payment'

const formatDate = (value) => {
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) {
        return 'NA'
    }

    return parsed.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })
}

const getStatusBadgeClass = (status) => {
    const normalized = String(status || '').toLowerCase()
    if (normalized === 'paid') {
        return 'border-emerald-400/35 bg-emerald-500/10 text-emerald-200'
    }
    if (normalized === 'pending' || normalized === 'created') {
        return 'border-amber-400/35 bg-amber-500/10 text-amber-200'
    }
    if (normalized === 'failed') {
        return 'border-rose-400/35 bg-rose-500/10 text-rose-200'
    }
    return 'border-slate-500/35 bg-slate-500/10 text-slate-300'
}

const isPendingPaymentState = (status) => ['created', 'pending'].includes(String(status || '').toLowerCase())

const parsePendingPaymentTargetsKey = (targetsKey) =>
    String(targetsKey || '')
        .split('|')
        .map((entry) => entry.trim())
        .filter(Boolean)
        .map((entry) => {
            const separatorIndex = entry.indexOf(':')
            if (separatorIndex <= 0) {
                return null
            }

            const type = entry.slice(0, separatorIndex)
            const orderId = entry.slice(separatorIndex + 1).trim()

            if (!orderId) {
                return null
            }

            return {
                type,
                orderId,
            }
        })
        .filter(Boolean)

const splitPaymentStatusUpdatesByType = (updates) => {
    const serviceStatusesByOrderId = new Map()
    const supportStatusesByOrderId = new Map()

    updates.forEach((entry) => {
        const mapTarget = entry.type === 'support' ? supportStatusesByOrderId : serviceStatusesByOrderId
        mapTarget.set(entry.orderId, entry.status)
    })

    return {
        serviceStatusesByOrderId,
        supportStatusesByOrderId,
    }
}

const mergeActivityItemsWithStatuses = (items, statusesByOrderId) =>
    items.map((item) => {
        const status = statusesByOrderId.get(String(item.orderId || '').trim())
        if (!status) {
            return item
        }

        return {
            ...item,
            paymentStatus: String(status.paymentStatus || item.paymentStatus || '').toLowerCase(),
            paidAt: status.paidAt || item.paidAt,
            updatedAt: status.updatedAt || item.updatedAt,
            reconciliationStatus: status.reconciliationStatus || item.reconciliationStatus,
        }
    })

const parsePaymentSuccessState = (searchParams) => {
    const source = String(searchParams.get('source') || '').trim().toLowerCase()
    if (source !== 'payment') {
        return null
    }

    const status = String(searchParams.get('status') || '').trim().toLowerCase()
    if (status && status !== 'success') {
        return null
    }

    const flow = String(searchParams.get('flow') || '').trim().toLowerCase()
    const tab = String(searchParams.get('tab') || '').trim().toLowerCase()
    const orderId = String(searchParams.get('orderId') || '').trim()
    const paymentId = String(searchParams.get('paymentId') || '').trim()

    if (!orderId) {
        return null
    }

    const resolvedFlow = flow === 'support' ? 'support' : 'service'
    const isValidTab = tab === 'payments' || tab === 'bookings'
    let resolvedTab = tab

    if (!isValidTab) {
        resolvedTab = resolvedFlow === 'support' ? 'payments' : 'bookings'
    }

    return {
        flow: resolvedFlow,
        tab: resolvedTab,
        orderId,
        paymentId,
    }
}

function MyActivity() {
    const { user, isAuthenticated, isLoading } = useAuth()
    const [searchParams, setSearchParams] = useSearchParams()
    const [activeTab, setActiveTab] = useState('supports')
    const [loading, setLoading] = useState(true)
    const [supports, setSupports] = useState([])
    const [bookings, setBookings] = useState([])
    const [supportPayments, setSupportPayments] = useState([])
    const [downloadingKey, setDownloadingKey] = useState('')
    const [paymentSuccessState, setPaymentSuccessState] = useState(null)

    useSEO({
        title: 'My Activity - Gaurav Portfolio',
        description: 'View your signed-in supports, bookings, and support contributions.',
        keywords: 'my activity, bookings, support history, payment history',
        ogImage: 'https://ggauravky.vercel.app/images/profile.jpg',
    })

    const tabs = useMemo(
        () => [
            { key: 'supports', label: `Blog Supports (${supports.length})` },
            { key: 'bookings', label: `Service Purchases (${bookings.length})` },
            { key: 'payments', label: `Support Jar (${supportPayments.length})` },
        ],
        [supports.length, bookings.length, supportPayments.length]
    )

    const queryPaymentSuccessState = useMemo(
        () => parsePaymentSuccessState(searchParams),
        [searchParams]
    )

    const pendingPaymentTargetsKey = useMemo(() => {
        const targets = []

        bookings.forEach((item) => {
            if (!item?.orderId || !isPendingPaymentState(item.paymentStatus)) {
                return
            }

            targets.push(`service:${String(item.orderId).trim()}`)
        })

        supportPayments.forEach((item) => {
            if (!item?.orderId || !isPendingPaymentState(item.paymentStatus)) {
                return
            }

            targets.push(`support:${String(item.orderId).trim()}`)
        })

        const sortedTargets = [...targets].sort((left, right) => left.localeCompare(right))
        return sortedTargets.join('|')
    }, [bookings, supportPayments])

    useEffect(() => {
        if (!queryPaymentSuccessState) {
            setPaymentSuccessState(null)
            return
        }

        setPaymentSuccessState(queryPaymentSuccessState)
        setActiveTab(queryPaymentSuccessState.tab)
    }, [queryPaymentSuccessState])

    useEffect(() => {
        if (isLoading) {
            return
        }

        if (!isAuthenticated) {
            setLoading(false)
            setSupports([])
            setBookings([])
            setSupportPayments([])
            return
        }

        const loadActivity = async () => {
            setLoading(true)
            try {
                const [supportsData, bookingsData, supportPaymentsData] = await Promise.all([
                    fetchMySupports(),
                    fetchMyBookings(),
                    fetchMySupportPayments(),
                ])

                setSupports(Array.isArray(supportsData?.items) ? supportsData.items : [])
                setBookings(Array.isArray(bookingsData?.items) ? bookingsData.items : [])
                setSupportPayments(Array.isArray(supportPaymentsData?.items) ? supportPaymentsData.items : [])
            } catch (error) {
                toast.error(error?.message || 'Unable to load your activity right now')
            } finally {
                setLoading(false)
            }
        }

        loadActivity()
    }, [isAuthenticated, isLoading])

    useEffect(() => {
        if (loading || isLoading || !isAuthenticated || !user?.email || !pendingPaymentTargetsKey) {
            return
        }

        const targets = parsePendingPaymentTargetsKey(pendingPaymentTargetsKey)

        if (!targets.length) {
            return
        }

        let cancelled = false
        let attemptCount = 0
        let timerId = null

        const pollPendingPaymentStatuses = async () => {
            attemptCount += 1

            const activeEmail = String(user.email || '').trim()
            const checks = await Promise.allSettled(
                targets.map(async (target) => {
                    const status = await fetchPaymentStatus(target.orderId, activeEmail)
                    return {
                        ...target,
                        status,
                    }
                })
            )

            if (cancelled) {
                return
            }

            const successfulUpdates = checks
                .filter((result) => result.status === 'fulfilled' && result.value?.status)
                .map((result) => result.value)

            if (successfulUpdates.length) {
                const { serviceStatusesByOrderId, supportStatusesByOrderId } =
                    splitPaymentStatusUpdatesByType(successfulUpdates)

                if (serviceStatusesByOrderId.size) {
                    setBookings((prev) => mergeActivityItemsWithStatuses(prev, serviceStatusesByOrderId))
                }

                if (supportStatusesByOrderId.size) {
                    setSupportPayments((prev) =>
                        mergeActivityItemsWithStatuses(prev, supportStatusesByOrderId)
                    )
                }
            }

            const shouldContinuePolling =
                attemptCount < 6 &&
                (!successfulUpdates.length ||
                    successfulUpdates.some((entry) => isPendingPaymentState(entry.status?.paymentStatus)))

            if (shouldContinuePolling) {
                timerId = setTimeout(() => {
                    void pollPendingPaymentStatuses()
                }, 3500)
            }
        }

        void pollPendingPaymentStatuses()

        return () => {
            cancelled = true
            if (timerId) {
                clearTimeout(timerId)
            }
        }
    }, [isAuthenticated, isLoading, loading, pendingPaymentTargetsKey, user?.email])

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

    const downloadBookingReceipt = async (orderId) => {
        if (!user?.email || !orderId) {
            toast.error('Receipt details are incomplete')
            return
        }

        const key = `booking:${orderId}`
        setDownloadingKey(key)
        try {
            const blob = await fetchServiceReceiptPdf(orderId, user.email)
            saveBlobAsFile(blob, `service-confirmation-${orderId}.pdf`)
            toast.success('Service confirmation PDF downloaded')
        } catch (error) {
            try {
                const imageBlob = await fetchServiceReceiptImage(orderId, user.email)
                saveBlobAsFile(imageBlob, `service-confirmation-${orderId}.svg`)
                toast.success('PDF unavailable, image backup receipt downloaded')
            } catch (imageError) {
                toast.error(imageError?.message || error?.message || 'Unable to download service confirmation receipt')
            }
        } finally {
            setDownloadingKey('')
        }
    }

    const downloadSupportReceipt = async (orderId) => {
        if (!user?.email || !orderId) {
            toast.error('Receipt details are incomplete')
            return
        }

        const key = `support:${orderId}`
        setDownloadingKey(key)
        try {
            const blob = await fetchSupportReceiptPdf(orderId, user.email)
            saveBlobAsFile(blob, `support-receipt-${orderId}.pdf`)
            toast.success('Support receipt PDF downloaded')
        } catch (error) {
            try {
                const imageBlob = await fetchSupportReceiptImage(orderId, user.email)
                saveBlobAsFile(imageBlob, `support-receipt-${orderId}.svg`)
                toast.success('PDF unavailable, image backup receipt downloaded')
            } catch (imageError) {
                toast.error(imageError?.message || error?.message || 'Unable to download support receipt')
            }
        } finally {
            setDownloadingKey('')
        }
    }

    const dismissPaymentSuccessState = () => {
        setPaymentSuccessState(null)
        const nextParams = new URLSearchParams(searchParams)
        ;['source', 'status', 'flow', 'tab', 'orderId', 'paymentId'].forEach((key) => {
            nextParams.delete(key)
        })
        setSearchParams(nextParams, { replace: true })
    }

    const downloadExpectedReceipt = async () => {
        if (!paymentSuccessState?.orderId) {
            return
        }

        if (paymentSuccessState.flow === 'support') {
            await downloadSupportReceipt(paymentSuccessState.orderId)
            return
        }

        await downloadBookingReceipt(paymentSuccessState.orderId)
    }

    const getTabButtonClass = (isActive) => {
        if (isActive) {
            return 'border border-cyan-400/35 bg-cyan-500/10 text-cyan-200'
        }

        return 'border border-transparent bg-slate-800/80 text-slate-300 hover:border-slate-600'
    }

    const getReceiptButtonLabel = (isDownloading, canDownload, successLabel) => {
        if (isDownloading) {
            return 'Downloading Receipt...'
        }

        if (canDownload) {
            return successLabel
        }

        return 'Receipt available after payment confirmation'
    }

    const renderEmptyState = (message) => (
        <div className="mt-8 rounded-2xl border border-slate-700 bg-slate-800/60 p-6 text-slate-300">{message}</div>
    )

    const renderSupportsTab = () => {
        if (supports.length === 0) {
            return renderEmptyState('You have not supported any blog post yet.')
        }

        return (
            <div className="mt-8 grid gap-4">
                {supports.map((item) => (
                    <Link
                        key={item.id}
                        to={`/blog/${item.blog.slug}`}
                        className="group rounded-2xl border border-slate-700/70 bg-slate-800/55 p-5 hover:border-cyan-500/40 hover:-translate-y-0.5 transition-all duration-300"
                    >
                        <p className="text-lg font-semibold text-slate-100 group-hover:text-cyan-200 transition-colors">
                            {item.blog.title}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-400">
                            <span>Supported on {formatDate(item.createdAt)}</span>
                            <span>•</span>
                            <span className="text-rose-300">❤️ {item.blog.supportCount} supporters</span>
                        </div>
                    </Link>
                ))}
            </div>
        )
    }

    const renderBookingsTab = () => {
        if (bookings.length === 0) {
            return renderEmptyState('You have no service purchases yet.')
        }

        return (
            <div className="mt-8 grid gap-4">
                {bookings.map((item) => {
                    const canDownload = item.paymentStatus === 'paid'
                    const buttonKey = `booking:${item.orderId}`
                    const buttonLabel = getReceiptButtonLabel(
                        downloadingKey === buttonKey,
                        canDownload,
                        'Download Confirmation PDF'
                    )
                    const isSuccessOrder = paymentSuccessState?.flow === 'service' && paymentSuccessState?.orderId === item.orderId

                    return (
                        <div
                            key={item.id}
                            className={`rounded-2xl border bg-slate-800/55 p-5 ${
                                isSuccessOrder
                                    ? 'border-emerald-400/45 shadow-[0_0_0_1px_rgba(52,211,153,0.25)]'
                                    : 'border-slate-700/70'
                            }`}
                        >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <p className="text-lg font-semibold text-slate-100">{item.service}</p>
                                    <p className="mt-1 text-sm text-slate-400">
                                        Purchased on {formatDate(item.paidAt || item.createdAt)} | INR {item.amount}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">Order ID: {item.orderId}</p>
                                </div>
                                <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${getStatusBadgeClass(item.paymentStatus)}`}>
                                    {item.paymentStatus}
                                </span>
                            </div>

                            <div className="mt-4">
                                <button
                                    type="button"
                                    onClick={() => downloadBookingReceipt(item.orderId)}
                                    disabled={!canDownload || downloadingKey === buttonKey}
                                    className="rounded-xl border border-cyan-400/35 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-200 hover:bg-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {buttonLabel}
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>
        )
    }

    const renderPaymentsTab = () => {
        if (supportPayments.length === 0) {
            return renderEmptyState('You have no support contributions yet.')
        }

        return (
            <div className="mt-8 grid gap-4">
                {supportPayments.map((item) => {
                    const canDownload = item.paymentStatus === 'paid'
                    const buttonKey = `support:${item.orderId}`
                    const buttonLabel = getReceiptButtonLabel(
                        downloadingKey === buttonKey,
                        canDownload,
                        'Download Support Receipt PDF'
                    )
                    const isSuccessOrder = paymentSuccessState?.flow === 'support' && paymentSuccessState?.orderId === item.orderId

                    return (
                        <div
                            key={item.id}
                            className={`rounded-2xl border bg-slate-800/55 p-5 ${
                                isSuccessOrder
                                    ? 'border-emerald-400/45 shadow-[0_0_0_1px_rgba(52,211,153,0.25)]'
                                    : 'border-slate-700/70'
                            }`}
                        >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <p className="text-lg font-semibold text-slate-100">Support Contribution</p>
                                    <p className="mt-1 text-sm text-slate-400">
                                        Paid on {formatDate(item.paidAt || item.createdAt)} | INR {item.amount}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">Order ID: {item.orderId}</p>
                                    {item.message ? <p className="mt-2 text-sm text-slate-300">"{item.message}"</p> : null}
                                </div>
                                <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${getStatusBadgeClass(item.paymentStatus)}`}>
                                    {item.paymentStatus}
                                </span>
                            </div>

                            <div className="mt-4">
                                <button
                                    type="button"
                                    onClick={() => downloadSupportReceipt(item.orderId)}
                                    disabled={!canDownload || downloadingKey === buttonKey}
                                    className="rounded-xl border border-cyan-400/35 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-200 hover:bg-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {buttonLabel}
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>
        )
    }

    const renderActiveTab = () => {
        if (activeTab === 'supports') {
            return renderSupportsTab()
        }

        if (activeTab === 'bookings') {
            return renderBookingsTab()
        }

        if (activeTab === 'payments') {
            return renderPaymentsTab()
        }

        return null
    }

    if (loading || isLoading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-500" />
                    <p className="mt-3 text-slate-300">Loading your activity...</p>
                </div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-slate-900 px-4 py-20">
                <div className="mx-auto max-w-xl rounded-3xl border border-slate-700/70 bg-slate-800/60 p-8 text-center">
                    <h1 className="text-3xl font-bold text-slate-100">My Activity</h1>
                    <p className="mt-3 text-slate-300">
                        You are not signed in yet. Sign in with Google from any blog support or checkout page.
                    </p>
                    <Link
                        to="/blog"
                        className="mt-6 inline-flex items-center justify-center rounded-xl border border-cyan-400/40 bg-cyan-500/10 px-5 py-3 text-cyan-200 hover:bg-cyan-500/20 transition-colors"
                    >
                        Go to Blog
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-900 px-4 py-14 sm:py-20">
            <div className="mx-auto max-w-5xl">
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-100">My Activity</h1>
                <p className="mt-2 text-slate-400">
                    Welcome {user?.name || 'User'}. Track your blog supports, service purchases, and support contributions in one place.
                </p>

                {paymentSuccessState ? (
                    <div className="mt-6 rounded-2xl border border-emerald-500/35 bg-emerald-500/10 p-4 sm:p-5">
                        <p className="text-[11px] uppercase tracking-wider text-emerald-200">Payment Confirmed</p>
                        <h2 className="mt-1 text-lg sm:text-xl font-semibold text-emerald-100">
                            {paymentSuccessState.flow === 'support'
                                ? 'Thank you for supporting. Your contribution was successful.'
                                : 'Congratulations. Your service payment was successful.'}
                        </h2>
                        <p className="mt-2 text-sm text-emerald-50/90">
                            Order ID: {paymentSuccessState.orderId}
                            {paymentSuccessState.paymentId ? ` | Payment ID: ${paymentSuccessState.paymentId}` : ''}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={downloadExpectedReceipt}
                                disabled={Boolean(downloadingKey)}
                                className="rounded-xl border border-emerald-300/50 bg-emerald-600/20 px-4 py-2 text-sm font-semibold text-emerald-100 hover:bg-emerald-600/30 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {paymentSuccessState.flow === 'support'
                                    ? 'Download Support Receipt PDF'
                                    : 'Download Service Confirmation PDF'}
                            </button>
                            <button
                                type="button"
                                onClick={dismissPaymentSuccessState}
                                className="rounded-xl border border-emerald-200/30 bg-transparent px-4 py-2 text-sm font-semibold text-emerald-100 hover:bg-emerald-500/10"
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                ) : null}

                <div className="mt-6 flex flex-wrap gap-2 rounded-2xl border border-slate-700 bg-slate-800/60 p-2">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.key
                        return (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => setActiveTab(tab.key)}
                                className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${getTabButtonClass(isActive)}`}
                            >
                                {tab.label}
                            </button>
                        )
                    })}
                </div>

                {renderActiveTab()}
            </div>
        </div>
    )
}

export default MyActivity

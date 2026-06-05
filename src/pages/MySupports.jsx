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
        return 'border-[#c5f82a]/30 bg-[#c5f82a]/10 text-[#c5f82a]'
    }
    if (normalized === 'pending' || normalized === 'created') {
        return 'border-[#ff5d00]/30 bg-[#ff5d00]/10 text-[#ff5d00]'
    }
    if (normalized === 'failed') {
        return 'border-rose-500/30 bg-rose-500/10 text-rose-300'
    }
    return 'border-[#1a1a22] bg-[#16161a] text-[#a1a1aa]'
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
            return 'border-[#c5f82a] bg-[#c5f82a]/10 text-[#c5f82a]'
        }

        return 'border-[#1a1a22] bg-[#16161a] text-[#a1a1aa] hover:border-[#c5f82a]/30 hover:text-white'
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
        <div className="mt-8 rounded-md border border-[#1a1a22] bg-[#0e0e11] p-8 text-center text-[#a1a1aa] text-sm font-mono uppercase tracking-wider">{message}</div>
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
                        className="group rounded-md border border-[#1a1a22] bg-[#0e0e11] p-6 hover:border-[#c5f82a]/30 transition-all duration-200"
                    >
                        <p className="text-lg font-display font-bold text-white group-hover:text-[#c5f82a] transition-colors">
                            {item.blog.title}
                        </p>
                        <div className="mt-3.5 flex flex-wrap items-center gap-3 text-xs font-mono uppercase tracking-wider text-[#a1a1aa]">
                            <span>Supported on {formatDate(item.createdAt)}</span>
                            <span>•</span>
                            <span className="text-[#ff5d00]">❤️ {item.blog.supportCount} supporters</span>
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
                            className={`rounded-md border bg-[#0e0e11] p-6 transition-all duration-200 ${
                                isSuccessOrder
                                    ? 'border-[#c5f82a]/30 shadow-[2px_2px_0px_0px_rgba(197,248,42,0.15)]'
                                    : 'border-[#1a1a22]'
                            }`}
                        >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <p className="text-lg font-display font-bold text-white">{item.service}</p>
                                    <p className="mt-1.5 text-xs font-mono uppercase tracking-wider text-[#a1a1aa]">
                                        Purchased on {formatDate(item.paidAt || item.createdAt)} | INR {item.amount}
                                    </p>
                                    <p className="mt-1 text-[10px] font-mono uppercase text-[#a1a1aa]/50">Order ID: {item.orderId}</p>
                                </div>
                                <span className={`inline-flex rounded-md border px-3 py-1 text-[10px] font-mono uppercase tracking-wider ${getStatusBadgeClass(item.paymentStatus)}`}>
                                    {item.paymentStatus}
                                </span>
                            </div>

                            <div className="mt-5">
                                <button
                                    type="button"
                                    onClick={() => downloadBookingReceipt(item.orderId)}
                                    disabled={!canDownload || downloadingKey === buttonKey}
                                    className="rounded-md border border-[#1a1a22] bg-[#0e0e11] px-4 py-2.5 text-xs font-mono uppercase text-[#a1a1aa] hover:text-[#c5f82a] hover:border-[#c5f82a]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
                            className={`rounded-md border bg-[#0e0e11] p-6 transition-all duration-200 ${
                                isSuccessOrder
                                    ? 'border-[#c5f82a]/30 shadow-[2px_2px_0px_0px_rgba(197,248,42,0.15)]'
                                    : 'border-[#1a1a22]'
                            }`}
                        >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <p className="text-lg font-display font-bold text-white">Support Contribution</p>
                                    <p className="mt-1.5 text-xs font-mono uppercase tracking-wider text-[#a1a1aa]">
                                        Paid on {formatDate(item.paidAt || item.createdAt)} | INR {item.amount}
                                    </p>
                                    <p className="mt-1 text-[10px] font-mono uppercase text-[#a1a1aa]/50">Order ID: {item.orderId}</p>
                                    {item.message ? <p className="mt-3 text-sm text-[#a1a1aa] leading-relaxed p-3 bg-[#16161a] border border-[#1a1a22] rounded-md">"{item.message}"</p> : null}
                                </div>
                                <span className={`inline-flex rounded-md border px-3 py-1 text-[10px] font-mono uppercase tracking-wider ${getStatusBadgeClass(item.paymentStatus)}`}>
                                    {item.paymentStatus}
                                </span>
                            </div>

                            <div className="mt-5">
                                <button
                                    type="button"
                                    onClick={() => downloadSupportReceipt(item.orderId)}
                                    disabled={!canDownload || downloadingKey === buttonKey}
                                    className="rounded-md border border-[#1a1a22] bg-[#0e0e11] px-4 py-2.5 text-xs font-mono uppercase text-[#a1a1aa] hover:text-[#c5f82a] hover:border-[#c5f82a]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
            <div className="min-h-screen bg-[#070708] flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#c5f82a]" />
                    <p className="mt-3 text-[#a1a1aa] font-mono text-xs uppercase tracking-wider">Loading your activity...</p>
                </div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#070708] px-4 py-20 flex items-center justify-center">
                <div className="mx-auto max-w-xl w-full rounded-lg border border-[#1a1a22] bg-[#0e0e11] p-8 text-center">
                    <h1 className="text-3xl font-display font-bold text-white">My Activity</h1>
                    <p className="mt-3 text-[#a1a1aa] text-sm leading-relaxed">
                        You are not signed in yet. Sign in with Google from any blog support or checkout page.
                    </p>
                    <Link
                        to="/blog"
                        className="mt-6 inline-flex items-center justify-center rounded-md border border-[#1a1a22] bg-[#0e0e11] px-5 py-3 text-xs font-mono uppercase text-[#a1a1aa] hover:text-[#c5f82a] hover:border-[#c5f82a]/30 transition-colors"
                    >
                        Go to Blog
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#070708] px-4 py-14 sm:py-20">
            <div className="mx-auto max-w-5xl">
                <h1 className="text-3xl sm:text-4xl font-display font-bold text-white">My Activity</h1>
                <p className="mt-2 text-[#a1a1aa] text-sm leading-relaxed">
                    Welcome {user?.name || 'User'}. Track your blog supports, service purchases, and support contributions in one place.
                </p>

                {paymentSuccessState ? (
                    <div className="mt-6 rounded-md border border-[#c5f82a]/30 bg-[#c5f82a]/5 p-4 sm:p-5">
                        <p className="text-xs font-mono uppercase tracking-wider text-[#c5f82a]">Payment Confirmed</p>
                        <h2 className="mt-1 text-lg sm:text-xl font-display font-bold text-white">
                            {paymentSuccessState.flow === 'support'
                                ? 'Thank you for supporting. Your contribution was successful.'
                                : 'Congratulations. Your service payment was successful.'}
                        </h2>
                        <p className="mt-2 text-xs font-mono text-[#a1a1aa] leading-relaxed">
                            Order ID: {paymentSuccessState.orderId}
                            {paymentSuccessState.paymentId ? ` | Payment ID: ${paymentSuccessState.paymentId}` : ''}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={downloadExpectedReceipt}
                                disabled={Boolean(downloadingKey)}
                                className="rounded-md bg-[#c5f82a] text-[#070708] border-none shadow-[2px_2px_0px_0px_rgba(197,248,42,0.3)] hover:shadow-none hover:translate-y-[2px] transition-all duration-200 font-mono text-xs uppercase font-bold px-4 py-2.5"
                            >
                                {paymentSuccessState.flow === 'support'
                                    ? 'Download Support Receipt PDF'
                                    : 'Download Service Confirmation PDF'}
                            </button>
                            <button
                                type="button"
                                onClick={dismissPaymentSuccessState}
                                className="rounded-md border border-[#1a1a22] bg-transparent px-4 py-2.5 text-xs font-mono uppercase text-[#a1a1aa] hover:text-white transition-all"
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                ) : null}

                <div className="mt-6 flex flex-wrap gap-2 rounded-md border border-[#1a1a22] bg-[#0e0e11] p-1.5">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.key
                        return (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => setActiveTab(tab.key)}
                                className={`rounded-md px-4 py-2 text-xs font-mono uppercase tracking-wider transition-colors ${getTabButtonClass(isActive)}`}
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

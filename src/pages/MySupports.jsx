import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import useSEO from '../hooks/useSEO'
import useAuth from '../hooks/useAuth'
import { fetchMySupports } from '../services/blogSupport'
import {
    fetchMyBookings,
    fetchMySupportPayments,
    fetchServiceReceiptPdf,
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

function MyActivity() {
    const { user, isAuthenticated, isLoading } = useAuth()
    const [activeTab, setActiveTab] = useState('supports')
    const [loading, setLoading] = useState(true)
    const [supports, setSupports] = useState([])
    const [bookings, setBookings] = useState([])
    const [supportPayments, setSupportPayments] = useState([])
    const [downloadingKey, setDownloadingKey] = useState('')

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
            toast.error(error?.message || 'Unable to download service confirmation PDF')
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
            toast.error(error?.message || 'Unable to download support receipt PDF')
        } finally {
            setDownloadingKey('')
        }
    }

    const getTabButtonClass = (isActive) => {
        if (isActive) {
            return 'border border-cyan-400/35 bg-cyan-500/10 text-cyan-200'
        }

        return 'border border-transparent bg-slate-800/80 text-slate-300 hover:border-slate-600'
    }

    const getReceiptButtonLabel = (isDownloading, canDownload, successLabel) => {
        if (isDownloading) {
            return 'Downloading PDF...'
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

                    return (
                        <div key={item.id} className="rounded-2xl border border-slate-700/70 bg-slate-800/55 p-5">
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

                    return (
                        <div key={item.id} className="rounded-2xl border border-slate-700/70 bg-slate-800/55 p-5">
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

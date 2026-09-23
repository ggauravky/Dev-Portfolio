import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
    Activity,
    CalendarDays,
    ChevronRight,
    Download,
    ExternalLink,
    Heart,
    Link as LinkIcon,
    LogIn,
    Mail,
    MapPin,
    Pencil,
    ReceiptText,
    RefreshCw,
    ShieldCheck,
    WalletCards,
} from 'lucide-react'
import useSEO from '../hooks/useSEO'
import useAuth from '../hooks/useAuth'
import { fetchMyActivityTimeline } from '../services/activity'
import { fetchMySupports } from '../services/blogSupport'
import { fetchPaymentReceipt } from '../services/payment'
import { trackEvent } from '../utils/analytics'
import ProfileEditorDialog from '../components/account/ProfileEditorDialog'
import PaymentDetailsDialog from '../components/account/PaymentDetailsDialog'

const INTERNAL_PAYMENT_ACTIONS = new Set([
    'order_created',
    'reconciliation_started',
    'user_email_sent',
    'admin_email_sent',
    'pdf_generated',
    'receipt_downloaded',
])

const normalizeTab = (value) => {
    const tab = String(value || '').trim().toLowerCase()
    if (['payments', 'bookings'].includes(tab)) return 'payments'
    if (['sign-ins', 'logins', 'login', 'login-activity'].includes(tab)) return 'sign-ins'
    if (['activity', 'blog-likes', 'supports', 'blog'].includes(tab)) return 'activity'
    return 'overview'
}

const formatDateTime = (value) => {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return 'Not available'
    return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

const formatDate = (value) => {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return 'Not available'
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

const timestamp = (entry) => {
    const date = new Date(entry?.timestamp || entry?.createdAt || entry?.updatedAt || '')
    return Number.isNaN(date.getTime()) ? 0 : date.getTime()
}

const humanize = (value, fallback = 'Activity') => {
    const text = String(value || '').trim().replaceAll(/[_-]+/g, ' ')
    if (!text) return fallback
    return text.replace(/\b\w/g, (letter) => letter.toUpperCase())
}

const buildPaymentCards = (events) => {
    const groups = new Map()
    events.forEach((event) => {
        if (String(event?.domain || '').toLowerCase() !== 'payment') return
        const actionType = String(event?.actionType || '').toLowerCase()
        if (INTERNAL_PAYMENT_ACTIONS.has(actionType)) return
        const key = String(event.orderId || event.transactionId || event.paymentId || event.id || '').trim()
        if (!key) return
        groups.set(key, [...(groups.get(key) || []), event])
    })

    return [...groups.entries()]
        .map(([orderId, group]) => {
            const sorted = [...group].sort((left, right) => {
                const rank = { payment_success: 3, payment_failed: 2, payment_record: 1 }
                return (rank[right.actionType] || 0) - (rank[left.actionType] || 0) || timestamp(right) - timestamp(left)
            })
            const item = sorted[0]
            const actionType = String(item.actionType || '').toLowerCase()
            const flow = String(item.flow || item.metadata?.flow || '').toLowerCase() === 'support' ? 'support' : 'service'
            const amountItem = sorted.find((entry) => Number(entry.amount) > 0)
            const status = actionType === 'payment_success' ? 'success' : actionType === 'payment_failed' ? 'failed' : item.status || 'pending'
            return {
                ...item,
                id: `payment:${orderId}`,
                cardType: 'payment',
                orderId,
                transactionId: String(item.transactionId || item.paymentId || orderId),
                paymentId: String(item.paymentId || sorted.find((entry) => entry.paymentId)?.paymentId || ''),
                amount: Number(amountItem?.amount || 0),
                flow,
                status,
                title: flow === 'support'
                    ? status === 'success' ? 'Support contribution' : 'Support payment'
                    : String(item.title || 'Service booking'),
            }
        })
        .sort((left, right) => timestamp(right) - timestamp(left))
}

const buildSignIns = (events) => events
    .filter((event) => String(event?.domain || '').toLowerCase() === 'auth')
    .filter((event) => String(event?.actionType || '').toLowerCase() === 'login_success')
    .map((event) => ({
        ...event,
        id: `login:${event.id}`,
        cardType: 'login',
        title: event.metadata?.isNewUser ? 'First Google sign-in' : 'Google sign-in',
        status: 'success',
    }))
    .sort((left, right) => timestamp(right) - timestamp(left))

const buildBlogActivity = (supports) => (Array.isArray(supports) ? supports : [])
    .map((support, index) => {
        const blog = support.blog || support.blogSnapshot || {}
        return {
            id: `blog:${support.id || blog.slug || index}`,
            cardType: 'blog',
            status: 'success',
            timestamp: support.createdAt || support.updatedAt,
            title: blog.title || 'Supported blog post',
            metadata: { slug: blog.slug || '', supportCount: Number(blog.supportCount || 0) },
        }
    })
    .sort((left, right) => timestamp(right) - timestamp(left))

const initialsFor = (name) => String(name || 'User')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U'

function ProfileImage({ user }) {
    const [failed, setFailed] = useState(false)
    useEffect(() => setFailed(false), [user?.picture])
    if (user?.picture && !failed) {
        return <img src={user.picture} alt={`${user.name || 'User'} profile`} onError={() => setFailed(true)} referrerPolicy="no-referrer" className="h-20 w-20 rounded-full border border-[#c5f82a]/55 bg-[#17171b] object-cover sm:h-24 sm:w-24" />
    }
    return <div aria-label={`${user?.name || 'User'} initials`} className="flex h-20 w-20 items-center justify-center rounded-full border border-[#c5f82a]/55 bg-[#17171b] font-display text-xl font-semibold text-[#c5f82a] sm:h-24 sm:w-24">{initialsFor(user?.name)}</div>
}

const Status = ({ value }) => {
    const success = value === 'success'
    return <span className={`inline-flex rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider ${success ? 'border-[#c5f82a]/30 bg-[#c5f82a]/8 text-[#c5f82a]' : 'border-rose-500/30 bg-rose-500/8 text-rose-300'}`}>{value}</span>
}

const EmptyState = ({ title, body, action }) => (
    <div className="border border-dashed border-[#2a2a31] bg-[#0c0c0e] px-5 py-12 text-center">
        <p className="font-display text-lg font-semibold text-white">{title}</p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-zinc-500">{body}</p>
        {action}
    </div>
)

const LoadingState = () => (
    <div className="min-h-screen bg-[#070708] px-4 py-12">
        <div className="mx-auto max-w-6xl animate-pulse space-y-5">
            <div className="h-52 rounded-xl border border-[#1f1f24] bg-[#0e0e11]" />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[0, 1, 2, 3].map((item) => <div key={item} className="h-24 rounded-lg border border-[#1f1f24] bg-[#0e0e11]" />)}
            </div>
            <div className="h-16 rounded-lg border border-[#1f1f24] bg-[#0e0e11]" />
            <div className="h-36 rounded-lg border border-[#1f1f24] bg-[#0e0e11]" />
        </div>
    </div>
)

function ActivityTimeline() {
    const { user, isLoading, isAuthenticated, openAuthDialog } = useAuth()
    const [searchParams, setSearchParams] = useSearchParams()
    const [timeline, setTimeline] = useState([])
    const [blogSupports, setBlogSupports] = useState([])
    const [isPageLoading, setIsPageLoading] = useState(true)
    const [pageError, setPageError] = useState('')
    const [paymentFilter, setPaymentFilter] = useState('all')
    const [selectedPayment, setSelectedPayment] = useState(null)
    const [downloadingId, setDownloadingId] = useState('')
    const [isEditingProfile, setIsEditingProfile] = useState(false)
    const editButtonRef = useRef(null)
    const trackedViewRef = useRef('')

    const activeTab = normalizeTab(searchParams.get('tab'))

    useSEO({
        title: 'My Activity | Gaurav Kumar Yadav',
        description: 'Manage your portfolio profile, payments, receipts, and sign-in history.',
        keywords: 'account profile, transaction history, payment receipts, login history',
        ogImage: 'https://ggauravky.vercel.app/images/profile.jpg',
    })

    const loadData = useCallback(async () => {
        if (!isAuthenticated) {
            setTimeline([])
            setBlogSupports([])
            setIsPageLoading(false)
            return
        }
        setIsPageLoading(true)
        const [activityResult, supportsResult] = await Promise.allSettled([
            fetchMyActivityTimeline({ limit: 120 }),
            fetchMySupports(),
        ])
        if (activityResult.status === 'fulfilled') {
            setTimeline(Array.isArray(activityResult.value?.items) ? activityResult.value.items : [])
            setPageError('')
        } else {
            setPageError(activityResult.reason?.message || 'Unable to load account activity right now.')
        }
        if (supportsResult.status === 'fulfilled') {
            setBlogSupports(Array.isArray(supportsResult.value?.items) ? supportsResult.value.items : [])
        }
        setIsPageLoading(false)
    }, [isAuthenticated])

    useEffect(() => {
        if (!isLoading) void loadData()
    }, [isLoading, loadData])

    useEffect(() => {
        if (!isAuthenticated || trackedViewRef.current === activeTab) return
        trackedViewRef.current = activeTab
        void trackEvent('activity_page_view', { tab: activeTab })
    }, [activeTab, isAuthenticated])

    const activity = useMemo(() => {
        const payments = buildPaymentCards(timeline)
        const signIns = buildSignIns(timeline)
        const blogs = buildBlogActivity(blogSupports)
        const all = [...payments, ...signIns, ...blogs].sort((left, right) => timestamp(right) - timestamp(left))
        return { payments, signIns, blogs, all }
    }, [blogSupports, timeline])

    const visiblePayments = useMemo(() => paymentFilter === 'all'
        ? activity.payments
        : activity.payments.filter((payment) => payment.status === paymentFilter), [activity.payments, paymentFilter])

    const stats = useMemo(() => ({
        payments: activity.payments.length,
        receipts: activity.payments.filter((payment) => payment.status === 'success' && payment.metadata?.receiptNumber).length,
        support: activity.payments.filter((payment) => payment.flow === 'support' && payment.status === 'success').reduce((sum, payment) => sum + Number(payment.amount || 0), 0),
        signIns: activity.signIns.length,
    }), [activity])

    const setTab = (tab) => {
        const params = new URLSearchParams(searchParams)
        if (tab === 'overview') params.delete('tab')
        else params.set('tab', tab)
        setSearchParams(params, { replace: true })
    }

    const downloadReceipt = async (payment) => {
        if (!payment?.transactionId || downloadingId) return
        setDownloadingId(payment.transactionId)
        try {
            const blob = await fetchPaymentReceipt(payment.transactionId)
            const url = URL.createObjectURL(blob)
            const anchor = document.createElement('a')
            anchor.href = url
            anchor.download = `payment-receipt-${payment.metadata?.receiptNumber || payment.transactionId}.pdf`
            document.body.appendChild(anchor)
            anchor.click()
            anchor.remove()
            URL.revokeObjectURL(url)
            void trackEvent('receipt_downloaded', { transaction_id: payment.transactionId })
            toast.success('Receipt downloaded')
        } catch (error) {
            toast.error(error?.message || 'Unable to download receipt')
        } finally {
            setDownloadingId('')
        }
    }

    if (isLoading || isPageLoading) return <LoadingState />

    if (!isAuthenticated) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#070708] px-4 py-16">
                <div className="w-full max-w-xl border border-[#24242a] bg-[#0e0e11] p-7 text-center sm:p-10">
                    <ShieldCheck className="mx-auto h-8 w-8 text-[#c5f82a]" />
                    <h1 className="mt-5 font-display text-2xl font-semibold text-white sm:text-3xl">Your private account area</h1>
                    <p className="mt-3 text-sm leading-relaxed text-zinc-500">Sign in with Google to manage your profile and view payments, receipts, and account activity.</p>
                    <button type="button" onClick={() => openAuthDialog({ reason: 'activity' })} className="mt-6 rounded-md bg-[#c5f82a] px-5 py-3 text-sm font-semibold text-[#09090a] hover:bg-[#d4ff50]">Sign in with Google</button>
                </div>
            </main>
        )
    }

    const tabs = [
        { key: 'overview', label: 'Overview', icon: Activity },
        { key: 'payments', label: `Payments ${activity.payments.length}`, icon: WalletCards },
        { key: 'sign-ins', label: `Sign-ins ${activity.signIns.length}`, icon: LogIn },
        { key: 'activity', label: `Activity ${activity.all.length}`, icon: ReceiptText },
    ]

    const renderActivityRow = (item) => {
        const Icon = item.cardType === 'payment' ? WalletCards : item.cardType === 'login' ? LogIn : Heart
        return (
            <div key={item.id} className="flex items-start gap-3 border-b border-[#202025] py-4 last:border-b-0">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[#292930] bg-[#151518] text-[#c5f82a]"><Icon className="h-4 w-4" /></span>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-100">{item.title}</p>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-zinc-600">{formatDateTime(item.timestamp)}</p>
                </div>
                <Status value={item.status || 'success'} />
            </div>
        )
    }

    return (
        <main className="min-h-screen overflow-x-hidden bg-[#070708] text-white">
            <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
                <section className="overflow-hidden rounded-xl border border-[#24242a] bg-[#0d0d0f]">
                    <div className="h-1 bg-[#c5f82a]" />
                    <div className="flex flex-col gap-6 p-5 sm:p-7 lg:flex-row lg:items-center">
                        <ProfileImage user={user} />
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="truncate font-display text-2xl font-semibold tracking-tight sm:text-3xl">{user.name}</h1>
                                <span className="inline-flex items-center gap-1 rounded-full border border-[#2c2c32] px-2 py-1 font-mono text-[9px] uppercase tracking-wider text-zinc-500"><ShieldCheck className="h-3 w-3" />Google account</span>
                            </div>
                            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">{user.bio || 'Add a short bio so your account feels like yours.'}</p>
                            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-zinc-500">
                                <span className="inline-flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{user.email}</span>
                                {user.location ? <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{user.location}</span> : null}
                                {user.website ? <a href={user.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-[#c5f82a]"><LinkIcon className="h-3.5 w-3.5" />Website<ExternalLink className="h-3 w-3" /></a> : null}
                            </div>
                        </div>
                        <button ref={editButtonRef} type="button" onClick={() => setIsEditingProfile(true)} className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-[#35353c] px-4 py-2.5 text-sm font-medium text-zinc-200 hover:border-[#c5f82a]/55 hover:text-[#c5f82a] focus:outline-none focus:ring-2 focus:ring-[#c5f82a] lg:w-auto"><Pencil className="h-4 w-4" />Edit profile</button>
                    </div>
                    <div className="grid border-t border-[#24242a] sm:grid-cols-2">
                        <div className="flex items-center gap-3 border-b border-[#24242a] px-5 py-3 text-xs text-zinc-500 sm:border-b-0 sm:border-r sm:px-7"><CalendarDays className="h-3.5 w-3.5" /><span>Member since <strong className="font-medium text-zinc-300">{formatDate(user.createdAt)}</strong></span></div>
                        <div className="flex items-center gap-3 px-5 py-3 text-xs text-zinc-500 sm:px-7"><LogIn className="h-3.5 w-3.5" /><span>Last sign-in <strong className="font-medium text-zinc-300">{formatDateTime(user.lastLoginAt)}</strong></span></div>
                    </div>
                </section>

                <section aria-label="Account summary" className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-[#24242a] bg-[#24242a] lg:grid-cols-4">
                    {[
                        ['Payments', stats.payments, WalletCards],
                        ['Receipts', stats.receipts, ReceiptText],
                        ['Support total', `INR ${stats.support.toLocaleString('en-IN')}`, Heart],
                        ['Sign-ins', stats.signIns, LogIn],
                    ].map(([label, value, Icon]) => (
                        <div key={label} className="bg-[#0d0d0f] p-4 sm:p-5">
                            <div className="flex items-center justify-between"><p className="font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-600">{label}</p><Icon className="h-3.5 w-3.5 text-[#c5f82a]" /></div>
                            <p className="mt-3 font-display text-xl font-semibold text-white sm:text-2xl">{value}</p>
                        </div>
                    ))}
                </section>

                <div className="mt-8 flex items-center justify-between gap-4">
                    <div className="min-w-0 overflow-x-auto" role="tablist" aria-label="Account sections">
                        <div className="flex min-w-max gap-1 rounded-lg border border-[#24242a] bg-[#0d0d0f] p-1">
                            {tabs.map(({ key, label, icon: Icon }) => (
                                <button key={key} type="button" role="tab" aria-selected={activeTab === key} onClick={() => setTab(key)} className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-colors sm:px-4 ${activeTab === key ? 'bg-[#202025] text-white' : 'text-zinc-500 hover:text-zinc-200'}`}><Icon className={`h-3.5 w-3.5 ${activeTab === key ? 'text-[#c5f82a]' : ''}`} />{label}</button>
                            ))}
                        </div>
                    </div>
                    <button type="button" onClick={() => void loadData()} className="shrink-0 rounded-md border border-[#2a2a31] p-2.5 text-zinc-500 hover:text-[#c5f82a] focus:outline-none focus:ring-2 focus:ring-[#c5f82a]" aria-label="Refresh account activity"><RefreshCw className="h-4 w-4" /></button>
                </div>

                {pageError ? <p role="alert" className="mt-5 border border-amber-500/25 bg-amber-500/5 px-4 py-3 text-sm text-amber-200">{pageError}</p> : null}

                <section role="tabpanel" className="mt-5">
                    {activeTab === 'overview' ? (
                        <div className="grid gap-5 lg:grid-cols-[1.35fr_.65fr]">
                            <div className="rounded-lg border border-[#24242a] bg-[#0d0d0f] p-5 sm:p-6">
                                <div className="flex items-center justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#c5f82a]">Recent</p><h2 className="mt-1 font-display text-xl font-semibold">Latest activity</h2></div><button type="button" onClick={() => setTab('activity')} className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-white">View all<ChevronRight className="h-3.5 w-3.5" /></button></div>
                                <div className="mt-4">{activity.all.length ? activity.all.slice(0, 5).map(renderActivityRow) : <EmptyState title="No activity yet" body="Your latest payments, sign-ins, and blog activity will appear here." />}</div>
                            </div>
                            <aside className="rounded-lg border border-[#24242a] bg-[#0d0d0f] p-5 sm:p-6">
                                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#c5f82a]">Account</p>
                                <h2 className="mt-1 font-display text-xl font-semibold">Quick actions</h2>
                                <div className="mt-5 space-y-2">
                                    <Link to="/services" className="flex items-center justify-between rounded-md border border-[#26262c] px-3.5 py-3 text-sm text-zinc-300 hover:border-[#c5f82a]/40 hover:text-white"><span>Explore services</span><ChevronRight className="h-4 w-4" /></Link>
                                    <button type="button" onClick={() => setTab('payments')} className="flex w-full items-center justify-between rounded-md border border-[#26262c] px-3.5 py-3 text-sm text-zinc-300 hover:border-[#c5f82a]/40 hover:text-white"><span>View receipts</span><ChevronRight className="h-4 w-4" /></button>
                                    <Link to="/contact" className="flex items-center justify-between rounded-md border border-[#26262c] px-3.5 py-3 text-sm text-zinc-300 hover:border-[#c5f82a]/40 hover:text-white"><span>Payment help</span><ChevronRight className="h-4 w-4" /></Link>
                                </div>
                            </aside>
                        </div>
                    ) : null}

                    {activeTab === 'payments' ? (
                        <div>
                            <div className="mb-4 flex flex-wrap gap-2" aria-label="Filter payments">
                                {['all', 'success', 'failed'].map((filter) => <button key={filter} type="button" onClick={() => setPaymentFilter(filter)} className={`rounded-md border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider ${paymentFilter === filter ? 'border-[#c5f82a]/50 bg-[#c5f82a]/10 text-[#c5f82a]' : 'border-[#292930] text-zinc-600 hover:text-zinc-300'}`}>{filter}</button>)}
                            </div>
                            {visiblePayments.length ? <div className="space-y-3">{visiblePayments.map((payment) => (
                                <article key={payment.id} className="rounded-lg border border-[#24242a] bg-[#0d0d0f] p-4 sm:p-5">
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                        <button type="button" onClick={() => setSelectedPayment(payment)} className="min-w-0 flex-1 text-left focus:outline-none focus:ring-2 focus:ring-[#c5f82a]">
                                            <div className="flex flex-wrap items-center gap-2"><Status value={payment.status} /><span className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">{payment.flow === 'support' ? 'Support Contribution' : 'Service Booking'}</span></div>
                                            <p className="mt-2 truncate text-base font-medium text-white">{payment.title}</p>
                                            <p className="mt-1 text-xs text-zinc-600">{formatDateTime(payment.timestamp)}</p>
                                        </button>
                                        <div className="flex items-center justify-between gap-4 sm:justify-end">
                                            <p className="font-display text-lg font-semibold">INR {Number(payment.amount || 0).toLocaleString('en-IN')}</p>
                                            {payment.status === 'success' && payment.metadata?.receiptNumber ? <button type="button" onClick={() => void downloadReceipt(payment)} disabled={Boolean(downloadingId)} className="rounded-md border border-[#34343b] p-2.5 text-zinc-400 hover:border-[#c5f82a]/50 hover:text-[#c5f82a] disabled:opacity-50" aria-label={`Download receipt for ${payment.title}`}><Download className={`h-4 w-4 ${downloadingId === payment.transactionId ? 'animate-pulse' : ''}`} /></button> : null}
                                            <button type="button" onClick={() => setSelectedPayment(payment)} className="rounded-md p-2 text-zinc-600 hover:text-white" aria-label={`View details for ${payment.title}`}><ChevronRight className="h-4 w-4" /></button>
                                        </div>
                                    </div>
                                </article>
                            ))}</div> : <EmptyState title="No payments yet" body="You'll find your booking and support receipts here after your first payment." action={<Link to="/services" className="mt-5 inline-flex rounded-md bg-[#c5f82a] px-4 py-2.5 text-sm font-semibold text-[#09090a]">Explore services</Link>} />}
                        </div>
                    ) : null}

                    {activeTab === 'sign-ins' ? (
                        activity.signIns.length ? <div className="rounded-lg border border-[#24242a] bg-[#0d0d0f] px-5 sm:px-6">{activity.signIns.map((item) => (
                            <div key={item.id} className="flex items-center gap-4 border-b border-[#202025] py-5 last:border-b-0"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#c5f82a]/25 bg-[#c5f82a]/7 text-[#c5f82a]"><LogIn className="h-4 w-4" /></span><div className="min-w-0 flex-1"><p className="text-sm font-medium text-white">{item.title}</p><p className="mt-1 text-xs text-zinc-600">{formatDateTime(item.timestamp)} / Google</p></div><Status value="success" /></div>
                        ))}</div> : <EmptyState title="No sign-ins found" body="Successful Google sign-ins will appear here as your account history grows." />
                    ) : null}

                    {activeTab === 'activity' ? (
                        activity.all.length ? <div className="rounded-lg border border-[#24242a] bg-[#0d0d0f] px-5 sm:px-6">{activity.all.map(renderActivityRow)}</div> : <EmptyState title="No account activity yet" body="Payments, sign-ins, and supported blog posts will appear here." />
                    ) : null}
                </section>
            </div>

            <ProfileEditorDialog isOpen={isEditingProfile} onClose={() => setIsEditingProfile(false)} openerRef={editButtonRef} />
            <PaymentDetailsDialog payment={selectedPayment} onClose={() => setSelectedPayment(null)} onDownload={downloadReceipt} isDownloading={Boolean(downloadingId)} />
        </main>
    )
}

export default ActivityTimeline

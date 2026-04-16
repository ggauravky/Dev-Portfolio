import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import useSEO from '../hooks/useSEO'
import useAuth from '../hooks/useAuth'
import { fetchMyActivityTimeline } from '../services/activity'
import { fetchMySupports } from '../services/blogSupport'
import {
    fetchServiceReceiptImage,
    fetchServiceReceiptPdf,
    fetchSupportReceiptImage,
    fetchSupportReceiptPdf,
} from '../services/payment'
import { trackEvent } from '../utils/analytics'

const PAYMENT_INTERNAL_ACTIONS = new Set([
    'order_created',
    'reconciliation_started',
    'user_email_sent',
    'admin_email_sent',
    'pdf_generated',
    'receipt_downloaded',
])

const PAYMENT_ACTION_RANK = {
    payment_success: 4,
    payment_failed: 3,
    payment_record: 2,
}

const STATUS_RANK = {
    success: 4,
    pending: 3,
    failed: 2,
    info: 1,
}

const normalizeActivityTab = (value) => {
    const normalized = String(value || '').trim().toLowerCase()

    if (['payments', 'bookings'].includes(normalized)) {
        return 'payments'
    }

    if (['blog-likes', 'supports', 'blog'].includes(normalized)) {
        return 'blog-likes'
    }

    if (['logins', 'login', 'login-activity'].includes(normalized)) {
        return 'logins'
    }

    return 'all'
}

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

const formatDate = (value) => {
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) {
        return 'Not available'
    }

    return parsed.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })
}

const toEventTimestampMs = (entry) => {
    const value = entry?.timestamp || entry?.createdAt || entry?.updatedAt || ''
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime()
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

const getFlowFromPaymentEvent = (event) => {
    const normalizedReceiptKind = String(
        event?.receipt?.kind || event?.receiptKind || event?.type || ''
    )
        .trim()
        .toLowerCase()

    return normalizedReceiptKind === 'support' ? 'support' : 'service'
}

const getPaymentCardTitle = ({ flow, actionType, fallbackTitle }) => {
    const flowLabel = flow === 'support' ? 'Support Contribution' : 'Service Booking'

    if (actionType === 'payment_success') {
        return `${flowLabel} Confirmed`
    }

    if (actionType === 'payment_failed') {
        return `${flowLabel} Failed`
    }

    if (fallbackTitle) {
        return fallbackTitle
    }

    return `${flowLabel} Update`
}

const getEventIcon = (item) => {
    if (item.cardType === 'blog') {
        return '#'
    }

    if (item.cardType === 'login') {
        return '@'
    }

    const normalizedAction = String(item?.actionType || '').trim().toLowerCase()

    if (normalizedAction.includes('success')) {
        return 'OK'
    }

    if (normalizedAction.includes('failed')) {
        return '!'
    }

    return '$'
}

const resolvePaymentStatus = (actionType, fallbackStatus) => {
    if (actionType === 'payment_success') {
        return 'success'
    }

    if (actionType === 'payment_failed') {
        return 'failed'
    }

    return fallbackStatus
}

const getFlowHintLabel = (flow) => {
    if (flow === 'support') {
        return ' (Support)'
    }

    if (flow === 'service') {
        return ' (Service)'
    }

    return ''
}

const getEmptyStateMessage = (tab) => {
    if (tab === 'payments') {
        return 'No payment activity yet. Complete a booking or support contribution to see your payment cards here.'
    }

    if (tab === 'blog-likes') {
        return 'No blog likes yet. Support a blog post and it will appear here.'
    }

    if (tab === 'logins') {
        return 'No login activity found yet.'
    }

    return 'No activity yet. Your latest actions will appear here once available.'
}

const fetchReceiptBlobForTimeline = ({ kind, format, orderId, email }) => {
    if (kind === 'support') {
        if (format === 'pdf') {
            return fetchSupportReceiptPdf(orderId, email)
        }

        return fetchSupportReceiptImage(orderId, email)
    }

    if (format === 'pdf') {
        return fetchServiceReceiptPdf(orderId, email)
    }

    return fetchServiceReceiptImage(orderId, email)
}

const aggregatePaymentCards = (events) => {
    const groupsByOrderId = new Map()

    events.forEach((item) => {
        const domain = String(item?.domain || '').trim().toLowerCase()
        if (domain !== 'payment') {
            return
        }

        const actionType = String(item?.actionType || '').trim().toLowerCase()
        if (PAYMENT_INTERNAL_ACTIONS.has(actionType)) {
            return
        }

        const groupKey = String(
            item?.orderId ||
            item?.receipt?.orderId ||
            item?.transactionId ||
            item?.paymentId ||
            item?.id ||
            ''
        ).trim()

        if (!groupKey) {
            return
        }

        if (!groupsByOrderId.has(groupKey)) {
            groupsByOrderId.set(groupKey, [])
        }

        groupsByOrderId.get(groupKey).push(item)
    })

    const cards = []

    groupsByOrderId.forEach((groupEvents, orderId) => {
        const sorted = [...groupEvents].sort((left, right) => {
            const leftActionRank = PAYMENT_ACTION_RANK[String(left?.actionType || '').trim().toLowerCase()] || 0
            const rightActionRank = PAYMENT_ACTION_RANK[String(right?.actionType || '').trim().toLowerCase()] || 0
            if (rightActionRank !== leftActionRank) {
                return rightActionRank - leftActionRank
            }

            const leftStatusRank = STATUS_RANK[String(left?.status || '').trim().toLowerCase()] || 0
            const rightStatusRank = STATUS_RANK[String(right?.status || '').trim().toLowerCase()] || 0
            if (rightStatusRank !== leftStatusRank) {
                return rightStatusRank - leftStatusRank
            }

            return toEventTimestampMs(right) - toEventTimestampMs(left)
        })

        const representative = sorted[0]
        const flow = getFlowFromPaymentEvent(representative)
        const actionType = String(representative?.actionType || '').trim().toLowerCase()
        const fallbackStatus = String(representative?.status || 'info').trim().toLowerCase()
        const resolvedStatus = resolvePaymentStatus(actionType, fallbackStatus)

        const amountCandidate = sorted.find((entry) => {
            const amount = Number(entry?.amount)
            return Number.isFinite(amount) && amount > 0
        })

        const paymentId = String(
            representative?.paymentId ||
            sorted.find((entry) => String(entry?.paymentId || '').trim())?.paymentId ||
            ''
        ).trim()

        const transactionId = String(
            representative?.transactionId || paymentId || orderId
        ).trim()

        const receiptCarrier = sorted.find(
            (entry) => entry?.receipt?.kind && entry?.receipt?.orderId
        )

        const receiptKind = String(
            receiptCarrier?.receipt?.kind ||
            representative?.receipt?.kind ||
            representative?.receiptKind ||
            flow
        )
            .trim()
            .toLowerCase()

        const receiptOrderId = String(
            receiptCarrier?.receipt?.orderId ||
            representative?.receipt?.orderId ||
            representative?.receiptOrderId ||
            orderId
        ).trim()

        cards.push({
            id: `payment:${orderId}`,
            cardType: 'payment',
            domain: 'payment',
            actionType: actionType || 'payment_record',
            title: getPaymentCardTitle({
                flow,
                actionType,
                fallbackTitle: String(representative?.title || '').trim(),
            }),
            status: resolvedStatus,
            amount: Number(amountCandidate?.amount || 0),
            currency: String(representative?.currency || 'INR').trim(),
            timestamp: representative?.timestamp || representative?.createdAt || representative?.updatedAt,
            orderId,
            paymentId,
            transactionId,
            flow,
            receipt:
                receiptOrderId && receiptKind
                    ? {
                        kind: receiptKind,
                        orderId: receiptOrderId,
                    }
                    : null,
            metadata: {
                eventCount: groupEvents.length,
            },
        })
    })

    return cards.sort((left, right) => toEventTimestampMs(right) - toEventTimestampMs(left))
}

const buildLoginCards = (events) =>
    events
        .filter((item) => String(item?.domain || '').trim().toLowerCase() === 'auth')
        .filter((item) => String(item?.actionType || '').trim().toLowerCase() === 'login_success')
        .map((item) => {
            const isNewUser = Boolean(item?.metadata?.isNewUser)

            return {
                id: `login:${String(item?.id || item?.timestamp || item?.createdAt || Math.random())}`,
                cardType: 'login',
                domain: 'auth',
                actionType: 'login_success',
                title: isNewUser ? 'Google sign-in completed for new account' : 'Google sign-in completed',
                status: 'success',
                timestamp: item?.timestamp || item?.createdAt || item?.updatedAt,
                metadata: item?.metadata || {},
            }
        })
        .sort((left, right) => toEventTimestampMs(right) - toEventTimestampMs(left))

const buildBlogCards = (supports) =>
    (Array.isArray(supports) ? supports : [])
        .map((item, index) => {
            const blogSource = item?.blog || item?.blogSnapshot || {}
            const slug = String(blogSource?.slug || '').trim()
            const title = String(blogSource?.title || 'Supported blog post').trim()

            return {
                id: `blog:${String(item?.id || slug || item?.createdAt || index)}`,
                cardType: 'blog',
                domain: 'blog',
                actionType: 'blog_support_added',
                title: `Supported blog: ${title}`,
                status: 'success',
                timestamp: item?.createdAt || item?.updatedAt,
                metadata: {
                    slug,
                    blogTitle: title,
                    supportCount: Number(blogSource?.supportCount || 0),
                },
            }
        })
        .sort((left, right) => toEventTimestampMs(right) - toEventTimestampMs(left))

// eslint-disable-next-line sonarjs/cognitive-complexity
function ActivityTimeline() {
    const { user, isLoading, isAuthenticated } = useAuth()
    const [searchParams, setSearchParams] = useSearchParams()

    useSEO({
        title: 'My Activity | Gaurav Kumar Yadav',
        description: 'Track payments, blog supports, and sign-in history in one organized activity center.',
        keywords: 'activity, payments, blog supports, login history, receipts',
        ogImage: 'https://ggauravky.vercel.app/images/profile.jpg',
    })

    const [timeline, setTimeline] = useState([])
    const [blogSupports, setBlogSupports] = useState([])
    const [isPageLoading, setIsPageLoading] = useState(true)
    const [pageError, setPageError] = useState('')
    const [downloadingKey, setDownloadingKey] = useState('')

    const activeTab = normalizeActivityTab(searchParams.get('tab'))
    const highlightedOrderId = String(searchParams.get('orderId') || '').trim()
    const flowFromQuery = normalizeFlow(searchParams.get('flow'))
    const lastTrackedActivityViewRef = useRef('')
    const showPaymentSuccessHint =
        String(searchParams.get('source') || '').trim().toLowerCase() === 'payment' &&
        String(searchParams.get('status') || '').trim().toLowerCase() === 'success'

    const transformedCards = useMemo(() => {
        const paymentCards = aggregatePaymentCards(timeline)
        const loginCards = buildLoginCards(timeline)
        const blogCards = buildBlogCards(blogSupports)
        const allCards = [...paymentCards, ...blogCards, ...loginCards].sort(
            (left, right) => toEventTimestampMs(right) - toEventTimestampMs(left)
        )

        return {
            paymentCards,
            loginCards,
            blogCards,
            allCards,
        }
    }, [timeline, blogSupports])

    const hasPendingPayments = useMemo(
        () => transformedCards.paymentCards.some((card) => card.status === 'pending'),
        [transformedCards.paymentCards]
    )

    const tabs = useMemo(
        () => [
            { key: 'all', label: `All Activity (${transformedCards.allCards.length})` },
            { key: 'payments', label: `Payments (${transformedCards.paymentCards.length})` },
            { key: 'blog-likes', label: `Blog Likes (${transformedCards.blogCards.length})` },
            { key: 'logins', label: `Login Activity (${transformedCards.loginCards.length})` },
        ],
        [
            transformedCards.allCards.length,
            transformedCards.blogCards.length,
            transformedCards.loginCards.length,
            transformedCards.paymentCards.length,
        ]
    )

    const cardsForTab = useMemo(() => {
        if (activeTab === 'payments') {
            return transformedCards.paymentCards
        }

        if (activeTab === 'blog-likes') {
            return transformedCards.blogCards
        }

        if (activeTab === 'logins') {
            return transformedCards.loginCards
        }

        return transformedCards.allCards
    }, [activeTab, transformedCards])

    const loadTimeline = async ({ silent = false } = {}) => {
        if (!isAuthenticated) {
            setTimeline([])
            setBlogSupports([])
            setPageError('')
            setIsPageLoading(false)
            return
        }

        if (!silent) {
            setIsPageLoading(true)
        }

        const [timelineResult, supportsResult] = await Promise.allSettled([
            fetchMyActivityTimeline({ limit: 120 }),
            fetchMySupports(),
        ])

        if (timelineResult.status === 'fulfilled') {
            const items = Array.isArray(timelineResult.value?.items) ? timelineResult.value.items : []
            setTimeline(items)
            setPageError('')
        } else {
            const timelineMessage = String(
                timelineResult.reason?.message || 'Unable to load your activity timeline right now.'
            )

            if (!silent) {
                toast.error(timelineMessage)
            }
            setPageError(timelineMessage)
        }

        if (supportsResult.status === 'fulfilled') {
            const supportItems = Array.isArray(supportsResult.value?.items) ? supportsResult.value.items : []
            setBlogSupports(supportItems)
        } else if (!silent) {
            const supportsMessage = String(
                supportsResult.reason?.message || 'Unable to load blog support activity right now.'
            )
            toast.error(supportsMessage)
        }

        setIsPageLoading(false)
    }

    useEffect(() => {
        if (isLoading) {
            return
        }

        void loadTimeline({ silent: false })
    }, [isAuthenticated, isLoading])

    useEffect(() => {
        if (!hasPendingPayments || !isAuthenticated || isLoading) {
            return
        }

        const timerId = setInterval(() => {
            void loadTimeline({ silent: true })
        }, 7000)

        return () => {
            clearInterval(timerId)
        }
    }, [hasPendingPayments, isAuthenticated, isLoading])

    useEffect(() => {
        const currentTab = String(searchParams.get('tab') || '').trim().toLowerCase()
        if (!currentTab) {
            return
        }

        const normalizedTab = normalizeActivityTab(currentTab)
        if (normalizedTab === currentTab) {
            return
        }

        const nextParams = new URLSearchParams(searchParams)
        nextParams.set('tab', normalizedTab)
        setSearchParams(nextParams, { replace: true })
    }, [searchParams, setSearchParams])

    useEffect(() => {
        if (isLoading || !isAuthenticated) {
            return
        }

        const viewKey = `${activeTab}:${highlightedOrderId || 'none'}`
        if (lastTrackedActivityViewRef.current === viewKey) {
            return
        }

        lastTrackedActivityViewRef.current = viewKey

        void trackEvent('activity_page_view', {
            tab: activeTab,
            has_highlighted_order: Boolean(highlightedOrderId),
            flow_hint: flowFromQuery,
        })
    }, [activeTab, flowFromQuery, highlightedOrderId, isAuthenticated, isLoading])

    const updateActiveTab = (nextTab) => {
        const normalizedTab = normalizeActivityTab(nextTab)
        const nextParams = new URLSearchParams(searchParams)

        if (normalizedTab === 'all') {
            nextParams.delete('tab')
        } else {
            nextParams.set('tab', normalizedTab)
        }

        setSearchParams(nextParams, { replace: true })
    }

    const downloadReceipt = async ({ receipt, format }) => {
        const orderId = String(receipt?.orderId || '').trim()
        const kind = String(receipt?.kind || '').trim().toLowerCase()

        if (!orderId || !kind || !user?.email) {
            toast.error('Receipt metadata is incomplete for this payment card.')
            return
        }

        const extension = format === 'pdf' ? 'pdf' : 'svg'
        const key = `${format}:${kind}:${orderId}`
        setDownloadingKey(key)

        try {
            const blob = await fetchReceiptBlobForTimeline({
                kind,
                format,
                orderId,
                email: user.email,
            })

            const prefix = kind === 'support' ? 'support-receipt' : 'service-confirmation'
            saveBlobAsFile(blob, `${prefix}-${orderId}.${extension}`)

            void trackEvent('receipt_download', {
                flow: kind,
                format: extension === 'pdf' ? 'pdf' : 'image',
                order_id: orderId,
                source: 'activity_timeline',
            })

            toast.success(format === 'pdf' ? 'Receipt PDF downloaded' : 'Receipt image downloaded')
        } catch (error) {
            const message = String(error?.message || 'Unable to download receipt')
            toast.error(message)
        } finally {
            setDownloadingKey('')
        }
    }

    const flowHintLabel = getFlowHintLabel(flowFromQuery)
    const emptyStateMessage = getEmptyStateMessage(activeTab)
    const hasCardsForTab = cardsForTab.length > 0

    const getTabButtonClass = (isActive) => {
        if (isActive) {
            return 'border-cyan-400/35 bg-cyan-500/10 text-cyan-200'
        }

        return 'border-transparent bg-slate-800/80 text-slate-300 hover:border-slate-600'
    }

    const renderPaymentCard = (card) => {
        const statusToken = String(card.status || 'info').toLowerCase()
        const showReceiptActions = Boolean(card.receipt?.kind && card.receipt?.orderId)
        const pdfDownloadKey = `pdf:${card.receipt?.kind}:${card.receipt?.orderId}`
        const imageDownloadKey = `image:${card.receipt?.kind}:${card.receipt?.orderId}`
        const isHighlighted = highlightedOrderId && highlightedOrderId === card.orderId
        const flowLabel = card.flow === 'support' ? 'Support Contribution' : 'Service Booking'

        return (
            <article
                key={card.id}
                className={`rounded-2xl border bg-slate-800/65 p-5 ${
                    isHighlighted
                        ? 'border-emerald-400/45 shadow-[0_0_0_1px_rgba(52,211,153,0.25)]'
                        : 'border-slate-700/75'
                }`}
            >
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-600 text-[10px] text-slate-200">
                                {getEventIcon(card)}
                            </span>
                            <p className="text-base sm:text-lg font-semibold text-slate-100">{card.title}</p>
                        </div>
                        <p className="mt-1 text-xs text-slate-400">
                            {flowLabel} • {formatDateTime(card.timestamp)} • {humanizeToken(card.actionType)}
                        </p>
                    </div>
                    <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${getStatusBadgeClass(statusToken)}`}>
                        {statusToken}
                    </span>
                </div>

                <div className="mt-3 grid gap-1 text-sm text-slate-300">
                    {Number.isFinite(Number(card.amount)) && Number(card.amount) > 0 ? (
                        <p><span className="text-slate-400">Amount:</span> INR {Number(card.amount).toLocaleString('en-IN')}</p>
                    ) : null}
                    <p><span className="text-slate-400">Order ID:</span> {card.orderId}</p>
                    {card.paymentId ? <p><span className="text-slate-400">Payment ID:</span> {card.paymentId}</p> : null}
                    {card.transactionId ? <p><span className="text-slate-400">Transaction:</span> {card.transactionId}</p> : null}
                </div>

                {showReceiptActions ? (
                    <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        <button
                            type="button"
                            disabled={downloadingKey === pdfDownloadKey}
                            onClick={() => {
                                void downloadReceipt({ receipt: card.receipt, format: 'pdf' })
                            }}
                            className="rounded-xl border border-emerald-500/35 bg-emerald-500/10 px-4 py-2.5 text-xs font-semibold text-emerald-200 hover:bg-emerald-500/20 disabled:opacity-60 transition-colors"
                        >
                            {downloadingKey === pdfDownloadKey ? 'Downloading PDF...' : 'Download PDF Receipt'}
                        </button>
                        <button
                            type="button"
                            disabled={downloadingKey === imageDownloadKey}
                            onClick={() => {
                                void downloadReceipt({ receipt: card.receipt, format: 'image' })
                            }}
                            className="rounded-xl border border-cyan-500/35 bg-cyan-500/10 px-4 py-2.5 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/20 disabled:opacity-60 transition-colors"
                        >
                            {downloadingKey === imageDownloadKey ? 'Downloading Image...' : 'Download Image Receipt'}
                        </button>

                        {card.transactionId ? (
                            <Link
                                to={`/payment-success/${encodeURIComponent(card.transactionId)}?flow=${card.flow}&orderId=${encodeURIComponent(card.orderId)}`}
                                className="inline-flex items-center justify-center rounded-xl border border-slate-600 px-4 py-2.5 text-xs font-semibold text-slate-100 hover:border-slate-500 transition-colors"
                            >
                                Open Success Page
                            </Link>
                        ) : null}
                    </div>
                ) : null}
            </article>
        )
    }

    const renderBlogCard = (card) => {
        const slug = String(card.metadata?.slug || '').trim()
        const content = (
            <article
                key={card.id}
                className="rounded-2xl border border-slate-700/75 bg-slate-800/65 p-5 hover:border-cyan-500/40 transition-colors"
            >
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-600 text-[10px] text-slate-200">
                                {getEventIcon(card)}
                            </span>
                            <p className="text-base sm:text-lg font-semibold text-slate-100">{card.metadata?.blogTitle}</p>
                        </div>
                        <p className="mt-1 text-xs text-slate-400">Supported on {formatDateTime(card.timestamp)}</p>
                    </div>
                    <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${getStatusBadgeClass(card.status)}`}>
                        supported
                    </span>
                </div>

                <div className="mt-3 text-sm text-slate-300">
                    <p><span className="text-slate-400">Post:</span> {card.metadata?.blogTitle}</p>
                    {Number(card.metadata?.supportCount) > 0 ? (
                        <p><span className="text-slate-400">Supporters:</span> {Number(card.metadata.supportCount).toLocaleString('en-IN')}</p>
                    ) : null}
                </div>
            </article>
        )

        if (!slug) {
            return content
        }

        return (
            <Link key={card.id} to={`/blog/${slug}`} className="block">
                {content}
            </Link>
        )
    }

    const renderLoginCard = (card) => {
        const provider = String(card.metadata?.provider || 'google').toUpperCase()
        const isNewUser = Boolean(card.metadata?.isNewUser)

        return (
            <article key={card.id} className="rounded-2xl border border-slate-700/75 bg-slate-800/65 p-5">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-600 text-[10px] text-slate-200">
                                {getEventIcon(card)}
                            </span>
                            <p className="text-base sm:text-lg font-semibold text-slate-100">{card.title}</p>
                        </div>
                        <p className="mt-1 text-xs text-slate-400">{provider} • {formatDateTime(card.timestamp)}</p>
                    </div>
                    <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${getStatusBadgeClass(card.status)}`}>
                        success
                    </span>
                </div>

                <div className="mt-3 text-sm text-slate-300">
                    <p>{isNewUser ? 'First sign-in for this account.' : 'Returning account sign-in completed.'}</p>
                </div>
            </article>
        )
    }

    const renderCard = (card) => {
        if (card.cardType === 'payment') {
            return renderPaymentCard(card)
        }

        if (card.cardType === 'blog') {
            return renderBlogCard(card)
        }

        return renderLoginCard(card)
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
                        Sign in with your Google account to view your activity history.
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
                        <p className="text-[11px] uppercase tracking-wider text-cyan-300">Activity Center</p>
                        <h1 className="text-3xl sm:text-4xl font-black text-slate-100">My Activity</h1>
                        <p className="mt-2 text-slate-300 text-sm sm:text-base">
                            Payments, blog likes, and sign-in events organized in one clean view.
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

                {showPaymentSuccessHint ? (
                    <div className="mb-4 rounded-xl border border-emerald-500/35 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                        Payment confirmation completed. Your latest transaction is now available under Payments.
                        {highlightedOrderId ? ` Order ID: ${highlightedOrderId}` : ''}
                        {flowHintLabel}
                    </div>
                ) : null}

                {pageError ? (
                    <div className="mb-4 rounded-xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                        {pageError}
                    </div>
                ) : null}

                <div className="mt-6 flex flex-wrap gap-2 rounded-2xl border border-slate-700 bg-slate-800/60 p-2">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.key

                        return (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => updateActiveTab(tab.key)}
                                className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${getTabButtonClass(isActive)}`}
                            >
                                {tab.label}
                            </button>
                        )
                    })}
                </div>

                {hasCardsForTab ? (
                    <div className="mt-8 grid gap-4">{cardsForTab.map((card) => renderCard(card))}</div>
                ) : (
                    <div className="mt-8 rounded-2xl border border-slate-700 bg-slate-800/60 p-6 text-slate-300">
                        {emptyStateMessage}
                    </div>
                )}
            </div>
        </div>
    )
}

const normalizeFlow = (value) => (String(value || '').trim().toLowerCase() === 'support' ? 'support' : 'service')

export default ActivityTimeline

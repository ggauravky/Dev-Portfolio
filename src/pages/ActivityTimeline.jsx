import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import PropTypes from 'prop-types'
import useSEO from '../hooks/useSEO'
import { staticSeo } from '../lib/seo'
import useAuth from '../hooks/useAuth'
import { fetchMyActivityTimeline } from '../services/activity'
import { fetchMySupports } from '../services/blogSupport'
import { fetchPaymentReceipt } from '../services/payment'
import { trackEvent } from '../utils/analytics'
import ProfileEditorDialog from '../components/account/ProfileEditorDialog'
import PaymentDetailsDialog from '../components/account/PaymentDetailsDialog'
import { Button, TextLink } from '../components/ui'
import '../styles/activity.css'

const SEO = staticSeo('/my-activity')

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

const formatAmount = (value) => `INR ${Number(value || 0).toLocaleString('en-IN')}`

const flowLabel = (flow) => (flow === 'support' ? 'Support contribution' : 'Service booking')

function ProfileImage({ user }) {
    const [failed, setFailed] = useState(false)
    useEffect(() => setFailed(false), [user?.picture])
    if (user?.picture && !failed) {
        return <img src={user.picture} alt={`${user.name || 'User'} profile`} onError={() => setFailed(true)} referrerPolicy="no-referrer" className="ac-avatar" />
    }
    return <div aria-label={`${user?.name || 'User'} initials`} className="ac-avatar ac-avatar--initials">{initialsFor(user?.name)}</div>
}

ProfileImage.propTypes = {
    user: PropTypes.shape({ name: PropTypes.string, picture: PropTypes.string }),
}

const Status = ({ value }) => (
    <span className={value === 'failed' ? 'text-red-300' : undefined}>{humanize(value, 'Pending')}</span>
)

Status.propTypes = { value: PropTypes.string }

const ActionButton = ({ children, ...rest }) => (
    <button type="button" className="text-link ac-act" {...rest}>
        <span className="text-link__label">{children}</span>
    </button>
)

ActionButton.propTypes = { children: PropTypes.node.isRequired }

const EmptyState = ({ title, body, action }) => (
    <div className="ac-empty">
        <p className="ac-empty__title">{title}</p>
        <p className="ac-empty__body">{body}</p>
        {action ? <div className="ac-empty__action">{action}</div> : null}
    </div>
)

EmptyState.propTypes = {
    title: PropTypes.string.isRequired,
    body: PropTypes.string.isRequired,
    action: PropTypes.node,
}

const SkeletonRows = ({ count }) => (
    <ul className="pg-rows" aria-hidden="true">
        {Array.from({ length: count }, (_, index) => (
            <li key={index} className="pg-row">
                <span className="ac-skel ac-skel--label" />
                <div>
                    <span className="ac-skel ac-skel--title" />
                    <span className="ac-skel ac-skel--meta" />
                </div>
            </li>
        ))}
    </ul>
)

SkeletonRows.propTypes = { count: PropTypes.number.isRequired }

const LoadingState = () => (
    <main className="pg activity" aria-busy="true">
        <p className="sr-only" role="status">Loading your account</p>
        <div className="ac-pulse">
            <header className="pg-head page-wrap page-grid" aria-hidden="true">
                <p className="page-rail pg-head__rail"><span className="ac-skel ac-skel--label" /></p>
                <div className="page-main">
                    <span className="ac-skel ac-skel--h1" />
                    <span className="ac-skel ac-skel--lede" />
                </div>
            </header>
            <section className="pg-section">
                <div className="page-wrap page-grid">
                    <p className="page-rail" aria-hidden="true" />
                    <div className="page-main"><SkeletonRows count={5} /></div>
                </div>
            </section>
        </div>
    </main>
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
    const panelId = useId()
    const filterName = useId()

    const activeTab = normalizeTab(searchParams.get('tab'))

    useSEO({
        ...SEO,
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
            <main className="pg activity">
                <header className="pg-head page-wrap page-grid">
                    <p className="page-rail pg-head__rail"><span>Account</span></p>
                    <div className="page-main">
                        <h1 className="pg-h1">Your private account area</h1>
                        <p className="pg-lede">Sign in with Google to manage your profile and view payments, receipts, and account activity.</p>
                        <div className="pg-actions">
                            <Button onClick={() => openAuthDialog({ reason: 'activity' })}>Sign in with Google</Button>
                        </div>
                    </div>
                </header>
            </main>
        )
    }

    const tabs = [
        { key: 'overview', label: 'Overview', count: null },
        { key: 'payments', label: 'Payments', count: activity.payments.length },
        { key: 'sign-ins', label: 'Sign-ins', count: activity.signIns.length },
        { key: 'activity', label: 'Activity', count: activity.all.length },
    ]

    const paymentFilters = [
        { key: 'all', label: 'All', count: activity.payments.length },
        { key: 'success', label: 'Success', count: activity.payments.filter((payment) => payment.status === 'success').length },
        { key: 'failed', label: 'Failed', count: activity.payments.filter((payment) => payment.status === 'failed').length },
    ]

    const kindFor = (item) => {
        if (item.cardType === 'payment') return flowLabel(item.flow)
        if (item.cardType === 'login') return 'Google sign-in'
        return 'Blog support'
    }

    const renderActivityRow = (item) => (
        <li key={item.id} className="pg-row">
            <p className="pg-row__label">{formatDateTime(item.timestamp)}</p>
            <div className="pg-row__body">
                <p className="ac-row__title">{item.title}</p>
                <p className="ac-row__meta">{kindFor(item)} · <Status value={item.status || 'success'} /></p>
            </div>
        </li>
    )

    return (
        <main className="pg activity">
            <header className="pg-head page-wrap page-grid">
                <p className="page-rail pg-head__rail"><span>Account</span><span>Google account</span></p>
                <div className="page-main">
                    <h1 className="pg-h1 break-words">{user.name}</h1>
                    <p className="pg-lede">{user.bio || 'Add a short bio so your account feels like yours.'}</p>
                    <div className="ac-id">
                        <ProfileImage user={user} />
                        <dl className="ac-facts">
                            <div className="ac-fact"><dt>Email</dt><dd>{user.email}</dd></div>
                            {user.location ? <div className="ac-fact"><dt>Location</dt><dd>{user.location}</dd></div> : null}
                            {user.website ? <div className="ac-fact"><dt>Website</dt><dd><TextLink href={user.website} external>Website</TextLink></dd></div> : null}
                            <div className="ac-fact"><dt>Member since</dt><dd>{formatDate(user.createdAt)}</dd></div>
                            <div className="ac-fact"><dt>Last sign-in</dt><dd>{formatDateTime(user.lastLoginAt)}</dd></div>
                        </dl>
                        <Button ref={editButtonRef} variant="secondary" onClick={() => setIsEditingProfile(true)}>Edit profile</Button>
                    </div>
                </div>
            </header>

            <section aria-label="Account summary" className="page-wrap page-grid">
                <p className="page-rail" aria-hidden="true">Summary</p>
                <dl className="page-main ac-stats">
                    {[
                        ['Payments', stats.payments],
                        ['Receipts', stats.receipts],
                        ['Support total', formatAmount(stats.support)],
                        ['Sign-ins', stats.signIns],
                    ].map(([label, value]) => (
                        <div key={label} className="ac-stat"><dt>{label}</dt><dd>{value}</dd></div>
                    ))}
                </dl>
            </section>

            <section className="pg-section" aria-label="Account history">
                <div className="page-wrap page-grid">
                    <p className="page-rail" aria-hidden="true">History</p>
                    <div className="page-main">
                        <div className="ac-bar">
                            <div className="ac-tabs" role="tablist" aria-label="Account sections">
                                {tabs.map(({ key, label, count }) => (
                                    <button
                                        key={key}
                                        id={`${panelId}-tab-${key}`}
                                        type="button"
                                        role="tab"
                                        aria-selected={activeTab === key}
                                        aria-controls={panelId}
                                        onClick={() => setTab(key)}
                                        className="ac-tab"
                                    >
                                        <span className="ac-tab__text">{label}</span>
                                        {count === null ? null : <span className="ac-tab__count">{count}</span>}
                                    </button>
                                ))}
                            </div>
                            <ActionButton onClick={() => void loadData()} aria-label="Refresh account activity">Refresh</ActionButton>
                        </div>

                        <div className="mt-6">
                            {pageError ? <p role="alert" className="ac-alert border-red-400/40 text-red-300">{pageError}</p> : null}

                            <div role="tabpanel" id={panelId} aria-labelledby={`${panelId}-tab-${activeTab}`}>
                                {activeTab === 'overview' ? (
                                    <>
                                        <div className="ac-block">
                                            <div className="ac-block__head">
                                                <h2 className="ac-h3">Latest activity</h2>
                                                {activity.all.length ? <ActionButton onClick={() => setTab('activity')}>View all</ActionButton> : null}
                                            </div>
                                            {activity.all.length
                                                ? <ul className="pg-rows">{activity.all.slice(0, 5).map(renderActivityRow)}</ul>
                                                : <EmptyState title="No activity yet" body="Your latest payments, sign-ins, and blog activity will appear here." />}
                                        </div>

                                        <div className="ac-block">
                                            <div className="ac-block__head"><h2 className="ac-h3">Supported posts</h2></div>
                                            {activity.blogs.length ? (
                                                <ul className="pg-rows">
                                                    {activity.blogs.map((item) => (
                                                        <li key={item.id} className="pg-row">
                                                            <p className="pg-row__label">{formatDate(item.timestamp)}</p>
                                                            <div className="pg-row__body">
                                                                {item.metadata?.slug
                                                                    ? <TextLink to={`/blog/${item.metadata.slug}`} className="ac-row__title">{item.title}</TextLink>
                                                                    : <p className="ac-row__title">{item.title}</p>}
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <EmptyState
                                                    title="No supported posts yet"
                                                    body="Blog posts you support will appear here."
                                                    action={<TextLink to="/blog">Read the blog</TextLink>}
                                                />
                                            )}
                                        </div>

                                        <div className="ac-block">
                                            <div className="ac-block__head"><h2 className="ac-h3">Quick actions</h2></div>
                                            <ul className="ac-links">
                                                <li><TextLink to="/services">Explore services</TextLink></li>
                                                <li><ActionButton onClick={() => setTab('payments')}>View receipts</ActionButton></li>
                                                <li><TextLink to="/contact">Payment help</TextLink></li>
                                            </ul>
                                        </div>
                                    </>
                                ) : null}

                                {activeTab === 'payments' ? (
                                    <div>
                                        <fieldset className="pj-seg ac-filter">
                                            <legend className="pj-seg__legend">Status</legend>
                                            <div className="pj-seg__options">
                                                {paymentFilters.map(({ key, label, count }) => (
                                                    <label key={key} className="pj-seg__option">
                                                        <input
                                                            type="radio"
                                                            name={filterName}
                                                            value={key}
                                                            checked={paymentFilter === key}
                                                            onChange={() => setPaymentFilter(key)}
                                                        />
                                                        <span>{label} <span className="pj-seg__count">{count}</span></span>
                                                    </label>
                                                ))}
                                            </div>
                                        </fieldset>
                                        {visiblePayments.length ? (
                                            <ul className="pg-rows">
                                                {visiblePayments.map((payment) => (
                                                    <li key={payment.id} className="pg-row">
                                                        <p className="pg-row__label">{formatDateTime(payment.timestamp)}</p>
                                                        <div className="pg-row__body">
                                                            <button type="button" onClick={() => setSelectedPayment(payment)} className="ac-row__open">
                                                                <span className="ac-row__title block">{payment.title}</span>
                                                                <span className="ac-row__meta block">{flowLabel(payment.flow)} · <Status value={payment.status} /></span>
                                                            </button>
                                                            <div className="ac-row__side">
                                                                <span className="ac-amount">{formatAmount(payment.amount)}</span>
                                                                {payment.status === 'success' && payment.metadata?.receiptNumber ? (
                                                                    <ActionButton onClick={() => void downloadReceipt(payment)} disabled={Boolean(downloadingId)} aria-label={`Download receipt for ${payment.title}`}>
                                                                        {downloadingId === payment.transactionId ? 'Preparing receipt...' : 'Download receipt'}
                                                                    </ActionButton>
                                                                ) : null}
                                                                <ActionButton onClick={() => setSelectedPayment(payment)} aria-label={`View details for ${payment.title}`}>Details</ActionButton>
                                                            </div>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : paymentFilter === 'all' ? (
                                            <EmptyState
                                                title="No payments yet"
                                                body="You'll find your booking and support receipts here after your first payment."
                                                action={<TextLink to="/services">Explore services</TextLink>}
                                            />
                                        ) : (
                                            <EmptyState title={`No ${paymentFilter} payments`} body="Choose All to see every payment on your account." />
                                        )}
                                    </div>
                                ) : null}

                                {activeTab === 'sign-ins' ? (
                                    activity.signIns.length ? (
                                        <ul className="pg-rows">
                                            {activity.signIns.map((item) => (
                                                <li key={item.id} className="pg-row">
                                                    <p className="pg-row__label">{formatDateTime(item.timestamp)}</p>
                                                    <div className="pg-row__body">
                                                        <p className="ac-row__title">{item.title}</p>
                                                        <p className="ac-row__meta">Google · <Status value="success" /></p>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : <EmptyState title="No sign-ins found" body="Successful Google sign-ins will appear here as your account history grows." />
                                ) : null}

                                {activeTab === 'activity' ? (
                                    activity.all.length
                                        ? <ul className="pg-rows">{activity.all.map(renderActivityRow)}</ul>
                                        : <EmptyState title="No account activity yet" body="Payments, sign-ins, and supported blog posts will appear here." />
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <ProfileEditorDialog isOpen={isEditingProfile} onClose={() => setIsEditingProfile(false)} openerRef={editButtonRef} />
            <PaymentDetailsDialog payment={selectedPayment} onClose={() => setSelectedPayment(null)} onDownload={downloadReceipt} isDownloading={Boolean(downloadingId)} />
        </main>
    )
}

export default ActivityTimeline

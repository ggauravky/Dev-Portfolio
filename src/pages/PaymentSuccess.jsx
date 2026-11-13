import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import useAuth from '../hooks/useAuth'
import useSEO from '../hooks/useSEO'
import { staticSeo } from '../lib/seo'
import { fetchPaymentReceipt, fetchPaymentTransaction } from '../services/payment'
import { trackEvent } from '../utils/analytics'
import PageHead from '../components/page/PageHead'
import PageSection from '../components/page/PageSection'
import { Button, TextLink } from '../components/ui'
import '../styles/checkout.css'

const SEO = staticSeo('/payment-success')

const formatDate = (value) => {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return 'Not available'
    return date.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function PaymentSuccess() {
    const { transactionId = '' } = useParams()
    const { isAuthenticated, isLoading } = useAuth()
    const [transaction, setTransaction] = useState(null)
    const [pageError, setPageError] = useState('')
    const [isFetching, setIsFetching] = useState(true)
    const [isDownloading, setIsDownloading] = useState(false)
    const isSupport = transaction?.flowType === 'support'

    useSEO({
        ...SEO,
    })

    useEffect(() => {
        if (isLoading) return
        if (!isAuthenticated) {
            setPageError('Please sign in with the account used for this payment.')
            setIsFetching(false)
            return
        }

        let cancelled = false
        setIsFetching(true)
        fetchPaymentTransaction(transactionId)
            .then((data) => {
                if (cancelled) return
                setTransaction(data)
                setPageError('')
                if (data.status === 'paid') {
                    void trackEvent('payment_success', { transaction_id: data.transactionId, service_slug: data.serviceSlug, flow_type: data.flowType })
                }
            })
            .catch((error) => {
                if (!cancelled) setPageError(error?.message || 'Unable to load this payment')
            })
            .finally(() => {
                if (!cancelled) setIsFetching(false)
            })
        return () => { cancelled = true }
    }, [isAuthenticated, isLoading, transactionId])

    const downloadReceipt = async () => {
        if (!transaction?.transactionId || isDownloading) return
        setIsDownloading(true)
        try {
            const blob = await fetchPaymentReceipt(transaction.transactionId)
            const url = URL.createObjectURL(blob)
            const anchor = document.createElement('a')
            anchor.href = url
            anchor.download = `payment-receipt-${transaction.receiptNumber}.pdf`
            document.body.appendChild(anchor)
            anchor.click()
            anchor.remove()
            URL.revokeObjectURL(url)
            void trackEvent('receipt_downloaded', { transaction_id: transaction.transactionId })
            toast.success('Receipt downloaded')
        } catch (error) {
            toast.error(error?.message || 'Unable to download receipt')
        } finally {
            setIsDownloading(false)
        }
    }

    if (isLoading || isFetching) {
        return (
            <main className="pg checkout">
                <div className="pg-head page-wrap page-grid ck-loading">
                    <p className="page-rail" role="status">Loading payment...</p>
                </div>
            </main>
        )
    }

    if (pageError || !transaction) {
        return (
            <main className="pg checkout">
                <PageHead head={{ rail: ['Payment'], title: 'Payment details unavailable', lede: pageError || 'This transaction could not be found.' }}>
                    <div className="pg-actions">
                        <Button to="/services" arrow>Back to services</Button>
                    </div>
                </PageHead>
            </main>
        )
    }

    const isPaid = transaction.status === 'paid'
    const isFailed = transaction.status === 'failed'
    const backTo = isSupport ? '/' : '/services'
    const backLabel = isSupport ? 'Back home' : 'Back to services'

    const title = isPaid ? (isSupport ? 'Thanks for the support.' : 'Payment confirmed.') : isFailed ? 'Payment failed.' : 'Payment pending.'
    const lede = isPaid
        ? isSupport
            ? transaction.receiptEmailSent
                ? `Thank you for your support. A receipt has been sent to ${transaction.email}.`
                : 'Thank you for your support. The receipt is ready to download below; email delivery may still be pending.'
            : transaction.receiptEmailSent
                ? `Your booking is confirmed. A receipt has been sent to ${transaction.email}.`
                : 'Your booking is confirmed. The receipt is ready to download below; email delivery may still be pending.'
        : isFailed
            ? isSupport
                ? 'This support payment was not confirmed. You can return home or try again from the support page.'
                : 'This booking was not confirmed. You can return to services and start a fresh checkout.'
            : 'Razorpay has not confirmed a captured payment yet. Check My Activity shortly.'

    const rows = [
        [isSupport ? 'Type' : 'Service', isSupport ? 'Support Contribution' : transaction.serviceName],
        ['Amount', `INR ${Number(transaction.amount).toLocaleString('en-IN')}`],
        ['Receipt', transaction.receiptNumber || 'Pending'],
        ['Payment ID', transaction.razorpayPaymentId || 'Pending'],
        ['Date', formatDate(transaction.paidAt || transaction.createdAt)],
        ['Provider', 'Razorpay'],
    ]

    return (
        <main className="pg checkout">
            <PageHead head={{ rail: ['Payment', 'Server-verified'], title, lede }}>
                <div className="pg-actions">
                    {isPaid ? (
                        <Button onClick={downloadReceipt} disabled={isDownloading} loading={isDownloading}>
                            {isDownloading ? 'Preparing...' : 'Download receipt'}
                        </Button>
                    ) : null}
                    <Button variant="secondary" to="/my-activity?tab=payments">View My Activity</Button>
                    <TextLink to={backTo} tone="muted">{backLabel}</TextLink>
                </div>
            </PageHead>

            <PageSection id="details" index={1} title="Details">
                <ul className="pg-rows">
                    {rows.map(([label, value]) => (
                        <li key={label} className="pg-row">
                            <p className="pg-row__label">{label}</p>
                            <p className="pg-row__body ck-break">{value}</p>
                        </li>
                    ))}
                </ul>
            </PageSection>
        </main>
    )
}

export default PaymentSuccess

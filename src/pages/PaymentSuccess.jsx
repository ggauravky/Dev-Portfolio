import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CheckCircle2, Download, ReceiptText } from 'lucide-react'
import toast from 'react-hot-toast'
import useAuth from '../hooks/useAuth'
import useSEO from '../hooks/useSEO'
import { fetchPaymentReceipt, fetchPaymentTransaction } from '../services/payment'
import { trackEvent } from '../utils/analytics'

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
        title: `${isSupport ? 'Support ' : ''}Payment Status | Gaurav Kumar Yadav`,
        description: isSupport
            ? 'View an authenticated support payment status and download its receipt.'
            : 'View an authenticated booking payment status and download its receipt.',
        keywords: `payment status, ${isSupport ? 'support' : 'booking'} receipt, Razorpay payment`,
        ogImage: 'https://ggauravky.vercel.app/images/profile.jpg',
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
        return <div className="min-h-screen bg-obsidian flex items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-2 border-toxic border-t-transparent" /></div>
    }

    if (pageError || !transaction) {
        return (
            <div className="min-h-screen bg-obsidian px-4 py-16 flex items-center justify-center">
                <div className="w-full max-w-xl rounded-lg border border-obsidian-border bg-obsidian-card p-8 text-center">
                    <h1 className="text-3xl font-display font-bold text-white">Payment Details Unavailable</h1>
                    <p className="mt-3 text-sm text-zinc-400">{pageError || 'This transaction could not be found.'}</p>
                    <Link to="/services" className="mt-6 inline-flex rounded-md bg-toxic px-5 py-3 text-xs font-mono font-bold uppercase text-obsidian">Back to Services</Link>
                </div>
            </div>
        )
    }

    const isPaid = transaction.status === 'paid'
    const isFailed = transaction.status === 'failed'

    return (
        <div className="min-h-screen bg-obsidian relative overflow-hidden">
            <div className="absolute -top-24 right-0 h-80 w-80 rounded-full bg-toxic/5 blur-3xl" />
            <main className="relative z-10 mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-18 lg:px-8">
                <Link to={isSupport ? '/' : '/services'} className="text-xs font-mono uppercase tracking-wider text-zinc-400 hover:text-toxic">&larr; {isSupport ? 'Back Home' : 'Back to Services'}</Link>
                <section className="mt-7 rounded-lg border border-obsidian-border bg-obsidian-card p-6 sm:p-9">
                    <div className={`inline-flex h-14 w-14 items-center justify-center rounded-full border ${isPaid ? 'border-toxic/40 bg-toxic/10 text-toxic' : isFailed ? 'border-rose-500/40 bg-rose-500/10 text-rose-300' : 'border-amber-500/40 bg-amber-500/10 text-amber-300'}`}>
                        {isPaid ? <CheckCircle2 className="h-7 w-7" /> : <ReceiptText className="h-7 w-7" />}
                    </div>
                    <p className="mt-5 text-[10px] font-mono uppercase tracking-widest text-toxic">Server-Verified Payment</p>
                    <h1 className="mt-2 text-3xl font-display font-bold text-white sm:text-4xl">{isPaid ? (isSupport ? 'Thanks for the support.' : 'Payment confirmed.') : isFailed ? 'Payment Failed' : 'Payment Pending'}</h1>
                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">
                        {isPaid
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
                                : 'Razorpay has not confirmed a captured payment yet. Check My Activity shortly.'}
                    </p>

                    <div className="mt-7 grid gap-3 rounded-md border border-obsidian-border bg-obsidian p-5 text-sm sm:grid-cols-2">
                        <p><span className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500">{isSupport ? 'Type' : 'Service'}</span><span className="text-white">{isSupport ? 'Support Contribution' : transaction.serviceName}</span></p>
                        <p><span className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500">Amount</span><span className="text-white">INR {Number(transaction.amount).toLocaleString('en-IN')}</span></p>
                        <p><span className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500">Receipt</span><span className="break-all text-white">{transaction.receiptNumber || 'Pending'}</span></p>
                        <p><span className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500">Payment ID</span><span className="break-all text-white">{transaction.razorpayPaymentId || 'Pending'}</span></p>
                        <p><span className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500">Date</span><span className="text-white">{formatDate(transaction.paidAt || transaction.createdAt)}</span></p>
                        <p><span className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500">Provider</span><span className="text-white">Razorpay</span></p>
                    </div>

                    <div className="mt-7 flex flex-wrap gap-3">
                        {isPaid ? <button type="button" onClick={downloadReceipt} disabled={isDownloading} className="inline-flex items-center gap-2 rounded-md bg-toxic px-5 py-3 text-xs font-mono font-bold uppercase text-obsidian disabled:opacity-60"><Download className="h-4 w-4" />{isDownloading ? 'Preparing...' : 'Download Receipt'}</button> : null}
                        <Link to="/my-activity?tab=payments" className="rounded-md border border-obsidian-border px-5 py-3 text-xs font-mono font-bold uppercase text-white hover:border-toxic/40 hover:text-toxic">View My Activity</Link>
                        <Link to={isSupport ? '/' : '/services'} className="rounded-md border border-obsidian-border px-5 py-3 text-xs font-mono font-bold uppercase text-zinc-400 hover:text-white">{isSupport ? 'Back Home' : 'Back to Services'}</Link>
                    </div>
                </section>
            </main>
        </div>
    )
}

export default PaymentSuccess

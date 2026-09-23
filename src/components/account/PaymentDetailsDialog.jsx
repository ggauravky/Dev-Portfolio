import { useEffect, useId, useRef } from 'react'
import PropTypes from 'prop-types'
import { Download, Loader2, X } from 'lucide-react'

const Detail = ({ label, value }) => value ? (
    <div className="grid gap-1 border-b border-[#232329] py-3 sm:grid-cols-[140px_1fr] sm:gap-4">
        <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600">{label}</dt>
        <dd className="break-all text-sm text-zinc-200">{value}</dd>
    </div>
) : null

Detail.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
}

Detail.defaultProps = { value: '' }

export default function PaymentDetailsDialog({ payment, onClose, onDownload, isDownloading }) {
    const titleId = useId()
    const closeRef = useRef(null)

    useEffect(() => {
        if (!payment) return undefined
        closeRef.current?.focus()
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [onClose, payment])

    if (!payment) return null
    const successful = payment.status === 'success'

    return (
        <div className="fixed inset-0 z-[115] flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-5" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
            <div role="dialog" aria-modal="true" aria-labelledby={titleId} className="w-full rounded-t-2xl border border-[#2a2a31] bg-[#0d0d0f] p-5 shadow-2xl shadow-black/70 sm:max-w-xl sm:rounded-xl sm:p-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <span className={`inline-flex rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider ${successful ? 'border-[#c5f82a]/30 bg-[#c5f82a]/10 text-[#c5f82a]' : 'border-rose-500/30 bg-rose-500/10 text-rose-300'}`}>{payment.status}</span>
                        <h2 id={titleId} className="mt-3 font-display text-xl font-semibold text-white">{payment.title}</h2>
                    </div>
                    <button ref={closeRef} type="button" onClick={onClose} className="rounded-md border border-[#2a2a31] p-2 text-zinc-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#c5f82a]" aria-label="Close payment details"><X className="h-4 w-4" /></button>
                </div>
                <dl className="mt-5 border-t border-[#232329]">
                    <Detail label="Amount" value={Number(payment.amount) > 0 ? `INR ${Number(payment.amount).toLocaleString('en-IN')}` : ''} />
                    <Detail label="Type" value={payment.flow === 'support' ? 'Support Contribution' : 'Service Booking'} />
                    <Detail label="Receipt" value={payment.metadata?.receiptNumber} />
                    <Detail label="Order ID" value={payment.orderId} />
                    <Detail label="Payment ID" value={payment.paymentId} />
                    <Detail label="Transaction" value={payment.transactionId} />
                </dl>
                {successful && payment.metadata?.receiptNumber ? (
                    <button type="button" onClick={() => onDownload(payment)} disabled={isDownloading} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#c5f82a] px-4 py-3 text-sm font-semibold text-[#09090a] hover:bg-[#d4ff50] disabled:opacity-60">
                        {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                        {isDownloading ? 'Preparing receipt...' : 'Download receipt'}
                    </button>
                ) : null}
            </div>
        </div>
    )
}

PaymentDetailsDialog.propTypes = {
    payment: PropTypes.shape({
        amount: PropTypes.number,
        flow: PropTypes.string,
        metadata: PropTypes.object,
        orderId: PropTypes.string,
        paymentId: PropTypes.string,
        status: PropTypes.string,
        title: PropTypes.string,
        transactionId: PropTypes.string,
    }),
    onClose: PropTypes.func.isRequired,
    onDownload: PropTypes.func.isRequired,
    isDownloading: PropTypes.bool.isRequired,
}

PaymentDetailsDialog.defaultProps = { payment: null }

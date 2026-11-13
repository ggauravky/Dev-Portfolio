import { useId, useRef } from 'react'
import PropTypes from 'prop-types'
import { X } from 'lucide-react'
import { Button } from '../ui'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import '../../styles/activity.css'

const Detail = ({ label, value }) => value ? (
    <div className="ac-dl__row">
        <dt>{label}</dt>
        <dd>{value}</dd>
    </div>
) : null

Detail.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
}

Detail.defaultProps = { value: '' }

export default function PaymentDetailsDialog({ payment, onClose, onDownload, isDownloading }) {
    const titleId = useId()
    const dialogRef = useRef(null)
    const closeRef = useRef(null)

    useFocusTrap(dialogRef, Boolean(payment), {
        onEscape: onClose,
        initialFocusRef: closeRef,
    })

    if (!payment) return null
    const successful = payment.status === 'success'
    const status = String(payment.status || 'pending')

    return (
        <div className="fixed inset-0 z-[115] flex items-end justify-center overflow-y-auto bg-ink/80 sm:items-center sm:px-4 sm:py-6" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
            <section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} className="relative w-full rounded-t-dialog border border-rule bg-ink-raised p-6 shadow-dialog sm:max-w-xl sm:rounded-dialog sm:p-8">
                <button ref={closeRef} type="button" onClick={onClose} className="absolute right-2 top-2 inline-flex h-11 w-11 items-center justify-center rounded-control text-muted hover:bg-paper/[0.06] hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent" aria-label="Close payment details">
                    <X className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
                </button>
                <p className={`pr-12 font-mono text-[13px] ${status === 'failed' ? 'text-red-300' : 'text-muted'}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</p>
                <h2 id={titleId} className="mt-1 pr-12 font-serif text-h3 text-paper">{payment.title}</h2>
                <dl className="ac-dl">
                    <Detail label="Amount" value={Number(payment.amount) > 0 ? `INR ${Number(payment.amount).toLocaleString('en-IN')}` : ''} />
                    <Detail label="Type" value={payment.flow === 'support' ? 'Support contribution' : 'Service booking'} />
                    <Detail label="Receipt" value={payment.metadata?.receiptNumber} />
                    <Detail label="Order ID" value={payment.orderId} />
                    <Detail label="Payment ID" value={payment.paymentId} />
                    <Detail label="Transaction" value={payment.transactionId} />
                </dl>
                {successful && payment.metadata?.receiptNumber ? (
                    <Button onClick={() => onDownload(payment)} disabled={isDownloading} loading={isDownloading} className="mt-6 w-full">
                        {isDownloading ? 'Preparing receipt...' : 'Download receipt'}
                    </Button>
                ) : null}
            </section>
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

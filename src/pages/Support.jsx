import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import useAuth from '../hooks/useAuth'
import useSEO from '../hooks/useSEO'
import {
    createSupportPaymentOrder,
    openRazorpayCheckout,
    recordPaymentFailure,
    verifyPayment,
} from '../services/payment'
import { trackEvent } from '../utils/analytics'
import PageHead from '../components/page/PageHead'
import PageSection from '../components/page/PageSection'
import { Button, Input, Textarea, TextLink } from '../components/ui'
import '../styles/checkout.css'

const SUPPORT_MIN_AMOUNT_INR = 5
const SUPPORT_MAX_AMOUNT_INR = 100000
const QUICK_AMOUNTS = [5, 49, 99, 199, 499, 999]
const HEAD = {
    rail: ['Support my work', 'From ₹5'],
    title: 'Help me keep building',
    lede: 'If my projects, articles, or resources have helped you, you can support the time and care that goes into creating them.',
}

function Support() {
    const navigate = useNavigate()
    const { user, isAuthenticated, isLoading, openAuthDialog, refreshSession } = useAuth()
    const checkoutLock = useRef(false)
    const [form, setForm] = useState({ name: '', phone: '', message: '', amount: '199' })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [paymentMessage, setPaymentMessage] = useState('')

    useSEO({
        title: 'Support My Work | Gaurav Kumar Yadav',
        description: 'Support Gaurav Kumar Yadav through secure Razorpay checkout with server verification and a downloadable payment receipt.',
        keywords: 'support Gaurav Kumar Yadav, Razorpay support payment, developer portfolio support',
        ogImage: 'https://ggauravky.vercel.app/images/profile.jpg',
    })

    useEffect(() => {
        if (!user) return
        setForm((previous) => ({
            ...previous,
            name: previous.name || user.displayName || user.name || '',
        }))
    }, [user])

    const updateField = (event) => {
        const { name, value } = event.target
        setPaymentMessage('')
        setForm((previous) => ({
            ...previous,
            [name]: ['phone', 'amount'].includes(name)
                ? value.replaceAll(/\D/g, '').slice(0, name === 'phone' ? 10 : 6)
                : value,
        }))
    }

    const validateForm = () => {
        const amount = Number(form.amount)
        if (form.name.trim().length < 2) throw new Error('Please enter your name')
        if (!/^[6-9]\d{9}$/.test(form.phone)) throw new Error('Please enter a valid 10-digit Indian mobile number')
        if (!Number.isSafeInteger(amount) || amount < SUPPORT_MIN_AMOUNT_INR) {
            throw new Error('Minimum support amount is ₹5.')
        }
        if (amount > SUPPORT_MAX_AMOUNT_INR) throw new Error('Maximum support amount is ₹1,00,000.')
        return amount
    }

    const startCheckout = async (authenticatedUser = user) => {
        if (checkoutLock.current) return
        checkoutLock.current = true
        setIsSubmitting(true)
        setPaymentMessage('')
        let transactionId = ''

        try {
            const amount = validateForm()
            const refreshedUser = await refreshSession()
            if (!refreshedUser?.email && !authenticatedUser?.email) {
                throw new Error('Please sign in again before checkout')
            }

            const order = await createSupportPaymentOrder({
                name: form.name.trim(),
                phone: form.phone,
                message: form.message.trim(),
                amount,
            })
            transactionId = order.transactionId
            void trackEvent('support_checkout_started', { transaction_id: transactionId, amount: order.amount })

            const checkout = await openRazorpayCheckout({ order })
            if (checkout.type === 'dismissed') {
                setPaymentMessage('Checkout closed. No support payment was confirmed.')
                return
            }
            if (checkout.type === 'failed') {
                const code = String(checkout.response?.code || '').slice(0, 80)
                const reason = String(checkout.response?.reason || checkout.response?.description || '').slice(0, 200)
                await recordPaymentFailure({ transactionId, code, reason }).catch(() => undefined)
                void trackEvent('support_payment_failed', { transaction_id: transactionId })
                throw new Error('Payment could not be completed. No successful contribution was recorded.')
            }

            const verified = await verifyPayment({ transactionId, ...checkout.response })
            if (verified.status !== 'paid') {
                setPaymentMessage('Payment is still being confirmed. Please check My Activity shortly.')
                return
            }

            void trackEvent('support_payment_verified', { transaction_id: transactionId, amount: verified.amount })
            toast.success('Support payment verified')
            navigate(`/payment-success/${encodeURIComponent(transactionId)}`)
        } catch (error) {
            const message = error?.code === 'PAYMENT_GATEWAY_AUTH_FAILED'
                ? 'Payment gateway is temporarily unavailable. Please try again shortly.'
                : error?.message || 'Unable to start secure checkout'
            setPaymentMessage(message)
            toast.error(message)
        } finally {
            checkoutLock.current = false
            setIsSubmitting(false)
        }
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        if (checkoutLock.current || isLoading) return
        try {
            validateForm()
        } catch (error) {
            setPaymentMessage(error.message)
            return
        }

        if (!isAuthenticated || !user?.email) {
            openAuthDialog({
                reason: 'checkout',
                onSuccess: (authenticatedUser) => startCheckout(authenticatedUser),
            })
            return
        }
        await startCheckout(user)
    }

    const checkoutLabel = isLoading
        ? 'Checking Sign-In...'
        : !isAuthenticated
            ? 'Sign In to Continue'
            : isSubmitting
                ? 'Starting Secure Checkout...'
                : `Support with INR ${Number(form.amount || 0).toLocaleString('en-IN')}`

    return (
        <main className="pg checkout">
            <PageHead head={HEAD}>
                <div className="pg-actions">
                    <TextLink to="/" tone="muted">Back home</TextLink>
                </div>
            </PageHead>

            <PageSection
                id="contribute"
                index={1}
                title="Contribute"
                intro="Your contribution supports new portfolio projects, technical writing, and practical learning resources."
            >
                {paymentMessage ? <p className="ck-message" role="status">{paymentMessage}</p> : null}

                <form onSubmit={handleSubmit} className="ck-form">
                    <fieldset className="pj-seg ck-amounts">
                        <legend className="pj-seg__legend">Amount</legend>
                        <div className="pj-seg__options">
                            {QUICK_AMOUNTS.map((amount) => (
                                <label key={amount} className="pj-seg__option">
                                    <input
                                        type="radio"
                                        name="support-quick-amount"
                                        value={amount}
                                        checked={Number(form.amount) === amount}
                                        onChange={() => setForm((previous) => ({ ...previous, amount: String(amount) }))}
                                    />
                                    <span>INR {amount}</span>
                                </label>
                            ))}
                        </div>
                    </fieldset>

                    <div className="ck-pair">
                        <Input id="support-amount" label="Custom amount" name="amount" value={form.amount} onChange={updateField} inputMode="numeric" min="5" max="100000" placeholder="₹5 or more" required hint="Whole rupees, ₹5 to ₹1,00,000" />
                        <Input label="Account email" value={user?.email || 'Sign in to continue'} readOnly aria-label="Account email" />
                    </div>

                    <div className="ck-pair">
                        <Input label="Name" name="name" value={form.name} onChange={updateField} minLength="2" maxLength="80" required autoComplete="name" />
                        <Input label="Phone" name="phone" value={form.phone} onChange={updateField} inputMode="numeric" pattern="[6-9][0-9]{9}" placeholder="10-digit mobile number" required autoComplete="tel" />
                    </div>

                    <Textarea label="Message (optional)" rows={4} name="message" value={form.message} onChange={updateField} maxLength="300" placeholder="Leave a short note..." />

                    <div className="pg-actions">
                        <Button type="submit" disabled={isSubmitting || isLoading} loading={isSubmitting}>
                            {checkoutLabel}
                        </Button>
                    </div>
                </form>
            </PageSection>

            <PageSection id="how" index={2} title="How payment works">
                <ul className="pg-rows">
                    <li className="pg-row">
                        <p className="pg-row__label">Verification</p>
                        <p className="pg-row__body">The server verifies every Razorpay payment before confirmation.</p>
                    </li>
                    <li className="pg-row">
                        <p className="pg-row__label">Checkout</p>
                        <p className="pg-row__body">Card, UPI, and bank details stay inside hosted checkout.</p>
                    </li>
                    <li className="pg-row">
                        <p className="pg-row__label">Receipt</p>
                        <p className="pg-row__body">Confirmed payments receive a downloadable PDF receipt.</p>
                    </li>
                </ul>
            </PageSection>
        </main>
    )
}

export default Support

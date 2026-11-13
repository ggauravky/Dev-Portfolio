import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import useSEO from '../hooks/useSEO'
import { staticSeo } from '../lib/seo'
import useAuth from '../hooks/useAuth'
import { getServiceBySlug, servicesData } from '../data/servicesData'
import {
    createPaymentOrder,
    openRazorpayCheckout,
    recordPaymentFailure,
    verifyPayment,
} from '../services/payment'
import { trackEvent } from '../utils/analytics'
import PageHead from '../components/page/PageHead'
import PageSection from '../components/page/PageSection'
import { Button, Input, Textarea, TextLink } from '../components/ui'
import '../styles/checkout.css'

const SEO = staticSeo('/booknow')

const HEAD = {
    rail: ['Booking', 'Razorpay checkout'],
    title: 'Book a service',
    lede: 'Choose a service, share your requirements, and continue to secure hosted checkout.',
}

const getMinBookDate = () => {
    const date = new Date()
    date.setDate(date.getDate() + 2)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

function BookNow() {
    const navigate = useNavigate()
    const [params] = useSearchParams()
    const { user, isAuthenticated, isLoading, openAuthDialog, refreshSession } = useAuth()
    const requestedService = params.get('service')
    const selectedService = getServiceBySlug(requestedService) || servicesData[0]
    const minDate = useMemo(getMinBookDate, [])
    const [form, setForm] = useState({
        name: '',
        phone: '',
        serviceSlug: selectedService.slug,
        preferredDate: minDate,
        preferredTime: '10:00',
        projectBrief: '',
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [paymentMessage, setPaymentMessage] = useState('')

    const currentService = useMemo(
        () => getServiceBySlug(form.serviceSlug) || selectedService,
        [form.serviceSlug, selectedService]
    )

    useSEO({
        ...SEO,
    })

    useEffect(() => {
        if (!user) return
        setForm((previous) => ({
            ...previous,
            name: previous.name || user.displayName || user.name || '',
        }))
    }, [user])

    useEffect(() => {
        setForm((previous) => ({ ...previous, serviceSlug: selectedService.slug }))
    }, [selectedService.slug])

    const handleChange = (event) => {
        const { name, value } = event.target
        setPaymentMessage('')
        setForm((previous) => ({
            ...previous,
            [name]: name === 'phone' ? value.replaceAll(/\D/g, '').slice(0, 10) : value,
        }))
    }

    const startCheckout = async (authenticatedUser = user) => {
        if (isSubmitting) return
        setIsSubmitting(true)
        setPaymentMessage('')
        let transactionId = ''
        try {
            const refreshedUser = await refreshSession()
            if (!refreshedUser?.email && !authenticatedUser?.email) {
                throw new Error('Please sign in again before checkout')
            }
            const name = form.name.trim()
            const order = await createPaymentOrder({ ...form, name })
            transactionId = order.transactionId
            void trackEvent('checkout_started', {
                transaction_id: transactionId,
                service_slug: form.serviceSlug,
                amount: order.amount,
            })

            const checkout = await openRazorpayCheckout({ order })
            if (checkout.type === 'dismissed') {
                setPaymentMessage('Checkout closed. Your booking is not confirmed and no receipt was created.')
                return
            }
            if (checkout.type === 'failed') {
                const code = String(checkout.response?.code || '').slice(0, 80)
                const reason = String(checkout.response?.reason || checkout.response?.description || '').slice(0, 200)
                await recordPaymentFailure({ transactionId, code, reason }).catch(() => undefined)
                void trackEvent('payment_failed', { transaction_id: transactionId, service_slug: form.serviceSlug })
                throw new Error('Payment could not be completed. You have not been charged for a successful booking.')
            }

            const verified = await verifyPayment({ transactionId, ...checkout.response })
            if (verified.status !== 'paid') {
                setPaymentMessage('Payment is still being confirmed. Please check My Activity shortly.')
                return
            }

            void trackEvent('payment_verified', { transaction_id: transactionId, service_slug: form.serviceSlug })
            toast.success('Payment verified and booking confirmed')
            navigate(`/payment-success/${encodeURIComponent(transactionId)}`)
        } catch (error) {
            const message = error?.message || 'Unable to start secure checkout'
            setPaymentMessage(message)
            toast.error(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleSubmit = async (event) => {
        event?.preventDefault()
        if (isSubmitting || isLoading) return

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
                : `Pay ${currentService.checkoutLabel}`

    return (
        <main className="pg checkout">
            <PageHead head={HEAD}>
                <div className="pg-actions">
                    <TextLink to="/services" tone="muted">Back to services</TextLink>
                </div>
            </PageHead>

            <PageSection id="booking" index={1} title="Your booking">
                <div className="ck-summary">
                    <p className="ck-summary__title">{currentService.title}</p>
                    <p className="ck-summary__body">{currentService.summary}</p>
                    <p className="ck-price">{currentService.checkoutLabel}</p>
                    <p className="ck-price__note">Final amount is validated by the server</p>
                </div>

                {paymentMessage ? <p className="ck-message" role="status">{paymentMessage}</p> : null}

                <form onSubmit={handleSubmit} className="ck-form">
                    <div className="ck-pair">
                        <Input label="Name" name="name" value={form.name} onChange={handleChange} minLength={2} maxLength={80} required autoComplete="name" />
                        <Input label="Account email" value={user?.email || 'Sign in to continue'} readOnly aria-label="Account email" />
                    </div>
                    <div className="ck-pair">
                        <Input label="Phone" name="phone" value={form.phone} onChange={handleChange} inputMode="numeric" pattern="[6-9][0-9]{9}" placeholder="10-digit mobile number" required autoComplete="tel" />
                        <div className="field field--floated ck-select">
                            <div className="field__box">
                                <select id="booking-service" className="field__control" name="serviceSlug" value={form.serviceSlug} onChange={handleChange} required>
                                    {servicesData.map((service) => <option key={service.slug} value={service.slug}>{service.title} · {service.checkoutLabel}</option>)}
                                </select>
                                <label htmlFor="booking-service" className="field__label">Service</label>
                                <span className="field__line" aria-hidden="true" />
                                <span className="ck-select__chev" aria-hidden="true" />
                            </div>
                        </div>
                    </div>
                    <div className="ck-pair">
                        <Input label="Preferred date" type="date" name="preferredDate" min={minDate} value={form.preferredDate} onChange={handleChange} required />
                        <Input label="Preferred time" type="time" name="preferredTime" value={form.preferredTime} onChange={handleChange} required />
                    </div>
                    <Textarea label="Project brief" name="projectBrief" value={form.projectBrief} onChange={handleChange} maxLength={1200} placeholder="Goals, current situation, and what you need help with..." />
                    <div className="pg-actions">
                        <Button type="submit" disabled={isSubmitting || isLoading} loading={isSubmitting}>
                            {checkoutLabel}
                        </Button>
                    </div>
                </form>
            </PageSection>

            <PageSection id="how" index={2} title="How it works">
                <ol className="pg-rows">
                    <li className="pg-row">
                        <p className="pg-row__label">Step 1</p>
                        <div className="pg-row__body">
                            <p>Google sign-in</p>
                            {isAuthenticated
                                ? <p className="pg-row__meta pg-now"><span className="pg-dot" aria-hidden="true" /> Signed in</p>
                                : null}
                        </div>
                    </li>
                    <li className="pg-row">
                        <p className="pg-row__label">Step 2</p>
                        <div className="pg-row__body"><p>Booking brief</p></div>
                    </li>
                    <li className="pg-row">
                        <p className="pg-row__label">Step 3</p>
                        <div className="pg-row__body">
                            <p>Razorpay</p>
                            <p className="pg-row__meta">Card, UPI, and bank details stay inside Razorpay Checkout.</p>
                        </div>
                    </li>
                    <li className="pg-row">
                        <p className="pg-row__label">Step 4</p>
                        <div className="pg-row__body">
                            <p>Confirmation</p>
                            <p className="pg-row__meta">Payment is verified on the server before booking confirmation. A receipt and booking record are created only after payment is captured.</p>
                        </div>
                    </li>
                </ol>
            </PageSection>
        </main>
    )
}

export default BookNow

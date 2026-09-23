import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { CalendarClock, CreditCard, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import useSEO from '../hooks/useSEO'
import useAuth from '../hooks/useAuth'
import { getServiceBySlug, servicesData } from '../data/servicesData'
import {
    createPaymentOrder,
    openRazorpayCheckout,
    recordPaymentFailure,
    verifyPayment,
} from '../services/payment'
import TrustStrip from '../components/TrustStrip'
import StickyMobileCTA from '../components/StickyMobileCTA'
import { trackEvent } from '../utils/analytics'

const getMinBookDate = () => {
    const date = new Date()
    date.setDate(date.getDate() + 2)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

const fieldClass = 'mt-2 w-full rounded-md border border-obsidian-border bg-obsidian px-3.5 py-3 text-sm text-slate-100 outline-none transition-colors placeholder:text-zinc-600 focus:border-toxic/60'

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
        title: `Book ${currentService.title} | Gaurav Kumar Yadav`,
        description: `Book ${currentService.title} with secure Razorpay Standard Checkout and server-verified pricing.`,
        keywords: `book ${currentService.title}, Razorpay checkout, Gaurav Kumar Yadav services`,
        ogImage: 'https://ggauravky.vercel.app/images/profile.jpg',
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
        <div className="min-h-screen bg-obsidian relative overflow-hidden">
            <div className="absolute -top-24 right-0 h-[420px] w-[420px] rounded-full bg-toxic/5 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 left-0 h-[420px] w-[420px] rounded-full bg-cyber/5 blur-3xl pointer-events-none" />
            <main className="relative z-10 mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
                <Link to="/services" className="text-xs font-mono uppercase tracking-wider text-zinc-400 transition-colors hover:text-toxic">← Back to Services</Link>

                <div className="mt-7 grid gap-6 lg:grid-cols-5 lg:gap-8">
                    <section className="rounded-lg border border-obsidian-border bg-obsidian-card p-5 sm:p-8 lg:col-span-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded border border-toxic/30 bg-toxic/10 px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-toxic">Secure Booking</span>
                            <span className="rounded border border-obsidian-border px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-zinc-500">Razorpay Standard Checkout</span>
                        </div>
                        <h1 className="mt-5 text-3xl font-display font-bold tracking-tight text-white sm:text-4xl">Book a Service</h1>
                        <p className="mt-2 text-sm leading-relaxed text-zinc-400">Choose a service, share your requirements, and continue to secure hosted checkout.</p>

                        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                            {['Google Auth', 'Booking Brief', 'Razorpay', 'Confirmation'].map((step, index) => (
                                <div key={step} className={`rounded-md border p-3 ${index === 0 && isAuthenticated ? 'border-emerald-500/30 bg-emerald-500/5' : index <= 1 ? 'border-toxic/30 bg-toxic/5' : 'border-obsidian-border bg-obsidian/60'}`}>
                                    <p className="text-[9px] font-mono uppercase tracking-wider text-zinc-500">Step {index + 1}</p>
                                    <p className="mt-1 text-xs font-semibold text-white">{step}</p>
                                </div>
                            ))}
                        </div>

                        {paymentMessage ? <div className="mt-5 rounded-md border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm text-amber-200">{paymentMessage}</div> : null}

                        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                            <div className="grid gap-5 sm:grid-cols-2">
                                <label className="text-xs font-mono uppercase tracking-wider text-zinc-400">Name
                                    <input className={fieldClass} name="name" value={form.name} onChange={handleChange} minLength={2} maxLength={80} required autoComplete="name" />
                                </label>
                                <label className="text-xs font-mono uppercase tracking-wider text-zinc-400">Account Email
                                    <input className={`${fieldClass} cursor-not-allowed opacity-70`} value={user?.email || 'Sign in to continue'} readOnly aria-label="Account email" />
                                </label>
                            </div>
                            <div className="grid gap-5 sm:grid-cols-2">
                                <label className="text-xs font-mono uppercase tracking-wider text-zinc-400">Phone
                                    <input className={fieldClass} name="phone" value={form.phone} onChange={handleChange} inputMode="numeric" pattern="[6-9][0-9]{9}" placeholder="10-digit mobile number" required autoComplete="tel" />
                                </label>
                                <label className="text-xs font-mono uppercase tracking-wider text-zinc-400">Service
                                    <select className={fieldClass} name="serviceSlug" value={form.serviceSlug} onChange={handleChange} required>
                                        {servicesData.map((service) => <option key={service.slug} value={service.slug}>{service.title} · {service.checkoutLabel}</option>)}
                                    </select>
                                </label>
                            </div>
                            <div className="grid gap-5 sm:grid-cols-2">
                                <label className="text-xs font-mono uppercase tracking-wider text-zinc-400">Preferred Date
                                    <input className={fieldClass} type="date" name="preferredDate" min={minDate} value={form.preferredDate} onChange={handleChange} required />
                                </label>
                                <label className="text-xs font-mono uppercase tracking-wider text-zinc-400">Preferred Time
                                    <input className={fieldClass} type="time" name="preferredTime" value={form.preferredTime} onChange={handleChange} required />
                                </label>
                            </div>
                            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400">Project Brief
                                <textarea className={`${fieldClass} min-h-28 resize-y`} name="projectBrief" value={form.projectBrief} onChange={handleChange} maxLength={1200} placeholder="Goals, current situation, and what you need help with..." />
                            </label>
                            <button type="submit" disabled={isSubmitting || isLoading} className="inline-flex min-h-12 w-full items-center justify-center rounded-md bg-toxic px-5 py-3 text-xs font-mono font-bold uppercase text-obsidian shadow-[2px_2px_0_rgba(197,248,42,.3)] transition-all hover:translate-y-0.5 hover:shadow-none disabled:cursor-not-allowed disabled:opacity-60">
                                {checkoutLabel}
                            </button>
                        </form>
                    </section>

                    <aside className="space-y-5 lg:col-span-2">
                        <div className="rounded-lg border border-obsidian-border bg-obsidian-card p-6">
                            <p className="text-[10px] font-mono uppercase tracking-widest text-toxic">Selected Service</p>
                            <h2 className="mt-3 text-2xl font-display font-bold text-white">{currentService.title}</h2>
                            <p className="mt-2 text-sm leading-relaxed text-zinc-400">{currentService.summary}</p>
                            <p className="mt-5 text-3xl font-display font-black text-toxic">{currentService.checkoutLabel}</p>
                            <p className="mt-1 text-[10px] font-mono uppercase tracking-wider text-zinc-500">Final amount is validated by the server</p>
                        </div>
                        <div className="rounded-lg border border-obsidian-border bg-obsidian-card p-6 space-y-4">
                            <div className="flex gap-3"><ShieldCheck className="h-5 w-5 shrink-0 text-toxic" /><p className="text-sm text-zinc-300">Payment is verified on the server before booking confirmation.</p></div>
                            <div className="flex gap-3"><CreditCard className="h-5 w-5 shrink-0 text-cyber" /><p className="text-sm text-zinc-300">Card, UPI, and bank details stay inside Razorpay Checkout.</p></div>
                            <div className="flex gap-3"><CalendarClock className="h-5 w-5 shrink-0 text-toxic" /><p className="text-sm text-zinc-300">A receipt and booking record are created only after payment is captured.</p></div>
                        </div>
                    </aside>
                </div>

                <TrustStrip variant="booknow" className="mt-8" />
            </main>
            <StickyMobileCTA
                badge="Secure Booking"
                title={currentService.title}
                primaryLabel={checkoutLabel}
                onPrimaryClick={handleSubmit}
                primaryDisabled={isSubmitting || isLoading}
                primaryTone="toxic"
                secondaryLabel="Services"
                secondaryTo="/services"
            />
        </div>
    )
}

export default BookNow

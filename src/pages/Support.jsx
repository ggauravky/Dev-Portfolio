import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CreditCard, HeartHandshake, ReceiptText, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import TrustStrip from '../components/TrustStrip'
import useAuth from '../hooks/useAuth'
import useSEO from '../hooks/useSEO'
import {
    createSupportPaymentOrder,
    openRazorpayCheckout,
    recordPaymentFailure,
    verifyPayment,
} from '../services/payment'
import { trackEvent } from '../utils/analytics'

const QUICK_AMOUNTS = [49, 99, 199, 499, 999, 1999]
const fieldClass = 'mt-2 w-full rounded-md border border-obsidian-border bg-obsidian px-3.5 py-3 text-sm text-slate-100 outline-none transition-colors placeholder:text-zinc-600 focus:border-toxic/60'

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
        if (!Number.isSafeInteger(amount) || amount < 49 || amount > 100000) {
            throw new Error('Support amount must be between INR 49 and INR 100000')
        }
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
        <div className="min-h-screen bg-obsidian relative overflow-hidden">
            <div className="pointer-events-none absolute -top-24 right-0 h-[420px] w-[420px] rounded-full bg-toxic/5 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 left-0 h-[420px] w-[420px] rounded-full bg-cyber/5 blur-3xl" />

            <main className="relative z-10 mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
                <Link to="/" className="text-xs font-mono uppercase tracking-wider text-zinc-400 transition-colors hover:text-toxic">&larr; Back Home</Link>

                <div className="mt-7 grid gap-6 lg:grid-cols-5 lg:gap-8">
                    <section className="rounded-lg border border-obsidian-border bg-obsidian-card p-5 sm:p-8 lg:col-span-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded border border-toxic/30 bg-toxic/10 px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-toxic">Support My Work</span>
                            <span className="rounded border border-obsidian-border px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-zinc-500">Razorpay Standard Checkout</span>
                        </div>
                        <h1 className="mt-5 text-3xl font-display font-bold tracking-tight text-white sm:text-4xl">Help Me Keep Building</h1>
                        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">If my projects, articles, or resources have helped you, you can support the time and care that goes into creating them.</p>

                        {paymentMessage ? <div className="mt-5 rounded-md border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm text-amber-200">{paymentMessage}</div> : null}

                        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
                            <fieldset>
                                <legend className="text-xs font-mono uppercase tracking-wider text-zinc-400">Choose an amount</legend>
                                <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
                                    {QUICK_AMOUNTS.map((amount) => (
                                        <button
                                            key={amount}
                                            type="button"
                                            onClick={() => setForm((previous) => ({ ...previous, amount: String(amount) }))}
                                            className={`rounded-md border px-2 py-3 text-xs font-mono font-bold transition-colors ${Number(form.amount) === amount ? 'border-toxic bg-toxic text-obsidian' : 'border-obsidian-border bg-obsidian text-zinc-300 hover:border-toxic/50 hover:text-toxic'}`}
                                        >
                                            INR {amount}
                                        </button>
                                    ))}
                                </div>
                            </fieldset>

                            <div className="grid gap-5 sm:grid-cols-2">
                                <label className="text-xs font-mono uppercase tracking-wider text-zinc-400">Custom Amount
                                    <input className={fieldClass} name="amount" value={form.amount} onChange={updateField} inputMode="numeric" min="49" max="100000" required aria-describedby="support-amount-help" />
                                    <span id="support-amount-help" className="mt-1.5 block text-[10px] normal-case tracking-normal text-zinc-600">Whole rupees, INR 49 to INR 100,000</span>
                                </label>
                                <label className="text-xs font-mono uppercase tracking-wider text-zinc-400">Account Email
                                    <input className={`${fieldClass} cursor-not-allowed opacity-70`} value={user?.email || 'Sign in to continue'} readOnly aria-label="Account email" />
                                </label>
                            </div>

                            <div className="grid gap-5 sm:grid-cols-2">
                                <label className="text-xs font-mono uppercase tracking-wider text-zinc-400">Name
                                    <input className={fieldClass} name="name" value={form.name} onChange={updateField} minLength="2" maxLength="80" required autoComplete="name" />
                                </label>
                                <label className="text-xs font-mono uppercase tracking-wider text-zinc-400">Phone
                                    <input className={fieldClass} name="phone" value={form.phone} onChange={updateField} inputMode="numeric" pattern="[6-9][0-9]{9}" placeholder="10-digit mobile number" required autoComplete="tel" />
                                </label>
                            </div>

                            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400">Message <span className="normal-case text-zinc-600">(optional)</span>
                                <textarea className={`${fieldClass} min-h-24 resize-y`} name="message" value={form.message} onChange={updateField} maxLength="300" placeholder="Leave a short note..." />
                            </label>

                            <button type="submit" disabled={isSubmitting || isLoading} className="inline-flex min-h-12 w-full items-center justify-center rounded-md bg-toxic px-5 py-3 text-xs font-mono font-bold uppercase text-obsidian shadow-[2px_2px_0_rgba(197,248,42,.3)] transition-all hover:translate-y-0.5 hover:shadow-none disabled:cursor-not-allowed disabled:opacity-60">
                                {checkoutLabel}
                            </button>
                        </form>
                    </section>

                    <aside className="space-y-5 lg:col-span-2">
                        <div className="rounded-lg border border-obsidian-border bg-obsidian-card p-6">
                            <HeartHandshake className="h-7 w-7 text-toxic" />
                            <p className="mt-5 text-[10px] font-mono uppercase tracking-widest text-toxic">A Direct Contribution</p>
                            <h2 className="mt-2 text-2xl font-display font-bold text-white">Thank you for backing independent work.</h2>
                            <p className="mt-3 text-sm leading-relaxed text-zinc-400">Your contribution supports new portfolio projects, technical writing, and practical learning resources.</p>
                        </div>
                        <div className="space-y-4 rounded-lg border border-obsidian-border bg-obsidian-card p-6">
                            <div className="flex gap-3"><ShieldCheck className="h-5 w-5 shrink-0 text-toxic" /><p className="text-sm text-zinc-300">The server verifies every Razorpay payment before confirmation.</p></div>
                            <div className="flex gap-3"><CreditCard className="h-5 w-5 shrink-0 text-cyber" /><p className="text-sm text-zinc-300">Card, UPI, and bank details stay inside hosted checkout.</p></div>
                            <div className="flex gap-3"><ReceiptText className="h-5 w-5 shrink-0 text-toxic" /><p className="text-sm text-zinc-300">Confirmed payments receive a downloadable PDF receipt.</p></div>
                        </div>
                    </aside>
                </div>

                <TrustStrip variant="support" className="mt-8" />
            </main>
        </div>
    )
}

export default Support

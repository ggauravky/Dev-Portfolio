import { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import GoogleSignInButton from './GoogleSignInButton'

const dialogCopy = {
    activity: 'Sign in to securely view your bookings, receipts, and account activity.',
    checkout: 'Sign in to securely continue with your booking and keep its receipt linked to you.',
    'blog-support': 'Sign in to support this article and keep the activity linked to your account.',
    navbar: 'Sign in to securely continue with bookings, receipts, and your activity.',
}

function GoogleAuthDialog({ error, isAuthenticating, isOpen, onClose, onCredential, openerElement, reason }) {
    const dialogRef = useRef(null)
    const closeButtonRef = useRef(null)

    useEffect(() => {
        if (!isOpen) return undefined

        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        closeButtonRef.current?.focus()

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                event.preventDefault()
                onClose()
                return
            }

            if (event.key !== 'Tab' || !dialogRef.current) return
            const focusable = [...dialogRef.current.querySelectorAll(
                'button:not([disabled]), [href], iframe, input:not([disabled]), [tabindex]:not([tabindex="-1"])'
            )]
            if (!focusable.length) return

            const first = focusable[0]
            const last = focusable.at(-1)
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault()
                last.focus()
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault()
                first.focus()
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            document.body.style.overflow = previousOverflow
            openerElement?.focus?.()
        }
    }, [isOpen, onClose, openerElement])

    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 z-[240] flex items-center justify-center overflow-y-auto bg-obsidian/85 px-3 py-6 backdrop-blur-md sm:px-4"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose()
            }}
        >
            <section
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="google-auth-title"
                aria-describedby="google-auth-description"
                aria-busy={isAuthenticating}
                className="relative w-full max-w-md rounded-2xl border border-obsidian-border bg-obsidian-card p-5 shadow-[0_30px_120px_rgba(0,0,0,0.9)] sm:p-7"
            >
                <button
                    ref={closeButtonRef}
                    type="button"
                    onClick={onClose}
                    className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-obsidian-border bg-obsidian text-zinc-400 transition-colors hover:border-toxic/40 hover:text-toxic focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-toxic"
                    aria-label="Close sign-in dialog"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                </button>

                <p className="pr-12 text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-toxic">
                    Continue with Google
                </p>
                <h2 id="google-auth-title" className="mt-3 pr-10 text-2xl font-display font-bold text-white sm:text-3xl">
                    Secure account access
                </h2>
                <p id="google-auth-description" className="mt-2 text-sm leading-relaxed text-zinc-400">
                    {dialogCopy[reason] || dialogCopy.navbar}
                </p>

                <div className="mt-5 grid gap-2 text-xs text-zinc-300 sm:grid-cols-3">
                    {['Secure checkout identity', 'Receipts linked to you', 'Activity available later'].map((benefit) => (
                        <div key={benefit} className="rounded-lg border border-obsidian-border bg-obsidian px-3 py-2.5">
                            <span className="mr-1.5 text-toxic" aria-hidden="true">•</span>{benefit}
                        </div>
                    ))}
                </div>

                <div className="mt-6 rounded-xl border border-obsidian-border bg-obsidian p-3 sm:p-4">
                    <GoogleSignInButton isAuthenticating={isAuthenticating} onCredential={onCredential} />
                </div>

                {isAuthenticating ? (
                    <div className="mt-4 flex items-center justify-center gap-2 text-xs font-mono text-toxic" role="status">
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-toxic border-t-transparent" />
                        Verifying your Google account...
                    </div>
                ) : null}

                {error ? (
                    <div className="mt-4 rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200" role="alert">
                        {error}
                    </div>
                ) : null}

                <p className="mt-4 text-center text-[10px] leading-relaxed text-zinc-600">
                    Google verifies your identity. Payment details remain inside Razorpay Checkout.
                </p>
            </section>
        </div>
    )
}

GoogleAuthDialog.propTypes = {
    error: PropTypes.string,
    isAuthenticating: PropTypes.bool.isRequired,
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onCredential: PropTypes.func.isRequired,
    openerElement: PropTypes.shape({ focus: PropTypes.func }),
    reason: PropTypes.string,
}

export default GoogleAuthDialog

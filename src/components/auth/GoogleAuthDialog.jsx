import { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import GoogleSignInButton from './GoogleSignInButton'
import { friendlyAuthError } from './authErrors'
import { useFocusTrap } from '../../hooks/useFocusTrap'

const dialogCopy = {
    activity: 'Sign in to securely view your bookings, receipts, and account activity.',
    checkout: 'Sign in to securely continue with your booking and keep its receipt linked to you.',
    'blog-support': 'Sign in to support this article and keep the activity linked to your account.',
    navbar: 'Sign in to securely continue with bookings, receipts, and your activity.',
}

function GoogleAuthDialog({ error, isAuthenticating, isOpen, onClose, onCredential, openerElement, reason }) {
    const dialogRef = useRef(null)
    const closeButtonRef = useRef(null)

    useFocusTrap(dialogRef, isOpen, {
        onEscape: onClose,
        initialFocusRef: closeButtonRef,
        returnFocusTo: openerElement,
    })

    useEffect(() => {
        if (!isOpen) return undefined
        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => { document.body.style.overflow = previousOverflow }
    }, [isOpen])

    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 z-[240] flex items-center justify-center overflow-y-auto bg-ink/80 px-4 py-6"
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
                className="relative w-full max-w-md rounded-dialog border border-rule bg-ink-raised p-6 shadow-dialog sm:p-8"
            >
                <button
                    ref={closeButtonRef}
                    type="button"
                    onClick={onClose}
                    className="absolute right-2 top-2 inline-flex h-11 w-11 items-center justify-center rounded-control text-muted hover:bg-paper/[0.06] hover:text-paper"
                    aria-label="Close sign-in dialog"
                >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                </button>

                <h2 id="google-auth-title" className="pr-12 font-serif text-h3 text-paper">
                    Sign in
                </h2>
                <p id="google-auth-description" className="mt-2 text-small text-muted">
                    {dialogCopy[reason] || dialogCopy.navbar}
                </p>

                <div className="mt-6 border-t border-rule pt-6">
                    <GoogleSignInButton isAuthenticating={isAuthenticating} onCredential={onCredential} />
                </div>

                {isAuthenticating ? (
                    <p className="mt-4 text-center text-small text-muted" role="status">
                        Verifying your Google account…
                    </p>
                ) : null}

                {error ? (
                    <p className="mt-4 rounded-control border border-red-400/40 px-4 py-3 text-small text-red-200" role="alert">
                        {friendlyAuthError(error)}
                    </p>
                ) : null}

                <p className="mt-6 text-small text-muted">
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

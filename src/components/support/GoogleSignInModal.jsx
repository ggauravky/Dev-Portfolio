import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import toast from 'react-hot-toast'
import useAuth from '../../hooks/useAuth'
import { fetchPublicAuthConfig } from '../../services/auth'

let googleScriptPromise = null
let initializedGoogleClientId = ''

const loadGoogleScript = () => {
    if (globalThis.window === undefined) {
        return Promise.reject(new Error('Google Sign-In requires a browser environment'))
    }

    if (globalThis.window.google?.accounts?.id) {
        return Promise.resolve()
    }

    if (googleScriptPromise) {
        return googleScriptPromise
    }

    googleScriptPromise = new Promise((resolve, reject) => {
        const existing = document.querySelector('script[data-google-identity="true"]')
        if (existing) {
            existing.addEventListener('load', () => resolve(), { once: true })
            existing.addEventListener('error', () => reject(new Error('Unable to load Google Sign-In')), {
                once: true,
            })
            return
        }

        const script = document.createElement('script')
        script.src = 'https://accounts.google.com/gsi/client'
        script.async = true
        script.defer = true
        script.dataset.googleIdentity = 'true'
        script.onload = () => resolve()
        script.onerror = () => reject(new Error('Unable to load Google Sign-In'))
        document.head.appendChild(script)
    })

    return googleScriptPromise
}

const resolveGoogleClientId = async () => {
    const envClientId = String(import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim()
    if (envClientId) {
        return envClientId
    }

    try {
        const config = await fetchPublicAuthConfig()
        return String(config?.googleClientId || '').trim()
    } catch {
        return ''
    }
}

function GoogleSignInModal({
    isOpen,
    onClose,
    onAuthenticated,
    title = 'Sign In with Google',
    description = 'Sign in with Google to unlock secure checkout, automated receipts, and order tracking.',
    badgeText = 'Step 1: Identity Verification',
}) {
    const buttonContainerRef = useRef(null)
    const isMountedRef = useRef(false)
    const { signIn } = useAuth()
    const signInRef = useRef(signIn)
    const onAuthenticatedRef = useRef(onAuthenticated)
    const [isSigningIn, setIsSigningIn] = useState(false)
    const [isReady, setIsReady] = useState(false)

    useEffect(() => {
        signInRef.current = signIn
    }, [signIn])

    useEffect(() => {
        onAuthenticatedRef.current = onAuthenticated
    }, [onAuthenticated])

    useEffect(() => {
        isMountedRef.current = true
        return () => {
            isMountedRef.current = false
        }
    }, [])

    useEffect(() => {
        if (!isOpen) {
            return
        }

        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = ''
        }
    }, [isOpen])

    useEffect(() => {
        if (!isOpen) {
            return
        }

        const renderGoogleButton = async () => {
            try {
                setIsReady(false)
                const clientId = await resolveGoogleClientId()

                if (!clientId) {
                    toast.error('Google Sign-In is not configured yet')
                    onClose()
                    return
                }

                await loadGoogleScript()

                if (!isMountedRef.current || !buttonContainerRef.current || !globalThis.window.google?.accounts?.id) {
                    return
                }

                if (initializedGoogleClientId !== clientId) {
                    globalThis.window.google.accounts.id.initialize({
                        client_id: clientId,
                        callback: async (response) => {
                            const credential = String(response?.credential || '').trim()
                            if (!credential) {
                                toast.error('Google Sign-In failed. Please try again')
                                return
                            }

                            setIsSigningIn(true)
                            try {
                                const signInResult = await signInRef.current(credential)
                                const authMessageText = String(signInResult?.authMessage?.text || '').trim()

                                if (authMessageText) {
                                    toast.success(authMessageText)
                                } else {
                                    toast.success('Signed in with Google')
                                }

                                await onAuthenticatedRef.current?.()
                            } catch (error) {
                                toast.error(error?.message || 'Unable to complete Google sign-in')
                            } finally {
                                if (isMountedRef.current) {
                                    setIsSigningIn(false)
                                }
                            }
                        },
                        auto_select: false,
                        cancel_on_tap_outside: true,
                        ux_mode: 'popup',
                    })

                    initializedGoogleClientId = clientId
                }

                buttonContainerRef.current.innerHTML = ''
                globalThis.window.google.accounts.id.renderButton(buttonContainerRef.current, {
                    type: 'standard',
                    theme: 'filled_black',
                    size: 'large',
                    shape: 'pill',
                    text: 'continue_with',
                    width: 320,
                })

                setIsReady(true)
            } catch (error) {
                toast.error(error?.message || 'Unable to initialize Google Sign-In')
                onClose()
            }
        }

        renderGoogleButton()
    }, [isOpen, onClose])

    if (!isOpen) {
        return null
    }

    return (
        <div className="fixed inset-0 z-[220] flex items-center justify-center px-4">
            <button
                type="button"
                aria-label="Close sign-in dialog"
                className="absolute inset-0 bg-obsidian/80 backdrop-blur-md"
                onClick={onClose}
            />

            <div className="relative w-full max-w-md rounded-2xl border border-obsidian-border bg-obsidian-card p-6 sm:p-8 shadow-[0_30px_120px_rgba(0,0,0,0.9)] animate-[fadeIn_240ms_ease-out]">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-obsidian-border bg-obsidian text-zinc-400 transition-colors hover:border-toxic/40 hover:text-toxic"
                    aria-label="Close"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="mb-4">
                    <span className="inline-flex items-center rounded-md border border-toxic/30 bg-toxic/10 px-3 py-1 text-xs font-mono uppercase tracking-wider text-toxic">
                        {badgeText}
                    </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold font-display text-white">{title}</h3>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-zinc-400">
                    {description}
                </p>

                {/* Explicit Security & User Benefit Cards */}
                <div className="mt-5 space-y-2 rounded-xl border border-obsidian-border bg-obsidian p-3.5">
                    <div className="flex items-start gap-2.5">
                        <span className="text-toxic font-mono text-xs mt-0.5">✓</span>
                        <div className="text-xs text-zinc-300">
                            <strong className="text-white">Instant PDF Receipts:</strong> Automatically generated and emailed to your Google address.
                        </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                        <span className="text-toxic font-mono text-xs mt-0.5">✓</span>
                        <div className="text-xs text-zinc-300">
                            <strong className="text-white">Order Tracking:</strong> Access all your bookings and contributions anytime in <span className="font-mono text-toxic">My Activity</span>.
                        </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                        <span className="text-toxic font-mono text-xs mt-0.5">✓</span>
                        <div className="text-xs text-zinc-300">
                            <strong className="text-white">256-Bit Encryption:</strong> Powered by Cashfree payments with strict spam prevention.
                        </div>
                    </div>
                </div>

                <div className="mt-6 rounded-xl border border-obsidian-border bg-obsidian-card p-4">
                    <div ref={buttonContainerRef} className="flex min-h-11 items-center justify-center" />
                    {isReady ? null : <p className="mt-3 text-center text-xs font-mono text-zinc-500">Preparing Google Sign-In...</p>}
                </div>

                {isSigningIn ? (
                    <div className="mt-4 flex items-center justify-center gap-2 text-xs font-mono text-toxic">
                        <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-toxic border-t-transparent" />
                        <span>Signing in securely...</span>
                    </div>
                ) : null}
            </div>
        </div>
    )
}

GoogleSignInModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onAuthenticated: PropTypes.func,
    title: PropTypes.string,
    description: PropTypes.string,
    badgeText: PropTypes.string,
}

export default GoogleSignInModal

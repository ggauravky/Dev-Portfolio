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

function GoogleSignInModal({ isOpen, onClose, onAuthenticated }) {
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
                className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className="relative w-full max-w-md rounded-3xl border border-slate-700/70 bg-slate-900/95 p-6 sm:p-8 shadow-[0_30px_120px_rgba(15,23,42,0.8)] animate-[fadeIn_240ms_ease-out]">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700/70 bg-slate-800/80 text-slate-400 transition-colors hover:border-slate-500 hover:text-slate-200"
                    aria-label="Close"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="mb-5">
                    <p className="inline-flex items-center rounded-full border border-rose-400/30 bg-rose-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-rose-200">
                        Support this blog ❤️
                    </p>
                </div>

                <h3 className="text-2xl font-bold text-slate-100">Support this blog ❤️</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                    Sign in with Google to show your support for this article.
                </p>

                <div className="mt-6 rounded-2xl border border-slate-700/70 bg-slate-800/70 p-4">
                    <div ref={buttonContainerRef} className="flex min-h-11 items-center justify-center" />
                    {isReady ? null : <p className="mt-3 text-center text-xs text-slate-500">Preparing Google Sign-In...</p>}
                </div>

                {isSigningIn ? (
                    <div className="mt-4 flex items-center justify-center gap-2 text-sm text-cyan-300">
                        <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
                        <span>Signing you in securely...</span>
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
}

export default GoogleSignInModal

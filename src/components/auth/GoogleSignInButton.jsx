import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { fetchPublicAuthConfig, resetPublicAuthConfig } from '../../services/auth'
import {
    clearGoogleCredentialHandler,
    initializeGoogleIdentity,
    renderGoogleSignInButton,
} from '../../services/googleIdentity'

const clampButtonWidth = (width) => Math.max(200, Math.min(360, Math.floor(width || 320)))

function GoogleSignInButton({ isAuthenticating, onCredential }) {
    const containerRef = useRef(null)
    const credentialHandlerRef = useRef(onCredential)
    const [buttonWidth, setButtonWidth] = useState(320)
    const [loadState, setLoadState] = useState('loading')
    const [errorMessage, setErrorMessage] = useState('')
    const [retryCount, setRetryCount] = useState(0)

    useEffect(() => {
        credentialHandlerRef.current = onCredential
    }, [onCredential])

    useEffect(() => {
        const container = containerRef.current
        if (!container) return undefined

        const updateWidth = () => {
            const nextWidth = clampButtonWidth(container.getBoundingClientRect().width)
            setButtonWidth((current) => (Math.abs(current - nextWidth) >= 2 ? nextWidth : current))
        }

        updateWidth()
        if (!globalThis.ResizeObserver) return undefined

        const observer = new ResizeObserver(updateWidth)
        observer.observe(container)
        return () => observer.disconnect()
    }, [])

    useEffect(() => {
        let cancelled = false
        const credentialHandler = (response) => credentialHandlerRef.current?.(response)

        const prepareButton = async () => {
            setLoadState('loading')
            setErrorMessage('')

            try {
                const config = await fetchPublicAuthConfig({ forceRefresh: retryCount > 0 })
                if (!config.googleAuthEnabled || !config.googleClientId) {
                    throw new Error('Google Sign-In is currently unavailable.')
                }

                const api = await initializeGoogleIdentity({
                    clientId: config.googleClientId,
                    onCredential: credentialHandler,
                    retry: retryCount > 0,
                })

                if (cancelled || !containerRef.current) return
                renderGoogleSignInButton({ api, container: containerRef.current, width: buttonWidth })
                setLoadState('ready')
            } catch (error) {
                if (cancelled) return
                setLoadState('error')
                setErrorMessage(error?.message || 'Unable to load Google Sign-In.')
            }
        }

        void prepareButton()
        return () => {
            cancelled = true
            clearGoogleCredentialHandler(credentialHandler)
        }
    }, [buttonWidth, retryCount])

    const retry = () => {
        resetPublicAuthConfig()
        setRetryCount((current) => current + 1)
    }

    return (
        <div>
            <div
                ref={containerRef}
                className={`mx-auto flex min-h-11 w-full max-w-[360px] items-center justify-center overflow-hidden transition-opacity ${isAuthenticating ? 'pointer-events-none opacity-50' : ''}`}
                aria-hidden={loadState !== 'ready'}
            />

            {loadState === 'loading' ? (
                <div className="mt-3 flex items-center justify-center gap-2 text-xs font-mono text-zinc-500" role="status">
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-toxic/70 border-t-transparent" />
                    Loading Google Sign-In...
                </div>
            ) : null}

            {loadState === 'error' ? (
                <div className="mt-3 text-center" role="alert">
                    <p className="text-xs text-amber-200">{errorMessage}</p>
                    <button
                        type="button"
                        onClick={retry}
                        className="mt-3 rounded-md border border-toxic/40 px-3 py-2 text-[11px] font-mono font-bold uppercase tracking-wider text-toxic transition-colors hover:bg-toxic/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-toxic"
                    >
                        Retry
                    </button>
                </div>
            ) : null}
        </div>
    )
}

GoogleSignInButton.propTypes = {
    isAuthenticating: PropTypes.bool,
    onCredential: PropTypes.func.isRequired,
}

export default GoogleSignInButton

import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import Button from '../ui/Button'
import { friendlyAuthError } from './authErrors'
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
        const isRetry = retryCount > 0
        const credentialHandler = (response) => credentialHandlerRef.current?.(response)

        const prepareButton = async () => {
            setLoadState('loading')
            setErrorMessage('')

            try {
                const config = await fetchPublicAuthConfig({ forceRefresh: isRetry })
                if (!config.googleAuthEnabled || !config.googleClientId) {
                    throw new Error('Google Sign-In is currently unavailable.')
                }

                const api = await initializeGoogleIdentity({
                    clientId: config.googleClientId,
                    onCredential: credentialHandler,
                    retry: isRetry,
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
                className={`mx-auto flex min-h-11 w-full max-w-[360px] items-center justify-center overflow-hidden ${isAuthenticating ? 'pointer-events-none opacity-50' : ''}`}
                aria-hidden={loadState !== 'ready'}
            />

            {loadState === 'loading' ? (
                <p className="mt-3 text-center text-small text-muted" role="status">
                    Loading Google Sign-In…
                </p>
            ) : null}

            {loadState === 'error' ? (
                <div className="mt-3 text-center" role="alert">
                    <p className="text-small text-paper">{friendlyAuthError(errorMessage)}</p>
                    <Button variant="secondary" onClick={retry} className="mt-4">
                        Try again
                    </Button>
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

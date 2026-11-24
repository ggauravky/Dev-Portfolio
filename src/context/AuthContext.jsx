import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import toast from 'react-hot-toast'
import GoogleAuthDialog from '../components/auth/GoogleAuthDialog'
import {
    fetchCurrentSession,
    deleteAuthAvatar,
    logoutSession,
    signInWithGoogleCredential,
    updateAuthProfile,
    uploadAuthAvatar,
} from '../services/auth'
import { disableGoogleAutoSelect } from '../services/googleIdentity'
import { trackEvent } from '../utils/analytics'
import { hasSessionHint, setSessionHint } from '../utils/sessionHint'

const BACKGROUND_TIMEOUT_MS = 3500
const BACKGROUND_RETRY_MS = 8000

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [authDialog, setAuthDialog] = useState({
        isOpen: false,
        reason: 'navbar',
        openerElement: null,
    })
    const [authDialogError, setAuthDialogError] = useState('')
    const [isAuthenticating, setIsAuthenticating] = useState(false)
    const activeRequestControllerRef = useRef(null)
    const authenticationInFlightRef = useRef(false)
    const onAuthSuccessRef = useRef(null)

    const replaceActiveRequestController = useCallback(() => {
        activeRequestControllerRef.current?.abort()
        const controller = new AbortController()
        activeRequestControllerRef.current = controller
        return controller
    }, [])

    // D-123: /api/auth/me is not on the first-paint path. Pages render logged-out
    // and upgrade on success. Gated pages ask for the check (useAuth({ requireSession })),
    // everything else only checks at idle time when this browser has signed in before.
    const [sessionResolved, setSessionResolved] = useState(false)
    const sessionPromiseRef = useRef(null)

    const refreshSession = useCallback(async ({ timeoutMs, background = false } = {}) => {
        const controller = replaceActiveRequestController()
        if (!background) setIsLoading(true)
        let definitive = false

        try {
            const data = await fetchCurrentSession({ signal: controller.signal, timeoutMs })
            if (activeRequestControllerRef.current !== controller) return null

            const nextUser = data.user || null
            definitive = true
            setUser(nextUser)
            setSessionHint(Boolean(nextUser))
            return nextUser
        } catch (error) {
            if (error?.name !== 'AbortError' && activeRequestControllerRef.current === controller) {
                // A 401/403 is a real answer; a timeout or cold backend is not.
                if (error?.status === 401 || error?.status === 403) {
                    definitive = true
                    setUser(null)
                    setSessionHint(false)
                }
            }
            return null
        } finally {
            if (activeRequestControllerRef.current === controller) {
                activeRequestControllerRef.current = null
                // A foreground check always resolves, so gated pages never hang.
                if (definitive || !background) setSessionResolved(true)
                setIsLoading(false)
            }
        }
    }, [replaceActiveRequestController])

    // One shared foreground check for gated pages and the auth dialog.
    const ensureSession = useCallback(() => {
        if (sessionResolved) return Promise.resolve(user)
        if (!sessionPromiseRef.current) {
            sessionPromiseRef.current = refreshSession().finally(() => {
                sessionPromiseRef.current = null
            })
        }
        return sessionPromiseRef.current
    }, [refreshSession, sessionResolved, user])

    // Idle background check, only for browsers that signed in before.
    useEffect(() => {
        if (!hasSessionHint()) return undefined
        let cancelled = false
        let retryTimer = 0
        const run = async (attempt) => {
            if (cancelled || sessionPromiseRef.current || authenticationInFlightRef.current) return
            const nextUser = await refreshSession({ timeoutMs: BACKGROUND_TIMEOUT_MS, background: true })
            // A cold Render instance takes 6–11 s; try once more after it has woken.
            if (!cancelled && !nextUser && attempt === 0 && hasSessionHint()) {
                retryTimer = window.setTimeout(() => run(1), BACKGROUND_RETRY_MS)
            }
        }
        const start = () => run(0)
        const idleId = 'requestIdleCallback' in window
            ? window.requestIdleCallback(start, { timeout: 3000 })
            : window.setTimeout(start, 1500)
        return () => {
            cancelled = true
            window.clearTimeout(retryTimer)
            if ('cancelIdleCallback' in window) window.cancelIdleCallback(idleId)
            window.clearTimeout(idleId)
        }
    }, [refreshSession])

    useEffect(() => () => activeRequestControllerRef.current?.abort(), [])

    const signIn = useCallback(async ({ credential, selectBy = '', loginEventId = '' }) => {
        const controller = replaceActiveRequestController()
        setIsLoading(true)

        try {
            const data = await signInWithGoogleCredential(
                { credential, selectBy, loginEventId },
                { signal: controller.signal }
            )
            if (activeRequestControllerRef.current !== controller) return null

            const nextUser = data.user || null
            if (!nextUser) throw new Error('Google Sign-In returned an empty user session.')

            setUser(nextUser)
            setSessionHint(true)
            setSessionResolved(true)
            void trackEvent('google_login_success', {
                provider: 'google',
                is_new_user: Boolean(data?.authMessage?.isNewUser),
            })

            return { user: nextUser, authMessage: data.authMessage || null }
        } finally {
            if (activeRequestControllerRef.current === controller) {
                activeRequestControllerRef.current = null
                setIsLoading(false)
            }
        }
    }, [replaceActiveRequestController])

    const closeAuthDialog = useCallback(() => {
        setAuthDialog((current) => ({ ...current, isOpen: false }))
        setAuthDialogError('')
        onAuthSuccessRef.current = null
    }, [])

    const openAuthDialog = useCallback(({ reason = 'navbar', onSuccess } = {}) => {
        if (user) {
            Promise.resolve(onSuccess?.(user)).catch(() => undefined)
            return
        }

        // A returning visitor whose idle check has not landed yet: ask the
        // backend first instead of showing a sign-in they do not need.
        if (!sessionResolved && hasSessionHint()) {
            const openerElement = document.activeElement instanceof HTMLElement ? document.activeElement : null
            void ensureSession().then((existingUser) => {
                if (existingUser) {
                    Promise.resolve(onSuccess?.(existingUser)).catch(() => undefined)
                    return
                }
                onAuthSuccessRef.current = typeof onSuccess === 'function' ? onSuccess : null
                setAuthDialogError('')
                setAuthDialog({ isOpen: true, reason, openerElement })
            })
            return
        }

        onAuthSuccessRef.current = typeof onSuccess === 'function' ? onSuccess : null
        setAuthDialogError('')
        setAuthDialog({
            isOpen: true,
            reason,
            openerElement: document.activeElement instanceof HTMLElement ? document.activeElement : null,
        })
    }, [ensureSession, sessionResolved, user])

    const handleGoogleCredential = useCallback(async (response) => {
        if (authenticationInFlightRef.current) return

        const credential = String(response?.credential || '').trim()
        if (!credential) {
            setAuthDialogError('Google did not return a valid credential. Please try again.')
            return
        }

        authenticationInFlightRef.current = true
        setIsAuthenticating(true)
        setAuthDialogError('')

        try {
            const result = await signIn({
                credential,
                selectBy: String(response?.select_by || '').trim(),
                loginEventId: globalThis.crypto?.randomUUID?.() || '',
            })
            if (!result?.user) return

            const successCallback = onAuthSuccessRef.current
            closeAuthDialog()
            toast.success(result.authMessage?.text || 'Signed in with Google')
            Promise.resolve(successCallback?.(result.user)).catch(() => undefined)
        } catch (error) {
            if (error?.name !== 'AbortError') {
                setAuthDialogError(error?.message || 'Unable to complete Google Sign-In.')
            }
        } finally {
            authenticationInFlightRef.current = false
            setIsAuthenticating(false)
        }
    }, [closeAuthDialog, signIn])

    const signOut = useCallback(async () => {
        const controller = replaceActiveRequestController()
        setIsLoading(true)
        setUser(null)
        setSessionHint(false)
        setSessionResolved(true)
        closeAuthDialog()
        disableGoogleAutoSelect()

        try {
            await logoutSession({ signal: controller.signal })
        } catch (error) {
            if (error?.name !== 'AbortError') {
                // Local state is cleared immediately; the server cookie still expires normally.
            }
        } finally {
            if (activeRequestControllerRef.current === controller) {
                activeRequestControllerRef.current = null
                setIsLoading(false)
            }
        }
    }, [closeAuthDialog, replaceActiveRequestController])

    const updateProfile = useCallback(async (payload) => {
        const controller = replaceActiveRequestController()

        try {
            const data = await updateAuthProfile(payload, { signal: controller.signal })
            if (activeRequestControllerRef.current !== controller) return null

            const nextUser = data.user || null
            setUser(nextUser)
            return nextUser
        } finally {
            if (activeRequestControllerRef.current === controller) {
                activeRequestControllerRef.current = null
            }
        }
    }, [replaceActiveRequestController])

    const uploadAvatar = useCallback(async (file) => {
        const controller = replaceActiveRequestController()

        try {
            const data = await uploadAuthAvatar(file, { signal: controller.signal })
            if (activeRequestControllerRef.current !== controller) return null
            const nextUser = data.user || null
            setUser(nextUser)
            return nextUser
        } finally {
            if (activeRequestControllerRef.current === controller) {
                activeRequestControllerRef.current = null
            }
        }
    }, [replaceActiveRequestController])

    const removeAvatar = useCallback(async () => {
        const controller = replaceActiveRequestController()

        try {
            const data = await deleteAuthAvatar({ signal: controller.signal })
            if (activeRequestControllerRef.current !== controller) return null
            const nextUser = data.user || null
            setUser(nextUser)
            return nextUser
        } finally {
            if (activeRequestControllerRef.current === controller) {
                activeRequestControllerRef.current = null
            }
        }
    }, [replaceActiveRequestController])

    const value = useMemo(
        () => ({
            user,
            isLoading,
            isAuthenticated: Boolean(user),
            sessionResolved,
            ensureSession,
            openAuthDialog,
            closeAuthDialog,
            signIn,
            signOut,
            updateProfile,
            uploadAvatar,
            removeAvatar,
            refreshSession,
        }),
        [
            user,
            isLoading,
            sessionResolved,
            ensureSession,
            openAuthDialog,
            closeAuthDialog,
            signIn,
            signOut,
            updateProfile,
            uploadAvatar,
            removeAvatar,
            refreshSession,
        ]
    )

    return (
        <AuthContext.Provider value={value}>
            {children}
            <GoogleAuthDialog
                error={authDialogError}
                isAuthenticating={isAuthenticating}
                isOpen={authDialog.isOpen}
                onClose={closeAuthDialog}
                onCredential={handleGoogleCredential}
                openerElement={authDialog.openerElement}
                reason={authDialog.reason}
            />
        </AuthContext.Provider>
    )
}

export const useAuthContext = () => {
    const context = useContext(AuthContext)
    if (!context) throw new Error('useAuthContext must be used within AuthProvider')
    return context
}

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
}

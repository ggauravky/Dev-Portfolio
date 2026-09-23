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

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
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

    const refreshSession = useCallback(async () => {
        const controller = replaceActiveRequestController()

        try {
            const data = await fetchCurrentSession({ signal: controller.signal })
            if (activeRequestControllerRef.current !== controller) return null

            const nextUser = data.user || null
            setUser(nextUser)
            return nextUser
        } catch (error) {
            if (error?.name !== 'AbortError' && activeRequestControllerRef.current === controller) {
                setUser(null)
            }
            return null
        } finally {
            if (activeRequestControllerRef.current === controller) {
                activeRequestControllerRef.current = null
                setIsLoading(false)
            }
        }
    }, [replaceActiveRequestController])

    useEffect(() => {
        void refreshSession()
    }, [refreshSession])

    useEffect(() => () => activeRequestControllerRef.current?.abort(), [])

    const signIn = useCallback(async ({ credential, selectBy = '' }) => {
        const controller = replaceActiveRequestController()
        setIsLoading(true)

        try {
            const data = await signInWithGoogleCredential(
                { credential, selectBy },
                { signal: controller.signal }
            )
            if (activeRequestControllerRef.current !== controller) return null

            const nextUser = data.user || null
            if (!nextUser) throw new Error('Google Sign-In returned an empty user session.')

            setUser(nextUser)
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

        onAuthSuccessRef.current = typeof onSuccess === 'function' ? onSuccess : null
        setAuthDialogError('')
        setAuthDialog({
            isOpen: true,
            reason,
            openerElement: document.activeElement instanceof HTMLElement ? document.activeElement : null,
        })
    }, [user])

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

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import {
    fetchCurrentSession,
    logoutSession,
    signInWithGoogleCredential,
    updateAuthProfile,
} from '../services/auth'

const AuthContext = createContext(null)

const clearPaymentFlowSessionState = () => {
    if (!globalThis.sessionStorage) {
        return
    }

    sessionStorage.removeItem('pendingCashfreeOrder')
    sessionStorage.removeItem('pendingSupportOrder')

    const keysToDelete = []
    for (let index = 0; index < sessionStorage.length; index += 1) {
        const key = sessionStorage.key(index)
        if (!key) {
            continue
        }

        if (key.startsWith('paymentActivityOpened:')) {
            keysToDelete.push(key)
        }
    }

    keysToDelete.forEach((key) => sessionStorage.removeItem(key))
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const activeRequestControllerRef = useRef(null)
    const previousUserEmailRef = useRef('')

    const replaceActiveRequestController = useCallback(() => {
        if (activeRequestControllerRef.current) {
            activeRequestControllerRef.current.abort()
        }

        const controller = new AbortController()
        activeRequestControllerRef.current = controller
        return controller
    }, [])

    const refreshSession = useCallback(async () => {
        const controller = replaceActiveRequestController()

        try {
            const data = await fetchCurrentSession({ signal: controller.signal })
            if (activeRequestControllerRef.current !== controller) {
                return null
            }

            const nextUser = data.user || null
            setUser(nextUser)
            return nextUser
        } catch (error) {
            if (error?.name === 'AbortError') {
                return null
            }

            if (activeRequestControllerRef.current === controller) {
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
        refreshSession()
    }, [refreshSession])

    useEffect(() => {
        return () => {
            if (activeRequestControllerRef.current) {
                activeRequestControllerRef.current.abort()
                activeRequestControllerRef.current = null
            }
        }
    }, [])

    const signIn = useCallback(async (credential) => {
        const controller = replaceActiveRequestController()
        setIsLoading(true)

        try {
            clearPaymentFlowSessionState()
            const data = await signInWithGoogleCredential(credential, { signal: controller.signal })

            if (activeRequestControllerRef.current !== controller) {
                return null
            }

            const nextUser = data.user || null
            setUser(nextUser)
            return {
                user: nextUser,
                authMessage: data.authMessage || null,
            }
        } catch (error) {
            if (error?.name === 'AbortError') {
                return null
            }

            if (activeRequestControllerRef.current === controller) {
                setUser(null)
            }

            throw error
        } finally {
            if (activeRequestControllerRef.current === controller) {
                activeRequestControllerRef.current = null
                setIsLoading(false)
            }
        }
    }, [replaceActiveRequestController])

    const signOut = useCallback(async () => {
        const controller = replaceActiveRequestController()
        setIsLoading(true)
        setUser(null)
        clearPaymentFlowSessionState()

        try {
            await logoutSession({ signal: controller.signal })
        } catch (error) {
            if (error?.name !== 'AbortError') {
                // Keep local sign-out behavior even if server logout request fails.
                // Session cookie cleanup still happens on the next auth refresh.
            }
        } finally {
            if (activeRequestControllerRef.current === controller) {
                activeRequestControllerRef.current = null
                setIsLoading(false)
            }
        }
    }, [replaceActiveRequestController])

    const updateProfile = useCallback(async (payload) => {
        const controller = replaceActiveRequestController()

        try {
            const data = await updateAuthProfile(payload, { signal: controller.signal })

            if (activeRequestControllerRef.current !== controller) {
                return null
            }

            const nextUser = data.user || null
            setUser(nextUser)
            return nextUser
        } catch (error) {
            if (error?.name === 'AbortError') {
                return null
            }
            throw error
        } finally {
            if (activeRequestControllerRef.current === controller) {
                activeRequestControllerRef.current = null
            }
        }
    }, [replaceActiveRequestController])

    useEffect(() => {
        const currentEmail = String(user?.email || '').trim().toLowerCase()
        const previousEmail = previousUserEmailRef.current

        if (previousEmail && currentEmail && previousEmail !== currentEmail) {
            clearPaymentFlowSessionState()
        }

        previousUserEmailRef.current = currentEmail
    }, [user?.email])

    const value = useMemo(
        () => ({
            user,
            isLoading,
            isAuthenticated: Boolean(user),
            signIn,
            signOut,
            updateProfile,
            refreshSession,
        }),
        [user, isLoading, signIn, signOut, updateProfile, refreshSession]
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuthContext = () => {
    const context = useContext(AuthContext)

    if (!context) {
        throw new Error('useAuthContext must be used within AuthProvider')
    }

    return context
}

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
}

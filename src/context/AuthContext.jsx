import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import {
    fetchCurrentSession,
    logoutSession,
    signInWithGoogleCredential,
} from '../services/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    const refreshSession = useCallback(async () => {
        try {
            const data = await fetchCurrentSession()
            setUser(data.user || null)
            return data.user || null
        } catch {
            setUser(null)
            return null
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        refreshSession()
    }, [refreshSession])

    const signIn = useCallback(async (credential) => {
        const data = await signInWithGoogleCredential(credential)
        setUser(data.user || null)
        return data.user || null
    }, [])

    const signOut = useCallback(async () => {
        try {
            await logoutSession()
        } finally {
            setUser(null)
        }
    }, [])

    const value = useMemo(
        () => ({
            user,
            isLoading,
            isAuthenticated: Boolean(user),
            signIn,
            signOut,
            refreshSession,
        }),
        [user, isLoading, signIn, signOut, refreshSession]
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

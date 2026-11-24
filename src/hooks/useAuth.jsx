import { useEffect } from 'react'
import { useAuthContext } from '../context/AuthContext'

/**
 * useAuth() reads the session without asking the backend.
 * useAuth({ requireSession: true }) is for pages that gate on auth (booking,
 * support, payment, activity): it starts the /api/auth/me check on mount and
 * reports isLoading until that check has answered (D-123).
 */
const useAuth = ({ requireSession = false } = {}) => {
    const auth = useAuthContext()
    const { ensureSession, sessionResolved } = auth

    useEffect(() => {
        if (requireSession && !sessionResolved) void ensureSession()
    }, [ensureSession, requireSession, sessionResolved])

    if (!requireSession) return auth
    return { ...auth, isLoading: auth.isLoading || !sessionResolved }
}

export default useAuth

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '')
const AUTH_REQUEST_TIMEOUT_MS = 12000

let cachedAuthConfigPromise = null

export class AuthApiError extends Error {
    constructor(message, { code = '', status = 0 } = {}) {
        super(message)
        this.name = 'AuthApiError'
        this.code = code
        this.status = status
    }
}

const parseJsonSafe = async (response) => {
    try {
        return await response.json()
    } catch {
        return null
    }
}

const requestAuthApi = async (endpoint, options = {}) => {
    const controller = new AbortController()
    const timeoutId = globalThis.setTimeout(() => controller.abort('timeout'), AUTH_REQUEST_TIMEOUT_MS)
    const externalSignal = options.signal
    const abortFromExternalSignal = () => controller.abort(externalSignal.reason)

    if (externalSignal?.aborted) abortFromExternalSignal()
    else externalSignal?.addEventListener('abort', abortFromExternalSignal, { once: true })

    const resolvedHeaders = { ...(options.headers || {}) }
    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData
    if (options.body && !isFormData && !resolvedHeaders['Content-Type']) {
        resolvedHeaders['Content-Type'] = 'application/json'
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            credentials: 'include',
            headers: resolvedHeaders,
            signal: controller.signal,
        })
        const payload = await parseJsonSafe(response)

        if (!response.ok || !payload?.success) {
            throw new AuthApiError(payload?.message || 'Authentication request failed', {
                code: payload?.code || '',
                status: response.status,
            })
        }

        return payload.data || {}
    } catch (error) {
        if (controller.signal.aborted && !externalSignal?.aborted) {
            throw new AuthApiError('Authentication request timed out. Please try again.', {
                code: 'AUTH_TIMEOUT',
            })
        }
        throw error
    } finally {
        clearTimeout(timeoutId)
        externalSignal?.removeEventListener('abort', abortFromExternalSignal)
    }
}

export const fetchCurrentSession = (options = {}) =>
    requestAuthApi('/api/auth/me', { method: 'GET', ...options })

export const signInWithGoogleCredential = ({ credential, selectBy = '' }, options = {}) =>
    requestAuthApi('/api/auth/google', {
        method: 'POST',
        body: JSON.stringify({ credential, selectBy }),
        ...options,
    })

export const fetchPublicAuthConfig = async ({ forceRefresh = false } = {}) => {
    if (forceRefresh) cachedAuthConfigPromise = null
    if (!cachedAuthConfigPromise) {
        cachedAuthConfigPromise = requestAuthApi('/api/auth/config', { method: 'GET' }).catch((error) => {
            cachedAuthConfigPromise = null
            throw error
        })
    }
    return cachedAuthConfigPromise
}

export const resetPublicAuthConfig = () => {
    cachedAuthConfigPromise = null
}

export const logoutSession = (options = {}) =>
    requestAuthApi('/api/auth/logout', {
        method: 'POST',
        body: JSON.stringify({}),
        ...options,
    })

export const fetchAuthProfile = (options = {}) =>
    requestAuthApi('/api/auth/profile', { method: 'GET', ...options })

export const updateAuthProfile = (payload, options = {}) =>
    requestAuthApi('/api/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify(payload || {}),
        ...options,
    })

export const uploadAuthAvatar = (file, options = {}) => {
    const formData = new FormData()
    formData.append('avatar', file)
    return requestAuthApi('/api/auth/profile/avatar', {
        method: 'POST',
        body: formData,
        ...options,
    })
}

export const deleteAuthAvatar = (options = {}) =>
    requestAuthApi('/api/auth/profile/avatar', {
        method: 'DELETE',
        ...options,
    })

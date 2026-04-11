const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '')
let cachedAuthConfig = null

const parseJsonSafe = async (response) => {
    try {
        return await response.json()
    } catch {
        return null
    }
}

const requestAuthApi = async (endpoint, options = {}) => {
    const resolvedHeaders = {
        'Content-Type': 'application/json',
    }

    if (options.headers) {
        Object.assign(resolvedHeaders, options.headers)
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        credentials: 'include',
        headers: resolvedHeaders,
        ...options,
    })

    const payload = await parseJsonSafe(response)

    if (!response.ok || !payload?.success) {
        throw new Error(payload?.message || 'Authentication request failed')
    }

    return payload.data || {}
}

export const fetchCurrentSession = async () => {
    return requestAuthApi('/api/auth/me', {
        method: 'GET',
    })
}

export const signInWithGoogleCredential = async (credential) => {
    return requestAuthApi('/api/auth/google', {
        method: 'POST',
        body: JSON.stringify({ credential }),
    })
}

export const fetchPublicAuthConfig = async () => {
    if (cachedAuthConfig) {
        return cachedAuthConfig
    }

    const data = await requestAuthApi('/api/auth/config', {
        method: 'GET',
    })

    cachedAuthConfig = data || {}
    return cachedAuthConfig
}

export const logoutSession = async () => {
    return requestAuthApi('/api/auth/logout', {
        method: 'POST',
        body: JSON.stringify({}),
    })
}

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '')

const parseJsonSafe = async (response) => {
    try {
        return await response.json()
    } catch {
        return null
    }
}

const requestSupportApi = async (endpoint, options = {}) => {
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
        throw new Error(payload?.message || 'Support request failed')
    }

    return payload.data || {}
}

export const fetchSupportStatus = async (slug) => {
    const querySlug = encodeURIComponent(String(slug || '').trim())
    return requestSupportApi(`/api/blog/support-status?slug=${querySlug}`, {
        method: 'GET',
    })
}

export const fetchSupportCounts = async (slugs) => {
    const list = Array.isArray(slugs) ? slugs.filter(Boolean) : []
    const query = encodeURIComponent(list.join(','))

    return requestSupportApi(`/api/blog/support-counts?slugs=${query}`, {
        method: 'GET',
    })
}

export const supportBlogPost = async ({ slug, title, content }) => {
    return requestSupportApi('/api/blog/support', {
        method: 'POST',
        body: JSON.stringify({ slug, title, content }),
    })
}

export const fetchMySupports = async () => {
    return requestSupportApi('/api/blog/my-supports', {
        method: 'GET',
    })
}

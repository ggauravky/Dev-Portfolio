const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '')

const assertResponse = async (response) => {
    let data = null

    try {
        data = await response.json()
    } catch {
        data = null
    }

    if (!response.ok || !data?.success) {
        const error = new Error(data?.message || 'Activity request failed')
        error.status = response.status
        error.payload = data
        throw error
    }

    return data
}

export const fetchMyActivityTimeline = async ({ cursor = '', limit = 100 } = {}) => {
    const query = new URLSearchParams()

    if (cursor) {
        query.set('cursor', String(cursor).trim())
    }

    if (limit) {
        query.set('limit', String(limit))
    }

    const queryString = query.toString()
    const endpoint = queryString
        ? `${API_URL}/api/activity/my?${queryString}`
        : `${API_URL}/api/activity/my`

    const response = await fetch(endpoint, {
        method: 'GET',
        credentials: 'include',
    })

    const data = await assertResponse(response)
    return data.data
}

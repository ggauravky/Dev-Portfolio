const DEFAULT_UMAMI_SCRIPT_URL = 'https://cloud.umami.is/script.js'
const UMAMI_SCRIPT_URL = String(import.meta.env.VITE_UMAMI_SCRIPT_URL || DEFAULT_UMAMI_SCRIPT_URL).trim()
const UMAMI_WEBSITE_ID = String(import.meta.env.VITE_UMAMI_WEBSITE_ID || '').trim()
const UMAMI_SCRIPT_SELECTOR = 'script[data-analytics-provider="umami"]'
const PAGEVIEW_DEDUPE_WINDOW_MS = 1200
const TRACKED_EVENT_KEYS_STORAGE = 'analytics:tracked-event-keys'

let scriptLoadPromise = null
let missingConfigWarned = false
let lastPageViewKey = ''
let lastPageViewAt = 0

const isBrowser = () => globalThis.window !== undefined && globalThis.document !== undefined

const isAnalyticsConfigured = () => Boolean(UMAMI_SCRIPT_URL && UMAMI_WEBSITE_ID)

const warnMissingConfig = () => {
    if (missingConfigWarned || !import.meta.env.DEV || typeof console?.info !== 'function') {
        return
    }

    missingConfigWarned = true
    console.info('[analytics] Umami disabled because VITE_UMAMI_WEBSITE_ID is not set.')
}

const getUmamiApi = () => {
    if (!isBrowser()) {
        return null
    }

    return globalThis.umami || null
}

const hasTrackApi = () => {
    const api = getUmamiApi()
    if (!api) {
        return false
    }

    if (typeof api.track === 'function') {
        return true
    }

    return typeof api === 'function'
}

const callUmamiPageView = () => {
    const api = getUmamiApi()
    if (!api) {
        return false
    }

    if (typeof api.track === 'function') {
        api.track()
        return true
    }

    if (typeof api === 'function') {
        api('track')
        return true
    }

    return false
}

const sanitizeEventData = (data) => {
    if (!data || typeof data !== 'object') {
        return undefined
    }

    const sanitized = {}

    Object.entries(data).forEach(([key, value]) => {
        const normalizedKey = String(key || '').trim()
        if (!normalizedKey) {
            return
        }

        if (typeof value === 'boolean') {
            sanitized[normalizedKey] = value
            return
        }

        if (typeof value === 'number' && Number.isFinite(value)) {
            sanitized[normalizedKey] = value
            return
        }

        if (typeof value === 'string') {
            const normalizedValue = value.trim()
            if (normalizedValue) {
                sanitized[normalizedKey] = normalizedValue.slice(0, 256)
            }
        }
    })

    return Object.keys(sanitized).length ? sanitized : undefined
}

const getTrackedEventKeys = () => {
    if (!isBrowser()) {
        return new Set()
    }

    try {
        const raw = globalThis.sessionStorage?.getItem(TRACKED_EVENT_KEYS_STORAGE)
        if (!raw) {
            return new Set()
        }

        const parsed = JSON.parse(raw)
        if (!Array.isArray(parsed)) {
            return new Set()
        }

        return new Set(parsed.map((item) => String(item || '').trim()).filter(Boolean))
    } catch {
        return new Set()
    }
}

const saveTrackedEventKeys = (eventKeys) => {
    if (!isBrowser()) {
        return
    }

    try {
        globalThis.sessionStorage?.setItem(TRACKED_EVENT_KEYS_STORAGE, JSON.stringify([...eventKeys]))
    } catch {
        // Ignore storage write failures.
    }
}

const callUmamiEvent = (eventName, eventData) => {
    const api = getUmamiApi()
    if (!api) {
        return false
    }

    if (typeof api.track === 'function') {
        if (eventData) {
            api.track(eventName, eventData)
        } else {
            api.track(eventName)
        }
        return true
    }

    if (typeof api === 'function') {
        if (eventData) {
            api('track', eventName, eventData)
        } else {
            api('track', eventName)
        }
        return true
    }

    return false
}

const ensureUmamiReady = async () => {
    if (!isBrowser()) {
        return false
    }

    if (!isAnalyticsConfigured()) {
        warnMissingConfig()
        return false
    }

    if (hasTrackApi()) {
        return true
    }

    if (!scriptLoadPromise) {
        scriptLoadPromise = new Promise((resolve) => {
            const finish = (isReady) => {
                resolve(Boolean(isReady))
            }

            const existingScript = document.querySelector(UMAMI_SCRIPT_SELECTOR)
            if (existingScript) {
                if (hasTrackApi() || existingScript.dataset.loaded === 'true') {
                    finish(true)
                    return
                }

                existingScript.addEventListener('load', () => finish(true), { once: true })
                existingScript.addEventListener('error', () => finish(false), { once: true })
                return
            }

            const script = document.createElement('script')
            script.src = UMAMI_SCRIPT_URL
            script.async = true
            script.defer = true
            script.dataset.analyticsProvider = 'umami'
            script.dataset.websiteId = UMAMI_WEBSITE_ID
            script.dataset.autoTrack = 'false'
            script.onload = () => {
                script.dataset.loaded = 'true'
                finish(true)
            }
            script.onerror = () => finish(false)
            document.head.appendChild(script)
        }).then((isReady) => {
            if (!isReady) {
                scriptLoadPromise = null
            }

            return isReady
        })
    }

    return scriptLoadPromise
}

export const initializeAnalytics = () => {
    void ensureUmamiReady()
}

export const trackPageView = async ({ pathname = '/', search = '' } = {}) => {
    const normalizedPathname = String(pathname || '/').trim() || '/'
    const normalizedSearch = String(search || '').trim()
    const pageKey = `${normalizedPathname}${normalizedSearch}`
    const now = Date.now()

    if (lastPageViewKey === pageKey && now - lastPageViewAt < PAGEVIEW_DEDUPE_WINDOW_MS) {
        return false
    }

    const isReady = await ensureUmamiReady()
    if (!isReady) {
        return false
    }

    try {
        const tracked = callUmamiPageView()
        if (tracked) {
            lastPageViewKey = pageKey
            lastPageViewAt = now
        }
        return tracked
    } catch {
        return false
    }
}

export const trackEvent = async (eventName, eventData = undefined) => {
    const normalizedName = String(eventName || '').trim()
    if (!normalizedName) {
        return false
    }

    const isReady = await ensureUmamiReady()
    if (!isReady) {
        return false
    }

    try {
        return callUmamiEvent(normalizedName, sanitizeEventData(eventData))
    } catch {
        return false
    }
}

export const trackEventOnce = async ({ eventName, eventData = undefined, eventKey = '' } = {}) => {
    const normalizedEventName = String(eventName || '').trim()
    const normalizedEventKey = String(eventKey || '').trim()

    if (!normalizedEventName) {
        return false
    }

    if (!normalizedEventKey) {
        return trackEvent(normalizedEventName, eventData)
    }

    const trackedEventKeys = getTrackedEventKeys()
    if (trackedEventKeys.has(normalizedEventKey)) {
        return false
    }

    const tracked = await trackEvent(normalizedEventName, eventData)
    if (!tracked) {
        return false
    }

    trackedEventKeys.add(normalizedEventKey)
    saveTrackedEventKeys(trackedEventKeys)
    return true
}

const GOOGLE_IDENTITY_SCRIPT_URL = 'https://accounts.google.com/gsi/client'
const SCRIPT_SELECTOR = `script[src="${GOOGLE_IDENTITY_SCRIPT_URL}"]`
const SCRIPT_TIMEOUT_MS = 12000

let googleScriptPromise = null
let initializedClientId = ''
let activeCredentialHandler = null

const getGoogleIdentityApi = () => globalThis.window?.google?.accounts?.id || null

const removeFailedScript = () => {
    const script = document.querySelector(SCRIPT_SELECTOR)
    if (script?.dataset.googleIdentityState === 'error') {
        script.remove()
    }
}

export const loadGoogleIdentity = ({ retry = false } = {}) => {
    if (!globalThis.window || !globalThis.document) {
        return Promise.reject(new Error('Google Sign-In requires a browser environment'))
    }

    if (getGoogleIdentityApi()) return Promise.resolve(getGoogleIdentityApi())

    if (retry) {
        googleScriptPromise = null
        removeFailedScript()
    }

    if (googleScriptPromise) return googleScriptPromise

    googleScriptPromise = new Promise((resolve, reject) => {
        let script = document.querySelector(SCRIPT_SELECTOR)
        const isExistingScript = Boolean(script)

        if (!script) {
            script = document.createElement('script')
            script.src = GOOGLE_IDENTITY_SCRIPT_URL
            script.async = true
            script.defer = true
            script.dataset.googleIdentity = 'true'
            script.dataset.googleIdentityState = 'loading'
        }

        let settled = false
        const cleanup = () => {
            clearTimeout(timeoutId)
            script.removeEventListener('load', handleLoad)
            script.removeEventListener('error', handleError)
        }
        const fail = () => {
            if (settled) return
            settled = true
            script.dataset.googleIdentityState = 'error'
            cleanup()
            reject(new Error('Unable to load Google Sign-In.'))
        }
        const handleLoad = () => {
            if (settled) return
            const api = getGoogleIdentityApi()
            if (!api) {
                fail()
                return
            }
            settled = true
            script.dataset.googleIdentityState = 'loaded'
            cleanup()
            resolve(api)
        }
        const handleError = () => fail()
        const timeoutId = globalThis.setTimeout(fail, SCRIPT_TIMEOUT_MS)

        script.addEventListener('load', handleLoad, { once: true })
        script.addEventListener('error', handleError, { once: true })

        if (isExistingScript && script.dataset.googleIdentityState === 'loaded') {
            handleLoad()
        } else if (!isExistingScript) {
            document.head.appendChild(script)
        }
    }).catch((error) => {
        googleScriptPromise = null
        throw error
    })

    return googleScriptPromise
}

export const initializeGoogleIdentity = async ({ clientId, onCredential, retry = false }) => {
    const normalizedClientId = String(clientId || '').trim()
    if (!normalizedClientId) throw new Error('Google Sign-In is not configured.')

    activeCredentialHandler = onCredential
    const api = await loadGoogleIdentity({ retry })

    if (initializedClientId !== normalizedClientId) {
        api.initialize({
            client_id: normalizedClientId,
            callback: (response) => activeCredentialHandler?.(response),
            auto_select: false,
            button_auto_select: false,
            use_fedcm_for_button: true,
            ux_mode: 'popup',
        })
        initializedClientId = normalizedClientId
    }

    return api
}

export const renderGoogleSignInButton = ({ api, container, width }) => {
    container.replaceChildren()
    api.renderButton(container, {
        type: 'standard',
        theme: 'filled_black',
        size: 'large',
        shape: 'pill',
        text: 'continue_with',
        logo_alignment: 'left',
        width,
    })
}

export const disableGoogleAutoSelect = () => {
    getGoogleIdentityApi()?.disableAutoSelect?.()
}

export const clearGoogleCredentialHandler = (handler) => {
    if (activeCredentialHandler === handler) activeCredentialHandler = null
}

export const _resetGoogleIdentityForTests = () => {
    googleScriptPromise = null
    initializedClientId = ''
    activeCredentialHandler = null
}

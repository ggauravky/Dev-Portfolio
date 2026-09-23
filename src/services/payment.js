const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '')
const RAZORPAY_SDK_URL = 'https://checkout.razorpay.com/v1/checkout.js'

let razorpaySdkPromise = null

const parseJsonSafe = async (response) => {
    try {
        return await response.json()
    } catch {
        return null
    }
}

const requestPaymentApi = async (endpoint, options = {}) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
        ...options,
    })
    const payload = await parseJsonSafe(response)
    if (!response.ok || !payload?.success) {
        const error = new Error(payload?.message || 'Payment request failed')
        error.status = response.status
        error.code = payload?.code || 'PAYMENT_REQUEST_FAILED'
        error.payload = payload
        throw error
    }
    return payload.data || {}
}

export const createPaymentOrder = (booking) => requestPaymentApi('/api/payment/create-order', {
    method: 'POST',
    body: JSON.stringify(booking),
})

export const createSupportPaymentOrder = (support) => requestPaymentApi('/api/payment/create-support-order', {
    method: 'POST',
    body: JSON.stringify(support),
})

export const verifyPayment = (payload) => requestPaymentApi('/api/payment/verify', {
    method: 'POST',
    body: JSON.stringify(payload),
})

export const recordPaymentFailure = (payload) => requestPaymentApi('/api/payment/failure', {
    method: 'POST',
    body: JSON.stringify(payload),
})

export const fetchPaymentTransaction = (transactionId) =>
    requestPaymentApi(`/api/payment/transaction/${encodeURIComponent(transactionId)}`, { method: 'GET' })

export const fetchPaymentReceipt = async (transactionId) => {
    const response = await fetch(`${API_URL}/api/payment/${encodeURIComponent(transactionId)}/receipt`, {
        method: 'GET',
        credentials: 'include',
    })
    if (!response.ok) {
        const payload = await parseJsonSafe(response)
        const error = new Error(payload?.message || 'Unable to download receipt')
        error.status = response.status
        throw error
    }
    return response.blob()
}

export const loadRazorpaySdk = () => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        return Promise.reject(new Error('Razorpay Checkout requires a browser'))
    }
    if (window.Razorpay) return Promise.resolve(window.Razorpay)
    if (razorpaySdkPromise) return razorpaySdkPromise

    razorpaySdkPromise = new Promise((resolve, reject) => {
        const existing = document.querySelector('script[data-razorpay-checkout="true"]')
        let timeoutId
        const finish = (callback) => {
            window.clearTimeout(timeoutId)
            callback()
        }
        const handleLoad = () => finish(() => window.Razorpay
            ? resolve(window.Razorpay)
            : reject(new Error('Razorpay Checkout did not initialize')))
        const handleError = () => {
            window.clearTimeout(timeoutId)
            document.querySelector('script[data-razorpay-checkout="true"]')?.remove()
            reject(new Error('Unable to load Razorpay Checkout'))
        }

        timeoutId = window.setTimeout(() => {
            document.querySelector('script[data-razorpay-checkout="true"]')?.remove()
            reject(new Error('Razorpay Checkout took too long to load'))
        }, 12000)

        if (existing) {
            existing.addEventListener('load', handleLoad, { once: true })
            existing.addEventListener('error', handleError, { once: true })
            return
        }

        const script = document.createElement('script')
        script.src = RAZORPAY_SDK_URL
        script.async = true
        script.dataset.razorpayCheckout = 'true'
        script.addEventListener('load', handleLoad, { once: true })
        script.addEventListener('error', handleError, { once: true })
        document.head.appendChild(script)
    }).catch((error) => {
        razorpaySdkPromise = null
        throw error
    })

    return razorpaySdkPromise
}

export const openRazorpayCheckout = async ({ order, onOpen }) => {
    const RazorpayCheckout = await loadRazorpaySdk()

    return new Promise((resolve, reject) => {
        let settled = false
        const settle = (value) => {
            if (settled) return
            settled = true
            resolve(value)
        }

        try {
            const checkout = new RazorpayCheckout({
                key: order.keyId,
                amount: order.amountPaise,
                currency: order.currency,
                name: 'Gaurav Kumar Yadav',
                description: order.flowType === 'support' ? "Support Gaurav's Work" : order.serviceName,
                order_id: order.razorpayOrderId,
                prefill: order.prefill,
                theme: { color: '#9fc51d' },
                handler: (response) => settle({ type: 'success', response }),
                modal: { ondismiss: () => settle({ type: 'dismissed' }), escape: true },
            })

            checkout.on('payment.failed', (response) => settle({ type: 'failed', response: response?.error || {} }))
            onOpen?.()
            checkout.open()
        } catch (error) {
            reject(error)
        }
    })
}

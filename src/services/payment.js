// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '')
const CASHFREE_SDK_SRC = 'https://sdk.cashfree.com/js/v3/cashfree.js'

const assertResponse = async (response) => {
    let data = null

    try {
        data = await response.json()
    } catch {
        data = null
    }

    if (!response.ok || !data?.success) {
        const error = new Error(data?.message || 'Payment request failed')
        error.status = response.status
        error.payload = data
        throw error
    }

    return data
}

export const createCashfreeOrder = async (payload) => {
    const response = await fetch(`${API_URL}/api/payment/create-order`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    })

    const data = await assertResponse(response)
    return data.data
}

export const verifyCashfreePayment = async (orderId, email) => {
    const response = await fetch(`${API_URL}/api/payment/verify`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId, email }),
    })

    const data = await assertResponse(response)
    return data.data
}

export const createSupportOrder = async (payload) => {
    const response = await fetch(`${API_URL}/api/payment/create-support-order`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    })

    const data = await assertResponse(response)
    return data.data
}

export const verifySupportPayment = async (orderId, email) => {
    const response = await fetch(`${API_URL}/api/payment/verify-support`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId, email }),
    })

    const data = await assertResponse(response)
    return data.data
}

export const fetchMyBookings = async () => {
    const response = await fetch(`${API_URL}/api/payment/my-bookings`, {
        method: 'GET',
        credentials: 'include',
    })

    const data = await assertResponse(response)
    return data.data
}

export const fetchMySupportPayments = async () => {
    const response = await fetch(`${API_URL}/api/payment/my-support-payments`, {
        method: 'GET',
        credentials: 'include',
    })

    const data = await assertResponse(response)
    return data.data
}

const assertBlobResponse = async (response) => {
    if (!response.ok) {
        let data = null

        try {
            data = await response.json()
        } catch {
            data = null
        }

        const error = new Error(data?.message || 'Unable to download receipt PDF')
        error.status = response.status
        error.payload = data
        throw error
    }

    return response.blob()
}

export const fetchServiceReceiptPdf = async (orderId, email) => {
    const normalizedEmail = String(email || '').trim()
    const endpoint = `${API_URL}/api/payment/receipt/service/${encodeURIComponent(String(orderId || '').trim())}`
    const receiptUrl = normalizedEmail
        ? `${endpoint}?email=${encodeURIComponent(normalizedEmail)}`
        : endpoint

    const response = await fetch(receiptUrl, {
        method: 'GET',
        credentials: 'include',
    })

    return assertBlobResponse(response)
}

export const fetchSupportReceiptPdf = async (orderId, email) => {
    const normalizedEmail = String(email || '').trim()
    const endpoint = `${API_URL}/api/payment/receipt/support/${encodeURIComponent(String(orderId || '').trim())}`
    const receiptUrl = normalizedEmail
        ? `${endpoint}?email=${encodeURIComponent(normalizedEmail)}`
        : endpoint

    const response = await fetch(receiptUrl, {
        method: 'GET',
        credentials: 'include',
    })

    return assertBlobResponse(response)
}

export const loadCashfreeSdk = () =>
    new Promise((resolve, reject) => {
        if (!globalThis.document) {
            reject(new Error('Browser environment is required for payment checkout'))
            return
        }

        if (globalThis.Cashfree) {
            resolve(globalThis.Cashfree)
            return
        }

        const existingScript = globalThis.document.querySelector(`script[src="${CASHFREE_SDK_SRC}"]`)
        if (existingScript) {
            existingScript.addEventListener('load', () => resolve(globalThis.Cashfree))
            existingScript.addEventListener('error', () => reject(new Error('Unable to load Cashfree checkout SDK')))
            return
        }

        const script = globalThis.document.createElement('script')
        script.src = CASHFREE_SDK_SRC
        script.async = true
        script.onload = () => {
            if (globalThis.Cashfree) {
                resolve(globalThis.Cashfree)
            } else {
                reject(new Error('Cashfree SDK loaded but not initialized'))
            }
        }
        script.onerror = () => reject(new Error('Unable to load Cashfree checkout SDK'))
        globalThis.document.body.appendChild(script)
    })

export const openCashfreeCheckout = async ({ paymentSessionId, environment }) => {
    const Cashfree = await loadCashfreeSdk()

    const mode = String(environment || 'sandbox').toLowerCase() === 'production' ? 'production' : 'sandbox'
    const cashfree = Cashfree({ mode })

    return cashfree.checkout({
        paymentSessionId,
        redirectTarget: '_modal',
        components: ['order-details', 'card', 'upi', 'netbanking', 'app', 'paylater'],
    })
}

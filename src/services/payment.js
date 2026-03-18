// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '')

export const loadRazorpayScript = () => {
    if (window.Razorpay) return Promise.resolve(true)

    return new Promise((resolve) => {
        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.async = true
        script.onload = () => resolve(true)
        script.onerror = () => resolve(false)
        document.body.appendChild(script)
    })
}

export const createPaymentOrder = async (payload) => {
    const response = await fetch(`${apiBase}/api/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    })

    const data = await response.json()
    if (!response.ok) {
        throw new Error(data.message || 'Failed to create payment order')
    }

    return data
}

export const verifyPayment = async (payload) => {
    const response = await fetch(`${apiBase}/api/payment/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    })

    const data = await response.json()
    if (!response.ok) {
        throw new Error(data.message || 'Payment verification failed')
    }

    return data
}

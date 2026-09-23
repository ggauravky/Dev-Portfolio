// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <AuthProvider>
            <App />
        </AuthProvider>
    </React.StrictMode>,
)

// ── Service Worker registration ─────────────────────────────────────────────
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker
            .register('/sw.js', { scope: '/', updateViaCache: 'none' })
            .then((registration) => {
                console.info('[PWA] Service worker registered with scope:', registration.scope)
            })
            .catch((error) => {
                console.error('[PWA] Service worker registration failed:', error)
            })
    }
}

async function clearDevelopmentServiceWorker() {
    if (!('serviceWorker' in navigator)) return

    try {
        const registrations = await navigator.serviceWorker.getRegistrations()
        await Promise.all(registrations.map((registration) => registration.unregister()))

        if ('caches' in window) {
            const cacheNames = await caches.keys()
            await Promise.all(
                cacheNames
                    .filter((name) => name.startsWith('portfolio-offline-'))
                    .map((name) => caches.delete(name)),
            )
        }
    } catch (error) {
        console.warn('[PWA] Development service worker cleanup failed:', error)
    }
}

if (typeof document !== 'undefined') {
    const initializeServiceWorker = import.meta.env.PROD
        ? registerServiceWorker
        : clearDevelopmentServiceWorker

    if (document.readyState === 'complete') {
        void initializeServiceWorker()
    } else {
        window.addEventListener('load', () => void initializeServiceWorker(), { once: true })
    }
}

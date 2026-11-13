// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import './index.css'
import './styles/page.css'
// All CSS ships as one render-blocking file (cssCodeSplit: false, D-046), so the
// Home hero shell in index.html is styled before the app boots (D-044).

// Boot the app only after the first paint. On "/" the static hero shell paints
// first, so FCP/LCP don't wait for the React/vendor bundles (D-044). On "/" it
// also waits for the web fonts and their paint (capped at 1.5 s; the hero has
// no image since D-074), so the final hero paint (the LCP) is the shell's, not
// React's identical copy of it. A hidden tab gets no rAF, so it boots at once.
let booted = false
const boot = () => {
    if (booted) return
    booted = true
    import('./boot.jsx').catch(() => {
        // A stale-deploy chunk 404 or a network blip would leave the page dead:
        // reload once per session to pick up the current build.
        try {
            if (sessionStorage.getItem('gky-boot-retry')) return
            sessionStorage.setItem('gky-boot-retry', '1')
        } catch {
            return
        }
        window.location.reload()
    })
}

const SHELL_WAIT_MS = 1500

// The three faces the hero uses. `document.fonts.ready` isn't enough: it
// resolves at once if a face hasn't started loading yet.
const SHELL_FONTS = ['460 56px Fraunces', '400 17px Geist', '400 13px "Geist Mono"']

const afterPaint = (fn) => requestAnimationFrame(() => setTimeout(fn, 0))

// Resolve once the settled hero has actually been painted: the browser reports
// that paint as a largest-contentful-paint entry. If no new entry comes (it was
// already painted), go after 300 ms.
const settledPaint = () => new Promise((resolve) => {
    const supported = typeof PerformanceObserver !== 'undefined'
        && PerformanceObserver.supportedEntryTypes?.includes('largest-contentful-paint')
    if (!supported) {
        afterPaint(resolve)
        return
    }
    let timer = 0
    const observer = new PerformanceObserver(() => {
        clearTimeout(timer)
        timer = setTimeout(done, 50)
    })
    function done() {
        observer.disconnect()
        resolve()
    }
    observer.observe({ type: 'largest-contentful-paint' })
    timer = setTimeout(done, 300)
})

// A static shell is painted before any JS: the Home hero (D-044) or a
// /projects route shell (D-057). Either way JS waits until it has settled, so
// the page's first content never competes with the bundle for bandwidth.
const homeShell = () => document.documentElement.classList.contains('route-home')
const routeShell = () => Boolean(document.getElementById('route-shell'))

const shellSettled = () => {
    const fonts = document.fonts
        ? Promise.all(SHELL_FONTS.map((font) => document.fonts.load(font).catch(() => {})))
        : Promise.resolve()
    const cap = new Promise((resolve) => { setTimeout(resolve, SHELL_WAIT_MS) })
    return Promise.race([fonts.then(settledPaint), cap])
}

// A route with a shell also fetches its own chunk alongside boot, not after it
// (D-056); App's route loader reuses the same module (src/lib/routeChunks.js).
const ROUTE_CHUNKS = [
    [/^\/projects\/?$/, () => import('./pages/Projects')],
    [/^\/projects\/[^/]+\/?$/, () => import('./pages/ProjectDetail')],
    [/^\/about\/?$/, () => import('./pages/About')],
    [/^\/skills\/?$/, () => import('./pages/Skills')],
    [/^\/journey\/?$/, () => import('./pages/Journey')],
    [/^\/services\/?$/, () => import('./pages/Services')],
    [/^\/blog\/?$/, () => import('./pages/Blog')],
    [/^\/contact\/?$/, () => import('./pages/Contact')],
    [/^\/blog\/[^/]+\/?$/, () => import('./pages/BlogPost')],
    [/^\/(services\/[^/]+|frontend-development|backend-development|full-stack-development|ai-data-science-guidance)\/?$/, () => import('./pages/ServiceDetail')],
]

const start = () => {
    const route = ROUTE_CHUNKS.find(([re]) => re.test(location.pathname))
    if (route) route[1]().catch(() => {})
    boot()
}

if (!homeShell() && !routeShell()) start()
else if (document.visibilityState === 'hidden') start()
else {
    // If the tab is hidden mid-wait, rAF stops: boot straight away instead.
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') start()
    }, { once: true })
    afterPaint(() => shellSettled().then(start))
}

// ── Service Worker registration ─────────────────────────────────────────────
function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return

    navigator.serviceWorker
        .register('/sw.js', { scope: '/', updateViaCache: 'none' })
        .then((registration) => {
            console.info('[PWA] Service worker registered with scope:', registration.scope)
        })
        .catch((error) => {
            console.error('[PWA] Service worker registration failed:', error)
        })
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

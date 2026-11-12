// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// App bootstrap, loaded by main.jsx after the first paint (D-044). React
// replaces the static Home hero shell inside #root on mount.

import React, { startTransition } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { preloadRoute } from './lib/routeChunks'

// The first render runs as a transition, so React time-slices it instead of
// one long main-thread task (TBT). The page is already painted (the shell on
// "/"), so nothing waits on it visually.
// A route with a static shell (scripts/route-shells.js, D-057) waits for its
// chunk (already downloading since main.jsx), so the first commit is the real
// page replacing the shell, never an empty Suspense fallback. Capped at 3 s.
const ROUTE_WAIT_MS = 3000
const routeReady = Promise.race([
    preloadRoute(window.location.pathname),
    new Promise((resolve) => { setTimeout(resolve, ROUTE_WAIT_MS) }),
])

routeReady.then(() => {
    const root = ReactDOM.createRoot(document.getElementById('root'))
    startTransition(() => {
        root.render(
            <React.StrictMode>
                <AuthProvider>
                    <App />
                </AuthProvider>
            </React.StrictMode>,
        )
    })
})

// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// App bootstrap, loaded by main.jsx after the first paint (D-044). React
// replaces the static Home hero shell inside #root on mount.

import React, { startTransition } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'

// The first render runs as a transition, so React time-slices it instead of
// one long main-thread task (TBT). The page is already painted (the shell on
// "/"), so nothing waits on it visually.
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

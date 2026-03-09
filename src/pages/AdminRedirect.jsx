// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { useEffect } from 'react'

function AdminRedirect() {
    useEffect(() => {
        // Redirect to external admin panel (replaces current history entry)
        window.location.replace('https://ggauravkyadmin.vercel.app/')
    }, [])

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            background: '#0f172a',
            color: '#e2e8f0',
            fontSize: '1.2rem',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
            <div style={{ textAlign: 'center' }}>
                <svg style={{ width: '3rem', height: '3rem', margin: '0 auto 1rem', display: 'block', color: '#94a3b8' }} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>
                <p>Redirecting to Admin Panel...</p>
            </div>
        </div>
    )
}

export default AdminRedirect

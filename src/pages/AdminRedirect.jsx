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
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎭</div>
                <p>Redirecting to Admin Panel...</p>
            </div>
        </div>
    )
}

export default AdminRedirect

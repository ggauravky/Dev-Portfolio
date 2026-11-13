// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { Component } from 'react'
import { Button } from './ui'

class ErrorBoundary extends Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null, errorInfo: null }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true }
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo)
        this.setState({
            error: error,
            errorInfo: errorInfo
        })
    }

    render() {
        if (this.state.hasError) {
            // v2 (P6): same layout as the 404 page; plain links/buttons so it
            // still renders if the router itself is what failed.
            return (
                <main className="pg">
                    <header className="pg-head page-wrap page-grid">
                        <p className="page-rail pg-head__rail"><span>Error</span></p>
                        <div className="page-main">
                            <h1 className="pg-h1">Something broke</h1>
                            <p className="pg-lede">This page hit an unexpected error. Reloading usually fixes it.</p>
                            <div className="pg-actions">
                                <Button onClick={() => window.location.reload()}>Reload page</Button>
                                <Button href="/" variant="secondary">Home</Button>
                            </div>
                            {import.meta.env.DEV && this.state.error && (
                                <details className="eb-details">
                                    <summary>Error details (development only)</summary>
                                    <pre>
                                        {this.state.error.toString()}
                                        {'\n\n'}
                                        {this.state.errorInfo?.componentStack}
                                    </pre>
                                </details>
                            )}
                        </div>
                    </header>
                </main>
            )
        }

        return this.props.children
    }
}

export default ErrorBoundary

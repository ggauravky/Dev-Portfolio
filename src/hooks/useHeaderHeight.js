// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Dynamic Header Height Measurement Hook
// Source: https://github.com/ggauravky/Dev-Portfolio

import { useState, useEffect } from 'react'

/**
 * Custom hook to dynamically measure and observe the total visible height of #site-header.
 * Automatically updates when the announcement banner is toggled/dismissed, window resizes,
 * or responsive layout changes occur.
 */
export function useHeaderHeight() {
    const [headerHeight, setHeaderHeight] = useState(() => {
        if (typeof document === 'undefined') return 0
        const el = document.getElementById('site-header')
        return el ? Math.round(el.getBoundingClientRect().height || el.offsetHeight) : 0
    })

    useEffect(() => {
        if (typeof window === 'undefined') return

        const updateHeight = () => {
            const el = document.getElementById('site-header')
            if (el) {
                const rect = el.getBoundingClientRect()
                const height = Math.round(rect.height || el.offsetHeight || 0)
                setHeaderHeight(height)
            } else {
                setHeaderHeight(0)
            }
        }

        // Initial measurement
        updateHeight()

        // Setup ResizeObserver on #site-header element
        let resizeObserver = null
        const headerEl = document.getElementById('site-header')

        if (headerEl && typeof ResizeObserver !== 'undefined') {
            resizeObserver = new ResizeObserver(() => {
                updateHeight()
            })
            resizeObserver.observe(headerEl)
        }

        // Listen for window resize and scroll events
        window.addEventListener('resize', updateHeight, { passive: true })
        window.addEventListener('scroll', updateHeight, { passive: true })

        // Setup MutationObserver to detect DOM additions/removals inside body/header (e.g. banner dismiss)
        const mutationObserver = new MutationObserver(() => {
            updateHeight()
        })
        mutationObserver.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true
        })

        return () => {
            if (resizeObserver) resizeObserver.disconnect()
            mutationObserver.disconnect()
            window.removeEventListener('resize', updateHeight)
            window.removeEventListener('scroll', updateHeight)
        }
    }, [])

    return headerHeight
}

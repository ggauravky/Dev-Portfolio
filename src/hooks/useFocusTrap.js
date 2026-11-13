// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { useEffect, useRef } from 'react'

const FOCUSABLE = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'iframe',
    '[tabindex]:not([tabindex="-1"])',
].join(',')

const isVisible = (el) => el.getClientRects().length > 0

// Open traps, innermost last. Only the top one handles Tab/Escape, so ⌘K over the
// open drawer doesn't run two traps at once.
const stack = []

/**
 * Keeps Tab inside `containerRef` while `active`, closes on Escape, and returns
 * focus to whatever was focused when it opened (or `returnFocusTo`).
 * Used by the mobile drawer, the ⌘K palette and the sign-in dialog.
 */
export function useFocusTrap(containerRef, active, { onEscape, initialFocusRef, returnFocusTo } = {}) {
    // Latest callbacks without re-running the effect on every render.
    const onEscapeRef = useRef(onEscape)
    onEscapeRef.current = onEscape

    useEffect(() => {
        if (!active) return undefined
        const container = containerRef.current
        if (!container) return undefined

        const opener = returnFocusTo || (document.activeElement instanceof HTMLElement ? document.activeElement : null)
        const focusables = () => [...container.querySelectorAll(FOCUSABLE)].filter(isVisible)

        const target = initialFocusRef?.current || focusables()[0]
        target?.focus({ preventScroll: true })

        const handleKeyDown = (event) => {
            if (stack.at(-1) !== container) return
            if (event.key === 'Escape' && onEscapeRef.current) {
                event.preventDefault()
                onEscapeRef.current()
                return
            }
            if (event.key !== 'Tab') return

            const items = focusables()
            if (!items.length) {
                event.preventDefault()
                return
            }
            const first = items[0]
            const last = items.at(-1)
            const current = document.activeElement
            if (!container.contains(current)) {
                event.preventDefault()
                first.focus()
            } else if (event.shiftKey && current === first) {
                event.preventDefault()
                last.focus()
            } else if (!event.shiftKey && current === last) {
                event.preventDefault()
                first.focus()
            }
        }

        stack.push(container)
        document.addEventListener('keydown', handleKeyDown)
        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            stack.splice(stack.lastIndexOf(container), 1)
            if (opener?.isConnected) opener.focus({ preventScroll: true })
        }
    }, [active, containerRef, initialFocusRef, returnFocusTo])
}

export default useFocusTrap

// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Custom Hook for Radial Context Menu Triggers
// Source: https://github.com/ggauravky/Dev-Portfolio

import { useState, useEffect, useCallback, useRef } from 'react'
import { isInteractiveTarget } from '../utils/radialConfig'

export function useContextMenu() {
    const [isOpen, setIsOpen] = useState(false)
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [triggerType, setTriggerType] = useState('mouse')
    const longPressTimerRef = useRef(null)
    const touchStartPosRef = useRef({ x: 0, y: 0 })

    const handleOpen = useCallback((x, y, type = 'mouse') => {
        setPosition({ x, y })
        setTriggerType(type)
        setIsOpen(true)
    }, [])

    const handleClose = useCallback(() => {
        setIsOpen(false)
    }, [])

    // Desktop Right Click Listener
    useEffect(() => {
        const handleContextMenu = (e) => {
            if (isInteractiveTarget(e.target)) {
                if (isOpen) handleClose()
                return // Allow native context menu
            }

            e.preventDefault()
            handleOpen(e.clientX, e.clientY, 'mouse')
        }

        window.addEventListener('contextmenu', handleContextMenu, { capture: true })
        return () => window.removeEventListener('contextmenu', handleContextMenu, { capture: true })
    }, [isOpen, handleOpen, handleClose])

    // Mobile / Tablet Touch Long-Press Listener
    useEffect(() => {
        const handleTouchStart = (e) => {
            if (e.touches.length !== 1) return
            const touch = e.touches[0]
            if (isInteractiveTarget(e.target)) return

            touchStartPosRef.current = { x: touch.clientX, y: touch.clientY }

            longPressTimerRef.current = setTimeout(() => {
                if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
                    try {
                        window.navigator.vibrate(30)
                    } catch (_) {
                        // ignore vibration errors
                    }
                }
                handleOpen(touch.clientX, touch.clientY, 'touch')
            }, 500)
        }

        const handleTouchMove = (e) => {
            if (!longPressTimerRef.current) return
            const touch = e.touches[0]
            const dx = Math.abs(touch.clientX - touchStartPosRef.current.x)
            const dy = Math.abs(touch.clientY - touchStartPosRef.current.y)

            if (dx > 10 || dy > 10) {
                clearTimeout(longPressTimerRef.current)
                longPressTimerRef.current = null
            }
        }

        const handleTouchEnd = () => {
            if (longPressTimerRef.current) {
                clearTimeout(longPressTimerRef.current)
                longPressTimerRef.current = null
            }
        }

        window.addEventListener('touchstart', handleTouchStart, { passive: true })
        window.addEventListener('touchmove', handleTouchMove, { passive: true })
        window.addEventListener('touchend', handleTouchEnd, { passive: true })
        window.addEventListener('touchcancel', handleTouchEnd, { passive: true })

        return () => {
            window.removeEventListener('touchstart', handleTouchStart)
            window.removeEventListener('touchmove', handleTouchMove)
            window.removeEventListener('touchend', handleTouchEnd)
            window.removeEventListener('touchcancel', handleTouchEnd)
        }
    }, [handleOpen])

    // Auto-close listeners (ESC, scroll, resize)
    useEffect(() => {
        if (!isOpen) return

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                handleClose()
            }
        }

        const handleScroll = () => {
            handleClose()
        }

        const handleResize = () => {
            handleClose()
        }

        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('scroll', handleScroll, { passive: true })
        window.addEventListener('resize', handleResize, { passive: true })

        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('scroll', handleScroll)
            window.removeEventListener('resize', handleResize)
        }
    }, [isOpen, handleClose])

    return {
        isOpen,
        position,
        triggerType,
        handleClose,
        handleOpen
    }
}

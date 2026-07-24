// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Minimal & Premium Contextual Radial Navigation Command Menu Overlay
// Source: https://github.com/ggauravky/Dev-Portfolio

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { RADIAL_ITEMS, RADIAL_CENTER_ACTION } from '../../utils/radialConfig'
import { useContextMenu } from '../../hooks/useContextMenu'
import { useViewportBounds } from '../../hooks/useViewportBounds'
import RadialMenuItem from './RadialMenuItem'

export default function RadialMenu() {
    const navigate = useNavigate()
    const location = useLocation()
    const { isOpen, position, handleClose } = useContextMenu()

    const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 640 : false))

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 640)
        window.addEventListener('resize', checkMobile, { passive: true })
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    const radius = isMobile ? 95 : 125
    const totalOuterRadius = radius + 36

    const { clampedX, clampedY, startAngle, sweepAngle } = useViewportBounds(position.x, position.y, totalOuterRadius, 20)

    const [hoveredItem, setHoveredItem] = useState(null)
    const [focusedIndex, setFocusedIndex] = useState(-1)
    const menuRef = useRef(null)

    const reducedMotion = useMemo(() => {
        if (typeof window === 'undefined') return false
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    }, [])

    useEffect(() => {
        if (isOpen) {
            setFocusedIndex(-1)
            setHoveredItem(null)
        }
    }, [isOpen])

    const handleSelectItem = useCallback(
        (item) => {
            handleClose()

            if (!item) return

            if (item.type === 'internal' && item.route) {
                navigate(item.route)
                toast.success(`Navigated to ${item.title}`, { id: 'radial-nav' })
            } else if (item.type === 'external' && item.url) {
                window.open(item.url, '_blank', 'noopener,noreferrer')
                toast.success(`Opened ${item.title}`, { id: 'radial-ext' })
            } else if (item.type === 'action') {
                if (item.actionId === 'download-resume') {
                    const link = document.createElement('a')
                    link.href = '/resume.pdf'
                    link.target = '_blank'
                    link.rel = 'noopener noreferrer'
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                    toast.success('Opening Official Resume...', { id: 'radial-resume' })
                } else if (item.actionId === 'open-command-palette') {
                    window.dispatchEvent(new CustomEvent('open-command-palette'))
                    toast.success('Command Palette Opened (Cmd + K)', { id: 'radial-cmd' })
                }
            }
        },
        [navigate, handleClose]
    )

    const handleCenterClick = (e) => {
        e.stopPropagation()
        handleClose()
        window.dispatchEvent(new CustomEvent('open-command-palette'))
        toast.success('Command Palette Opened', { id: 'radial-cmd' })
    }

    useEffect(() => {
        if (!isOpen) return

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault()
                handleClose()
                return
            }

            if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || (e.key === 'Tab' && !e.shiftKey)) {
                e.preventDefault()
                setFocusedIndex((prev) => (prev + 1) % RADIAL_ITEMS.length)
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey)) {
                e.preventDefault()
                setFocusedIndex((prev) => (prev - 1 + RADIAL_ITEMS.length) % RADIAL_ITEMS.length)
            } else if (e.key === 'Enter' || e.key === 'Space') {
                e.preventDefault()
                if (focusedIndex >= 0 && focusedIndex < RADIAL_ITEMS.length) {
                    handleSelectItem(RADIAL_ITEMS[focusedIndex])
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, focusedIndex, handleSelectItem, handleClose])

    useEffect(() => {
        if (focusedIndex >= 0 && focusedIndex < RADIAL_ITEMS.length) {
            setHoveredItem(RADIAL_ITEMS[focusedIndex])
        }
    }, [focusedIndex])

    const CenterIcon = RADIAL_CENTER_ACTION.icon

    return (
        <AnimatePresence>
            {isOpen && (
                <div
                    ref={menuRef}
                    role="menu"
                    aria-label="Contextual Radial Command Menu"
                    aria-expanded={isOpen}
                    onClick={handleClose}
                    onContextMenu={(e) => {
                        e.preventDefault()
                        handleClose()
                    }}
                    className="fixed inset-0 z-[100] h-screen w-screen cursor-default overflow-hidden select-none"
                >
                    {/* Minimal Blur Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
                    />

                    {/* Subtle Click Ripple */}
                    <motion.div
                        initial={{ scale: 0, opacity: 0.6 }}
                        animate={{ scale: 2.2, opacity: 0 }}
                        transition={{ duration: 0.28, ease: 'easeOut' }}
                        style={{ left: position.x, top: position.y }}
                        className="pointer-events-none absolute -ml-5 -mt-5 h-10 w-10 rounded-full border border-toxic/50 bg-toxic/10 shadow-[0_0_15px_rgba(197,248,42,0.2)]"
                    />

                    {/* Outer Radial Ring Guideline — Subdued positioning guide */}
                    <motion.div
                        initial={{ scale: 0.4, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.4, opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        style={{
                            left: clampedX,
                            top: clampedY,
                            width: radius * 2,
                            height: radius * 2,
                            marginLeft: -radius,
                            marginTop: -radius
                        }}
                        className="pointer-events-none absolute rounded-full border border-zinc-800/35 bg-slate-950/[0.04]"
                    />

                    {/* Center Action Hub & Outer Items Anchor */}
                    <div
                        style={{ left: clampedX, top: clampedY }}
                        className="absolute pointer-events-auto z-10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Center Action Hub (Command Palette) */}
                        <motion.button
                            type="button"
                            role="menuitem"
                            aria-label={RADIAL_CENTER_ACTION.title}
                            onClick={handleCenterClick}
                            initial={{ scale: 0.4, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.4, opacity: 0 }}
                            transition={
                                reducedMotion
                                    ? { duration: 0.1 }
                                    : { type: 'spring', stiffness: 480, damping: 26, mass: 0.8 }
                            }
                            className="group absolute -ml-7 -mt-7 flex h-14 w-14 min-h-[56px] min-w-[56px] items-center justify-center rounded-full border border-toxic/60 bg-slate-950/95 text-toxic shadow-[0_0_24px_rgba(197,248,42,0.25)] hover:border-toxic hover:bg-toxic hover:text-slate-950 hover:scale-105 backdrop-blur-2xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-toxic focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 touch-manipulation select-none"
                        >
                            <div className="flex flex-col items-center justify-center text-center">
                                <CenterIcon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" strokeWidth={1.8} />
                                <span className="text-[8px] font-mono font-bold tracking-wider opacity-85 mt-0.5 group-hover:text-slate-950">
                                    CMD + K
                                </span>
                            </div>
                        </motion.button>

                        {/* 5 Outer Radial Actions */}
                        {RADIAL_ITEMS.map((item, idx) => {
                            const isActive = location.pathname === item.route
                            return (
                                <RadialMenuItem
                                    key={item.id}
                                    item={item}
                                    index={idx}
                                    totalInRing={RADIAL_ITEMS.length}
                                    radius={radius}
                                    startAngle={startAngle}
                                    sweepAngle={sweepAngle}
                                    isActive={isActive}
                                    isFocused={focusedIndex === idx}
                                    isMobile={isMobile}
                                    onSelect={handleSelectItem}
                                    onHover={setHoveredItem}
                                    reducedMotion={reducedMotion}
                                />
                            )
                        })}
                    </div>
                </div>
            )}
        </AnimatePresence>
    )
}


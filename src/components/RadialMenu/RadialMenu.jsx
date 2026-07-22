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

    const radius = isMobile ? 90 : 115
    const totalOuterRadius = radius + 35

    const { clampedX, clampedY } = useViewportBounds(position.x, position.y, totalOuterRadius, 24)

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
                        transition={{ duration: 0.15 }}
                        className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
                    />

                    {/* Subtle Click Ripple */}
                    <motion.div
                        initial={{ scale: 0, opacity: 0.7 }}
                        animate={{ scale: 2, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        style={{ left: position.x, top: position.y }}
                        className="pointer-events-none absolute -ml-5 -mt-5 h-10 w-10 rounded-full border border-toxic/60 bg-toxic/15 shadow-[0_0_15px_rgba(197,248,42,0.3)]"
                    />

                    {/* Radial Outer Circle & Center Action Hub */}
                    <div
                        style={{ left: clampedX, top: clampedY }}
                        className="absolute -ml-7 -mt-7 h-14 w-14 pointer-events-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Outer Ring Guideline */}
                        <motion.div
                            initial={{ scale: 0.4, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.4, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            style={{
                                width: radius * 2,
                                height: radius * 2,
                                marginLeft: -radius + 28,
                                marginTop: -radius + 28
                            }}
                            className="pointer-events-none absolute rounded-full border border-slate-800/80 bg-slate-900/[0.15]"
                        />

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
                                    : { type: 'spring', stiffness: 450, damping: 25 }
                            }
                            className="group relative flex h-14 w-14 items-center justify-center rounded-full border border-toxic/50 bg-slate-900/95 text-toxic shadow-[0_0_20px_rgba(197,248,42,0.2)] hover:border-toxic hover:bg-toxic hover:text-slate-950 hover:scale-105 backdrop-blur-xl transition-all duration-200 focus:outline-none"
                        >
                            <div className="flex flex-col items-center justify-center text-center">
                                <CenterIcon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" strokeWidth={1.8} />
                                <span className="text-[8px] font-mono font-bold tracking-wider opacity-80 mt-0.5 group-hover:text-slate-950">
                                    CMD + K
                                </span>
                            </div>

                            {/* Status Tooltip Pill */}
                            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-slate-800 bg-slate-950/90 px-2.5 py-0.5 text-[10px] font-mono text-zinc-400 shadow-md">
                                {hoveredItem ? (
                                    <span className="text-toxic font-semibold">{hoveredItem.title}</span>
                                ) : (
                                    <span className="text-zinc-400">
                                        Click center for <strong className="text-white font-normal">Search</strong>
                                    </span>
                                )}
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
                                    angleOffset={-90}
                                    isActive={isActive}
                                    isFocused={focusedIndex === idx}
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


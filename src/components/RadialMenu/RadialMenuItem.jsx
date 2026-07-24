// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Minimal & Premium Radial Menu Item Component
// Source: https://github.com/ggauravky/Dev-Portfolio

import { useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { motion } from 'framer-motion'

export default function RadialMenuItem({
    item,
    index,
    totalInRing,
    radius,
    startAngle = -90,
    sweepAngle = 360,
    isActive,
    isFocused,
    isMobile,
    onSelect,
    onHover,
    reducedMotion
}) {
    const [isHovered, setIsHovered] = useState(false)

    // Calculate item angular coordinates mathematically
    const { dx, dy, angleDeg } = useMemo(() => {
        let step = 0
        if (sweepAngle >= 360) {
            step = 360 / totalInRing
        } else {
            step = sweepAngle / Math.max(1, totalInRing - 1)
        }

        const angle = index * step + startAngle
        const rad = (angle * Math.PI) / 180
        return {
            dx: Math.round(radius * Math.cos(rad)),
            dy: Math.round(radius * Math.sin(rad)),
            angleDeg: (angle % 360 + 360) % 360
        }
    }, [index, totalInRing, startAngle, sweepAngle, radius])

    const IconComponent = item.icon

    // Smart position for tooltip on desktop
    const labelPositionClass = useMemo(() => {
        if (angleDeg >= 315 || angleDeg < 45) return 'top-1/2 -translate-y-1/2 left-14'
        if (angleDeg >= 45 && angleDeg < 135) return 'left-1/2 -translate-x-1/2 top-14'
        if (angleDeg >= 135 && angleDeg < 225) return 'top-1/2 -translate-y-1/2 right-14'
        return 'left-1/2 -translate-x-1/2 bottom-14'
    }, [angleDeg])

    const handleMouseEnter = () => {
        setIsHovered(true)
        if (onHover) onHover(item)
    }

    const handleMouseLeave = () => {
        setIsHovered(false)
        if (onHover) onHover(null)
    }

    const itemVariants = {
        hidden: { x: 0, y: 0, opacity: 0, scale: 0.4 },
        visible: {
            x: dx,
            y: dy,
            opacity: 1,
            scale: 1,
            transition: reducedMotion
                ? { duration: 0.1 }
                : {
                      type: 'spring',
                      stiffness: 460,
                      damping: 26,
                      mass: 0.7,
                      delay: index * 0.025
                  }
        },
        exit: {
            x: 0,
            y: 0,
            opacity: 0,
            scale: 0.4,
            transition: { duration: 0.14, ease: 'easeIn' }
        }
    }

    return (
        <motion.div
            className="absolute top-0 left-0 -ml-6 -mt-6 z-20 pointer-events-auto"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            <button
                type="button"
                role="menuitem"
                tabIndex={isFocused ? 0 : -1}
                aria-label={`${item.title}: ${item.subtitle}`}
                onClick={(e) => {
                    e.stopPropagation()
                    onSelect(item)
                }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onFocus={handleMouseEnter}
                onBlur={handleMouseLeave}
                className={`group relative flex h-12 w-12 min-h-[48px] min-w-[48px] items-center justify-center rounded-full border transition-all duration-200 focus:outline-none touch-manipulation select-none ${
                    isActive
                        ? 'border-toxic bg-slate-950 text-toxic shadow-[0_0_16px_rgba(197,248,42,0.35)] ring-1 ring-toxic/50'
                        : isHovered || isFocused
                        ? 'border-toxic bg-slate-900 text-toxic scale-110 shadow-[0_0_20px_rgba(197,248,42,0.3)] ring-1 ring-toxic/40'
                        : 'border-slate-800/80 bg-slate-950/90 text-slate-300 hover:border-toxic/60 hover:text-white shadow-lg backdrop-blur-xl'
                }`}
            >
                {IconComponent && (
                    <IconComponent
                        className={`h-5 w-5 transition-transform duration-200 ${
                            isHovered || isFocused ? 'scale-110 text-toxic' : isActive ? 'text-toxic' : ''
                        }`}
                        strokeWidth={1.8}
                    />
                )}

                {isActive && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-toxic opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-toxic"></span>
                    </span>
                )}

                {/* Desktop-only floating tooltip */}
                {!isMobile && (isHovered || isFocused) && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.1 }}
                        className={`absolute whitespace-nowrap z-30 pointer-events-none rounded-xl border border-slate-800/90 bg-slate-950/95 px-3 py-1.5 shadow-2xl backdrop-blur-xl ${labelPositionClass}`}
                    >
                        <div className="flex items-center gap-1.5 font-medium text-xs text-white">
                            <span>{item.title}</span>
                            {item.shortcut && (
                                <span className="rounded bg-slate-900 px-1.5 py-0.5 text-[9px] font-mono text-toxic border border-slate-800">
                                    {item.shortcut}
                                </span>
                            )}
                        </div>
                        <p className="text-[10px] font-normal text-zinc-400 mt-0.5">{item.subtitle}</p>
                    </motion.div>
                )}
            </button>
        </motion.div>
    )
}

RadialMenuItem.propTypes = {
    item: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    totalInRing: PropTypes.number.isRequired,
    radius: PropTypes.number.isRequired,
    startAngle: PropTypes.number,
    sweepAngle: PropTypes.number,
    isActive: PropTypes.bool,
    isFocused: PropTypes.bool,
    isMobile: PropTypes.bool,
    onSelect: PropTypes.func.isRequired,
    onHover: PropTypes.func,
    reducedMotion: PropTypes.bool
}

// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Premium Workspace Initialization Loading Experience
// Source: https://github.com/ggauravky/Dev-Portfolio

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PropTypes from 'prop-types'

// ─── Workspace initialization sequence ────────────────────────────────────────
const INIT_STEPS = [
    { id: 0, label: 'Initializing workspace',    duration: 520 },
    { id: 1, label: 'Loading UI components',     duration: 480 },
    { id: 2, label: 'Preparing projects',        duration: 440 },
    { id: 3, label: 'Connecting GitHub',         duration: 400 },
    { id: 4, label: 'Loading AI lab modules',    duration: 380 },
    { id: 5, label: 'Optimizing interface',      duration: 360 },
    { id: 6, label: 'Finalizing environment',    duration: 320 },
    { id: 7, label: 'Ready',                     duration: 0   },
]

// ─── Ambient dot grid — static, zero repaints ─────────────────────────────────
function AmbientGrid() {
    return (
        <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden"
            style={{
                backgroundImage:
                    'radial-gradient(circle, rgba(255,255,255,0.045) 1px, transparent 1px)',
                backgroundSize: '36px 36px',
            }}
        />
    )
}

// ─── Soft ambient glow blobs — GPU-composited, no repaints ────────────────────
function AmbientBlobs() {
    return (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            <div
                className="absolute rounded-full"
                style={{
                    width: 480,
                    height: 480,
                    top: '15%',
                    left: '5%',
                    background: 'radial-gradient(circle, rgba(197,248,42,0.07) 0%, transparent 70%)',
                    filter: 'blur(60px)',
                }}
            />
            <div
                className="absolute rounded-full"
                style={{
                    width: 360,
                    height: 360,
                    bottom: '10%',
                    right: '5%',
                    background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)',
                    filter: 'blur(70px)',
                }}
            />
        </div>
    )
}

// ─── Animated GKY monogram ─────────────────────────────────────────────────────
function Monogram() {
    const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches

    return (
        <motion.div
            className="relative mb-10 select-none"
            initial={{ opacity: 0, scale: 0.8, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={
                prefersReducedMotion
                    ? { duration: 0.2 }
                    : { type: 'spring', stiffness: 340, damping: 26 }
            }
        >
            {/* Outer ring */}
            <motion.div
                className="absolute -inset-3 rounded-full"
                style={{
                    border: '1px solid rgba(197,248,42,0.18)',
                    boxShadow: '0 0 32px rgba(197,248,42,0.06)',
                }}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
            />

            {/* Rotating conic sweep */}
            {!prefersReducedMotion && (
                <motion.div
                    className="absolute -inset-1.5 rounded-full"
                    style={{
                        background:
                            'conic-gradient(from 0deg, rgba(197,248,42,0.0) 0%, rgba(197,248,42,0.3) 30%, rgba(197,248,42,0.0) 60%)',
                        willChange: 'transform',
                    }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                />
            )}

            {/* Core monogram plate */}
            <div
                className="relative z-10 flex items-center justify-center rounded-full"
                style={{
                    width: 88,
                    height: 88,
                    background: 'linear-gradient(135deg, #0f1115 0%, #13161c 100%)',
                    border: '1px solid rgba(197,248,42,0.22)',
                    boxShadow: '0 0 0 1px rgba(255,255,255,0.04) inset',
                }}
            >
                <span
                    className="font-black"
                    style={{
                        fontSize: 24,
                        color: '#c5f82a',
                        textShadow: '0 0 20px rgba(197,248,42,0.45)',
                        fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
                        letterSpacing: '0.02em',
                    }}
                >
                    GKY
                </span>
            </div>
        </motion.div>
    )
}

// ─── Name + role strip ────────────────────────────────────────────────────────
function Identity() {
    return (
        <motion.div
            className="text-center mb-8 select-none"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
            <h1
                className="text-white font-bold tracking-tight mb-1.5"
                style={{
                    fontSize: 'clamp(20px, 4vw, 30px)',
                    fontFamily: "'Inter', system-ui, sans-serif",
                    letterSpacing: '-0.02em',
                }}
            >
                Gaurav Kumar Yadav
            </h1>
            <p
                style={{
                    fontSize: 11,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.25)',
                    fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
                }}
            >
                AI/ML · Full Stack · Developer
            </p>
        </motion.div>
    )
}

// ─── Status bar + segmented dots + thin progress trace ────────────────────────
function StatusBar({ stepIndex, totalSteps, label }) {
    return (
        <motion.div
            className="w-full flex flex-col items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.42, duration: 0.4 }}
        >
            {/* Segmented dots */}
            <div className="flex items-center gap-1.5" aria-hidden="true">
                {Array.from({ length: totalSteps - 1 }).map((_, i) => (
                    <div
                        key={i}
                        style={{
                            width: i === stepIndex ? 20 : 5,
                            height: 5,
                            borderRadius: 99,
                            background:
                                i < stepIndex
                                    ? '#c5f82a'
                                    : i === stepIndex
                                    ? 'rgba(197,248,42,0.65)'
                                    : 'rgba(255,255,255,0.07)',
                            transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
                        }}
                    />
                ))}
            </div>

            {/* Thin progress trace */}
            <div
                className="relative overflow-hidden rounded-full"
                style={{ width: 'min(220px, 58vw)', height: 1, background: 'rgba(255,255,255,0.06)' }}
                aria-hidden="true"
            >
                <motion.div
                    className="absolute left-0 top-0 h-full rounded-full"
                    style={{
                        background: 'linear-gradient(90deg, rgba(197,248,42,0.5) 0%, #c5f82a 100%)',
                    }}
                    initial={{ width: '0%' }}
                    animate={{ width: `${Math.round(((stepIndex + 1) / (totalSteps - 1)) * 100)}%` }}
                    transition={{ duration: 0.38, ease: 'easeInOut' }}
                />
                {/* Sweep gleam */}
                <motion.div
                    className="absolute top-0 h-full"
                    style={{
                        width: 40,
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)',
                    }}
                    animate={{ left: ['-10%', '110%'] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.4 }}
                />
            </div>

            {/* Rotating status label */}
            <AnimatePresence mode="wait">
                <motion.p
                    key={label}
                    className="font-mono text-center"
                    style={{
                        fontSize: 11,
                        color: 'rgba(197,248,42,0.65)',
                        letterSpacing: '0.06em',
                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                        minHeight: 18,
                    }}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    aria-live="polite"
                    aria-label={`Loading: ${label}`}
                >
                    <span style={{ color: 'rgba(255,255,255,0.15)', marginRight: 6 }}>›</span>
                    {label}
                    {label !== 'Ready' && (
                        <motion.span
                            aria-hidden="true"
                            animate={{ opacity: [1, 0] }}
                            transition={{ duration: 0.55, repeat: Infinity, repeatType: 'reverse' }}
                        >
                            _
                        </motion.span>
                    )}
                </motion.p>
            </AnimatePresence>
        </motion.div>
    )
}

StatusBar.propTypes = {
    stepIndex: PropTypes.number.isRequired,
    totalSteps: PropTypes.number.isRequired,
    label: PropTypes.string.isRequired,
}

// ─── Main SplashScreen ────────────────────────────────────────────────────────
export default function SplashScreen({ onDone }) {
    const [stepIndex, setStepIndex] = useState(0)
    const [visible, setVisible] = useState(true)
    const doneCalledRef = useRef(false)

    useEffect(() => {
        let idx = 0
        let t

        const advance = () => {
            if (idx < INIT_STEPS.length - 1) {
                idx++
                setStepIndex(idx)
                const next = INIT_STEPS[idx]
                if (next.duration > 0) {
                    t = setTimeout(advance, next.duration)
                } else {
                    // "Ready" — brief hold then begin exit
                    t = setTimeout(() => setVisible(false), 500)
                }
            }
        }

        t = setTimeout(advance, INIT_STEPS[0].duration)

        // Hard safety fallback — always exit after 4s no matter what
        const fallback = setTimeout(() => setVisible(false), 4000)

        return () => {
            clearTimeout(t)
            clearTimeout(fallback)
        }
    }, [])

    // Safety net: if AnimatePresence exit never fires, call onDone after exit starts
    useEffect(() => {
        if (!visible) {
            const timer = setTimeout(() => {
                if (!doneCalledRef.current) {
                    doneCalledRef.current = true
                    onDone()
                }
            }, 850)
            return () => clearTimeout(timer)
        }
    }, [visible, onDone])

    const handleExitComplete = () => {
        if (!doneCalledRef.current) {
            doneCalledRef.current = true
            onDone()
        }
    }

    const currentStep = INIT_STEPS[stepIndex]

    return (
        <AnimatePresence onExitComplete={handleExitComplete}>
            {visible && (
                <motion.div
                    key="splash"
                    className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden select-none"
                    style={{
                        zIndex: 9999,
                        background: 'linear-gradient(160deg, #080a0e 0%, #0b0d12 50%, #090c10 100%)',
                    }}
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.025, filter: 'blur(5px)' }}
                    transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
                    role="progressbar"
                    aria-label="Loading portfolio workspace"
                    aria-valuemin={0}
                    aria-valuemax={INIT_STEPS.length - 1}
                    aria-valuenow={stepIndex}
                >
                    <AmbientGrid />
                    <AmbientBlobs />

                    {/* Central content block */}
                    <div
                        className="relative z-10 flex flex-col items-center"
                        style={{ width: 'min(320px, 90vw)' }}
                    >
                        <Monogram />
                        <Identity />
                        <StatusBar
                            stepIndex={stepIndex}
                            totalSteps={INIT_STEPS.length}
                            label={currentStep.label}
                        />
                    </div>

                    {/* Bottom-right version badge */}
                    <motion.div
                        className="absolute bottom-5 right-5 font-mono"
                        style={{
                            fontSize: 10,
                            color: 'rgba(255,255,255,0.1)',
                            letterSpacing: '0.1em',
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.65, duration: 0.5 }}
                        aria-hidden="true"
                    >
                        Portfolio v2026
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

SplashScreen.propTypes = {
    onDone: PropTypes.func.isRequired,
}

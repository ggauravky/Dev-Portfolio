// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function SplashScreen({ onDone }) {
    const [visible, setVisible] = useState(true)

    useEffect(() => {
        // Show splash for 2.4s then start exit animation
        const timer = setTimeout(() => setVisible(false), 2400)
        return () => clearTimeout(timer)
    }, [])

    return (
        <AnimatePresence onExitComplete={onDone}>
            {visible && (
                <motion.div
                    className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col items-center justify-center overflow-hidden"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.03 }}
                    transition={{ duration: 0.55, ease: 'easeInOut' }}
                >
                    {/* Ambient blobs */}
                    <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

                    {/* Avatar / initials ring */}
                    <motion.div
                        className="relative mb-8"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.55, ease: [0.34, 1.56, 0.64, 1] }}
                    >
                        {/* Spinning gradient ring */}
                        <motion.div
                            className="absolute -inset-2 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                            style={{ borderRadius: '50%' }}
                        />
                        <div className="relative w-24 h-24 rounded-full bg-slate-900 flex items-center justify-center z-10">
                            <span className="text-3xl font-black bg-gradient-to-br from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent select-none">
                                GKY
                            </span>
                        </div>
                    </motion.div>

                    {/* Name */}
                    <motion.h1
                        className="text-4xl sm:text-5xl font-black text-white mb-3 tracking-tight"
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.38, duration: 0.5, ease: 'easeOut' }}
                    >
                        Gaurav Kumar Yadav
                    </motion.h1>

                    {/* Role badges */}
                    <motion.div
                        className="flex flex-wrap justify-center gap-2 mb-10"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.45, ease: 'easeOut' }}
                    >
                        {['Python Developer', 'AI Engineer', 'Full Stack'].map((role, i) => (
                            <span
                                key={role}
                                className="px-3 py-1 text-xs font-semibold rounded-full border"
                                style={{
                                    color: i === 0 ? '#60a5fa' : i === 1 ? '#c084fc' : '#22d3ee',
                                    borderColor: i === 0 ? '#60a5fa44' : i === 1 ? '#c084fc44' : '#22d3ee44',
                                    background: i === 0 ? '#60a5fa10' : i === 1 ? '#c084fc10' : '#22d3ee10',
                                }}
                            >
                                {role}
                            </span>
                        ))}
                    </motion.div>

                    {/* Progress bar track */}
                    <div className="w-56 sm:w-72 h-0.5 rounded-full bg-slate-800 overflow-hidden">
                        <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400"
                            initial={{ scaleX: 0, originX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: 0.2, duration: 2, ease: 'easeInOut' }}
                        />
                    </div>

                    {/* Tagline */}
                    <motion.p
                        className="mt-4 text-slate-500 text-xs tracking-widest uppercase"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.85, duration: 0.5 }}
                    >
                        Loading portfolio…
                    </motion.p>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

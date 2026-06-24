// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'

export default function NeuralNetworkCanvas({ lightweight = false }) {
    const canvasRef = useRef(null)
    const contextRef = useRef(null)
    const particlesRef = useRef([])
    const animationFrameId = useRef(null)
    const mouseRef = useRef({ x: null, y: null, radius: 150 })
    const ctaHoverRef = useRef({ x: null, y: null, active: false, radius: 120, pulse: 0 })
    const dimensionsRef = useRef({ width: 0, height: 0 })
    const isActiveRef = useRef(true)

    // Base colors matching site variables: toxic (#c5f82a), cyber (#ff5d00)
    const TOXIC_RGB = '197, 248, 42'
    const CYBER_RGB = '255, 93, 0'

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return
        contextRef.current = ctx

        // Setup resize handling
        const resizeCanvas = () => {
            const width = canvas.parentElement.offsetWidth || window.innerWidth
            const height = canvas.parentElement.offsetHeight || window.innerHeight
            canvas.width = width
            canvas.height = height
            dimensionsRef.current = { width, height }
            initParticles(width, height)
        }

        // Initialize particles
        const initParticles = (width, height) => {
            const isMobile = width < 768
            let particleCount = lightweight ? 25 : 80
            if (isMobile) {
                particleCount = lightweight ? 12 : 30
            }

            const particles = []
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: (Math.random() - 0.5) * (lightweight ? 0.3 : 0.6),
                    vy: (Math.random() - 0.5) * (lightweight ? 0.3 : 0.6),
                    baseVx: 0,
                    baseVy: 0,
                    radius: Math.random() * 2 + 1,
                    // Mostly toxic green particles, a few cyber orange highlights
                    color: Math.random() > 0.85 ? CYBER_RGB : TOXIC_RGB,
                    alpha: Math.random() * 0.4 + 0.2,
                    pulseFactor: Math.random() * 0.05 + 0.01,
                    pulseDirection: Math.random() > 0.5 ? 1 : -1,
                    glowIntensity: 0,
                })
            }
            particlesRef.current = particles
        }

        resizeCanvas()
        window.addEventListener('resize', resizeCanvas)

        // Mouse listeners
        const handleMouseMove = (e) => {
            const rect = canvas.getBoundingClientRect()
            mouseRef.current.x = e.clientX - rect.left
            mouseRef.current.y = e.clientY - rect.top
        }

        const handleMouseLeave = () => {
            mouseRef.current.x = null
            mouseRef.current.y = null
        }

        // Parent container mouse listeners
        const parent = canvas.parentElement
        if (parent) {
            parent.addEventListener('mousemove', handleMouseMove)
            parent.addEventListener('mouseleave', handleMouseLeave)
        }

        // Listen for CTA button hovers from other components
        const handleCtaHover = (e) => {
            const rect = canvas.getBoundingClientRect()
            const { x, y, active } = e.detail || {}
            if (active && typeof x === 'number' && typeof y === 'number') {
                ctaHoverRef.current.x = x - rect.left
                ctaHoverRef.current.y = y - rect.top
                ctaHoverRef.current.active = true
            } else {
                ctaHoverRef.current.active = false
            }
        }

        window.addEventListener('neural-cta-hover', handleCtaHover)

        // Tab hidden tracking to pause drawing loop
        const handleVisibilityChange = () => {
            isActiveRef.current = !document.hidden
        }
        document.addEventListener('visibilitychange', handleVisibilityChange)

        // Intersection observer to cull when not visible on screen
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    isActiveRef.current = entry.isIntersecting && !document.hidden
                })
            },
            { threshold: 0.05 }
        )
        observer.observe(canvas)

        // Render loop
        const render = () => {
            if (!isActiveRef.current) {
                animationFrameId.current = requestAnimationFrame(render)
                return
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height)
            const particles = particlesRef.current
            const mouse = mouseRef.current
            const cta = ctaHoverRef.current

            // Update CTA hover pulse logic
            if (cta.active) {
                cta.pulse += 0.08
            } else {
                cta.pulse = 0
            }

            // Draw connections first
            for (let i = 0; i < particles.length; i++) {
                const p1 = particles[i]
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j]
                    const dx = p1.x - p2.x
                    const dy = p1.y - p2.y
                    const dist = Math.sqrt(dx * dx + dy * dy)

                    // Draw line if close
                    const maxDist = lightweight ? 120 : 160
                    if (dist < maxDist) {
                        const alpha = (1 - dist / maxDist) * 0.12

                        // Connections near CTA pulsate and glow brighter
                        let extraAlpha = 0
                        if (cta.active && cta.x !== null && cta.y !== null) {
                            const ctaDx1 = p1.x - cta.x
                            const ctaDy1 = p1.y - cta.y
                            const ctaDist1 = Math.sqrt(ctaDx1 * ctaDx1 + ctaDy1 * ctaDy1)

                            if (ctaDist1 < cta.radius) {
                                // Pulsing link highlight
                                const pulseGlow = Math.sin(cta.pulse) * 0.15 + 0.2
                                extraAlpha = (1 - ctaDist1 / cta.radius) * pulseGlow
                            }
                        }

                        ctx.beginPath()
                        ctx.moveTo(p1.x, p1.y)
                        ctx.lineTo(p2.x, p2.y)
                        // Use gradient color blending if nodes have different colors
                        if (p1.color !== p2.color) {
                            ctx.strokeStyle = `rgba(${CYBER_RGB}, ${alpha + extraAlpha})`
                        } else {
                            ctx.strokeStyle = `rgba(${p1.color}, ${alpha + extraAlpha})`
                        }
                        ctx.lineWidth = extraAlpha > 0 ? 1.2 : 0.8
                        ctx.stroke()
                    }
                }
            }

            // Draw and update particles
            particles.forEach((p) => {
                // Natural drift
                p.x += p.vx
                p.y += p.vy

                // Boundary bounce
                if (p.x < 0 || p.x > canvas.width) p.vx = -p.vx
                if (p.y < 0 || p.y > canvas.height) p.vy = -p.vy

                // Mouse interaction (repulsion/attraction)
                if (mouse.x !== null && mouse.y !== null) {
                    const dx = p.x - mouse.x
                    const dy = p.y - mouse.y
                    const dist = Math.sqrt(dx * dx + dy * dy)

                    if (dist < mouse.radius) {
                        // Anti-gravity repulsion force: pushes particles away
                        const force = (mouse.radius - dist) / mouse.radius
                        const angle = Math.atan2(dy, dx)
                        const pushX = Math.cos(angle) * force * 1.5
                        const pushY = Math.sin(angle) * force * 1.5

                        p.x += pushX
                        p.y += pushY
                        p.vx += pushX * 0.05
                        p.vy += pushY * 0.05

                        // Speed limit dampening
                        const maxSpeed = 2.5
                        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
                        if (speed > maxSpeed) {
                            p.vx = (p.vx / speed) * maxSpeed
                            p.vy = (p.vy / speed) * maxSpeed
                        }
                    }
                }

                // CTA button proximity interaction (brighten and attract nodes)
                if (cta.active && cta.x !== null && cta.y !== null) {
                    const dx = p.x - cta.x
                    const dy = p.y - cta.y
                    const dist = Math.sqrt(dx * dx + dy * dy)

                    if (dist < cta.radius) {
                        // Attract and excite node values
                        const force = (cta.radius - dist) / cta.radius
                        const angle = Math.atan2(dy, dx)
                        
                        // Gravitational drag toward CTA center
                        p.x -= Math.cos(angle) * force * 0.8
                        p.y -= Math.sin(angle) * force * 0.8
                        p.glowIntensity = force * 1.5
                    } else {
                        p.glowIntensity *= 0.9 // decay glow
                    }
                } else {
                    p.glowIntensity *= 0.9 // decay glow
                }

                // Node pulsing effect
                p.alpha += p.pulseFactor * p.pulseDirection
                if (p.alpha > 0.8) {
                    p.alpha = 0.8
                    p.pulseDirection = -1
                } else if (p.alpha < 0.1) {
                    p.alpha = 0.1
                    p.pulseDirection = 1
                }

                // Draw node
                ctx.beginPath()
                ctx.arc(p.x, p.y, p.radius + (p.glowIntensity * 0.8), 0, Math.PI * 2)
                ctx.fillStyle = `rgba(${p.color}, ${Math.min(1, p.alpha + p.glowIntensity * 0.5)})`
                ctx.fill()

                // Glow ring for highly excited nodes
                if (p.glowIntensity > 0.2) {
                    ctx.beginPath()
                    ctx.arc(p.x, p.y, p.radius + p.glowIntensity * 5, 0, Math.PI * 2)
                    ctx.strokeStyle = `rgba(${p.color}, ${p.glowIntensity * 0.2})`
                    ctx.lineWidth = 0.5
                    ctx.stroke()
                }
            })

            animationFrameId.current = requestAnimationFrame(render)
        }

        render()

        // Cleanups
        return () => {
            cancelAnimationFrame(animationFrameId.current)
            window.removeEventListener('resize', resizeCanvas)
            window.removeEventListener('neural-cta-hover', handleCtaHover)
            document.removeEventListener('visibilitychange', handleVisibilityChange)
            observer.disconnect()
            if (parent) {
                parent.removeEventListener('mousemove', handleMouseMove)
                parent.removeEventListener('mouseleave', handleMouseLeave)
            }
        }
    }, [lightweight])

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none select-none z-0"
            style={{ mixBlendMode: 'screen' }}
        />
    )
}

NeuralNetworkCanvas.propTypes = {
    lightweight: PropTypes.bool,
}

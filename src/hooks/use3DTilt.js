// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// use3DTilt.js — Handcrafted 3D Micro-Tilt & Specular Light Reflection Hook
// Provides GPU-accelerated spring-smoothed 3D spatial tilt and cursor-following glint coordinates.

import { useRef, useCallback, useEffect, useState } from 'react'
import { useMotionValue, useSpring } from 'framer-motion'

export function use3DTilt({
  maxTilt = 8,        // Max rotation degrees
  stiffness = 300,    // Spring stiffness
  damping = 25,       // Spring damping
  glint = true,       // Calculate specular glint coordinates
} = {}) {
  const ref = useRef(null)
  const [isHovered, setIsHovered] = useState(false)

  // Motion values
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const glintX = useMotionValue(50)
  const glintY = useMotionValue(50)

  // Spring smoothed values
  const rotateX = useSpring(x, { stiffness, damping })
  const rotateY = useSpring(y, { stiffness, damping })
  const glintPercentX = useSpring(glintX, { stiffness: stiffness * 0.8, damping })
  const glintPercentY = useSpring(glintY, { stiffness: stiffness * 0.8, damping })

  // Disable on reduced motion preference
  const [isDisabled, setIsDisabled] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const checkReducedMotion = () => setIsDisabled(mediaQuery.matches)
    checkReducedMotion()
    mediaQuery.addEventListener('change', checkReducedMotion)
    return () => mediaQuery.removeEventListener('change', checkReducedMotion)
  }, [])

  const handleMouseMove = useCallback((e) => {
    if (isDisabled || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const width = rect.width
    const height = rect.height

    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    // Normalized coordinates (-1 to 1)
    const normalizedX = (mouseX / width) * 2 - 1
    const normalizedY = (mouseY / height) * 2 - 1

    // Calculate rotation (-maxTilt to +maxTilt)
    x.set(-normalizedY * maxTilt)
    y.set(normalizedX * maxTilt)

    if (glint) {
      glintX.set((mouseX / width) * 100)
      glintY.set((mouseY / height) * 100)
    }
  }, [isDisabled, maxTilt, glint, x, y, glintX, glintY])

  const handleMouseEnter = useCallback(() => {
    if (isDisabled) return
    setIsHovered(true)
  }, [isDisabled])

  const handleMouseLeave = useCallback(() => {
    if (isDisabled) return
    setIsHovered(false)
    x.set(0)
    y.set(0)
    glintX.set(50)
    glintY.set(50)
  }, [isDisabled, x, y, glintX, glintY])

  return {
    ref,
    rotateX,
    rotateY,
    glintPercentX,
    glintPercentY,
    isHovered,
    handleMouseMove,
    handleMouseEnter,
    handleMouseLeave,
  }
}

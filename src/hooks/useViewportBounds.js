// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Viewport Clamping Hook for Radial Menu Position
// Source: https://github.com/ggauravky/Dev-Portfolio

import { useMemo } from 'react'

export function useViewportBounds(x, y, outerRadius = 175, padding = 24) {
    return useMemo(() => {
        if (typeof window === 'undefined') return { clampedX: x, clampedY: y }

        const vw = window.innerWidth
        const vh = window.innerHeight

        const minX = outerRadius + padding
        const maxX = vw - (outerRadius + padding)
        const minY = outerRadius + padding
        const maxY = vh - (outerRadius + padding)

        const clampedX = Math.max(minX, Math.min(maxX, x))
        const clampedY = Math.max(minY, Math.min(maxY, y))

        return {
            clampedX,
            clampedY,
            isClampedX: clampedX !== x,
            isClampedY: clampedY !== y,
            vw,
            vh
        }
    }, [x, y, outerRadius, padding])
}

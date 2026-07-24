// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Viewport Clamping & Edge Detection Hook for Radial Menu Position
// Source: https://github.com/ggauravky/Dev-Portfolio

import { useMemo } from 'react'

export function useViewportBounds(x, y, outerRadius = 160, padding = 20) {
    return useMemo(() => {
        if (typeof window === 'undefined') {
            return { clampedX: x, clampedY: y, layoutMode: 'full', startAngle: -90, sweepAngle: 360 }
        }

        const vw = window.innerWidth
        const vh = window.innerHeight

        const minX = outerRadius + padding
        const maxX = vw - (outerRadius + padding)
        const minY = outerRadius + padding
        const maxY = vh - (outerRadius + padding)

        const clampedX = Math.max(minX, Math.min(maxX, x))
        const clampedY = Math.max(minY, Math.min(maxY, y))

        // Determine edge proximity
        const isNearBottom = y > vh - (outerRadius + 10)
        const isNearTop = y < outerRadius + 10
        const isNearRight = x > vw - (outerRadius + 10)
        const isNearLeft = x < outerRadius + 10

        let layoutMode = 'full'
        let startAngle = -90
        let sweepAngle = 360

        if (isNearBottom) {
            layoutMode = 'semi-top'
            startAngle = -180
            sweepAngle = 180
        } else if (isNearTop) {
            layoutMode = 'semi-bottom'
            startAngle = 0
            sweepAngle = 180
        } else if (isNearRight) {
            layoutMode = 'semi-left'
            startAngle = 90
            sweepAngle = 180
        } else if (isNearLeft) {
            layoutMode = 'semi-right'
            startAngle = -90
            sweepAngle = 180
        }

        return {
            clampedX,
            clampedY,
            isClampedX: clampedX !== x,
            isClampedY: clampedY !== y,
            layoutMode,
            startAngle,
            sweepAngle,
            vw,
            vh
        }
    }, [x, y, outerRadius, padding])
}


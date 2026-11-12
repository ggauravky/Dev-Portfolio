// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// S7 hover preview: the hovered row's screenshot follows the pointer on a soft
// spring (src/lib/motion.js). Mounted by the index only for a fine pointer with
// motion allowed; decorative (aria-hidden), never takes the pointer, transform
// and opacity only. rAF runs only while the spring settles.

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { SPRING, createSpring2D } from '../../lib/motion'
import { hasRealImage, previewSrc } from '../../lib/projects'
import './ProjectPreview.css'

const W = 320
const H = 200
const GAP = 32
const EDGE = 16

// Right of the pointer, or left of it near the right edge; clamped vertically.
function place(cx, cy) {
    const right = cx + GAP + W <= window.innerWidth - EDGE
    const x = right ? cx + GAP : cx - GAP - W
    const y = Math.min(Math.max(cy - H / 2, EDGE), window.innerHeight - H - EDGE)
    return [x, y]
}

const ProjectPreview = forwardRef(function ProjectPreview(_props, ref) {
    const rootRef = useRef(null)
    const frameRef = useRef(null)
    const imgRef = useRef(null)
    const springRef = useRef(null)
    const visibleRef = useRef(false)

    useEffect(() => {
        const root = rootRef.current
        springRef.current = createSpring2D((x, y) => {
            root.style.transform = `translate3d(${x}px, ${y}px, 0)`
        }, SPRING.soft)
        return () => springRef.current?.stop()
    }, [])

    useImperativeHandle(ref, () => ({
        show(project, cx, cy) {
            if (!hasRealImage(project.image)) {
                this.hide()
                return
            }
            const src = previewSrc(project.image)
            if (imgRef.current.getAttribute('src') !== src) imgRef.current.src = src
            const [x, y] = place(cx, cy)
            if (visibleRef.current) springRef.current.set(x, y)
            else springRef.current.jump(x, y)
            visibleRef.current = true
            rootRef.current.dataset.visible = 'true'
        },
        move(cx, cy) {
            if (!visibleRef.current) return
            const [x, y] = place(cx, cy)
            springRef.current.set(x, y)
        },
        hide() {
            visibleRef.current = false
            if (rootRef.current) rootRef.current.dataset.visible = 'false'
        },
        /** The visible frame, for the shared-element transition; null when hidden. */
        frame() {
            return visibleRef.current ? frameRef.current : null
        },
    }), [])

    return (
        <div ref={rootRef} className="pj-preview" data-visible="false" aria-hidden="true">
            <div ref={frameRef} className="pj-preview__frame">
                <img ref={imgRef} alt="" width={W} height={H} decoding="async" />
            </div>
        </div>
    )
})

export default ProjectPreview

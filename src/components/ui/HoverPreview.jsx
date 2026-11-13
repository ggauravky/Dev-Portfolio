// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// S7 hover preview, shared by the Projects index and Journey: the hovered row's
// image follows the pointer on a soft spring (src/lib/motion.js). Mount it only
// for a fine pointer. Decorative (aria-hidden), never takes the pointer,
// transform and opacity only; rAF runs only while the spring settles.
//
// Content is `{ key, src, label }`. With no `src` (or a failed load) the frame
// shows a quiet solid tile with the label, never a broken box.
// - `crossfade`: a different row fades over the previous one (two stacked slots)
//   instead of swapping the image in place.
// - `snap`: no spring and no fades (reduced motion); the frame jumps.

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import PropTypes from 'prop-types'
import { SPRING, createSpring2D } from '../../lib/motion'
import './HoverPreview.css'

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

function fill(slot, content) {
    const img = slot.firstChild
    slot.lastChild.textContent = content.label || ''
    if (content.src) {
        slot.dataset.kind = 'image'
        if (img.getAttribute('src') !== content.src) img.src = content.src
    } else {
        slot.dataset.kind = 'tile'
        img.removeAttribute('src')
    }
}

const onImgError = (event) => {
    if (event.currentTarget.getAttribute('src')) event.currentTarget.parentElement.dataset.kind = 'tile'
}

const HoverPreview = forwardRef(function HoverPreview({ crossfade = false, snap = false }, ref) {
    const rootRef = useRef(null)
    const frameRef = useRef(null)
    const slotsRef = useRef([])
    const activeRef = useRef(0)
    const keyRef = useRef(null)
    const springRef = useRef(null)
    const visibleRef = useRef(false)

    useEffect(() => {
        const root = rootRef.current
        springRef.current = createSpring2D((x, y) => {
            root.style.transform = `translate3d(${x}px, ${y}px, 0)`
        }, SPRING.soft)
        return () => springRef.current?.stop()
    }, [])

    useImperativeHandle(ref, () => {
        const moveTo = (x, y) => {
            if (visibleRef.current && !snap) springRef.current.set(x, y)
            else springRef.current.jump(x, y)
        }
        const setContent = (content) => {
            const slots = slotsRef.current
            if (crossfade && visibleRef.current && keyRef.current !== content.key) {
                activeRef.current = 1 - activeRef.current
                fill(slots[activeRef.current], content)
                slots.forEach((slot, i) => { slot.dataset.active = String(i === activeRef.current) })
            } else {
                fill(slots[activeRef.current], content)
            }
            keyRef.current = content.key
        }
        return {
            /** Show `content` beside the pointer at (cx, cy). */
            show(content, cx, cy) {
                setContent(content)
                moveTo(...place(cx, cy))
                visibleRef.current = true
                rootRef.current.dataset.visible = 'true'
            },
            /** Keyboard: show `content` beside an element (its end, vertically centred). */
            showBeside(content, el) {
                const r = el.getBoundingClientRect()
                this.show(content, Math.min(r.right, window.innerWidth - EDGE), r.top + r.height / 2)
            },
            move(cx, cy) {
                if (!visibleRef.current) return
                moveTo(...place(cx, cy))
            },
            hide() {
                visibleRef.current = false
                keyRef.current = null
                if (rootRef.current) rootRef.current.dataset.visible = 'false'
            },
            /** The visible frame, for the shared-element transition; null when hidden. */
            frame() {
                return visibleRef.current ? frameRef.current : null
            },
        }
    }, [crossfade, snap])

    const slot = (i) => (
        <span
            ref={(el) => { slotsRef.current[i] = el }}
            className="hover-preview__slot"
            data-active={String(i === 0)}
            data-kind="image"
        >
            <img alt="" width={W} height={H} decoding="async" onError={onImgError} />
            <span className="hover-preview__tile" />
        </span>
    )

    return (
        <div
            ref={rootRef}
            className="hover-preview"
            data-visible="false"
            data-crossfade={crossfade ? 'true' : undefined}
            data-snap={snap ? 'true' : undefined}
            aria-hidden="true"
        >
            <div ref={frameRef} className="hover-preview__frame">
                {slot(0)}
                {crossfade ? slot(1) : null}
            </div>
        </div>
    )
})

HoverPreview.propTypes = {
    crossfade: PropTypes.bool,
    snap: PropTypes.bool,
}

/** Warm the cache for the first few preview images (call once, after idle). */
export function preloadPreviewImages(srcs, count = 4) {
    srcs.filter(Boolean).slice(0, count).forEach((src) => {
        const img = new Image()
        img.decoding = 'async'
        img.src = src
    })
}

export default HoverPreview

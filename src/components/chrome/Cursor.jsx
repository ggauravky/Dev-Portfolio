// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// S5 cursor language (DESIGN.md). Fine pointers only, never under reduced motion.
// A small dot follows the pointer on a stiff spring and morphs:
// - over links/buttons it opens into a ring;
// - over [data-cursor="View|Open|Copy|Drag"] (or an external link → "Open") it
//   becomes a labelled chip;
// - over text fields it hides, and the system I-beam shows.
// Only transform/opacity animate. The system cursor is hidden only while this
// component is mounted (html.has-cursor), so a crash restores it.

import { useEffect, useRef } from 'react'
import { createSpring2D, useFinePointer, useReducedMotion } from '../../lib/motion'
import './Cursor.css'

const INTERACTIVE = 'a[href], button, [role="button"], summary, label, select, [data-cursor]'
const TEXT_FIELD = 'input:not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="button"]):not([type="submit"]), textarea, [contenteditable="true"]'
const CURSOR_SPRING = { stiffness: 900, damping: 56, mass: 0.6 }

function resolveState(target) {
    if (!(target instanceof Element)) return { mode: 'default', label: '' }
    if (target.closest(TEXT_FIELD)) return { mode: 'text', label: '' }
    const labelled = target.closest('[data-cursor]')
    if (labelled) return { mode: 'chip', label: labelled.getAttribute('data-cursor') || '' }
    const interactive = target.closest(INTERACTIVE)
    if (!interactive) return { mode: 'default', label: '' }
    if (interactive.matches('a[target="_blank"]')) return { mode: 'chip', label: 'Open' }
    if (interactive.matches(':disabled, [aria-disabled="true"]')) return { mode: 'default', label: '' }
    return { mode: 'link', label: '' }
}

function CursorFollower() {
    const rootRef = useRef(null)
    const labelRef = useRef(null)

    useEffect(() => {
        const root = rootRef.current
        const labelEl = labelRef.current
        if (!root || !labelEl) return undefined

        const html = document.documentElement
        html.classList.add('has-cursor')

        const spring = createSpring2D((x, y) => {
            root.style.transform = `translate3d(${x}px, ${y}px, 0)`
        }, CURSOR_SPRING)

        let seen = false
        let lastTarget = null
        const setState = ({ mode, label }) => {
            root.dataset.mode = mode
            if (labelEl.textContent !== label) labelEl.textContent = label
        }

        const onMove = (event) => {
            if (event.pointerType !== 'mouse') return
            if (!seen) {
                seen = true
                spring.jump(event.clientX, event.clientY)
                root.dataset.visible = 'true'
            } else {
                spring.set(event.clientX, event.clientY)
            }
            if (event.target !== lastTarget) {
                lastTarget = event.target
                setState(resolveState(event.target))
            }
        }
        const onLeaveWindow = (event) => {
            if (!event.relatedTarget) root.dataset.visible = 'false'
        }
        const onEnterWindow = () => {
            if (seen) root.dataset.visible = 'true'
        }
        const onDown = () => { root.dataset.pressed = 'true' }
        const onUp = () => { root.dataset.pressed = 'false' }

        window.addEventListener('pointermove', onMove, { passive: true })
        document.addEventListener('mouseout', onLeaveWindow)
        document.addEventListener('mouseover', onEnterWindow)
        window.addEventListener('pointerdown', onDown, { passive: true })
        window.addEventListener('pointerup', onUp, { passive: true })
        return () => {
            spring.stop()
            html.classList.remove('has-cursor')
            window.removeEventListener('pointermove', onMove)
            document.removeEventListener('mouseout', onLeaveWindow)
            document.removeEventListener('mouseover', onEnterWindow)
            window.removeEventListener('pointerdown', onDown)
            window.removeEventListener('pointerup', onUp)
        }
    }, [])

    return (
        <div ref={rootRef} className="cursor" data-mode="default" data-visible="false" aria-hidden="true">
            <span className="cursor__dot" />
            <span ref={labelRef} className="cursor__chip" />
        </div>
    )
}

function Cursor() {
    const fine = useFinePointer()
    const reduced = useReducedMotion()
    if (!fine || reduced) return null
    return <CursorFollower />
}

export default Cursor

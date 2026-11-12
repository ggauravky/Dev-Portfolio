// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { forwardRef, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { useMagnetic } from '../../hooks/useMagnetic'
import './ui.css'

const VARIANTS = ['primary', 'secondary', 'ghost', 'link']

// Which edge did the pointer cross? Drives the fill wipe's origin (in and out).
function edgeFrom(event, el) {
    const r = el.getBoundingClientRect()
    const distances = {
        left: event.clientX - r.left,
        right: r.right - event.clientX,
        top: event.clientY - r.top,
        bottom: r.bottom - event.clientY,
    }
    return Object.keys(distances).reduce((a, b) => (distances[a] <= distances[b] ? a : b))
}

/**
 * One button for the whole site (DESIGN.md "Buttons and micro-interactions").
 * - Variants: primary, secondary, ghost, link.
 * - Hover (mouse): the label rolls up to a duplicate, and a fill wipes in from the
 *   edge the pointer entered (and out through the edge it left).
 * - Magnetic pull up to 10px on a spring; press scales to .97.
 * - `arrow`: true → "→" (internal), "external" → "↗"; it nudges on hover.
 * - Renders <button>, a router <Link> (`to`) or <a> (`href`). Disabled/loading
 *   links get aria-disabled and swallow clicks.
 */
const Button = forwardRef(function Button(
    {
        variant = 'primary',
        to,
        href,
        external = false,
        arrow = false,
        type = 'button',
        loading = false,
        disabled = false,
        magnetic = true,
        className = '',
        children,
        onClick,
        onPointerEnter,
        onPointerLeave,
        ...rest
    },
    forwardedRef,
) {
    const innerRef = useRef(null)
    const inactive = disabled || loading
    const isLink = variant === 'link'

    useMagnetic(innerRef, { max: 10, strength: 0.3, enabled: magnetic && !isLink && !inactive })

    const setRef = useCallback((node) => {
        innerRef.current = node
        if (typeof forwardedRef === 'function') forwardedRef(node)
        else if (forwardedRef) forwardedRef.current = node
    }, [forwardedRef])

    const markEdge = (event) => {
        if (event.pointerType === 'mouse' && innerRef.current) innerRef.current.dataset.from = edgeFrom(event, innerRef.current)
    }
    const handleEnter = (event) => {
        markEdge(event)
        onPointerEnter?.(event)
    }
    const handleLeave = (event) => {
        markEdge(event)
        onPointerLeave?.(event)
    }

    const externalArrow = arrow === 'external' || (arrow && external)
    const arrowGlyph = externalArrow ? '↗' : '→'
    const classes = `btn btn--${variant} ${className}`.trim()
    const content = (
        <>
            <span className="btn__label">
                <span className="btn__roll">
                    <span className="btn__text">{children}</span>
                    <span className="btn__text btn__text--clone" aria-hidden="true">{children}</span>
                </span>
                {arrow ? <span className={`btn__arrow ${externalArrow ? 'btn__arrow--external' : ''}`} aria-hidden="true">{arrowGlyph}</span> : null}
            </span>
            {loading ? <span className="btn__spinner" aria-hidden="true" /> : null}
        </>
    )

    const pointer = { onPointerEnter: handleEnter, onPointerLeave: handleLeave }

    if (to || href) {
        const guard = (event) => {
            if (inactive) {
                event.preventDefault()
                return
            }
            onClick?.(event)
        }
        const shared = {
            ref: setRef,
            className: classes,
            onClick: guard,
            'aria-disabled': inactive || undefined,
            'aria-busy': loading || undefined,
            tabIndex: inactive ? -1 : undefined,
            ...pointer,
            ...rest,
        }
        if (to) return <Link to={to} {...shared}>{content}</Link>
        return (
            <a href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...shared}>
                {content}
            </a>
        )
    }

    return (
        <button
            ref={setRef}
            type={type}
            className={classes}
            disabled={inactive}
            aria-busy={loading || undefined}
            onClick={onClick}
            {...pointer}
            {...rest}
        >
            {content}
        </button>
    )
})

Button.propTypes = {
    variant: PropTypes.oneOf(VARIANTS),
    to: PropTypes.string,
    href: PropTypes.string,
    external: PropTypes.bool,
    arrow: PropTypes.oneOf([true, false, 'external']),
    type: PropTypes.oneOf(['button', 'submit', 'reset']),
    loading: PropTypes.bool,
    disabled: PropTypes.bool,
    magnetic: PropTypes.bool,
    className: PropTypes.string,
    children: PropTypes.node,
    onClick: PropTypes.func,
    onPointerEnter: PropTypes.func,
    onPointerLeave: PropTypes.func,
}

export default Button

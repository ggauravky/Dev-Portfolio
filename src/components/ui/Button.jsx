// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { forwardRef } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import './ui.css'

const VARIANTS = ['primary', 'secondary', 'ghost', 'link']

/**
 * One button for the whole site. Renders a <button>, a router <Link> (`to`) or an
 * <a> (`href`). Disabled/loading links get aria-disabled and swallow clicks, since
 * anchors have no `disabled` attribute.
 */
const Button = forwardRef(function Button(
    { variant = 'primary', to, href, type = 'button', loading = false, disabled = false, className = '', children, onClick, ...rest },
    ref,
) {
    const inactive = disabled || loading
    const classes = `btn btn--${variant} ${className}`.trim()
    const content = (
        <>
            <span className="btn__label">{children}</span>
            {loading ? <span className="btn__spinner" aria-hidden="true" /> : null}
        </>
    )

    if (to || href) {
        const guard = (event) => {
            if (inactive) {
                event.preventDefault()
                return
            }
            onClick?.(event)
        }
        const shared = {
            ref,
            className: classes,
            onClick: guard,
            'aria-disabled': inactive || undefined,
            'aria-busy': loading || undefined,
            tabIndex: inactive ? -1 : undefined,
            ...rest,
        }
        return to
            ? <Link to={to} {...shared}>{content}</Link>
            : <a href={href} {...shared}>{content}</a>
    }

    return (
        <button
            ref={ref}
            type={type}
            className={classes}
            disabled={inactive}
            aria-busy={loading || undefined}
            onClick={onClick}
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
    type: PropTypes.oneOf(['button', 'submit', 'reset']),
    loading: PropTypes.bool,
    disabled: PropTypes.bool,
    className: PropTypes.string,
    children: PropTypes.node,
    onClick: PropTypes.func,
}

export default Button

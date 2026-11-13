// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { forwardRef } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import './ui.css'

/**
 * Text link whose accent underline draws in on hover/focus (and stays for the
 * current page). `to` → router link; `href` → anchor; `external` opens a new tab
 * and adds the ↗ mark, the only icon the system uses for meaning.
 */
const TextLink = forwardRef(function TextLink(
    { to, href, external = false, tone = 'paper', underlined = false, className = '', children, ...rest },
    ref,
) {
    const classes = [
        'text-link',
        tone === 'muted' ? 'text-link--muted' : '',
        underlined ? 'text-link--underlined' : '',
        className,
    ].filter(Boolean).join(' ')

    const label = (
        <span className="text-link__label">
            {children}
            {external ? <span aria-hidden="true">&nbsp;↗</span> : null}
        </span>
    )

    if (to) {
        return <Link ref={ref} to={to} className={classes} {...rest}>{label}</Link>
    }

    return (
        <a
            ref={ref}
            href={href}
            className={classes}
            {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            {...rest}
        >
            {label}
        </a>
    )
})

TextLink.propTypes = {
    to: PropTypes.string,
    href: PropTypes.string,
    external: PropTypes.bool,
    tone: PropTypes.oneOf(['paper', 'muted']),
    underlined: PropTypes.bool,
    className: PropTypes.string,
    children: PropTypes.node,
}

export default TextLink

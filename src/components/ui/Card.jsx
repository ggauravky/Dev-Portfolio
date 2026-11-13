// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio

import PropTypes from 'prop-types'
import TextLink from './TextLink'

/**
 * A "card" in Monograph is a hairline row, not a box: a top rule, the meta in a
 * margin column on desktop (inline above the title on mobile), then title and body.
 */
function Card({ as: Tag = 'article', meta, title, titleAs: Title = 'h3', to, href, external = false, children, className = '' }) {
    const heading = to || href
        ? <TextLink to={to} href={href} external={external}>{title}</TextLink>
        : title

    return (
        <Tag className={`grid gap-2 border-t border-rule py-6 md:grid-cols-[12rem_1fr] md:gap-8 ${className}`.trim()}>
            <div className="text-small text-muted">{meta}</div>
            <div className="min-w-0">
                <Title className="font-serif text-h3 text-paper">{heading}</Title>
                {children ? <div className="mt-2 text-body text-muted">{children}</div> : null}
            </div>
        </Tag>
    )
}

Card.propTypes = {
    as: PropTypes.elementType,
    meta: PropTypes.node,
    title: PropTypes.node.isRequired,
    titleAs: PropTypes.elementType,
    to: PropTypes.string,
    href: PropTypes.string,
    external: PropTypes.bool,
    children: PropTypes.node,
    className: PropTypes.string,
}

export default Card

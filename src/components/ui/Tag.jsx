// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio

import PropTypes from 'prop-types'

/** Square label for stack/topic metadata. Not interactive — filters are buttons. */
function Tag({ children, className = '' }) {
    return (
        <span
            className={`inline-flex h-7 items-center rounded-control border border-rule px-2 text-[13px] leading-none text-muted ${className}`.trim()}
        >
            {children}
        </span>
    )
}

Tag.propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
}

export default Tag

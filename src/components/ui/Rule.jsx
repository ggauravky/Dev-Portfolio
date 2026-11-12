// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio

import PropTypes from 'prop-types'

/** The 1px hairline that separates sections and list rows. */
function Rule({ className = '' }) {
    return <hr className={`h-px border-0 bg-rule ${className}`.trim()} />
}

Rule.propTypes = { className: PropTypes.string }

export default Rule

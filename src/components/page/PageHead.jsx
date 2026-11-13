// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// P5 page header: rail facts, a static serif h1 (never animated in, it is the
// LCP) and the lede. The same markup is painted before JS by
// scripts/route-shells.js from the heads in src/lib/pageHeads.js; keep the two
// in step. `children` (actions, status) render below the lede, not in the shell.

import PropTypes from 'prop-types'

function PageHead({ head, children }) {
    return (
        <header className="pg-head page-wrap page-grid">
            <p className="page-rail pg-head__rail">
                {head.rail.map((item) => <span key={item}>{item}</span>)}
            </p>
            <div className="page-main">
                <h1 className="pg-h1">{head.title}</h1>
                <p className="pg-lede">{head.lede}</p>
                {children}
            </div>
        </header>
    )
}

PageHead.propTypes = {
    head: PropTypes.shape({
        rail: PropTypes.arrayOf(PropTypes.string).isRequired,
        title: PropTypes.string.isRequired,
        lede: PropTypes.string.isRequired,
    }).isRequired,
    children: PropTypes.node,
}

export default PageHead

// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// P5 section shell (the Home `Section`, shared): the number in the margin rail,
// a line-masked h2 (motion moment: the line rises once on reveal), then content.

import PropTypes from 'prop-types'
import Reveal from '../Reveal'

const pad2 = (n) => String(n).padStart(2, '0')

function PageSection({ id, index, title, intro, children, className = '' }) {
    const headingId = `${id}-title`
    return (
        <section id={id} className={`pg-section ${className}`.trim()} aria-labelledby={headingId}>
            <Reveal className="page-wrap page-grid">
                <p className="page-rail" aria-hidden="true">{pad2(index)}</p>
                <div className="page-main">
                    <h2 id={headingId} className="pg-h2">
                        <span className="line-mask"><span className="line-mask__line">{title}</span></span>
                    </h2>
                    {intro ? <p className="pg-intro">{intro}</p> : null}
                    {children}
                </div>
            </Reveal>
        </section>
    )
}

PageSection.propTypes = {
    id: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    intro: PropTypes.node,
    children: PropTypes.node,
    className: PropTypes.string,
}

export default PageSection

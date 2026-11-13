// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// P6 legal shell (Privacy, Terms, Refund): the P5 page head, then numbered
// hairline sections with the number in the margin rail. Static: legal text has
// no motion moments.

import { Children, cloneElement, isValidElement } from 'react'
import PropTypes from 'prop-types'
import PageHead from './PageHead'

const pad2 = (n) => String(n).padStart(2, '0')
const slug = (s) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export function LegalSection({ title, headingId, children }) {
    return (
        <>
            <h2 id={headingId} className="lg-h2">{title}</h2>
            <div className="lg-prose">{children}</div>
        </>
    )
}

LegalSection.propTypes = {
    title: PropTypes.string.isRequired,
    headingId: PropTypes.string,
    children: PropTypes.node,
}

function LegalPage({ title, updated, lede, children }) {
    const sections = Children.toArray(children).filter(isValidElement)
    return (
        <main className="pg lg">
            <PageHead head={{ rail: ['Last updated', updated], title, lede }} />
            {sections.map((section, i) => {
                const id = slug(section.props.title)
                return (
                    <section key={id} id={id} className="lg-sec page-wrap page-grid" aria-labelledby={`${id}-title`}>
                        <p className="page-rail" aria-hidden="true">{pad2(i + 1)}</p>
                        <div className="page-main">{cloneElement(section, { headingId: `${id}-title` })}</div>
                    </section>
                )
            })}
        </main>
    )
}

LegalPage.propTypes = {
    title: PropTypes.string.isRequired,
    updated: PropTypes.string.isRequired,
    lede: PropTypes.string.isRequired,
    children: PropTypes.node,
}

export default LegalPage

// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

// Service page (P5): /frontend-development and friends, and /services/:slug.
// Header from src/lib/pageHeads.js (painted before JS for the service paths),
// then Scope as hairline rows, Pricing with the data's FAQ in native
// <details>, and Book. Booking goes to /booknow, where the backend sets the
// amount; sign-in is triggered there (D-002).
// Motion moments: (1) line-masked section headings.

import { useMemo } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import PropTypes from 'prop-types'
import useSEO from '../hooks/useSEO'
import { NOT_FOUND_SEO, serviceSeo } from '../lib/seo'
import PageHead from '../components/page/PageHead'
import PageSection from '../components/page/PageSection'
import { Button, TextLink } from '../components/ui'
import { getServiceBySlug } from '../data/servicesData'
import { serviceHead } from '../lib/pageHeads'
import './Services.css'

function ScopeRow({ label, items }) {
    if (!items?.length) return null
    return (
        <li className="pg-row">
            <h3 className="pg-row__label">{label}</h3>
            <ul className="sv-scope">
                {items.map((item) => <li key={item}>{item}</li>)}
            </ul>
        </li>
    )
}

ScopeRow.propTypes = {
    label: PropTypes.string.isRequired,
    items: PropTypes.arrayOf(PropTypes.string),
}

function ServiceDetail({ forcedSlug = '' }) {
    const params = useParams()
    const slug = forcedSlug || params.slug || ''
    const service = getServiceBySlug(slug)

    const seo = useMemo(() => (service ? serviceSeo(service) : NOT_FOUND_SEO), [service])
    useSEO(seo)

    if (!service) {
        return <Navigate to="/services" replace />
    }

    const book = `/booknow?service=${service.slug}`

    return (
        <main className="pg service">
            <PageHead head={serviceHead(service)}>
                {service.outcomePromise ? <p className="sv-promise">{service.outcomePromise}</p> : null}
                <div className="pg-actions">
                    <Button to={book} arrow>Book this service</Button>
                    <TextLink to="/contact">Ask first</TextLink>
                    <TextLink to="/services" tone="muted">All services</TextLink>
                </div>
            </PageHead>

            <PageSection id="scope" index={1} title="Scope">
                <ul className="pg-rows">
                    <ScopeRow label="For" items={service.whoThisIsFor || service.bestFor} />
                    <ScopeRow label="You get" items={service.exactDeliverables || service.deliverables} />
                    <ScopeRow label="Features" items={service.features} />
                    <ScopeRow label="You provide" items={service.youProvide} />
                    <ScopeRow label="Results" items={service.expectedResults} />
                    <ScopeRow label="Delivery" items={[service.deliveryWindow || service.timeline, service.supportLevel].filter(Boolean)} />
                </ul>
            </PageSection>

            <PageSection id="pricing" index={2} title="Pricing">
                <p className="sv-amount">{service.priceLabel}</p>
                <p className="pg-intro sv-amount__note">Razorpay checkout. The server sets the price and verifies the payment before the booking is confirmed.</p>
                {service.pricingFaq?.length ? (
                    <div className="sv-faq">
                        {service.pricingFaq.map((item) => (
                            <details key={item.question} className="sv-faq__item">
                                <summary className="sv-faq__q">
                                    <span>{item.question}</span>
                                    <span className="pg-toggle" aria-hidden="true" />
                                </summary>
                                <p className="sv-faq__a">{item.answer}</p>
                            </details>
                        ))}
                    </div>
                ) : null}
            </PageSection>

            <PageSection id="book" index={3} title="Book">
                {service.proofArtifact ? <p className="pg-intro">{service.proofArtifact.summary}</p> : null}
                <div className="pg-actions">
                    <Button to={book} arrow>Book this service</Button>
                    {service.proofArtifact ? (
                        <TextLink href={service.proofArtifact.url} external>{service.proofArtifact.label}</TextLink>
                    ) : null}
                    <TextLink to="/projects">Projects</TextLink>
                </div>
            </PageSection>
        </main>
    )
}

ServiceDetail.propTypes = {
    forcedSlug: PropTypes.string,
}

export default ServiceDetail

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

import { Navigate, useParams } from 'react-router-dom'
import PropTypes from 'prop-types'
import useSEO from '../hooks/useSEO'
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

    const siteUrl = 'https://ggauravky.vercel.app'
    const seoTitle = service
        ? `${service.title} | Gaurav Kumar Yadav | AI/ML & Web Developer Lucknow`
        : 'Services | Gaurav Kumar Yadav | AI/ML & Web Developer'
    const seoDescription = service
        ? `${service.summary} ${service.outcomePromise} Offered by Gaurav Kumar Yadav, BCA student at BBDU Lucknow. Pricing: ${service.priceLabel}. Secure Razorpay checkout uses server-verified pricing.`
        : 'Work with Gaurav Kumar Yadav for frontend, backend, full-stack, and AI or data science delivery with secure Razorpay checkout.'
    const seoKeywords = service
        ? `${service.title} Gaurav Kumar Yadav, ${service.category} developer service Lucknow, Gaurav Kumar Yadav services, AI ML developer services India, web developer booking BBDU`
        : 'Gaurav Kumar Yadav developer services, AI ML developer Lucknow, web developer booking India, BBDU student developer'

    const serviceJsonLd = service ? {
        '@type': 'Service',
        '@id': `${siteUrl}/${service.slug}`,
        name: service.title,
        description: service.summary,
        url: `${siteUrl}/${service.slug}`,
        provider: {
            '@type': 'Person',
            '@id': `${siteUrl}/#person`,
            name: 'Gaurav Kumar Yadav',
            url: siteUrl,
            jobTitle: 'AI/ML Developer & Web Developer',
            address: {
                '@type': 'PostalAddress',
                addressLocality: 'Lucknow',
                addressRegion: 'Uttar Pradesh',
                addressCountry: 'India'
            }
        },
        areaServed: { '@type': 'Country', name: 'India' },
        offers: {
            '@type': 'Offer',
            price: service.amount,
            priceCurrency: 'INR',
            availability: 'https://schema.org/InStock',
            url: `${siteUrl}/booknow?service=${service.slug}`
        },
        category: service.category
    } : null

    useSEO({
        title: seoTitle,
        description: seoDescription,
        keywords: seoKeywords,
        ogImage: 'https://ggauravky.vercel.app/images/profile.jpg',
        additionalJsonLd: serviceJsonLd
    })

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

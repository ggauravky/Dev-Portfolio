// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

// Services (P5). A price list, not a card grid: one hairline row per service
// with its price in the label column. Display prices come from servicesData;
// the amount actually charged is always set by the backend
// (backend/data/servicePricing.json) when /booknow creates the order.
// Motion moments: (1) line-masked section headings.

import useSEO from '../hooks/useSEO'
import { staticSeo } from '../lib/seo'
import PageHead from '../components/page/PageHead'
import { servicesHead } from '../lib/pageHeads'
import PageSection from '../components/page/PageSection'
import { Button, TextLink } from '../components/ui'
import { servicesData } from '../data/servicesData'
import { siteStatus } from '../data/siteStatus'
import './Services.css'

const SEO = staticSeo('/services')

const HEAD = servicesHead(servicesData)
const BOOK_DEFAULT = '/booknow?service=fullstack-development'

const STEPS = [
    'Read the service page and confirm it fits.',
    'Book with your preferred schedule and sign in.',
    'Pay through Razorpay; the booking is confirmed once the server verifies the payment.',
]

const TRUST = [
    ['Price', 'The server sets the price and verifies the captured payment before confirming a booking.'],
    ['Card data', 'Razorpay Checkout handles payment details; this site stores only the identifiers needed to verify the transaction.'],
    ['Your data', 'Booking details are used only for booking and delivery communication.'],
    ['Proof', 'Projects and GitHub repositories are public, so you can check the work before booking.'],
]

function Services() {
    useSEO({
        ...SEO,
        additionalJsonLd: {
            '@type': 'FAQPage',
            mainEntity: [
                {
                    '@type': 'Question',
                    name: 'What services does Gaurav Kumar Yadav offer?',
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'Gaurav Kumar Yadav offers four services: Frontend Development, Backend Development, Full Stack Development, and AI & Data Science Guidance. Payments use server-verified Razorpay checkout.'
                    }
                },
                {
                    '@type': 'Question',
                    name: 'How can I book a session with Gaurav Kumar Yadav?',
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'Visit https://ggauravky.vercel.app/booknow, select a service, sign in, and complete the server-verified Razorpay checkout.'
                    }
                },
                {
                    '@type': 'Question',
                    name: 'What do Gaurav Kumar Yadav services cost?',
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'Frontend and Backend Development start at INR 1499, Full Stack Development starts at INR 3499, and AI & Data Science Guidance starts at INR 499. Final project pricing depends on the agreed scope. All prices are in Indian Rupees (INR).'
                    }
                },
                {
                    '@type': 'Question',
                    name: 'Where is Gaurav Kumar Yadav based?',
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'Gaurav Kumar Yadav is based in Lucknow, Uttar Pradesh, India. He is a BCA student at BBD University (BBDU) and serves clients across India remotely.'
                    }
                },
                {
                    '@type': 'Question',
                    name: 'What technologies does Gaurav Kumar Yadav work with?',
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'Gaurav Kumar Yadav specialises in Python, React, Node.js, Express.js, MongoDB (MERN stack), Machine Learning, and AI/ML projects. He has completed the AI and Machine Learning Program through IIT Mandi x Masai School.'
                    }
                }
            ]
        }
    })

    return (
        <main className="pg services">
            <PageHead head={HEAD}>
                <div className="pg-actions">
                    <Button to={BOOK_DEFAULT} arrow>Book a service</Button>
                    <TextLink to="/contact">Ask first</TextLink>
                    <TextLink to="/support" tone="muted">Support my work</TextLink>
                </div>
            </PageHead>

            <PageSection id="list" index={1} title="Price list">
                <ul className="pg-rows">
                    {servicesData.map((service) => (
                        <li key={service.slug} className="pg-row sv-row">
                            <p className="pg-row__label sv-price">{service.priceLabel}</p>
                            <div className="pg-row__body">
                                <h3 className="pg-row__title">{service.title}</h3>
                                <p className="sv-summary">{service.summary}</p>
                                <ul className="sv-features">
                                    {service.features.map((f) => <li key={f}>{f}</li>)}
                                </ul>
                                <p className="pg-row__meta">{service.timeline}</p>
                                <p className="sv-links">
                                    <TextLink to={service.path}>Details<span className="sr-only">: {service.title}</span></TextLink>
                                    <TextLink to={`/booknow?service=${service.slug}`}>Book<span className="sr-only">: {service.title}</span></TextLink>
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            </PageSection>

            <PageSection id="booking" index={2} title="How booking works">
                <ol className="pg-rows sv-steps">
                    {STEPS.map((step, i) => (
                        <li key={step} className="sv-step">
                            <span className="pg-row__label" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                            <span>{step}</span>
                        </li>
                    ))}
                </ol>
                <dl className="sv-trust">
                    {TRUST.map(([term, text]) => (
                        <div key={term} className="sv-trust__row">
                            <dt className="pg-row__label">{term}</dt>
                            <dd>{text}</dd>
                        </div>
                    ))}
                </dl>
            </PageSection>

            <PageSection id="start" index={3} title="Check the work first">
                <div className="pg-actions sv-close">
                    <Button to={BOOK_DEFAULT} arrow>Book a service</Button>
                    <TextLink to="/projects">Projects</TextLink>
                    <TextLink href={siteStatus.links.github} external>GitHub</TextLink>
                </div>
            </PageSection>
        </main>
    )
}

export default Services

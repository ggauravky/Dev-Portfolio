// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

// About (P5). A short essay page on the shared margin-rail grid: the static
// header (painted before JS, src/lib/pageHeads.js), then Now, What I build,
// How I work, Practice and Contact as hairline lists.
// Motion moments: (1) line-masked section headings. Buttons keep their kit hover.

import PropTypes from 'prop-types'
import useSEO from '../hooks/useSEO'
import PageHead from '../components/page/PageHead'
import { STATIC_HEADS } from '../lib/pageHeads'
import PageSection from '../components/page/PageSection'
import { Button, TextLink } from '../components/ui'
import { siteStatus } from '../data/siteStatus'
import './About.css'

const NOW = [
    {
        label: 'Education',
        title: 'Bachelor of Computer Applications',
        org: 'Babu Banarasi Das University',
        meta: '2024 to present · Lucknow',
        status: 'In progress',
    },
    {
        label: 'Specialisation',
        title: 'Minor in AI & Data Science',
        org: 'IIT Mandi × Masai',
        meta: 'Machine learning, deep learning, data science',
        status: 'In progress',
        certificate: '/images/about/mandi_cert.png',
    },
    {
        label: 'Experience',
        title: 'Full-stack intern',
        org: 'Ashoksoft Technologies',
        meta: 'Aug 2026 to present · Remote',
        status: 'Current',
        current: true,
        certificate: '/images/about/ashok_cert.png',
    },
]

const FOCUS = [
    { label: 'AI / ML', items: ['RAG and retrieval systems', 'LLM-powered applications', 'Machine-learning workflows', 'Data and automation'] },
    { label: 'Full stack', items: ['React and Next.js interfaces', 'Node.js and Express APIs', 'SQL and NoSQL systems', 'Real-time and production apps'] },
]

const STEPS = [
    ['Understand', 'the problem and its constraints'],
    ['Build', 'a working solution'],
    ['Measure', 'test and evaluate it'],
    ['Improve', 'iterate'],
    ['Ship', 'a practical result'],
]

const PRACTICE = [
    { label: 'GitHub', handle: 'ggauravky', href: siteStatus.links.github },
    { label: 'LeetCode', handle: 'gauravky', href: 'https://leetcode.com/u/gauravky/' },
]

function NowRow({ item }) {
    return (
        <li className="pg-row">
            <p className="pg-row__label">{item.label}</p>
            <div className="pg-row__body">
                <h3 className="pg-row__title">{item.title}</h3>
                <p className="pg-row__meta">{item.org} · {item.meta}</p>
                <p className="about-status">
                    {item.current ? (
                        <span className="pg-now"><span className="pg-dot" aria-hidden="true" />{item.status}</span>
                    ) : <span>{item.status}</span>}
                    {item.certificate ? (
                        <TextLink href={item.certificate} external tone="muted" className="about-cert">
                            Certificate<span className="sr-only">: {item.title}</span>
                        </TextLink>
                    ) : null}
                </p>
            </div>
        </li>
    )
}

NowRow.propTypes = {
    item: PropTypes.shape({
        label: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        org: PropTypes.string.isRequired,
        meta: PropTypes.string.isRequired,
        status: PropTypes.string.isRequired,
        current: PropTypes.bool,
        certificate: PropTypes.string,
    }).isRequired,
}

function About() {
    useSEO({
        title: 'About Gaurav Kumar Yadav | Full-Stack & AI/ML Developer',
        description: 'Meet Gaurav Kumar Yadav, a BCA student at BBD University specializing in AI and Data Science and working as a FullStack Intern at Ashoksoft Technologies.',
        keywords: 'Gaurav Kumar Yadav, full-stack developer, AI ML developer, BBD University, IIT Mandi Masai, Ashoksoft Technologies',
        ogImage: 'https://ggauravky.vercel.app/images/profile.jpg',
    })

    return (
        <main className="pg about">
            <PageHead head={STATIC_HEADS['/about']}>
                <p className="about-now pg-now">
                    <span className="pg-dot" aria-hidden="true" />
                    <span>Now: full-stack intern at Ashoksoft Technologies</span>
                </p>
                <div className="pg-actions">
                    <Button href={siteStatus.resumeUrl} external arrow="external">Resume</Button>
                    <TextLink to="/journey">The full journey</TextLink>
                </div>
            </PageHead>

            <PageSection id="now" index={1} title="Now">
                <ul className="pg-rows">
                    {NOW.map((item) => <NowRow key={item.label} item={item} />)}
                </ul>
            </PageSection>

            <PageSection id="build" index={2} title="What I build">
                <div className="about-focus">
                    {FOCUS.map((area) => (
                        <div key={area.label}>
                            <h3 className="pg-row__label">{area.label}</h3>
                            <ul className="about-focus__list">
                                {area.items.map((item) => <li key={item}>{item}</li>)}
                            </ul>
                        </div>
                    ))}
                </div>
            </PageSection>

            <PageSection id="method" index={3} title="How I work">
                <ol className="pg-rows about-steps">
                    {STEPS.map(([verb, detail], i) => (
                        <li key={verb} className="about-step">
                            <span className="pg-row__label" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                            <span><strong className="about-step__verb">{verb}</strong> {detail}</span>
                        </li>
                    ))}
                </ol>
            </PageSection>

            <PageSection id="practice" index={4} title="Practice">
                <ul className="pg-rows">
                    {PRACTICE.map((p) => (
                        <li key={p.label} className="pg-row">
                            <p className="pg-row__label">{p.label}</p>
                            <p className="pg-row__body">
                                <TextLink href={p.href} external translate="no">{p.handle}</TextLink>
                            </p>
                        </li>
                    ))}
                </ul>
            </PageSection>

            <PageSection id="contact" index={5} title="Work together">
                <p className="about-close">Open to software engineering and AI/ML roles, open-source work and collaborations.</p>
                <div className="pg-actions">
                    <Button to="/contact" arrow>Contact</Button>
                    <TextLink href={siteStatus.resumeUrl} external>Resume</TextLink>
                </div>
            </PageSection>
        </main>
    )
}

export default About

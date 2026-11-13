// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

// Home (P3, direction A — Monograph). Each section is a different "page" of the
// book: title page, essay, contents, list, notebook, timeline, colophon.
// Motion moments: (1) S6 hero-name weight axis, (2) section reveals with
// line-masked headings. Nothing else moves on its own; the hero live panel
// (HeroLive, D-074) only changes text once a minute.

import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import useSEO from '../hooks/useSEO'
import { getFeaturedBlogs } from '../data/blogsData'
import { projectsData } from '../data/projectsData'
import { RANKED_PROJECTS } from '../lib/projects'
import { journeyData } from '../data/journeyData'
import { siteStatus } from '../data/siteStatus'
import Reveal from '../components/Reveal'
import HeroName from '../components/home/HeroName'
import HeroLive from '../components/home/HeroLive'
import { Button, TextLink } from '../components/ui'
import './Home.css'

const NAME = 'Gaurav Kumar Yadav'
const SELECTED_WORK_LIMIT = 6

// Module-level: the data is static, so compute once.
// The owner's ranked case studies (src/lib/projects.js, D-049), same as /projects.
const SELECTED_WORK = RANKED_PROJECTS.slice(0, SELECTED_WORK_LIMIT)
const NOTEBOOK = getFeaturedBlogs()
const JOURNEY_BY_DATE = [...journeyData].sort((a, b) => new Date(b.date) - new Date(a.date))
const LATEST_JOURNEY = JOURNEY_BY_DATE.slice(0, 3)
const CURRENT_ROLES = JOURNEY_BY_DATE.filter((item) => /present/i.test(item.dateLabel))

// The Notebook section is optional, so the sections after it shift up by one.
const HAS_NOTEBOOK = NOTEBOOK.length > 0
const JOURNEY_INDEX = HAS_NOTEBOOK ? 5 : 4
const CONTACT_INDEX = JOURNEY_INDEX + 1

const SKILLS = [
    { group: 'AI & ML', items: ['Python', 'Machine Learning', 'Data Analysis', 'Pandas', 'NumPy'] },
    { group: 'Web', items: ['React', 'JavaScript', 'Tailwind CSS', 'Node.js', 'Git'] },
    { group: 'Languages', items: ['Python', 'JavaScript', 'C', 'SQL'] },
]

function pad(n) {
    return String(n).padStart(2, '0')
}

/** Section shell: number + name in the margin rail, line-masked heading. */
function Section({ id, index, title, children, footer }) {
    const headingId = `${id}-title`
    return (
        <section id={id} className="home-section" aria-labelledby={headingId}>
            <Reveal className="page-wrap page-grid">
                <p className="page-rail" aria-hidden="true">{pad(index)}</p>
                <div className="page-main">
                    <h2 id={headingId} className="home-h2">
                        <span className="line-mask"><span className="line-mask__line">{title}</span></span>
                    </h2>
                    {children}
                    {footer ? <div className="home-more">{footer}</div> : null}
                </div>
            </Reveal>
        </section>
    )
}

Section.propTypes = {
    id: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    children: PropTypes.node,
    footer: PropTypes.node,
}

function Home() {
    useSEO({
        title: 'Gaurav Kumar Yadav | AI/ML Developer & Web Developer | BBDU Lucknow | Portfolio',
        description: 'Gaurav Kumar Yadav is a BCA student at BBD University (BBDU), Lucknow, India, building AI/ML and web development projects. Explore portfolio case studies in machine learning, data science basics, React, MERN stack, and Python.',
        keywords: 'Gaurav Kumar Yadav, Gaurav Kumar Yadav BBDU, Gaurav Lucknow developer, Gaurav AI ML developer, Gaurav web developer India, ggauravky portfolio, BCA AI ML student India, AI ML developer Lucknow, frontend developer portfolio India, MERN stack developer student, machine learning beginner projects',
        ogImage: 'https://ggauravky.vercel.app/og-image.jpg'
    })

    return (
        <main className="home">
            {/* Title page */}
            <section className="home-hero" aria-labelledby="home-title">
                <div className="page-wrap page-grid">
                    <p className="page-rail home-hero__meta">
                        <span>Lucknow, India</span>
                        <span>BCA, BBD University</span>
                    </p>

                    <div className="home-hero__main">
                        <HeroName id="home-title" name={NAME} />
                        <p className="home-hero__lede">
                            AI/ML and web developer. I build machine learning projects and web products with Python, React and Node.js.
                        </p>
                        <HeroLive />
                        <div className="home-hero__actions">
                            <Button to="/projects" arrow>View projects</Button>
                            <Button to="/services" variant="secondary">Book a service</Button>
                            <TextLink to="/contact" className="home-hero__contact">Contact</TextLink>
                        </div>
                    </div>
                </div>
            </section>

            {/* Essay */}
            <Section
                id="about"
                index={1}
                title="About"
                footer={<TextLink to="/about">More about me →</TextLink>}
            >
                <div className="home-prose">
                    <p>
                        I&apos;m a BCA student at BBD University (BBDU), Lucknow, working towards AI/ML and web development by solving real problems with practical, user-first software.
                    </p>
                    <p>
                        I build beginner machine learning projects, data science foundations and production web interfaces with React, Node.js and the MERN stack, with Python on the ML side.
                    </p>
                </div>
                <dl className="home-facts">
                    {CURRENT_ROLES.length ? (
                        <>
                            <dt>Now</dt>
                            <dd>
                                <ul>
                                    {CURRENT_ROLES.map((role) => (
                                        <li key={role.id} className="home-now">
                                            <span className="home-now__dot" aria-hidden="true" />
                                            <span>{role.title}, {role.organization}</span>
                                        </li>
                                    ))}
                                </ul>
                            </dd>
                        </>
                    ) : null}
                    <dt>Profiles</dt>
                    <dd className="home-facts__links">
                        <TextLink href={siteStatus.links.github} external>GitHub</TextLink>
                        <TextLink href="https://leetcode.com/u/gauravky/" external>LeetCode</TextLink>
                        <TextLink href={siteStatus.links.linkedin} external>LinkedIn</TextLink>
                    </dd>
                </dl>
            </Section>

            {/* Contents */}
            <Section
                id="work"
                index={2}
                title="Selected work"
                footer={<TextLink to="/projects">All {projectsData.length} projects →</TextLink>}
            >
                <ol className="work-index">
                    {SELECTED_WORK.map((project, i) => (
                        <li key={project.id}>
                            <Link to={`/projects/${project.slug}`} className="work-row" data-cursor="View">
                                <span className="work-row__no" aria-hidden="true">{pad(i + 1)}</span>
                                <span className="work-row__body">
                                    <span className="work-row__title">{project.title}</span>
                                    <span className="work-row__desc">{project.description}</span>
                                </span>
                                <span className="work-row__meta">
                                    <span>{project.categories.join(' / ')}</span>
                                    <span>{project.isCollaborative ? 'Team' : 'Solo'}</span>
                                    <span className="work-row__stack">{project.techStack.slice(0, 3).join(', ')}</span>
                                </span>
                                <span className="work-row__arrow" aria-hidden="true">→</span>
                            </Link>
                        </li>
                    ))}
                </ol>
            </Section>

            {/* List */}
            <Section
                id="skills"
                index={3}
                title="Skills"
                footer={<TextLink to="/skills">All skills →</TextLink>}
            >
                <dl className="skills-list">
                    {SKILLS.map(({ group, items }) => (
                        <div key={group} className="skills-list__row">
                            <dt>{group}</dt>
                            <dd>{items.join(', ')}</dd>
                        </div>
                    ))}
                </dl>
            </Section>

            {/* Notebook */}
            {HAS_NOTEBOOK ? (
                <Section
                    id="notebook"
                    index={4}
                    title="Notebook"
                    footer={<TextLink to="/blog">All articles →</TextLink>}
                >
                    <ul className="note-list">
                        {NOTEBOOK.map((post) => (
                            <li key={post.id}>
                                <Link to={`/blog/${post.slug}`} className="note-row" data-cursor="Open">
                                    <span className="note-row__meta">
                                        <span>{post.category}</span>
                                        <span>{post.status === 'preview' ? 'Preview' : post.readTime}</span>
                                    </span>
                                    <span className="note-row__title">{post.title}</span>
                                    <span className="note-row__excerpt">{post.excerpt}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </Section>
            ) : null}

            {/* Timeline */}
            <Section
                id="journey"
                index={JOURNEY_INDEX}
                title="Journey"
                footer={<TextLink to="/journey">Full journey →</TextLink>}
            >
                <p className="home-intro">
                    Internships, workshops, hackathons, community events and certifications, newest first.
                </p>
                <ol className="journey-list">
                    {LATEST_JOURNEY.map((item) => (
                        <li key={item.id} className="journey-row">
                            <span className="journey-row__date">{item.dateLabel}</span>
                            <span className="journey-row__title">{item.title}</span>
                            <span className="journey-row__org">{item.organization} · {item.category}</span>
                        </li>
                    ))}
                </ol>
            </Section>

            {/* Contact */}
            <Section id="contact" index={CONTACT_INDEX} title="Contact">
                <p className="home-contact__lede">
                    Based in Lucknow, Uttar Pradesh, India. Have a project in mind? Tell me about it.
                </p>
                <div className="home-contact__actions">
                    <Button to="/contact" arrow>Get in touch</Button>
                    <TextLink href={`mailto:${siteStatus.email}`} className="home-contact__email" translate="no">{siteStatus.email}</TextLink>
                </div>
            </Section>
        </main>
    )
}

export default Home

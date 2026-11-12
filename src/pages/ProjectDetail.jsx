// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

// Case study (P4). One template for every project, read like a book chapter:
// title page (S3 arch frontispiece), a margin rail of facts, then numbered
// chapters built only from fields the project has; a missing field hides its
// chapter instead of padding it. Copy comes from projectsData.js only.
// Motion moments: (1) the shared-element arrival from the index (title and
// preview morph, src/lib/viewTransition.js), (2) line-masked chapter headings,
// (3) the same morph into the next project. The h1 paints statically.

import { useEffect, useRef } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import PropTypes from 'prop-types'
import useSEO from '../hooks/useSEO'
import { projectsData } from '../data/projectsData'
import {
    RANKED_PROJECTS,
    RANK_BY_SLUG,
    caseKicker,
    hasRealImage,
    hasUrl,
    ownRole,
    pad2,
    projectType,
    splitLead,
    splitPipeline,
} from '../lib/projects'
import { VT_TITLE, canViewTransition, isPlainClick, navigateWithTransition, preloadCaseStudy } from '../lib/viewTransition'
import LazyImage from '../components/LazyImage'
import Reveal from '../components/Reveal'
import Arch from '../components/Arch'
import { Button, TextLink } from '../components/ui'
import './ProjectDetail.css'

const FRONTIS_WIDTHS = [480, 768]
const TOTAL = RANKED_PROJECTS.length

function Chapter({ id, index, title, children }) {
    const headingId = `${id}-title`
    return (
        <section id={id} className="case-chapter" aria-labelledby={headingId}>
            <Reveal>
                <h2 id={headingId} className="case-h2">
                    <span className="case-h2__no" aria-hidden="true">{pad2(index)}</span>
                    <span className="line-mask"><span className="line-mask__line">{title}</span></span>
                </h2>
                {children}
            </Reveal>
        </section>
    )
}

Chapter.propTypes = {
    id: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    children: PropTypes.node,
}

function Architecture({ text }) {
    const steps = splitPipeline(text)
    if (!steps.length) return <p className="case-prose">{text}</p>
    return (
        <ol className="case-flow">
            {steps.map((step, i) => (
                <li key={step} className="case-flow__step">
                    <span className="case-flow__no" aria-hidden="true">{pad2(i + 1)}</span>
                    <span>{step}</span>
                </li>
            ))}
        </ol>
    )
}

Architecture.propTypes = { text: PropTypes.string.isRequired }

function LeadList({ items, ordered = false }) {
    const List = ordered ? 'ol' : 'ul'
    return (
        <List className="case-list">
            {items.map((item, i) => {
                const { lead, rest } = splitLead(item)
                return (
                    <li key={item} className="case-list__item">
                        {ordered ? <span className="case-list__no" aria-hidden="true">{pad2(i + 1)}</span> : null}
                        <p>
                            {lead ? <><strong className="case-list__lead">{lead}</strong>{' '}</> : null}
                            {rest}
                        </p>
                    </li>
                )
            })}
        </List>
    )
}

LeadList.propTypes = {
    items: PropTypes.arrayOf(PropTypes.string).isRequired,
    ordered: PropTypes.bool,
}

function NotFound() {
    const navigate = useNavigate()
    useEffect(() => {
        const timer = window.setTimeout(() => navigate('/projects', { replace: true }), 1500)
        return () => window.clearTimeout(timer)
    }, [navigate])

    return (
        <main className="case case--missing page-wrap">
            <h1 className="case-missing__title">Project not found</h1>
            <p className="case-missing__text" role="status">Taking you back to all projects…</p>
            <TextLink to="/projects" className="case-missing__link">← All projects</TextLink>
        </main>
    )
}

function ProjectDetail() {
    const { slug } = useParams()
    const navigate = useNavigate()
    const nextTitleRef = useRef(null)
    const project = projectsData.find((p) => p.slug === slug) || null

    useSEO({
        title: project
            ? `${project.title} — Case Study | Gaurav Kumar Yadav`
            : 'Project | Gaurav Kumar Yadav',
        description: project ? project.description : 'Explore a project case study by Gaurav Kumar Yadav.',
        keywords: project ? `${project.techStack.join(', ')}, Gaurav Kumar Yadav, AI ML developer Lucknow, web developer India, ggauravky portfolio` : '',
        ogImage: project ? `https://ggauravky.vercel.app${project.image}` : 'https://ggauravky.vercel.app/images/profile.jpg'
    })

    if (!project) return <NotFound />

    const rank = RANK_BY_SLUG.get(project.slug)
    const next = RANKED_PROJECTS[rank % TOTAL]
    const role = ownRole(project)
    const demo = hasUrl(project.demo) ? project.demo : null
    const source = hasUrl(project.github) ? project.github : null
    const screens = (project.screenshots || []).filter(hasRealImage)
    const frontis = hasRealImage(project.image) ? project.image : null
    const team = project.isCollaborative && project.team?.length ? project.team : null

    const chapters = [
        project.problem && { id: 'problem', title: 'Problem', body: <p className="case-prose">{project.problem}</p> },
        team && {
            id: 'team',
            title: 'Team',
            body: (
                <ul className="case-team">
                    {team.map((member) => (
                        <li key={member.name} className="case-team__row">
                            {member.portfolio
                                ? <TextLink href={member.portfolio} external className="case-team__name">{member.name}</TextLink>
                                : <span className="case-team__name">{member.name}</span>}
                            <span className="case-team__role">{member.role}</span>
                        </li>
                    ))}
                </ul>
            ),
        },
        project.solution && { id: 'what-it-does', title: 'What it does', body: <p className="case-prose">{project.solution}</p> },
        project.architecture && { id: 'architecture', title: 'Architecture', body: <Architecture text={project.architecture} /> },
        project.keyDecisions?.length && { id: 'decisions', title: 'Key decisions', body: <LeadList items={project.keyDecisions} ordered /> },
        project.lessonsLearned?.length && { id: 'learned', title: 'What I learned', body: <LeadList items={project.lessonsLearned} /> },
        screens.length && {
            id: 'screens',
            title: 'Screens',
            body: (
                <div className="case-screens">
                    {screens.map((src, i) => (
                        <figure key={src} className="case-screen">
                            <LazyImage
                                src={src}
                                alt={`${project.title}, screen ${i + 1} of ${screens.length}`}
                                sizes="(min-width: 1024px) 760px, 100vw"
                                className="case-screen__img"
                            />
                            {screens.length > 1 ? (
                                <figcaption className="case-screen__cap">{pad2(i + 1)} / {pad2(screens.length)}</figcaption>
                            ) : null}
                        </figure>
                    ))}
                </div>
            ),
        },
    ].filter(Boolean)

    const onNext = (event) => {
        if (!isPlainClick(event) || !canViewTransition()) return
        event.preventDefault()
        navigateWithTransition(navigate, `/projects/${next.slug}`, [[nextTitleRef.current, VT_TITLE]])
    }

    return (
        <main className="case">
            {/* Title page */}
            <header className="case-head page-wrap page-grid">
                <p className="page-rail case-head__rail">
                    <TextLink to="/projects" tone="muted" className="case-back">← All projects</TextLink>
                </p>
                <div className="case-head__main">
                    {/* This header is also painted pre-JS by scripts/route-shells.js; keep them in step. */}
                    <p className="case-kicker">{caseKicker(project)}</p>
                    <h1 className="case-title" data-vt-ready="">{project.title}</h1>
                    <p className="case-lede">{project.description}</p>
                    {demo || source ? (
                        <div className="case-actions">
                            {demo ? <Button href={demo} external arrow="external">Live demo</Button> : null}
                            {source ? (
                                <Button href={source} external variant={demo ? 'secondary' : 'primary'} arrow="external">Source on GitHub</Button>
                            ) : null}
                        </div>
                    ) : null}
                </div>
                {frontis ? (
                    <figure className="case-frontis" aria-hidden="true">
                        <Arch>
                            <LazyImage
                                src={frontis}
                                alt=""
                                width={480}
                                height={600}
                                priority
                                responsiveWidths={FRONTIS_WIDTHS}
                                sizes="(min-width: 1024px) 280px, 240px"
                                className="case-frontis__img"
                            />
                        </Arch>
                    </figure>
                ) : null}
            </header>

            {/* Margin rail + chapters */}
            <div className="case-body page-wrap page-grid">
                <aside className="page-rail case-meta" aria-label="Project facts">
                    <dl>
                        <div>
                            <dt>Type</dt>
                            <dd>{projectType(project)}</dd>
                        </div>
                        {role ? (
                            <div>
                                <dt>Role</dt>
                                <dd>{role}</dd>
                            </div>
                        ) : null}
                        <div>
                            <dt>Category</dt>
                            <dd>{project.categories.join(' / ')}</dd>
                        </div>
                        <div>
                            <dt>Stack</dt>
                            <dd>
                                <ul className="case-meta__stack">
                                    {project.techStack.map((tech) => <li key={tech}>{tech}</li>)}
                                </ul>
                            </dd>
                        </div>
                        {demo || source ? (
                            <div>
                                <dt>Links</dt>
                                <dd className="case-meta__links">
                                    {demo ? <TextLink href={demo} external>Live demo</TextLink> : null}
                                    {source ? <TextLink href={source} external>Source</TextLink> : null}
                                </dd>
                            </div>
                        ) : null}
                    </dl>
                </aside>

                <div className="page-main case-chapters">
                    {chapters.map((chapter, i) => (
                        <Chapter key={chapter.id} id={chapter.id} index={i + 1} title={chapter.title}>
                            {chapter.body}
                        </Chapter>
                    ))}
                </div>
            </div>

            {/* Next chapter */}
            {next && next.slug !== project.slug ? (
                <nav className="case-next page-wrap page-grid" aria-label="Next project">
                    <p className="page-rail">Next</p>
                    <div className="page-main">
                        <Link
                            to={`/projects/${next.slug}`}
                            className="case-next__link"
                            data-cursor="View"
                            onPointerEnter={preloadCaseStudy}
                            onClick={onNext}
                        >
                            <span className="case-next__no" aria-hidden="true">{pad2(RANK_BY_SLUG.get(next.slug))}</span>
                            <span ref={nextTitleRef} className="case-next__title">{next.title}</span>
                            <span className="case-next__arrow" aria-hidden="true">→</span>
                        </Link>
                        <p className="case-next__all">
                            <TextLink to="/projects">All {TOTAL} projects →</TextLink>
                        </p>
                    </div>
                </nav>
            ) : null}
        </main>
    )
}

export default ProjectDetail

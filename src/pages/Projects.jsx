// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

// Projects index (P4, S7). A ranked contents page, not a card grid: the six case
// studies first, then the rest. Filter (category, search) and order (rank,
// title, stack size) are native controls whose state lives in the URL, so Back
// from a case study returns to the same view.
// Motion moments: (1) the cursor-following preview (fine pointers only),
// (2) the row → case-study shared-element transition, (3) line-masked group
// headings. The h1 paints statically.

import { useCallback, useEffect, useId, useMemo, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import PropTypes from 'prop-types'
import useSEO from '../hooks/useSEO'
import { projectsData } from '../data/projectsData'
import {
    CASE_STUDY_COUNT,
    CATEGORIES,
    PROJECTS_LEDE,
    RANKED_PROJECTS,
    RANK_BY_SLUG,
    isCaseStudy,
    pad2,
    projectType,
} from '../lib/projects'
import { useFinePointer, useReducedMotion } from '../lib/motion'
import {
    VT_MEDIA,
    VT_TITLE,
    canViewTransition,
    isPlainClick,
    navigateWithTransition,
    preloadCaseStudy,
} from '../lib/viewTransition'
import Reveal from '../components/Reveal'
import ProjectPreview from '../components/projects/ProjectPreview'
import { Button, Input, TextLink } from '../components/ui'
import './Projects.css'

const SORTS = [
    { id: 'rank', label: 'Rank' },
    { id: 'title', label: 'Title' },
    { id: 'stack', label: 'Stack size' },
]

const STACK_SHOWN = 3

const CATEGORY_COUNTS = Object.fromEntries(
    CATEGORIES.map((c) => [c, c === 'All' ? projectsData.length : projectsData.filter((p) => p.categories.includes(c)).length]),
)

function matchesQuery(project, q) {
    if (!q) return true
    return project.title.toLowerCase().includes(q)
        || project.description.toLowerCase().includes(q)
        || project.techStack.some((tech) => tech.toLowerCase().includes(q))
}

function sortProjects(list, sort) {
    if (sort === 'title') return [...list].sort((a, b) => a.title.localeCompare(b.title))
    if (sort === 'stack') return [...list].sort((a, b) => (b.techStack.length - a.techStack.length) || (RANK_BY_SLUG.get(a.slug) - RANK_BY_SLUG.get(b.slug)))
    return list // RANKED_PROJECTS is already in rank order
}

function ProjectRow({ project, compact, onEnter, onActivate }) {
    const titleRef = useRef(null)
    const extra = project.techStack.length - STACK_SHOWN
    return (
        <li>
            <Link
                to={`/projects/${project.slug}`}
                className={`pj-row${compact ? ' pj-row--compact' : ''}`}
                data-cursor="View"
                onPointerEnter={(event) => onEnter(event, project)}
                onFocus={preloadCaseStudy}
                onClick={(event) => onActivate(event, project, titleRef.current)}
            >
                <span className="pj-row__no" aria-hidden="true">{pad2(RANK_BY_SLUG.get(project.slug))}</span>
                <span className="pj-row__body">
                    <span ref={titleRef} className="pj-row__title">{project.title}</span>
                    {compact ? null : <span className="pj-row__desc">{project.description}</span>}
                </span>
                <span className="pj-row__meta">
                    <span>{projectType(project)}</span>
                    <span>{project.categories.join(' / ')}</span>
                    <span className="pj-row__stack">
                        {project.techStack.slice(0, STACK_SHOWN).join(', ')}
                        {extra > 0 ? ` +${extra}` : ''}
                    </span>
                </span>
                <span className="pj-row__arrow" aria-hidden="true">→</span>
            </Link>
        </li>
    )
}

ProjectRow.propTypes = {
    project: PropTypes.object.isRequired,
    compact: PropTypes.bool,
    onEnter: PropTypes.func.isRequired,
    onActivate: PropTypes.func.isRequired,
}

/** A titled group of rows (rank order only). */
function Group({ id, title, children }) {
    return (
        <section className="pj-group" aria-labelledby={id}>
            <Reveal>
                <h2 id={id} className="pj-group__title">
                    <span className="line-mask"><span className="line-mask__line">{title}</span></span>
                </h2>
            </Reveal>
            {children}
        </section>
    )
}

Group.propTypes = {
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    children: PropTypes.node,
}

function Projects() {
    useSEO({
        title: 'Projects | Gaurav Kumar Yadav | AI/ML and Web Developer Portfolio',
        description: 'Explore portfolio case studies by Gaurav Kumar Yadav, a BCA student at BBDU Lucknow, India. AI/ML and web development projects built with Python, React, Node.js, and MERN stack tools.',
        keywords: 'Gaurav Kumar Yadav projects, Gaurav AI ML developer, Gaurav web developer India, ggauravky portfolio, AI ML developer Lucknow, MERN stack developer student, machine learning beginner projects',
        ogImage: 'https://ggauravky.vercel.app/images/projects/chatapp.png',
        additionalJsonLd: {
            '@type': 'ItemList',
            name: 'Gaurav Kumar Yadav Project Portfolio',
            itemListElement: projectsData.map((project, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                url: `https://ggauravky.vercel.app/projects/${project.slug}`,
                name: project.title
            }))
        }
    })

    const navigate = useNavigate()
    const [params, setParams] = useSearchParams()
    const finePointer = useFinePointer()
    const reducedMotion = useReducedMotion()
    const showPreview = finePointer && !reducedMotion
    const previewRef = useRef(null)
    const uid = useId()

    const rawCategory = params.get('category')
    const category = CATEGORIES.includes(rawCategory) ? rawCategory : 'All'
    const rawSort = params.get('sort')
    const sort = SORTS.some((s) => s.id === rawSort) ? rawSort : 'rank'
    const query = params.get('q') || ''
    const q = query.trim().toLowerCase()

    const setParam = useCallback((key, value, fallback) => {
        setParams((prev) => {
            const next = new URLSearchParams(prev)
            if (!value || value === fallback) next.delete(key)
            else next.set(key, value)
            return next
        }, { replace: true, preventScrollReset: true })
    }, [setParams])

    const clearFilters = () => {
        setParams((prev) => {
            const next = new URLSearchParams(prev)
            next.delete('category')
            next.delete('q')
            return next
        }, { replace: true, preventScrollReset: true })
    }

    const visible = useMemo(() => sortProjects(
        RANKED_PROJECTS.filter((p) => (category === 'All' || p.categories.includes(category)) && matchesQuery(p, q)),
        sort,
    ), [category, q, sort])

    // A row can unmount under a still pointer (no pointerleave): hide on change.
    useEffect(() => { previewRef.current?.hide() }, [category, q, sort])

    const caseStudies = sort === 'rank' ? visible.filter(isCaseStudy) : []
    const others = sort === 'rank' ? visible.filter((p) => !isCaseStudy(p)) : visible

    const onEnter = useCallback((event, project) => {
        preloadCaseStudy()
        if (event.pointerType === 'mouse') previewRef.current?.show(project, event.clientX, event.clientY)
    }, [])

    const onMove = useCallback((event) => {
        if (event.pointerType === 'mouse') previewRef.current?.move(event.clientX, event.clientY)
    }, [])

    const onLeave = useCallback(() => previewRef.current?.hide(), [])

    const onActivate = useCallback((event, project, titleEl) => {
        if (!isPlainClick(event) || !canViewTransition()) return
        event.preventDefault()
        navigateWithTransition(navigate, `/projects/${project.slug}`, [
            [titleEl, VT_TITLE],
            [previewRef.current?.frame(), VT_MEDIA],
        ])
    }, [navigate])

    const listProps = showPreview ? { onPointerMove: onMove, onPointerLeave: onLeave } : {}
    const rows = (list, compact) => (
        <ol className="pj-list" {...listProps}>
            {list.map((project) => (
                <ProjectRow key={project.id} project={project} compact={compact} onEnter={onEnter} onActivate={onActivate} />
            ))}
        </ol>
    )

    const where = category === 'All' ? '' : ` in ${category}`
    const status = visible.length === projectsData.length
        ? `${visible.length} projects`
        : `${visible.length} of ${projectsData.length} projects${where}`

    return (
        <main className="pj">
            <header className="pj-head page-wrap page-grid">
                <p className="page-rail pj-head__rail">
                    <span>{projectsData.length} projects</span>
                    <span>{CASE_STUDY_COUNT} case studies</span>
                </p>
                <div className="page-main">
                    <h1 className="pj-h1">Projects</h1>
                    {/* The header is also painted pre-JS by scripts/route-shells.js; keep them in step. */}
                    <p className="pj-lede">{PROJECTS_LEDE}</p>
                </div>
            </header>

            <div className="pj-body page-wrap page-grid">
                <div className="page-main">
                    <form className="pj-controls" role="search" aria-label="Filter projects" onSubmit={(event) => event.preventDefault()}>
                        <fieldset className="pj-seg">
                            <legend className="pj-seg__legend">Show</legend>
                            <div className="pj-seg__options">
                                {CATEGORIES.map((c) => (
                                    <label key={c} className="pj-seg__option">
                                        <input
                                            type="radio"
                                            name={`${uid}-category`}
                                            value={c}
                                            checked={category === c}
                                            onChange={() => setParam('category', c, 'All')}
                                        />
                                        <span>{c}</span>
                                        <span className="pj-seg__count">{CATEGORY_COUNTS[c]}</span>
                                    </label>
                                ))}
                            </div>
                        </fieldset>

                        <fieldset className="pj-seg">
                            <legend className="pj-seg__legend">Order</legend>
                            <div className="pj-seg__options">
                                {SORTS.map((s) => (
                                    <label key={s.id} className="pj-seg__option">
                                        <input
                                            type="radio"
                                            name={`${uid}-sort`}
                                            value={s.id}
                                            checked={sort === s.id}
                                            onChange={() => setParam('sort', s.id, 'rank')}
                                        />
                                        <span>{s.label}</span>
                                    </label>
                                ))}
                            </div>
                        </fieldset>

                        <Input
                            id={`${uid}-q`}
                            type="search"
                            label="Search by name, stack or description"
                            className="pj-search"
                            value={query}
                            onChange={(event) => setParam('q', event.target.value, '')}
                            autoComplete="off"
                            spellCheck={false}
                        />
                    </form>

                    <p className="pj-status" role="status" aria-live="polite">{status}</p>

                    {visible.length === 0 ? (
                        <div className="pj-empty">
                            <p className="pj-empty__title">
                                {q ? <>Nothing matches &ldquo;{query.trim()}&rdquo;{where}.</> : <>No projects{where} yet.</>}
                            </p>
                            <p className="pj-empty__hint">Try a technology, such as React or Python, or show all categories.</p>
                            <Button variant="secondary" onClick={clearFilters}>Clear filters</Button>
                        </div>
                    ) : null}

                    {caseStudies.length ? (
                        <Group id={`${uid}-cases`} title="Case studies">{rows(caseStudies, false)}</Group>
                    ) : null}

                    {others.length ? (
                        sort === 'rank'
                            ? <Group id={`${uid}-more`} title={caseStudies.length ? 'More projects' : 'Projects'}>{rows(others, true)}</Group>
                            : rows(others, true)
                    ) : null}

                    <p className="pj-close">
                        <TextLink to="/services">Book a service →</TextLink>
                        <TextLink to="/contact">Get in touch →</TextLink>
                    </p>
                </div>
            </div>

            {showPreview ? <ProjectPreview ref={previewRef} /> : null}
        </main>
    )
}

export default Projects

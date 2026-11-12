// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

// Journey (P5). An archive, newest first, grouped by year: one hairline row per
// entry with the date in the label column, details in a native <details>
// (keyboard and screen-reader behaviour for free, no JS to expand). A category
// filter is a native radio group whose state lives in the URL (?category=).
// Deep links `/journey#<id>` still open and scroll to their entry.
// "Now" (the accent's job) = entries whose status is "In Progress".
// Motion moments: (1) line-masked year headings.

import { useEffect, useId, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import PropTypes from 'prop-types'
import useSEO from '../hooks/useSEO'
import PageHead from '../components/page/PageHead'
import { journeyHead } from '../lib/pageHeads'
import Reveal from '../components/Reveal'
import { TextLink } from '../components/ui'
import { journeyData } from '../data/journeyData'
import './Journey.css'

// The year from the ISO string itself, so it can't shift with the time zone.
const yearOf = (item) => Number(item.date.slice(0, 4))
const isNow = (item) => item.status === 'In Progress'
// A bare domain is a placeholder in the data, not a real link.
const realUrl = (url) => typeof url === 'string' && /^(https?:\/\/[^/]+\/.+|\/)/.test(url)

const HEAD = journeyHead(journeyData)
const NEWEST_FIRST = [...journeyData].sort((a, b) => (a.date < b.date ? 1 : -1))

const CATEGORIES = ['All', ...[...new Set(journeyData.map((item) => item.category))].sort()]
const COUNTS = Object.fromEntries(CATEGORIES.map((c) => [
    c, c === 'All' ? journeyData.length : journeyData.filter((item) => item.category === c).length,
]))

function links(item) {
    const out = []
    if (realUrl(item.projectUrl)) out.push({ label: 'Live demo', href: item.projectUrl })
    if (realUrl(item.githubUrl)) out.push({ label: 'Source', href: item.githubUrl })
    if (realUrl(item.certificateUrl) && item.certificateUrl !== item.projectUrl) {
        out.push({ label: 'Certificate', href: item.certificateUrl })
    }
    return out
}

function Entry({ item }) {
    const extra = links(item)
    const images = [...new Set([item.coverImage, ...(item.images || [])].filter(Boolean))]
    return (
        <li id={`journey-${item.id}`} className="jr-entry">
            <p className="pg-row__label jr-entry__date">{item.dateLabel}</p>
            <details className="jr-entry__body">
                <summary className="jr-entry__summary">
                    <span className="jr-entry__title">{item.title}</span>
                    <span className="pg-row__meta jr-entry__meta">
                        {isNow(item) ? <span className="pg-now jr-entry__now"><span className="pg-dot" aria-hidden="true" />Now</span> : null}
                        <span>{item.organization}</span>
                        <span>{item.category}</span>
                    </span>
                    <span className="pg-toggle" aria-hidden="true" />
                </summary>
                <div className="jr-entry__detail">
                    <dl className="jr-facts">
                        {item.location ? <><dt>Where</dt><dd>{item.location}</dd></> : null}
                        {item.duration ? <><dt>Length</dt><dd>{item.duration}</dd></> : null}
                        {item.mode ? <><dt>Mode</dt><dd>{item.mode}</dd></> : null}
                    </dl>
                    {item.description ? <p className="jr-text">{item.description}</p> : null}
                    {item.whatILearned?.length ? (
                        <>
                            <h4 className="pg-row__label jr-sub">{item.category === 'Education' ? 'Areas of study' : 'What I learned'}</h4>
                            <ul className="jr-list">
                                {item.whatILearned.map((point) => <li key={point}>{point}</li>)}
                            </ul>
                        </>
                    ) : null}
                    {item.skills?.length ? (
                        <p className="jr-skills"><span className="pg-row__label">Skills</span> {item.skills.join(', ')}</p>
                    ) : null}
                    {images.length ? (
                        <ul className="jr-images" aria-label={`Photos from ${item.title}`}>
                            {images.map((src, i) => (
                                <li key={src}>
                                    <a href={src} target="_blank" rel="noopener noreferrer">
                                        <img src={src} alt={`${item.title}, photo ${i + 1} of ${images.length}`} loading="lazy" decoding="async" width="160" height="120" />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    ) : null}
                    {extra.length || item.relatedBlogSlug ? (
                        <p className="jr-links">
                            {extra.map((l) => (
                                <TextLink key={l.label} href={l.href} external>{l.label}<span className="sr-only">: {item.title}</span></TextLink>
                            ))}
                            {item.relatedBlogSlug ? (
                                <TextLink to={`/blog/${item.relatedBlogSlug}`}>Read the post<span className="sr-only">: {item.title}</span></TextLink>
                            ) : null}
                        </p>
                    ) : null}
                </div>
            </details>
        </li>
    )
}

Entry.propTypes = {
    item: PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        organization: PropTypes.string,
        date: PropTypes.string.isRequired,
        dateLabel: PropTypes.string,
        location: PropTypes.string,
        duration: PropTypes.string,
        mode: PropTypes.string,
        category: PropTypes.string,
        status: PropTypes.string,
        description: PropTypes.string,
        whatILearned: PropTypes.arrayOf(PropTypes.string),
        skills: PropTypes.arrayOf(PropTypes.string),
        coverImage: PropTypes.string,
        images: PropTypes.arrayOf(PropTypes.string),
        projectUrl: PropTypes.string,
        githubUrl: PropTypes.string,
        certificateUrl: PropTypes.string,
        relatedBlogSlug: PropTypes.string,
    }).isRequired,
}

function Journey() {
    useSEO({
        title: 'Professional Journey | Gaurav Kumar Yadav | AI/ML & Web Developer',
        description: 'Explore my internships, workshops, hackathons, conferences, certifications, industrial visits, and technical experiences throughout my journey as an AI/ML Developer and Web Developer.',
        keywords: 'Gaurav Kumar Yadav journey, AI ML learning timeline, web developer experiences Lucknow, certifications Gaurav Kumar, workshops hackathons Lucknow',
        ogImage: 'https://ggauravky.vercel.app/images/profile.jpg',
    })

    const [params, setParams] = useSearchParams()
    const raw = params.get('category')
    const category = CATEGORIES.includes(raw) ? raw : 'All'
    const groupName = useId()

    const years = useMemo(() => {
        const shown = category === 'All' ? NEWEST_FIRST : NEWEST_FIRST.filter((item) => item.category === category)
        const map = new Map()
        for (const item of shown) {
            const y = yearOf(item)
            if (!map.has(y)) map.set(y, [])
            map.get(y).push(item)
        }
        return [...map.entries()]
    }, [category])

    const shownCount = years.reduce((n, [, items]) => n + items.length, 0)

    const setCategory = (next) => {
        const p = new URLSearchParams(params)
        if (next === 'All') p.delete('category')
        else p.set('category', next)
        setParams(p, { replace: true })
    }

    // Deep link: /journey#<id> (or #journey-<id>) opens and scrolls to the entry.
    useEffect(() => {
        const open = () => {
            const id = decodeURIComponent(window.location.hash.slice(1)).replace(/^journey-/, '')
            if (!id) return
            const el = document.getElementById(`journey-${id}`)
            if (!el) {
                // Hidden by the category filter: clear it, then try again after render.
                if (journeyData.some((item) => item.id === id) && new URLSearchParams(window.location.search).has('category')) {
                    setParams(new URLSearchParams(), { replace: true })
                    requestAnimationFrame(() => requestAnimationFrame(open))
                }
                return
            }
            const details = el.querySelector('details')
            if (details) details.open = true
            el.scrollIntoView({ block: 'start' })
        }
        open()
        window.addEventListener('hashchange', open)
        return () => window.removeEventListener('hashchange', open)
    }, [setParams])

    return (
        <main className="pg journey">
            <PageHead head={HEAD} />

            <section className="jr-filter page-wrap page-grid" aria-label="Filter the journey">
                <p className="page-rail" aria-hidden="true">Filter</p>
                <div className="page-main">
                    <fieldset className="pj-seg">
                        <legend className="pj-seg__legend">Category</legend>
                        <div className="pj-seg__options">
                            {CATEGORIES.map((c) => (
                                <label key={c} className="pj-seg__option">
                                    <input
                                        type="radio"
                                        name={groupName}
                                        value={c}
                                        checked={category === c}
                                        onChange={() => setCategory(c)}
                                        className="pj-seg__input"
                                    />
                                    <span className="pj-seg__text">{c} <span className="pj-seg__count">{COUNTS[c]}</span></span>
                                </label>
                            ))}
                        </div>
                    </fieldset>
                    <p className="jr-count" role="status">{shownCount} of {journeyData.length} entries</p>
                </div>
            </section>

            {years.map(([year, items]) => (
                <section key={year} className="pg-section jr-year" aria-labelledby={`year-${year}`}>
                    <Reveal className="page-wrap page-grid">
                        <p className="page-rail" aria-hidden="true">{items.length} {items.length === 1 ? 'entry' : 'entries'}</p>
                        <div className="page-main">
                            <h2 id={`year-${year}`} className="pg-h2">
                                <span className="line-mask"><span className="line-mask__line">{year}</span></span>
                            </h2>
                            <ol className="pg-rows">
                                {items.map((item) => <Entry key={item.id} item={item} />)}
                            </ol>
                        </div>
                    </Reveal>
                </section>
            ))}
        </main>
    )
}

export default Journey

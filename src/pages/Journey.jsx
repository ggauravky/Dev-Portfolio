// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

// Journey (P5, redesigned in feat/journey-redesign). An archive, newest first,
// grouped by year, on a vertical spine: one node per entry at its date, the
// spine filling with the accent down to the reading position, and a small
// sticky year label. Each row is a real disclosure button (aria-expanded); the
// panel is `hidden="until-found"` so find-in-page still reaches closed entries.
// A category filter is a native radio group whose state lives in the URL
// (?category=). Deep links `/journey#<id>` still open and scroll to their entry.
// "Now" (the accent's job) = entries whose status is "In Progress".
// Motion moments: (1) the cursor-following preview (shared with Projects,
// fine pointers only), (2) the scroll-linked spine fill, (3) line-masked year
// headings.

import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PropTypes from 'prop-types'
import useSEO from '../hooks/useSEO'
import PageHead from '../components/page/PageHead'
import { journeyHead } from '../lib/pageHeads'
import { useFinePointer, useReducedMotion } from '../lib/motion'
import { previewSrc } from '../lib/projects'
import Reveal from '../components/Reveal'
import HoverPreview, { preloadPreviewImages } from '../components/ui/HoverPreview'
import { TextLink } from '../components/ui'
import { journeyData } from '../data/journeyData'
import './Journey.css'

// The year from the ISO string itself, so it can't shift with the time zone.
const yearOf = (item) => Number(item.date.slice(0, 4))
const isNow = (item) => item.status === 'In Progress'
// A bare domain is a placeholder in the data, not a real link.
const realUrl = (url) => typeof url === 'string' && /^(https?:\/\/[^/]+\/.+|\/)/.test(url)

const photosOf = (item) => [...new Set([item.coverImage, ...(item.images || [])].filter(Boolean))]
/** The preview for a row: its first photo (480px variant), else a tile with the category. */
const previewOf = (item) => {
    const first = photosOf(item)[0]
    return { key: item.id, src: first ? previewSrc(first) : null, label: item.category }
}
// A missing variant falls back to the original once.
// Browsers without `hidden="until-found"` get plain `hidden`.
const UNTIL_FOUND = typeof document !== 'undefined' && 'onbeforematch' in document.documentElement
const onThumbError = (event) => {
    const img = event.currentTarget
    const original = img.dataset.original
    if (original && img.getAttribute('src') !== original) img.src = original
}

const HEAD = journeyHead(journeyData)
const NEWEST_FIRST = [...journeyData].sort((a, b) => (a.date < b.date ? 1 : -1))

const CATEGORIES = ['All', ...[...new Set(journeyData.map((item) => item.category))].sort()]
const COUNTS = Object.fromEntries(CATEGORIES.map((c) => [
    c, c === 'All' ? journeyData.length : journeyData.filter((item) => item.category === c).length,
]))

// Where the spine's fill ends: this far down the viewport.
const FILL_ANCHOR = 0.5
// The sticky year switches when a year heading passes under the top chrome.
const YEAR_LINE = 72

function links(item) {
    const out = []
    if (realUrl(item.projectUrl)) out.push({ label: 'Live demo', href: item.projectUrl })
    if (realUrl(item.githubUrl)) out.push({ label: 'Source', href: item.githubUrl })
    if (realUrl(item.certificateUrl) && item.certificateUrl !== item.projectUrl) {
        out.push({ label: 'Certificate', href: item.certificateUrl })
    }
    return out
}

function Entry({ item, open, onToggle, preview }) {
    const extra = links(item)
    const images = photosOf(item)
    const panelId = `journey-panel-${item.id}`
    const panelRef = useRef(null)
    const titleRef = useRef(null)

    // Closed panels are hidden="until-found": find-in-page can still match
    // them, and the browser fires `beforematch` so the entry opens itself.
    useLayoutEffect(() => {
        const panel = panelRef.current
        if (open) panel.removeAttribute('hidden')
        else panel.setAttribute('hidden', UNTIL_FOUND ? 'until-found' : '')
    }, [open])

    useEffect(() => {
        const panel = panelRef.current
        const onMatch = () => onToggle(item.id, true)
        panel.addEventListener('beforematch', onMatch)
        return () => panel.removeEventListener('beforematch', onMatch)
    }, [item.id, onToggle])

    const handlers = preview ? {
        onPointerEnter: (event) => preview.enter(event, item),
        onFocus: (event) => preview.focus(event, item, titleRef.current),
        onBlur: preview.blur,
    } : {}

    return (
        <li id={`journey-${item.id}`} className="jr-entry" data-now={isNow(item) ? 'true' : undefined}>
            <span className="jr-node" aria-hidden="true">
                {isNow(item) ? <span className="pg-dot" /> : null}
            </span>
            <p className="pg-row__label jr-entry__date">{item.dateLabel}</p>
            <div className="jr-entry__body">
                <h3 className="jr-entry__heading">
                    <button
                        type="button"
                        className="jr-entry__toggle"
                        aria-expanded={open}
                        aria-controls={panelId}
                        onClick={() => onToggle(item.id)}
                        {...handlers}
                    >
                        <span ref={titleRef} className="jr-entry__title">{item.title}</span>
                        <span className="pg-row__meta jr-entry__meta">
                            {isNow(item) ? <span className="pg-now jr-entry__now">Now</span> : null}
                            <span>{item.organization}</span>
                            <span>{item.category}</span>
                        </span>
                        <span className="pg-toggle" aria-hidden="true" />
                    </button>
                </h3>
                <div
                    ref={panelRef}
                    id={panelId}
                    className="jr-entry__detail"
                    onPointerEnter={preview ? preview.leave : undefined}
                >
                    <div className="jr-entry__panel">
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
                                            <img
                                                src={previewSrc(src)}
                                                data-original={src}
                                                onError={onThumbError}
                                                alt={`${item.title}, photo ${i + 1} of ${images.length}`}
                                                loading="lazy"
                                                decoding="async"
                                                width="192"
                                                height="120"
                                            />
                                            <span className="sr-only"> (opens full size in a new tab)</span>
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
                </div>
            </div>
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
    open: PropTypes.bool.isRequired,
    onToggle: PropTypes.func.isRequired,
    preview: PropTypes.shape({
        enter: PropTypes.func,
        focus: PropTypes.func,
        blur: PropTypes.func,
        leave: PropTypes.func,
    }),
}

/** An element's top within a positioned ancestor, from layout offsets. */
function offsetWithin(el, ancestor) {
    let y = 0
    for (let node = el; node && node !== ancestor; node = node.offsetParent) y += node.offsetTop
    return y
}

/**
 * The spine: measured (layout reads) only when the list resizes; on scroll it
 * reads `scrollY` and writes one `transform: scaleY()` per frame.
 */
function useSpine(timelineRef, spineRef, fillRef, deps) {
    useEffect(() => {
        const timeline = timelineRef.current
        const spine = spineRef.current
        const fill = fillRef.current
        if (!timeline || !spine || !fill) return undefined
        let top = 0
        let height = 0
        let anchor = 0
        let frame = 0

        const paint = () => {
            frame = 0
            const p = height > 0 ? (window.scrollY + anchor - top) / height : 0
            fill.style.transform = `scaleY(${Math.min(1, Math.max(0, p))})`
        }
        const measure = () => {
            const nodes = timeline.querySelectorAll('.jr-node')
            if (!nodes.length) {
                spine.style.height = '0px'
                height = 0
                paint()
                return
            }
            // Layout offsets, not client rects: a reveal's transform must not skew them.
            const centre = (node) => offsetWithin(node, timeline) + node.offsetHeight / 2
            const y0 = centre(nodes[0])
            height = Math.max(0, centre(nodes[nodes.length - 1]) - y0)
            spine.style.top = `${y0}px`
            spine.style.height = `${height}px`
            top = timeline.getBoundingClientRect().top + window.scrollY + y0
            anchor = window.innerHeight * FILL_ANCHOR
            paint()
        }
        const onScroll = () => { if (!frame) frame = requestAnimationFrame(paint) }

        measure()
        const ro = new ResizeObserver(measure)
        ro.observe(timeline)
        window.addEventListener('resize', measure)
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => {
            ro.disconnect()
            cancelAnimationFrame(frame)
            window.removeEventListener('resize', measure)
            window.removeEventListener('scroll', onScroll)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps)
}

/** The year whose group is under the top chrome, from an IntersectionObserver on the year headings. */
function useStickyYear(timelineRef, deps) {
    const [year, setYear] = useState(null)
    useEffect(() => {
        const timeline = timelineRef.current
        if (!timeline || typeof IntersectionObserver === 'undefined') return undefined
        const passed = new Set()
        const io = new IntersectionObserver((entries) => {
            // The root reaches far below the viewport, so "not intersecting"
            // means exactly "above the year line", and a long jump in either
            // direction still flips the state (and fires).
            for (const entry of entries) {
                const y = Number(entry.target.dataset.year)
                if (entry.isIntersecting) passed.delete(y)
                else passed.add(y)
            }
            // Newest first, so the last heading scrolled past is the smallest year.
            setYear(passed.size ? Math.min(...passed) : null)
        }, { rootMargin: `-${YEAR_LINE}px 0px 100000px 0px` })
        timeline.querySelectorAll('[data-year]').forEach((el) => io.observe(el))
        return () => io.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps)
    return year
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
    const [openIds, setOpenIds] = useState(() => new Set())

    const finePointer = useFinePointer()
    const reducedMotion = useReducedMotion()
    const previewRef = useRef(null)
    const timelineRef = useRef(null)
    const spineRef = useRef(null)
    const fillRef = useRef(null)

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
        setParams(p, { replace: true, preventScrollReset: true })
    }

    const onToggle = useCallback((id, force) => {
        setOpenIds((prev) => {
            const next = new Set(prev)
            const open = force ?? !next.has(id)
            if (open) next.add(id)
            else next.delete(id)
            return next
        })
    }, [])

    useSpine(timelineRef, spineRef, fillRef, [category])
    const stickyYear = useStickyYear(timelineRef, [category])

    // ── Hover / focus preview (fine pointers only) ──
    useEffect(() => { previewRef.current?.hide() }, [category])

    // Warm the first few preview images once the page is idle.
    useEffect(() => {
        if (!finePointer) return undefined
        const run = () => preloadPreviewImages(NEWEST_FIRST.map((item) => previewOf(item).src))
        if ('requestIdleCallback' in window) {
            const id = window.requestIdleCallback(run, { timeout: 2000 })
            return () => window.cancelIdleCallback(id)
        }
        const id = window.setTimeout(run, 1200)
        return () => window.clearTimeout(id)
    }, [finePointer])

    const preview = useMemo(() => (finePointer ? {
        enter(event, item) {
            if (event.pointerType === 'mouse') previewRef.current?.show(previewOf(item), event.clientX, event.clientY)
        },
        focus(event, item, titleEl) {
            if (event.currentTarget.matches(':focus-visible') && titleEl) previewRef.current?.showBeside(previewOf(item), titleEl)
        },
        blur() { previewRef.current?.hide() },
        leave() { previewRef.current?.hide() },
    } : null), [finePointer])

    const onListMove = useCallback((event) => {
        if (event.pointerType === 'mouse') previewRef.current?.move(event.clientX, event.clientY)
    }, [])
    const onListLeave = useCallback(() => previewRef.current?.hide(), [])
    const listProps = finePointer ? { onPointerMove: onListMove, onPointerLeave: onListLeave } : {}

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
            onToggle(id, true)
            requestAnimationFrame(() => el.scrollIntoView({ block: 'start' }))
        }
        open()
        window.addEventListener('hashchange', open)
        return () => window.removeEventListener('hashchange', open)
    }, [setParams, onToggle])

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

            <div ref={timelineRef} className="jr-timeline" data-reduced={reducedMotion ? 'true' : undefined}>
                {/* Decorative layer on the same grid: the spine and the sticky year. */}
                <div className="jr-spine-layer page-wrap page-grid" aria-hidden="true">
                    <div className="page-main jr-spine-col">
                        <span ref={spineRef} className="jr-spine">
                            <span ref={fillRef} className="jr-spine__fill" />
                        </span>
                        <p className="jr-year-label" data-shown={stickyYear ? 'true' : 'false'}>{stickyYear ?? ''}</p>
                    </div>
                </div>

                {years.map(([year, items]) => (
                    <section key={year} className="pg-section jr-year" aria-labelledby={`year-${year}`}>
                        <Reveal className="page-wrap page-grid">
                            <p className="page-rail" aria-hidden="true">{items.length} {items.length === 1 ? 'entry' : 'entries'}</p>
                            <div className="page-main">
                                <h2 id={`year-${year}`} className="pg-h2 jr-year__title" data-year={year}>
                                    <span className="line-mask"><span className="line-mask__line">{year}</span></span>
                                </h2>
                                <ol className="pg-rows jr-rows" {...listProps}>
                                    {items.map((item) => (
                                        <Entry key={item.id} item={item} open={openIds.has(item.id)} onToggle={onToggle} preview={preview} />
                                    ))}
                                </ol>
                            </div>
                        </Reveal>
                    </section>
                ))}
            </div>

            {finePointer ? <HoverPreview ref={previewRef} crossfade snap={reducedMotion} /> : null}
        </main>
    )
}

export default Journey

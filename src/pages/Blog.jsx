// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

// Blog index (P5). The writing archive as a hairline list on the margin-rail
// grid: date in the label column, serif title, excerpt, category and reading
// time. Category and search live in the URL (?category=&q=). Data only through
// the blogsData selectors. The newsletter form posts to the existing
// /api/newsletter/subscribe endpoint.
// Motion moments: (1) line-masked section headings.

import { useId, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import useSEO from '../hooks/useSEO'
import { staticSeo } from '../lib/seo'
import PageHead from '../components/page/PageHead'
import { STATIC_HEADS } from '../lib/pageHeads'
import PageSection from '../components/page/PageSection'
import { Button, Input } from '../components/ui'
import { categories, getPublishedBlogArchive } from '../data/blogsData'
import { validateEmail } from '../lib/validate'
import './Blog.css'

const SEO = staticSeo('/blog')

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '')

function Newsletter() {
    const [email, setEmail] = useState('')
    const [state, setState] = useState({ status: 'idle', message: '' })

    const submit = async (event) => {
        event.preventDefault()
        const error = validateEmail(email)
        if (error) {
            setState({ status: 'error', message: error })
            return
        }
        setState({ status: 'loading', message: '' })
        try {
            const response = await fetch(`${API_URL}/api/newsletter/subscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim() }),
            })
            const data = await response.json().catch(() => ({}))
            if (!response.ok) throw new Error(data.message || 'Couldn’t subscribe. Please try again.')
            setState({ status: 'done', message: data.message || 'You’re subscribed.' })
            setEmail('')
        } catch (err) {
            setState({ status: 'error', message: err.message || 'Network error. Please try again.' })
        }
    }

    if (state.status === 'done') {
        return <p className="bl-news__done" role="status">{state.message}</p>
    }

    return (
        <form className="bl-news" onSubmit={submit} noValidate>
            <Input
                type="email"
                label="Email"
                autoComplete="email"
                spellCheck={false}
                value={email}
                onChange={(event) => {
                    setEmail(event.target.value)
                    if (state.status === 'error') setState({ status: 'idle', message: '' })
                }}
                validate={validateEmail}
                error={state.status === 'error' ? state.message : undefined}
                className="bl-news__field"
                required
            />
            <Button type="submit" loading={state.status === 'loading'}>Subscribe</Button>
        </form>
    )
}

function Blog() {
    const [params, setParams] = useSearchParams()
    const rawCategory = params.get('category')
    const category = categories.includes(rawCategory) ? rawCategory : 'All'
    const query = params.get('q') || ''
    const groupName = useId()

    const publishedBlogs = useMemo(() => getPublishedBlogArchive(), [])
    const counts = useMemo(() => Object.fromEntries(categories.map((c) => [
        c, c === 'All' ? publishedBlogs.length : publishedBlogs.filter((b) => b.category === c).length,
    ])), [publishedBlogs])

    useSEO({
        ...SEO,
        additionalJsonLd: {
            '@type': 'ItemList',
            name: 'Engineering Notes',
            itemListElement: publishedBlogs.map((blog, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                url: `https://ggauravky.vercel.app/blog/${blog.slug}`,
                name: blog.title,
            })),
        },
    })

    const filtered = useMemo(() => getPublishedBlogArchive({ category, query }), [category, query])

    const update = (key, value, empty) => {
        const p = new URLSearchParams(params)
        if (!value || value === empty) p.delete(key)
        else p.set(key, value)
        setParams(p, { replace: true })
    }

    return (
        <main className="pg blog">
            <PageHead head={STATIC_HEADS['/blog']} />

            <section className="bl-controls page-wrap page-grid" aria-label="Browse engineering notes">
                <p className="page-rail" aria-hidden="true">Filter</p>
                <div className="page-main">
                    <fieldset className="pj-seg">
                        <legend className="pj-seg__legend">Category</legend>
                        <div className="pj-seg__options">
                            {categories.map((c) => (
                                <label key={c} className="pj-seg__option">
                                    <input
                                        type="radio"
                                        name={groupName}
                                        value={c}
                                        checked={category === c}
                                        onChange={() => update('category', c, 'All')}
                                    />
                                    <span>{c} <span className="pj-seg__count">{counts[c]}</span></span>
                                </label>
                            ))}
                        </div>
                    </fieldset>
                    <Input
                        type="search"
                        label="Search notes"
                        value={query}
                        onChange={(event) => update('q', event.target.value, '')}
                        className="bl-search"
                    />
                    <p className="jr-count" role="status">
                        {filtered.length} {filtered.length === 1 ? 'note' : 'notes'}
                    </p>
                </div>
            </section>

            <PageSection id="archive" index={1} title="Archive">
                {filtered.length ? (
                    <ol className="pg-rows">
                        {filtered.map((article) => (
                            <li key={article.id} className="pg-row bl-row">
                                <p className="pg-row__label">
                                    <time dateTime={article.publishedDate}>{article.date}</time>
                                </p>
                                <div className="pg-row__body">
                                    <h3 className="pg-row__title">
                                        <Link to={`/blog/${article.slug}`} className="bl-row__link">{article.title}</Link>
                                    </h3>
                                    {article.excerpt ? <p className="bl-row__excerpt">{article.excerpt}</p> : null}
                                    <p className="pg-row__meta">{article.category} · {article.readTime}</p>
                                </div>
                            </li>
                        ))}
                    </ol>
                ) : (
                    <div className="bl-empty">
                        <p>No notes match that search.</p>
                        <Button variant="secondary" onClick={() => setParams(new URLSearchParams(), { replace: true })}>Clear filters</Button>
                    </div>
                )}
            </PageSection>

            <PageSection id="newsletter" index={2} title="New notes by email" intro="An email when a new technical article is published. Nothing else.">
                <Newsletter />
            </PageSection>
        </main>
    )
}

export default Blog

// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

// Article (P5). The Monograph reading page: the margin rail carries the facts
// and, on desktop, a sticky table of contents; the text column is 62ch. A
// static header shell is painted before JS for published/preview posts
// (scripts/route-shells.js, `articleHeader`); keep the two in step.
// Motion moments: (1) the scroll-linked reading-progress line,
// (2) the TOC's current-section marker, (3) the site's section reveal
// (D-095; no line mask on article h2s). The h1 paints statically.

import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useRef, useState } from 'react'
import useSEO from '../hooks/useSEO'
import { NOT_FOUND_SEO, blogSeo } from '../lib/seo'
import { getBlogBySlug, getRelatedBlogs } from '../data/blogsData'
import SupportButton from '../components/support/SupportButton'
import LazyImage from '../components/LazyImage'
import ArticleContent from '../components/blog/ArticleContent'
import EditorialImage from '../components/blog/EditorialImage'
import ArticleShare from '../components/blog/ArticleShare'
import ArticleTOC from '../components/blog/ArticleTOC'
import StructuredArticleContent from '../components/blog/StructuredArticleContent'
import ReadingProgress from '../components/blog/ReadingProgress'
import { Button, TextLink } from '../components/ui'
import { siteStatus } from '../data/siteStatus'
import './BlogPost.css'

function BlogPost() {
    const { slug } = useParams()
    const navigate = useNavigate()
    const blog = useMemo(() => getBlogBySlug(slug), [slug])
    const [headings, setHeadings] = useState([])
    const bodyRef = useRef(null)

    useEffect(() => {
        if (blog) return undefined
        const timer = window.setTimeout(() => navigate('/blog', { replace: true }), 4000)
        return () => window.clearTimeout(timer)
    }, [blog, navigate])

    const seo = useMemo(() => (blog ? blogSeo(blog) : NOT_FOUND_SEO), [blog])
    useSEO(seo)

    if (!blog) {
        return (
            <main className="pg ar">
                <header className="pg-head page-wrap page-grid">
                    <p className="page-rail pg-head__rail"><span>Engineering notes</span></p>
                    <div className="page-main">
                        <h1 className="pg-h1">Article not found</h1>
                        <p className="pg-lede">That note doesn&rsquo;t exist. Taking you back to the archive.</p>
                        <div className="pg-actions"><Button to="/blog" arrow>All notes</Button></div>
                    </div>
                </header>
            </main>
        )
    }

    const relatedBlogs = getRelatedBlogs(blog)
    const showPublished = Boolean(blog.publishedDate)
    const showSupport = blog.status === 'published' || blog.status === 'archived'
    const coverImage = blog.contentType === 'structured'
        ? blog.images.find((image) => image.id === blog.coverImageId)
        : null

    return (
        <main className="pg ar">
            <ReadingProgress targetRef={bodyRef} />

            <article>
                <header className="ar-head page-wrap page-grid">
                    <p className="page-rail ar-head__rail">
                        <TextLink to="/blog" tone="muted">← Notes</TextLink>
                        <span>{blog.category}</span>
                        {showPublished ? <span>{blog.date}</span> : null}
                        {showPublished && blog.readTime ? <span>{blog.readTime}</span> : null}
                        {blog.status === 'preview' ? <span>Preview</span> : null}
                    </p>
                    <div className="page-main">
                        <h1 className="ar-title">{blog.title}</h1>
                        <p className="pg-lede">{blog.subtitle || blog.excerpt}</p>
                        <p className="ar-byline">{blog.author}</p>
                    </div>
                </header>

                <figure className="ar-cover page-wrap">
                    {coverImage ? (
                        <>
                            <EditorialImage image={coverImage} priority className="ar-cover__img" />
                            <figcaption className="ar-caption">
                                <span>{coverImage.caption}</span>
                                <span>
                                    Source: <a href={coverImage.sourceUrl} target="_blank" rel="noopener noreferrer">{coverImage.credit}</a>
                                    {coverImage.usageRights === 'unverified' ? ' · Usage rights unverified' : ''}
                                </span>
                            </figcaption>
                        </>
                    ) : (
                        <LazyImage
                            src={blog.coverImage || blog.image}
                            alt={blog.imageAlt || `${blog.title} cover`}
                            priority
                            className="ar-cover__img"
                        />
                    )}
                </figure>

                <div ref={bodyRef} className="ar-body page-wrap page-grid">
                    <div className="page-rail ar-rail">
                        <ArticleTOC headings={headings} />
                    </div>
                    <div className="page-main ar-main">
                        {blog.contentType === 'structured' ? (
                            <StructuredArticleContent article={blog} onHeadingsChange={setHeadings} />
                        ) : (
                            <ArticleContent content={blog.content} onHeadingsChange={setHeadings} />
                        )}

                        {showSupport ? (
                            <SupportButton slug={blog.slug} title={blog.title} content={blog.content} />
                        ) : null}

                        <ArticleShare title={blog.title} />

                        {relatedBlogs.length > 0 ? (
                            <section className="ar-related" aria-labelledby="related-title">
                                <h2 id="related-title" className="ar-end__h">Related</h2>
                                <ul className="pg-rows">
                                    {relatedBlogs.map((related) => (
                                        <li key={related.id} className="pg-row">
                                            <p className="pg-row__label">{related.category}</p>
                                            <p className="pg-row__body"><TextLink to={`/blog/${related.slug}`}>{related.title}</TextLink></p>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        ) : null}

                        <footer className="ar-author">
                            <h2 className="ar-end__h">Gaurav Kumar Yadav</h2>
                            <p>Full-stack developer exploring software architecture, AI, and practical engineering.</p>
                            <p className="ar-author__links">
                                <TextLink href={siteStatus.links.github} external>GitHub</TextLink>
                                <TextLink to="/about">About</TextLink>
                                <TextLink to="/blog">All notes</TextLink>
                            </p>
                        </footer>
                    </div>
                </div>
            </article>
        </main>
    )
}

export default BlogPost

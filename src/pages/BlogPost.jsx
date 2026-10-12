// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { useParams, Link, useNavigate } from 'react-router-dom'
import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import useSEO from '../hooks/useSEO'
import { getBlogBySlug, getRelatedBlogs } from '../data/blogsData'
import SupportButton from '../components/support/SupportButton'
import LazyImage from '../components/LazyImage'
import ArticleContent from '../components/blog/ArticleContent'
import EditorialImage from '../components/blog/EditorialImage'
import ArticleShare from '../components/blog/ArticleShare'
import ArticleTOC from '../components/blog/ArticleTOC'
import StructuredArticleContent from '../components/blog/StructuredArticleContent'

function BlogPost() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const blog = useMemo(() => getBlogBySlug(slug), [slug])
  const [headings, setHeadings] = useState([])
  const handleHeadingsChange = useCallback((nextHeadings) => setHeadings(nextHeadings), [])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })

    if (blog) return undefined

    toast.error('Blog post not found. Redirecting...')
    const timer = window.setTimeout(() => navigate('/blog', { replace: true }), 2000)
    return () => window.clearTimeout(timer)
  }, [blog, navigate, slug])

  useSEO({
    title: blog ? `${blog.title} | Engineering Notes` : 'Article not found | Engineering Notes',
    description: blog?.excerpt || 'Engineering notes by Gaurav Kumar Yadav.',
    keywords: blog ? [...(blog.tags || []), blog.category, 'Engineering Notes'].join(', ') : '',
    ogImage: blog?.ogImage || 'https://ggauravky.vercel.app/images/profile.jpg',
    type: blog ? 'article' : 'website',
    author: blog?.author || 'Gaurav Kumar Yadav',
    publishedTime: blog?.publishedDate || undefined,
    modifiedTime: blog?.updatedDate || undefined,
    tags: blog?.tags || [],
    noindex: !blog || blog.status === 'preview',
  })

  if (!blog) {
    return (
      <main className="article-page article-not-found">
        <div>
          <p className="article-eyebrow">Engineering Notes</p>
          <h1>Article not found.</h1>
          <p>The note you requested does not exist. Returning to the writing archive.</p>
          <Link to="/blog">Back to writing</Link>
        </div>
      </main>
    )
  }

  const relatedBlogs = getRelatedBlogs(blog)
  const showPublishedMetadata = Boolean(blog.publishedDate)
  const showSupport = blog.status === 'published' || blog.status === 'archived'
  const coverImage = blog.contentType === 'structured'
    ? blog.images.find((image) => image.id === blog.coverImageId)
    : null

  return (
    <main className="article-page">
      <article className="article-shell">
        <nav className="article-breadcrumbs" aria-label="Breadcrumb">
          <ol>
            <li><Link to="/">Home</Link></li>
            <li aria-hidden="true" className="article-breadcrumb-separator">/</li>
            <li><Link to="/blog">Blog</Link></li>
            <li aria-hidden="true" className="article-breadcrumb-separator">/</li>
            <li className="article-breadcrumb-current" aria-current="page">{blog.category}</li>
          </ol>
        </nav>

        <header className="article-header">
          <div className="article-meta">
            <span>{blog.category}</span>
            {blog.status === 'preview' ? <strong>Preview</strong> : null}
          </div>
          <h1>{blog.title}</h1>
          <p className="article-excerpt">{blog.subtitle || blog.excerpt}</p>
          <div className="article-byline">
            <span>{blog.author}</span>
            {showPublishedMetadata ? <span>{blog.date}</span> : null}
            {showPublishedMetadata && blog.readTime ? <span>{blog.readTime}</span> : null}
          </div>

          <figure className="article-cover">
            {coverImage ? (
              <>
                <EditorialImage image={coverImage} priority className="article-cover-image" />
                <figcaption>
                  <span>{coverImage.caption}</span>
                  <span className="article-image-credit">
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
                className="article-cover-image"
              />
            )}
          </figure>
        </header>

        <div className="article-layout">
          <div className="article-main">
            {blog.contentType === 'structured' ? (
              <StructuredArticleContent article={blog} onHeadingsChange={handleHeadingsChange} />
            ) : (
              <ArticleContent content={blog.content} onHeadingsChange={handleHeadingsChange} />
            )}

            {showSupport ? (
              <div className="article-support">
                <SupportButton slug={blog.slug} title={blog.title} content={blog.content} />
              </div>
            ) : null}

            <ArticleShare title={blog.title} />

            {relatedBlogs.length > 0 ? (
              <section className="article-related" aria-labelledby="related-title">
                <p className="article-eyebrow">Continue reading</p>
                <h2 id="related-title">Related articles</h2>
                <div>
                  {relatedBlogs.map((related) => (
                    <Link key={related.id} to={`/blog/${related.slug}`}>
                      <span>{related.category}</span>
                      <strong>{related.title}</strong>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}

            <footer className="article-author">
              <div>
                <p className="article-eyebrow">Written by</p>
                <h2>Gaurav Kumar Yadav</h2>
                <p>Full-stack developer exploring software architecture, AI, and practical engineering.</p>
              </div>
              <nav aria-label="Author links">
                <a href="https://github.com/ggauravky" target="_blank" rel="noopener noreferrer">GitHub</a>
                <Link to="/about">About</Link>
              </nav>
            </footer>

            <Link className="article-back" to="/blog">← Back to writing</Link>
          </div>

          <ArticleTOC headings={headings} />
        </div>
      </article>
    </main>
  )
}

export default BlogPost

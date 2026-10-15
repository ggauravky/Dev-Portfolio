// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import BlogCategoryNav from '../components/blog/BlogCategoryNav'
import EditorialArticleRow from '../components/blog/EditorialArticleRow'
import useSEO from '../hooks/useSEO'
import { categories, getPublishedBlogArchive } from '../data/blogsData'

function Blog() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterLoading, setNewsletterLoading] = useState(false)

  const publishedBlogs = useMemo(() => getPublishedBlogArchive(), [])

  useSEO({
    title: 'Engineering Notes | Gaurav Kumar Yadav',
    description: 'System design, software engineering, and practical notes on building web applications and AI-powered products.',
    keywords: 'engineering notes, system design, software engineering, full stack development, AI engineering, Gaurav Kumar Yadav',
    ogImage: 'https://ggauravky.vercel.app/images/blogs/cover.webp',
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

  const filteredBlogs = useMemo(() => getPublishedBlogArchive({
    category: selectedCategory,
    query: searchQuery,
  }), [searchQuery, selectedCategory])

  const handleCategorySelect = (category) => {
    setSelectedCategory(category)
    document.querySelector('.blog-index-toolbar')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }

  const handleNewsletterSubscribe = async (event) => {
    event.preventDefault()
    const email = newsletterEmail.trim()
    if (!email) return

    setNewsletterLoading(true)
    const loadingToast = toast.loading('Subscribing...')

    try {
      const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '')
      const response = await fetch(`${apiUrl}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await response.json()

      if (!response.ok) throw new Error(data.message || 'Failed to subscribe. Please try again.')

      toast.success(data.message || 'You are subscribed.', { id: loadingToast, duration: 5000 })
      setNewsletterEmail('')
    } catch (error) {
      toast.error(error.message || 'Network error. Please try again.', { id: loadingToast, duration: 5000 })
    } finally {
      setNewsletterLoading(false)
    }
  }

  return (
    <main className="blog-page blog-index">
      <div className="blog-shell">
        <header className="blog-index-masthead">
          <div className="blog-index-heading">
            <p className="blog-kicker">Gaurav / Writing</p>
            <h1>Engineering Notes.</h1>
          </div>
          <div className="blog-index-intro">
            <p className="blog-index-marker">Engineering / Journal</p>
            <p>System design, software engineering, and the things I&apos;ve built.</p>
          </div>
        </header>

        <section className="blog-index-toolbar" aria-label="Browse engineering notes">
          <BlogCategoryNav
            categories={categories}
            selectedCategory={selectedCategory}
            onSelect={handleCategorySelect}
          />

          <label className="blog-search">
            <span className="sr-only">Search engineering notes</span>
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="6.5" />
              <path d="m16 16 4 4" />
            </svg>
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search notes..."
            />
          </label>
        </section>

        <section className="blog-archive" aria-labelledby="writing-archive-title">
          <div className="blog-archive-heading">
            <div>
              <p className="blog-kicker">Latest first</p>
              <h2 id="writing-archive-title">The writing archive</h2>
            </div>
            <p className="blog-archive-count" aria-live="polite">
              {String(filteredBlogs.length).padStart(2, '0')} {filteredBlogs.length === 1 ? 'note' : 'notes'}
            </p>
          </div>

          {filteredBlogs.length > 0 ? (
            <div className="blog-article-list">
              {filteredBlogs.map((article, index) => (
                <EditorialArticleRow key={article.id} article={article} index={index} />
              ))}
            </div>
          ) : (
            <div className="blog-empty" role="status">
              <p>No notes match your search.</p>
              <button type="button" onClick={() => { setSelectedCategory('All'); setSearchQuery('') }}>
                Reset archive
              </button>
            </div>
          )}
        </section>

        <section className="blog-newsletter" aria-labelledby="newsletter-title">
          <div className="blog-newsletter-copy">
            <p className="blog-kicker">Occasional updates</p>
            <h2 id="newsletter-title">Notes from the engineering desk.</h2>
            <p>Occasional updates when a new technical article is published.</p>
          </div>
          <form onSubmit={handleNewsletterSubscribe}>
            <label htmlFor="newsletter-email" className="sr-only">Email address</label>
            <input
              id="newsletter-email"
              type="email"
              value={newsletterEmail}
              onChange={(event) => setNewsletterEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
            <button type="submit" disabled={newsletterLoading}>
              {newsletterLoading ? 'Subscribing…' : 'Subscribe'}
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}

export default Blog

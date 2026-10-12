// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import BlogCategoryNav from '../components/blog/BlogCategoryNav'
import FeaturedArticle from '../components/blog/FeaturedArticle'
import TopicExplorer from '../components/blog/TopicExplorer'
import useSEO from '../hooks/useSEO'
import { categories, getBlogsByCategory, getPublicBlogs } from '../data/blogsData'

const normalize = (value) => String(value || '').trim().toLowerCase()

function Blog() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterLoading, setNewsletterLoading] = useState(false)

  const publicBlogs = useMemo(() => getPublicBlogs(), [])

  useSEO({
    title: 'Engineering Notes | Gaurav Kumar Yadav',
    description: 'System design, software engineering, and practical notes on building web applications and AI-powered products.',
    keywords: 'engineering notes, system design, software engineering, full stack development, AI engineering, Gaurav Kumar Yadav',
    ogImage: 'https://ggauravky.vercel.app/images/blogs/cover.webp',
    additionalJsonLd: {
      '@type': 'ItemList',
      name: 'Engineering Notes',
      itemListElement: publicBlogs.map((blog, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `https://ggauravky.vercel.app/blog/${blog.slug}`,
        name: blog.title,
      })),
    },
  })

  const filteredBlogs = useMemo(() => {
    const query = normalize(searchQuery)
    return getBlogsByCategory(selectedCategory).filter((blog) => {
      if (!query) return true
      return [blog.title, blog.excerpt, blog.category, ...(blog.tags || [])]
        .some((value) => normalize(value).includes(query))
    })
  }, [searchQuery, selectedCategory])

  const featuredArticle = filteredBlogs.find((blog) => blog.featured) || filteredBlogs[0] || null
  const publishedArticles = filteredBlogs
    .filter((blog) => blog.status === 'published')
    .sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime())

  const handleCategorySelect = (category) => {
    setSelectedCategory(category)
    document.querySelector('.blog-category-nav')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
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
    <main className="blog-page">
      <div className="blog-shell">
        <header className="blog-hero">
          <p className="blog-kicker">Gaurav / Writing</p>
          <h1>Engineering Notes.</h1>
          <p className="blog-hero-lede">System design, software engineering, and the things I&apos;ve built.</p>
          <p className="blog-hero-note">Exploring how software works, scales, and gets built.</p>

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
              placeholder="Search notes by title, topic, or tag"
            />
          </label>
        </header>

        <section className="blog-featured-section" aria-labelledby="featured-writing-title">
          <div className="blog-section-heading">
            <p className="blog-kicker">Selected note</p>
            <h2 id="featured-writing-title">Featured article</h2>
          </div>

          {featuredArticle ? (
            <FeaturedArticle article={featuredArticle} />
          ) : (
            <div className="blog-empty" role="status">
              <p>No notes match this topic yet.</p>
              <button type="button" onClick={() => { setSelectedCategory('All'); setSearchQuery('') }}>
                View all writing
              </button>
            </div>
          )}
        </section>

        <TopicExplorer onSelect={handleCategorySelect} />

        {publishedArticles.length > 0 ? (
          <section className="blog-latest" aria-labelledby="latest-writing-title">
            <div className="blog-section-heading">
              <p className="blog-kicker">Recently published</p>
              <h2 id="latest-writing-title">Latest writing</h2>
            </div>
            <div className="blog-article-list">
              {publishedArticles.map((article) => (
                <Link key={article.id} to={`/blog/${article.slug}`} className="blog-article-row">
                  <span>{article.category}</span>
                  <strong>{article.title}</strong>
                  <span aria-hidden="true">→</span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <section className="blog-newsletter" aria-labelledby="newsletter-title">
          <div>
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

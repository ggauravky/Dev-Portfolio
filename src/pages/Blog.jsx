// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import useSEO from '../hooks/useSEO'
import { blogsData, categories } from '../data/blogsData'
import { fetchSupportCounts } from '../services/blogSupport'
import LazyImage from '../components/LazyImage'
import './Blog.css'

const INITIAL_VISIBLE_BLOGS = 5
const BLOGS_LOAD_STEP = 3

function Blog() {
    useSEO({
        title: 'Blog | Gaurav Kumar Yadav | AI/ML Developer and Web Developer Insights',
        description: 'Read AI/ML and web development articles by Gaurav Kumar Yadav, a BCA student developer from BBDU Lucknow, India. Explore practical learning notes, project breakdowns, and developer portfolio insights.',
        keywords: 'Gaurav Kumar Yadav blog, AI ML developer Lucknow, web developer portfolio India, BCA AI ML student India, machine learning beginner projects, MERN stack developer student',
        ogImage: 'https://ggauravky.vercel.app/images/profile.jpg',
        additionalJsonLd: {
            '@type': 'ItemList',
            name: 'Gaurav Kumar Yadav Blog Articles',
            itemListElement: blogsData.map((blog, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                url: `https://ggauravky.vercel.app/blog/${blog.slug}`,
                name: blog.title
            }))
        }
    })

    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('All')
    const [sortBy, setSortBy] = useState('newest')
    const [visibleBlogsCount, setVisibleBlogsCount] = useState(INITIAL_VISIBLE_BLOGS)
    const [newsletterEmail, setNewsletterEmail] = useState('')
    const [newsletterLoading, setNewsletterLoading] = useState(false)
    const [supportCounts, setSupportCounts] = useState({})

    // Optimize: Only load blog metadata, not full content
    const blogs = useMemo(() => blogsData.map(blog => ({
        ...blog,
        // Only keep essential fields for list view
        content: undefined // Remove heavy content from list view
    })), [])

    const getReadTimeMinutes = (readTime) => {
        const match = /(\d+)/.exec(String(readTime || ''))
        return match ? Number.parseInt(match[1], 10) : 0
    }

    // Filter blogs based on search and category
    const filteredBlogs = useMemo(() => {
        const filtered = blogs.filter(blog => {
            const matchesSearch =
                (blog.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (blog.excerpt || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (blog.tags || []).some(tag => (tag || '').toLowerCase().includes(searchQuery.toLowerCase()))

            const matchesCategory = selectedCategory === 'All' || blog.category === selectedCategory

            return matchesSearch && matchesCategory
        })

        const sorted = [...filtered]

        switch (sortBy) {
            case 'oldest':
                sorted.sort((a, b) => new Date(a.publishedDate || a.date).getTime() - new Date(b.publishedDate || b.date).getTime())
                break
            case 'quick-read':
                sorted.sort((a, b) => getReadTimeMinutes(a.readTime) - getReadTimeMinutes(b.readTime))
                break
            case 'deep-dive':
                sorted.sort((a, b) => getReadTimeMinutes(b.readTime) - getReadTimeMinutes(a.readTime))
                break
            case 'featured':
                sorted.sort((a, b) => (Number(Boolean(b.featured)) - Number(Boolean(a.featured))) || (new Date(b.publishedDate || b.date).getTime() - new Date(a.publishedDate || a.date).getTime()))
                break
            case 'newest':
            default:
                sorted.sort((a, b) => new Date(b.publishedDate || b.date).getTime() - new Date(a.publishedDate || a.date).getTime())
                break
        }

        return sorted
    }, [searchQuery, selectedCategory, sortBy, blogs])

    const recommendedBlogs = useMemo(() => {
        const scoped = blogs.filter((blog) => selectedCategory === 'All' || blog.category === selectedCategory)
        return [...scoped]
            .sort((a, b) => (Number(Boolean(b.featured)) - Number(Boolean(a.featured))) || (new Date(b.publishedDate || b.date).getTime() - new Date(a.publishedDate || a.date).getTime()))
            .slice(0, 3)
    }, [blogs, selectedCategory])

    const trendingTags = useMemo(() => {
        const count = {}
        filteredBlogs.forEach((blog) => {
            ;(blog.tags || []).forEach((tag) => {
                count[tag] = (count[tag] || 0) + 1
            })
        })
        return Object.entries(count)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(([tag]) => tag)
    }, [filteredBlogs])

    const visibleBlogs = useMemo(
        () => filteredBlogs.slice(0, visibleBlogsCount),
        [filteredBlogs, visibleBlogsCount]
    )



    const remainingBlogsCount = Math.max(filteredBlogs.length - visibleBlogs.length, 0)
    const nextLoadCount = Math.min(BLOGS_LOAD_STEP, remainingBlogsCount)

    useEffect(() => {
        const loadSupportCounts = async () => {
            try {
                const data = await fetchSupportCounts(blogs.map((blog) => blog.slug))
                setSupportCounts(data.counts || {})
            } catch {
                setSupportCounts({})
            }
        }

        loadSupportCounts()
    }, [blogs])

    useEffect(() => {
        setVisibleBlogsCount(INITIAL_VISIBLE_BLOGS)
    }, [searchQuery, selectedCategory, sortBy])

    const handleLoadMoreBlogs = () => {
        setVisibleBlogsCount((previousCount) => {
            const nextCount = previousCount + BLOGS_LOAD_STEP
            return Math.min(nextCount, filteredBlogs.length)
        })
    }

    const handleNewsletterSubscribe = async (e) => {
        e.preventDefault()
        setNewsletterLoading(true)

        // Show loading toast
        const loadingToast = toast.loading('Subscribing to newsletter...')

        try {
            const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '')

            const response = await fetch(`${API_URL}/api/newsletter/subscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: newsletterEmail })
            })

            const data = await response.json()

            if (response.ok) {
                toast.success(data.message || 'Successfully subscribed! You\'ll receive updates about new blog posts.', {
                    id: loadingToast,
                    duration: 5000,
                })
                setNewsletterEmail('')
            } else {
                toast.error(data.message || 'Failed to subscribe. Please try again.', {
                    id: loadingToast,
                    duration: 5000,
                })
            }
        } catch (error) {
            console.error('Newsletter subscription error:', error)
            toast.error('Network error. Please check your connection and try again.', {
                id: loadingToast,
                duration: 5000,
            })
        } finally {
            setNewsletterLoading(false)
        }
    }

    return (
        <div className="blog-page min-h-screen bg-obsidian px-6 py-16 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute top-20 right-10 w-72 h-72 bg-toxic/5 rounded-full blur-3xl animate-float pointer-events-none"></div>
            <div className="absolute bottom-20 left-10 w-96 h-96 bg-cyber/5 rounded-full blur-3xl animate-float pointer-events-none" style={{ animationDelay: '2s' }}></div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-12 animate-fadeIn">
                    <h1 className="text-4xl md:text-6xl font-display font-black mb-6 text-slate-100 tracking-tight">
                        Blog 
                    </h1>
                    <p className="text-lg text-slate-400 max-w-3xl mx-auto">
                        AI/ML and web development insights from a BCA student at BBDU Lucknow, Uttar Pradesh, India.
                    </p>
                    <div className="mt-4">
                        <Link
                            to="/services"
                            className="inline-flex items-center gap-2 rounded-md border border-toxic/35 bg-toxic/5 px-4 py-2 text-xs font-mono uppercase tracking-wider text-toxic hover:bg-toxic hover:text-black transition-all"
                        >
                            Need help implementing? Explore Services
                        </Link>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="max-w-2xl mx-auto mb-8 animate-slideUp">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search blog posts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-6 py-4 bg-obsidian-light/50 border border-obsidian-border rounded-lg text-slate-350 placeholder-zinc-700 focus:outline-none focus:border-toxic focus:ring-1 focus:ring-toxic/30 transition-all duration-300 font-sans text-sm"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-450 hover:text-toxic transition-colors font-mono"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>

                {/* Filter Buttons */}
                <div className="flex flex-wrap justify-center gap-3 mb-12 animate-slideUp" style={{ animationDelay: '0.1s' }}>
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-5 py-2.5 rounded-lg border font-mono text-xs uppercase tracking-wider transition-all duration-300 ${
                                selectedCategory === category
                                    ? 'border-toxic bg-toxic/15 text-toxic shadow-[0_0_15px_rgba(197,248,42,0.15)] scale-102'
                                    : 'border-obsidian-border bg-obsidian-card text-slate-450 hover:border-toxic/35 hover:text-toxic hover:scale-102'
                            }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                <div className="max-w-xs mx-auto mb-8 animate-slideUp" style={{ animationDelay: '0.15s' }}>
                    <label htmlFor="blog-sort" className="block text-[10px] font-mono tracking-widest uppercase text-slate-500 mb-2 text-center">Sort Posts</label>
                    <select
                        id="blog-sort"
                        value={sortBy}
                        onChange={(event) => setSortBy(event.target.value)}
                        className="w-full rounded-lg border border-obsidian-border bg-obsidian-light/50 px-4 py-3 text-sm text-slate-300 focus:outline-none focus:border-toxic focus:ring-1 focus:ring-toxic/30 transition-all font-sans"
                    >
                        <option value="newest" className="bg-obsidian text-slate-300">Newest First</option>
                        <option value="oldest" className="bg-obsidian text-slate-300">Oldest First</option>
                        <option value="featured" className="bg-obsidian text-slate-300">Featured First</option>
                        <option value="quick-read" className="bg-obsidian text-slate-300">Quick Reads</option>
                        <option value="deep-dive" className="bg-obsidian text-slate-300">Deep Dives</option>
                    </select>
                </div>

                {trendingTags.length > 0 ? (
                    <div className="mb-8 animate-fadeIn" style={{ animationDelay: '0.18s' }}>
                        <p className="text-[10px] uppercase tracking-widest text-slate-500 text-center mb-2 font-mono">Trending Topics</p>
                        <div className="flex flex-wrap justify-center gap-2">
                            {trendingTags.map((tag) => (
                                <button
                                    key={`trending-${tag}`}
                                    onClick={() => setSearchQuery(tag)}
                                    className="px-3 py-1.5 rounded-md text-[10px] font-mono uppercase tracking-wider border border-toxic/25 bg-toxic/5 text-toxic hover:bg-toxic hover:text-black hover:border-toxic transition-all duration-350"
                                >
                                    #{tag}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : null}

                {/* Results Count */}
                <div className="text-center mb-8 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                    <p className="text-slate-400 text-sm">
                        {filteredBlogs.length === 0 ? (
                            <span className="text-cyber font-mono">No blog posts found</span>
                        ) : (
                            <span>
                                Showing <span className="text-toxic font-semibold">{visibleBlogs.length}</span> of <span className="text-slate-300 font-semibold">{filteredBlogs.length}</span>
                                {filteredBlogs.length === 1 ? ' post' : ' posts'}
                            </span>
                        )}
                    </p>
                </div>

                {/* All Blog Posts Grid */}
                <div>
                    {filteredBlogs.length === 0 ? (
                        <div className="col-span-full text-center py-20">
                            <div className="mb-6 flex justify-center">
                                <svg className="w-16 h-16 text-slate-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                            </div>
                            <h3 className="text-xl font-display font-bold text-slate-300 mb-4">No Blog Posts Found</h3>
                            <p className="text-slate-500 text-sm mb-8">Try adjusting your search or filters</p>
                            <button
                                onClick={() => {
                                    setSearchQuery('')
                                    setSelectedCategory('All')
                                }}
                                className="px-6 py-3 border border-toxic/40 bg-toxic/15 text-toxic font-mono text-xs uppercase tracking-wider rounded-lg hover:bg-toxic hover:text-black transition-all duration-300"
                            >
                                Reset Filters
                            </button>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {visibleBlogs.map((blog, index) => (
                                <div
                                    key={blog.id}
                                    className="group bg-obsidian-card border border-obsidian-border rounded-lg overflow-hidden hover:border-toxic/45 transition-all duration-300 animate-slideUp"
                                    style={{ animationDelay: `${index * 0.05}s` }}
                                >
                                    {/* Blog Image - Lazy Loaded */}
                                    <div className="card-img-wrap relative h-48 bg-obsidian-light overflow-hidden">
                                        <LazyImage
                                            src={blog.image}
                                            alt={`${blog.title} by Gaurav Kumar Yadav - AI ML developer and web developer blog India`}
                                            sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                                            fetchPriority={index < 2 ? 'high' : 'auto'}
                                            className="w-full h-full object-cover card-img-zoom"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-transparent opacity-60"></div>
                                    </div>

                                    {/* Blog Content */}
                                    <div className="p-6">
                                        <div className="flex items-center gap-3 mb-3 text-xs font-mono tracking-wider text-slate-450 uppercase">
                                            <span>{blog.date}</span>
                                            <span>•</span>
                                            <span>{blog.readTime}</span>
                                            <span>•</span>
                                            <span className="text-cyber">{blog.category}</span>
                                        </div>
                                        <p className="mb-3 text-[10px] font-mono uppercase text-toxic">
                                            ❤️ {Number(supportCounts[blog.slug] || 0)} {Number(supportCounts[blog.slug] || 0) === 1 ? 'supporter' : 'supporters'}
                                        </p>
                                        <h3 className="text-lg font-display font-bold mb-3 text-slate-100 group-hover:text-toxic transition-colors duration-300 line-clamp-2">
                                            {blog.title}
                                        </h3>
                                        <p className="text-slate-400 text-sm mb-4 line-clamp-3 leading-relaxed">{blog.excerpt}</p>
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {(blog.tags || []).slice(0, 3).map((tag) => (
                                                <span key={`${blog.id}-${tag}`} className="bg-obsidian border border-obsidian-border text-slate-400 px-2.5 py-1 rounded-md text-[10px] font-mono">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                        <Link
                                            to={`/blog/${blog.slug}`}
                                            className="block w-full border border-obsidian-border bg-obsidian text-slate-350 hover:bg-toxic hover:text-black hover:border-toxic font-mono text-xs uppercase tracking-wider py-3 rounded-lg transition-all duration-300 text-center"
                                        >
                                            Read More →
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {remainingBlogsCount > 0 ? (
                    <div className="mt-8 text-center animate-fadeIn" style={{ animationDelay: '0.35s' }}>
                        <button
                            type="button"
                            onClick={handleLoadMoreBlogs}
                            className="inline-flex items-center justify-center rounded-lg border border-toxic/40 bg-toxic/10 px-6 py-3 text-xs font-mono uppercase tracking-wider text-toxic hover:bg-toxic hover:text-black transition-all duration-300 hover:shadow-[0_0_20px_rgba(197,248,42,0.2)]"
                        >
                            Load {nextLoadCount} More {nextLoadCount === 1 ? 'Post' : 'Posts'}
                        </button>
                    </div>
                ) : null}

                {recommendedBlogs.length > 0 ? (
                    <div className="mt-14 animate-fadeIn" style={{ animationDelay: '0.45s' }}>
                        <div className="flex items-center justify-between gap-3 mb-5">
                            <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-100">Recommended Reads</h2>
                            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Discovery</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {recommendedBlogs.map((blog) => (
                                <Link
                                    key={`recommended-${blog.id}`}
                                    to={`/blog/${blog.slug}`}
                                    className="group rounded-lg border border-obsidian-border bg-obsidian-card p-5 hover:border-toxic/40 hover:-translate-y-0.5 transition-all duration-300"
                                >
                                    <p className="text-[10px] font-mono uppercase text-cyber">{blog.category}</p>
                                    <p className="mt-2 text-base font-display font-bold text-slate-100 group-hover:text-toxic transition-colors line-clamp-2">{blog.title}</p>
                                    <p className="mt-2 text-sm text-slate-400 line-clamp-2 leading-relaxed">{blog.excerpt}</p>
                                    <p className="mt-3 text-[10px] font-mono uppercase text-toxic">
                                        ❤️ {Number(supportCounts[blog.slug] || 0)} {Number(supportCounts[blog.slug] || 0) === 1 ? 'supporter' : 'supporters'}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </div>
                ) : null}



                <div className="mt-14 rounded-lg border border-obsidian-border bg-obsidian-card p-7 sm:p-8 text-center animate-fadeIn" style={{ animationDelay: '0.5s' }}>
                    <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-100">Need Help Building Similar Work?</h2>
                    <p className="mt-2 text-slate-450 max-w-2xl mx-auto text-sm">Move from reading to execution with focused implementation help.</p>
                    <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                        <Link
                            to="/services"
                            className="inline-flex items-center justify-center rounded-lg border border-toxic/40 bg-toxic/10 px-6 py-3 text-xs font-mono uppercase tracking-wider text-toxic hover:bg-toxic hover:text-black transition-all duration-300"
                        >
                            Book Service
                        </Link>
                        <Link
                            to="/contact"
                            className="inline-flex items-center justify-center rounded-lg border border-obsidian-border px-6 py-3 text-xs font-mono uppercase tracking-wider text-slate-350 hover:border-toxic/30 hover:text-toxic transition-all duration-300"
                        >
                            Start a Conversation
                        </Link>
                    </div>
                </div>

                {/* Newsletter Section */}
                <div className="mt-20 bg-obsidian-card border border-toxic/20 rounded-lg p-8 md:p-12 text-center animate-fadeIn">
                    <div className="mb-4 flex justify-center">
                        <svg className="w-12 h-12 text-toxic/85" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-display font-bold mb-4 bg-gradient-to-r from-toxic to-cyber bg-clip-text text-transparent">
                        Stay Updated
                    </h2>
                    <p className="text-slate-300 mb-6 max-w-2xl mx-auto text-sm md:text-base">
                        Get notified when I publish new blog posts about web development, AI, and coding tutorials!
                    </p>

                    <form onSubmit={handleNewsletterSubscribe} className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={newsletterEmail}
                            onChange={(e) => setNewsletterEmail(e.target.value)}
                            required
                            disabled={newsletterLoading}
                            className="flex-1 px-4 md:px-6 py-3 bg-obsidian border border-obsidian-border rounded-md text-slate-350 placeholder-zinc-700 focus:outline-none focus:border-toxic focus:ring-1 focus:ring-toxic/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        />
                        <button
                            type="submit"
                            disabled={newsletterLoading}
                            className="px-6 md:px-8 py-3 bg-toxic text-black font-semibold text-xs font-mono uppercase tracking-wider rounded-md hover:bg-toxic/95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {newsletterLoading ? 'Subscribing...' : 'Subscribe'}
                        </button>
                    </form>
                </div>

            </div>
        </div>
    )
}

export default Blog

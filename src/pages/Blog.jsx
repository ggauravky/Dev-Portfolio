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
import { eventsData } from '../data/eventsData'
import LazyImage from '../components/LazyImage'
import EventRecordCard from '../components/EventRecordCard'
import './Blog.css'

const INITIAL_VISIBLE_BLOGS = 5
const BLOGS_LOAD_STEP = 3

function Blog() {
    useSEO({
        title: 'Blog - Gaurav Portfolio | Tech Articles, Python Tutorials & AI Insights',
        description: 'Read Gaurav Portfolio Blog! Discover tech insights, Python tutorials, AI/ML articles, Web Development guides, Data Science tips, and developer journey stories by Gaurav Kumar Yadav. Learn from real-world projects, coding tutorials, and industry best practices. Stay updated with the latest in technology.',
        keywords: 'Gaurav Portfolio Blog, Portfolio Blog, Tech Blog, Python Tutorials, AI ML Blog, Web Development Blog, Student Developer Blog, Coding Tips, Data Science Articles, Programming Guide, Developer Journey, Technology Articles, Coding Tutorials Blog',
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

    const sortedEvents = useMemo(() => {
        return [...eventsData].sort((a, b) => {
            const aTime = new Date(a.date || '').getTime()
            const bTime = new Date(b.date || '').getTime()

            if (Number.isNaN(aTime) || Number.isNaN(bTime)) {
                return 0
            }

            return bTime - aTime
        })
    }, [])

    const remainingBlogsCount = Math.max(filteredBlogs.length - visibleBlogs.length, 0)
    const nextLoadCount = Math.min(BLOGS_LOAD_STEP, remainingBlogsCount)

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
        <div className="blog-page min-h-screen bg-slate-900 px-6 py-16 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute top-20 right-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-20 left-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-12 animate-fadeIn">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                        My Blog
                    </h1>
                    <p className="text-xl text-slate-400 max-w-3xl mx-auto">
                        Thoughts, tutorials, and insights about web development, AI, and my coding journey
                    </p>
                </div>

                {/* Search Bar */}
                <div className="max-w-2xl mx-auto mb-8 animate-slideUp">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search blog posts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-6 py-4 bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-2xl text-slate-300 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
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
                            className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${selectedCategory === category
                                ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-lg shadow-purple-500/50 scale-105'
                                : 'bg-slate-800/80 backdrop-blur-sm border border-slate-700 text-slate-400 hover:text-slate-300 hover:border-purple-500/50 hover:scale-105'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                <div className="max-w-xs mx-auto mb-8 animate-slideUp" style={{ animationDelay: '0.15s' }}>
                    <label htmlFor="blog-sort" className="block text-xs font-semibold tracking-widest uppercase text-slate-500 mb-2 text-center">Sort Posts</label>
                    <select
                        id="blog-sort"
                        value={sortBy}
                        onChange={(event) => setSortBy(event.target.value)}
                        className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="featured">Featured First</option>
                        <option value="quick-read">Quick Reads</option>
                        <option value="deep-dive">Deep Dives</option>
                    </select>
                </div>

                {trendingTags.length > 0 ? (
                    <div className="mb-8 animate-fadeIn" style={{ animationDelay: '0.18s' }}>
                        <p className="text-xs uppercase tracking-widest text-slate-500 text-center mb-2">Trending Topics</p>
                        <div className="flex flex-wrap justify-center gap-2">
                            {trendingTags.map((tag) => (
                                <button
                                    key={`trending-${tag}`}
                                    onClick={() => setSearchQuery(tag)}
                                    className="px-3 py-1.5 rounded-full text-xs font-semibold border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:border-cyan-400 hover:text-cyan-200 transition-all duration-300"
                                >
                                    #{tag}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : null}

                {/* Results Count */}
                <div className="text-center mb-8 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                    <p className="text-slate-400">
                        {filteredBlogs.length === 0 ? (
                            <span className="text-red-400">No blog posts found</span>
                        ) : (
                            <span>
                                Showing <span className="text-purple-400 font-semibold">{visibleBlogs.length}</span> of <span className="text-cyan-300 font-semibold">{filteredBlogs.length}</span>
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
                                <svg className="w-20 h-20 text-slate-600" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-400 mb-4">No Blog Posts Found</h3>
                            <p className="text-slate-500 mb-8">Try adjusting your search or filters</p>
                            <button
                                onClick={() => {
                                    setSearchQuery('')
                                    setSelectedCategory('All')
                                }}
                                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-medium rounded-lg transition-all duration-300 hover:scale-105"
                            >
                                Reset Filters
                            </button>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {visibleBlogs.map((blog, index) => (
                                <div
                                    key={blog.id}
                                    className="group bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden hover:border-cyan-500/50 hover:-translate-y-2 hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300 animate-slideUp"
                                    style={{ animationDelay: `${index * 0.05}s` }}
                                >
                                    {/* Blog Image - Lazy Loaded */}
                                    <div className="card-img-wrap relative h-48 bg-slate-700 overflow-hidden">
                                        <LazyImage
                                            src={blog.image}
                                            alt={blog.title}
                                            sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                                            fetchPriority={index < 2 ? 'high' : 'auto'}
                                            className="w-full h-full object-cover card-img-zoom"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60"></div>
                                    </div>

                                    {/* Blog Content */}
                                    <div className="p-6">
                                        <div className="flex items-center gap-3 mb-3 text-sm text-slate-400">
                                            <span>{blog.date}</span>
                                            <span>•</span>
                                            <span>{blog.readTime}</span>
                                            <span>•</span>
                                            <span className="text-cyan-400">{blog.category}</span>
                                        </div>
                                        <h3 className="text-xl font-semibold mb-3 text-blue-300 group-hover:text-blue-400 transition-colors line-clamp-2">
                                            {blog.title}
                                        </h3>
                                        <p className="text-slate-400 mb-4 line-clamp-3">{blog.excerpt}</p>
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {(blog.tags || []).slice(0, 3).map((tag) => (
                                                <span key={`${blog.id}-${tag}`} className="bg-slate-700 text-slate-300 px-3 py-1 rounded-lg text-xs">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                        <Link
                                            to={`/blog/${blog.slug}`}
                                            className="block w-full bg-slate-700 hover:bg-gradient-to-r hover:from-cyan-600 hover:to-blue-600 text-slate-300 hover:text-white font-medium px-4 py-3 rounded-lg transition-all duration-300 border border-slate-600 hover:border-cyan-500 hover:scale-105 text-center"
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
                            className="inline-flex items-center justify-center rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-6 py-3 text-sm font-semibold text-cyan-200 hover:bg-cyan-500/20 hover:border-cyan-400 transition-all duration-300"
                        >
                            Load {nextLoadCount} More {nextLoadCount === 1 ? 'Post' : 'Posts'}
                        </button>
                    </div>
                ) : null}

                {recommendedBlogs.length > 0 ? (
                    <div className="mt-14 animate-fadeIn" style={{ animationDelay: '0.45s' }}>
                        <div className="flex items-center justify-between gap-3 mb-5">
                            <h2 className="text-2xl md:text-3xl font-bold text-slate-100">Recommended Reads</h2>
                            <span className="text-xs text-slate-500 uppercase tracking-widest">Discovery</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {recommendedBlogs.map((blog) => (
                                <Link
                                    key={`recommended-${blog.id}`}
                                    to={`/blog/${blog.slug}`}
                                    className="group rounded-2xl border border-slate-700/70 bg-slate-800/60 p-4 hover:border-cyan-500/40 hover:-translate-y-1 transition-all duration-300"
                                >
                                    <p className="text-xs text-cyan-300 uppercase tracking-wider">{blog.category}</p>
                                    <p className="mt-2 text-base font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors line-clamp-2">{blog.title}</p>
                                    <p className="mt-2 text-sm text-slate-400 line-clamp-2">{blog.excerpt}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                ) : null}

                <section className="mt-14 rounded-3xl border border-slate-700/70 bg-slate-800/45 backdrop-blur-sm p-6 sm:p-8 animate-fadeIn" style={{ animationDelay: '0.48s' }}>
                    <div className="flex items-center justify-between gap-3 mb-4">
                        <div>
                            <p className="text-xs uppercase tracking-widest text-cyan-300">Attendance Record</p>
                            <h2 className="text-2xl md:text-3xl font-bold text-slate-100 mt-1">Hackathons and Events</h2>
                        </div>
                        <span className="text-xs text-slate-500 uppercase tracking-widest">{sortedEvents.length} Logged</span>
                    </div>

                    <p className="text-slate-400 text-sm sm:text-base mb-5">
                        This section tracks hackathons, competitions, and technical events attended over time.
                    </p>

                    {sortedEvents.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-600 bg-slate-900/50 p-6 text-center">
                            <div className="mx-auto mb-3 w-12 h-12 rounded-xl border border-slate-700 bg-slate-800/70 flex items-center justify-center">
                                <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 6.75h6.75M8.625 12h6.75m-6.75 5.25h6.75M6 3.75h12A2.25 2.25 0 0120.25 6v12A2.25 2.25 0 0118 20.25H6A2.25 2.25 0 013.75 18V6A2.25 2.25 0 016 3.75z" />
                                </svg>
                            </div>
                            <p className="text-slate-200 font-semibold">No events added yet</p>
                            <p className="text-sm text-slate-500 mt-1">New hackathon and event attendance records will appear here.</p>
                        </div>
                    ) : (
                        <div className={sortedEvents.length === 1 ? 'max-w-5xl mx-auto' : ''}>
                            <div className={`grid grid-cols-1 gap-5 ${sortedEvents.length > 1 ? 'md:grid-cols-2' : ''}`}>
                                {sortedEvents.map((event, index) => (
                                    <EventRecordCard key={event.id} event={event} index={index} />
                                ))}
                            </div>
                        </div>
                    )}
                </section>

                <div className="mt-14 rounded-3xl border border-slate-700/70 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-cyan-600/10 p-7 sm:p-8 text-center animate-fadeIn" style={{ animationDelay: '0.5s' }}>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">Need Help Building Similar Work?</h2>
                    <p className="mt-2 text-slate-300 max-w-2xl mx-auto">Move from reading to execution with focused implementation help.</p>
                    <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                        <Link
                            to="/services"
                            className="inline-flex items-center justify-center rounded-xl px-6 py-3 font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all duration-300"
                        >
                            Book Service
                        </Link>
                        <Link
                            to="/contact"
                            className="inline-flex items-center justify-center rounded-xl px-6 py-3 font-semibold text-slate-100 border border-slate-600 hover:border-cyan-500/50 hover:text-cyan-300 transition-all duration-300"
                        >
                            Start a Conversation
                        </Link>
                    </div>
                </div>

                {/* Newsletter Section */}
                <div className="mt-20 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-cyan-600/20 backdrop-blur-sm border border-purple-500/30 rounded-3xl p-8 md:p-12 text-center animate-fadeIn">
                    <div className="mb-4 flex justify-center">
                        <svg className="w-14 h-14 text-purple-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
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
                            className="flex-1 px-4 md:px-6 py-3 bg-slate-800/80 border border-slate-700 rounded-lg text-slate-300 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                        />
                        <button
                            type="submit"
                            disabled={newsletterLoading}
                            className="px-6 md:px-8 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-medium rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm md:text-base"
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

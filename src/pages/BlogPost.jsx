// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import { useParams, Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import useSEO from '../hooks/useSEO'
import { blogsData } from '../data/blogsData'
import SupportButton from '../components/support/SupportButton'
import './BlogPost.css'

function BlogPost() {
    const { slug } = useParams()
    const navigate = useNavigate()
    const [blog, setBlog] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        // Scroll to top immediately when component mounts or slug changes
        window.scrollTo({ top: 0, behavior: 'instant' })

        // Reset state for new blog
        setLoading(true)
        setError(null)
        setBlog(null)

        try {
            // Find blog by slug
            const foundBlog = blogsData.find(b => b.slug === slug)

            if (!foundBlog) {
                // Blog not found
                setError('Blog post not found')
                setLoading(false)
                toast.error('Blog post not found. Redirecting...')
                setTimeout(() => navigate('/blog', { replace: true }), 2000)
                return
            }

            // Validate blog data
            if (!foundBlog.title || !foundBlog.content) {
                throw new Error('Invalid blog data')
            }

            setBlog(foundBlog)
            setLoading(false)
        } catch (err) {
            console.error('Error loading blog:', err)
            setError('Failed to load blog post')
            setLoading(false)
            toast.error('Failed to load blog post')
            setTimeout(() => navigate('/blog', { replace: true }), 2000)
        }
    }, [slug, navigate])

    // Calculate reading time (words per minute = 200)
    const calculateReadingTime = (content) => {
        if (!content) return 0
        const words = content.replaceAll(/<[^>]*>/g, '').split(/\s+/).filter(w => w.length > 0).length
        const minutes = Math.ceil(words / 200)
        return minutes
    }

    // Get related blogs
    const getRelatedBlogs = () => {
        if (!blog) return []
        return blogsData
            .filter(b => b.id !== blog.id && b.category === blog.category)
            .slice(0, 3)
    }

    // Copy link to clipboard with toast notification
    const handleCopyLink = async () => {
        try {
            const url = globalThis.location?.href || ''
            await navigator.clipboard.writeText(url)
            toast.success('Link copied to clipboard!')
        } catch (err) {
            console.error('Failed to copy link:', err)
            toast.error('Failed to copy link')
        }
    }

    // Generate share URL with proper encoding
    const getShareUrl = () => {
        const href = globalThis.location?.href
        if (!href) return ''
        return encodeURIComponent(href)
    }

    const getShareText = () => {
        if (!blog) return ''
        return encodeURIComponent(`${blog.title} by Gaurav Kumar Yadav`)
    }

    // SEO for individual blog post - MUST be called before any conditional returns
    useSEO({
        title: blog ? `${blog.title} | AI/ML and Web Dev Blog | Gaurav Kumar Yadav` : 'Blog Post | Gaurav Kumar Yadav',
        description: blog ? blog.excerpt : 'Loading blog post...',
        keywords: blog ? `${blog.tags.join(', ')}, Gaurav Kumar Yadav, AI ML developer Lucknow, web developer India` : '',
        ogImage: blog ? (blog.ogImage || 'https://ggauravky.vercel.app/images/profile.jpg') : 'https://ggauravky.vercel.app/images/profile.jpg',
        type: 'article',
        author: 'Gaurav Kumar Yadav',
        publishedTime: blog ? blog.publishedDate : undefined,
        tags: blog ? blog.tags : []
    })

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-[#070708] flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#c5f82a]"></div>
                    <p className="mt-4 text-[#a1a1aa] font-mono uppercase tracking-wider text-xs">Loading blog post...</p>
                </div>
            </div>
        )
    }

    // Error state
    if (error || !blog) {
        return (
            <div className="min-h-screen bg-[#070708] flex items-center justify-center">
                <div className="text-center max-w-md px-4">
                    <div className="flex justify-center mb-6">
                        <svg className="w-20 h-20 text-[#a1a1aa]/50" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" /></svg>
                    </div>
                    <h2 className="text-3xl font-display font-bold text-white mb-4">
                        {error || 'Blog Post Not Found'}
                    </h2>
                    <p className="text-[#a1a1aa] mb-8">
                        The blog post you're looking for doesn't exist or has been removed.
                    </p>
                    <Link
                        to="/blog"
                        className="inline-flex items-center justify-center rounded-md bg-[#c5f82a] text-[#070708] border-none shadow-[2px_2px_0px_0px_rgba(197,248,42,0.3)] hover:shadow-none hover:translate-y-[2px] transition-all duration-200 font-mono text-xs uppercase font-bold px-6 py-3"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Blog
                    </Link>
                </div>
            </div>
        )
    }

    const relatedBlogs = getRelatedBlogs()
    const readingTime = calculateReadingTime(blog.content)

    return (
        <div className="blog-post-page bg-[#070708] min-h-screen">
            {/* Breadcrumb */}
            <div className="bg-[#0e0e11]/50 border-b border-[#1a1a22]">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <nav className="flex flex-wrap items-center gap-2 text-xs font-mono uppercase tracking-wider">
                        <Link to="/" className="inline-flex items-center text-[#a1a1aa] hover:text-[#c5f82a] transition-colors">Home</Link>
                        <span className="inline-flex items-center text-[#242430] leading-none select-none">/</span>
                        <Link to="/blog" className="inline-flex items-center text-[#a1a1aa] hover:text-[#c5f82a] transition-colors">Blog</Link>
                        <span className="inline-flex items-center text-[#242430] leading-none select-none">/</span>
                        <span className="inline-flex items-center min-w-0 text-white break-words">{blog.title}</span>
                    </nav>
                </div>
            </div>

            {/* Blog Header */}
            <article className="max-w-4xl mx-auto px-4 py-12">
                <header className="mb-12">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="px-3 py-1 bg-[#c5f82a]/10 text-[#c5f82a] rounded-md text-xs font-mono uppercase border border-[#c5f82a]/30">
                            {blog.category}
                        </span>
                        {blog.featured && (
                            <span className="px-3 py-1 bg-[#ff5d00]/10 text-[#ff5d00] rounded-md text-xs font-mono uppercase border border-[#ff5d00]/30 flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005z" clipRule="evenodd" /></svg>
                                Featured
                            </span>
                        )}
                    </div>

                    <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-6 leading-tight">
                        {blog.title}
                    </h1>

                    <p className="text-xl text-[#a1a1aa] mb-8 leading-relaxed">
                        {blog.excerpt}
                    </p>

                    <div className="flex flex-wrap items-center gap-6 text-[#a1a1aa]/70 text-xs font-mono uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-[#c5f82a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{blog.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-[#ff5d00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{readingTime} min read</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-[#c5f82a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>Gaurav Kumar Yadav</span>
                        </div>
                    </div>

                    {/* Featured Image */}
                    <div className="w-full h-96 bg-[#0e0e11] border border-[#1a1a22] rounded-lg overflow-hidden mt-8">
                        <img
                            src={blog.image}
                            alt={`${blog.title} by Gaurav Kumar Yadav - AI ML developer and web developer blog`}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mt-6">
                        {blog.tags.map((tag) => (
                            <span
                                key={tag}
                                className="px-3 py-1 bg-[#0e0e11] border border-[#1a1a22] text-[#a1a1aa] hover:text-[#c5f82a] hover:border-[#c5f82a]/30 rounded-md text-xs font-mono transition-colors"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                </header>

                {/* Share Buttons */}
                <div className="flex flex-wrap items-center gap-4 mb-8 pb-8 border-b border-[#1a1a22]">
                    <span className="text-[#a1a1aa] font-mono text-xs uppercase tracking-wider">Share:</span>
                    <a
                        href={`https://twitter.com/intent/tweet?text=${getShareText()}&url=${getShareUrl()}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-[#0e0e11] border border-[#1a1a22] text-[#a1a1aa] hover:text-[#c5f82a] hover:border-[#c5f82a]/30 rounded-md font-mono text-xs uppercase transition-colors"
                        aria-label="Share on Twitter"
                    >
                        <svg className="w-4 h-4 text-[#c5f82a]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                        </svg>
                        Twitter
                    </a>
                    <a
                        href={`https://www.linkedin.com/sharing/share-offsite/?url=${getShareUrl()}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-[#0e0e11] border border-[#1a1a22] text-[#a1a1aa] hover:text-[#c5f82a] hover:border-[#c5f82a]/30 rounded-md font-mono text-xs uppercase transition-colors"
                        aria-label="Share on LinkedIn"
                    >
                        <svg className="w-4 h-4 text-[#ff5d00]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                        LinkedIn
                    </a>
                    <button
                        onClick={handleCopyLink}
                        className="flex items-center gap-2 px-4 py-2 bg-[#0e0e11] border border-[#1a1a22] text-[#a1a1aa] hover:text-[#c5f82a] hover:border-[#c5f82a]/30 rounded-md font-mono text-xs uppercase transition-colors"
                        aria-label="Copy link to clipboard"
                    >
                        <svg className="w-4 h-4 text-[#c5f82a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy Link
                    </button>
                </div>

                <div className="mb-8">
                    <SupportButton
                        slug={blog.slug}
                        title={blog.title}
                        content={blog.content}
                    />
                </div>

                <div className="mb-8 rounded-lg border border-[#ff5d00]/30 bg-[#ff5d00]/5 p-6">
                    <h2 className="text-lg font-display font-bold text-[#ff5d00] mb-2">Want help implementing this in your own project?</h2>
                    <p className="text-[#a1a1aa] text-sm mb-4 leading-relaxed">
                        Explore my implementation services for AI/ML and web development, or contact me directly to discuss your goal.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <Link
                            to="/services"
                            className="inline-flex items-center justify-center rounded-md bg-[#c5f82a] text-[#070708] border-none shadow-[2px_2px_0px_0px_rgba(197,248,42,0.3)] hover:shadow-none hover:translate-y-[2px] transition-all duration-200 font-mono text-xs uppercase font-bold px-4 py-2"
                        >
                            Explore Services
                        </Link>
                        <Link
                            to="/contact"
                            className="inline-flex items-center justify-center rounded-md border border-[#1a1a22] text-[#a1a1aa] hover:text-[#c5f82a] hover:border-[#c5f82a]/30 font-mono text-xs uppercase px-4 py-2 transition-all duration-200"
                        >
                            Contact Me
                        </Link>
                    </div>
                </div>

                {/* Blog Content */}
                <div
                    className="blog-post-content blog-content max-w-none mb-12"
                    dangerouslySetInnerHTML={{ __html: blog.content }}
                />

                {/* Author Bio */}
                <div className="bg-[#0e0e11] border border-[#1a1a22] rounded-lg p-8 mb-12">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="w-24 h-24 rounded-full bg-[#16161a] border border-[#1a1a22] flex items-center justify-center shrink-0">
                            <svg className="w-12 h-12 text-[#c5f82a]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" /></svg>
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h3 className="text-2xl font-display font-bold text-white mb-2">Gaurav Kumar Yadav</h3>
                            <p className="text-[#a1a1aa] mb-4 text-sm leading-relaxed">
                                Python Developer | AI & Data Science Enthusiast | Full Stack Developer from Lucknow, India.
                                Passionate about technology, learning, and sharing knowledge.
                            </p>
                            <div className="flex justify-center md:justify-start gap-4">
                                <a href="https://github.com/ggauravky" target="_blank" rel="noopener noreferrer" className="text-[#a1a1aa] hover:text-[#c5f82a] transition-colors" aria-label="GitHub">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                    </svg>
                                </a>
                                <a href="https://www.linkedin.com/in/gauravky/" target="_blank" rel="noopener noreferrer" className="text-[#a1a1aa] hover:text-[#c5f82a] transition-colors" aria-label="LinkedIn">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Posts */}
                {relatedBlogs.length > 0 && (
                    <div className="mb-12">
                        <h2 className="text-3xl font-display font-bold text-white mb-8">Related Articles</h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            {relatedBlogs.map((relatedBlog) => (
                                <Link
                                    key={relatedBlog.id}
                                    to={`/blog/${relatedBlog.slug}`}
                                    className="group bg-[#0e0e11] border border-[#1a1a22] rounded-lg overflow-hidden hover:border-[#c5f82a]/30 transition-all duration-300 hover:-translate-y-1"
                                >
                                    <div className="p-6">
                                        <span className="text-[#c5f82a] text-xs font-mono uppercase tracking-wider">{relatedBlog.category}</span>
                                        <h3 className="text-lg font-display font-bold text-white mt-2 mb-2 group-hover:text-[#c5f82a] transition-colors line-clamp-2">
                                            {relatedBlog.title}
                                        </h3>
                                        <p className="text-[#a1a1aa] text-sm blog-post-clamp-2 leading-relaxed">{relatedBlog.excerpt}</p>
                                        <div className="flex items-center gap-2 mt-4 text-[#a1a1aa]/50 font-mono text-[10px] uppercase">
                                            <span>{relatedBlog.date}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between items-center pt-8 border-t border-[#1a1a22]">
                    <Link
                        to="/blog"
                        className="flex items-center gap-2 text-[#a1a1aa] hover:text-[#c5f82a] transition-colors font-mono text-xs uppercase tracking-wider"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Blog
                    </Link>
                    <Link
                        to="/contact"
                        className="inline-flex items-center justify-center rounded-md bg-[#ff5d00] text-white border-none shadow-[2px_2px_0px_0px_rgba(255,93,0,0.3)] hover:shadow-none hover:translate-y-[2px] transition-all duration-200 font-mono text-xs uppercase font-bold px-6 py-3"
                    >
                        Get in Touch
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </Link>
                </div>
            </article>
        </div>
    )
}

export default BlogPost

import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import useSEO from '../hooks/useSEO'
import { blogsData, categories } from '../data/blogsData'
import { SkeletonGrid } from '../components/SkeletonLoader'
import LazyImage from '../components/LazyImage'
import './Blog.css'

function Blog() {
    useSEO({
        title: 'Blog - Gaurav Portfolio | Tech Articles, Python Tutorials & AI Insights',
        description: 'Read Gaurav Portfolio Blog! Discover tech insights, Python tutorials, AI/ML articles, Web Development guides, Data Science tips, and developer journey stories by Gaurav Kumar Yadav. Learn from real-world projects, coding tutorials, and industry best practices. Stay updated with the latest in technology.',
        keywords: 'Gaurav Portfolio Blog, Portfolio Blog, Tech Blog, Python Tutorials, AI ML Blog, Web Development Blog, Student Developer Blog, Coding Tips, Data Science Articles, Programming Guide, Developer Journey, Technology Articles, Coding Tutorials Blog',
        ogImage: 'https://ggauravky.vercel.app/images/profile.jpg'
    })

    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('All')
    const [newsletterEmail, setNewsletterEmail] = useState('')
    const [newsletterLoading, setNewsletterLoading] = useState(false)
    const [selectedBlog, setSelectedBlog] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    // Optimize: Only load blog metadata, not full content
    const blogs = useMemo(() => blogsData.map(blog => ({
        ...blog,
        // Only keep essential fields for list view
        content: undefined // Remove heavy content from list view
    })), [])

    // Simulate initial loading
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false)
        }, 500) // Reduced from 800ms
        return () => clearTimeout(timer)
    }, [])

    // Filter blogs based on search and category
    const filteredBlogs = useMemo(() => {
        return blogs.filter(blog => {
            const matchesSearch =
                blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                blog.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))

            const matchesCategory = selectedCategory === 'All' || blog.category === selectedCategory

            return matchesSearch && matchesCategory
        })
    }, [searchQuery, selectedCategory])

    const featuredBlogs = blogs.filter(blog => blog.featured)

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
                toast.success(data.message || '🎉 Successfully subscribed! You\'ll receive updates about new blog posts.', {
                    id: loadingToast,
                    duration: 5000,
                })
                setNewsletterEmail('')
            } else {
                toast.error(data.message || '❌ Failed to subscribe. Please try again.', {
                    id: loadingToast,
                    duration: 5000,
                })
            }
        } catch (error) {
            console.error('Newsletter subscription error:', error)
            toast.error('❌ Network error. Please check your connection and try again.', {
                id: loadingToast,
                duration: 5000,
            })
        } finally {
            setNewsletterLoading(false)
        }
    }

    const handleReadMore = (blogId) => {
        const blog = blogs.find(b => b.id === blogId)
        setSelectedBlog(blog)
        document.body.style.overflow = 'hidden' // Prevent scrolling when modal is open
    }

    const handleCloseModal = () => {
        setSelectedBlog(null)
        document.body.style.overflow = 'unset'
    }

    const handleShare = (platform, blog) => {
        const baseUrl = 'https://ggauravky.vercel.app'
        const blogUrl = `${baseUrl}/blog`
        const title = encodeURIComponent(blog.title)
        const text = encodeURIComponent(blog.excerpt)

        let shareUrl = ''

        switch (platform) {
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(blogUrl)}&quote=${title}`
                window.open(shareUrl, '_blank', 'width=600,height=400')
                break

            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(blogUrl)}&text=${title}&via=ggauravky`
                window.open(shareUrl, '_blank', 'width=600,height=400')
                break

            case 'linkedin':
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(blogUrl)}`
                window.open(shareUrl, '_blank', 'width=600,height=400')
                break

            case 'copy':
                navigator.clipboard.writeText(blogUrl)
                    .then(() => {
                        toast.success('🔗 Link copied to clipboard!', { duration: 3000 })
                    })
                    .catch(() => {
                        toast.error('Failed to copy link', { duration: 3000 })
                    })
                break

            default:
                break
        }
    }

    return (
        <div className="min-h-screen bg-slate-900 px-6 py-16 relative overflow-hidden">
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
                        Thoughts, tutorials, and insights about web development, AI, and my coding journey 📝
                    </p>
                </div>

                {/* Search Bar */}
                <div className="max-w-2xl mx-auto mb-8 animate-slideUp">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="🔍 Search blog posts..."
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

                {/* Results Count */}
                <div className="text-center mb-8 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                    <p className="text-slate-400">
                        {filteredBlogs.length === 0 ? (
                            <span className="text-red-400">No blog posts found 😔</span>
                        ) : (
                            <span>
                                Showing <span className="text-purple-400 font-semibold">{filteredBlogs.length}</span>
                                {filteredBlogs.length === 1 ? ' post' : ' posts'}
                            </span>
                        )}
                    </p>
                </div>

                {/* All Blog Posts Grid */}
                <div>
                    {isLoading ? (
                        <SkeletonGrid count={6} />
                    ) : filteredBlogs.length === 0 ? (
                        <div className="col-span-full text-center py-20">
                            <div className="text-8xl mb-6">📝</div>
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
                            {filteredBlogs.map((blog, index) => (
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
                                            {blog.tags.slice(0, 3).map((tag, index) => (
                                                <span key={index} className="bg-slate-700 text-slate-300 px-3 py-1 rounded-lg text-xs">
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

                {/* Newsletter Section */}
                <div className="mt-20 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-cyan-600/20 backdrop-blur-sm border border-purple-500/30 rounded-3xl p-8 md:p-12 text-center animate-fadeIn">
                    <div className="text-5xl mb-4">📬</div>
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

                {/* Blog Post Modal */}
                {selectedBlog && (
                    <div
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
                        onClick={handleCloseModal}
                    >
                        <div
                            className="bg-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative animate-slideUp"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close Button */}
                            <button
                                onClick={handleCloseModal}
                                className="absolute top-4 right-4 z-10 bg-slate-700 hover:bg-slate-600 text-white rounded-full p-2 transition-all duration-300 hover:scale-110"
                                aria-label="Close"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            {/* Blog Header Image */}
                            <div className="relative h-64 md:h-80 bg-slate-700 overflow-hidden rounded-t-2xl">
                                <LazyImage
                                    src={selectedBlog.image}
                                    alt={selectedBlog.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                            </div>

                            {/* Blog Content */}
                            <div className="p-6 md:p-8">
                                {/* Meta Info */}
                                <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-slate-400">
                                    <span className="flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        {selectedBlog.date}
                                    </span>
                                    <span>•</span>
                                    <span className="flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {selectedBlog.readTime}
                                    </span>
                                    <span>•</span>
                                    <span className="bg-purple-600/20 border border-purple-500/50 text-purple-300 px-3 py-1 rounded-full">
                                        {selectedBlog.category}
                                    </span>
                                </div>

                                {/* Title */}
                                <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                                    {selectedBlog.title}
                                </h1>

                                {/* Author */}
                                <p className="text-slate-400 mb-6 flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    By {selectedBlog.author}
                                </p>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {selectedBlog.tags.map((tag, index) => (
                                        <span key={index} className="bg-slate-700 text-slate-300 px-3 py-1 rounded-lg text-sm">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>

                                {/* Divider */}
                                <div className="border-t border-slate-700 my-6"></div>

                                {/* Blog Content */}
                                <div className="prose prose-invert prose-lg max-w-none">
                                    <div className="text-slate-300 leading-relaxed space-y-6" dangerouslySetInnerHTML={{ __html: selectedBlog.content }} />
                                </div>

                                {/* Share Section */}
                                <div className="mt-8 pt-6 border-t border-slate-700">
                                    <p className="text-slate-400 text-center mb-4">Enjoyed this article? Share it with others!</p>
                                    <div className="flex flex-wrap justify-center gap-3 md:gap-4">
                                        <button
                                            onClick={() => handleShare('facebook', selectedBlog)}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-all duration-300 flex items-center gap-2 hover:scale-105"
                                            title="Share on Facebook"
                                        >
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                            </svg>
                                            <span className="hidden sm:inline">Share</span>
                                        </button>
                                        <button
                                            onClick={() => handleShare('twitter', selectedBlog)}
                                            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-all duration-300 flex items-center gap-2 hover:scale-105"
                                            title="Share on Twitter"
                                        >
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                                            </svg>
                                            <span className="hidden sm:inline">Tweet</span>
                                        </button>
                                        <button
                                            onClick={() => handleShare('linkedin', selectedBlog)}
                                            className="px-4 py-2 bg-blue-700 hover:bg-blue-600 rounded-lg transition-all duration-300 flex items-center gap-2 hover:scale-105"
                                            title="Share on LinkedIn"
                                        >
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                            </svg>
                                            <span className="hidden sm:inline">LinkedIn</span>
                                        </button>
                                        <button
                                            onClick={() => handleShare('copy', selectedBlog)}
                                            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg transition-all duration-300 flex items-center gap-2 hover:scale-105"
                                            title="Copy Link"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                            </svg>
                                            <span className="hidden sm:inline">Copy Link</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Blog

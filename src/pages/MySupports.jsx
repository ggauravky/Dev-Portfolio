import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import useSEO from '../hooks/useSEO'
import useAuth from '../hooks/useAuth'
import { fetchMySupports } from '../services/blogSupport'

function MySupports() {
    const { isAuthenticated, isLoading } = useAuth()
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)

    useSEO({
        title: 'My Supports - Gaurav Portfolio',
        description: 'View blog posts you supported on Gaurav Portfolio.',
        keywords: 'my supports, supported blogs, profile support history',
        ogImage: 'https://ggauravky.vercel.app/images/profile.jpg',
    })

    useEffect(() => {
        if (isLoading) {
            return
        }

        if (!isAuthenticated) {
            setLoading(false)
            setItems([])
            return
        }

        const loadSupports = async () => {
            setLoading(true)
            try {
                const data = await fetchMySupports()
                setItems(Array.isArray(data.items) ? data.items : [])
            } catch (error) {
                toast.error(error?.message || 'Unable to load supports')
            } finally {
                setLoading(false)
            }
        }

        loadSupports()
    }, [isAuthenticated, isLoading])

    if (loading || isLoading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-500" />
                    <p className="mt-3 text-slate-300">Loading your supports...</p>
                </div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-slate-900 px-4 py-20">
                <div className="mx-auto max-w-xl rounded-3xl border border-slate-700/70 bg-slate-800/60 p-8 text-center">
                    <h1 className="text-3xl font-bold text-slate-100">My Supports</h1>
                    <p className="mt-3 text-slate-300">
                        You are not signed in yet. Open any blog post and click Support to continue with Google.
                    </p>
                    <Link
                        to="/blog"
                        className="mt-6 inline-flex items-center justify-center rounded-xl border border-cyan-400/40 bg-cyan-500/10 px-5 py-3 text-cyan-200 hover:bg-cyan-500/20 transition-colors"
                    >
                        Go to Blog
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-900 px-4 py-14 sm:py-20">
            <div className="mx-auto max-w-4xl">
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-100">My Supports</h1>
                <p className="mt-2 text-slate-400">Posts you appreciated recently.</p>

                {items.length === 0 ? (
                    <div className="mt-8 rounded-2xl border border-slate-700 bg-slate-800/60 p-6 text-slate-300">
                        You have not supported any post yet.
                    </div>
                ) : (
                    <div className="mt-8 grid gap-4">
                        {items.map((item) => (
                            <Link
                                key={item.id}
                                to={`/blog/${item.blog.slug}`}
                                className="group rounded-2xl border border-slate-700/70 bg-slate-800/55 p-5 hover:border-cyan-500/40 hover:-translate-y-0.5 transition-all duration-300"
                            >
                                <p className="text-lg font-semibold text-slate-100 group-hover:text-cyan-200 transition-colors">
                                    {item.blog.title}
                                </p>
                                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-400">
                                    <span>
                                        Supported on {new Date(item.createdAt).toLocaleDateString('en-IN', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric',
                                        })}
                                    </span>
                                    <span>•</span>
                                    <span className="text-rose-300">❤️ {item.blog.supportCount} supporters</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default MySupports

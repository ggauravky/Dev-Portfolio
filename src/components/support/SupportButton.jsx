import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import PropTypes from 'prop-types'
import toast from 'react-hot-toast'
import useAuth from '../../hooks/useAuth'
import { fetchSupportStatus, supportBlogPost } from '../../services/blogSupport'
import { trackEvent } from '../../utils/analytics'

const GoogleSignInModal = lazy(() => import('./GoogleSignInModal'))

function SupportButton({ slug, title, content = '' }) {
    const { isAuthenticated, isLoading, refreshSession } = useAuth()
    const [supportCount, setSupportCount] = useState(0)
    const [supported, setSupported] = useState(false)
    const [isFetching, setIsFetching] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [pulseActive, setPulseActive] = useState(false)

    const normalizedSlug = useMemo(() => String(slug || '').trim().toLowerCase(), [slug])

    const loadStatus = useCallback(async () => {
        if (!normalizedSlug) {
            setSupportCount(0)
            setSupported(false)
            setIsFetching(false)
            return
        }

        try {
            setIsFetching(true)
            const data = await fetchSupportStatus(normalizedSlug)
            setSupportCount(Number(data.totalSupporters || 0))
            setSupported(Boolean(data.supported))
        } catch {
            setSupportCount(0)
            setSupported(false)
        } finally {
            setIsFetching(false)
        }
    }, [normalizedSlug])

    useEffect(() => {
        loadStatus()
    }, [loadStatus, isAuthenticated])

    useEffect(() => {
        if (!pulseActive) {
            return undefined
        }

        const timer = setTimeout(() => setPulseActive(false), 650)
        return () => clearTimeout(timer)
    }, [pulseActive])

    const runSupportRequest = useCallback(async () => {
        if (!normalizedSlug || isSubmitting) {
            return
        }

        if (supported) {
            toast.success('Already supported')
            return
        }

        const previousCount = supportCount
        const previousSupported = supported

        setIsSubmitting(true)
        setSupported(true)
        setSupportCount((current) => current + 1)

        try {
            const data = await supportBlogPost({
                slug: normalizedSlug,
                title,
                content,
            })

            setSupportCount(Number(data.totalSupporters || previousCount + 1))
            setSupported(Boolean(data.supported))

            if (data.alreadySupported) {
                toast.success('Already supported')
            } else {
                toast.success('Thanks for supporting ❤️')
                setPulseActive(true)
            }
        } catch (error) {
            setSupportCount(previousCount)
            setSupported(previousSupported)

            const message = error?.message || 'Unable to support right now'
            if (/sign in|session/i.test(message)) {
                toast.error('Please sign in first')
                setIsModalOpen(true)
            } else {
                toast.error(message)
            }
        } finally {
            setIsSubmitting(false)
        }
    }, [normalizedSlug, title, content, isSubmitting, supported, supportCount])

    const onSupportClick = async () => {
        if (isFetching || isSubmitting) {
            return
        }

        void trackEvent('blog_support_click', {
            slug: normalizedSlug,
            is_authenticated: Boolean(isAuthenticated),
            already_supported: Boolean(supported),
        })

        if (!isAuthenticated) {
            setIsModalOpen(true)
            return
        }

        await runSupportRequest()
    }

    const handleAuthenticated = async () => {
        setIsModalOpen(false)
        await refreshSession()
        await runSupportRequest()
    }

    return (
        <>
            <div className="rounded-2xl border border-slate-700/70 bg-slate-800/50 p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Appreciation</p>
                        <p className="mt-1 text-sm text-slate-300">Support this article if it helped you.</p>
                    </div>

                    <p className="text-sm font-semibold text-rose-200">
                        ❤️ {supportCount} {supportCount === 1 ? 'supporter' : 'supporters'}
                    </p>
                </div>

                <div className="mt-4 relative">
                    <motion.button
                        type="button"
                        whileHover={{ scale: supported ? 1.01 : 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        disabled={isSubmitting || isFetching || isLoading}
                        onClick={onSupportClick}
                        className={`relative w-full overflow-hidden rounded-xl border px-5 py-3.5 text-sm font-semibold transition-all duration-300 sm:w-auto ${
                            supported
                                ? 'border-rose-400/50 bg-gradient-to-r from-rose-500/25 to-pink-500/25 text-rose-100 shadow-[0_0_32px_rgba(244,63,94,0.25)]'
                                : 'border-cyan-400/40 bg-gradient-to-r from-cyan-500/15 to-blue-500/15 text-cyan-100 hover:border-cyan-300/70 hover:shadow-[0_0_30px_rgba(34,211,238,0.22)]'
                        }`}
                    >
                        <span className="relative z-10 inline-flex items-center gap-2">
                            {supported ? '💖 Supported' : '❤️ Support this post'}
                            {isSubmitting ? (
                                <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            ) : null}
                        </span>

                        {pulseActive ? (
                            <span className="pointer-events-none absolute inset-0 animate-ping rounded-xl bg-rose-400/20" />
                        ) : null}
                    </motion.button>
                </div>
            </div>

            {isModalOpen ? (
                <Suspense fallback={null}>
                    <GoogleSignInModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onAuthenticated={handleAuthenticated}
                    />
                </Suspense>
            ) : null}
        </>
    )
}

SupportButton.propTypes = {
    slug: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    content: PropTypes.string,
}

export default SupportButton

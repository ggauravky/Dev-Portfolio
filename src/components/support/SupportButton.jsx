// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// "Support this article" (P5 restyle). Signing in is triggered here for
// signed-out readers (D-002); the count and the support call are unchanged.

import { useCallback, useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import toast from 'react-hot-toast'
import useAuth from '../../hooks/useAuth'
import { fetchSupportStatus, supportBlogPost } from '../../services/blogSupport'
import { trackEvent } from '../../utils/analytics'
import { Button } from '../ui'

function SupportButton({ slug, title, content = '' }) {
    const { isAuthenticated, isLoading, openAuthDialog } = useAuth()
    const [supportCount, setSupportCount] = useState(0)
    const [supported, setSupported] = useState(false)
    const [isFetching, setIsFetching] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)

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
                toast.success('Thanks for the support.')
            }
        } catch (error) {
            setSupportCount(previousCount)
            setSupported(previousSupported)

            const message = error?.message || 'Unable to support right now'
            if (/sign in|session/i.test(message)) {
                openAuthDialog({ reason: 'blog-support', onSuccess: runSupportRequest })
            } else {
                toast.error(message)
            }
        } finally {
            setIsSubmitting(false)
        }
    }, [normalizedSlug, title, content, isSubmitting, supported, supportCount, openAuthDialog])

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
            openAuthDialog({ reason: 'blog-support', onSuccess: runSupportRequest })
            return
        }

        await runSupportRequest()
    }

    return (
        <div className="ar-support">
            <p className="ar-support__text">
                Did this help? Support the article.
                <span className="ar-support__count" aria-live="polite">
                    {supportCount} {supportCount === 1 ? 'supporter' : 'supporters'}
                </span>
            </p>
            <Button
                variant={supported ? 'secondary' : 'primary'}
                loading={isSubmitting}
                disabled={isFetching || isLoading}
                onClick={onSupportClick}
            >
                {supported ? 'Supported' : 'Support this article'}
            </Button>
        </div>
    )
}

SupportButton.propTypes = {
    slug: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    content: PropTypes.string,
}

export default SupportButton

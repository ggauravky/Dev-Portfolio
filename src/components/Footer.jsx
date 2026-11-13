// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

// S4 — live colophon footer (DESIGN.md "Signature layer"), site-wide.
// Lucknow time (ticks per minute, no rAF), availability and "currently building"
// from siteStatus, last GitHub activity (fetched only once the footer is near the
// viewport and the browser is idle), copy-email with a toast, a big wordmark and
// back-to-top. It is also where signed-out visitors find "Sign in" (D-002).

import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import toast from 'react-hot-toast'
import useAuth from '../hooks/useAuth'
import TextLink from './ui/TextLink'
import { siteStatus, isAvailable } from '../data/siteStatus'
import { timeFormat, numberFormat, formatGitHubDay, useLucknowTime, loadGitHubActivity } from '../lib/liveStatus'
import { prefersReducedMotion } from '../lib/motion'
import './Footer.css'

const PAGE_LINKS = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Journey', path: '/journey' },
    { name: 'Projects', path: '/projects' },
    { name: 'Services', path: '/services' },
    { name: 'Blog', path: '/blog' },
    { name: 'Updates', path: '/updates' },
    { name: 'Skills', path: '/skills' },
    { name: 'Contact', path: '/contact' },
]

const LEGAL_LINKS = [
    { name: 'Privacy Policy', path: '/privacy' },
    { name: 'Terms of Service', path: '/terms' },
    { name: 'Refund Policy', path: '/refund' },
]

/**
 * Last-year contributions and the last active day (src/lib/liveStatus.js).
 * Never blocks: it waits until the footer is within a screen of the viewport,
 * then for idle time. Fallback numbers are not shown (they are not real data);
 * on failure the row is just a profile link.
 */
function useGitHubActivity(targetRef) {
    const [state, setState] = useState({ status: 'idle', data: null })

    useEffect(() => {
        const el = targetRef.current
        if (!el || typeof IntersectionObserver === 'undefined') return undefined
        let cancelled = false
        let idleId = 0
        let timerId = 0

        const load = () => {
            setState({ status: 'loading', data: null })
            loadGitHubActivity()
                .then((data) => {
                    if (!cancelled) setState({ status: 'ready', data })
                })
                .catch(() => {
                    if (!cancelled) setState({ status: 'error', data: null })
                })
        }

        const observer = new IntersectionObserver((entries) => {
            if (!entries.some((entry) => entry.isIntersecting)) return
            observer.disconnect()
            if ('requestIdleCallback' in window) idleId = window.requestIdleCallback(load, { timeout: 3000 })
            else timerId = window.setTimeout(load, 300)
        }, { rootMargin: '0px 0px 100% 0px' })
        observer.observe(el)

        return () => {
            cancelled = true
            observer.disconnect()
            if (idleId) window.cancelIdleCallback(idleId)
            window.clearTimeout(timerId)
        }
    }, [targetRef])

    return state
}

function LinkList({ links }) {
    return (
        <ul>
            {links.map((link) => (
                <li key={link.path}>
                    <TextLink to={link.path} tone="muted" className="footer-link">{link.name}</TextLink>
                </li>
            ))}
        </ul>
    )
}

LinkList.propTypes = {
    links: PropTypes.arrayOf(PropTypes.shape({ name: PropTypes.string, path: PropTypes.string })).isRequired,
}

const copyEmail = async () => {
    try {
        await navigator.clipboard.writeText(siteStatus.email)
        toast.success('Email copied')
    } catch {
        toast.error(`Couldn't copy. The address is ${siteStatus.email}`)
    }
}

const backToTop = () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
    document.getElementById('main-content')?.focus({ preventScroll: true })
}

// The stat line keeps its space while loading (and stays blank on failure), so
// the data arriving never shifts the page.
function GitHubLine({ state }) {
    const data = state.status === 'ready' ? state.data : null
    let stat = ' '
    // Only real numbers: a missing total never prints "NaN" or "undefined".
    if (data && Number.isFinite(data.total)) {
        const last = data.lastActive ? `, last on ${formatGitHubDay(data.lastActive)}` : ''
        stat = `${numberFormat.format(data.total)} contributions in the last year${last}`
    } else if (data?.lastActive) {
        stat = `Last contribution ${formatGitHubDay(data.lastActive)}`
    }
    return (
        <>
            <span className="colophon__gh-stat">{stat}</span>
            <TextLink href={siteStatus.links.github} external tone="muted">github.com/ggauravky</TextLink>
        </>
    )
}

GitHubLine.propTypes = {
    state: PropTypes.shape({ status: PropTypes.string, data: PropTypes.object }).isRequired,
}

function Footer() {
    const { isAuthenticated, openAuthDialog } = useAuth()
    const ref = useRef(null)
    const now = useLucknowTime()
    const github = useGitHubActivity(ref)
    const available = isAvailable()
    const building = siteStatus.currentlyBuilding

    return (
        <footer ref={ref} className="colophon" aria-labelledby="colophon-title">
            <div className="colophon__wrap">
                <h2 id="colophon-title" className="sr-only">Colophon</h2>

                <div className="colophon__grid">
                    <dl className="colophon__facts">
                        <div>
                            <dt>Local time</dt>
                            <dd>
                                <time dateTime={now.toISOString()}>{timeFormat.format(now)}</time> in Lucknow (IST)
                            </dd>
                        </div>
                        {siteStatus.availability ? (
                            <div>
                                <dt>Status</dt>
                                <dd className="colophon__status">
                                    <span className={`colophon__dot ${available ? 'is-live' : ''}`} aria-hidden="true" />
                                    {siteStatus.availability.label}
                                </dd>
                            </div>
                        ) : null}
                        {building ? (
                            <div>
                                <dt>Building</dt>
                                <dd>
                                    {building.href
                                        ? <TextLink to={building.href}>{building.title}</TextLink>
                                        : building.title}
                                </dd>
                            </div>
                        ) : null}
                        <div>
                            <dt>GitHub</dt>
                            <dd aria-live="polite"><GitHubLine state={github} /></dd>
                        </div>
                        <div>
                            <dt>Email</dt>
                            <dd className="colophon__email">
                                <TextLink href={`mailto:${siteStatus.email}`} translate="no">{siteStatus.email}</TextLink>
                                <button type="button" className="colophon__copy" onClick={copyEmail} data-cursor="Copy" aria-label="Copy email address">
                                    Copy
                                </button>
                            </dd>
                        </div>
                    </dl>

                    <nav aria-labelledby="footer-pages" className="colophon__col colophon__col--pages">
                        <h3 id="footer-pages" className="footer-heading">Pages</h3>
                        <div className="footer-pages">
                            <LinkList links={PAGE_LINKS} />
                        </div>
                    </nav>

                    <div className="colophon__col">
                        <section aria-labelledby="footer-legal">
                            <h3 id="footer-legal" className="footer-heading">Legal</h3>
                            <LinkList links={LEGAL_LINKS} />
                        </section>
                        <section aria-labelledby="footer-account" className="colophon__account">
                            <h3 id="footer-account" className="footer-heading">Account</h3>
                            <ul>
                                <li>
                                    {isAuthenticated ? (
                                        <TextLink to="/my-activity" tone="muted" className="footer-link">My activity</TextLink>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => openAuthDialog({ reason: 'navbar' })}
                                            className="footer-link text-link text-link--muted"
                                        >
                                            <span className="text-link__label">Sign in</span>
                                        </button>
                                    )}
                                </li>
                                <li>
                                    <TextLink href={siteStatus.resumeUrl} external tone="muted" className="footer-link" aria-label="Resume (PDF, opens in a new tab)">
                                        Resume
                                    </TextLink>
                                </li>
                            </ul>
                        </section>
                    </div>
                </div>

                <p className="colophon__mark" aria-hidden="true" translate="no">Gaurav Kumar Yadav</p>

                <div className="colophon__base">
                    <div>
                        <p>© 2026 Gaurav Kumar Yadav. All rights reserved.</p>
                        <p>
                            Designed &amp; developed by{' '}
                            <TextLink to="/admin" tone="muted">Gaurav Kumar Yadav</TextLink>
                            . Set in Fraunces, Geist and Geist Mono.
                        </p>
                    </div>
                    <button type="button" onClick={backToTop} className="footer-link text-link text-link--muted">
                        <span className="text-link__label">Back to top ↑</span>
                    </button>
                </div>
            </div>
        </footer>
    )
}

export default Footer

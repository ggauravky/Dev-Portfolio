// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

import useAuth from '../hooks/useAuth'
import TextLink from './ui/TextLink'
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

const scrollToTop = () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
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

// Colophon-style footer. It is also where signed-out visitors find "Sign in" (D-002).
function Footer() {
    const { isAuthenticated, openAuthDialog } = useAuth()

    return (
        <footer className="border-t border-rule bg-ink">
            <div className="mx-auto max-w-[1200px] px-4 pb-8 pt-16 sm:px-6 lg:px-8">
                <div className="grid gap-12 md:grid-cols-12 md:gap-8">
                    <section className="md:col-span-12 lg:col-span-5">
                        <h2 className="font-serif text-[32px] leading-tight text-paper sm:text-[40px]">Gaurav Kumar Yadav</h2>
                        <p className="mt-2 text-small text-paper">AI/ML &amp; Web Developer</p>
                        <p className="mt-4 max-w-[44ch] text-small text-muted">
                            Building practical, user-focused digital products with modern frontend, data, and machine learning workflows.
                        </p>
                    </section>

                    <nav aria-labelledby="footer-pages" className="md:col-span-6 lg:col-span-3">
                        <h3 id="footer-pages" className="footer-heading">Pages</h3>
                        <div className="footer-pages">
                            <LinkList links={PAGE_LINKS} />
                        </div>
                    </nav>

                    <section aria-labelledby="footer-legal" className="md:col-span-3 lg:col-span-2">
                        <h3 id="footer-legal" className="footer-heading">Legal</h3>
                        <LinkList links={LEGAL_LINKS} />
                    </section>

                    <section aria-labelledby="footer-account" className="md:col-span-3 lg:col-span-2">
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
                                <TextLink href="/resume.pdf" external tone="muted" className="footer-link" aria-label="Resume (PDF, opens in a new tab)">
                                    Resume
                                </TextLink>
                            </li>
                        </ul>
                    </section>
                </div>

                <div className="mt-16 flex flex-col gap-4 border-t border-rule pt-6 text-small text-muted md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                        <p>© 2026 Gaurav Kumar Yadav. All rights reserved.</p>
                        <p>
                            Designed &amp; Developed by{' '}
                            <TextLink to="/admin" tone="muted">Gaurav Kumar Yadav</TextLink>
                            {' '}| Student Developer Portfolio 2026
                        </p>
                    </div>
                    <button type="button" onClick={scrollToTop} className="footer-link text-link text-link--muted self-start md:self-auto">
                        <span className="text-link__label">Back to top ↑</span>
                    </button>
                </div>
            </div>
        </footer>
    )
}

export default Footer

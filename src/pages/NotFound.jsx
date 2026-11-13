// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Unauthorized copying, modification, or distribution of this software,
// via any medium, is strictly prohibited without the express written
// consent of the author. See LICENSE for details.
// Source: https://github.com/ggauravky/Dev-Portfolio

// 404 inside the SPA (P5). Same page as the static public/404.html, which
// Vercel serves for unmatched URLs; keep the two in step. Shows the path that
// missed so a typo is easy to spot. No motion moments.

import { useLocation } from 'react-router-dom'
import useSEO from '../hooks/useSEO'
import { Button, TextLink } from '../components/ui'

const MORE = [
    ['/about', 'About'],
    ['/journey', 'Journey'],
    ['/skills', 'Skills'],
    ['/services', 'Services'],
    ['/blog', 'Notes'],
]

function NotFound() {
    const { pathname } = useLocation()

    useSEO({
        title: '404 - Page Not Found | Gaurav Kumar Yadav',
        description: 'Oops! The page you\'re looking for doesn\'t exist. Navigate back to Gaurav Kumar Yadav\'s portfolio homepage.',
        keywords: '404, Page Not Found, Error Page',
        ogImage: 'https://ggauravky.vercel.app/images/profile.jpg',
    })

    return (
        <main className="pg nf">
            <header className="pg-head page-wrap page-grid">
                <p className="page-rail pg-head__rail"><span>404</span></p>
                <div className="page-main">
                    <h1 className="pg-h1">Not found</h1>
                    <p className="pg-lede">
                        There&rsquo;s no page at <code className="nf-path" translate="no">{pathname}</code>. It may have moved, or the link has a typo.
                    </p>
                    <div className="pg-actions">
                        <Button to="/" arrow>Home</Button>
                        <TextLink to="/projects">Projects</TextLink>
                        <TextLink to="/contact">Contact</TextLink>
                    </div>
                    <ul className="nf-more" aria-label="Other pages">
                        {MORE.map(([to, label]) => (
                            <li key={to}><TextLink to={to} tone="muted">{label}</TextLink></li>
                        ))}
                    </ul>
                </div>
            </header>
        </main>
    )
}

export default NotFound

// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// Lazy routes that render synchronously once their chunk has loaded (D-057).
// React.lazy suspends at least once even for a cached module, which would make
// the first commit an empty Suspense fallback and wipe the static route shell
// (scripts/route-shells.js). boot.jsx awaits preloadRoute() for the URL being
// opened, so React's first commit is the real page and replaces the shell in
// place. Other routes keep plain React.lazy.

import { createElement, lazy } from 'react'

function lazyRoute(load) {
    let Loaded = null
    let pending = null
    const preload = () => {
        pending ??= load().then((module) => {
            Loaded = module.default
            return module
        })
        return pending
    }
    const Lazy = lazy(preload)
    function LazyRoute(props) {
        return createElement(Loaded || Lazy, props)
    }
    LazyRoute.preload = preload
    return LazyRoute
}

export const Projects = lazyRoute(() => import('../pages/Projects'))
export const ProjectDetail = lazyRoute(() => import('../pages/ProjectDetail'))
// P5 pages with a header shell (src/lib/pageHeads.js).
export const About = lazyRoute(() => import('../pages/About'))
export const Skills = lazyRoute(() => import('../pages/Skills'))
export const Journey = lazyRoute(() => import('../pages/Journey'))
export const Services = lazyRoute(() => import('../pages/Services'))
export const ServiceDetail = lazyRoute(() => import('../pages/ServiceDetail'))
export const Blog = lazyRoute(() => import('../pages/Blog'))
export const BlogPost = lazyRoute(() => import('../pages/BlogPost'))
export const Contact = lazyRoute(() => import('../pages/Contact'))

const SHELL_ROUTES = [
    [/^\/projects\/?$/, Projects],
    [/^\/projects\/[^/]+\/?$/, ProjectDetail],
    [/^\/about\/?$/, About],
    [/^\/skills\/?$/, Skills],
    [/^\/journey\/?$/, Journey],
    [/^\/services\/?$/, Services],
    [/^\/blog\/?$/, Blog],
    [/^\/contact\/?$/, Contact],
    [/^\/blog\/[^/]+\/?$/, BlogPost],
    [/^\/(services\/[^/]+|frontend-development|backend-development|full-stack-development|ai-data-science-guidance)\/?$/, ServiceDetail],
]

/** Load the chunk for `pathname` if it has a static shell; resolves either way. */
export function preloadRoute(pathname) {
    const match = SHELL_ROUTES.find(([re]) => re.test(pathname))
    return match ? match[1].preload().catch(() => {}) : Promise.resolve()
}

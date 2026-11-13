// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// Source: https://github.com/ggauravky/Dev-Portfolio
//
// Build-only: every route that gets its own prerendered HTML
// (scripts/route-heads.js). Imports all page data, so keep it out of the client.

import { projectsData } from '../data/projectsData.js'
import { blogsData } from '../data/blogsData.js'
import { archivedBlogsData } from '../data/archivedBlogsData.js'
import { servicesData } from '../data/servicesData.js'
import { STATIC, blogSeo, projectSeo, serviceSeo, staticSeo } from './seo.js'

/** Every route that gets its own prerendered HTML, as [requestPath, seo]. */
export function allRouteSeo() {
    const routes = Object.keys(STATIC).map((path) => [path, staticSeo(path)])
    for (const project of projectsData) routes.push([`/projects/${project.slug}`, projectSeo(project)])
    for (const service of servicesData) {
        const seo = serviceSeo(service)
        routes.push([service.path, seo])
        // Same page under /services/:slug; it canonicalises to the short path.
        routes.push([`/services/${service.slug}`, seo])
    }
    const archived = archivedBlogsData.map((b) => ({ ...b, status: 'archived', publishedDate: b.date }))
    for (const blog of [...blogsData, ...archived]) routes.push([`/blog/${blog.slug}`, blogSeo(blog)])
    return routes
}

import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

import {
  BLOG_CATEGORIES,
  blogsData,
  getBlogBySlug,
  getBlogsByCategory,
  getFeaturedBlogs,
  getPublishedBlogArchive,
  getPublishedBlogs,
  getPublicBlogs,
  getRelatedBlogs,
} from '../src/data/blogsData.js'

const archivedSlugs = [
  'ai-inside-every-tool-future',
  'hidden-ai-war-cybercriminals-2025',
  'traditional-cybersecurity-dead-ai-revolution',
  'certificates-computer-science-2025-guide',
  'learning-to-code-beyond-syntax',
  'stop-asking-which-language-is-best',
  'india-talent-ai-chatgpt-deepseek-future',
]

test('active collection publishes the complete structured Uber article', () => {
  const article = getBlogBySlug('uber-system-design')

  assert.equal(blogsData.length, 2)
  assert.equal(article.status, 'published')
  assert.equal(article.contentType, 'structured')
  assert.equal(article.publishedDate, '2026-10-13')
  assert.equal(article.sections.length, 12)
  assert.equal(article.images.length, 7)
  assert.equal(article.references.length, 8)
  assert.equal(article.coverImage, '/images/blogs/cover.webp')
  assert.match(article.readTime, /^\d+ min read$/)
  assert.ok(article.wordCount > 1700)
})

test('structured article image references resolve uniquely and omit the cover from body blocks', () => {
  const article = blogsData[0]
  const imageIds = article.images.map((image) => image.id)
  const bodyImageIds = article.sections.flatMap((section) => (
    section.blocks.filter((block) => block.type === 'image').map((block) => block.imageId)
  ))

  assert.equal(new Set(imageIds).size, 7)
  assert.deepEqual(bodyImageIds, ['capacity', 'client', 'geospatial', 'matchingengine', 'kringsearch', 'dynamicpricing'])
  assert.equal(bodyImageIds.includes(article.coverImageId), false)
  for (const imageId of bodyImageIds) assert.ok(imageIds.includes(imageId), `missing image record ${imageId}`)
})

test('all archived slugs remain resolvable without entering public discovery', () => {
  const publicSlugs = new Set(getPublicBlogs().map((blog) => blog.slug))

  for (const slug of archivedSlugs) {
    const blog = getBlogBySlug(slug)
    assert.ok(blog, `expected archived route ${slug} to resolve`)
    assert.equal(blog.status, 'archived')
    assert.equal(publicSlugs.has(slug), false)
  }
})

test('published and featured selectors respect publishing state', () => {
  assert.deepEqual(getPublishedBlogs().map((blog) => blog.slug), ['uber-system-design', 'what-is-mcp'])
  assert.deepEqual(getFeaturedBlogs().map((blog) => blog.slug), ['uber-system-design'])
})

test('editorial archive lists published articles newest first', () => {
  const archive = getPublishedBlogArchive()

  assert.deepEqual(archive?.map((blog) => blog.slug), ['what-is-mcp', 'uber-system-design'])
})

test('editorial archive filters by the selected category', () => {
  const archive = getPublishedBlogArchive({
    category: BLOG_CATEGORIES.SYSTEM_DESIGN,
  })

  assert.deepEqual(archive?.map((blog) => blog.slug), ['uber-system-design'])
})

test('editorial archive searches titles, excerpts, categories, and tags', () => {
  const cases = [
    ['model context', ['what-is-mcp']],
    [' SCALE ', ['uber-system-design']],
    ['engineering deep dives', ['what-is-mcp']],
    ['developer tools', ['what-is-mcp']],
  ]

  for (const [query, expectedSlugs] of cases) {
    const archive = getPublishedBlogArchive({ query })
    assert.deepEqual(archive?.map((blog) => blog.slug), expectedSlugs)
  }
})

test('category filtering controls the featured article', () => {
  assert.deepEqual(getBlogsByCategory('All').map((blog) => blog.slug), ['uber-system-design', 'what-is-mcp'])
  assert.deepEqual(getBlogsByCategory(BLOG_CATEGORIES.SYSTEM_DESIGN).map((blog) => blog.slug), ['uber-system-design'])
  assert.deepEqual(
    getBlogsByCategory(BLOG_CATEGORIES.ENGINEERING_DEEP_DIVES).map((blog) => blog.slug),
    ['what-is-mcp'],
  )
  assert.deepEqual(getBlogsByCategory(BLOG_CATEGORIES.HOW_I_BUILT_IT), [])
})

test('MCP guide is a concise seven-section structured article', () => {
  const article = getBlogBySlug('what-is-mcp')

  assert.ok(article)
  assert.equal(article.title, 'What is MCP? A Simple Guide to the Model Context Protocol')
  assert.equal(article.category, BLOG_CATEGORIES.ENGINEERING_DEEP_DIVES)
  assert.equal(article.status, 'published')
  assert.equal(article.featured, false)
  assert.equal(article.publishedDate, '2026-10-14')
  assert.equal(article.sections.length, 7)
  assert.equal(article.images.length, 5)
  assert.ok(article.wordCount >= 650 && article.wordCount <= 900, `unexpected word count ${article.wordCount}`)
  assert.deepEqual(article.tags, [
    'MCP',
    'Model Context Protocol',
    'AI Engineering',
    'AI Tools',
    'Developer Tools',
  ])
})

test('MCP guide references five original local illustrations', () => {
  const article = getBlogBySlug('what-is-mcp')
  const cover = article.images.find((image) => image.id === article.coverImageId)
  const imageIds = article.images.map((image) => image.id)
  const bodyImageIds = article.sections.flatMap((section) => (
    section.blocks.filter((block) => block.type === 'image').map((block) => block.imageId)
  ))

  assert.equal(new Set(imageIds).size, 5)
  assert.deepEqual(bodyImageIds, ['architecture', 'primitives', 'transports', 'example-flow'])
  assert.equal(bodyImageIds.includes(article.coverImageId), false)

  for (const image of article.images) {
    assert.ok(image.alt && image.caption && image.credit && image.sourceUrl)
    assert.equal(image.usageRights, 'original')
    assert.equal(image.src.startsWith('/images/blogs/mcp/'), true)
    assert.equal(image.id === article.coverImageId || image.src.endsWith('.svg'), true)
    assert.equal(fs.existsSync(new URL(`../public${image.src}`, import.meta.url)), true, `missing ${image.src}`)
  }

  assert.equal(cover.src.endsWith('.png'), true)
})

test('related articles contain only other published public records', () => {
  assert.deepEqual(getRelatedBlogs(blogsData[0]), [])
})

test('published Uber article is indexable and retains author-supplied source metadata', () => {
  const article = getBlogBySlug('uber-system-design')
  assert.equal(article.status, 'published')
  assert.equal(article.noindex, undefined)
  assert.equal(article.author, 'Gaurav Kumar Yadav')
  assert.ok(article.images.every((image) => image.alt && image.caption && image.credit && image.sourceUrl))
  assert.ok(article.references.every((reference) => reference.title && reference.publisher && reference.url))
})

test('unknown slugs do not resolve', () => {
  assert.equal(getBlogBySlug('does-not-exist'), undefined)
})

test('sitemap uses real blog dates without fabricating static-page dates', () => {
  const sitemap = fs.readFileSync(new URL('../public/sitemap.xml', import.meta.url), 'utf8')
  const articleEntry = sitemap.match(/<url>\s*<loc>https:\/\/ggauravky\.vercel\.app\/blog\/uber-system-design<\/loc>[\s\S]*?<\/url>/)?.[0]
  const mcpEntry = sitemap.match(/<url>\s*<loc>https:\/\/ggauravky\.vercel\.app\/blog\/what-is-mcp<\/loc>[\s\S]*?<\/url>/)?.[0]
  const aboutEntry = sitemap.match(/<url>\s*<loc>https:\/\/ggauravky\.vercel\.app\/about<\/loc>[\s\S]*?<\/url>/)?.[0]

  assert.match(articleEntry || '', /<lastmod>2026-10-13<\/lastmod>/)
  assert.match(mcpEntry || '', /<lastmod>2026-10-14<\/lastmod>/)
  assert.doesNotMatch(aboutEntry || '', /<lastmod>/)
})

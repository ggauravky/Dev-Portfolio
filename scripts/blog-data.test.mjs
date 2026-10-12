import assert from 'node:assert/strict'
import test from 'node:test'

import {
  BLOG_CATEGORIES,
  blogsData,
  getBlogBySlug,
  getBlogsByCategory,
  getFeaturedBlogs,
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
  assert.equal(blogsData.length, 1)
  assert.equal(blogsData[0].slug, 'uber-system-design')
  assert.equal(blogsData[0].status, 'published')
  assert.equal(blogsData[0].contentType, 'structured')
  assert.equal(blogsData[0].publishedDate, '2026-10-13')
  assert.equal(blogsData[0].sections.length, 12)
  assert.equal(blogsData[0].images.length, 7)
  assert.equal(blogsData[0].references.length, 8)
  assert.equal(blogsData[0].coverImage, '/images/blogs/cover.webp')
  assert.match(blogsData[0].readTime, /^\d+ min read$/)
  assert.ok(blogsData[0].wordCount > 1700)
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
  assert.deepEqual(getPublishedBlogs().map((blog) => blog.slug), ['uber-system-design'])
  assert.deepEqual(getFeaturedBlogs().map((blog) => blog.slug), ['uber-system-design'])
})

test('category filtering controls the featured article', () => {
  assert.deepEqual(getBlogsByCategory('All').map((blog) => blog.slug), ['uber-system-design'])
  assert.deepEqual(getBlogsByCategory(BLOG_CATEGORIES.SYSTEM_DESIGN).map((blog) => blog.slug), ['uber-system-design'])
  assert.deepEqual(getBlogsByCategory(BLOG_CATEGORIES.ENGINEERING_DEEP_DIVES), [])
  assert.deepEqual(getBlogsByCategory(BLOG_CATEGORIES.HOW_I_BUILT_IT), [])
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

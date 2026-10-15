import { archivedBlogsData } from './archivedBlogsData.js'
import uberSystemDesign from './blogs/uber-system-design.json' with { type: 'json' }
import whatIsMcp from './blogs/what-is-mcp.json' with { type: 'json' }

export const BLOG_CATEGORIES = Object.freeze({
  SYSTEM_DESIGN: 'System Design',
  ENGINEERING_DEEP_DIVES: 'Engineering Deep Dives',
  HOW_I_BUILT_IT: 'How I Built It',
})

export const categories = [
  'All',
  BLOG_CATEGORIES.SYSTEM_DESIGN,
  BLOG_CATEGORIES.ENGINEERING_DEEP_DIVES,
  BLOG_CATEGORIES.HOW_I_BUILT_IT,
]

const textFromBlock = (block) => [
  block.title,
  block.text,
  ...(block.items || []),
  block.label,
  block.value,
  block.context,
].filter(Boolean)

export const getArticlePlainText = (article) => (article.sections || [])
  .flatMap((section) => [
    section.title,
    ...section.blocks.flatMap(textFromBlock),
  ])
  .join(' ')

const countWords = (text) => String(text || '')
  .trim()
  .split(/\s+/)
  .filter(Boolean)
  .length

const formatPublishedDate = (date) => {
  if (!date) return null
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`))
}

const normalizeStructuredArticle = (article) => {
  const cover = article.images.find((image) => image.id === article.coverImageId)
  const articleText = getArticlePlainText(article)
  const wordCount = countWords(articleText)

  return Object.freeze({
    ...article,
    contentType: 'structured',
    content: articleText,
    coverImage: cover?.src,
    image: cover?.src,
    imageAlt: cover?.alt,
    ogImage: cover?.src ? `https://ggauravky.vercel.app${cover.src}` : undefined,
    date: formatPublishedDate(article.publishedDate),
    wordCount,
    readTime: `${Math.max(1, Math.ceil(wordCount / 225))} min read`,
    series: null,
  })
}

export const blogsData = [
  normalizeStructuredArticle(uberSystemDesign),
  normalizeStructuredArticle(whatIsMcp),
]

export const getPublicBlogs = () => blogsData.filter((blog) => blog.status === 'published' || blog.status === 'preview')

export const getPublishedBlogs = () => getPublicBlogs().filter((blog) => blog.status === 'published')

export const getFeaturedBlogs = () => getPublicBlogs().filter((blog) => blog.featured)

export const getBlogsByCategory = (category = 'All') => {
  const publicBlogs = getPublicBlogs()
  return category === 'All' ? publicBlogs : publicBlogs.filter((blog) => blog.category === category)
}

export const getBlogBySlug = (slug) => {
  const normalizedSlug = String(slug || '').trim()
  const activeBlog = blogsData.find((blog) => blog.slug === normalizedSlug)
  if (activeBlog) return activeBlog

  const archivedBlog = archivedBlogsData.find((blog) => blog.slug === normalizedSlug)
  return archivedBlog
    ? { ...archivedBlog, status: 'archived', publishedDate: archivedBlog.date }
    : undefined
}

export const getRelatedBlogs = (blog, limit = 3) => {
  if (!blog) return []
  return getPublishedBlogs()
    .filter((candidate) => candidate.id !== blog.id && candidate.category === blog.category)
    .slice(0, limit)
}

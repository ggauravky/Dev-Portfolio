import { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'

const createHeadingId = (text, index) => {
  const slug = String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

  return slug || `section-${index + 1}`
}

function ArticleContent({ content, onHeadingsChange }) {
  const contentRef = useRef(null)

  useEffect(() => {
    const root = contentRef.current
    if (!root) return undefined

    const seenIds = new Map()
    const headings = [...root.querySelectorAll('h2, h3')].map((heading, index) => {
      const baseId = heading.id || createHeadingId(heading.textContent, index)
      const duplicateCount = seenIds.get(baseId) || 0
      const id = duplicateCount === 0 ? baseId : `${baseId}-${duplicateCount + 1}`
      seenIds.set(baseId, duplicateCount + 1)
      heading.id = id
      return { id, text: heading.textContent.trim(), level: Number(heading.tagName.slice(1)) }
    })
    onHeadingsChange(headings)

    const cleanup = [...root.querySelectorAll('pre')].map((pre) => {
      if (pre.querySelector('.article-code-copy')) return () => {}
      const source = pre.querySelector('code')?.textContent || pre.textContent || ''
      const button = document.createElement('button')
      button.type = 'button'
      button.className = 'article-code-copy'
      button.textContent = 'Copy'
      button.setAttribute('aria-label', 'Copy code to clipboard')

      const copyCode = async () => {
        try {
          await navigator.clipboard.writeText(source)
          button.textContent = 'Copied'
          window.setTimeout(() => { button.textContent = 'Copy' }, 1600)
        } catch {
          button.textContent = 'Unable to copy'
          window.setTimeout(() => { button.textContent = 'Copy' }, 1600)
        }
      }

      button.addEventListener('click', copyCode)
      pre.classList.add('article-code-block')
      pre.appendChild(button)

      return () => {
        button.removeEventListener('click', copyCode)
        button.remove()
      }
    })

    return () => cleanup.forEach((dispose) => dispose())
  }, [content, onHeadingsChange])

  return (
    <div
      ref={contentRef}
      className="article-content"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}

ArticleContent.propTypes = {
  content: PropTypes.string.isRequired,
  onHeadingsChange: PropTypes.func.isRequired,
}

export default ArticleContent

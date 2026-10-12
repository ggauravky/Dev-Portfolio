import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'

function ArticleTOC({ headings }) {
  const [activeId, setActiveId] = useState(headings[0]?.id || '')

  useEffect(() => {
    setActiveId(headings[0]?.id || '')
    if (headings.length < 3 || !('IntersectionObserver' in window)) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting)
        if (visible?.target?.id) setActiveId(visible.target.id)
      },
      { rootMargin: '-18% 0px -68% 0px', threshold: 0 },
    )

    headings.forEach(({ id }) => {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [headings])

  if (headings.length < 3) return null

  return (
    <aside className="article-toc" aria-label="Table of contents">
      <p>On this page</p>
      <nav>
        {headings.map((heading) => (
          <a
            key={heading.id}
            href={`#${heading.id}`}
            className={activeId === heading.id ? 'is-active' : ''}
            data-level={heading.level}
          >
            {heading.text}
          </a>
        ))}
      </nav>
    </aside>
  )
}

ArticleTOC.propTypes = {
  headings: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    level: PropTypes.number.isRequired,
  })).isRequired,
}

export default ArticleTOC

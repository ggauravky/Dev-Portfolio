import { useState } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

function EditorialArticleRow({ article, index }) {
  const [imageFailed, setImageFailed] = useState(false)
  const cover = article.images?.find((image) => image.id === article.coverImageId)
  const coverImage = cover || (article.coverImage ? {
    src: article.coverImage,
    alt: article.imageAlt || article.title,
  } : null)
  const headingId = `archive-article-${article.id}`

  return (
    <article className="blog-archive-entry">
      <Link className="blog-archive-link" to={`/blog/${article.slug}`} aria-labelledby={headingId}>
        <div className="blog-archive-index" aria-hidden="true">
          <span>{String(index + 1).padStart(2, '0')}</span>
        </div>

        <p className="blog-archive-category">{article.category}</p>
        <h2 id={headingId} className="blog-archive-title">{article.title}</h2>
        <p className="blog-archive-excerpt">{article.excerpt}</p>

        <div className="blog-archive-media">
          {coverImage && !imageFailed ? (
            <img
              src={coverImage.src}
              alt={coverImage.alt}
              className="blog-archive-image"
              width={coverImage.width || 1600}
              height={coverImage.height || 900}
              loading={index === 0 ? 'eager' : 'lazy'}
              fetchpriority={index === 0 ? 'high' : 'auto'}
              decoding="async"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="blog-archive-image-missing" role="img" aria-label={`No cover available for ${article.title}`}>
              <span>Engineering Notes</span>
            </div>
          )}
        </div>

        <div className="blog-archive-meta">
          <span className="blog-archive-details">
            {article.date ? <time dateTime={article.publishedDate}>{article.date}</time> : null}
            {article.readTime ? <span>{article.readTime}</span> : null}
          </span>
          <span className="blog-archive-read">
            Read note
            <svg viewBox="0 0 32 16" aria-hidden="true">
              <path d="M1 8h28M23 2l6 6-6 6" />
            </svg>
          </span>
        </div>
      </Link>
    </article>
  )
}

EditorialArticleRow.propTypes = {
  article: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    slug: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    excerpt: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    publishedDate: PropTypes.string,
    date: PropTypes.string,
    readTime: PropTypes.string,
    coverImage: PropTypes.string,
    imageAlt: PropTypes.string,
    coverImageId: PropTypes.string,
    images: PropTypes.arrayOf(PropTypes.object),
  }).isRequired,
  index: PropTypes.number.isRequired,
}

export default EditorialArticleRow

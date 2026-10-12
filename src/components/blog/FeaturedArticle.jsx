import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import EditorialImage from './EditorialImage'

function FeaturedArticle({ article }) {
  if (!article) return null
  const cover = article.images?.find((image) => image.id === article.coverImageId)

  return (
    <article className="blog-featured" aria-labelledby={`featured-${article.id}`}>
      <Link className="blog-featured-media" to={`/blog/${article.slug}`} aria-label={`Read ${article.title}`}>
        {cover ? (
          <EditorialImage image={cover} priority className="blog-featured-image" />
        ) : (
          <img
            src={article.coverImage || article.image}
            alt={article.imageAlt || article.title}
            width="1200"
            height="675"
            loading="eager"
            fetchPriority="high"
          />
        )}
      </Link>

      <div className="blog-featured-copy">
        <p className="blog-kicker">Featured article</p>
        <div className="blog-meta-line">
          <span>{article.category}</span>
          {article.date ? <span>{article.date}</span> : null}
          {article.readTime ? <span>{article.readTime}</span> : null}
        </div>
        <h2 id={`featured-${article.id}`}>{article.title}</h2>
        <p>{article.excerpt}</p>
        <Link className="blog-text-link" to={`/blog/${article.slug}`}>
          Read article <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  )
}

FeaturedArticle.propTypes = {
  article: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    slug: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    excerpt: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    status: PropTypes.string,
    coverImage: PropTypes.string,
    image: PropTypes.string,
    imageAlt: PropTypes.string,
    coverImageId: PropTypes.string,
    images: PropTypes.arrayOf(PropTypes.object),
    date: PropTypes.string,
    readTime: PropTypes.string,
  }),
}

export default FeaturedArticle

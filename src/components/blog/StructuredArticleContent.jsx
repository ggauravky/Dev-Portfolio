import { useEffect, useMemo } from 'react'
import PropTypes from 'prop-types'
import EditorialImage from './EditorialImage'

const createSubheadingId = (sectionId, text, index) => {
  const slug = String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

  return `${sectionId}-${slug || `detail-${index + 1}`}`
}

function ArticleFigure({ image }) {
  return (
    <figure className="article-figure">
      <EditorialImage image={image} className="article-diagram" zoomable />
      <figcaption>
        <span>{image.caption}</span>
        <span className="article-image-credit">
          Source: <a href={image.sourceUrl} target="_blank" rel="noopener noreferrer">{image.credit}</a>
          {image.usageRights === 'unverified' ? ' · Usage rights unverified' : ''}
        </span>
      </figcaption>
    </figure>
  )
}

ArticleFigure.propTypes = {
  image: PropTypes.shape({
    src: PropTypes.string.isRequired,
    alt: PropTypes.string.isRequired,
    caption: PropTypes.string.isRequired,
    credit: PropTypes.string.isRequired,
    sourceUrl: PropTypes.string.isRequired,
    usageRights: PropTypes.string,
  }).isRequired,
}

function StructuredArticleContent({ article, onHeadingsChange }) {
  const imagesById = useMemo(
    () => new Map(article.images.map((image) => [image.id, image])),
    [article.images],
  )

  const subheadingIds = useMemo(() => {
    const ids = new Map()
    article.sections.forEach((section) => {
      section.blocks.forEach((block, index) => {
        if (block.type === 'subheading') ids.set(block, createSubheadingId(section.id, block.text, index))
      })
    })
    return ids
  }, [article.sections])

  useEffect(() => {
    const headings = article.sections.flatMap((section) => [
      { id: section.id, text: section.title, level: 2 },
      ...section.blocks
        .filter((block) => block.type === 'subheading')
        .map((block) => ({ id: subheadingIds.get(block), text: block.text, level: 3 })),
    ])
    onHeadingsChange(headings)
  }, [article.sections, onHeadingsChange, subheadingIds])

  const renderBlock = (block, section, index) => {
    const key = `${section.id}-${block.type}-${index}`

    switch (block.type) {
      case 'paragraph':
        return <p key={key}>{block.text}</p>
      case 'list': {
        const List = block.ordered ? 'ol' : 'ul'
        return <List key={key}>{block.items.map((item, itemIndex) => <li key={`${key}-${itemIndex}`}>{item}</li>)}</List>
      }
      case 'subheading':
        return <h3 key={key} id={subheadingIds.get(block)}>{block.text}</h3>
      case 'metric':
        return (
          <dl key={key} className="article-metric">
            <div><dt>{block.label}</dt><dd>{block.value}</dd></div>
            <p>{block.context}</p>
          </dl>
        )
      case 'note':
        return (
          <aside key={key} className="article-note" aria-label={block.title || 'Article note'}>
            {block.title ? <strong>{block.title}</strong> : null}
            <p>{block.text}</p>
          </aside>
        )
      case 'image': {
        if (block.imageId === article.coverImageId) return null
        const image = imagesById.get(block.imageId)
        return image ? <ArticleFigure key={key} image={image} /> : null
      }
      default:
        return null
    }
  }

  return (
    <div className="article-content article-content-structured">
      {article.sections.map((section) => (
        <section key={section.id} className="article-section" aria-labelledby={section.id}>
          <h2 id={section.id}>{section.title}</h2>
          {section.blocks.map((block, index) => renderBlock(block, section, index))}
        </section>
      ))}

      <section className="article-references" aria-labelledby="article-references-title">
        <h2 id="article-references-title">Sources and further reading</h2>
        <ol>
          {article.references.map((reference) => (
            <li key={reference.url}>
              <a href={reference.url} target="_blank" rel="noopener noreferrer">{reference.title}</a>
              <span>{reference.publisher}</span>
            </li>
          ))}
        </ol>
      </section>

      {article.disclaimer ? <p className="article-disclaimer">{article.disclaimer}</p> : null}
    </div>
  )
}

StructuredArticleContent.propTypes = {
  article: PropTypes.shape({
    coverImageId: PropTypes.string.isRequired,
    images: PropTypes.arrayOf(PropTypes.object).isRequired,
    sections: PropTypes.arrayOf(PropTypes.object).isRequired,
    references: PropTypes.arrayOf(PropTypes.object).isRequired,
    disclaimer: PropTypes.string,
  }).isRequired,
  onHeadingsChange: PropTypes.func.isRequired,
}

export default StructuredArticleContent

import { useState } from 'react'
import PropTypes from 'prop-types'
import { Link2 } from 'lucide-react'

function ArticleShare({ title }) {
  const [copyLabel, setCopyLabel] = useState('Copy link')
  const pageUrl = globalThis.location?.href || ''
  const encodedUrl = encodeURIComponent(pageUrl)
  const encodedText = encodeURIComponent(`${title} by Gaurav Kumar Yadav`)

  const copyLink = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(pageUrl)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = pageUrl
        textarea.setAttribute('readonly', '')
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        const copied = document.execCommand('copy')
        textarea.remove()
        if (!copied) throw new Error('Copy command was unavailable')
      }
      setCopyLabel('Copied')
    } catch {
      setCopyLabel('Unable to copy')
    }
    window.setTimeout(() => setCopyLabel('Copy link'), 1600)
  }

  return (
    <div className="article-share" role="group" aria-label="Share this article">
      <span className="article-share-label">Share</span>
      <a href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`} target="_blank" rel="noopener noreferrer" aria-label="Share this article on X or Twitter">
        <span>X / Twitter</span>
      </a>
      <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`} target="_blank" rel="noopener noreferrer" aria-label="Share this article on LinkedIn">
        <span>LinkedIn</span>
      </a>
      <button type="button" onClick={copyLink} aria-label="Copy article link">
        <Link2 size={16} aria-hidden="true" />
        <span aria-live="polite">{copyLabel}</span>
      </button>
    </div>
  )
}

ArticleShare.propTypes = {
  title: PropTypes.string.isRequired,
}

export default ArticleShare

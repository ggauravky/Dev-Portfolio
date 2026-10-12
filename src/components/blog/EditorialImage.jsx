import { useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { Maximize2, X } from 'lucide-react'

function EditorialImage({ image, className = '', priority = false, zoomable = false }) {
  const [failed, setFailed] = useState(false)
  const dialogRef = useRef(null)

  const imageElement = failed ? (
    <div className={`editorial-image-fallback ${className}`} role="img" aria-label={`Image unavailable: ${image.alt}`}>
      <span>Diagram unavailable</span>
      <small>{image.src}</small>
    </div>
  ) : (
    <img
      src={image.src}
      alt={image.alt}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
      onError={() => setFailed(true)}
    />
  )

  if (!zoomable || failed) return imageElement

  const openDialog = () => dialogRef.current?.showModal()
  const closeDialog = () => dialogRef.current?.close()

  return (
    <>
      <button type="button" className="editorial-image-trigger" onClick={openDialog} aria-label={`Expand diagram: ${image.alt}`}>
        {imageElement}
        <span aria-hidden="true"><Maximize2 size={16} /> Expand</span>
      </button>
      <dialog ref={dialogRef} className="editorial-image-dialog" onClick={(event) => {
        if (event.target === dialogRef.current) closeDialog()
      }}>
        <button type="button" onClick={closeDialog} aria-label="Close expanded diagram"><X size={20} /></button>
        <img src={image.src} alt={image.alt} />
      </dialog>
    </>
  )
}

EditorialImage.propTypes = {
  image: PropTypes.shape({
    src: PropTypes.string.isRequired,
    alt: PropTypes.string.isRequired,
  }).isRequired,
  className: PropTypes.string,
  priority: PropTypes.bool,
  zoomable: PropTypes.bool,
}

export default EditorialImage

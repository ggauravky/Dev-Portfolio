import PropTypes from 'prop-types'

function BlogCategoryNav({ categories, selectedCategory, onSelect }) {
  return (
    <div className="blog-category-scroll" aria-label="Filter writing by topic">
      <div className="blog-category-nav" role="tablist" aria-label="Writing categories">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            role="tab"
            aria-selected={selectedCategory === category}
            className="blog-category-tab"
            onClick={() => onSelect(category)}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  )
}

BlogCategoryNav.propTypes = {
  categories: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedCategory: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired,
}

export default BlogCategoryNav

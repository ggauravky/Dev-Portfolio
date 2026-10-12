import PropTypes from 'prop-types'

const topics = [
  {
    number: '01',
    title: 'System Design',
    description: 'Architecture, scalability, data flow, and engineering trade-offs.',
  },
  {
    number: '02',
    title: 'Engineering Deep Dives',
    description: 'Practical explanations of tools, patterns, and technologies.',
  },
  {
    number: '03',
    title: 'How I Built It',
    description: 'Design decisions, implementation details, and lessons from my projects.',
  },
]

function TopicExplorer({ onSelect }) {
  return (
    <section className="blog-topics" aria-labelledby="explore-topics-title">
      <div className="blog-section-heading">
        <p className="blog-kicker">Browse the archive</p>
        <h2 id="explore-topics-title">Explore by topic</h2>
      </div>

      <div className="blog-topic-grid">
        {topics.map((topic) => (
          <button key={topic.title} type="button" className="blog-topic" onClick={() => onSelect(topic.title)}>
            <span className="blog-topic-number">{topic.number}</span>
            <span className="blog-topic-copy">
              <strong>{topic.title}</strong>
              <span>{topic.description}</span>
            </span>
            <span className="blog-topic-arrow" aria-hidden="true">↗</span>
          </button>
        ))}
      </div>
    </section>
  )
}

TopicExplorer.propTypes = {
  onSelect: PropTypes.func.isRequired,
}

export default TopicExplorer

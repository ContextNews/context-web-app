function StoryCard({ story, onSelect }) {
  const sourceCount = new Set(story.articles.map((article) => article.source)).size
  const handleSelect = () => {
    if (onSelect) {
      onSelect(story)
    }
  }

  return (
    <div className="story-card-group">
      <div
        className="story-card"
        role="button"
        tabIndex={0}
        onClick={handleSelect}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            handleSelect()
          }
        }}
      >
        <div className="story-media" />
        <div className="story-content">
          <div className="story-row story-title-row">
            <div className="story-title-block">
              <h2 className="story-title">{story.title}</h2>
              {story.primary_location ? (
                <span className="story-location">{story.primary_location}</span>
              ) : null}
            </div>
          </div>
          <div className="story-row story-meta-row">
            <div className="story-meta-left">
              <span className="story-meta">
                {story.articles.length} article
                {story.articles.length !== 1 ? 's' : ''}
              </span>
              <span className="story-meta">
                {sourceCount} source{sourceCount !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="story-meta-right" aria-hidden="true">
              <span className="story-meta-chevron" />
            </div>
          </div>
        </div>
      </div>
      {story.sub_stories?.map((subStory, index) => (
        <div
          key={subStory.story_id}
          className={index === 0 ? 'sub-story-row first' : 'sub-story-row'}
        >
          <div className="sub-story-connector" aria-hidden="true" />
          <div className="sub-story-card">{subStory.title}</div>
        </div>
      ))}
    </div>
  )
}

export default StoryCard

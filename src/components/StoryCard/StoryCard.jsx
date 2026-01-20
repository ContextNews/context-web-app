import styles from './StoryCard.module.css'

function StoryCard({ story, onSelect }) {
  const sourceCount = new Set(story.articles.map((article) => article.source)).size
  const handleSelect = () => {
    if (onSelect) {
      onSelect(story)
    }
  }

  return (
    <div className={styles.group}>
      <div
        className={styles.card}
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
        <div className={styles.media} />
        <div className={styles.content}>
          <div className={`${styles.row} ${styles.titleRow}`}>
            <div className={styles.titleBlock}>
              <h2 className={styles.title}>{story.title}</h2>
              {story.primary_location ? (
                <span className={styles.location}>{story.primary_location}</span>
              ) : null}
            </div>
          </div>
          <div className={`${styles.row} ${styles.metaRow}`}>
            <div className={styles.metaLeft}>
              <span className={styles.meta}>
                {story.articles.length} article
                {story.articles.length !== 1 ? 's' : ''}
              </span>
              <span className={styles.meta}>
                {sourceCount} source{sourceCount !== 1 ? 's' : ''}
              </span>
            </div>
            <div className={styles.metaRight} aria-hidden="true">
              <span className={styles.chevron} />
            </div>
          </div>
        </div>
      </div>
      {story.sub_stories?.map((subStory, index) => (
        <div
          key={subStory.story_id}
          className={`${styles.subStoryRow} ${index === 0 ? styles.subStoryRowFirst : ''}`}
        >
          <div className={styles.subStoryConnector} aria-hidden="true" />
          <div className={styles.subStoryCard}>{subStory.title}</div>
        </div>
      ))}
    </div>
  )
}

export default StoryCard

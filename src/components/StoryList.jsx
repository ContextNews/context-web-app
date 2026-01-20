import { getStoryTimestamp } from '../lib/dates'
import StoryCard from './StoryCard'
import styles from './StoryList.module.css'

function StoryList({ storiesData = [], loadError = '', onStorySelect }) {
  const sortedStories = [...storiesData].sort((a, b) => {
    const timeDelta = getStoryTimestamp(b) - getStoryTimestamp(a)
    if (timeDelta !== 0) return timeDelta
    return (b.articles?.length || 0) - (a.articles?.length || 0)
  })

  return (
    <div className={styles.container}>
      {loadError ? (
        <div className={styles.error}>
          Unable to load stories from the API. Showing local data instead.
        </div>
      ) : null}
      {sortedStories.map((story) => (
        <StoryCard key={story.story_id} story={story} onSelect={onStorySelect} />
      ))}
    </div>
  )
}

export default StoryList

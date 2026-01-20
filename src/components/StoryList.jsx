import { getStoryTimestamp } from '../lib/dates'
import StoryCard from './StoryCard'

function StoryList({ storiesData = [], loadError = '', onStorySelect }) {
  const sortedStories = [...storiesData].sort((a, b) => {
    const timeDelta = getStoryTimestamp(b) - getStoryTimestamp(a)
    if (timeDelta !== 0) return timeDelta
    return (b.articles?.length || 0) - (a.articles?.length || 0)
  })

  return (
    <div className="story-list">
      {loadError ? (
        <div className="story-list-error">
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

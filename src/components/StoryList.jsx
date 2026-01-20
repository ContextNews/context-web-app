import StoryCard from './StoryCard'

const getStoryTimestamp = (story) => {
  const value = story?.updated_at || story?.generated_at || ''
  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? 0 : parsed
}

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

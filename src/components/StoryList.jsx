import stories from '../data/stories.json'
import StoryCard from './StoryCard'

function StoryList() {
  const sortedStories = [...stories].sort(
    (a, b) => b.articles.length - a.articles.length
  )

  return (
    <div>
      {sortedStories.map((story) => (
        <StoryCard key={story.story_id} story={story} />
      ))}
    </div>
  )
}

export default StoryList

import { useEffect, useRef } from 'react'
import { getStoryTimestamp } from '../../lib/dates'
import StoryCard from '../StoryCard'
import styles from './StoryList.module.css'

function StoryList({ storiesData = [], loadError = '', onStorySelect, hasMore, isLoadingMore, onLoadMore }) {
  const sentinelRef = useRef(null)

  const displayStories = loadError
    ? [...storiesData].sort((a, b) => {
        const timeDelta = getStoryTimestamp(b) - getStoryTimestamp(a)
        if (timeDelta !== 0) return timeDelta
        return (b.articles?.length || 0) - (a.articles?.length || 0)
      })
    : storiesData

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
        onLoadMore()
      }
    })

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, isLoadingMore, onLoadMore])

  return (
    <div className={styles.container}>
      {loadError ? (
        <div className={styles.error}>
          Unable to load stories from the API. Showing local data instead.
        </div>
      ) : null}
      {displayStories.map((story) => (
        <StoryCard key={story.story_id} story={story} onSelect={onStorySelect} />
      ))}
      {isLoadingMore && <div className={styles.loader}>Loading...</div>}
      <div ref={sentinelRef} />
    </div>
  )
}

export default StoryList

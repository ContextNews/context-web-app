import { useEffect, useState } from 'react'
import NewsMap from '../components/NewsMap'
import StoryList from '../components/StoryList'
import StoryView from '../components/StoryView'
import stories from '../data/stories.json'
import { buildApiUrl, hasApiBase } from '../lib/api'

function NewsPage() {
  const [storiesData, setStoriesData] = useState([])
  const [loadError, setLoadError] = useState('')
  const [selectedStory, setSelectedStory] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function loadStories() {
      if (!hasApiBase) {
        setStoriesData(stories)
        return
      }

      try {
        const response = await fetch(buildApiUrl('/stories/'))
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`)
        }
        const data = await response.json()

        if (isMounted) {
          setStoriesData(Array.isArray(data) ? data : [])
        }
      } catch (error) {
        if (isMounted) {
          setLoadError(error instanceof Error ? error.message : 'Request failed')
          setStoriesData(stories)
        }
      }
    }

    loadStories()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="app-container news-page">
      <div className="landing-nav">
        <div className="landing-nav-title">Context</div>
      </div>
      <div className="news-content">
        <div className="left-panel">
          {selectedStory ? (
            <StoryView
              story={selectedStory}
              onBack={() => setSelectedStory(null)}
            />
          ) : (
            <StoryList
              storiesData={storiesData}
              loadError={loadError}
              onStorySelect={setSelectedStory}
            />
          )}
        </div>
        <div className="right-panel">
          <div className="news-right-top">
            <NewsMap stories={storiesData} />
          </div>
          <div className="news-right-bottom" />
        </div>
      </div>
    </div>
  )
}

export default NewsPage

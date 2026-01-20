import { useEffect, useState } from 'react'
import NewsMap from '../../components/NewsMap'
import StoryList from '../../components/StoryList'
import StoryView from '../../components/StoryView'
import stories from '../../data/stories.json'
import { buildApiUrl, hasApiBase } from '../../lib/api'
import styles from './NewsPage.module.css'

function NewsPage() {
  const [storiesData, setStoriesData] = useState([])
  const [loadError, setLoadError] = useState('')
  const [selectedStory, setSelectedStory] = useState(null)
  const [sourcesData, setSourcesData] = useState([])

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

  useEffect(() => {
    let isMounted = true

    async function loadSources() {
      if (!hasApiBase) {
        setSourcesData([])
        return
      }

      try {
        const response = await fetch(buildApiUrl('/sources_data'))
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`)
        }
        const data = await response.json()

        if (isMounted) {
          setSourcesData(Array.isArray(data) ? data : [])
        }
      } catch (error) {
        if (isMounted) {
          setSourcesData([])
        }
      }
    }

    loadSources()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className={styles.container}>
      <div className={styles.nav}>
        <div className={styles.navTitle}>Context</div>
      </div>
      <div className={styles.content}>
        <div className={styles.leftPanel}>
          {selectedStory ? (
            <StoryView
              story={selectedStory}
              onBack={() => setSelectedStory(null)}
              sourcesData={sourcesData}
            />
          ) : (
            <StoryList
              storiesData={storiesData}
              loadError={loadError}
              onStorySelect={setSelectedStory}
            />
          )}
        </div>
        <div className={styles.rightPanel}>
          <div className={styles.rightTop}>
            <NewsMap stories={storiesData} />
          </div>
          <div className={styles.rightBottom} />
        </div>
      </div>
    </div>
  )
}

export default NewsPage

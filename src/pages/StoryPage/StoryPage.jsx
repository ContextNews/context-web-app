import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import NavBar from '../../components/NavBar'
import StoryMap from '../../components/StoryMap'
import StoryView from '../../components/StoryView'
import StoryViewEntities from '../../components/StoryViewEntities'
import { apiUrl } from '../../lib/api'
import styles from './StoryPage.module.css'

function StoryPage() {
  const navigate = useNavigate()
  const { storyId } = useParams()

  const [story, setStory] = useState(null)
  const [sourcesData, setSourcesData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isNotFound, setIsNotFound] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadStory() {
      setIsLoading(true)
      setIsNotFound(false)
      setStory(null)

      if (!storyId) {
        if (isMounted) {
          setIsNotFound(true)
          setIsLoading(false)
        }
        return
      }

      try {
        const url = apiUrl(`/news/stories/${encodeURIComponent(storyId)}`)
        const response = await fetch(url)

        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`)
        }

        const data = await response.json()
        if (!isMounted) return

        if (!data || !data.story_id) {
          setIsNotFound(true)
          setStory(null)
        } else {
          setStory(data)
        }
      } catch (error) {
        if (isMounted) {
          console.error('[StoryPage] Story request failed', error)
          setIsNotFound(true)
          setStory(null)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadStory()

    return () => {
      isMounted = false
    }
  }, [storyId])

  useEffect(() => {
    let isMounted = true

    async function loadSources() {
      try {
        const url = apiUrl('/news/sources')
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`)
        }
        const data = await response.json()

        if (isMounted) {
          setSourcesData(Array.isArray(data) ? data : [])
        }
      } catch (error) {
        if (isMounted) {
          console.error('[StoryPage] Sources request failed', error)
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
      <NavBar />
      <div className={styles.content}>
        <div className={styles.leftPanel}>
          {isLoading ? (
            <div className={styles.status}>Loading story...</div>
          ) : null}

          {!isLoading && isNotFound ? (
            <div className={styles.statusWrap}>
              <div className={styles.statusTitle}>Story not found</div>
              <button
                type="button"
                className={styles.backButton}
                onClick={() => navigate('/news')}
              >
                Back to stories
              </button>
            </div>
          ) : null}

          {!isLoading && !isNotFound && story ? (
            <StoryView
              story={story}
              onBack={() => navigate('/news')}
              sourcesData={sourcesData}
            />
          ) : null}
        </div>
        <div className={styles.rightPanel}>
          {!isLoading && !isNotFound && story ? (
            <div className={styles.storyRightLayout}>
              <div className={styles.storyRightTopRow}>
                <div className={styles.storyRightBox}>
                  <StoryViewEntities story={story} />
                </div>
                <div className={styles.storyRightBox}>
                  <StoryMap story={story} />
                </div>
              </div>
              <div className={styles.storyRightBox} />
            </div>
          ) : (
            <div className={styles.rightPlaceholder} />
          )}
        </div>
      </div>
    </div>
  )
}

export default StoryPage

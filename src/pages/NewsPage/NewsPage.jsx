import { useEffect, useMemo, useState } from 'react'
import NewsMap from '../../components/NewsMap'
import LineGraph from '../../components/LineGraph'
import StoryList from '../../components/StoryList'
import StoryView from '../../components/StoryView'
import NewsFilters from '../../components/NewsFilters'
import stories from '../../data/stories.json'
import { apiUrl } from '../../lib/api'
import styles from './NewsPage.module.css'

function NewsPage() {
  const [storiesData, setStoriesData] = useState([])
  const [loadError, setLoadError] = useState('')
  const [selectedStory, setSelectedStory] = useState(null)
  const [sourcesData, setSourcesData] = useState([])
  const [topLocations, setTopLocations] = useState([])
  const [topPeople, setTopPeople] = useState([])

  useEffect(() => {
    let isMounted = true

    async function loadStories() {
      console.info('[NewsPage] API base', { apiBase: apiUrl('') })

      try {
        const url = apiUrl('/news/stories')
        console.info('[NewsPage] Fetching stories', { url })
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`)
        }
        const data = await response.json()

        if (isMounted) {
          console.info('[NewsPage] Stories loaded', {
            count: Array.isArray(data) ? data.length : 0,
          })
          setStoriesData(Array.isArray(data) ? data : [])
        }
      } catch (error) {
        if (isMounted) {
          console.error('[NewsPage] Stories request failed', error)
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
      try {
        const url = apiUrl('/news/sources')
        console.info('[NewsPage] Fetching sources_data', { url })
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`)
        }
        const data = await response.json()

        if (isMounted) {
          console.info('[NewsPage] Sources loaded', {
            count: Array.isArray(data) ? data.length : 0,
          })
          setSourcesData(Array.isArray(data) ? data : [])
        }
      } catch (error) {
        if (isMounted) {
          console.error('[NewsPage] Sources request failed', error)
          setSourcesData([])
        }
      }
    }

    loadSources()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    async function loadTopLocations() {
      try {
        const url = apiUrl('/news/analytics/top-locations')
        console.info('[NewsPage] Fetching top-locations', { url })
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`)
        }
        const data = await response.json()

        if (isMounted) {
          console.info('[NewsPage] Top locations loaded', {
            count: Array.isArray(data) ? data.length : 0,
          })
          setTopLocations(Array.isArray(data) ? data : [])
        }
      } catch (error) {
        if (isMounted) {
          console.error('[NewsPage] Top locations request failed', error)
          setTopLocations([])
        }
      }
    }

    loadTopLocations()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    async function loadTopPeople() {
      try {
        const url = apiUrl('/news/analytics/top-people')
        console.info('[NewsPage] Fetching top-people', { url })
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`)
        }
        const data = await response.json()

        if (isMounted) {
          console.info('[NewsPage] Top people loaded', {
            count: Array.isArray(data) ? data.length : 0,
          })
          setTopPeople(Array.isArray(data) ? data : [])
        }
      } catch (error) {
        if (isMounted) {
          console.error('[NewsPage] Top people request failed', error)
          setTopPeople([])
        }
      }
    }

    loadTopPeople()

    return () => {
      isMounted = false
    }
  }, [])

  const topLocationSeries = useMemo(() => {
    if (!Array.isArray(topLocations) || topLocations.length === 0) {
      return null
    }

    // New API returns: { type: "location", name: "Country", count: 12 }
    const sorted = [...topLocations]
      .filter((entry) => entry?.name && typeof entry?.count === 'number')
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    if (sorted.length === 0) {
      return null
    }

    // Create a single-point dataset for each location
    const labels = ['Mentions']
    const datasets = sorted.map((entry) => ({
      label: entry.name,
      data: [entry.count],
    }))

    return { labels, datasets }
  }, [topLocations])

  const topPeopleSeries = useMemo(() => {
    if (!Array.isArray(topPeople) || topPeople.length === 0) {
      return null
    }

    // New API returns: { type: "person", name: "Person Name", count: 12 }
    const sorted = [...topPeople]
      .filter((entry) => entry?.name && typeof entry?.count === 'number')
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    if (sorted.length === 0) {
      return null
    }

    // Create a single-point dataset for each person
    const labels = ['Mentions']
    const datasets = sorted.map((entry) => ({
      label: entry.name,
      data: [entry.count],
    }))

    return { labels, datasets }
  }, [topPeople])

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
            <>
              <NewsFilters />
              <StoryList
                storiesData={storiesData}
                loadError={loadError}
                onStorySelect={setSelectedStory}
              />
            </>
          )}
        </div>
        <div className={styles.rightPanel}>
          <div className={styles.rightTop}>
            <NewsMap stories={storiesData} topLocations={topLocations} />
          </div>
          <div className={styles.rightBottom}>
            <div className={styles.bottomInner}>
              <div className={styles.bottomRow}>
                <LineGraph
                  datasets={topLocationSeries?.datasets}
                  labels={topLocationSeries?.labels}
                />
              </div>
              <div className={styles.bottomRow}>
                <LineGraph
                  datasets={topPeopleSeries?.datasets}
                  labels={topPeopleSeries?.labels}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewsPage

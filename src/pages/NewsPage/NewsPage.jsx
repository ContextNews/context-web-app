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
  const [period, setPeriod] = useState('today')

  useEffect(() => {
    let isMounted = true

    async function loadStories() {
      console.info('[NewsPage] API base', { apiBase: apiUrl('') })

      try {
        const url = apiUrl(`/news/stories?period=${period}`)
        console.info('[NewsPage] Fetching stories', { url, period })
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
  }, [period])

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
        const url = apiUrl('/news/analytics/top-locations?interval=hourly')
        console.info('[NewsPage] Fetching top-locations', { url })
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`)
        }
        const data = await response.json()

        if (isMounted) {
          console.info('[NewsPage] Top locations loaded', {
            count: Array.isArray(data) ? data.length : 0,
            data,
          })
          if (Array.isArray(data) && data.length > 0) {
            console.info('[NewsPage] Top locations history sample', {
              firstEntity: data[0]?.name,
              historyLength: data[0]?.history?.length,
              history: data[0]?.history,
            })
          }
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
        const url = apiUrl('/news/analytics/top-people?interval=hourly')
        console.info('[NewsPage] Fetching top-people', { url })
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`)
        }
        const data = await response.json()

        if (isMounted) {
          console.info('[NewsPage] Top people loaded', {
            count: Array.isArray(data) ? data.length : 0,
            data,
          })
          if (Array.isArray(data) && data.length > 0) {
            console.info('[NewsPage] Top people history sample', {
              firstEntity: data[0]?.name,
              historyLength: data[0]?.history?.length,
              history: data[0]?.history,
            })
          }
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

    // Filter to entries that have historical data
    const withHistory = topLocations.filter(
      (entry) =>
        entry?.name &&
        typeof entry?.count === 'number' &&
        Array.isArray(entry?.history) &&
        entry.history.length > 0
    )

    if (withHistory.length === 0) {
      return null
    }

    // Sort by total count and take top 5
    const sorted = [...withHistory].sort((a, b) => b.count - a.count).slice(0, 5)

    // Collect all unique timestamps and sort them
    const allTimestamps = new Set()
    sorted.forEach((entry) => {
      entry.history.forEach((point) => {
        allTimestamps.add(point.timestamp)
      })
    })
    const sortedTimestamps = [...allTimestamps].sort()

    console.info('[NewsPage] topLocationSeries processing', {
      sortedTimestamps,
      entityNames: sorted.map((e) => e.name),
    })

    // Create labels from timestamps (format as hour)
    const labels = sortedTimestamps.map((ts) => {
      const date = new Date(ts)
      return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })
    })

    console.info('[NewsPage] topLocationSeries labels', { labels })

    // Create datasets, filling in 0 for missing timestamps
    const datasets = sorted.map((entry) => {
      const countByTimestamp = new Map(
        entry.history.map((point) => [point.timestamp, point.count])
      )
      return {
        label: entry.name,
        data: sortedTimestamps.map((ts) => countByTimestamp.get(ts) || 0),
      }
    })

    return { labels, datasets }
  }, [topLocations])

  const topPeopleSeries = useMemo(() => {
    if (!Array.isArray(topPeople) || topPeople.length === 0) {
      return null
    }

    // Filter to entries that have historical data
    const withHistory = topPeople.filter(
      (entry) =>
        entry?.name &&
        typeof entry?.count === 'number' &&
        Array.isArray(entry?.history) &&
        entry.history.length > 0
    )

    if (withHistory.length === 0) {
      return null
    }

    // Sort by total count and take top 5
    const sorted = [...withHistory].sort((a, b) => b.count - a.count).slice(0, 5)

    // Collect all unique timestamps and sort them
    const allTimestamps = new Set()
    sorted.forEach((entry) => {
      entry.history.forEach((point) => {
        allTimestamps.add(point.timestamp)
      })
    })
    const sortedTimestamps = [...allTimestamps].sort()

    console.info('[NewsPage] topPeopleSeries processing', {
      sortedTimestamps,
      entityNames: sorted.map((e) => e.name),
    })

    // Create labels from timestamps (format as hour)
    const labels = sortedTimestamps.map((ts) => {
      const date = new Date(ts)
      return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })
    })

    console.info('[NewsPage] topPeopleSeries labels', { labels })

    // Create datasets, filling in 0 for missing timestamps
    const datasets = sorted.map((entry) => {
      const countByTimestamp = new Map(
        entry.history.map((point) => [point.timestamp, point.count])
      )
      return {
        label: entry.name,
        data: sortedTimestamps.map((ts) => countByTimestamp.get(ts) || 0),
      }
    })

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
              <NewsFilters period={period} onPeriodChange={setPeriod} />
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
                  allowFallback={false}
                />
              </div>
              <div className={styles.bottomRow}>
                <LineGraph
                  datasets={topPeopleSeries?.datasets}
                  labels={topPeopleSeries?.labels}
                  allowFallback={false}
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

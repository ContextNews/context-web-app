import { useEffect, useMemo, useState } from 'react'
import AnalyticsOverview from '../../components/AnalyticsOverview'
import StoryList from '../../components/StoryList'
import StoryView from '../../components/StoryView'
import StoryViewEntities from '../../components/StoryViewEntities'
import StoryMap from '../../components/StoryMap'
import NewsFilters from '../../components/NewsFilters'
import NavBar from '../../components/NavBar'
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
  const [region, setRegion] = useState('')
  const [topic, setTopic] = useState('')

  const handleStorySelect = async (story) => {
    const storyId = story?.story_id ?? story?.id ?? null
    console.info('[NewsPage] Story selected', {
      storyId,
      title: story?.title ?? null,
    })
    setSelectedStory(story)

    if (storyId) {
      try {
        const url = apiUrl(`/news/stories/${storyId}`)
        const response = await fetch(url)
        if (response.ok) {
          const detail = await response.json()
          setSelectedStory(detail)
        }
      } catch (error) {
        console.error('[NewsPage] Story detail fetch failed', error)
      }
    }
  }

  useEffect(() => {
    let isMounted = true

    async function loadStories() {
      console.info('[NewsPage] API base', { apiBase: apiUrl('') })

      try {
        const params = new URLSearchParams({ period })
        if (region) {
          params.set('region', region)
        }
        if (topic) {
          params.set('topic', topic)
        }
        const url = apiUrl(`/news/stories?${params}`)
        console.info('[NewsPage] Fetching stories', { url, period, region, topic })
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
  }, [period, region, topic])

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
      <NavBar />
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
              <NewsFilters region={region} onRegionChange={setRegion} period={period} onPeriodChange={setPeriod} topic={topic} onTopicChange={setTopic} />
              <StoryList
                storiesData={storiesData}
                loadError={loadError}
                onStorySelect={handleStorySelect}
              />
            </>
          )}
        </div>
        <div className={styles.rightPanel}>
          {selectedStory ? (
            <div className={styles.storyRightLayout}>
              <div className={styles.storyRightTopRow}>
                <div className={styles.storyRightBox}>
                  <StoryViewEntities story={selectedStory} />
                </div>
                <div className={styles.storyRightBox}>
                  <StoryMap story={selectedStory} />
                </div>
              </div>
              <div className={styles.storyRightBox} />
            </div>
          ) : (
            <AnalyticsOverview
              stories={storiesData}
              topLocations={topLocations}
              topLocationSeries={topLocationSeries}
              topPeopleSeries={topPeopleSeries}
              region={region}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default NewsPage

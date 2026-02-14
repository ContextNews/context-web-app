import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AnalyticsOverview from '../../components/AnalyticsOverview'
import StoryList from '../../components/StoryList'
import NewsFilters from '../../components/NewsFilters'
import NavBar from '../../components/NavBar'
import stories from '../../data/stories.json'
import { apiUrl } from '../../lib/api'
import styles from './NewsPage.module.css'

const ANALYTICS_PERIOD = 'last_24_hours'
const PAGE_SIZE = 25

function NewsPage() {
  const navigate = useNavigate()
  const [storiesData, setStoriesData] = useState([])
  const [loadError, setLoadError] = useState('')
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [topLocations, setTopLocations] = useState([])
  const [topPeople, setTopPeople] = useState([])
  const [period, setPeriod] = useState('today')
  const [region, setRegion] = useState('')
  const [topic, setTopic] = useState('')

  const handleStorySelect = (story) => {
    const storyId = story?.story_id ?? story?.id ?? null
    if (!storyId) return
    navigate(`/news/story/${encodeURIComponent(storyId)}`)
  }

  useEffect(() => {
    let isMounted = true

    async function loadStories() {
      setStoriesData([])
      setOffset(0)
      setHasMore(false)
      setLoadError('')

      try {
        const params = new URLSearchParams({ period, limit: PAGE_SIZE, offset: 0 })
        if (region) {
          params.set('region', region)
        }
        if (topic) {
          params.set('topic', topic)
        }
        const url = apiUrl(`/news/stories/news-feed?${params}`)
        console.info('[NewsPage] Fetching stories', { url, period, region, topic })
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`)
        }
        const data = await response.json()

        if (isMounted) {
          const loaded = Array.isArray(data.stories) ? data.stories : []
          console.info('[NewsPage] Stories loaded', { count: loaded.length, has_more: data.has_more })
          setStoriesData(loaded)
          setHasMore(!!data.has_more)
          setOffset(PAGE_SIZE)
        }
      } catch (error) {
        if (isMounted) {
          console.error('[NewsPage] Stories request failed', error)
          setLoadError(error instanceof Error ? error.message : 'Request failed')
          setStoriesData(stories)
          setHasMore(false)
        }
      }
    }

    loadStories()

    return () => {
      isMounted = false
    }
  }, [period, region, topic])

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore) return
    setIsLoadingMore(true)

    try {
      const params = new URLSearchParams({ period, limit: PAGE_SIZE, offset })
      if (region) params.set('region', region)
      if (topic) params.set('topic', topic)
      const url = apiUrl(`/news/stories/news-feed?${params}`)
      console.info('[NewsPage] Loading more stories', { url, offset })
      const response = await fetch(url)
      if (!response.ok) throw new Error(`Request failed: ${response.status}`)
      const data = await response.json()

      const newStories = Array.isArray(data.stories) ? data.stories : []
      setStoriesData((prev) => [...prev, ...newStories])
      setHasMore(!!data.has_more)
      setOffset((prev) => prev + PAGE_SIZE)
    } catch (error) {
      console.error('[NewsPage] Load more failed', error)
    } finally {
      setIsLoadingMore(false)
    }
  }, [offset, hasMore, isLoadingMore, period, region, topic])

  useEffect(() => {
    let isMounted = true

    async function loadTopLocations() {
      try {
        const url = apiUrl(`/news/analytics/top-locations?interval=hourly&period=${ANALYTICS_PERIOD}`)
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
        const url = apiUrl(`/news/analytics/top-people?interval=hourly&period=${ANALYTICS_PERIOD}`)
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
          <NewsFilters region={region} onRegionChange={setRegion} period={period} onPeriodChange={setPeriod} topic={topic} onTopicChange={setTopic} />
          <StoryList
            storiesData={storiesData}
            loadError={loadError}
            onStorySelect={handleStorySelect}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
            onLoadMore={loadMore}
          />
        </div>
        <div className={styles.rightPanel}>
          <AnalyticsOverview
            stories={storiesData}
            topLocations={topLocations}
            topLocationSeries={topLocationSeries}
            topPeopleSeries={topPeopleSeries}
            region={region}
          />
        </div>
      </div>
    </div>
  )
}

export default NewsPage

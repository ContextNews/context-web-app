import { useEffect, useMemo, useState } from 'react'
import NewsMap from '../../components/NewsMap'
import LineGraph from '../../components/LineGraph'
import StoryList from '../../components/StoryList'
import StoryView from '../../components/StoryView'
import NewsFilters from '../../components/NewsFilters'
import stories from '../../data/stories.json'
import { buildApiUrl, hasApiBase } from '../../lib/api'
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

  useEffect(() => {
    let isMounted = true

    async function loadTopLocations() {
      if (!hasApiBase) {
        setTopLocations([])
        return
      }

      try {
        const response = await fetch(buildApiUrl('/top-locations'))
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`)
        }
        const data = await response.json()

        if (isMounted) {
          setTopLocations(Array.isArray(data) ? data : [])
        }
      } catch (error) {
        if (isMounted) {
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
      if (!hasApiBase) {
        setTopPeople([])
        return
      }

      try {
        const response = await fetch(buildApiUrl('/top-people'))
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`)
        }
        const data = await response.json()

        if (isMounted) {
          setTopPeople(Array.isArray(data) ? data : [])
        }
      } catch (error) {
        if (isMounted) {
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

    const totals = new Map()
    const perDate = new Map()
    const nameMap = new Map()
    let maxDate = null

    topLocations.forEach((entry) => {
      const iso3 = typeof entry?.iso3 === 'string' ? entry.iso3.trim() : ''
      const dateString = typeof entry?.date === 'string' ? entry.date : ''
      const count = Number(entry?.article_count) || 0
      if (!iso3 || !dateString || !Number.isFinite(count)) return

      const date = new Date(`${dateString}T00:00:00`)
      if (!Number.isNaN(date.getTime())) {
        if (!maxDate || date > maxDate) {
          maxDate = date
        }
      }

      totals.set(iso3, (totals.get(iso3) || 0) + count)

      if (entry?.location) {
        nameMap.set(iso3, entry.location)
      }

      if (!perDate.has(iso3)) {
        perDate.set(iso3, new Map())
      }
      const iso3Dates = perDate.get(iso3)
      iso3Dates.set(dateString, (iso3Dates.get(dateString) || 0) + count)
    })

    if (!maxDate) {
      maxDate = new Date()
    }

    const last7 = []
    for (let i = 6; i >= 0; i -= 1) {
      const date = new Date(maxDate)
      date.setDate(maxDate.getDate() - i)
      last7.push(date)
    }

    const labels = last7.map((date) =>
      date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })
    )
    const labelDates = last7.map((date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    })

    const topIso3 = Array.from(totals.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([iso3]) => iso3)

    const datasets = topIso3.map((iso3) => {
      const iso3Dates = perDate.get(iso3) || new Map()
      const data = labelDates.map((dateKey) => iso3Dates.get(dateKey) || 0)
      const label = nameMap.get(iso3) || iso3
      return { label, data }
    })

    return { labels, datasets }
  }, [topLocations])

  const topPeopleSeries = useMemo(() => {
    if (!Array.isArray(topPeople) || topPeople.length === 0) {
      return null
    }

    const totals = new Map()
    const perDate = new Map()
    let maxDate = null

    topPeople.forEach((entry) => {
      const person = typeof entry?.person === 'string' ? entry.person.trim() : ''
      const dateString = typeof entry?.date === 'string' ? entry.date : ''
      const count = Number(entry?.article_count) || 0
      if (!person || !dateString || !Number.isFinite(count)) return

      const date = new Date(`${dateString}T00:00:00`)
      if (!Number.isNaN(date.getTime())) {
        if (!maxDate || date > maxDate) {
          maxDate = date
        }
      }

      totals.set(person, (totals.get(person) || 0) + count)

      if (!perDate.has(person)) {
        perDate.set(person, new Map())
      }
      const personDates = perDate.get(person)
      personDates.set(dateString, (personDates.get(dateString) || 0) + count)
    })

    if (!maxDate) {
      maxDate = new Date()
    }

    const last7 = []
    for (let i = 6; i >= 0; i -= 1) {
      const date = new Date(maxDate)
      date.setDate(maxDate.getDate() - i)
      last7.push(date)
    }

    const labels = last7.map((date) =>
      date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })
    )
    const labelDates = last7.map((date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    })

    const topPeopleKeys = Array.from(totals.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([person]) => person)

    const datasets = topPeopleKeys.map((person) => {
      const personDates = perDate.get(person) || new Map()
      const data = labelDates.map((dateKey) => personDates.get(dateKey) || 0)
      return { label: person, data }
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

import { useEffect, useMemo, useRef, useState } from 'react'
import Globe from 'react-globe.gl'
import { feature } from 'topojson-client'
import { apiUrl } from '../../lib/api'
import { REGION_STOPS } from '../../lib/constants'
import landingData from '../../data/landing.json'
import LandingFeatureCard from '../../components/LandingFeatureCard'
import NavBar from '../../components/NavBar'
import styles from './LandingPage.module.css'

const getGlobeSize = () => {
  if (typeof window === 'undefined') return 520
  const size = Math.min(window.innerWidth, window.innerHeight) * 0.7
  return Math.max(320, Math.floor(size))
}

const featureCards = [
  {
    title: 'News',
    description: 'Read the latest reporting across regions and topics with source diversity.',
    href: '/news',
    linkLabel: 'Go to News',
    imageUrl: '/ciaglobe.jpg',
    imageOverlayText: 'News Contextualized',
  },
  {
    title: 'Data',
    description: 'Track regional indicators and compare economic and geopolitical signals.',
    href: '/data',
    linkLabel: 'Explore Data',
    imageUrl: '/palantir_data.jpg',
    imageOverlayText: 'Data Collated',
  },
  {
    title: 'About',
    description: 'View how Context is designed, developed and deployed.',
    href: '/about',
    linkLabel: 'About Context',
    imageUrl: '/coding.jpg',
    imageOverlayText: 'About Context',
  },
]

function LandingPage() {
  const globeRef = useRef(null)
  const [globeSize, setGlobeSize] = useState(getGlobeSize)
  const [countries, setCountries] = useState([])
  const [currentRegion, setCurrentRegion] = useState('North America')
  const [displayRegion, setDisplayRegion] = useState('North America')
  const [isFading, setIsFading] = useState(false)
  const [storiesMap, setStoriesMap] = useState({})
  const regionStories = storiesMap[displayRegion] || []
  const regionIndices = (landingData[displayRegion] || {}).indices || []

  const regionPoints = useMemo(
    () =>
      regionStories.map((story) => ({
        lat: story.coordinates.lat,
        lng: story.coordinates.lng,
      })),
    [regionStories],
  )

  useEffect(() => {
    const updateSize = () => setGlobeSize(getGlobeSize())

    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  useEffect(() => {
    let isMounted = true
    async function loadStories() {
      try {
        const url = apiUrl('/landing/top-stories')
        console.log('[LandingPage] Fetching top stories from', url)
        const res = await fetch(url)
        if (!res.ok) throw new Error(`Request failed: ${res.status}`)
        const data = await res.json()
        if (isMounted) {
          const map = {}
          for (const entry of data) {
            const stop = REGION_STOPS.find((s) => s.value === entry.region)
            if (!stop) continue
            map[stop.name] = entry.stories.map((s) => {
              const loc = s.locations?.[0]
              let locationName = loc?.name ?? ''
              if (loc && loc.location_type !== 'country' && loc.country_code) {
                locationName = `${loc.country_code}, ${locationName}`
              }
              return {
                story_id: s.story_id,
                title: s.title,
                location: locationName,
                coordinates: { lat: loc?.latitude ?? 0, lng: loc?.longitude ?? 0 },
              }
            })
          }
          setStoriesMap(map)
        }
      } catch (err) {
        console.error('[LandingPage] Top stories request failed', err)
        if (isMounted) {
          const fallback = {}
          for (const [region, val] of Object.entries(landingData)) {
            fallback[region] = val.stories || []
          }
          setStoriesMap(fallback)
        }
      }
    }
    loadStories()
    return () => { isMounted = false }
  }, [])

  useEffect(() => {
    document.documentElement.classList.add('landingNoScrollbar')
    document.body.classList.add('landingNoScrollbar')
    return () => {
      document.documentElement.classList.remove('landingNoScrollbar')
      document.body.classList.remove('landingNoScrollbar')
    }
  }, [])

  useEffect(() => {
    fetch('/countries-110m.json')
      .then((res) => res.json())
      .then((data) => {
        const geo = feature(data, data.objects.countries)
        setCountries(geo.features || [])
      })
      .catch(() => setCountries([]))
  }, [])

  useEffect(() => {
    if (!globeRef.current) return
    const controls = globeRef.current.controls()
    controls.autoRotate = false
    controls.enableZoom = false
    globeRef.current.pointOfView({ lat: 0, lng: 0, altitude: 2 }, 0)
  }, [])

  useEffect(() => {
    if (!globeRef.current) return

    let index = 0
    const move = () => {
      const target = REGION_STOPS[index % REGION_STOPS.length]
      setCurrentRegion(target.name)
      globeRef.current.pointOfView(
        { lat: target.lat, lng: target.lng, altitude: 2 },
        1800,
      )
      index += 1
    }

    move()
    const id = window.setInterval(move, 8000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDisplayRegion(currentRegion)
      setIsFading(false)
    }, 300)

    setIsFading(true)
    return () => window.clearTimeout(timeoutId)
  }, [currentRegion])

  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <NavBar />
        <div className={styles.content}>
          <div className={styles.left}>
            <div
              className={`${styles.regionBox} ${isFading ? styles.regionFade : ''}`}
            >
              <div className={`${styles.regionRow} ${styles.regionHeader}`}>
                <div className={`${styles.regionName} ${styles.fadeText}`}>
                  {displayRegion}
                </div>
                <div className={`${styles.regionIndices} ${styles.fadeText}`}>
                  {regionIndices.map((idx) => (
                    <div key={idx.name} className={styles.index}>
                      <span className={styles.indexName}>{idx.name}</span>
                      <span className={styles.indexValue}>{idx.value}</span>
                      <span
                        className={`${styles.indexArrow} ${
                          idx.direction === 'up' ? styles.indexArrowUp : styles.indexArrowDown
                        }`}
                      >
                        {idx.direction === 'up' ? '▲' : '▼'}
                      </span>
                    </div>
                  ))}
                </div>
                <div className={styles.progressTrack}>
                  <div key={currentRegion} className={styles.progressBar} />
                </div>
              </div>
              {[0, 1, 2].map((i) => {
                const story = regionStories[i]
                return (
                  <div key={i} className={`${styles.regionRow} ${styles.storyRow}`}>
                    {story ? (
                      <>
                        <div className={`${styles.storyTitle} ${styles.fadeText}`}>
                          {story.title}
                        </div>
                        <div className={`${styles.storyLocation} ${styles.fadeText}`}>
                          {story.location}
                        </div>
                      </>
                    ) : null}
                  </div>
                )
              })}
              <div className={`${styles.regionRow} ${styles.placeholderRow}`} />
              <div className={`${styles.regionRow} ${styles.actionsRow}`}>
                <a href="/news" className={styles.actionButton}>
                  NEWS
                </a>
                <a href="/data" className={styles.actionButton}>
                  DATA
                </a>
              </div>
            </div>
          </div>
          <div className={styles.right}>
            <Globe
              ref={globeRef}
              width={globeSize}
              height={globeSize}
              backgroundColor="rgba(0,0,0,0)"
              globeImageUrl="https://unpkg.com/three-globe/example/img/earth-dark.jpg"
              bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
              showAtmosphere={false}
              atmosphereAltitude={0}
              pointsData={regionPoints}
              pointLat="lat"
              pointLng="lng"
              pointColor={() => '#e21a41'}
              pointRadius={0.6}
              pointAltitude={0.02}
              polygonsData={countries}
              polygonCapColor={() => 'rgba(0,0,0,0)'}
              polygonSideColor={() => 'rgba(0,0,0,0)'}
              polygonStrokeColor={() => '#404043'}
              polygonAltitude={0.01}
              polygonsTransitionDuration={0}
            />
          </div>
        </div>
      </section>
      <section className={styles.lowerSection}>
        <div className={styles.boxRow}>
          {featureCards.map((card) => (
            <LandingFeatureCard
              key={card.title}
              title={card.title}
              description={card.description}
              href={card.href}
              linkLabel={card.linkLabel}
              imageUrl={card.imageUrl}
              imageOverlayText={card.imageOverlayText}
            />
          ))}
        </div>
      </section>
      <footer className={styles.footer}>
        <div className={styles.footerSocials}>
          <a
            href="https://x.com"
            target="_blank"
            rel="noreferrer"
            aria-label="X"
            className={styles.footerIconLink}
          >
            <svg
              viewBox="0 0 24 24"
              className={`${styles.footerIcon} ${styles.footerIconX}`}
              aria-hidden="true"
            >
              <path
                d="M18.901 2H21.98l-6.726 7.686L23.06 22h-6.11l-4.785-6.282L6.667 22H3.586l7.194-8.222L1.28 2h6.265l4.325 5.704L18.901 2Zm-1.073 18.15h1.705L6.608 3.754H4.78L17.828 20.15Z"
                fill="currentColor"
              />
            </svg>
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            className={styles.footerIconLink}
          >
            <svg viewBox="0 0 24 24" className={styles.footerIcon} aria-hidden="true">
              <path
                d="M6.94 8.5a2 2 0 1 1 0-4 2 2 0 0 1 0 4ZM5 10h3.88v9H5v-9Zm5.44 0H14v1.23h.05c.5-.95 1.72-1.95 3.54-1.95 3.79 0 4.49 2.35 4.49 5.41V19h-3.88v-3.85c0-.92-.02-2.1-1.37-2.1s-1.58 1.01-1.58 2.04V19H10.4v-9h.04Z"
                fill="currentColor"
              />
            </svg>
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className={styles.footerIconLink}
          >
            <svg viewBox="0 0 24 24" className={styles.footerIcon} aria-hidden="true">
              <path
                d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.21.68-.48 0-.23-.01-1.01-.01-1.84-2.5.46-3.15-.61-3.35-1.17-.11-.29-.57-1.18-.97-1.41-.33-.18-.8-.62-.01-.63.74-.01 1.27.67 1.45.95.84 1.38 2.18.99 2.71.75.08-.6.33-1 .59-1.22-2.22-.24-4.55-1.07-4.55-4.74 0-1.04.39-1.89 1.03-2.55-.1-.24-.45-1.23.1-2.56 0 0 .84-.26 2.75.97a9.77 9.77 0 0 1 5 0c1.9-1.23 2.75-.97 2.75-.97.55 1.33.2 2.32.1 2.56.64.66 1.03 1.51 1.03 2.55 0 3.68-2.34 4.5-4.57 4.74.36.3.68.89.68 1.81 0 1.31-.01 2.37-.01 2.69 0 .26.18.57.69.48A10 10 0 0 0 12 2Z"
                fill="currentColor"
              />
            </svg>
          </a>
          <a
            href="https://telegram.org"
            target="_blank"
            rel="noreferrer"
            aria-label="Telegram"
            className={styles.footerIconLink}
          >
            <svg viewBox="0 0 24 24" className={styles.footerIcon} aria-hidden="true">
              <path
                d="M20.67 3.38 2.91 10.23c-1.22.49-1.21 1.17-.22 1.47l4.56 1.42 1.76 5.38c.21.59.1.82.73.82.48 0 .69-.22.96-.48l2.3-2.24 4.78 3.53c.88.49 1.51.24 1.73-.82L22.54 4.8c.33-1.29-.5-1.88-1.87-1.42ZM8 12.79l10.27-6.48c.51-.31.98-.14.6.2l-8.8 7.95-.34 3.63-1.73-5.3Z"
                fill="currentColor"
              />
            </svg>
          </a>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage

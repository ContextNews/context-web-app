import { useEffect, useMemo, useRef, useState } from 'react'
import Globe from 'react-globe.gl'
import { feature } from 'topojson-client'
import { REGION_STOPS } from '../../lib/constants'
import landingData from '../../data/landing.json'
import styles from './LandingPage.module.css'

function LandingPage() {
  const globeRef = useRef(null)
  const [globeSize, setGlobeSize] = useState(520)
  const [countries, setCountries] = useState([])
  const [currentRegion, setCurrentRegion] = useState('South America')
  const [displayRegion, setDisplayRegion] = useState('South America')
  const [isFading, setIsFading] = useState(false)
  const regionData = landingData[displayRegion] || {}
  const regionStories = regionData.stories || []
  const regionIndices = regionData.indices || []

  const regionPoints = useMemo(
    () =>
      regionStories.map((story) => ({
        lat: story.coordinates.lat,
        lng: story.coordinates.lng,
      })),
    [regionStories],
  )

  useEffect(() => {
    const updateSize = () => {
      const size = Math.min(window.innerWidth, window.innerHeight) * 0.7
      setGlobeSize(Math.max(320, Math.floor(size)))
    }

    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
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
      <div className={styles.nav}>
        <div className={styles.navTitle}>Context</div>
        <div className={styles.navLinks}>
          <button type="button" className={styles.navLink}>
            Politics
          </button>
          <button type="button" className={styles.navLink}>
            Economics
          </button>
          <button type="button" className={styles.navLink}>
            Finance
          </button>
          <button type="button" className={styles.navLink}>
            Business
          </button>
          <button type="button" className={styles.navLink}>
            Conflict
          </button>
        </div>
      </div>
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
            </div>
            {regionStories.slice(0, 3).map((story) => (
              <div key={story.title} className={`${styles.regionRow} ${styles.storyRow}`}>
                <div className={`${styles.storyTitle} ${styles.fadeText}`}>
                  {story.title}
                </div>
                <div className={`${styles.storyLocation} ${styles.fadeText}`}>
                  {story.location}
                </div>
              </div>
            ))}
            <div className={`${styles.regionRow} ${styles.placeholderRow}`} />
            <div className={`${styles.regionRow} ${styles.actionsRow}`}>
              <a href="/news" className={styles.actionButton}>
                NEWS
              </a>
              <button type="button" className={styles.actionButton}>
                DATA
              </button>
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
    </div>
  )
}

export default LandingPage

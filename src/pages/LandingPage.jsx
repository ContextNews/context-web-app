import { useEffect, useMemo, useRef, useState } from 'react'
import Globe from 'react-globe.gl'
import { feature } from 'topojson-client'
import { REGION_STOPS } from '../lib/constants'
import landingData from '../data/landing.json'

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
    <div className="app-container landing-page">
      <div className="landing-nav">
        <div className="landing-nav-title">Context</div>
        <div className="landing-nav-links">
          <button type="button" className="landing-nav-link">
            Politics
          </button>
          <button type="button" className="landing-nav-link">
            Economics
          </button>
          <button type="button" className="landing-nav-link">
            Finance
          </button>
          <button type="button" className="landing-nav-link">
            Business
          </button>
          <button type="button" className="landing-nav-link">
            Conflict
          </button>
        </div>
      </div>
      <div className="landing-content">
        <div className="landing-left">
          <div
            className={
              isFading
                ? 'landing-region-box landing-region-fade'
                : 'landing-region-box'
            }
          >
            <div className="landing-region-row landing-region-header">
              <div className="landing-region-name landing-fade-text">
                {displayRegion}
              </div>
              <div className="landing-region-indices landing-fade-text">
                {regionIndices.map((idx) => (
                  <div key={idx.name} className="landing-index">
                    <span className="landing-index-name">{idx.name}</span>
                    <span className="landing-index-value">{idx.value}</span>
                    <span
                      className={
                        idx.direction === 'up'
                          ? 'landing-index-arrow up'
                          : 'landing-index-arrow down'
                      }
                    >
                      {idx.direction === 'up' ? '▲' : '▼'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            {regionStories.slice(0, 3).map((story) => (
              <div key={story.title} className="landing-region-row landing-story-row">
                <div className="landing-story-title landing-fade-text">
                  {story.title}
                </div>
                <div className="landing-story-location landing-fade-text">
                  {story.location}
                </div>
              </div>
            ))}
            <div className="landing-region-row landing-placeholder-row" />
            <div className="landing-region-row landing-actions-row">
              <a href="/news" className="landing-action-button">
                NEWS
              </a>
              <button type="button" className="landing-action-button">
                DATA
              </button>
            </div>
          </div>
        </div>
        <div className="landing-right">
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

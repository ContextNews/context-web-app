import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { buildCountryIndex, buildLocationMarkers } from '../../lib/mapMarkers'
import { buildStoryMarkersMapUrl } from '../../lib/storyMapUrl'
import styles from './NewsMap.module.css'

function NewsMap({ stories = [], topLocations = [], locationOverrides = {}, region = '' }) {
  const [countryIndex, setCountryIndex] = useState(null)
  const iframeRef = useRef(null)
  const markersRef = useRef(null)

  useEffect(() => {
    let isMounted = true
    fetch('/countries.geojson')
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return
        setCountryIndex(buildCountryIndex(data))
      })
      .catch(() => {
        if (isMounted) setCountryIndex(new Map())
      })

    return () => {
      isMounted = false
    }
  }, [])

  const markers = useMemo(() => {
    return buildLocationMarkers({ stories, topLocations, countryIndex, locationOverrides })
  }, [stories, topLocations, countryIndex, locationOverrides])

  const mapData = useMemo(
    () => buildStoryMarkersMapUrl({ markers, region }),
    [markers, region]
  )

  // Keep markers ref in sync so the onLoad callback always has latest data
  markersRef.current = mapData?.markers ?? null

  const handleIframeLoad = useCallback(() => {
    const iframe = iframeRef.current
    const m = markersRef.current
    if (iframe?.contentWindow && m) {
      iframe.contentWindow.postMessage({ type: 'markers', markers: m }, '*')
    }
  }, [])

  return (
    <div className={styles.container}>
      <div className={styles.mapArea}>
        {mapData ? (
          <iframe
            ref={iframeRef}
            title="News location map"
            className={styles.frame}
            src={mapData.src}
            onLoad={handleIframeLoad}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <div className={styles.empty}>No map locations available.</div>
        )}
      </div>
    </div>
  )
}

export default NewsMap

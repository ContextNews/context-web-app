import { useEffect, useMemo, useState } from 'react'
import { buildCountryIndex, buildLocationMarkers } from '../../lib/mapMarkers'
import { buildStoryMarkersMapUrl } from '../../lib/storyMapUrl'
import styles from './NewsMap.module.css'

function NewsMap({ stories = [], topLocations = [], locationOverrides = {}, region = '' }) {
  const [countryIndex, setCountryIndex] = useState(null)

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

  const mapSrc = useMemo(
    () => buildStoryMarkersMapUrl({ markers, region }),
    [markers, region]
  )

  return (
    <div className={styles.container}>
      <div className={styles.mapArea}>
        {mapSrc ? (
          <iframe
            title="News location map"
            className={styles.frame}
            src={mapSrc}
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

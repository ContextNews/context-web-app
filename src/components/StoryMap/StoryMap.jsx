import { useMemo } from 'react'
import { buildStoryMapUrl } from '../../lib/storyMapUrl'
import styles from './StoryMap.module.css'

const toNumber = (value) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function StoryMap({ story }) {
  const primaryLocation = Array.isArray(story?.locations) ? story.locations[0] : null
  const latitude = toNumber(primaryLocation?.latitude)
  const longitude = toNumber(primaryLocation?.longitude)

  const mapData = useMemo(() => {
    const src = buildStoryMapUrl({ lat: latitude, lon: longitude, zoom: 5 })
    return src ? { src } : null
  }, [latitude, longitude])

  return (
    <div className={styles.container}>
      <div className={styles.mapArea}>
        {mapData ? (
          <iframe
            title="Story location map"
            className={styles.frame}
            src={mapData.src}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <div className={styles.empty}>No map coordinates available for this story.</div>
        )}
      </div>
    </div>
  )
}

export default StoryMap

import { useEffect, useMemo, useState } from 'react'
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps'
import { LOCATION_ALIASES } from '../../lib/constants'
import { normalizeKey } from '../../lib/normalize'
import styles from './NewsMap.module.css'

const getGeometryBounds = (geometry) => {
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity

  const visit = (coords) => {
    if (!Array.isArray(coords)) return
    if (coords.length === 2 && typeof coords[0] === 'number') {
      const [x, y] = coords
      minX = Math.min(minX, x)
      maxX = Math.max(maxX, x)
      minY = Math.min(minY, y)
      maxY = Math.max(maxY, y)
      return
    }
    coords.forEach(visit)
  }

  visit(geometry.coordinates)

  if (!Number.isFinite(minX)) {
    return null
  }

  return [(minX + maxX) / 2, (minY + maxY) / 2]
}

function NewsMap({ stories = [], topLocations = [], locationOverrides = {} }) {
  const [countryIndex, setCountryIndex] = useState(null)

  useEffect(() => {
    let isMounted = true
    fetch('/countries.geojson')
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return
        const index = new Map()
        data.features.forEach((feature) => {
          const { name, 'ISO3166-1-Alpha-2': alpha2, 'ISO3166-1-Alpha-3': alpha3 } =
            feature.properties || {}
          const centroid = getGeometryBounds(feature.geometry)
          if (!centroid) return
          if (name) index.set(normalizeKey(name), centroid)
          if (alpha2) index.set(normalizeKey(alpha2), centroid)
          if (alpha3) index.set(normalizeKey(alpha3), centroid)
        })
        setCountryIndex(index)
      })
      .catch(() => {
        if (isMounted) setCountryIndex(new Map())
      })

    return () => {
      isMounted = false
    }
  }, [])

  const markers = useMemo(() => {
    if (!countryIndex) return []
    const counts = new Map()

    const useTopLocations = Array.isArray(topLocations) && topLocations.length > 0

    if (useTopLocations) {
      topLocations.forEach((entry) => {
        const iso3 = typeof entry?.iso3 === 'string' ? entry.iso3.trim() : ''
        if (!iso3) return
        const articleCount = Number(entry?.article_count) || 0
        if (!Number.isFinite(articleCount) || articleCount <= 0) return
        const key = normalizeKey(iso3)
        counts.set(key, (counts.get(key) || 0) + articleCount)
      })
    } else {
      stories.forEach((story) => {
        if (story.primary_location) {
          const key = normalizeKey(story.primary_location)
          counts.set(key, (counts.get(key) || 0) + 1)
          return
        }
        const locations = Array.isArray(story.locations) ? story.locations : []
        locations.forEach((location) => {
          const rawName = typeof location === 'string' ? location : location?.name
          if (!rawName) return
          const key = normalizeKey(rawName)
          counts.set(key, (counts.get(key) || 0) + 1)
        })
      })
    }

    return Array.from(counts.entries())
      .map(([rawKey, count]) => {
        const aliasKey = LOCATION_ALIASES[rawKey] || rawKey
        const normalizedAlias = normalizeKey(aliasKey)
        const override =
          locationOverrides[rawKey] ||
          locationOverrides[aliasKey] ||
          locationOverrides[normalizedAlias]
        const coordinates = override || countryIndex.get(normalizedAlias)

        if (!coordinates) return null
        const size = Math.min(14, 3 + count * 1.2)
        return { key: rawKey, coordinates, count, size }
      })
      .filter(Boolean)
  }, [stories, topLocations, countryIndex, locationOverrides])

  return (
    <div className={styles.container}>
      <div className={styles.canvas}>
        <ComposableMap
          className={styles.svg}
          projection="geoMercator"
          projectionConfig={{ scale: 165, center: [0, 23] }}
          width={720}
          height={450}
        >
          <Geographies geography="/countries-110m.json">
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  className={styles.geography}
                />
              ))
            }
          </Geographies>
          {markers.map((marker) => (
            <Marker key={marker.key} coordinates={marker.coordinates}>
              <circle r={marker.size} className={styles.markerDot} />
            </Marker>
          ))}
        </ComposableMap>
      </div>
    </div>
  )
}

export default NewsMap

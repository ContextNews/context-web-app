import { useEffect, useMemo, useState } from 'react'
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps'
import { LOCATION_ALIASES } from '../../lib/constants'
import { normalizeKey } from '../../lib/normalize'
import styles from './NewsMap.module.css'

// Manual coordinate overrides for countries where getGeometryBounds
// calculates wrong centroids (antimeridian crossers, overseas territories)
const REGION_MAP_CONFIG = {
  '': { center: [0, 23], scale: 165 },
  north_america: { center: [-100, 45], scale: 400 },
  south_america: { center: [-60, -20], scale: 450 },
  europe: { center: [15, 52], scale: 600 },
  africa: { center: [20, 5], scale: 400 },
  middle_east: { center: [45, 28], scale: 600 },
  asia: { center: [95, 35], scale: 300 },
  oceania: { center: [140, -25], scale: 500 },
}

const COORDINATE_OVERRIDES = {
  'united states of america': [-98, 39],
  russia: [100, 60],
  france: [2, 46],
  'united kingdom': [-2, 54],
  netherlands: [5, 52],
  denmark: [10, 56],
  portugal: [-8, 39],
  spain: [-4, 40],
  'new zealand': [174, -41],
  fiji: [178, -18],
}

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

function NewsMap({ stories = [], topLocations = [], locationOverrides = {}, region = '' }) {
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
          const normalizedName = name ? normalizeKey(name) : null
          const centroid =
            COORDINATE_OVERRIDES[normalizedName] || getGeometryBounds(feature.geometry)
          if (!centroid) return
          if (normalizedName) index.set(normalizedName, centroid)
          if (alpha2) index.set(normalizeKey(alpha2), centroid)
          if (alpha3) index.set(normalizeKey(alpha3), centroid)
        })
        // Debug: log coordinates for US and Russia
        console.info('[NewsMap] countryIndex built', {
          size: index.size,
          russia: index.get('russia'),
          us: index.get('united states of america'),
          usAlt: index.get('us'),
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
      // New API returns: { type: "location", name: "Country", count: 12 }
      topLocations.forEach((entry) => {
        const name = typeof entry?.name === 'string' ? entry.name.trim() : ''
        if (!name) return
        const articleCount = Number(entry?.count) || 0
        if (!Number.isFinite(articleCount) || articleCount <= 0) return
        const key = normalizeKey(name)
        counts.set(key, (counts.get(key) || 0) + articleCount)
      })
    } else {
      stories.forEach((story) => {
        const firstLocation = story.locations?.[0]
        const rawName = typeof firstLocation === 'string' ? firstLocation : firstLocation?.name
        if (!rawName) return
        const key = normalizeKey(rawName)
        counts.set(key, (counts.get(key) || 0) + 1)
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

        if (!coordinates) {
          return null
        }
        const size = Math.min(14, 3 + count * 1.2)
        return { key: rawKey, coordinates, count, size }
      })
      .filter(Boolean)
  }, [stories, topLocations, countryIndex, locationOverrides])

  // Debug: log all markers being rendered
  console.info('[NewsMap] Markers to render', {
    count: markers.length,
    markers: markers.map((m) => ({
      key: m.key,
      coordinates: m.coordinates,
      count: m.count,
      size: m.size,
    })),
  })

  return (
    <div className={styles.container}>
      <div className={styles.canvas}>
        <ComposableMap
          className={styles.svg}
          projection="geoMercator"
          projectionConfig={REGION_MAP_CONFIG[region] || REGION_MAP_CONFIG['']}
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

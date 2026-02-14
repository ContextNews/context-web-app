import { LOCATION_ALIASES } from './constants'
import { normalizeKey } from './normalize'

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

const toNumber = (value) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

const toCoordinates = (value) => {
  if (!Array.isArray(value) || value.length !== 2) return null
  const lon = toNumber(value[0])
  const lat = toNumber(value[1])
  if (lon === null || lat === null) return null
  return [lon, lat]
}

const getGeometryBounds = (geometry) => {
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity

  const visit = (coords) => {
    if (!Array.isArray(coords)) return
    if (coords.length === 2 && typeof coords[0] === 'number' && typeof coords[1] === 'number') {
      const [x, y] = coords
      minX = Math.min(minX, x)
      maxX = Math.max(maxX, x)
      minY = Math.min(minY, y)
      maxY = Math.max(maxY, y)
      return
    }
    coords.forEach(visit)
  }

  visit(geometry?.coordinates)

  if (!Number.isFinite(minX)) return null
  return [(minX + maxX) / 2, (minY + maxY) / 2]
}

export function buildCountryIndex(geojson) {
  const index = new Map()
  if (!Array.isArray(geojson?.features)) return index

  geojson.features.forEach((feature) => {
    const { name, 'ISO3166-1-Alpha-2': alpha2, 'ISO3166-1-Alpha-3': alpha3 } =
      feature?.properties || {}
    const normalizedName = name ? normalizeKey(name) : null
    const override = normalizedName ? COORDINATE_OVERRIDES[normalizedName] : null
    const centroid = toCoordinates(override || getGeometryBounds(feature?.geometry))
    if (!centroid) return

    if (normalizedName) index.set(normalizedName, centroid)
    if (alpha2) index.set(normalizeKey(alpha2), centroid)
    if (alpha3) index.set(normalizeKey(alpha3), centroid)
  })

  return index
}

export function buildLocationMarkers({
  stories = [],
  topLocations = [],
  countryIndex = new Map(),
  locationOverrides = {},
}) {
  if (!(countryIndex instanceof Map) || countryIndex.size === 0) return []

  const counts = new Map()
  const useTopLocations = Array.isArray(topLocations) && topLocations.length > 0

  if (useTopLocations) {
    topLocations.forEach((entry) => {
      const name = typeof entry?.name === 'string' ? entry.name.trim() : ''
      if (!name) return
      const count = Number(entry?.count)
      if (!Number.isFinite(count) || count <= 0) return
      const key = normalizeKey(name)
      const existing = counts.get(key) || { name, count: 0 }
      existing.count += count
      counts.set(key, existing)
    })
  } else {
    stories.forEach((story) => {
      const firstLocation = story?.locations?.[0]
      const rawName = typeof firstLocation === 'string' ? firstLocation : firstLocation?.name
      const name = typeof rawName === 'string' ? rawName.trim() : ''
      if (!name) return
      const key = normalizeKey(name)
      const existing = counts.get(key) || { name, count: 0 }
      existing.count += 1
      counts.set(key, existing)
    })
  }

  return Array.from(counts.entries())
    .map(([rawKey, data]) => {
      const aliasKey = LOCATION_ALIASES[rawKey] || rawKey
      const normalizedAlias = normalizeKey(aliasKey)
      const override =
        locationOverrides[rawKey] ||
        locationOverrides[aliasKey] ||
        locationOverrides[normalizedAlias]
      const coordinates = toCoordinates(override) || toCoordinates(countryIndex.get(normalizedAlias))
      if (!coordinates) return null

      const count = Math.max(1, Math.round(data.count))
      const radius = Math.min(14, 3 + count * 1.2)
      const [lon, lat] = coordinates

      return {
        key: rawKey,
        name: data.name,
        lat,
        lon,
        count,
        radius,
      }
    })
    .filter(Boolean)
}

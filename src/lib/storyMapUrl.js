const REGION_VIEW_CONFIG = {
  '': { lat: 20, lon: 0, zoom: 2 },
  north_america: { lat: 45, lon: -100, zoom: 3 },
  south_america: { lat: -20, lon: -60, zoom: 3 },
  europe: { lat: 52, lon: 15, zoom: 4 },
  africa: { lat: 5, lon: 20, zoom: 3 },
  middle_east: { lat: 28, lon: 45, zoom: 4 },
  asia: { lat: 35, lon: 95, zoom: 3 },
  oceania: { lat: -25, lon: 140, zoom: 4 },
}

const MAX_MARKERS = 80

const toNumber = (value) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export function buildStoryMapUrl({ lat, lon, zoom = 5 }) {
  const mapLat = toNumber(lat)
  const mapLon = toNumber(lon)
  const mapZoom = toNumber(zoom)

  if (mapLat === null || mapLon === null) return null

  const params = new URLSearchParams({
    lat: String(mapLat),
    lon: String(mapLon),
    zoom: String(mapZoom === null ? 5 : mapZoom),
  })
  return `/story-map.html?${params.toString()}`
}

export function buildStoryMarkersMapUrl({ markers = [], region = '' }) {
  const cleanedMarkers = (Array.isArray(markers) ? markers : [])
    .slice(0, MAX_MARKERS)
    .map((marker) => {
      const lat = toNumber(marker?.lat)
      const lon = toNumber(marker?.lon)
      if (lat === null || lon === null) return null
      return {
        name: typeof marker?.name === 'string' ? marker.name : '',
        lat,
        lon,
        count: Math.max(1, Math.round(toNumber(marker?.count) || 1)),
        radius: Math.max(3, Math.round(toNumber(marker?.radius) || 6)),
      }
    })
    .filter(Boolean)

  if (cleanedMarkers.length === 0) return null

  const regionView = REGION_VIEW_CONFIG[region] || REGION_VIEW_CONFIG['']
  const params = new URLSearchParams({
    lat: String(regionView.lat),
    lon: String(regionView.lon),
    zoom: String(regionView.zoom),
    fit: '0',
  })

  return { src: `/story-map.html?${params.toString()}`, markers: cleanedMarkers }
}

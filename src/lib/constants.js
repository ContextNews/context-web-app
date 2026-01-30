/**
 * Country name aliases for location matching
 */
export const LOCATION_ALIASES = {
  'united states': 'united states of america',
}

/**
 * Period filter options for news feed
 */
export const PERIOD_OPTIONS = [
  { label: 'Today', value: 'today' },
  { label: 'This week', value: 'week' },
  { label: 'This month', value: 'month' },
]

/**
 * Ordered list of bias categories from left to right
 */
export const BIAS_ORDER = ['left', 'leans-left', 'center', 'leans-right', 'right']

/**
 * Display labels for bias categories
 */
export const BIAS_LABELS = {
  left: 'Left',
  'leans-left': 'Leans left',
  center: 'Center',
  'leans-right': 'Leans right',
  right: 'Right',
}

/**
 * Globe animation waypoints for landing page
 */
export const REGION_STOPS = [
  { name: 'South America', lat: -15, lng: -60 },
  { name: 'North America', lat: 40, lng: -100 },
  { name: 'Europe', lat: 54, lng: 15 },
  { name: 'Africa', lat: 10, lng: 20 },
  { name: 'Middle East', lat: 28, lng: 45 },
  { name: 'Asia', lat: 35, lng: 100 },
  { name: 'Oceania', lat: -25, lng: 140 },
]

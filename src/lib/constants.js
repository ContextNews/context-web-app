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
 * Topic filter options for news feed
 */
export const TOPIC_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Politics', value: 'Politics' },
  { label: 'Conflict & Security', value: 'Conflict & Security' },
  { label: 'Crime', value: 'Crime' },
  { label: 'Business', value: 'Business' },
  { label: 'Economy', value: 'Economy' },
  { label: 'Technology', value: 'Technology' },
  { label: 'Health', value: 'Health' },
  { label: 'Environment', value: 'Environment' },
  { label: 'Society', value: 'Society' },
  { label: 'Sports', value: 'Sports' },
  { label: 'Entertainment', value: 'Entertainment' },
]

/**
 * Region filter options for news feed
 */
export const REGION_OPTIONS = [
  { label: 'Global', value: '' },
  { label: 'North America', value: 'north_america' },
  { label: 'South America', value: 'south_america' },
  { label: 'Europe', value: 'europe' },
  { label: 'Africa', value: 'africa' },
  { label: 'Middle East', value: 'middle_east' },
  { label: 'Asia', value: 'asia' },
  { label: 'Oceania', value: 'oceania' },
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

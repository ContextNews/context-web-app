/**
 * Common date field names used across article objects
 */
const ARTICLE_DATE_FIELDS = [
  'published_at',
  'publishedAt',
  'published_date',
  'publishedDate',
  'date',
]

/**
 * Common date field names used across story objects
 */
const STORY_DATE_FIELDS = ['updated_at', 'generated_at']

/**
 * Extract a date value from an object by checking multiple possible field names
 */
export function extractDateValue(obj, fields) {
  if (!obj) return ''
  for (const field of fields) {
    if (obj[field]) return obj[field]
  }
  return ''
}

/**
 * Parse a date string and return timestamp, or 0 if invalid
 */
export function parseTimestamp(value) {
  if (!value) return 0
  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? 0 : parsed
}

/**
 * Get timestamp from an article object
 */
export function getArticleTimestamp(article) {
  const value = extractDateValue(article, ARTICLE_DATE_FIELDS)
  return parseTimestamp(value)
}

/**
 * Get timestamp from a story object
 */
export function getStoryTimestamp(story) {
  const value = extractDateValue(story, STORY_DATE_FIELDS)
  return parseTimestamp(value)
}

/**
 * Format a date value as localized date string (e.g., "1/15/2024")
 */
export function formatDate(value) {
  if (!value) return null
  const parsed = Date.parse(value)
  if (Number.isNaN(parsed)) return null
  return new Date(parsed).toLocaleDateString()
}

/**
 * Format a date value as localized datetime string (e.g., "1/15/2024, 2:30:00 PM")
 */
export function formatDateTime(value) {
  if (!value) return null
  const parsed = Date.parse(value)
  if (Number.isNaN(parsed)) return null
  return new Date(parsed).toLocaleString()
}

/**
 * Format an article's date as localized date string
 */
export function formatArticleDate(article) {
  const value = extractDateValue(article, ARTICLE_DATE_FIELDS)
  return formatDate(value)
}

/**
 * Format a story's date as localized datetime string
 */
export function formatStoryDate(story) {
  const value = extractDateValue(story, STORY_DATE_FIELDS)
  return formatDateTime(value)
}

/**
 * Sort articles by published date (newest first)
 */
export function sortArticlesByDate(articles) {
  return [...articles].sort((a, b) => getArticleTimestamp(b) - getArticleTimestamp(a))
}

/**
 * Sort stories by date (newest first)
 */
export function sortStoriesByDate(stories) {
  return [...stories].sort((a, b) => getStoryTimestamp(b) - getStoryTimestamp(a))
}

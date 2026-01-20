import { BIAS_ORDER } from './constants'

/**
 * Normalize a string key for comparison
 * - Converts to lowercase
 * - Removes periods
 * - Normalizes whitespace to single spaces
 * - Trims leading/trailing whitespace
 */
export function normalizeKey(value) {
  return (value || '')
    .toString()
    .toLowerCase()
    .replace(/[.]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Normalize a bias value to standard format
 * Handles variations like 'centre', 'lean-left', 'left-leaning', etc.
 * Returns null if bias is not recognized
 */
export function normalizeBias(bias) {
  const normalized = normalizeKey(bias).replace(/_/g, '-')
  if (!normalized) return null

  // Handle common variations
  if (normalized === 'centre') return 'center'
  if (normalized === 'lean-left') return 'leans-left'
  if (normalized === 'lean-right') return 'leans-right'
  if (normalized === 'left-lean' || normalized === 'left-leaning') {
    return 'leans-left'
  }
  if (normalized === 'right-lean' || normalized === 'right-leaning') {
    return 'leans-right'
  }

  // Return if it's a valid bias value
  if (BIAS_ORDER.includes(normalized)) return normalized

  return null
}

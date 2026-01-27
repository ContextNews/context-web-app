import { normalizeBias, normalizeKey } from './normalize'

const SOURCE_STOPWORDS = new Set(['the', 'news'])

export function normalizeSourceKey(value) {
  return normalizeKey(value).replace(/[^a-z0-9]+/g, ' ').trim()
}

export function getSourceGroupKey(value) {
  const normalized = normalizeSourceKey(value)
  if (!normalized) return ''
  const parts = normalized.split(' ')
  const primary = parts.find((part) => part && !SOURCE_STOPWORDS.has(part))
  return primary || parts[0] || ''
}

export function buildSourceGroupBiasMap(sources = []) {
  const biasMap = new Map()

  sources.forEach((source) => {
    const bias = normalizeBias(source?.bias)
    if (!bias) return
    const groupKey = getSourceGroupKey(source?.source || source?.name)
    if (!groupKey || biasMap.has(groupKey)) return
    biasMap.set(groupKey, bias)
  })

  return biasMap
}

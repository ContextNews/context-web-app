const rawBase = import.meta.env.VITE_API_BASE_URL ?? ''

export const apiBase = rawBase.trim()
export const hasApiBase = apiBase.length > 0

export function buildApiUrl(path) {
  const base = apiBase.replace(/\/+$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  return base ? `${base}${normalizedPath}` : normalizedPath
}

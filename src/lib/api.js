export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api'

export function apiUrl(path) {
  const base = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return new URL(`${base}${normalizedPath}`, window.location.origin).pathname
}

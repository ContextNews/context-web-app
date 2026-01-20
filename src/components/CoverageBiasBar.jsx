import { useMemo } from 'react'

const BIAS_ORDER = ['left', 'leans-left', 'center', 'leans-right', 'right']

const BIAS_LABELS = {
  left: 'Left',
  'leans-left': 'Leans left',
  center: 'Center',
  'leans-right': 'Leans right',
  right: 'Right',
}

const normalizeKey = (value) => (value || '').toString().trim().toLowerCase()

const normalizeBias = (bias) => {
  const normalized = normalizeKey(bias).replace(/_/g, '-')
  if (!normalized) return null
  if (normalized === 'centre') return 'center'
  if (normalized === 'lean-left') return 'leans-left'
  if (normalized === 'lean-right') return 'leans-right'
  if (normalized === 'left-lean' || normalized === 'left-leaning') {
    return 'leans-left'
  }
  if (normalized === 'right-lean' || normalized === 'right-leaning') {
    return 'leans-right'
  }
  if (BIAS_ORDER.includes(normalized)) return normalized
  return null
}

function CoverageBiasBar({ articles, sources }) {
  const { counts, total } = useMemo(() => {
    const biasCounts = BIAS_ORDER.reduce((acc, key) => {
      acc[key] = 0
      return acc
    }, {})
    const sourceLookup = new Map()

    ;(sources || []).forEach((source) => {
      const bias = normalizeBias(source?.bias)
      if (!bias) return
      const sourceKey = normalizeKey(source?.source)
      const nameKey = normalizeKey(source?.name)
      if (sourceKey) sourceLookup.set(sourceKey, bias)
      if (nameKey) sourceLookup.set(nameKey, bias)
    })

    ;(articles || []).forEach((article) => {
      const key = normalizeKey(article?.source)
      if (!key) return
      const bias = sourceLookup.get(key)
      if (!bias) return
      biasCounts[bias] += 1
    })

    const totalCount = Object.values(biasCounts).reduce(
      (sum, value) => sum + value,
      0
    )

    return { counts: biasCounts, total: totalCount }
  }, [articles, sources])

  return (
    <div className="coverage-bias">
      <div className="coverage-bias-title">Coverage bias</div>
      <div
        className="coverage-bias-bar"
        role="img"
        aria-label="Coverage bias distribution"
      >
        {total > 0 ? (
          BIAS_ORDER.map((key) => {
            const count = counts[key]
            if (!count) return null
            return (
              <div
                key={key}
                className={`coverage-bias-segment ${key}`}
                style={{ flexGrow: count, flexBasis: 0 }}
                aria-hidden="true"
              />
            )
          })
        ) : (
          <div className="coverage-bias-empty">No bias data</div>
        )}
      </div>
      <div className="coverage-bias-legend">
        {BIAS_ORDER.map((key) => (
          <div key={key} className="coverage-bias-legend-item">
            <span className={`coverage-bias-swatch ${key}`} aria-hidden="true" />
            <span className="coverage-bias-label">
              {BIAS_LABELS[key]}
              {total > 0 ? ` (${counts[key]})` : ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CoverageBiasBar

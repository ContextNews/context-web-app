import { useMemo } from 'react'
import { BIAS_ORDER, BIAS_LABELS } from '../../lib/constants'
import { normalizeKey, normalizeBias } from '../../lib/normalize'
import styles from './CoverageBiasBar.module.css'

const SEGMENT_CLASSES = {
  left: styles.segmentLeft,
  'leans-left': styles.segmentLeansLeft,
  center: styles.segmentCenter,
  'leans-right': styles.segmentLeansRight,
  right: styles.segmentRight,
}

const SWATCH_CLASSES = {
  left: styles.swatchLeft,
  'leans-left': styles.swatchLeansLeft,
  center: styles.swatchCenter,
  'leans-right': styles.swatchLeansRight,
  right: styles.swatchRight,
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
    <div className={styles.container}>
      <div className={styles.title}>Coverage bias</div>
      <div
        className={styles.bar}
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
                className={`${styles.segment} ${SEGMENT_CLASSES[key]}`}
                style={{ flexGrow: count }}
                aria-hidden="true"
              />
            )
          })
        ) : (
          <div className={styles.empty}>No bias data</div>
        )}
      </div>
      <div className={styles.legend}>
        {BIAS_ORDER.map((key) => (
          <div key={key} className={styles.legendItem}>
            <span className={`${styles.swatch} ${SWATCH_CLASSES[key]}`} aria-hidden="true" />
            <span>
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

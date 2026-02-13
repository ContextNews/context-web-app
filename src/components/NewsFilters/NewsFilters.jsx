import { useState } from 'react'
import { PERIOD_OPTIONS, REGION_OPTIONS, TOPIC_OPTIONS } from '../../lib/constants'
import styles from './NewsFilters.module.css'

function HamburgerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 5H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M3 10H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M3 15H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

// Convert region labels to adjective form for the title
const REGION_ADJECTIVES = {
  '': 'Global',
  'north_america': 'North American',
  'south_america': 'South American',
  'europe': 'European',
  'africa': 'African',
  'middle_east': 'Middle Eastern',
  'asia': 'Asian',
  'oceania': 'Oceanian',
}

function NewsFilters({ region, onRegionChange, period, onPeriodChange, topic, onTopicChange }) {
  const [isOpen, setIsOpen] = useState(false)

  // Build title: "[Region] [Topic] [Period]"
  const regionAdjective = REGION_ADJECTIVES[region] || 'Global'
  const topicLabel = TOPIC_OPTIONS.find((t) => t.value === (topic || ''))?.label || 'All'
  const periodLabel = PERIOD_OPTIONS.find((p) => p.value === period)?.label || 'Today'

  // Use "News" when topic is "All"
  const topicDisplay = topicLabel === 'All' ? 'News' : topicLabel

  const title = `${regionAdjective} ${topicDisplay} ${periodLabel}`

  return (
    <div className={styles.container}>
      <button
        type="button"
        className={styles.hamburger}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="Toggle filters"
      >
        <HamburgerIcon />
      </button>
      <div className={styles.title}>{title}</div>

      {isOpen && (
        <>
          <div className={styles.backdrop} onClick={() => setIsOpen(false)} />
          <div className={styles.filterPanel}>
            <div className={styles.column}>
              <div className={styles.columnHeader}>Location</div>
              <div className={styles.columnOptions}>
                {REGION_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`${styles.option} ${option.value === region ? styles.selected : ''}`}
                    onClick={() => {
                      onRegionChange?.(option.value)
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.column}>
              <div className={styles.columnHeader}>Topic</div>
              <div className={styles.columnOptions}>
                {TOPIC_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`${styles.option} ${option.value === (topic || '') ? styles.selected : ''}`}
                    onClick={() => {
                      onTopicChange?.(option.value)
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.column}>
              <div className={styles.columnHeader}>Period</div>
              <div className={styles.columnOptions}>
                {PERIOD_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`${styles.option} ${option.value === period ? styles.selected : ''}`}
                    onClick={() => {
                      onPeriodChange?.(option.value)
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default NewsFilters

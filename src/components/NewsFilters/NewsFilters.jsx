import { PERIOD_OPTIONS } from '../../lib/constants'
import styles from './NewsFilters.module.css'

const REGIONS = [
  'North America',
  'South America',
  'Europe',
  'Africa',
  'Asia',
  'Oceania',
  'Middle East',
]

const TOPICS = [
  'News',
  'Politics',
  'Economics',
  'Business',
  'Conflict',
  'Science',
  'Culture',
]

function FilterMenu({ label, items }) {
  return (
    <div className={styles.menuItem}>
      <button type="button" className={styles.trigger} aria-haspopup="true">
        {label}
      </button>
      <div className={styles.submenu} role="menu">
        {items.map((item) => (
          <button key={item} type="button" className={styles.submenuItem} role="menuitem">
            {item}
          </button>
        ))}
      </div>
    </div>
  )
}

function PeriodMenu({ selectedValue, onSelect }) {
  const currentLabel = PERIOD_OPTIONS.find((p) => p.value === selectedValue)?.label || 'Today'

  return (
    <div className={styles.menuItem}>
      <button type="button" className={styles.trigger} aria-haspopup="true">
        {currentLabel}
      </button>
      <div className={styles.submenu} role="menu">
        {PERIOD_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`${styles.submenuItem} ${option.value === selectedValue ? styles.selected : ''}`}
            role="menuitem"
            onClick={() => onSelect(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function NewsFilters({ period, onPeriodChange }) {
  return (
    <div className={styles.container}>
      <div className={styles.group}>
        <FilterMenu label="Global" items={REGIONS} />
        <FilterMenu label="News" items={TOPICS} />
        <PeriodMenu selectedValue={period} onSelect={onPeriodChange} />
      </div>
    </div>
  )
}

export default NewsFilters

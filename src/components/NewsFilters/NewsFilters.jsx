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

const TIMEFRAMES = ['Today', 'This week', 'This month']

function FilterMenu({ label, items }) {
  return (
    <div className={styles.menuItem}>
      <button
        type="button"
        className={styles.trigger}
        aria-haspopup="true"
      >
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

function NewsFilters() {
  return (
    <div className={styles.container}>
      <div className={styles.group}>
        <FilterMenu label="Global" items={REGIONS} />
        <FilterMenu label="News" items={TOPICS} />
        <FilterMenu label="Today" items={TIMEFRAMES} />
      </div>
    </div>
  )
}

export default NewsFilters

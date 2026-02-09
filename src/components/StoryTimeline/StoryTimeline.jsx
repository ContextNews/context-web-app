import { useMemo } from 'react'
import { formatDate, extractDateValue } from '../../lib/dates'
import styles from './StoryTimeline.module.css'

function StoryTimeline({ story }) {
  const entries = useMemo(() => {
    const related = story.related_stories
    if (!Array.isArray(related) || related.length === 0) return null

    const all = [
      { id: story.story_id, title: story.title, date: extractDateValue(story, ['story_period', 'updated_at']), isCurrent: true },
      ...related.map((rs) => ({
        id: rs.story_id,
        title: rs.title,
        date: extractDateValue(rs, ['story_period', 'updated_at']),
        isCurrent: false,
      })),
    ]

    all.sort((a, b) => {
      const ta = Date.parse(a.date) || 0
      const tb = Date.parse(b.date) || 0
      return tb - ta
    })

    return all
  }, [story])

  if (!entries) return null

  return (
    <div className={styles.timeline}>
      <div className={styles.title}>Timeline</div>
      <div className={styles.track}>
        {entries.map((entry, i) => (
          <div
            key={entry.id}
            className={`${styles.item} ${entry.isCurrent ? styles.itemCurrent : ''}`}
          >
            <div className={styles.rail}>
              <span className={styles.dot} />
              {i < entries.length - 1 && (
                <span className={styles.line} />
              )}
            </div>
            <div className={styles.content}>
              <span className={styles.itemTitle}>{entry.title}</span>
              {entry.date ? (
                <span className={styles.date}>{formatDate(entry.date)}</span>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default StoryTimeline

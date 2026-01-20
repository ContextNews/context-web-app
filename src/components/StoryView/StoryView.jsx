import { useState } from 'react'
import { sortArticlesByDate, formatArticleDate, formatStoryDate } from '../../lib/dates'
import CoverageBiasBar from '../CoverageBiasBar'
import styles from './StoryView.module.css'

function StoryView({ story, onBack, sourcesData }) {
  if (!story) return null

  const sortedArticles = sortArticlesByDate(story.articles || [])
  const [activeTab, setActiveTab] = useState('overview')
  const summary = story.summary || ''
  const keyPoints = Array.isArray(story.key_points) ? story.key_points : []
  const updatedLabel = formatStoryDate(story)

  return (
    <div className={styles.container}>
      <div className={styles.titleRow}>
        <h2 className={styles.title}>{story.title}</h2>
      </div>
      <div className={styles.controls}>
        <button
          type="button"
          className={styles.back}
          onClick={onBack}
          aria-label="Back to stories"
        >
          <span className={styles.backIcon} aria-hidden="true" />
        </button>
        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${activeTab === 'overview' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            type="button"
            className={`${styles.tab} ${activeTab === 'coverage' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('coverage')}
          >
            Coverage
          </button>
        </div>
      </div>
      <div className={styles.content}>
        {activeTab === 'overview' ? (
          <div className={styles.overview}>
            {summary ? (
              <p className={styles.summary}>{summary}</p>
            ) : (
              <p className={styles.summary}>Summary pending.</p>
            )}
            <div className={styles.info}>
              {story.primary_location ? (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Location</span>
                  <span className={styles.infoValue}>
                    {story.primary_location}
                  </span>
                </div>
              ) : null}
            </div>
            {keyPoints.length ? (
              <div>
                <div className={styles.pointsTitle}>Key points</div>
                <ul className={styles.pointsList}>
                  {keyPoints.map((point, index) => (
                    <li key={`${story.story_id}-point-${index}`}>{point}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {updatedLabel ? (
              <div className={styles.updated}>Updated {updatedLabel}</div>
            ) : null}
          </div>
        ) : (
          <div className={styles.coverage}>
            <CoverageBiasBar
              articles={sortedArticles}
              sources={sourcesData}
            />
            <div className={styles.list}>
              {sortedArticles.map((article) => {
                const dateLabel = formatArticleDate(article)
                return (
                  <div key={article.article_id} className={styles.item}>
                    <div className={styles.headline}>
                      {article.headline}
                    </div>
                    <div className={styles.meta}>
                      <span>{article.source}</span>
                      {dateLabel ? <span>{dateLabel}</span> : null}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default StoryView

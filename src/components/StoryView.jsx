import { useState } from 'react'
import { sortArticlesByDate, formatArticleDate, formatStoryDate } from '../lib/dates'
import CoverageBiasBar from './CoverageBiasBar'

function StoryView({ story, onBack, sourcesData }) {
  if (!story) return null

  const sortedArticles = sortArticlesByDate(story.articles || [])
  const [activeTab, setActiveTab] = useState('overview')
  const summary = story.summary || ''
  const keyPoints = Array.isArray(story.key_points) ? story.key_points : []
  const updatedLabel = formatStoryDate(story)

  return (
    <div className="story-view">
      <div className="story-view-title-row">
        <h2 className="story-view-title">{story.title}</h2>
      </div>
      <div className="story-view-controls">
        <button
          type="button"
          className="story-view-back"
          onClick={onBack}
          aria-label="Back to stories"
        >
          <span className="story-view-back-icon" aria-hidden="true" />
        </button>
        <div className="story-view-tabs">
          <button
            type="button"
            className={
              activeTab === 'overview'
                ? 'story-view-tab active'
                : 'story-view-tab'
            }
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            type="button"
            className={
              activeTab === 'coverage'
                ? 'story-view-tab active'
                : 'story-view-tab'
            }
            onClick={() => setActiveTab('coverage')}
          >
            Coverage
          </button>
        </div>
      </div>
      <div className="story-view-content">
        {activeTab === 'overview' ? (
          <div className="story-view-overview">
            {summary ? (
              <p className="story-view-summary">{summary}</p>
            ) : (
              <p className="story-view-summary">Summary pending.</p>
            )}
            <div className="story-view-info">
              {story.primary_location ? (
                <div className="story-view-info-item">
                  <span className="story-view-info-label">Location</span>
                  <span className="story-view-info-value">
                    {story.primary_location}
                  </span>
                </div>
              ) : null}
            </div>
            {keyPoints.length ? (
              <div className="story-view-points">
                <div className="story-view-points-title">Key points</div>
                <ul className="story-view-points-list">
                  {keyPoints.map((point, index) => (
                    <li key={`${story.story_id}-point-${index}`}>{point}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {updatedLabel ? (
              <div className="story-view-updated">Updated {updatedLabel}</div>
            ) : null}
          </div>
        ) : (
          <div className="story-view-coverage">
            <CoverageBiasBar
              articles={sortedArticles}
              sources={sourcesData}
            />
            <div className="story-view-list">
              {sortedArticles.map((article) => {
                const dateLabel = formatArticleDate(article)
                return (
                  <div key={article.article_id} className="story-view-item">
                    <div className="story-view-headline">
                      {article.headline}
                    </div>
                    <div className="story-view-meta">
                      <span className="story-view-source">
                        {article.source}
                      </span>
                      {dateLabel ? (
                        <span className="story-view-date">{dateLabel}</span>
                      ) : null}
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

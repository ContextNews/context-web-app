const sortByPublishedDate = (articles) => {
  const getTimestamp = (article) => {
    const value =
      article.published_at ||
      article.publishedAt ||
      article.published_date ||
      article.publishedDate ||
      article.date ||
      ''
    const parsed = Date.parse(value)
    return Number.isNaN(parsed) ? 0 : parsed
  }

  return [...articles].sort((a, b) => getTimestamp(b) - getTimestamp(a))
}

const formatDate = (article) => {
  const value =
    article.published_at ||
    article.publishedAt ||
    article.published_date ||
    article.publishedDate ||
    article.date ||
    ''
  const parsed = Date.parse(value)
  if (Number.isNaN(parsed)) return null
  return new Date(parsed).toLocaleDateString()
}

import { useState } from 'react'

const formatStoryDate = (value) => {
  if (!value) return null
  const parsed = Date.parse(value)
  if (Number.isNaN(parsed)) return null
  return new Date(parsed).toLocaleString()
}

function StoryView({ story, onBack }) {
  if (!story) return null

  const sortedArticles = sortByPublishedDate(story.articles || [])
  const [activeTab, setActiveTab] = useState('overview')
  const summary = story.summary || ''
  const keyPoints = Array.isArray(story.key_points) ? story.key_points : []
  const updatedLabel = formatStoryDate(story.updated_at || story.generated_at)

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
          <div className="story-view-list">
            {sortedArticles.map((article) => {
              const dateLabel = formatDate(article)
              return (
                <div key={article.article_id} className="story-view-item">
                  <div className="story-view-headline">{article.headline}</div>
                  <div className="story-view-meta">
                    <span className="story-view-source">{article.source}</span>
                    {dateLabel ? (
                      <span className="story-view-date">{dateLabel}</span>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default StoryView

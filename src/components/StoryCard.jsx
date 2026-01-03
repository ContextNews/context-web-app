function StoryCard({ story }) {
  return (
    <div className="story-card">
      <h2 className="story-title">{story.title}</h2>
      <div className="article-count">
        {story.articles.length} article{story.articles.length !== 1 ? 's' : ''}
      </div>
      <ul className="article-list">
        {story.articles.map((article) => (
          <li key={article.article_id} className="article-item">
            <span className="article-source">{article.source}</span>
            <span className="article-headline">{article.headline}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default StoryCard

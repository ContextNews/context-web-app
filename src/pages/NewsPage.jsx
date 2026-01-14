import StoryList from '../components/StoryList'

function NewsPage() {
  return (
    <div className="app-container">
      <div className="left-panel">
        <StoryList />
      </div>
      <div className="right-panel">
        {/* Reserved for future use */}
      </div>
    </div>
  )
}

export default NewsPage

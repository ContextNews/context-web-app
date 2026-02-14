import { Navigate, Route, Routes } from 'react-router-dom'
import MobileBlocker from './components/MobileBlocker'
import AboutPage from './pages/AboutPage'
import DataPage from './pages/DataPage'
import LandingPage from './pages/LandingPage'
import NewsPage from './pages/NewsPage'
import StoryPage from './pages/StoryPage'

function App() {
  return (
    <MobileBlocker>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/news/story/:storyId" element={<StoryPage />} />
        <Route path="/data" element={<DataPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MobileBlocker>
  )
}

export default App

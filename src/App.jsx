import LandingPage from './pages/LandingPage'
import NewsPage from './pages/NewsPage'

function App() {
  const path = window.location.pathname

  if (path === '/news') {
    return <NewsPage />
  }

  return <LandingPage />
}

export default App

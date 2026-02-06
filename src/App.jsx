import MobileBlocker from './components/MobileBlocker'
import LandingPage from './pages/LandingPage'
import NewsPage from './pages/NewsPage'

function App() {
  const path = window.location.pathname

  return (
    <MobileBlocker>
      {path === '/news' ? <NewsPage /> : <LandingPage />}
    </MobileBlocker>
  )
}

export default App

import MobileBlocker from './components/MobileBlocker'
import AboutPage from './pages/AboutPage'
import DataPage from './pages/DataPage'
import LandingPage from './pages/LandingPage'
import NewsPage from './pages/NewsPage'

function App() {
  const path = window.location.pathname

  let page
  if (path === '/news') page = <NewsPage />
  else if (path === '/data') page = <DataPage />
  else if (path === '/about') page = <AboutPage />
  else page = <LandingPage />

  return <MobileBlocker>{page}</MobileBlocker>
}

export default App

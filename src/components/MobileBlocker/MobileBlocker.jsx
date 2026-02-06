import { useState, useEffect } from 'react'
import styles from './MobileBlocker.module.css'

const MOBILE_QUERY = '(max-width: 768px)'

export default function MobileBlocker({ children }) {
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(MOBILE_QUERY).matches)

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY)
    const handler = (e) => setIsMobile(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  if (!isMobile) return children

  return (
    <div className={styles.blocker}>
      <p className={styles.line}>
        📱 this web-app is not yet compatible with mobile
      </p>
      <p className={styles.line}>
        🛠️ this web-app is still under active development and may be down, check the status at{' '}
        <a href="https://github.com/ContextNews" className={styles.link}>
          https://github.com/ContextNews
        </a>
      </p>
    </div>
  )
}

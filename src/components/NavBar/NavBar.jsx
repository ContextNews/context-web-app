import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthModal from '../AuthModal'
import styles from './NavBar.module.css'

function NavBar() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  return (
    <>
      <div className={styles.nav}>
        <Link to="/" className={styles.navTitle}>Context</Link>
        <div className={styles.navActions}>
          <button
            type="button"
            className={styles.loginButton}
            onClick={() => setIsAuthModalOpen(true)}
          >
            Login
          </button>
        </div>
      </div>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  )
}

export default NavBar

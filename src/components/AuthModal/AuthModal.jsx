import styles from './AuthModal.module.css'

function AuthModal({ isOpen, onClose }) {
  if (!isOpen) {
    return null
  }

  return (
    <div className={styles.overlay} role="presentation" onClick={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label="Login"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.fields}>
          <label className={styles.fieldLabel}>
            Username
            <input type="text" className={styles.input} autoComplete="username" />
          </label>
          <label className={styles.fieldLabel}>
            Password
            <input type="password" className={styles.input} autoComplete="current-password" />
          </label>
        </div>
        <div className={styles.actions}>
          <button type="button" className={styles.actionButton}>
            Login
          </button>
          <button type="button" className={styles.actionButton}>
            Sign Up
          </button>
        </div>
      </div>
    </div>
  )
}

export default AuthModal

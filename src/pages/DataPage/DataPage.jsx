import NavBar from '../../components/NavBar'
import styles from './DataPage.module.css'

function DataPage() {
  return (
    <div className={styles.container}>
      <NavBar />
      <div className={styles.content}>
        <h1 className={styles.heading}>Data</h1>
        <p className={styles.text}>Coming soon.</p>
      </div>
    </div>
  )
}

export default DataPage

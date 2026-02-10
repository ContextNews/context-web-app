import { useState } from 'react'
import NavBar from '../../components/NavBar'
import styles from './AboutPage.module.css'

const TABS = [
  {
    key: 'about',
    label: 'About',
    image: '/appscreenshot.png',
    text: 'Context is a news aggregation platform that surfaces global stories with geographic visualization and source-diversity analysis. Built as a portfolio project to demonstrate full-stack data ingestion, NLP clustering, and interactive front-end design.',
  },
  {
    key: 'pipeline',
    label: 'News Pipeline',
    image: '/pipelineimg.png',
    text: 'Stories are ingested, clustered, and enriched through a multi-stage pipeline before reaching the front end.',
  },
  {
    key: 'schema',
    label: 'Data Schema',
    image: '/schemaimg.png',
    text: 'A relational schema links stories, articles, sources, and entities to support filtering and bias analysis.',
  },
  {
    key: 'infrastructure',
    label: 'Infrastructure',
    image: '/awsimg.png',
    text: 'The platform runs on AWS with services for compute, storage, and delivery working together to serve the app.',
  },
]

function AboutPage() {
  const [activeTab, setActiveTab] = useState('about')
  const current = TABS.find((t) => t.key === activeTab)

  return (
    <div className={styles.container}>
      <NavBar />
      <div className={styles.content}>
        <div className={styles.box}>
          <div className={styles.boxTabs}>
            {TABS.map((tab) => (
              <button
                key={tab.key}
                className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className={styles.boxMiddle}>
            {current.image && (
              <img src={current.image} alt={current.label} className={styles.boxImage} />
            )}
          </div>
          <div className={styles.boxBottom}>
            <p className={styles.text}>{current.text}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutPage

import NewsMap from '../NewsMap'
import LineGraph from '../LineGraph'
import styles from './AnalyticsOverview.module.css'

function AnalyticsOverview({ stories, topLocations, topLocationSeries, topPeopleSeries, region }) {
  return (
    <>
      <div className={styles.mapSection}>
        <NewsMap stories={stories} topLocations={topLocations} region={region} />
      </div>
      <div className={styles.graphsSection}>
        <div className={styles.graphsInner}>
          <div className={styles.graphRow}>
            <LineGraph
              datasets={topLocationSeries?.datasets}
              labels={topLocationSeries?.labels}
              allowFallback={false}
            />
          </div>
          <div className={styles.graphRow}>
            <LineGraph
              datasets={topPeopleSeries?.datasets}
              labels={topPeopleSeries?.labels}
              allowFallback={false}
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default AnalyticsOverview

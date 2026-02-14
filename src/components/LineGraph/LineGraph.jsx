import { useMemo, useState } from 'react'
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import styles from './LineGraph.module.css'

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend)

const DEFAULT_SERIES = [8, 12, 9, 14, 10, 16, 13]
const HOVER_COLOR = 'rgba(255, 214, 10, 1)'
const DEFAULT_RANK_COLORS = [
  'rgba(255, 46, 62, 1)', // 1st
  'rgba(46, 168, 255, 1)', // 2nd
  'rgba(64, 64, 67, 1)', // 3rd
  'rgba(56, 56, 59, 1)', // 4th
  'rgba(48, 48, 51, 1)', // 5th
]

const getSeriesColor = (index, hoveredIndex) => {
  if (hoveredIndex === index) return HOVER_COLOR
  return DEFAULT_RANK_COLORS[index] || DEFAULT_RANK_COLORS[DEFAULT_RANK_COLORS.length - 1]
}

const formatDateLabel = (date) =>
  date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })

function buildLast7Days() {
  const today = new Date()
  const days = []
  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    days.push(date)
  }
  return days
}

function LineGraph({
  series = DEFAULT_SERIES,
  datasets,
  labels: labelsProp,
  allowFallback = true,
}) {
  const [hoveredDatasetIndex, setHoveredDatasetIndex] = useState(null)
  const fallbackDays = useMemo(() => buildLast7Days(), [])
  const fallbackLabels = useMemo(
    () => fallbackDays.map(formatDateLabel),
    [fallbackDays]
  )
  const labels = labelsProp?.length ? labelsProp : fallbackLabels

  const resolvedDatasets = useMemo(() => {
    if (Array.isArray(datasets) && datasets.length > 0) {
      return datasets.map((dataset, index) => {
        const color = getSeriesColor(index, hoveredDatasetIndex)
        return {
          label: dataset.label,
          data: dataset.data,
          borderColor: color,
          backgroundColor: color,
          borderWidth: 2,
          pointRadius: 0,
          pointHitRadius: 14,
          tension: 0.35,
        }
      })
    }

    if (!allowFallback) {
      return []
    }

    return [
      {
        data: series,
        borderColor: getSeriesColor(0, hoveredDatasetIndex),
        backgroundColor: getSeriesColor(0, hoveredDatasetIndex),
        borderWidth: 2,
        pointRadius: 0,
        pointHitRadius: 14,
        tension: 0.35,
      },
    ]
  }, [allowFallback, datasets, hoveredDatasetIndex, series])

  const data = useMemo(
    () => ({
      labels,
      datasets: resolvedDatasets,
    }),
    [labels, resolvedDatasets]
  )

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: { enabled: false },
      },
      scales: {
        x: {
          grid: { display: false },
          border: { color: 'rgba(255, 255, 255, 0.18)' },
          ticks: {
            color: 'rgba(255, 255, 255, 0.7)',
            font: { size: 11 },
            maxRotation: 0,
            autoSkip: false,
          },
        },
        y: {
          display: false,
          grid: { display: false },
          border: { display: false },
        },
      },
      interaction: {
        mode: 'nearest',
        intersect: false,
      },
      onHover: (_event, activeElements) => {
        if (activeElements.length > 0) {
          setHoveredDatasetIndex(activeElements[0].datasetIndex)
        } else {
          setHoveredDatasetIndex(null)
        }
      },
    }),
    []
  )

  const legendItems = useMemo(
    () =>
      resolvedDatasets
        .map((dataset, index) => ({ dataset, index }))
        .filter(({ dataset }) => dataset.label)
        .map(({ dataset, index }) => ({
          label: dataset.label,
          color: dataset.borderColor,
          index,
        })),
    [resolvedDatasets]
  )

  return (
    <div className={styles.container}>
      <div className={styles.legend} aria-hidden={legendItems.length === 0}>
        {legendItems.map((item) => (
          <div
            key={item.label}
            className={styles.legendItem}
            onMouseEnter={() => setHoveredDatasetIndex(item.index)}
            onMouseLeave={() => setHoveredDatasetIndex(null)}
          >
            <span
              className={styles.legendSwatch}
              style={{ backgroundColor: item.color }}
            />
            <span className={styles.legendLabel}>{item.label}</span>
          </div>
        ))}
      </div>
      <div className={styles.chart}>
        <Line data={data} options={options} />
      </div>
    </div>
  )
}

export default LineGraph

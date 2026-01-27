import { useMemo } from 'react'
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
const DEFAULT_COLORS = [
  'rgba(126, 203, 255, 0.95)',
  'rgba(255, 196, 108, 0.9)',
  'rgba(255, 132, 184, 0.9)',
  'rgba(130, 255, 187, 0.9)',
  'rgba(170, 150, 255, 0.9)',
]

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
  const fallbackDays = useMemo(() => buildLast7Days(), [])
  const fallbackLabels = useMemo(
    () => fallbackDays.map(formatDateLabel),
    [fallbackDays]
  )
  const labels = labelsProp?.length ? labelsProp : fallbackLabels

  const resolvedDatasets = useMemo(() => {
    if (Array.isArray(datasets) && datasets.length > 0) {
      return datasets.map((dataset, index) => {
        const color = dataset.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]
        return {
          label: dataset.label,
          data: dataset.data,
          borderColor: color,
          backgroundColor: color.replace('0.9', '0.2').replace('0.95', '0.2'),
          borderWidth: 2,
          pointRadius: 0,
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
        borderColor: DEFAULT_COLORS[0],
        backgroundColor: DEFAULT_COLORS[0].replace('0.95', '0.2'),
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.35,
      },
    ]
  }, [allowFallback, datasets, series])

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
    }),
    []
  )

  const legendItems = useMemo(
    () =>
      resolvedDatasets
        .filter((dataset) => dataset.label)
        .map((dataset) => ({
          label: dataset.label,
          color: dataset.borderColor,
        })),
    [resolvedDatasets]
  )

  return (
    <div className={styles.container}>
      <div className={styles.legend} aria-hidden={legendItems.length === 0}>
        {legendItems.map((item) => (
          <div key={item.label} className={styles.legendItem}>
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

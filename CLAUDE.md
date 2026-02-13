# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev      # Start dev server (http://localhost:5173), proxies /api/* to localhost:8000
npm run dev:aws  # Start dev server with AWS API config (uses .env.aws)
npm run build    # Production build to dist/
npm run preview  # Preview production build
```

## Deployment

Pushes to `main` trigger GitHub Actions: builds with `--mode aws`, syncs to S3 (`context-dev-frontend`), invalidates CloudFront.

## Architecture

React 18 + Vite news aggregation web app with geographic visualization.

### Routing

Simple path-based routing in `App.jsx` (no router library). All pages wrapped in `MobileBlocker`:
- `/` → LandingPage (animated 3D globe with regional news preview)
- `/news` → NewsPage (full news interface with story list, map, and analytics)
- `/data` → DataPage (placeholder)
- `/about` → AboutPage (tabbed info pages with images)

### Data Flow

**NewsPage** fetches from API endpoints (base URL from `VITE_API_BASE_URL`, defaults to `/api`):
- `GET /news/stories?period=&region=&topic=` — story list (re-fetches when filters change)
- `GET /news/stories/:id` — story detail (fetched on story select)
- `GET /news/sources` — source metadata with bias ratings
- `GET /news/analytics/top-locations?interval=hourly` — trending location data with time series
- `GET /news/analytics/top-people?interval=hourly` — trending people data with time series

Falls back to local `src/data/stories.json` when API is unavailable.

**LandingPage** fetches top stories from `GET /landing/top-stories` (array of `{ region, stories }` with snake_case region values). Stories are transformed to display-name keys using `REGION_STOPS`. Falls back to static `src/data/landing.json` when API is unavailable. Regional indices remain static from `landing.json`.

**API proxy**: Dev server proxies `/api/*` to `http://127.0.0.1:8000` (strips `/api` prefix).

### Key Components

- **NewsPage layout**: Left panel shows `NewsFilters` + `StoryList`, or `StoryView` when a story is selected. Right panel shows `AnalyticsOverview` (line graphs for trending locations/people), or `StoryViewEntities` + `StoryMap` when viewing a story.

- **LandingPage Globe** (`react-globe.gl` / Three.js): Auto-rotating 3D globe cycling through `REGION_STOPS` every 8 seconds with fade transitions.

- **StoryView**: Tabbed view with Overview (summary, key points, timeline) and Coverage (articles list with bias bar).

- **CoverageBiasBar**: Visualizes article source bias distribution (left → center → right).

- **LineGraph**: Reusable Chart.js line chart wrapper used by `AnalyticsOverview`.

- **StoryMap** (`react-simple-maps`): 2D Mercator map for individual story locations. Uses `/countries.geojson` for centroid lookup and `/countries-110m.json` for rendering.

### Shared Utilities (`src/lib/`)

- **api.js**: `apiUrl(path)` builder — prepends `VITE_API_BASE_URL` (or `/api`)
- **constants.js**: `LOCATION_ALIASES`, `BIAS_ORDER`, `BIAS_LABELS`, `REGION_STOPS`, `PERIOD_OPTIONS`, `REGION_OPTIONS`, `TOPIC_OPTIONS`
- **dates.js**: Date parsing/formatting utilities
- **normalize.js**: String normalization (`normalizeKey`, `normalizeBias`)

### Project Structure

Directory-per-component pattern with CSS Modules. Each component has `ComponentName.jsx`, `ComponentName.module.css`, and `index.js` (re-export).

### CSS Architecture

CSS Modules with shared CSS variables defined in `src/styles/globals.css`:
- `--color-brand`, `--color-accent-*`: Brand colors
- `--color-bg-*`, `--color-border-*`, `--color-text-*`: Theme tokens
- `--color-bias-*`: Bias visualization colors

### Data Structures

Stories: `story_id`, `title`, `summary`, `key_points[]`, `primary_location`, `articles[]`, `sub_stories[]`, `updated_at`

Articles: `article_id`, `headline`, `source`, `published_at`

Sources: `source`/`name`, `bias` (left, leans-left, center, leans-right, right)

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev      # Start dev server (http://localhost:5173)
npm run build    # Production build to dist/
npm run preview  # Preview production build
```

## Architecture

This is a React 18 + Vite news aggregation web app that displays global stories with geographic visualization.

### Routing

Simple path-based routing in `App.jsx` (no router library):
- `/` → LandingPage (animated 3D globe with regional news preview)
- `/news` → NewsPage (full news interface with map and story list)

### Data Flow

**NewsPage** fetches from two endpoints when `VITE_API_BASE_URL` is set:
- `/stories/` - news stories with articles
- `/sources_data` - source metadata including bias ratings

Falls back to local JSON files (`src/data/stories.json`, `src/data/landing.json`) when no API is configured.

**API proxy**: Dev server proxies `/api/*` to `http://127.0.0.1:8000` (strips `/api` prefix).

### Key Components

- **NewsMap** (`react-simple-maps`): 2D Mercator map showing story locations. Uses `/countries.geojson` for centroid lookup and `/countries-110m.json` for rendering. Location matching handles country aliases (US, UK, UAE, etc.).

- **LandingPage Globe** (`react-globe.gl` / Three.js): Auto-rotating 3D globe cycling through regions every 8 seconds.

- **StoryView**: Tabbed view with Overview (summary, key points) and Coverage (articles list with bias bar).

- **CoverageBiasBar**: Visualizes article source bias distribution (left → center → right) based on sources metadata.

### Shared Utilities (`src/lib/`)

- **api.js**: API URL builder with `VITE_API_BASE_URL` support
- **constants.js**: Shared constants (`LOCATION_ALIASES`, `BIAS_ORDER`, `BIAS_LABELS`, `REGION_STOPS`)
- **dates.js**: Date parsing/formatting utilities (`formatArticleDate`, `formatStoryDate`, `sortArticlesByDate`, etc.)
- **normalize.js**: String normalization (`normalizeKey`, `normalizeBias`)

### CSS Architecture

Uses CSS Modules for component-scoped styles with shared CSS variables:

- **`src/styles/globals.css`**: CSS custom properties and reset (imported in `main.jsx`)
- **`*.module.css`**: Component/page-specific styles (co-located with each component)

Key CSS variable prefixes in `:root`:
- `--color-brand`, `--color-accent-*`: Brand colors
- `--color-bg-*`: Background colors
- `--color-border-*`: Border colors
- `--color-text-*`: Text colors
- `--color-bias-*`: Bias visualization colors

### Data Structures

Stories have: `story_id`, `title`, `summary`, `key_points[]`, `primary_location`, `articles[]`, `sub_stories[]`, `updated_at`

Articles have: `article_id`, `headline`, `source`, `published_at`

Sources have: `source`/`name`, `bias` (left, leans-left, center, leans-right, right)

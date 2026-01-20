# Cleanup Plan

This document outlines issues found during code review and a phased plan to address them without breaking functionality.

---

## Issues Found

### 1. Root Directory Clutter

- **`story_articles_20260103_104444.json`** - Stray 65KB JSON file at project root. Appears to be old test/export data that doesn't belong here.

### 2. Monolithic CSS (App.css - 885 lines)

All styles for every component are in a single file with several problems:

- **Duplicate selectors**: `.news-page .story-meta` defined twice (lines 804, 882)
- **Duplicate definitions**: `.sub-story-card` defined twice (lines 808, 853)
- **Empty rule**: `.landing-region-fade {}` at line 117-118
- **No CSS variables**: Colors like `#e21a41`, `#404043`, `#171618`, `#f5f5f5` repeated throughout
- **Unusual units**: Uses `1in` for nav height (line 38) - works but unconventional for web

### 3. Import Order Violation (StoryView.jsx)

```jsx
// Lines 1-28: Helper functions defined
// Line 30: import { useState } from 'react'  <-- Should be at top
// Line 31: import CoverageBiasBar from './CoverageBiasBar'
```

### 4. Scattered Utility Functions

Helper functions are duplicated or scattered across components instead of centralized:

| Function | Location | Issue |
|----------|----------|-------|
| `normalizeKey()` | NewsMap.jsx:19, CoverageBiasBar.jsx:13 | Duplicated |
| `getStoryTimestamp()` | StoryList.jsx:3 | Could be shared |
| `sortByPublishedDate()` | StoryView.jsx:1 | Similar to getStoryTimestamp |
| `formatDate()` | StoryView.jsx:17 | Similar to formatStoryDate |
| `formatStoryDate()` | StoryView.jsx:33 | Redundant with formatDate |
| `getGeometryBounds()` | NewsMap.jsx:26 | Geo utility in component |
| `normalizeBias()` | CoverageBiasBar.jsx:15 | Bias utility in component |

### 5. Constants Mixed in Components

Configuration/constants embedded in component files:

| Constant | Location |
|----------|----------|
| `LOCATION_ALIASES` | NewsMap.jsx:4-17 |
| `BIAS_ORDER` | CoverageBiasBar.jsx:3 |
| `BIAS_LABELS` | CoverageBiasBar.jsx:5-11 |
| `stops` (region coords) | LandingPage.jsx:57-65 |

### 6. No Shared Color/Theme Constants

These colors appear repeatedly in CSS and could be variables:
- `#e21a41` / `#e31b41` (brand red - note inconsistent spelling)
- `#171618` (dark background)
- `#404043` (border color)
- `#f5f5f5` (light text)
- `#8b8a90` (muted text)
- `#7ecbff` (accent blue)

---

## Cleanup Plan

### Phase 1: Quick Wins (Low Risk)

These changes are isolated and won't affect functionality:

1. **Delete stray JSON file**
   - Remove `story_articles_20260103_104444.json` from project root

2. **Fix import order in StoryView.jsx**
   - Move `import { useState }` and `import CoverageBiasBar` to top of file

3. **Clean up CSS**
   - Remove duplicate `.news-page .story-meta` (keep first, delete line 882-884)
   - Remove duplicate `.sub-story-card` (keep second at line 853, delete 808-819)
   - Remove empty `.landing-region-fade {}` rule
   - Standardize brand red to `#e21a41` (fix `#e31b41` variants)

### Phase 2: Extract Utilities (Medium Risk)

Create `src/lib/` utilities to centralize shared logic:

1. **Create `src/lib/dates.js`**
   ```
   - parseDate(value) - handles multiple date field names
   - formatDate(value) - returns localized date string
   - formatDateTime(value) - returns localized datetime string
   - sortByDate(items, dateAccessor) - generic date sorter
   ```

2. **Create `src/lib/normalize.js`**
   ```
   - normalizeKey(value) - lowercase, trim, normalize whitespace
   - normalizeBias(bias) - standardize bias values
   ```

3. **Update components to import from utilities**
   - StoryView.jsx → use dates.js
   - StoryList.jsx → use dates.js
   - NewsMap.jsx → use normalize.js
   - CoverageBiasBar.jsx → use normalize.js, dates.js

### Phase 3: Extract Constants (Medium Risk)

1. **Create `src/lib/constants.js`**
   ```
   - LOCATION_ALIASES - country name mappings
   - BIAS_ORDER - left to right bias scale
   - BIAS_LABELS - display names for bias values
   - REGION_STOPS - globe animation waypoints (from LandingPage)
   ```

2. **Update components to import constants**
   - NewsMap.jsx → import LOCATION_ALIASES
   - CoverageBiasBar.jsx → import BIAS_ORDER, BIAS_LABELS
   - LandingPage.jsx → import REGION_STOPS

### Phase 4: CSS Refactor (Higher Risk - Optional)

This phase is more involved. Consider deferring until the app is more stable.

**Option A: CSS Variables (Minimal Change)**

Add to top of App.css:
```css
:root {
  --color-brand: #e21a41;
  --color-bg-dark: #171618;
  --color-border: #404043;
  --color-text-light: #f5f5f5;
  --color-text-muted: #8b8a90;
  --color-accent-blue: #7ecbff;
}
```
Then find/replace hardcoded values.

**Option B: Component CSS Modules (Larger Change)**

Split App.css into:
```
src/
  components/
    NewsMap/
      NewsMap.jsx
      NewsMap.module.css
    StoryCard/
      StoryCard.jsx
      StoryCard.module.css
    ...
  pages/
    LandingPage/
      LandingPage.jsx
      LandingPage.module.css
    NewsPage/
      NewsPage.jsx
      NewsPage.module.css
  styles/
    globals.css (reset, body, shared)
    variables.css (CSS custom properties)
```

---

## Recommended Execution Order

1. **Phase 1** - Do immediately, no risk
2. **Phase 2** - Do next, moderate benefit
3. **Phase 3** - Do with Phase 2
4. **Phase 4 Option A** - Quick win for maintainability
5. **Phase 4 Option B** - Defer until adding more features

---

## Testing After Each Phase

After each phase, verify:
- [ ] `npm run dev` starts without errors
- [ ] Landing page loads with rotating globe
- [ ] `/news` page loads with story list
- [ ] Clicking a story shows StoryView
- [ ] Coverage tab shows bias bar
- [ ] Map displays markers for story locations

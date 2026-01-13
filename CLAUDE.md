# CLAUDE.md - Power Broker Atlas

This document provides a comprehensive guide to the Power Broker Atlas codebase for AI assistants and developers.

## Project Overview

The Power Broker Atlas is a data-driven, interactive visualization inspired by Robert Caro's "The Power Broker." It maps chapters and events across time to visualize how power shifts with infrastructure development in New York City, focusing on Robert Moses's rise and fall.

**Key Features:**
- Chapter and year-based navigation with search
- Event feed with tags, summaries, and quote snippets
- Interactive MapLibre GL map displaying builds filtered by year
- Power Index score that tracks power dynamics over time
- Method-based filtering (legal authority, budget control, etc.)

## Tech Stack

### Core Technologies
- **Next.js 16.1.1** - App Router architecture
- **React 19.2.3** - Latest React with concurrent features
- **TypeScript 5** - Strict type checking enabled
- **MapLibre GL 5.15.0** - Client-side mapping library
- **Tailwind CSS 4** - Utility-first CSS with custom theme

### Development Tools
- **ESLint** - Linting with Next.js config
- **PostCSS** - CSS processing
- **npm** - Package management

## Directory Structure

```
power-broker-atlas/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx         # Root layout with fonts
│   │   ├── page.tsx           # Home page (wrapper)
│   │   ├── globals.css        # Global styles & theme
│   │   ├── chapter/[n]/       # Dynamic chapter routes
│   │   ├── year/[yyyy]/       # Dynamic year routes
│   │   └── event/[id]/        # Dynamic event routes
│   ├── components/            # React components
│   │   ├── PowerBrokerPage.tsx  # Main application component
│   │   ├── EventFeed.tsx        # Event list display
│   │   ├── MapPanel.tsx         # MapLibre map component
│   │   ├── PowerIndex.tsx       # Power score indicator
│   │   └── ShareButton.tsx      # Social sharing
│   ├── lib/                   # Utilities and business logic
│   │   ├── types.ts          # TypeScript type definitions
│   │   └── selectors.ts      # Data filtering and computation
│   ├── data/                  # Static JSON data files
│   │   ├── chapters.json     # Book chapters
│   │   ├── events.json       # Historical events
│   │   ├── stakeholders.json # People and institutions
│   │   ├── edges.json        # Relationships between stakeholders
│   │   ├── builds.json       # GeoJSON build data
│   │   └── builds.geojson    # Alternative format
│   └── types/
│       └── geojson.d.ts      # GeoJSON type declarations
├── public/                    # Static assets
│   ├── *.svg                 # Icon files
│   └── favicon.ico
├── package.json
├── tsconfig.json
├── next.config.ts
├── eslint.config.mjs
├── postcss.config.mjs
└── README.md
```

## Data Architecture

### Core Data Types

Located in `src/lib/types.ts`:

#### Chapter
```typescript
{
  number: number;           // Chapter number
  title: string;           // Chapter title
  summary: string;         // Brief description
  year_start: number;      // Starting year
  year_end: number;        // Ending year
}
```

#### Event
```typescript
{
  id: string;                    // Unique identifier
  title: string;                 // Event title
  summary: string;               // Description
  year_start: number;            // When event began
  year_end: number;              // When event ended
  chapter_refs: ChapterRef[];    // Related chapters
  type: EventType;               // Event category
  methods: string[];             // Power methods used
  stakeholders: string[];        // Involved parties
  power_delta: number;           // Impact on power score
  quote_snippet?: string;        // Optional quote
  sources: Source[];             // Citations
}
```

**Event Types:** `"build" | "policy" | "appointment" | "finance" | "opposition" | "media" | "legal"`

#### Stakeholder
```typescript
{
  id: string;
  name: string;
  type: "person" | "institution";
  description: string;
}
```

#### Edge (Relationship)
```typescript
{
  source_id: string;
  target_id: string;
  relation: "ally" | "opponent" | "controls" | "influences";
  year_start: number;
  year_end: number;
  chapter_refs: number[];
  weight: number;              // Strength of relationship
}
```

#### BuildProperties (GeoJSON)
```typescript
{
  id: string;
  name: string;
  category: string;           // e.g., "expressway", "pool", "bridge"
  year_start: number;
  year_end: number;
  chapter_refs: number[];
  status: "proposed" | "under_construction" | "completed";
  primary_event_id: string;   // Links to events.json
}
```

### Method Tags

Defined in `src/lib/selectors.ts`:

- `legal_authority` - Legal Authority
- `budget_control` - Budget Control
- `bureaucratic_insulation` - Bureaucratic Insulation
- `patronage_procurement` - Patronage Procurement
- `agenda_setting` - Agenda Setting
- `public_narrative` - Public Narrative
- `engineering_as_politics` - Engineering as Politics
- `process_bulldozing` - Process Bulldozing
- `federal_leverage` - Federal Leverage
- `institution_building` - Institution Building

## Component Architecture

### PowerBrokerPage (Main Component)

**File:** `src/components/PowerBrokerPage.tsx`

The main application component managing state and layout. Uses client-side rendering (`"use client"`).

**State Management:**
- `mode`: Toggle between "year" and "chapter" navigation
- `activeYear`: Currently selected year
- `selectedChapter`: Currently selected chapter number
- `selectedTags`: Active method filters
- `focusedEventId`: Currently highlighted event
- `chapterSearch`: Search query for chapters

**Key Functions:**
- `navigateToYear(year)` - Switch to year mode and update year
- `navigateToChapter(chapter)` - Switch to chapter mode
- `toggleTag(tag)` - Add/remove method filters
- `handleEventSelect(eventId)` - Focus on specific event

**Layout:**
Three-column responsive grid:
1. Left sidebar: Navigation (chapter/year selector, search, current window)
2. Center: MapPanel with build visualization
3. Right sidebar: Method filters and EventFeed

### EventFeed Component

**File:** `src/components/EventFeed.tsx`

Displays filtered events with interactive cards.

**Props:**
- `events: Event[]` - Filtered events to display
- `focusedEventId?: string` - ID of focused event
- `activeYear: number` - Current year for completion status
- `onSelect: (eventId: string) => void` - Event selection callback

**Features:**
- Shows up to 8 events (sliced in parent)
- Displays "Completed" badge for builds finished by activeYear
- Shows event methods as tags
- Includes quote snippets when available
- Empty state message when no events match filters

### MapPanel Component

**File:** `src/components/MapPanel.tsx`

Client-side MapLibre GL map displaying builds.

**Props:**
- `activeYear: number` - Filter builds by construction year
- `activeEventIds: string[]` - Highlight specific events

**Map Configuration:**
- Center: `[-73.94, 40.75]` (NYC)
- Zoom: `10.2`
- Pitch: `20` (slight 3D tilt)
- Base tiles: OpenStreetMap

**Layers:**
1. **build-polygons** - Parks, housing (fill layer)
   - Colors: Park (#c8b28b), Housing (#d0c3aa)

2. **build-lines** - Expressways, parkways (line layer)
   - Colors: Expressway (#c1121f red), Parkway (#2f2a20 dark)
   - Dashed lines for "under_construction" status

3. **build-points** - Pools, bridges (circle layer)
   - Colors: Pool (#2f2a20), Bridge (#c1121f)

**Filtering Logic:**
- Shows builds where `year_start <= activeYear`
- Filters by `activeEventIds` when tags are selected
- Excludes "contested" category builds

### PowerIndex Component

**File:** `src/components/PowerIndex.tsx`

Displays the power score indicator (not fully examined, but referenced in PowerBrokerPage).

## Utility Functions (selectors.ts)

**File:** `src/lib/selectors.ts`

### Data Filtering

- `filterEventsByYear(events, year, tags, includeOpposition)` - Get events active in a year
- `filterEventsByChapter(events, chapter, tags, includeOpposition)` - Get events in a chapter
- `filterEdgesByYear(edges, year)` - Get relationships active in a year
- `filterEdgesByChapter(edges, chapter)` - Get relationships in a chapter

### Data Retrieval

- `getChapterByNumber(chapters, number)` - Find chapter by number
- `getEventById(events, id)` - Find event by ID
- `resolveStakeholders(stakeholders, ids)` - Map IDs to stakeholder objects

### Computation

- `computePowerIndex(events, activeYear, includeOpposition, base)` - Calculate power score
  - Sums `power_delta` from completed events
  - Base score: 46 (configurable)
  - Clamped to 0-100 range
  - Returns score and label (Peak/Rising/Contested/Declining)

- `getActiveYear(mode, value, chapters, event, fallbackYear)` - Determine display year
  - Year mode: returns value
  - Chapter mode: returns chapter's year_end
  - Event mode: returns event's year_end

### Formatting

- `formatYearRange(start, end)` - Format as "1924" or "1924-1934"
- `getYearExtent(events, chapters)` - Find min/max years in data

## Styling System

### Custom Theme

**File:** `src/app/globals.css`

**CSS Variables:**
```css
--paper: #f5f0e6    /* Cream background */
--ink: #1d1b16      /* Dark text */
--ember: #c1121f    /* Accent red */
--sepia: #d5c6aa    /* Warm brown */
--shadow: rgba(14, 13, 10, 0.08)
```

**Tailwind Custom Colors:**
- `paper` - Background color
- `ink` - Text color
- `ember` - Accent/highlight
- `sepia` - Secondary accent

**Fonts:**
- Display/Heading: Libre Baskerville (serif)
- Body: Work Sans (sans-serif)

### Custom CSS Classes

- `.map-shell` - Rounded container for map with shadow and grain overlay
- `.ink-stamp` - Pill-shaped badge for "Completed" status
- `.font-heading` - Apply display font to any element

### Design Patterns

1. **Rounded Corners:** Most UI elements use `rounded-2xl` (16px) or `rounded-xl` (12px)
2. **Borders:** Subtle borders with `border-ink/10` (10% opacity)
3. **Backgrounds:** Layered with `bg-white/70` (70% opacity white)
4. **Shadows:** Soft shadows with custom `--shadow` variable
5. **Transitions:** Smooth hover effects with Tailwind's `transition`
6. **Typography:** Uppercase tracking for labels (`tracking-[0.3em]`)

## Development Workflow

### Setup

```bash
npm install
npm run dev          # Development server (http://localhost:3000)
```

### Build & Production

```bash
npm run build        # Production build
npm run start        # Run production build locally
```

### Linting

```bash
npm run lint         # Run ESLint
```

### TypeScript Configuration

**File:** `tsconfig.json`

- **Strict mode enabled:** Full type checking
- **Path alias:** `@/*` maps to `./src/*`
- **Target:** ES2017
- **Module resolution:** bundler (Next.js optimized)
- **JSX:** react-jsx (automatic runtime)

## Key Conventions

### 1. Client vs Server Components

- **Server components** (default): `layout.tsx`, dynamic route pages
- **Client components** (`"use client"`): Interactive components with hooks
  - PowerBrokerPage
  - EventFeed
  - MapPanel

### 2. Data Loading

- Static JSON imports: `import data from "@/data/file.json"`
- Type assertions: `as Chapter[]` or `as Event[]`
- No external API calls (all data is bundled)

### 3. State Management

- Local React state (useState, useMemo)
- No external state management library
- Props drilling for component communication

### 4. File Naming

- Components: PascalCase (e.g., `PowerBrokerPage.tsx`)
- Utilities: camelCase (e.g., `selectors.ts`)
- Data: kebab-case (e.g., `builds.json`)

### 5. Type Safety

- Explicit types for all component props
- Type files centralized in `src/lib/types.ts`
- No `any` types (strict mode enforced)

### 6. Import Aliases

Always use `@/` prefix for internal imports:
```typescript
import { Event } from "@/lib/types";
import EventFeed from "@/components/EventFeed";
import data from "@/data/events.json";
```

### 7. Dynamic Routes

Current routes redirect to home page. To implement:
- Extract query params from `params` object
- Pass to PowerBrokerPage as props
- Update PowerBrokerPage to accept external state

Example pattern:
```typescript
// src/app/year/[yyyy]/page.tsx
export default function YearPage({ params }: { params: { yyyy: string } }) {
  const year = Number(params.yyyy);
  // Render PowerBrokerPage with year prop
}
```

### 8. GeoJSON Handling

- MapLibre expects GeoJSON FeatureCollection format
- Properties are typed in `BuildProperties` interface
- Geometry types: Point, LineString, Polygon
- Each feature has `properties.primary_event_id` linking to events

### 9. Event Filtering Logic

Three filter dimensions:
1. **Time:** Year or chapter range
2. **Methods:** Selected tag array
3. **Opposition:** Boolean toggle (not currently exposed in UI)

Filter order matters:
1. Apply time filter
2. Apply opposition filter
3. Apply tag filter (OR logic - any matching tag)
4. Sort by `year_start` ascending

### 10. Power Index Calculation

Formula:
```
base (46) + sum(power_delta for all events where year_end <= activeYear)
```

Clamped to [0, 100], labeled:
- 75+ = "Peak"
- 60-74 = "Rising"
- 45-59 = "Contested"
- 0-44 = "Declining"

## Adding New Features

### Adding a New Event

1. Add entry to `src/data/events.json`:
```json
{
  "id": "new-event",
  "title": "Event Title",
  "summary": "Description",
  "year_start": 1940,
  "year_end": 1945,
  "chapter_refs": [{ "chapter": 5 }],
  "type": "build",
  "methods": ["legal_authority", "budget_control"],
  "stakeholders": ["robert_moses"],
  "power_delta": 3,
  "sources": [{ "citation": "Source citation" }]
}
```

2. If it's a build, add GeoJSON feature to `src/data/builds.json`:
```json
{
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": [-73.94, 40.75]
  },
  "properties": {
    "id": "build-id",
    "name": "Build Name",
    "category": "bridge",
    "year_start": 1940,
    "year_end": 1945,
    "chapter_refs": [5],
    "status": "completed",
    "primary_event_id": "new-event"
  }
}
```

### Adding a New Method Tag

1. Add to `methodTags` array in `src/lib/selectors.ts`
2. Add display label to `tagLabels` object
3. Update events to use the new method

### Adding a New Component

1. Create in `src/components/ComponentName.tsx`
2. Use `"use client"` if it needs interactivity
3. Import types from `@/lib/types`
4. Follow naming conventions (PascalCase)
5. Add to PowerBrokerPage or relevant parent

### Extending the Map

To add new map layers:
1. Add data to `builds.json` with appropriate category
2. Update MapPanel filters in `map.addLayer()`
3. Add color mappings in paint properties
4. Consider geometry type (Point/LineString/Polygon)

## Testing Considerations

Currently no test framework configured. To add:

1. **Unit tests:** Jest + React Testing Library
2. **E2E tests:** Playwright or Cypress
3. **Type checking:** `npm run type-check` script with `tsc --noEmit`

## Performance Considerations

1. **Data size:** All JSON is bundled. Keep data files under 1MB each
2. **Map rendering:** MapLibre handles efficiently, but limit features to 1000s
3. **Filtering:** Selectors run on every state change. Consider memoization for large datasets
4. **Images:** Currently minimal. Use Next.js Image component if adding photos

## Common Pitfalls

1. **Forgot `"use client"`:** Components with hooks must declare client directive
2. **Type assertions:** Remember to cast JSON imports: `as Event[]`
3. **Path aliases:** Always use `@/` not relative paths like `../`
4. **GeoJSON format:** MapLibre requires exact FeatureCollection structure
5. **Year filtering:** Inclusive range - check both `year_start` and `year_end`
6. **Map initialization:** Only initialize once (use ref and conditional)
7. **Event IDs:** Must be unique and match between events.json and builds.json

## Future Enhancements

Potential areas for expansion:

1. **URL state management:** Use query params for year/chapter/event
2. **Network graph:** Visualize stakeholder edges
3. **Timeline view:** Horizontal timeline with event markers
4. **Search:** Full-text search across events and chapters
5. **Mobile optimization:** Better responsive behavior for small screens
6. **Data visualization:** Charts for power index over time
7. **Tooltips:** Map hover popups for build details
8. **Animations:** Smooth transitions between years
9. **Accessibility:** ARIA labels, keyboard navigation
10. **PDF export:** Generate printable atlas pages

## API Routes (Future)

Currently no API routes. If adding:
- Create in `src/app/api/` directory
- Use for dynamic data fetching
- Consider caching strategies
- Add CORS headers if needed

## Environment Variables

Currently none used. If adding:
- Prefix with `NEXT_PUBLIC_` for client-side access
- Add to `.env.local` (gitignored)
- Document required variables in this file

## Deployment

Optimized for Vercel (Next.js creator):
- Zero configuration deployment
- Automatic HTTPS
- Edge functions support
- Automatic previews for PRs

Alternative platforms:
- Netlify
- AWS Amplify
- Docker container
- Static export (`output: 'export'` in next.config.ts)

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [MapLibre GL JS API](https://maplibre.org/maplibre-gl-js/docs/)
- [Tailwind CSS v4 Docs](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [The Power Broker (book)](https://en.wikipedia.org/wiki/The_Power_Broker)

## Questions or Issues

When encountering issues:

1. Check TypeScript errors: `npx tsc --noEmit`
2. Verify data structure matches types in `src/lib/types.ts`
3. Check browser console for client-side errors
4. Verify GeoJSON format: [geojson.io](https://geojson.io/)
5. Check Next.js build output for warnings

---

**Last Updated:** 2026-01-13
**Version:** 0.1.0
**Maintainer:** Power Broker Atlas Team

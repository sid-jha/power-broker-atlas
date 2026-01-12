# Power Broker Atlas

Data-driven atlas inspired by The Power Broker, mapping chapters and events
across time to visualize how power shifts with infrastructure.

## Features
- Chapter and year navigation with search
- Event feed with tags, summaries, and quote snippets
- MapLibre map of builds filtered by year and focused events
- Power Index score for the active time window

## Tech stack
- Next.js App Router
- MapLibre GL
- Tailwind CSS
- TypeScript

## Getting started
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
npm run start
```

## Lint
```bash
npm run lint
```

## Data
JSON and GeoJSON sources live in `src/data`.

# Project Pinnacle

Road to Gamble Sands - a premium, mobile-first golf performance web app for Matthew "Matt" Wixted.

## Stack

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS
- LocalStorage persistence (MVP)
- PWA-ready manifest

## Features

- Bottom-tab mobile UX: **Today / Practice / Recovery / Stats / Tournament**
- Daily readiness scoring (sleep, energy, body, stress, confidence) with color-coded training guidance
- Daily checklist system with day reset behavior and completion streaks
- 7-week periodization overview and day-by-day training structure
- Deep drill library with metrics and quick logging
- Recovery and mobility routines (hips, back, shoulders, wrists/forearms)
- Strength A / Strength B protocols with deload guidance
- Round logging + performance dashboard metrics:
  - Average score, fairways, GIR, putts, penalties, doubles, soreness trend
  - Best round and recent 5-round trend
- Tournament command center:
  - Week schedule
  - 40-minute warm-up
  - Emergency swing fixes by miss pattern
  - Packing checklist
  - Binder/manual quick cards
- Customization panel for date, course, handicap, schedule, drill targets, and more

## LocalStorage keys

- `pp-settings`
- `pp-readiness`
- `pp-practice`
- `pp-rounds`
- `pp-checklist`
- `pp-habits`

## Development

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Production build

```bash
npm run build
npm run start
```

## Deploying

This app is ready to deploy to Vercel as a standard Next.js project.

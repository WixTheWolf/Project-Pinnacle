# Project Pinnacle

**Road to Gamble Sands**

A mobile-first personal performance operating system for tournament golf preparation.

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- Recharts
- LocalStorage (MVP) → Supabase (future)
- PWA-ready manifest

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
/app          → Routes (Today, Plan, Practice, Recovery, Performance, Tournament)
/components   → Shared UI and layout
/features     → Feature modules (components, hooks, types, utils)
/hooks        → Global hooks (PinnacleProvider, data persistence)
/lib          → Utilities, constants, seed data, readiness & plan logic
/styles       → Global CSS and design tokens
/types        → Shared TypeScript interfaces
```

## Core Areas

| Tab | Route | Purpose |
|-----|-------|---------|
| Today | `/today` | Daily command center — what to do first |
| Plan | `/plan` | Road to Gamble Sands, periodization, weekly focus |
| Practice | `/practice` | Focused drills and session logging |
| Recovery | `/recovery` | Mobility, sleep, readiness inputs |
| Performance | `/performance` | Insight-driven scoring trends and round log |
| Event | `/tournament` | Gamble Sands prep, packing, warmup, journal |

`/stats` redirects to `/performance` for backward compatibility.

## Architecture

- **Feature-based modules** — each screen owns its components and docs
- **LocalStorage abstraction** — swap to Supabase without refactoring components
- **PinnacleProvider** — centralized state with typed actions
- **Dark mode first** — premium Whoop-inspired design system

## User

Matthew Wixted · 12.4 handicap → 3 handicap goal · Gamble Sands Aug 20–23

## Production build

```bash
npm run build
npm run start
```

## Deploying

This app is ready to deploy to Vercel as a standard Next.js project.

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
/app          → Routes (Today, Plan, Practice, Recovery, Performance, Field, Tournament)
/components   → Shared UI and layout
/features     → Feature modules (components, hooks, types, utils)
/hooks        → Global hooks (PinnacleProvider, data persistence)
/lib          → Utilities, constants, seed data, field roster, plan logic
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
| Field | `/field` | Strand Invitational roster scouting and matchup insights |
| Event | `/tournament` | Gamble Sands prep, packing, warmup, journal |

`/stats` redirects to `/performance` for backward compatibility.

## Field scouting

Premium Field screen for the Gamble Sands group:

- Featured **You** card with skill profile
- Player profile cards with strengths, weaknesses, style, notes, and matchup insight
- Skill bars across driving, approach, wedges, putting, short game, course management, mental game, and durability
- Quick comparison card for handicap and top skill edges
- Roster data in `lib/field-data.ts` (Strand Invitational public feed snapshot)

## Architecture

- **Feature-based modules** — each screen owns its components and docs
- **LocalStorage abstraction** — swap to Supabase without refactoring components
- **PinnacleProvider** — centralized state with typed actions (`pinnacle-state-v1`)
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

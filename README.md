# Project Pinnacle

**Road to Gamble Sands**

A personal performance operating system for tournament golf preparation.

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui patterns
- Framer Motion
- Recharts
- React Hook Form + Zod
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
/app          → Routes (Today, Practice, Recovery, Stats, Tournament)
/components   → Shared UI and layout
/features     → Feature modules (components, hooks, types, utils)
/hooks        → Global hooks (PinnacleProvider, data persistence)
/lib          → Utilities, constants, seed data, readiness logic
/styles       → Global CSS and design tokens
/types        → Shared TypeScript interfaces
```

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

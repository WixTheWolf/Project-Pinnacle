# Project Pinnacle Development Patterns

> Repo skill aligned to canonical architecture (July 2026)

## Overview

Project Pinnacle is a mobile-first Next.js golf performance app. The app uses **multi-route pages** with bottom-tab navigation and feature modules. All agents must extend this codebase — not create parallel implementations.

## Shared product goal

- Tournament: Gamble Sands (The Strand Invitational), Aug 20–23, 2026
- Handicap target: 12.4 → 3
- Score target: 79–84
- Production: https://project-pinnacle.vercel.app

## Architecture

| Path | Purpose |
|------|---------|
| `app/today/page.tsx` | Daily command center |
| `app/plan/page.tsx` | Periodization & weekly focus |
| `app/practice/page.tsx` | Drills & session logging |
| `app/recovery/page.tsx` | Mobility, sleep, readiness |
| `app/performance/page.tsx` | Insight-driven scoring trends |
| `app/tournament/page.tsx` | Gamble Sands prep |
| `features/*` | Feature modules (components, docs) |
| `hooks/use-pinnacle-data.tsx` | PinnacleProvider state |
| `lib/storage/*` | localStorage abstraction |
| `types/index.ts` | Domain types |

## Coding conventions

### File naming

- **kebab-case** for non-component files: `use-pinnacle-data.tsx`
- **PascalCase** for React components: `TodayScreen`, `StatCard`

### Imports

Use `@/` alias imports:

```typescript
import { usePinnacle } from "@/hooks/use-pinnacle-data";
import { getPerformanceInsights } from "@/lib/performance-insights";
```

### LocalStorage keys

Stable keys — do not rename without migration:

- `pinnacle-state-v1` (via `STORAGE_KEYS.PINNACLE_STATE`)

### Commits

Conventional commits:

```
feat: add recovery streak badge to Today tab
fix: persist checklist across tab switches
```

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local development |
| `npm run lint` | ESLint (zero warnings) |
| `npm run typecheck` | TypeScript check |
| `npm run build` | Production build |

## Agent coordination

Read `AGENTS.md` before any structural change. Codex sub-agents (explorer, reviewer, docs-researcher) are read-only helpers defined in `.codex/agents/`.

## Testing

No test suite yet. When adding tests, use `*.test.ts` / `*.test.tsx` naming and colocate or use `__tests__/`.

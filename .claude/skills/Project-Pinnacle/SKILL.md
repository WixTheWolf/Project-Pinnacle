# Project Pinnacle Development Patterns

> Repo skill aligned to canonical `main` architecture (July 2026)

## Overview

Project Pinnacle is a mobile-first Next.js golf performance app. The production app lives on `main` as a **single-page app** with bottom-tab navigation. All agents must extend this codebase — not create parallel implementations.

## Shared product goal

- Tournament: Gamble Sands (The Strand Invitational), Aug 20–23, 2026
- Handicap target: 12.4 → 3
- Score target: 79–84
- Production: https://project-pinnacle.vercel.app

## Architecture

| Path | Purpose |
|------|---------|
| `app/page.tsx` | All five tabs: Today, Practice, Recovery, Stats, Tournament |
| `components/ui.tsx` | Shared UI components |
| `hooks/use-local-storage.ts` | Persistence hook |
| `lib/types.ts` | Domain types |
| `lib/content.ts` | Drills, defaults, tournament content |

## Coding conventions

### File naming

- **kebab-case** for non-component files: `use-local-storage.ts`
- **PascalCase** for React components in `components/ui.tsx`

### Imports

Use `@/` alias imports:

```typescript
import { Settings } from "@/lib/types";
import { DEFAULT_SETTINGS } from "@/lib/content";
import { useLocalStorage } from "@/hooks/use-local-storage";
```

### LocalStorage keys

Stable keys — do not rename without migration:

- `pp-settings`, `pp-readiness`, `pp-practice`, `pp-rounds`, `pp-checklist`, `pp-habits`

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

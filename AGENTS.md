# Project Pinnacle — Agent Coordination

All agents working in this repository share **one product goal** and **one canonical codebase**. Read this file before making changes.

## Shared product goal

**Project Pinnacle: Road to Gamble Sands** — a mobile-first golf performance operating system for Matthew "Matt" Wixted.

| Target | Value |
|--------|-------|
| Tournament | The Strand Invitational @ Gamble Sands, Brewster WA |
| Tournament dates | Aug 20–23, 2026 |
| Handicap | 12.4 → **3** |
| Score target | **79–84** |
| Production URL | https://project-pinnacle.vercel.app |

Every feature, fix, and refactor should move Matt closer to tournament readiness — not introduce parallel apps or conflicting architectures.

## Canonical architecture (do not fork)

**Branch:** `main` (active development on feature branches merges here)  
**Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, localStorage persistence  
**Layout:** Multi-route app with bottom-tab navigation

```
app/today/page.tsx           ← daily command center ("What should Matt do today?")
app/plan/page.tsx            ← periodization & weekly focus
app/practice/page.tsx        ← drills & session logging
app/recovery/page.tsx        ← mobility, sleep, readiness
app/performance/page.tsx     ← insight-driven scoring trends
app/tournament/page.tsx      ← Gamble Sands prep
app/stats/page.tsx           ← redirects to /performance
features/*                   ← feature modules
hooks/use-pinnacle-data.tsx  ← PinnacleProvider state
lib/storage/*                ← localStorage abstraction
types/index.ts               ← domain types
```

### LocalStorage keys (stable contract)

- `pinnacle-state-v1` (via `STORAGE_KEYS.PINNACLE_STATE`)

Do **not** rename these keys without a migration plan.

### Validation before merge

```bash
npm run lint
npm run typecheck
npm run build
```

## Agent roles and communication

All agents must align with this table. When in doubt, defer to `main` and this file.

| Agent / tool | Role | Writes code? | Coordinates via |
|--------------|------|--------------|-----------------|
| **Cursor Agent** | Feature work, bug fixes, deploys | Yes | This file + PRs to `main` |
| **Codex Explorer** | Read-only evidence gathering | No | `.codex/agents/explorer.toml` |
| **Codex Reviewer** | Correctness, security, regressions | No | `.codex/agents/reviewer.toml` |
| **Codex Docs Researcher** | API / release-note verification | No | `.codex/agents/docs-researcher.toml` |
| **Claude Code** | Implementation using repo skill | Yes | `CLAUDE.md` → this file |
| **ecc-tools[bot]** | ECC bundle generation only | Config only | Regenerate after app changes; do not overwrite app code |

### Rules every agent must follow

1. **One app, one architecture** — never rebuild the full app on a parallel branch.
2. **Extend the multi-route layout** — add features to existing routes and feature modules unless a human explicitly approves an architecture migration.
3. **No duplicate PRs** — only one open app-feature PR at a time.
4. **Shared vocabulary** — use tab names exactly: Today, Plan, Practice, Recovery, Performance, Event (Tournament).
5. **Hand off context** — reference files changed, localStorage keys touched, and tournament impact in PR descriptions.
6. **Deploy path** — merges to `main` auto-deploy via Vercel GitHub integration.

## Coding conventions

### File naming

- **kebab-case** for files: `use-pinnacle-data.tsx`, `performance-insights.ts`
- **PascalCase** for React components: `TodayScreen`, `StatCard`

### Imports

Use the `@/` path alias:

```typescript
import { usePinnacle } from "@/hooks/use-pinnacle-data";
import type { Round } from "@/types";
```

### Commits

Conventional commits with descriptive messages:

```
feat: add wedge distance tracker to Practice tab
fix: reset checklist state at local midnight
chore: align agent coordination docs
```

## Next.js version note

<!-- BEGIN:nextjs-agent-rules -->
This is NOT the Next.js you know. This version has breaking changes — APIs, conventions, and file structure may differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Tool-specific entry points

| Tool | Start here |
|------|------------|
| Claude Code | `CLAUDE.md` |
| Codex CLI | `.codex/AGENTS.md` |
| Cursor | `.cursor/rules/project-pinnacle.mdc` |
| Repo skill | `.claude/skills/Project-Pinnacle/SKILL.md` |

## When to regenerate ECC

Re-run ECC Tools analysis only after significant structural changes (new routes, new state layer, new test suite). Update instincts and skills together — never merge stale repo-analysis artifacts.

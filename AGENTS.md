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

**Branch:** `main`  
**Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, localStorage persistence  
**Layout:** Single-page app with bottom-tab navigation in `app/page.tsx`

```
app/page.tsx          ← all five tabs (Today, Practice, Recovery, Stats, Tournament)
components/ui.tsx     ← shared UI primitives
hooks/use-local-storage.ts
lib/types.ts          ← domain types
lib/content.ts        ← drills, defaults, tournament data
```

### LocalStorage keys (stable contract)

- `pp-settings`, `pp-readiness`, `pp-practice`, `pp-rounds`, `pp-checklist`, `pp-habits`

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
2. **Extend `main`** — add features to the existing single-page structure unless a human explicitly approves an architecture migration.
3. **No duplicate PRs** — only one open app-feature PR at a time.
4. **Shared vocabulary** — use tab names exactly: Today, Practice, Recovery, Stats, Tournament.
5. **Hand off context** — reference files changed, localStorage keys touched, and tournament impact in PR descriptions.
6. **Deploy path** — merges to `main` auto-deploy via Vercel GitHub integration.

### Deprecated / do not use

- `cursor/project-pinnacle-mvp-d8dc` — alternate multi-route architecture; superseded by merged `main`.
- Open PR #1 (MVP rewrite) — closed in favor of production `main`.
- Stale ECC bundle (PR #2) — replaced by corrected bundle on `main`.

## Coding conventions

### File naming

- **kebab-case** for files: `use-local-storage.ts`, `globals.css`
- **PascalCase** for React components: `StatCard`, `SectionCard`

### Imports

Use the `@/` path alias:

```typescript
import { Settings } from "@/lib/types";
import { useLocalStorage } from "@/hooks/use-local-storage";
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

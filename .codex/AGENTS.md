# ECC for Codex CLI

This supplements the root `AGENTS.md` with a repo-local ECC baseline.

## Shared goal

All Codex sub-agents serve the same product goal defined in `AGENTS.md`: ship tournament-ready golf performance features on the canonical multi-route app.

## Repo skill

- Repo skill: `.agents/skills/Project-Pinnacle/SKILL.md`
- Claude companion: `.claude/skills/Project-Pinnacle/SKILL.md`
- Keep user-specific credentials and private MCPs in `~/.codex/config.toml`, not in this repo.

## Multi-agent support

Sub-agents are **read-only**. The parent agent owns all writes.

| Sub-agent | Purpose |
|-----------|---------|
| Explorer | Trace execution paths; cite files and symbols |
| Reviewer | Correctness, security, behavioral regressions |
| Docs researcher | Verify APIs and release notes against primary docs |

## Workflow

1. Parent reads `AGENTS.md` and confirms scope against the shared product goal.
2. Explorer gathers evidence (if needed).
3. Parent implements changes on the multi-route architecture.
4. Reviewer validates the diff before merge.
5. Docs researcher confirms Next.js API usage when touching framework code.

## MCP baseline

Treat `.codex/config.toml` as the default ECC-safe baseline. Keep user tokens out of the repo.

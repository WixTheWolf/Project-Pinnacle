# Plan Feature

## Purpose
The training roadmap to Gamble Sands — periodization, weekly focus, and daily rhythm.

## Architecture
- Pure plan logic in `lib/plan.ts`
- Phase derived from tournament countdown via `resolvePhaseId(daysUntil)`
- Read-only view of training structure; task execution lives on Today

## Future Improvements
- Editable weekly schedule
- Persist phase transitions to settings
- Integration with practice/recovery completion data

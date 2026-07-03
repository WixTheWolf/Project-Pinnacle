# Performance Feature

## Purpose
Insight-driven scoring analysis — patterns, weaknesses, and progress toward a 3 handicap. Not a chart-heavy dashboard.

## Architecture
- `PerformanceScreen` for round logging and insight display
- Pure insight logic in `lib/performance-insights.ts`
- Round data persisted via `PinnacleProvider`

## Future Improvements
- GHIN / TheGrint import
- Strokes-gained style breakdowns
- AI coaching recommendations from round patterns

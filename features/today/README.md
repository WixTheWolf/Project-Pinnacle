# Today Feature

## Purpose
The Today screen is the daily command center. It answers **"What should Matt do today?"** with a single primary action, mission checklist, readiness, and streak context.

## Architecture
- `TodayScreen` is a client component consuming `usePinnacle` context
- Readiness calculated via pure functions in `lib/readiness.ts`
- Daily tasks persisted through PinnacleProvider LocalStorage abstraction
- No direct LocalStorage access from components

## Future Improvements
- AI-generated coaching messages based on round data
- HealthKit sleep/recovery integration for readiness inputs
- Push notification reminders for incomplete tasks
- Weather-aware practice recommendations

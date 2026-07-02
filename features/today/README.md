# Today Feature

## Purpose
The Today screen is the daily operating system hub. It answers "What should Matt do today to become a better golfer?" by surfacing readiness, tasks, countdown, streaks, and coaching guidance.

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

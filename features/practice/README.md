# Practice Feature

## Purpose
Structured practice sessions across all club categories with drill instructions, success metrics, logging, and history.

## Architecture
- Category tabs filter drills from seed data (`lib/seed-data.ts`)
- Drill detail view handles inline session logging
- Sessions persisted via `logPracticeSession` in PinnacleProvider
- Drill definitions are static seed data; future: user-created custom drills

## Future Improvements
- Launch monitor integration for auto-logged metrics
- Video recording attachment per session
- AI drill recommendations based on stat weaknesses
- Practice plan scheduling tied to training phase

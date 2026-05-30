---
Task ID: 1
Agent: Main Agent
Task: Fix critical data loading bug + enhance seed data

Work Log:
- Diagnosed root cause: All API endpoints return data as `{ cases: [...] }`, `{ messages: [...] }`, etc. but `page.tsx` was looking for `result.value.data` which didn't exist, causing ALL data arrays to be empty.
- Fixed `src/app/page.tsx` data extraction with a robust `extractArray()` helper that checks known response keys and falls back to finding any array value.
- Added `events` key support for calendar API which returns `{ events: [...] }`.
- Handled `/auth/me` response which wraps user in `{ user: {...} }`.
- Added proper TypeScript type imports for all data types.
- Rewrote `src/app/api/seed/route.ts` (2216 lines) with significantly more sample data:
  - 14 users (unchanged)
  - 12 cases (was 5) - added labor, tax, IP, immigration types
  - 25 messages (was 5) - 7 conversation threads
  - 21 notifications (was 6)
  - 12 appointments (was 5)
  - 10 invoices (was 4) - including 2 OVERDUE
  - 8 payments (was 3)
  - 13 tasks (was 5)
  - 10 posts (was 5) + 10 comments
  - 10 leads (was 4)
  - 13 calendar events (was 5)
  - 17 time entries (was 7)
  - 10 documents (was 4)
  - 5 wallet transactions (new)
  - 10 activities (new)
  - Case sub-data: 10 timelines, 6 notes, 4 hearings, 6 deadlines, 6 case documents
- Build verified: `npx next build` compiled successfully.

Stage Summary:
- Critical bug fixed: Data now loads properly from all API endpoints
- Seed data significantly enhanced from ~60 records to ~200+ records
- All data is in Persian with realistic legal content
- Login still works with admin@legalhub.ir / 123456

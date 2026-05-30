---
Task ID: 1
Agent: main
Task: Fix critical race condition bug - no data visible in LegalHub app

Work Log:
- Analyzed root cause: seed endpoint was deleting sessions, and was very slow (hundreds of sequential awaits), causing data fetch to happen before seed completed
- Read and understood all 22 page components, 21 API routes, Zustand store, and seed file
- Identified race condition: seed fires on mount, user logs in concurrently, fetchAllData runs when DB is still empty
- Fixed seed/route.ts: removed session.deleteMany() and device.deleteMany(), added 4 courses with 11 lessons, 5 enrollments, 8 wallet transactions, 10 activities
- Fixed page.tsx: added seedDone/seeding state, awaited seed completion, gated fetchAllData on seedDone, added loading splash screen
- Build verified successfully with no errors

Stage Summary:
- Root cause: Race condition between seed and data fetching + seed deleting login sessions
- Key fix 1: Seed no longer clears sessions (transient data)
- Key fix 2: Page waits for seed to complete before allowing login/data fetch
- Key fix 3: Added loading splash screen "در حال آماده‌سازی سامانه..."
- Added data: 4 courses, 11 lessons, 5 enrollments, 8 wallet transactions, 10 activities, case6 sub-data
- Seed now returns pre-created admin session token for immediate login

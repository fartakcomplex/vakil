---
Task ID: 3-a
Agent: full-stack-developer (API Routes)
Task: Build all API routes for LegalHub Super App

Work Log:
- Created `src/lib/auth.ts` - Password hashing (SHA-256 with salt), token generation, role authorization
- Created 20 API route files under `src/app/api/`
- All routes use session-based auth via Bearer token
- All routes include proper error handling, TypeScript types, JSON responses
- Created comprehensive seed data with 14 users across all roles and related entities
- Fixed lint error and all files pass ESLint validation

Files Created:
1. `src/lib/auth.ts` - Auth utilities
2. `src/app/api/auth/login/route.ts`
3. `src/app/api/auth/register/route.ts`
4. `src/app/api/auth/me/route.ts`
5. `src/app/api/users/route.ts`
6. `src/app/api/cases/route.ts`
7. `src/app/api/cases/[id]/route.ts`
8. `src/app/api/appointments/route.ts`
9. `src/app/api/invoices/route.ts`
10. `src/app/api/payments/route.ts`
11. `src/app/api/tasks/route.ts`
12. `src/app/api/notifications/route.ts`
13. `src/app/api/posts/route.ts`
14. `src/app/api/documents/route.ts`
15. `src/app/api/courses/route.ts`
16. `src/app/api/messages/route.ts`
17. `src/app/api/leads/route.ts`
18. `src/app/api/calendar/route.ts`
19. `src/app/api/time-entries/route.ts`
20. `src/app/api/reports/route.ts`
21. `src/app/api/seed/route.ts`

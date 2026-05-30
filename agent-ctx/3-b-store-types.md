---
Task ID: 3-b
Agent: full-stack-developer (Store & Types)
Task: Build Zustand store, TypeScript types, Persian translations, and helpers

Files Created:
- `src/lib/types.ts` (500+ lines)
- `src/lib/store.ts` (170+ lines)
- `src/lib/persian.ts` (500+ lines, 404 translation keys)
- `src/lib/utils-helpers.ts` (280+ lines)

Key Decisions:
- Zustand persist middleware only persists auth + UI preferences (not data caches) to localStorage
- SSR-safe localStorage fallback in store
- Jalali date conversion uses a lightweight algorithm (no external dependency)
- Status/priority color mappings support both light and dark themes
- Translation keys use dot notation: `module.entity` pattern (e.g., `cases.title`, `role.LAWYER`)
- All type definitions match Prisma schema exactly, with optional populated relation fields

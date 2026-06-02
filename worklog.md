---
Task ID: 1
Agent: Main Agent
Task: Fix mobile scrolling issues and add Easy Access mobile UI

Work Log:
- Analyzed scrolling issues across all pages: dialogs (DialogContent with max-h and overflow-hidden), mobile menu (Sheet/ScrollArea), and main content area
- Found 15 pages with dialog scrolling problems: bills, contracts, letters, articles, laws, court-rulings, declarations, power-of-attorney, licenses, digital-library, surveys, tenders, signatures, case-executions, pro-bono
- Fixed globals.css: Added mobile scroll CSS with dynamic viewport height (dvh), overscroll-behavior, webkit-overflow-scrolling, dialog full-screen rules
- Fixed dialog.tsx: Added max-h-[95dvh], overflow-y-auto sm:overflow-y-hidden to DialogContent base class
- Fixed sheet.tsx: Added overflow-hidden to SheetContent so inner ScrollArea works
- Fixed app-shell.tsx main: Changed from overflow-auto to overflow-y-auto overflow-x-hidden min-h-0
- Fixed all 15 page DialogContent classes: max-h-[90vh] → max-h-[95dvh] sm:max-h-[90dvh] with responsive overflow
- Fixed bills-page.tsx and letters-page.tsx specific double-scroll issue (overflow-y-auto + ScrollArea)
- Added Mobile Easy Access section: 4-column grid with 12 gradient icon buttons for quick navigation
- Built and deployed successfully

Stage Summary:
- All scrolling issues fixed across 19 files
- Mobile Easy Access added with 12 quick-access icons
- Server running on port 3000, HTTP 200 confirmed

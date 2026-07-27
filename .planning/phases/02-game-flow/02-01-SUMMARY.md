---
phase: 02-game-flow
plan: 01
subsystem: ui
tags: [gray-matter, markdown, framer-motion, zustand, next.js, server-components]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: "Next.js scaffold, Zustand game store, theming, app shell with state machine"
provides:
  - "9 hole markdown files with name, par, illustration, and instructions"
  - "HoleData type and server-side hole loader via gray-matter"
  - "Branded LandingScreen with logo and Start Game"
  - "Animated SetupScreen with add/remove players and validation"
  - "Server component page.tsx passing holesData to client AppShell"
affects: [02-game-flow, 03-results, 04-admin]

# Tech tracking
tech-stack:
  added: [gray-matter]
  patterns: [server-side markdown loading, type-only imports across client/server boundary, AnimatePresence list animation]

key-files:
  created:
    - score/src/content/holes/hole-01.md through hole-09.md
    - score/src/lib/holes.ts
    - score/src/components/landing-screen.tsx
    - score/src/components/setup-screen.tsx
  modified:
    - score/src/app/page.tsx
    - score/src/components/app-shell.tsx
    - score/package.json

key-decisions:
  - "Committed all 3 tasks atomically since AppShell imports LandingScreen and SetupScreen -- cannot build without both"
  - "Used type-only import for HoleData in client components to maintain server/client boundary"

patterns-established:
  - "Markdown content files in src/content/holes/ with gray-matter frontmatter"
  - "Server component page.tsx loads data, passes to client AppShell as prop"
  - "Screen components as separate files imported by AppShell"

requirements-completed: [LAND-01, LAND-02, SETUP-01, SETUP-02, SETUP-03, SETUP-04, HOLE-02, HOLE-03]

# Metrics
duration: 2min
completed: 2026-03-10
---

# Phase 2 Plan 1: Hole Content + Landing + Setup Summary

**9 hole markdown files with gray-matter loader, branded landing screen with logo, and animated player setup with add/remove/validation**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-10T21:31:53Z
- **Completed:** 2026-03-10T21:34:04Z
- **Tasks:** 3
- **Files modified:** 16

## Accomplishments
- Created 9 hole markdown files with name, par, illustration path, and instruction text
- Built holes.ts data layer using gray-matter for server-side markdown parsing
- Converted page.tsx from client to server component, passing holesData to AppShell
- Built branded LandingScreen with logo, course name, entrance animation, and Start Game button
- Built animated SetupScreen with player add/remove, editable names, AnimatePresence list, and validation

## Task Commits

All tasks committed atomically (AppShell requires both LandingScreen and SetupScreen to compile):

1. **Task 1: Create hole content data layer + Task 2: Landing screen + Task 3: Setup screen** - `b2b684f` (feat)

## Files Created/Modified
- `score/src/content/holes/hole-01.md` through `hole-09.md` - Hole content with frontmatter (name, par, illustration, instructions)
- `score/src/lib/holes.ts` - HoleData type, loadHoles() function, exported holes array
- `score/src/components/landing-screen.tsx` - Branded landing with Logo, course name, entrance animation, Start Game
- `score/src/components/setup-screen.tsx` - Player management with animated list, add/remove, editable names, validation
- `score/src/app/page.tsx` - Converted to server component, imports holes, passes holesData prop
- `score/src/components/app-shell.tsx` - Accepts holesData prop, imports external LandingScreen/SetupScreen

## Decisions Made
- Committed all 3 tasks as single atomic commit since AppShell cannot compile without both LandingScreen and SetupScreen imports
- Used `import type { HoleData }` in client components to maintain clean server/client boundary
- ScoringScreen and ResultsScreen remain inline in AppShell as placeholders (will be extracted in Plan 02)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Hole data pipeline complete -- scoring screen (Plan 02) can access hole names, par values, and instructions via holesData prop
- LandingScreen and SetupScreen are production-ready
- ScoringScreen placeholder already shows hole data, ready for full implementation in Plan 02

---
*Phase: 02-game-flow*
*Completed: 2026-03-10*

---
phase: 04-admin
plan: 01
subsystem: ui
tags: [nextjs, localStorage, admin, par-config]

requires:
  - phase: 02-game-flow
    provides: "HoleData interface and scoring screen that reads hole.par"
  - phase: 01-foundation
    provides: "AppShell component, Zustand store, UI primitives"
provides:
  - "/admin route with password gate for venue staff"
  - "Par override system via localStorage (loadParOverrides, saveParOverrides, applyParOverrides)"
  - "Game flow integration passing admin-set pars to scoring and results screens"
affects: []

tech-stack:
  added: []
  patterns:
    - "localStorage for cross-session config (vs sessionStorage for game state)"
    - "Client-side env var (NEXT_PUBLIC_) for casual password gate"

key-files:
  created:
    - score/src/lib/par-overrides.ts
    - score/src/app/admin/page.tsx
    - score/.env.example
  modified:
    - score/src/components/app-shell.tsx

key-decisions:
  - "Hardcoded fallback par defaults in admin page instead of server component wrapper -- simpler, acceptable for v1"
  - "localStorage (not sessionStorage) for par overrides so they persist across tab close"
  - "Par overrides applied in AppShell useEffect to avoid hydration mismatch"

patterns-established:
  - "Admin config kept separate from Zustand game store (different concern, different storage)"
  - "applyParOverrides merges at AppShell level -- downstream components unaware of override mechanism"

requirements-completed: [ADM-01, ADM-02]

duration: 2min
completed: 2026-03-11
---

# Phase 4 Plan 1: Admin Par Configuration Summary

**Admin /admin page with password gate, per-hole par config form, localStorage persistence, and transparent game flow integration**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-11T00:18:57Z
- **Completed:** 2026-03-11T00:21:00Z
- **Tasks:** 4 (3 auto + 1 checkpoint auto-approved)
- **Files modified:** 4

## Accomplishments
- Par override utility with localStorage read/write/merge matching existing storage patterns
- Admin page with password gate (env var), 9-hole par form, save confirmation
- Game scoring flow transparently uses admin-set pars when available, markdown defaults otherwise
- Zero new npm dependencies added

## Task Commits

Each task was committed atomically:

1. **Task 1: Create par-overrides utility and env config** - `921b8f7` (feat)
2. **Task 2: Create /admin page with password gate and par config form** - `d949b3c` (feat)
3. **Task 3: Wire par overrides into game scoring flow** - `5bf12f6` (feat)
4. **Task 4: Verify admin page and par override integration** - auto-approved checkpoint

## Files Created/Modified
- `score/src/lib/par-overrides.ts` - localStorage read/write/merge for par overrides with ParOverrides type
- `score/src/app/admin/page.tsx` - Admin route with password gate and per-hole par config form
- `score/.env.example` - Documents NEXT_PUBLIC_ADMIN_PASSWORD env var
- `score/.env.local` - Dev default password (gitignored)
- `score/src/components/app-shell.tsx` - Applies par overrides before passing holesData to scoring/results

## Decisions Made
- Hardcoded fallback par defaults `[3,3,4,3,3,4,3,3,3]` in admin page instead of creating a server component wrapper. Simpler approach acceptable for v1 since admin is explicitly overriding values anyway.
- Used localStorage (not sessionStorage) for par overrides so venue staff changes persist across tab close.
- Applied par overrides in AppShell via useEffect to avoid hydration mismatch (server renders with markdown pars, client updates after mount).

## Deviations from Plan

None - plan executed exactly as written. The `.gitignore` already contained `.env*.local` so no modification was needed (plan suggested adding it if not present).

## Issues Encountered
None

## User Setup Required
None - no external service configuration required. The `.env.local` file is created automatically with the default password "playground".

## Next Phase Readiness
- Admin par configuration is complete and functional
- Par overrides integrate transparently with existing scoring flow
- No blockers for remaining polish work

---
*Phase: 04-admin*
*Completed: 2026-03-11*

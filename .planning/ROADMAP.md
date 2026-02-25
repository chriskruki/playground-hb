# Roadmap: Playground HB Score

## Overview

Build a mobile-first mini golf scorecard web app from scratch: foundation and state architecture first (the two highest-cost pitfalls live there), then the complete game flow (landing through hole-by-hole scoring with hole content), then the results and celebration screen, then the admin par-configuration tool. Four phases that each deliver a coherent, testable capability — nothing ships until the foundation is solid enough that the game loop can't destroy itself on a browser refresh or back-button press.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation** - Project scaffold, state machine architecture, theming system, and sessionStorage sync wired before any game screens (completed 2026-02-25)
- [ ] **Phase 2: Game Flow** - Complete playable loop from landing through all 9 holes with hole content, scoring, par tracking, and running totals
- [ ] **Phase 3: Results and Celebration** - Final rankings screen with winner animation and round summary
- [ ] **Phase 4: Admin** - Par configuration page at /admin with password gate and localStorage persistence

## Phase Details

### Phase 1: Foundation
**Goal**: The technical foundation is solid enough that all game screens can be built on top without architectural rework
**Depends on**: Nothing (first phase)
**Requirements**: TECH-01, TECH-02, TECH-03, THEME-01, THEME-02, THEME-03
**Success Criteria** (what must be TRUE):
  1. Refreshing mid-game restores the session exactly where it left off (sessionStorage sync working)
  2. Tapping browser back during a game does not reset or destroy game state (phase-based state machine, not URL routing)
  3. App colors can be changed by editing a single theme config file with no other code changes required
  4. Logo can be swapped by replacing logo.svg with no code changes
  5. App renders correctly on a 390px wide mobile screen (iPhone-class) and doesn't break on desktop
**Plans**: 2 plans

Plans:
- [ ] 01-01-PLAN.md — Scaffold Next.js project with Tailwind v4 theming, brand assets, and mobile-first app shell
- [ ] 01-02-PLAN.md — Zustand state machine with sessionStorage persistence and back-button interception

### Phase 2: Game Flow
**Goal**: Players can complete a full game from QR scan through all 9 holes with scores, par tracking, and hole-specific content
**Depends on**: Phase 1
**Requirements**: LAND-01, LAND-02, SETUP-01, SETUP-02, SETUP-03, SETUP-04, SCORE-01, SCORE-02, SCORE-03, SCORE-04, SCORE-05, SCORE-06, SCORE-07, SCORE-08, HOLE-01, HOLE-02, HOLE-03
**Success Criteria** (what must be TRUE):
  1. User sees branded landing page with logo and taps "Start Game" to enter setup
  2. User can add and remove player names with no limit on group size, and cannot advance with zero or empty-named players
  3. User sees one hole at a time with hole name, number, instructions, and illustration placeholder — content sourced from markdown files
  4. User enters scores via +/- buttons (defaulting to par), sees par value, over/under indicator in color, and running total per player throughout all 9 holes
  5. User sees hole progress indicator and animated transitions between holes
**Plans**: TBD

### Phase 3: Results and Celebration
**Goal**: Players see a satisfying final rankings screen that celebrates the winner and lets them start again
**Depends on**: Phase 2
**Requirements**: RES-01, RES-02, RES-03, RES-04
**Success Criteria** (what must be TRUE):
  1. After completing hole 9, user automatically sees a results screen with all players ranked by total strokes (lowest first)
  2. Each player's total strokes and over/under par for the round are displayed
  3. The winner is highlighted with an animated celebration (Framer Motion)
  4. User can tap "Play Again" to return to the landing screen and start a new game
**Plans**: TBD

### Phase 4: Admin
**Goal**: Venue staff can configure par values for all 9 holes without developer involvement, and the values are protected from casual discovery
**Depends on**: Phase 1
**Requirements**: ADM-01, ADM-02
**Success Criteria** (what must be TRUE):
  1. Navigating to /admin prompts for a password before showing any configuration
  2. Admin can set par values for each of the 9 holes and save them
  3. Par values set in admin are used in the game scoring flow on the same device without any code change
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3, with Phase 4 executable after Phase 1 (no dependency on 2 or 3)

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 2/2 | Complete    | 2026-02-25 |
| 2. Game Flow | 0/TBD | Not started | - |
| 3. Results and Celebration | 0/TBD | Not started | - |
| 4. Admin | 0/TBD | Not started | - |

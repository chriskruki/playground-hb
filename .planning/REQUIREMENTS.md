# Requirements: Playground HB Score

**Defined:** 2026-02-24
**Core Value:** Players can effortlessly score their mini golf round hole-by-hole with a beautiful, animated mobile experience — no signup, no friction, just scan and play.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Landing

- [ ] **LAND-01**: User sees branded landing page with Playground HB logo and course name
- [ ] **LAND-02**: User can tap a prominent "Start Game" button to begin

### Setup

- [ ] **SETUP-01**: User can add player names one at a time with no limit on group size
- [ ] **SETUP-02**: User can remove a player before starting the game
- [ ] **SETUP-03**: User sees animated, friendly player setup interface
- [ ] **SETUP-04**: User cannot start game with zero players or empty names

### Scoring

- [ ] **SCORE-01**: User sees one hole at a time with hole name and number (e.g., "Hole 1: Pay-Lay your bets")
- [ ] **SCORE-02**: User can enter scores for all players on the current hole before advancing
- [ ] **SCORE-03**: User enters scores via +/- increment buttons with par as default starting value
- [ ] **SCORE-04**: User sees par value displayed for the current hole
- [ ] **SCORE-05**: User sees over/under par indicator per player (color-coded: green under, red over)
- [ ] **SCORE-06**: User sees running total strokes per player during play
- [ ] **SCORE-07**: User sees hole progress indicator (e.g., "Hole 4 / 9")
- [ ] **SCORE-08**: User experiences smooth animated transitions between holes via Framer Motion

### Hole Content

- [ ] **HOLE-01**: User sees hole-specific content (name, illustration placeholder, instructions) on each hole's scoring page
- [ ] **HOLE-02**: Hole content is rendered from per-hole markdown files that are easily editable
- [ ] **HOLE-03**: All 9 holes have placeholder content with correct hole names

### Results

- [ ] **RES-01**: User sees final rankings sorted by total strokes (lowest wins) after completing all 9 holes
- [ ] **RES-02**: User sees each player's total score and over/under par for the round
- [ ] **RES-03**: Winner is highlighted with a celebration animation (Framer Motion)
- [ ] **RES-04**: User can start a new game from the results screen

### Admin

- [ ] **ADM-01**: Admin can access /admin page to configure par values for each of the 9 holes
- [ ] **ADM-02**: Par values set in admin persist in browser storage and are used during gameplay

### Theming & Branding

- [x] **THEME-01**: App colors (primary, secondary, accent) are defined in a theme config file, not hardcoded
- [x] **THEME-02**: Logo is loaded from a swappable logo.svg asset
- [x] **THEME-03**: Theming integrates with Tailwind CSS variables for consistent styling

### Technical

- [x] **TECH-01**: App is mobile-first responsive with rough desktop support
- [x] **TECH-02**: Game state persists across page refresh via sessionStorage (dies with tab close)
- [x] **TECH-03**: App uses phase-based state machine at single URL (no back-button state destruction)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Accounts & Persistence

- **ACCT-01**: User can optionally create account with just an email (no verification)
- **ACCT-02**: Registered user can save game sessions and view history
- **ACCT-03**: Game data persists in a backend database

### Social & Gallery

- **GAL-01**: User can take a group photo at end of game
- **GAL-02**: Group photos and scores submitted for gallery/leaderboard (pending admin approval)
- **GAL-03**: Gallery page displays approved photos and top scores (hostable on TVs)

### Admin Expansion

- **ADMX-01**: Admin can approve/decline leaderboard and gallery submissions
- **ADMX-02**: Admin can edit hole markdown content from the dashboard

### UX Enhancements

- **UX-01**: User can navigate back to fix a previous hole's score
- **UX-02**: Hole-in-one triggers a special celebration animation
- **UX-03**: User can swipe between holes for navigation

## Out of Scope

| Feature | Reason |
|---------|--------|
| User accounts / login for v1 | Friction at game start — antithetical to QR→play model |
| Real-time multiplayer sync | Over-engineering for one-device-per-group flow |
| Social sharing | Requires persistent URL / backend for shared scores |
| GPS / course map | Physical venue — players can see the course |
| Email capture / marketing | Creates friction, handled separately by venue |
| Food & beverage ordering | Not a scoring app concern |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| LAND-01 | Phase 2 | Pending |
| LAND-02 | Phase 2 | Pending |
| SETUP-01 | Phase 2 | Pending |
| SETUP-02 | Phase 2 | Pending |
| SETUP-03 | Phase 2 | Pending |
| SETUP-04 | Phase 2 | Pending |
| SCORE-01 | Phase 2 | Pending |
| SCORE-02 | Phase 2 | Pending |
| SCORE-03 | Phase 2 | Pending |
| SCORE-04 | Phase 2 | Pending |
| SCORE-05 | Phase 2 | Pending |
| SCORE-06 | Phase 2 | Pending |
| SCORE-07 | Phase 2 | Pending |
| SCORE-08 | Phase 2 | Pending |
| HOLE-01 | Phase 2 | Pending |
| HOLE-02 | Phase 2 | Pending |
| HOLE-03 | Phase 2 | Pending |
| RES-01 | Phase 3 | Pending |
| RES-02 | Phase 3 | Pending |
| RES-03 | Phase 3 | Pending |
| RES-04 | Phase 3 | Pending |
| ADM-01 | Phase 4 | Pending |
| ADM-02 | Phase 4 | Pending |
| THEME-01 | Phase 1 | Complete |
| THEME-02 | Phase 1 | Complete |
| THEME-03 | Phase 1 | Complete |
| TECH-01 | Phase 1 | Complete |
| TECH-02 | Phase 1 | Complete |
| TECH-03 | Phase 1 | Complete |

**Coverage:**
- v1 requirements: 29 total
- Mapped to phases: 29
- Unmapped: 0

---
*Requirements defined: 2026-02-24*
*Last updated: 2026-02-24 — traceability populated after roadmap creation*

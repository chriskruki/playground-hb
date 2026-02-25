# Phase 1: Foundation - Context

**Gathered:** 2026-02-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Project scaffold with Next.js 16, state machine architecture for game flow, theming system with Playground HB brand colors, sessionStorage sync for state persistence, and mobile-first responsive base. No game screens — just the foundation they build on.

</domain>

<decisions>
## Implementation Decisions

### Color palette
- Keep exact palette from prototype — proven brand colors
- Background: warm yellow `#FFF2D4`
- Primary: forest green `#34654A`
- Secondary/Accent: golden yellow `#DCAF56`
- Cards: white (`oklch(1 0 0)`) on warm yellow background
- Ring/focus: forest green `#34654A`
- Destructive: `oklch(0.577 0.245 27.325)`
- Border: `oklch(0.85 0.02 85)` — warm-tinted
- All defined as CSS custom properties in theme config, nothing hardcoded in components

### Typography
- Bricolage Grotesque as the single font family (Google Fonts)
- Weight variation for hierarchy (headings heavier, body regular)
- No second font — keep it unified

### Game flow state machine
- Four phases: Landing → Setup → Scoring (x9 holes) → Results
- Fade transitions for major phase changes (landing→setup, setup→scoring, scoring→results)
- Slide transitions for hole-to-hole navigation within scoring
- Explicit "Next Hole" button to advance — no auto-advance
- All at a single URL — no router-based navigation

### Hole screen layout
- Hole info (name, illustration, instructions) shown first on arrival
- Scoring section below the hole info
- All players visible simultaneously per hole — compact rows
- Each player row: name → tappable score number → scroll-wheel picker to adjust (slide up/down like a select)
- Default score value starts at par for that hole

### Brand assets
- Download Playground HB logo locally from: https://playgroundhb.com/cdn/shop/files/playground_logo_only_black_copy.png?v=1754119599&height=60
- Save as local asset in public/ directory (no external CDN dependency)
- Use the logo for favicon as well (crop/resize)
- Logo is black on transparent — works on the warm yellow background

### Claude's Discretion
- Exact Tailwind v4 CSS variable structure (as long as theme config is the single source of truth)
- sessionStorage hydration guard implementation pattern
- Zustand vs React Context for state management
- Folder structure within Next.js app
- Loading skeleton and error state designs
- Exact animation timing and easing curves

</decisions>

<specifics>
## Specific Ideas

- Score entry interaction: user taps the score number, then slides up/down to change it — similar to a native mobile number picker/scroll wheel. Lightweight and discrete.
- The warm yellow + forest green + golden yellow palette gives it a "sunny day at the course" feel — lean into that warmth throughout.
- Bricolage Grotesque has optical sizing built in — use heavier weights for hole numbers and player names, lighter for instructions.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-02-24*

# Unicolf Score

## What This Is

A mobile-first mini golf scoring web app for Playground HP's 9-hole course, hosted at score.playgroundhp.com. Players scan a QR code at the front desk, add their group, step through each hole with par tracking and hole-specific content, and finish with a celebratory rankings screen. Built with Next.js, React, TailwindCSS, shadcn UI, and Framer Motion.

## Core Value

Players can effortlessly score their mini golf round hole-by-hole with a beautiful, animated mobile experience — no signup, no friction, just scan and play.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Landing page with branding (logo.svg) and a prominent "Start Game" button
- [ ] Player setup screen — add player names, no limit on group size, friendly animated UI
- [ ] Hole-by-hole scoring flow — one hole at a time, enter scores for all players per hole
- [ ] Hole content pages — each hole displays name, illustration placeholder, and instructions rendered from markdown files
- [ ] Par tracking — configurable par values per hole (separate from hole content), show over/under per player
- [ ] Final scores screen — rankings, totals, winner celebration with animations
- [ ] Admin page (/admin) — configure par values per hole
- [ ] Hole content config — markdown files per hole for name, illustration reference, and instructions (easily editable, with placeholders)
- [ ] Theming system — theme config file for primary, secondary, and accent colors (nothing hardcoded)
- [ ] Branding assets — logo.svg and placeholder assets, easily swappable
- [ ] Mobile-first responsive design with rough desktop support
- [ ] Smooth animations throughout using Framer Motion

### Out of Scope

- User accounts / registration — v2 (simple email-based accounts, save sessions, view history)
- Backend / database — v2 (optional persistence layer)
- Group photo capture — v2 (photo at end of game for gallery)
- Leaderboard / gallery page — v2 (admin-approved scores and photos, display on TVs)
- Admin content editor — v2 (edit hole markdown from admin dashboard)
- Admin leaderboard moderation — v2 (approve/decline gallery and leaderboard submissions)

## Context

- **Playground HP** is a mini golf venue building this app for their customers
- Existing prototype in `score_proto/` folder — functional but needs a cleaner experience and fresh build
- Physical instruction posters exist at each hole but players often ignore them — in-app instructions solve this
- QR code at front desk is the primary entry point
- The course has 9 holes, each with a unique theme/name and specific par value
- Folders `led/` and `shopify-min/` in the repo are unrelated to this project

## Constraints

- **Tech stack**: Next.js + React + TailwindCSS + shadcn UI + Framer Motion — decided, matches prototype experience
- **Hosting**: score.playgroundhp.com — domain already planned
- **No backend for v1**: All state in browser memory/session only — no persistence across tab close
- **Mobile-first**: Primary use is on phones via QR code scan
- **Configurable content**: Hole descriptions via markdown files, par via admin config, theme via config file — no hardcoded content or colors

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Fresh build, no code reuse from prototype | Prototype works but needs cleaner architecture and UX | — Pending |
| Browser-only state for v1 | Simplicity — no backend complexity, fastest path to working app | — Pending |
| Markdown files for hole content | Easy to edit without code changes, future admin editor can write to same format | — Pending |
| Separate par config from hole content | Par values managed in admin, content managed in markdown — clean separation | — Pending |
| shadcn UI as component base | Customizable, works well with Tailwind, avoids generic look when styled | — Pending |

---
*Last updated: 2026-02-24 after initialization*

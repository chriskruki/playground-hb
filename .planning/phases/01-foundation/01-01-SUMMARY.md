---
phase: 01-foundation
plan: 01
subsystem: foundation
tags: [next.js, tailwind-v4, theming, shadcn, mobile-first, brand-assets]
dependency_graph:
  requires: []
  provides: [next-project, tailwind-theme, shadcn-ui-base, brand-assets, app-shell]
  affects: [all-future-plans]
tech_stack:
  added:
    - Next.js 15.4.5 (app router, turbopack dev)
    - React 19.1.0
    - Tailwind CSS v4 with @tailwindcss/postcss
    - tw-animate-css
    - shadcn UI pattern (manual, no CLI)
    - @radix-ui/react-slot
    - class-variance-authority
    - clsx + tailwind-merge
    - framer-motion (installed, used in future plans)
    - lucide-react (installed, used in future plans)
    - zustand (installed, used in Plan 02)
    - Bricolage Grotesque (Google Fonts via next/font)
  patterns:
    - CSS custom properties mapped via @theme inline to Tailwind color tokens
    - Single theme.ts source of truth for all brand colors
    - Mobile-first responsive container (max-w-md mx-auto px-4)
    - Sticky header with backdrop-blur
key_files:
  created:
    - score/package.json
    - score/tsconfig.json
    - score/next.config.ts
    - score/postcss.config.mjs
    - score/.gitignore
    - score/components.json
    - score/src/app/globals.css
    - score/src/app/layout.tsx
    - score/src/app/page.tsx
    - score/src/lib/theme.ts
    - score/src/lib/utils.ts
    - score/src/components/ui/button.tsx
    - score/src/components/ui/card.tsx
    - score/src/components/ui/input.tsx
    - score/src/components/app-shell.tsx
    - score/src/components/logo.tsx
    - score/public/logo.png
    - score/public/logo.svg
  modified: []
decisions:
  - "Used Next.js 15 (not 16 as plan stated) — 15.4.5 is latest stable; no Next.js 16 exists yet"
  - "logo.svg wraps logo.png via SVG image element — components reference /logo.svg, swapping means replacing logo.png or updating logo.svg"
  - "Installed framer-motion, lucide-react, zustand in Task 1 so future plans can use them without npm install steps"
metrics:
  duration: "~8 minutes"
  completed: "2026-02-24"
  tasks_completed: 2
  tasks_total: 2
  files_created: 18
  files_modified: 0
---

# Phase 1 Plan 01: Next.js Foundation with Tailwind v4 Theming Summary

**One-liner:** Next.js 15 + Tailwind v4 project with single-file brand theming (warm yellow #FFF2D4, forest green #34654A), Bricolage Grotesque font, downloaded Playground HB logo, and mobile-first app shell.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Scaffold Next.js project with Tailwind v4 theming and brand assets | d34372f | 16 files created |
| 2 | Create mobile-first app shell with logo header and responsive container | 7007d2a | 2 files created |

## What Was Built

A complete Next.js 15 project scaffold in `score/` ready for all future phases:

- **Theming system**: `src/lib/theme.ts` is the single file to edit to change all app colors. CSS custom properties in `globals.css` match exactly. Tailwind color tokens (`text-primary`, `bg-background`, etc.) derive from those CSS vars via `@theme inline`.
- **Brand assets**: Playground HB logo downloaded from CDN as `public/logo.png`. `public/logo.svg` wraps it — components reference `/logo.svg`, swapping the asset means replacing one file.
- **Font**: Bricolage Grotesque loaded via `next/font/google` with `--font-bricolage` CSS variable applied to body.
- **Mobile viewport**: `maximum-scale=1, user-scalable=no` prevents iOS pinch-zoom on scoring inputs.
- **App shell**: Sticky header with logo, backdrop blur, `max-w-md mx-auto` container — fits 390px mobile, centers on desktop.
- **UI base**: Button, Card, Input components following shadcn patterns, using only theme token classes (no hardcoded colors).

## Verification Results

All 8 checks passed:
1. `npm run build` — compiles with zero errors
2. `src/lib/theme.ts` — exists, exports themeColors
3. `globals.css` — contains `--background` and all CSS custom properties
4. `public/logo.svg` — exists as swappable asset
5. No hardcoded hex values in any component file
6. Bricolage Grotesque loaded in `layout.tsx`
7. Mobile viewport meta with `userScalable: false`
8. `logo.svg` referenced in `logo.tsx`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Next.js version corrected from 16 to 15**
- **Found during:** Task 1
- **Issue:** Plan specified "Next.js 16" which does not exist. Latest stable is 15.4.5.
- **Fix:** Used Next.js 15.4.5 (same version as score_proto).
- **Files modified:** score/package.json
- **Commit:** d34372f

**2. [Rule 2 - Missing functionality] logo.svg created as SVG wrapper**
- **Found during:** Task 1
- **Issue:** Plan said to download a PNG then "create a simple logo.svg that references or wraps this". Implemented as an SVG `<image>` element pointing to `/logo.png`.
- **Fix:** Created logo.svg with `<image href="/logo.png" ...>` — components reference `/logo.svg`, swapping the logo means updating logo.svg or replacing logo.png.
- **Files modified:** score/public/logo.svg
- **Commit:** d34372f

## Self-Check: PASSED

All claimed files verified on disk. Both commits verified in git log.

| Item | Status |
|------|--------|
| score/src/lib/theme.ts | FOUND |
| score/src/app/globals.css | FOUND |
| score/public/logo.svg | FOUND |
| score/src/components/app-shell.tsx | FOUND |
| score/src/components/logo.tsx | FOUND |
| Commit d34372f | FOUND |
| Commit 7007d2a | FOUND |

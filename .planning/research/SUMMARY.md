# Project Research Summary

**Project:** Unicolf Score — Mini Golf Scoring Web App (Playground HP)
**Domain:** Mobile-first, browser-only, QR-code-entry scorecard PWA
**Researched:** 2026-02-24
**Confidence:** HIGH (stack and architecture), MEDIUM (features and pitfalls)

## Executive Summary

Unicolf Score is a venue-specific mini golf scoring web app where players scan a QR code, enter names, and track scores hole-by-hole on a single shared device. Experts build this type of product as a mobile-first single-page state machine: the entire game flow — landing, setup, scoring, results — runs inside one URL with phase-based conditional rendering rather than multi-route navigation. This eliminates accidental back-button destruction of in-progress games, which is the most common failure mode in browser scorecard apps. The recommended stack is Next.js 16 + React 19 + TypeScript + Tailwind v4 + shadcn/ui + Motion (formerly framer-motion) + Zustand, all at versions that are fully compatible with each other and deployable to Vercel with no configuration.

The key architectural decision is to keep the app entirely browser-side for v1: no API routes, no database, no authentication except a simple password gate on the `/admin` par-configuration page. Game state persists to `sessionStorage` (not `localStorage`) so a mid-round browser refresh restores the session, but closing the tab cleanly ends it. Hole content (names, par, instructions, illustration references) lives in markdown files read at build time — this separates content from code and lets venue staff update hole descriptions without developer involvement. The `config/par.ts` default values are overridden by admin-written `localStorage` entries, giving the venue a no-code par configuration tool.

The primary risks are all architectural rather than feature-level: routing approach (state machine vs. multi-route), storage approach (sessionStorage backup), and mobile layout breakage on iOS Safari (keyboard overlap with `100vh`). These risks must be addressed in the foundation phase before any game flow screens are built. If the foundation is solid, the feature work is straightforward; if the foundation is wrong, retrofitting is HIGH-cost.

---

## Key Findings

### Recommended Stack

The stack is unusually well-aligned: Next.js 16 ships with React 19 bundled, Tailwind v4 has an official Next.js integration guide, shadcn/ui explicitly supports React 19 and Tailwind v4, and the Motion library (v12.34.x) is the React 19 canonical animation package. There are no compatibility risks between core dependencies. The only friction point is that npm users must pass `--legacy-peer-deps` when running `npx shadcn@latest init`. Zustand 5.0.x is the correct choice for game state spanning page navigations — React Context works for single-page state but cannot survive Next.js route navigation. Hole content should use `gray-matter` + `remark` (not `@next/mdx` and not `next-mdx-remote`, which is unmaintained in 2025) since hole instructions are plain text with no embedded React components.

See `.planning/research/STACK.md` for full version requirements, installation commands, and alternatives considered.

**Core technologies:**
- **Next.js 16 + React 19**: App Router framework — Turbopack default, no Webpack config needed, `typedRoutes: true` catches broken Link hrefs at compile time
- **TypeScript 5.x (strict)**: Required by Next.js 16; `next typegen` generates route types without running dev server
- **Tailwind CSS 4.2**: `@import "tailwindcss"` in globals.css, no config file, theming via CSS variables in `@theme` block
- **shadcn/ui (CLI-managed)**: Components copied into `src/components/ui/` — full ownership, no runtime CSS-in-JS overhead
- **Motion 12.34.x**: Import from `motion/react` (not `framer-motion`); `LazyMotion` + `domAnimation` reduces animation bundle from ~25KB to ~5KB
- **Zustand 5.0.x**: `sessionStorage` persist middleware keeps game state across page refreshes; dies cleanly on tab close
- **gray-matter + remark**: Parse hole markdown at build time in Server Components; never shipped to client

### Expected Features

The competitor landscape (PlayThru Mini, PuttScores, MiniGolfScoreCard) makes clear that no-download QR entry, hole-by-hole scoring, par tracking, and a final rankings screen are table stakes — missing any of these makes the product feel broken. The key differentiator this product has that no competitor offers is per-hole illustrated content with venue-specific storylines. The animated winner celebration with Motion is a secondary differentiator (competitors use static screens). Features with backend dependencies (leaderboard, score history, user accounts) should be deferred to v2 once the product-market fit of the in-game experience is validated.

See `.planning/research/FEATURES.md` for competitor analysis and the full prioritization matrix.

**Must have (table stakes):**
- QR → instant play, no download, no signup — architectural choice, zero friction is the premise
- Player name entry (no limit) — prerequisite for all game flow
- Hole-by-hole score entry for all players, one hole at a time — core mechanic
- Par display per hole + over/under per player — golfers think in +/- not raw strokes
- Running total visible per player throughout the game — players constantly compare
- Final rankings screen with clear winner callout — the social payoff moment
- Hole progress indicator ("Hole 4 / 9") — orientation during play
- Mobile-first touch targets (44px minimum) — players are one-handed, walking

**Should have (competitive differentiators):**
- Per-hole illustrated content (name, theme, instructions from markdown) — no competitor does this
- Animated winner celebration using Motion — memorable end-screen, shareable moment
- Smooth hole-to-hole transitions (Motion AnimatePresence) — feels like a game, not a form
- Smooth score entry UX (+/- increment buttons, defaults to par) — confirmed best practice
- Admin `/admin` page for par configuration — venue staff can update without a developer
- Polished branded theming (colors, logo.svg swappable) — makes it feel like Playground HP's product

**Defer to v2+:**
- Persistent leaderboard (requires backend)
- User accounts and score history
- Social sharing / score URL (requires persistent score storage)
- Group photo capture
- Real-time multi-device sync

### Architecture Approach

The entire game runs as a phase-based state machine within a single Next.js page (`app/page.tsx`). The four phases — `"landing"`, `"setup"`, `"scoring"`, `"results"` — are managed by a `GameProvider` context wrapping the root layout. Phase views are conditionally rendered using Motion's `AnimatePresence`, so all transitions animate correctly. The URL never changes during play, which eliminates back-button destruction. Hole content is loaded once at module init in `lib/content.ts` using Node.js `fs` + `gray-matter` — no runtime fetches, no loading states. An `/admin` route is a separate Next.js page with no game state dependency. The architecture has a clear build order: types and config first, then infrastructure (storage, content loader), then state layer (GameProvider), then leaf components, then phase views, then page assembly, then animation polish.

See `.planning/research/ARCHITECTURE.md` for full component boundaries, data flow diagrams, and anti-patterns.

**Major components:**
1. **GameProvider** — owns all game state (players, currentHole, phase, parConfig, scores); syncs to sessionStorage; wraps root layout
2. **HoleScoringView** — score entry for all players on current hole; composes hole content display alongside score inputs
3. **ResultsView** — rankings, running totals, winner celebration animation, "Play Again" reset
4. **lib/content.ts** — loads all 9 hole markdown files at build time; returns typed `HoleContent[]`; never runs on client
5. **lib/storage.ts** — SSR-safe wrapper for all browser storage access; guards with `typeof window === "undefined"`
6. **app/admin/page.tsx** — form to set per-hole par values; reads/writes localStorage under isolated key; no game state coupling

### Critical Pitfalls

All four critical pitfalls have HIGH recovery costs if addressed late; all are preventable if locked down in the foundation phase.

1. **In-memory state silently lost on browser refresh** — Sync full game session to `sessionStorage` on every state change; restore on app mount. Recovery cost is HIGH if retrofitted later. Must be in foundation phase.
2. **Browser back button destroys game state mid-round** — Implement hole-by-hole flow as a state machine at `/` or `/play`, never as separate routes (`/hole/1`, `/hole/2`). Recovery cost is HIGH (rewrites all game flow routing). Lock routing approach before building any scoring screen.
3. **AnimatePresence exit animations silently do nothing** — Never wrap AnimatePresence direct children in fragments; always use stable meaningful keys (hole number, not array index); never combine `layout` prop with AnimatePresence exit on the same element. Establish a test pattern early.
4. **iOS Safari viewport/keyboard layout breaks score entry UI** — Use `100dvh` not `100vh`; avoid bottom-pinned elements near inputs; test on a real iPhone (not simulator) before animation layers are added.
5. **Admin page publicly accessible** — Protect `/admin` with env-var password gate before any deployment. No backend required — simple client-side check is sufficient for v1.

---

## Implications for Roadmap

Based on combined research, the build should follow a strict dependency order: foundation before game flow, game flow before content, content before polish. All critical pitfalls must be resolved in Phase 1 because they are architectural — retrofitting them costs as much as a full rewrite of affected layers.

### Phase 1: Foundation and State Architecture
**Rationale:** Every other phase depends on correct state management and routing approach. The two highest-recovery-cost pitfalls (state lost on refresh, back-button destruction) live here. Get these wrong and Phase 2-5 must be refactored.
**Delivers:** Working project scaffold with GameProvider, sessionStorage sync, SSR-safe storage abstraction, routing decision locked, LazyMotion configured, Tailwind theming system wired, TypeScript types defined
**Addresses:** Player setup input, QR → instant play (architectural choice)
**Avoids:** Pitfall 1 (state loss), Pitfall 2 (back-button), Pitfall 5 (Motion bundle size), Pitfall 7 (hardcoded content)
**Research flag:** Standard patterns — Next.js App Router setup is well-documented; no phase research needed

### Phase 2: Core Game Loop
**Rationale:** Once state architecture is locked, the complete play loop (setup → scoring → results) can be built top-to-bottom. This is the highest-value deliverable and should be functional (if not polished) as fast as possible for real-device testing.
**Delivers:** Full playable game — player setup, hole-by-hole scoring for all 9 holes, par display, over/under tracking, running totals, final rankings screen
**Addresses:** All table-stakes features from FEATURES.md
**Avoids:** Pitfall 4 (iOS keyboard/layout — test on real iPhone during this phase), Pitfall 6 (score input type — use `type="text" inputMode="numeric"`), Pitfall 8 (score validation — block advancing with invalid scores)
**Research flag:** Standard patterns — score entry and game state are straightforward; no phase research needed

### Phase 3: Hole Content System
**Rationale:** Hole content (markdown files, gray-matter loading, illustration rendering) is independent of game logic and can be built in parallel or immediately after Phase 2. It is the key product differentiator and must be in v1.
**Delivers:** 9 hole markdown files with frontmatter (name, par, illustrationSrc, instructions); `lib/content.ts` build-time loader; HoleContent component rendering name, instructions, and illustration placeholder inside HoleScoringView
**Addresses:** Per-hole illustrated content feature (key differentiator vs. competitors)
**Avoids:** Pitfall 7 (hardcoded content — all hole data comes from markdown), Pitfall 12 (markdown XSS — do not add rehype-raw in v1)
**Research flag:** Standard patterns — gray-matter + remark are well-documented; no phase research needed

### Phase 4: Animation and Polish
**Rationale:** Animations are pure enhancement that wrap existing components. They should be added after game logic and content are stable so they don't obscure bugs in underlying functionality. AnimatePresence patterns are finalized here.
**Delivers:** Motion AnimatePresence transitions between phases and holes; winner celebration animation; score entry micro-animations; reduced-motion support
**Addresses:** Framer Motion transitions (differentiator), animated winner celebration (differentiator)
**Avoids:** Pitfall 3 (AnimatePresence exit failures — use stable keys, no fragments, no layout+exit on same element), Pitfall 10 (motion.create() inside render — always at module level)
**Research flag:** Moderate — AnimatePresence edge cases with Next.js App Router warrant care; test each transition explicitly before moving on

### Phase 5: Admin and Operations
**Rationale:** Admin par configuration is operationally required before launch but has no player-facing dependency. Build last so it doesn't distract from the core game loop.
**Delivers:** `/admin` page with per-hole par form; env-var password gate; writes to localStorage `minigolf-par-config` key; GameProvider reads this on init
**Addresses:** Admin par configuration feature (operational requirement)
**Avoids:** Pitfall 9 (admin publicly accessible — password gate is acceptance criterion for this phase)
**Research flag:** Standard patterns — simple form with localStorage persistence is well-understood

### Phase Ordering Rationale

- **Foundation before everything:** Both highest-cost pitfalls (state loss, back-button routing) are architectural. Fixing them after game flow is built requires rewriting the game flow. They must be solved first.
- **Game loop before content:** Hole content is independent but the scoring view is its composition target. Having the scoring view exist first makes content integration straightforward.
- **Content before polish:** Animating a view that doesn't have real content yet leads to rework when real data changes layout.
- **Admin last:** Venue staff can tolerate hardcoded par values during development; players cannot tolerate a broken game loop.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 4 (Animation):** AnimatePresence + Next.js App Router edge cases are moderately complex. Worth a focused research pass on: (a) AnimatePresence with Client Component boundaries, (b) `prefers-reduced-motion` implementation pattern in Tailwind v4.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Foundation):** Next.js 16 App Router setup, Zustand with sessionStorage persist, and SSR-safe storage patterns are all covered by official docs at HIGH confidence.
- **Phase 2 (Game Loop):** Score input, running totals, and state machine rendering are standard patterns with no novel integrations.
- **Phase 3 (Content):** gray-matter + remark build-time loading is a well-documented Next.js pattern.
- **Phase 5 (Admin):** Simple form + localStorage write is the lowest-complexity work in the project.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Core stack verified against official docs for all packages; version compatibility confirmed. Minor uncertainty on Motion bundle size numbers (single source). |
| Features | MEDIUM | Competitor landscape well-documented from live products; venue-specific nuances (hole count, par expectations, admin needs) inferred from project context and PROJECT.md. |
| Architecture | HIGH | Verified against prototype code (`score_proto/`), official Next.js docs, Vercel KB, and shadcn/ui docs. Phase-state-machine pattern confirmed as the correct approach for this use case. |
| Pitfalls | MEDIUM | Critical pitfalls drawn from official issue trackers and official docs (HIGH sources). UX pitfalls based on domain reasoning and adjacent research. Some pitfall severity estimates are informed opinions. |

**Overall confidence:** HIGH for build approach; MEDIUM for feature prioritization details (validate with venue staff before v1.x work)

### Gaps to Address

- **Hole count flexibility:** Research assumes 9 holes throughout. If Playground HP's course has a different count, the config layer needs a `holeCount` constant rather than hardcoded 9s. Clarify before Phase 2.
- **Illustration assets:** FEATURES.md and ARCHITECTURE.md assume illustration SVGs exist at `/illustrations/hole-N.svg`. The actual asset pipeline (who creates them, what format) is undefined. Plan for placeholder display in Phase 3 with real asset integration as a milestone gate.
- **Admin password security:** The env-var password approach for `/admin` is explicitly "good enough for v1." If the course is high-traffic and the QR URL is public, a determined user can find `/admin`. Document this limitation and plan proper auth for v2.
- **Motion bundle size numbers:** The ~25KB vs ~5KB LazyMotion comparison came from a single LOW-confidence source. Verify with `next build` bundle analysis after Phase 1 setup.

---

## Sources

### Primary (HIGH confidence)
- [Next.js 16 Official Blog Post](https://nextjs.org/blog/next-16) — Turbopack stable, React 19.2, breaking changes
- [Next.js 16 Installation Docs](https://nextjs.org/docs/app/getting-started/installation) — create-next-app bootstraps v16
- [shadcn/ui React 19 Compatibility](https://ui.shadcn.com/docs/react-19) — React 19 supported, legacy-peer-deps
- [Tailwind CSS v4.2 Next.js Guide](https://tailwindcss.com/docs/guides/nextjs) — PostCSS plugin, no config file
- [Next.js App Router — Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components) — RSC patterns
- [React Context in Next.js App Router](https://vercel.com/kb/guide/react-context-state-management-nextjs) — Provider placement
- [shadcn/ui Theming with CSS Variables](https://ui.shadcn.com/docs/theming) — CSS variable system
- [AnimatePresence — Motion docs](https://motion.dev/docs/react-animate-presence) — Exit animation patterns
- [Window: sessionStorage — MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage) — Session scoping behavior
- [Next.js MDX Guide](https://nextjs.org/docs/app/guides/mdx) — @next/mdx for local files
- [Common mistakes with Next.js App Router — Vercel](https://vercel.com/blog/common-mistakes-with-the-next-js-app-router-and-how-to-fix-them) — Layout state caching
- [AnimatePresence + layout bug — GitHub Issue #1983](https://github.com/framer/motion/issues/1983) — Confirmed open bug

### Secondary (MEDIUM confidence)
- [PlayThru Mini](https://www.playthrumini.com/) — Competitor feature landscape
- [PuttScores](https://puttscores.com/) — Competitor feature landscape
- [Zustand Setup with Next.js](https://zustand.docs.pmnd.rs/guides/nextjs) — Client-only store pattern
- [Framer Motion AnimatePresence failure modes — JS Decoded/Medium](https://medium.com/javascript-decoded-in-plain-english/understanding-animatepresence-in-framer-motion-attributes-usage-and-a-common-bug-914538b9f1d3)
- [100vh problem with iOS Safari — DEV Community](https://dev.to/maciejtrzcinski/100vh-problem-with-ios-safari-3ge9)
- [React Markdown security guide — Strapi](https://strapi.io/blog/react-markdown-complete-guide-security-styling)
- Prototype code analysis: `score_proto/src/app/page.tsx`, `score_proto/src/lib/storage.ts`

### Tertiary (LOW confidence)
- [Framer Motion vs Motion One: Mobile Performance — reactlibraries.com](https://reactlibraries.com/blog/framer-motion-vs-motion-one-mobile-animation-performance-in-2025) — LazyMotion bundle size numbers; verify with build analysis

---
*Research completed: 2026-02-24*
*Ready for roadmap: yes*

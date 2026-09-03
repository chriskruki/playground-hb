# Playground HB — Mini Golf Scorecard

Mobile-first scorecard for the 9-hole Playground HB mini golf course (Huntington Beach).
Deployed at **score.playgroundhb.com**. Entry is scan-and-play via QR — no signup, no accounts.
State is **device-local only** (session/localStorage); there is no backend except one admin auth route.

## Stack

- **Next.js 15** (App Router, RSC) + **React 19**, TypeScript, Turbopack dev
- **Tailwind v4** (CSS-variable theme) + shadcn/ui primitives (`src/components/ui/`)
- **zustand** for game state, **framer-motion** for animation, **lucide-react** icons
- **gray-matter** parses hole markdown; font is **Bricolage Grotesque**
- **Playwright** e2e (`e2e/full-game.spec.ts`, chromium + mobile projects on port 3001)

## How the app works

Single-URL **phase state machine** (no per-screen routes, so the hardware back button never
destroys game state — `app-shell.tsx` intercepts `popstate`). Phases: `landing → setup → scoring → results`.

- **`src/components/app-shell.tsx`** — orchestrator: sticky header/nav, hydration from sessionStorage,
  par-override application, back-button guard, and a keyed fade-in that swaps the four phase screens.
- **`landing-screen` → `setup-screen`** (pick count → name players) **→ `scoring-screen`** (the core loop:
  `hole-progress` scoreboard selector + one `player-score-row` per player, each with a `score-input` stepper)
  **→ `results-screen`** (rankings, trophy/medals, confetti, count-up, Play Again).
- **`src/lib/game-store.ts`** — the zustand store. Shape: `phase`, `players[]`, `currentHole`,
  `scores: Record<playerId, number[]>` (index = hole − 1). Auto-persists to sessionStorage after hydration.
- **`src/content/holes/hole-0N.md`** — 9 holes; frontmatter `name`, `par`, `illustration` (unused),
  markdown body = `instructions`. Loaded server-side by `src/lib/holes.ts` (`loadHoles()` / `holes`).
  Instructions may contain trusted inline HTML and are rendered via `dangerouslySetInnerHTML`.
- **`/admin`** — server component gated by cookie; lets staff override per-hole par (localStorage,
  applied over markdown pars by `src/lib/par-overrides.ts`).

## Design language

Playful & vibrant "putt-putt scoreboard" that works for kids and grandparents alike.

- **Palette** (brand, in `globals.css` + mirrored in `src/lib/theme.ts`): cream `#fff8e8`, deep green
  `#1f4f38`, mustard `#e9b949`. Semantic score tokens: `--score-under` (green), `--score-over` (red),
  `--score-even`, `--celebrate` (mustard). Chunky cards via `.card-playful` / `--radius-playful`.
- **Motion**: subtle everywhere (150–250ms), saved for big moments (hole-in-one "Ace!" badge, results
  finale). All shared variants/timings live in **`src/lib/motion.ts`** — reuse them, don't redefine inline.
  `prefers-reduced-motion` is honored (confetti carries the `.celebration-only` class).
- **Accessibility**: touch targets ≥ 44px, high contrast, generous spacing, error-tolerant flows.
- Per-player accent colors: **`src/lib/player-accents.ts`** (`playerAccent(index)`).

## Rules & invariants (don't regress these)

- **Untouched holes count as 0** strokes (`MIN_SCORE` is `0`; `MAX_SCORE` in `src/lib/config.ts`).
  Running total and results must both treat an unset hole as 0 — keep them consistent.
- **`/admin` par form seeds from the true markdown pars** via `loadHoles()`, never from a hardcoded
  default array (that mismatch used to silently corrupt real pars).
- **Admin auth is server-side**: `src/app/api/admin/login/route.ts` checks the **server-only**
  `ADMIN_PASSWORD` env var (no `NEXT_PUBLIC_`) and sets an httpOnly cookie holding a sha256 hash of it.
  `src/lib/admin-auth.ts` is `import "server-only"` — never import it into a client component.
  The password must not appear in the client bundle.
- **Phase swaps use keyed fade-in, not `AnimatePresence mode="wait"`** at the app-shell level — the
  wait-for-exit variant deadlocks on the scoring screen's nested AnimatePresence/`layoutId` and silently
  breaks the scoring→results transition.

## Commands

```bash
npm run dev        # dev server (Turbopack)
npm run build      # prod build — the real typecheck/lint gate (ESLint isn't separately configured)
npm run test:e2e   # Playwright (auto-starts dev on :3001)
```

## Env

- `ADMIN_PASSWORD` — server-only, gates `/admin`. Defaults to `playground`; set a real value before deploy.

## Known pending / assets

- Results celebration renders **`public/mascot.png`** if present and degrades gracefully (404) otherwise —
  a mascot image is expected here.
- Hole `illustration` frontmatter and `public/illustrations/` are currently unused (design is text+motion).

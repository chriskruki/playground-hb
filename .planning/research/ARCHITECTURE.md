# Architecture Patterns

**Domain:** Mobile-first mini golf scoring web app (browser-only, no backend)
**Researched:** 2026-02-24
**Confidence:** HIGH (verified against prototype, Next.js docs, and shadcn/Tailwind official docs)

---

## Recommended Architecture

A single-page app-style architecture running inside Next.js App Router. The game flow is managed as a multi-phase state machine held in React Context (not URL-based routing), while static hole content comes from markdown files read at build time. An `/admin` route handles par configuration through a separate page. Everything runs client-side — no API routes, no database.

```
┌─────────────────────────────────────────────────────────────────┐
│  Next.js App Router (src/app/)                                  │
│                                                                 │
│  layout.tsx  ←  GameProvider (global client context)           │
│  │                                                              │
│  ├── page.tsx  (game shell — renders active phase view)        │
│  │   ├── LandingView       (phase: "landing")                  │
│  │   ├── SetupView         (phase: "setup")                    │
│  │   ├── HoleScoringView   (phase: "scoring", hole N of 9)     │
│  │   └── ResultsView       (phase: "results")                  │
│  │                                                              │
│  └── admin/                                                     │
│      └── page.tsx          (par configuration, no auth)        │
│                                                                 │
│  lib/                                                           │
│  ├── game-context.tsx     (GameProvider + useGame hook)        │
│  ├── storage.ts           (localStorage read/write)            │
│  ├── content.ts           (hole markdown loader)               │
│  └── config.ts            (theme + par defaults)               │
│                                                                 │
│  content/holes/                                                 │
│  ├── hole-1.md            (name, par, instructions)            │
│  ├── hole-2.md            ...                                   │
│  └── hole-9.md                                                 │
│                                                                 │
│  config/                                                        │
│  ├── theme.ts             (primary, secondary, accent)         │
│  └── par.ts               (per-hole par values, admin-editable)│
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| `GameProvider` | Owns all game state (players, currentHole, phase, scores); persists to localStorage | All phase views via `useGame` hook |
| `LandingView` | Shows logo, "Start Game" CTA; entry point after QR scan | `GameProvider` (triggers phase transition) |
| `SetupView` | Add/remove players, name entry, animated player cards | `GameProvider` (writes players), no external data |
| `HoleScoringView` | Score entry for all players on current hole; shows hole content (name, instructions, illustration) | `GameProvider` (reads/writes scores, hole index), `HoleContent` (markdown data) |
| `HoleContent` | Renders per-hole markdown as React component; shows par, name, illustration | Receives hole data as props (pre-loaded at build time) |
| `ResultsView` | Rankings, totals, winner celebration, "Play Again" | `GameProvider` (reads final scores, triggers reset) |
| `AdminPage` | Form to set per-hole par values; writes to localStorage | `storage.ts` (reads/writes par config); no game state |
| `storage.ts` | All localStorage read/write; SSR-safe (typeof window check) | Used by `GameProvider` and `AdminPage` |
| `content.ts` | Reads markdown files at build time using gray-matter; returns typed `HoleContent[]` | Used by page at build time (getStaticProps equivalent or imported directly as module) |
| `config/theme.ts` | Single source of truth for brand colors injected as CSS variables | Read by `globals.css` / Tailwind `@theme` block |
| `config/par.ts` | Default par values per hole; overridden by admin localStorage config | Read by `GameProvider` on init |

---

## Data Flow

### Game State Flow

```
User action (enter score, next hole)
  → useGame() hook dispatch
    → GameProvider updates state
      → useEffect syncs state to localStorage
        → UI re-renders via context
```

### Content Flow (hole instructions)

```
Build time:
  content/holes/hole-N.md
    → gray-matter parses frontmatter + body
      → HoleContent[] typed array
        → Passed as static props to HoleScoringView

Runtime:
  HoleScoringView receives currentHole index
    → Reads from HoleContent[currentHole - 1]
      → Renders name, par, instructions, illustration ref
```

### Par Configuration Flow

```
Admin page loads
  → Reads par config from localStorage (falls back to config/par.ts defaults)
    → Admin changes per-hole par values
      → Writes to localStorage under "minigolf-par-config" key
        → GameProvider reads par on game init
          → Par shown in HoleScoringView (over/under calculation)
```

### Theme Flow

```
config/theme.ts (TypeScript object: primary, secondary, accent)
  → injected as CSS custom properties in globals.css
    → Tailwind @theme block references --color-primary etc.
      → shadcn components use var(--primary) / Tailwind classes
        → All components themed consistently
```

---

## Patterns to Follow

### Pattern 1: Phase-Based State Machine

**What:** Game flow is a state machine with explicit phases: `"landing" | "setup" | "scoring" | "results"`. Phase is stored in GameProvider. Views are rendered conditionally within a single page using AnimatePresence for transitions.

**When:** Always — this is the core navigation pattern. Do not use Next.js routing for phase changes; URL stays at `/` throughout the game.

**Why not URL routing:** Each hole is not a separate URL (would require state reconstruction on deep link, poor UX when player presses Back). A single URL with state machine is the correct model for a session-based flow.

**Example:**
```typescript
// game-context.tsx
type Phase = "landing" | "setup" | "scoring" | "results";

interface GameState {
  phase: Phase;
  players: Player[];
  currentHole: number; // 1-9
  parConfig: number[];  // per-hole par values
}

// page.tsx — single page renders active phase
<AnimatePresence mode="wait">
  {phase === "landing" && <LandingView key="landing" />}
  {phase === "setup" && <SetupView key="setup" />}
  {phase === "scoring" && <HoleScoringView key={`hole-${currentHole}`} />}
  {phase === "results" && <ResultsView key="results" />}
</AnimatePresence>
```

### Pattern 2: Context Provider Wrapping Layout

**What:** GameProvider wraps the root layout, making game state accessible anywhere in the tree. Provider is a `"use client"` component. It restores state from localStorage on mount.

**When:** Required — all phase views need game state, and Context is appropriate for low-to-medium frequency updates (score entry, not animation ticks).

**Example:**
```typescript
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <GameProvider>{children}</GameProvider>
      </body>
    </html>
  );
}

// lib/game-context.tsx
"use client";
export function GameProvider({ children }) {
  const [state, setState] = useState<GameState>(defaultState);

  useEffect(() => {
    const saved = storage.getGameState();
    if (saved) setState(saved);
  }, []);

  useEffect(() => {
    if (state.phase !== "landing") storage.saveGameState(state);
  }, [state]);

  return <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>;
}
```

### Pattern 3: Markdown as Static Module Imports

**What:** Hole content lives in `content/holes/hole-N.md` with YAML frontmatter for structured data (name, par, illustrationSrc). Body is instructions text. Content is loaded once at module level using gray-matter — no dynamic file system reads at runtime.

**When:** All hole content access. Do not fetch markdown at runtime or from an API.

**Why not MDX:** MDX adds complexity (React components in markdown) that isn't needed — instructions are plain text. gray-matter + plain markdown is simpler and faster to edit for non-developers.

**Example:**
```typescript
// content/holes/hole-1.md
---
name: "The Windmill"
par: 3
illustrationSrc: "/illustrations/hole-1.svg"
---
Aim for the left side of the windmill blade...

// lib/content.ts
import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface HoleContent {
  holeNumber: number;
  name: string;
  par: number;
  illustrationSrc: string;
  instructions: string;
}

export function getAllHoleContent(): HoleContent[] {
  // Called at build time / module init, not per-request
}
```

### Pattern 4: Config-Driven Theming via CSS Variables

**What:** A single `config/theme.ts` file exports brand colors as a typed object. These are written into `globals.css` as CSS custom properties under Tailwind's `@theme` block. shadcn components use `var(--primary)` etc. No color values appear anywhere else in the codebase.

**When:** All color usage. Never use raw hex/rgb values in component code.

**Example:**
```css
/* globals.css */
@import "tailwindcss";

@theme {
  --color-primary: oklch(60% 0.2 280);
  --color-secondary: oklch(70% 0.15 180);
  --color-accent: oklch(75% 0.25 50);
}
```

```typescript
// config/theme.ts — single source of truth for documentation
export const theme = {
  primary: "oklch(60% 0.2 280)",
  secondary: "oklch(70% 0.15 180)",
  accent: "oklch(75% 0.25 50)",
} as const;
```

### Pattern 5: SSR-Safe Storage Abstraction

**What:** All localStorage access goes through `lib/storage.ts`, which guards every call with `typeof window === "undefined"` checks. No component ever calls `localStorage` directly.

**When:** Any state persistence. Required because Next.js renders components on the server during build; direct localStorage access throws.

**Example:**
```typescript
// lib/storage.ts
export function getGameState(): GameState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(GAME_STATE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
```

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Per-Hole URL Routing

**What:** Creating routes like `/hole/1`, `/hole/2` ... `/hole/9` via Next.js dynamic segments.

**Why bad:** Players pressing the browser Back button during scoring would navigate away from the game, losing in-memory context. URL-based navigation implies the URL is shareable and bookmarkable — hole pages are not (they require active game session). Adds complexity with no benefit.

**Instead:** State machine phases inside a single page. URL is always `/` during play.

### Anti-Pattern 2: Monolithic Page Component

**What:** Keeping all phase logic in a single file (as the prototype does — `page.tsx` is 580 lines handling setup, scoring, and leaderboard).

**Why bad:** Testing individual phases is hard. Animations for each phase are tangled. Each view grows independently over time; monolithic file becomes unmaintainable.

**Instead:** Extract each phase into its own component file (`LandingView`, `SetupView`, `HoleScoringView`, `ResultsView`). The page component only orchestrates which view is active.

### Anti-Pattern 3: Hardcoded Colors and Content

**What:** Writing `className="bg-purple-600"` or `<p>Aim for the left side...</p>` directly in components.

**Why bad:** Theming requires touching dozens of files. Content requires a developer. Defeats the purpose of a configurable system.

**Instead:** All colors via CSS variables from `config/theme.ts`. All hole content from markdown files. Par values from admin-configurable config.

### Anti-Pattern 4: Base64 Player Images in localStorage

**What:** Storing player photos as base64 strings in localStorage (the prototype does this).

**Why bad:** Each image can be hundreds of KB. With multiple players, this approaches the 5-10MB localStorage quota. Corrupt state on quota exceeded. Photos are out of scope for v1 per PROJECT.md.

**Instead:** Drop player photo capture for v1. Use initials/avatar placeholders. localStorage only stores names, scores, phase, and par config — lightweight text data.

### Anti-Pattern 5: Running Content Loading Client-Side

**What:** Fetching markdown files from an API route or `useEffect` when the scoring view mounts.

**Why bad:** Introduces loading states, error states, network dependency. Hole content is static — it never changes at runtime.

**Instead:** Load all hole content at module init in `lib/content.ts` using Node.js `fs` module (runs at build time / server side). Pass as static data to components.

---

## Build Order (Phase Dependency)

Components have clear dependencies that dictate build order:

```
1. Config + Types
   config/theme.ts, config/par.ts
   lib/types.ts (Player, GameState, HoleContent interfaces)

   ↓ (nothing else can be built without these)

2. Infrastructure
   lib/storage.ts      (requires: types)
   lib/content.ts      (requires: types, gray-matter)
   globals.css         (requires: theme config for CSS vars)

   ↓

3. State Layer
   lib/game-context.tsx  (requires: types, storage)
   app/layout.tsx        (requires: game-context)

   ↓

4. Leaf Components (no inter-component deps)
   HoleContent display component
   Player card component
   Score input component
   Progress indicator component

   ↓

5. Phase Views (require leaf components + context)
   LandingView    (requires: game-context)
   SetupView      (requires: game-context, player card)
   HoleScoringView (requires: game-context, HoleContent, score input)
   ResultsView    (requires: game-context)

   ↓

6. Page Assembly
   app/page.tsx   (requires: all phase views, AnimatePresence)
   app/admin/page.tsx (requires: storage, par config)

   ↓

7. Animation Layer
   Framer Motion variants added to all phase views
   Transition polish between holes
```

**Rationale:** Leaf components and infrastructure can be built in parallel. Phase views each correspond to a discrete feature that can be developed and tested independently once the state layer exists.

---

## Scalability Considerations

| Concern | v1 (browser-only) | v2 (if backend added) | Notes |
|---------|-------------------|----------------------|-------|
| Game state storage | localStorage (5-10MB limit) | Database per session | GameProvider abstraction makes this swappable |
| Hole content | Markdown files in repo | CMS or admin editor | `lib/content.ts` abstraction isolates the change |
| Par config | localStorage | Database with admin UI | Same storage abstraction |
| Multiple simultaneous games | Naturally isolated (one game per browser tab) | Session IDs required | Not a v1 concern |
| Photo capture | Removed (quota risk) | Server-side storage | Explicit anti-feature for v1 |

---

## Sources

- Next.js App Router — Server and Client Components: https://nextjs.org/docs/app/getting-started/server-and-client-components (HIGH confidence — official docs)
- React Context in Next.js App Router: https://vercel.com/kb/guide/react-context-state-management-nextjs (HIGH confidence — official Vercel KB)
- shadcn/ui Theming with CSS Variables: https://ui.shadcn.com/docs/theming (HIGH confidence — official docs)
- Tailwind v4 CSS-first theming with @theme: https://www.shadcnblocks.com/blog/tailwind4-shadcn-themeing/ (MEDIUM confidence — verified against Tailwind v4 docs)
- Next.js MDX guide: https://nextjs.org/docs/app/guides/mdx (HIGH confidence — official docs)
- gray-matter for frontmatter parsing: https://www.npmjs.com/package/gray-matter (HIGH confidence — npm official)
- Prototype analysis: score_proto/src/app/page.tsx and score_proto/src/lib/storage.ts (HIGH confidence — direct code review)
- Framer Motion AnimatePresence patterns: https://motion.dev (MEDIUM confidence — library official, some Next.js 14+ caveats noted)
- State management comparison (Zustand vs Context): https://dev.to/cristiansifuentes/react-state-management-in-2025-context-api-vs-zustand-385m (MEDIUM confidence — community, verified against React docs)

# Phase 2: Game Flow - Research

**Researched:** 2026-03-10
**Domain:** Mini golf scoring UI -- landing, player setup, hole-by-hole scoring with markdown content
**Confidence:** HIGH

## Summary

Phase 2 builds the entire playable game loop on top of Phase 1's foundation: a branded landing screen, animated player setup, 9-hole scoring with +/- buttons and par tracking, and markdown-sourced hole content. The state machine (`game-store.ts`) and sessionStorage persistence are already wired -- Phase 2 replaces the four placeholder screens in `app-shell.tsx` with real implementations.

The technical surface is straightforward. The hardest parts are (a) getting the hole markdown content system right at build time using gray-matter, (b) the +/- score input UX with par-relative color coding, and (c) animated transitions between holes using the already-installed Framer Motion. All required libraries are already installed except `gray-matter` which needs to be added.

**Primary recommendation:** Split into 3 plans: (1) hole content data layer + landing/setup screens, (2) scoring screen with all SCORE-* requirements, (3) hole content rendering + transitions polish. This keeps each plan focused and testable.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| LAND-01 | Branded landing page with Playground HB logo and course name | Existing Logo component + theme system; replace LandingScreen placeholder |
| LAND-02 | Prominent "Start Game" button to begin | Existing Button component + goToSetup() transition already wired |
| SETUP-01 | Add player names one at a time, no limit on group size | Existing addPlayer/removePlayer store actions; needs Input + list UI |
| SETUP-02 | Remove a player before starting | Existing removePlayer() action; needs trash icon button per player row |
| SETUP-03 | Animated, friendly player setup interface | Framer Motion AnimatePresence for player list items entering/exiting |
| SETUP-04 | Cannot start game with zero players or empty names | Existing goToScoring() guard already validates this; add UI feedback |
| SCORE-01 | One hole at a time with hole name and number | Hole content data from markdown files; render current hole info |
| SCORE-02 | Enter scores for all players before advancing | UI shows all players on current hole; Next button advances |
| SCORE-03 | +/- increment buttons with par as default | Custom score input component; initialize score to par value |
| SCORE-04 | Par value displayed for current hole | Hole content data includes par; display above/beside scores |
| SCORE-05 | Over/under par indicator per player (green/red) | Simple math: score - par; conditional Tailwind classes |
| SCORE-06 | Running total strokes per player during play | Computed from scores array in store; display in scoreboard |
| SCORE-07 | Hole progress indicator | Simple "Hole X / 9" text or progress bar |
| SCORE-08 | Smooth animated transitions between holes | Framer Motion AnimatePresence with directional slide |
| HOLE-01 | Hole-specific content (name, illustration placeholder, instructions) | Markdown frontmatter + body per hole |
| HOLE-02 | Hole content rendered from per-hole editable markdown files | gray-matter parses at build time via utility function |
| HOLE-03 | All 9 holes have placeholder content with correct names | Create 9 markdown files with frontmatter |
</phase_requirements>

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 15.4.5 | App framework, static rendering | Already scaffolded in Phase 1 |
| React | 19.1.0 | UI components | Already installed |
| Zustand | 5.x | State machine, game store | Already wired with sessionStorage sync |
| Framer Motion | 11.18.2 | Hole transitions, player list animations | Already installed, AnimatePresence already in app-shell |
| Lucide React | 0.536.0 | Icons (Plus, Minus, Trash2, ChevronRight) | Already installed |
| Tailwind CSS | 4.x | Styling with theme tokens | Already configured with brand colors |
| shadcn pattern | - | Button, Card, Input components | Already set up manually |

### To Install
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| gray-matter | 4.0.3 | Parse YAML frontmatter from hole markdown files | Build-time content loading |

### NOT Needed
| Library | Why Not |
|---------|---------|
| remark / rehype / MDX | Hole content is simple (name, instructions, par) -- frontmatter covers all structured data, body is 1-2 sentences of plain text. No need for full markdown-to-HTML pipeline. |
| react-markdown | Same reason -- the "content" field from markdown body is plain text, can be rendered directly |
| next-mdx-remote | Overkill -- we are not rendering interactive MDX, just reading data files |

**Installation:**
```bash
cd score && npm install gray-matter
```

## Architecture Patterns

### Recommended Project Structure
```
score/src/
  content/
    holes/
      hole-01.md          # Frontmatter: name, par, illustration; Body: instructions
      hole-02.md
      ...
      hole-09.md
  lib/
    game-store.ts         # EXISTS -- add par defaults, score initialization
    storage.ts            # EXISTS -- no changes needed
    holes.ts              # NEW -- load and parse all 9 hole markdown files
    theme.ts              # EXISTS -- no changes
    utils.ts              # EXISTS -- no changes
  components/
    app-shell.tsx          # EXISTS -- replace placeholder screens with real components
    landing-screen.tsx     # NEW -- branded landing with logo + Start Game
    setup-screen.tsx       # NEW -- player name input + list + Start Scoring
    scoring-screen.tsx     # NEW -- hole display + score inputs + progress
    score-input.tsx        # NEW -- +/- buttons for a single player's score
    player-score-row.tsx   # NEW -- single player row in scoring view
    hole-progress.tsx      # NEW -- "Hole X / 9" indicator
    logo.tsx               # EXISTS
    ui/
      button.tsx           # EXISTS
      card.tsx             # EXISTS
      input.tsx            # EXISTS
```

### Pattern 1: Hole Content as Static Data (Build-Time)
**What:** Markdown files in `src/content/holes/` with YAML frontmatter parsed by gray-matter into a typed array at import time. Since this is a client-side SPA (single URL, no routes), the hole data module exports a static array that gets bundled.
**When to use:** Always for hole content -- this is the locked decision from roadmap.

```typescript
// score/src/content/holes/hole-01.md
// ---
// name: "Pay-Lay Your Bets"
// par: 3
// illustration: "/illustrations/hole-01.svg"
// ---
// Aim for the center ramp to avoid the side gutters. A steady hand wins here!

// score/src/lib/holes.ts
import matter from "gray-matter";
import fs from "fs";
import path from "path";

export interface HoleData {
  number: number;
  name: string;
  par: number;
  illustration: string;
  instructions: string;
}

// This runs at build time (imported in a server component or used via generateStaticParams)
function loadHoles(): HoleData[] {
  const holesDir = path.join(process.cwd(), "src/content/holes");
  const holes: HoleData[] = [];
  for (let i = 1; i <= 9; i++) {
    const filePath = path.join(holesDir, `hole-${String(i).padStart(2, "0")}.md`);
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);
    holes.push({
      number: i,
      name: data.name,
      par: data.par,
      illustration: data.illustration ?? `/illustrations/hole-${String(i).padStart(2, "0")}.svg`,
      instructions: content.trim(),
    });
  }
  return holes;
}

export const holes: HoleData[] = loadHoles();
```

**CRITICAL CONSTRAINT:** gray-matter uses `fs` (Node.js only). This cannot run in client components. Two approaches:
1. **Server Component data prop drilling** -- load in page.tsx (server component), pass as prop to client AppShell
2. **Build-time JSON generation** -- a script or Next.js `generateStaticParams` that writes a `holes.json` file importable anywhere

**Recommended: Approach 1** -- page.tsx loads holes server-side, passes typed array as prop to the client-side AppShell. This is the Next.js 15 App Router idiom and requires zero extra build scripts.

### Pattern 2: Score Input Component with Par Default
**What:** A dedicated component for +/- score entry per player per hole.
**When to use:** For every player on every hole in the scoring screen.

```typescript
// Conceptual pattern for ScoreInput
interface ScoreInputProps {
  playerId: string;
  hole: number;
  par: number;
  currentScore: number;
  onScoreChange: (score: number) => void;
}

// Score defaults to par on first render if no score exists yet
// Min score: 1 (can't score 0 in mini golf)
// +/- buttons with 44px min touch target (already in Button component)
// Color: green text if under par, red if over, neutral if at par
```

### Pattern 3: Directional Hole Transitions
**What:** AnimatePresence with slide direction based on next/previous hole navigation.
**When to use:** When advancing or going back between holes.

```typescript
// Track direction in component state (not store)
const [direction, setDirection] = useState<1 | -1>(1);

// Variants for directional slide
const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
};

<AnimatePresence mode="wait" custom={direction}>
  <motion.div
    key={currentHole}
    custom={direction}
    variants={variants}
    initial="enter"
    animate="center"
    exit="exit"
    transition={{ duration: 0.25 }}
  >
    {/* Hole content */}
  </motion.div>
</AnimatePresence>
```

### Anti-Patterns to Avoid
- **Importing gray-matter in client components:** Will fail at runtime -- `fs` is not available in the browser. Always load in server components or at build time.
- **Storing hole content in Zustand store:** Hole data is static and never changes during gameplay. Pass as props, don't pollute the game state store.
- **Hardcoding par values:** Par must come from hole data (and eventually from admin overrides in Phase 4). Use hole data as the source, with a future hook point for admin overrides.
- **Using `onChange` with number inputs for scoring:** On mobile, number inputs are terrible UX. Use dedicated +/- buttons with explicit `setScore` calls.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| YAML frontmatter parsing | Custom regex parser | gray-matter 4.0.3 | Edge cases in YAML parsing are numerous |
| Icons (plus, minus, trash) | SVG strings | lucide-react | Consistent, tree-shakeable, accessible |
| Score +/- touch targets | Raw divs with click handlers | Button component (variant="outline", size="icon") | Already has 44px min-height for touch |
| Player list animations | CSS transitions | Framer Motion AnimatePresence + motion.div | Handles mount/unmount animations correctly |
| Over/under par color logic | Complex CSS | Tailwind conditional classes | `score < par ? "text-green-600" : score > par ? "text-red-500" : "text-foreground"` |

## Common Pitfalls

### Pitfall 1: gray-matter in Client Components
**What goes wrong:** `Module not found: Can't resolve 'fs'` error at build time.
**Why it happens:** gray-matter imports Node.js `fs` module. Client components cannot use Node.js APIs.
**How to avoid:** Load hole data in the server component (page.tsx), pass as serializable prop to client AppShell.
**Warning signs:** Any import of `holes.ts` (the gray-matter file) inside a `"use client"` module.

### Pitfall 2: Score Not Defaulting to Par
**What goes wrong:** Scores show as 0 or undefined when a hole first loads, instead of par.
**Why it happens:** The scores array in the store is empty initially -- `scores[playerId][hole-1]` is undefined.
**How to avoid:** In the scoring UI, treat `undefined` score as par value for display. Only write to store when user explicitly changes it. On advancing to next hole, if score was never set, persist par as the score.
**Warning signs:** Scores of 0 appearing, or NaN in running totals.

### Pitfall 3: Score Initialization Before Advancing
**What goes wrong:** User advances to next hole without all players having scores recorded.
**Why it happens:** If a player's score is still undefined (never touched +/-), it's missing from the scores array.
**How to avoid:** On "Next Hole" click, auto-fill any missing scores with par value before advancing. This ensures the running total is always accurate.
**Warning signs:** Running totals that don't account for all holes.

### Pitfall 4: AnimatePresence Key Collisions
**What goes wrong:** Transitions between holes don't animate, or animate incorrectly.
**Why it happens:** If the `key` prop on the motion.div doesn't change, AnimatePresence won't trigger exit/enter.
**How to avoid:** Use `key={currentHole}` (a number 1-9) which is guaranteed unique per hole.
**Warning signs:** Content changes but no animation plays.

### Pitfall 5: Prop Drilling Hole Data Through AppShell Refactor
**What goes wrong:** AppShell is currently a self-contained client component. Adding a `holes` prop requires changing page.tsx.
**Why it happens:** Phase 1 built AppShell as the entire app. Now we need server-loaded data flowing in.
**How to avoid:** Plan this refactor explicitly in the first task. page.tsx becomes a server component that loads holes and passes them as `holesData` prop to AppShell.
**Warning signs:** Trying to call `fs.readFileSync` inside app-shell.tsx.

### Pitfall 6: Mobile Keyboard Blocking Score Inputs
**What goes wrong:** Text input for player names causes keyboard to cover the input field.
**Why it happens:** iOS Safari doesn't scroll well when focused input is behind keyboard.
**How to avoid:** For player names, use `Input` component with `autoComplete="off"`. For scores, use +/- buttons exclusively (no text input needed). The iOS zoom prevention CSS is already in globals.css.
**Warning signs:** Users can't see what they're typing on iPhone.

## Code Examples

### Hole Markdown File Format
```markdown
---
name: "Pay-Lay Your Bets"
par: 3
illustration: "/illustrations/hole-01.svg"
---
Aim for the center ramp to avoid the side gutters. A steady hand wins here!
```

### Server-Side Hole Loading in page.tsx
```typescript
// score/src/app/page.tsx (server component -- no "use client")
import { AppShell } from "@/components/app-shell";
import { holes } from "@/lib/holes";

export default function Home() {
  // holes is loaded at build time via gray-matter (server-only)
  return <AppShell holesData={holes} />;
}
```

### Running Total Computation
```typescript
// Utility function -- does not need to be in the store
function getPlayerTotal(scores: Record<string, number[]>, playerId: string): number {
  return (scores[playerId] ?? []).reduce((sum, s) => sum + (s ?? 0), 0);
}

function getPlayerTotalVsPar(scores: Record<string, number[]>, playerId: string, holes: HoleData[]): number {
  const playerScores = scores[playerId] ?? [];
  return playerScores.reduce((total, score, i) => {
    if (score === undefined) return total;
    return total + (score - holes[i].par);
  }, 0);
}
```

### Over/Under Par Color Classes
```typescript
function parColorClass(score: number, par: number): string {
  if (score < par) return "text-green-600";  // under par -- good
  if (score > par) return "text-red-500";    // over par -- bad
  return "text-foreground";                   // at par -- neutral
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| getStaticProps + gray-matter | Server Components + gray-matter | Next.js 13+ (2023) | No getStaticProps needed; import in server component directly |
| framer-motion package name | Still framer-motion on npm, but "Motion" branding | 2024-2025 | Import path unchanged: `from "framer-motion"` |
| Zustand v4 persist middleware | Zustand v5 subscribe pattern | 2024 | Project already uses subscribe pattern (Phase 1 decision) |

## Open Questions

1. **Hole names for all 9 holes**
   - What we know: Hole 1 is referenced as "Pay-Lay Your Bets" in the requirements example
   - What's unclear: Names for holes 2-9
   - Recommendation: Use fun placeholder names (plan can define these). They're easily editable in the markdown files.

2. **Par values for each hole**
   - What we know: Admin can configure par in Phase 4. Default par values are needed now.
   - What's unclear: Whether the venue has standard par values
   - Recommendation: Default all holes to par 3 (standard mini golf). Phase 4 admin will allow overrides stored in localStorage.

3. **Illustration placeholders**
   - What we know: STATE.md flags "Illustration assets (SVGs) for holes are undefined -- plan for placeholder display"
   - What's unclear: What placeholder to use
   - Recommendation: Use a simple colored div with hole number and a generic golf icon from lucide-react. No SVG files needed yet.

4. **Par override integration point (Phase 4)**
   - What we know: Phase 4 will store admin-set par values in localStorage
   - What's unclear: How scoring screen will merge admin pars with markdown defaults
   - Recommendation: Design hole data access as a function that can be extended later: `getHolePar(holeNumber)` checks localStorage first, falls back to markdown default. But for Phase 2, just use markdown values directly -- Phase 4 can add the override layer.

## Sources

### Primary (HIGH confidence)
- gray-matter npm: https://www.npmjs.com/package/gray-matter -- v4.0.3, API surface
- Framer Motion AnimatePresence: https://motion.dev/docs/react-animate-presence -- exit animations, custom variants
- Next.js MDX/Markdown guide: https://nextjs.org/docs/app/guides/mdx -- server component data loading patterns

### Secondary (MEDIUM confidence)
- Next.js 15 markdown blog patterns: https://www.adeelhere.com/blog/2025-12-10-how-to-build-a-markdown-blog-with-nextjs -- gray-matter + App Router integration
- Motion docs on animation: https://motion.dev/docs/react-animation -- transition configuration

### Tertiary (LOW confidence)
- None -- all findings verified against official docs or installed package versions

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already installed and verified in package.json except gray-matter (well-known, stable at v4.0.3)
- Architecture: HIGH -- patterns follow standard Next.js 15 App Router idioms, state machine already proven in Phase 1
- Pitfalls: HIGH -- gray-matter/fs constraint is well-documented; score defaulting is a common UX pattern

**Research date:** 2026-03-10
**Valid until:** 2026-04-10 (stable domain, no fast-moving dependencies)

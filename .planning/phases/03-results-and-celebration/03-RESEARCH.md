# Phase 3: Results and Celebration - Research

**Researched:** 2026-03-10
**Domain:** Framer Motion celebration animations, score ranking logic, React component patterns
**Confidence:** HIGH

## Summary

Phase 3 replaces the inline `ResultsScreen` placeholder in `app-shell.tsx` with a full results component that ranks players by total strokes, displays per-player over/under par for the round, highlights the winner with a Framer Motion celebration animation, and provides a "Play Again" button that resets to landing.

The store already has everything needed: `scores` (Record of player ID to number array), `players`, `goToLanding()` (which clears sessionStorage and resets state), and `holesData` is passed through `AppShell`. The scoring screen already computes running totals and par differentials -- the results screen reuses the same math. No new libraries are needed. Framer Motion (already installed at ^11.11.17) provides all animation primitives: `motion.div` for staggered entrance, spring physics for the winner highlight, and potentially confetti-style particle effects via animated divs.

**Primary recommendation:** Build a single `ResultsScreen` component that receives `holesData` as prop (same pattern as `ScoringScreen`), computes rankings from the Zustand store, and uses Framer Motion staggered list animations with a special winner celebration variant. Extract it into `score/src/components/results-screen.tsx` and wire it into `AppShell` replacing the inline placeholder.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| RES-01 | Final rankings sorted by total strokes (lowest wins) after all 9 holes | Sort players by sum of `scores[playerId]` array; ties broken by player order (no tiebreaker requirement). Store already has all data. |
| RES-02 | Each player's total score and over/under par for the round | Sum all 9 hole pars from `holesData` for course par total; subtract from player total for +/- display. Reuse color coding pattern from `PlayerScoreRow`. |
| RES-03 | Winner highlighted with celebration animation (Framer Motion) | Framer Motion `motion.div` with `variants` for staggered entrance + special winner variant with scale/glow effect. Optional confetti via animated particle divs. |
| RES-04 | Start new game from results screen | `goToLanding()` already exists in store, clears sessionStorage and resets all state. Wire to "Play Again" button. |
</phase_requirements>

## Standard Stack

### Core (already installed -- no new dependencies)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| framer-motion | ^11.11.17 | Winner celebration animation, staggered list entrance | Already used throughout app for screen transitions |
| zustand | ^5.0.0 | Read scores/players state for ranking | Existing state management |
| lucide-react | ^0.536.0 | Trophy/crown icon for winner | Already installed, used in scoring screen |
| tailwindcss | ^4 | Styling results cards, responsive layout | Project standard |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| class-variance-authority | ^0.7.1 | Variant styling for rank positions (1st/2nd/3rd) | Already installed via shadcn/ui pattern |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom confetti divs | canvas-confetti (npm) | Adding a dependency for a one-time effect is overkill; 5-10 animated divs with Framer Motion achieve a satisfying result without bundle cost |

**Installation:**
```bash
# No new packages needed -- everything is already installed
```

## Architecture Patterns

### Recommended Project Structure
```
score/src/components/
  results-screen.tsx      # NEW: Full results screen component
  app-shell.tsx           # MODIFIED: Import ResultsScreen, pass holesData, remove inline placeholder
```

### Pattern 1: Screen Component with holesData Prop
**What:** Results screen follows the same pattern as ScoringScreen -- a client component that receives `holesData: HoleData[]` as prop and reads game state from Zustand.
**When to use:** All screen-level components in this app.
**Example:**
```typescript
// Follows established pattern from scoring-screen.tsx
interface ResultsScreenProps {
  holesData: HoleData[];
}

export function ResultsScreen({ holesData }: ResultsScreenProps) {
  const { players, scores, goToLanding } = useGameStore((s) => ({
    players: s.players,
    scores: s.scores,
    goToLanding: s.goToLanding,
  }));
  // ... ranking logic, render
}
```

### Pattern 2: Staggered List Animation with Framer Motion
**What:** Each player rank row animates in with a staggered delay, winner gets special treatment.
**When to use:** Ordered list reveals where visual hierarchy matters.
**Example:**
```typescript
// Container with staggerChildren
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

// Individual row
const rowVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// Winner gets extra emphasis
const winnerVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", bounce: 0.5 },
  },
};
```

### Pattern 3: Ranking Computation
**What:** Sort players by total strokes, compute over/under par for the full round.
**Example:**
```typescript
const coursePar = holesData.reduce((sum, h) => sum + h.par, 0);

const rankings = players
  .map((player) => {
    const totalStrokes = scores[player.id]?.reduce((sum, s) => sum + s, 0) ?? 0;
    const overUnder = totalStrokes - coursePar;
    return { ...player, totalStrokes, overUnder };
  })
  .sort((a, b) => a.totalStrokes - b.totalStrokes);
```

### Anti-Patterns to Avoid
- **Recomputing holesData from markdown on client:** holesData is already passed as prop from server component. Never import `holes.ts` in a client component.
- **Adding route navigation for "Play Again":** The app uses a single-URL state machine. `goToLanding()` resets the Zustand store and clears sessionStorage. Do not use `router.push()`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Confetti particles | Canvas-based particle system | 8-12 motion.divs with randomized keyframes | Simpler, no canvas overhead, Framer Motion already loaded |
| Celebration sound | Web Audio API integration | Skip sound entirely | No audio requirement in spec; adds complexity and UX annoyance |

## Common Pitfalls

### Pitfall 1: Score Array Gaps
**What goes wrong:** If a player somehow has undefined entries in their scores array, `reduce` produces NaN.
**Why it happens:** The scoring screen auto-fills with par on advance, but edge cases (hydration from corrupted sessionStorage) could leave gaps.
**How to avoid:** Defensive reduce: `scores[player.id]?.reduce((sum, s) => sum + (s ?? 0), 0) ?? 0`. Or even better, fall back to par for missing holes: `scores[player.id]?.[i] ?? holesData[i].par`.
**Warning signs:** NaN showing up in totals on results screen.

### Pitfall 2: goToLanding Guard
**What goes wrong:** `goToLanding()` in the store has a guard: it only works when `phase === "results"`. This is correct behavior -- but if somehow the phase is wrong, the button silently does nothing.
**How to avoid:** This is already handled correctly by the state machine. Just call `goToLanding()` from the results screen and it will work.

### Pitfall 3: Winner Tie Handling
**What goes wrong:** Multiple players could tie for first place.
**Why it happens:** Two players with identical total strokes.
**How to avoid:** Check if `rankings[0].totalStrokes === rankings[1]?.totalStrokes`. If tied, highlight all tied-for-first players as co-winners. The spec says "winner is highlighted" (singular) but a tie should still celebrate all winners.
**Warning signs:** Only one player highlighted when two tied.

### Pitfall 4: AnimatePresence Transition from Scoring
**What goes wrong:** The AppShell already wraps screen changes in `AnimatePresence mode="wait"` with opacity fade. The results screen's internal staggered animation needs to work WITH this, not fight it.
**How to avoid:** The AppShell transition is `duration: 0.2` opacity. The results screen's staggered entrance should start after mount (which happens after AppShell's enter animation). Using `variants` with `staggerChildren` on mount naturally handles this timing.

## Code Examples

### Complete Ranking Computation (verified pattern from existing codebase)
```typescript
// Reuses the same total-strokes logic from scoring-screen.tsx getTotalStrokes()
function computeRankings(
  players: Player[],
  scores: Record<string, number[]>,
  holesData: HoleData[]
) {
  const coursePar = holesData.reduce((sum, h) => sum + h.par, 0);

  return players
    .map((player) => {
      let totalStrokes = 0;
      for (let i = 0; i < holesData.length; i++) {
        totalStrokes += scores[player.id]?.[i] ?? holesData[i].par;
      }
      const overUnder = totalStrokes - coursePar;
      return { ...player, totalStrokes, overUnder, rank: 0 };
    })
    .sort((a, b) => a.totalStrokes - b.totalStrokes)
    .map((entry, idx, arr) => ({
      ...entry,
      rank: idx === 0 || entry.totalStrokes !== arr[idx - 1].totalStrokes
        ? idx + 1
        : arr[idx - 1].rank ?? idx + 1,
    }));
}
```

### Over/Under Display Pattern (from PlayerScoreRow)
```typescript
// Existing pattern in player-score-row.tsx -- reuse for round totals
const overUnder = totalStrokes - coursePar;
const display =
  overUnder > 0
    ? { text: `+${overUnder}`, className: "text-red-500" }
    : overUnder < 0
      ? { text: `${overUnder}`, className: "text-green-600" }
      : { text: "E", className: "text-muted-foreground" };
```

### AppShell Wiring (replace inline ResultsScreen)
```typescript
// In app-shell.tsx, replace inline ResultsScreen with:
import { ResultsScreen } from "@/components/results-screen";

// In render:
{phase === "results" && <ResultsScreen holesData={holesData} />}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Framer Motion v10 layout animations | Framer Motion v11 improved layout transitions | 2024 | Stagger animations are stable and performant in v11 |
| react-confetti / canvas-confetti | Lightweight motion.div particles | Current | No extra dependency for simple celebration effects |

## Open Questions

1. **Tie-breaking policy**
   - What we know: Requirements say "winner is highlighted" (singular)
   - What's unclear: Should ties highlight all tied players, or use a secondary tiebreaker?
   - Recommendation: Highlight all tied-for-first players as co-winners. Simple, fair, no extra complexity.

2. **Trophy/podium visual design**
   - What we know: App uses shadcn/ui Card components, lucide-react icons, forest green/golden yellow theme
   - What's unclear: Exact visual treatment of winner row vs others
   - Recommendation: Winner row gets a gold/accent border with Trophy icon, scale-up spring animation, and subtle glow. Other rows get standard card styling with rank number.

## Sources

### Primary (HIGH confidence)
- Existing codebase: `game-store.ts`, `scoring-screen.tsx`, `player-score-row.tsx`, `app-shell.tsx` -- verified all store actions, data shapes, and component patterns
- Existing codebase: `storage.ts` -- confirmed `goToLanding()` calls `clearGameState()` which removes sessionStorage
- `package.json` -- confirmed framer-motion ^11.11.17, zustand ^5.0.0, lucide-react ^0.536.0 already installed

### Secondary (MEDIUM confidence)
- Framer Motion stagger/spring patterns are well-established in v11 (consistent with training data and existing project usage)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - no new dependencies, everything already installed and in use
- Architecture: HIGH - follows exact patterns established in Phase 2 (ScoringScreen as template)
- Pitfalls: HIGH - identified from direct code analysis of store guards and score data structures
- Animation patterns: MEDIUM - Framer Motion stagger/spring patterns are standard but specific API confirmed from project's existing usage

**Research date:** 2026-03-10
**Valid until:** 2026-04-10 (stable -- no fast-moving dependencies)

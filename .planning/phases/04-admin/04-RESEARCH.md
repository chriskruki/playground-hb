# Phase 4: Admin - Research

**Researched:** 2026-03-10
**Domain:** Admin configuration page with password gate and localStorage persistence (React/Next.js)
**Confidence:** HIGH

## Summary

Phase 4 adds a standalone `/admin` route where venue staff can configure par values for all 9 holes. The current architecture loads par values from markdown frontmatter at build time via `loadHoles()` in `src/lib/holes.ts`, which runs server-side. The admin page must write par overrides to `localStorage` (not `sessionStorage`, since admin config must survive tab close), and the scoring flow must merge these overrides with the markdown defaults at runtime.

The password gate is a simple client-side check against a `NEXT_PUBLIC_ADMIN_PASSWORD` environment variable, as decided in the roadmap. This is not secure authentication -- it is a casual discovery barrier only. The admin page itself is a Next.js route at `/app/admin/page.tsx`, completely separate from the single-URL state machine used by the game flow.

The primary technical challenge is the par value override mechanism: the scoring screen currently receives `holesData` (including `par`) as a prop from the server component. The admin-set par values live in `localStorage` (client-side only). The solution is a thin client-side utility that merges localStorage overrides onto the server-provided hole data before consumption.

**Primary recommendation:** Create `/admin` as a separate Next.js route with a client-side password prompt, a simple form for 9 par values, localStorage persistence, and a utility function that merges admin par overrides onto server-loaded hole data.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| ADM-01 | Admin can access /admin page to configure par values for each of the 9 holes | New Next.js route at `app/admin/page.tsx` with password gate and per-hole par input form |
| ADM-02 | Par values set in admin persist in browser storage and are used during gameplay | localStorage persistence with merge utility consumed by scoring screen |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 15.4.5 | App router for `/admin` route | Already in project |
| React | 19.1.0 | Component rendering | Already in project |
| Zustand | 5.x | Not needed for admin (admin is separate from game state) | Game state only |
| Tailwind CSS | 4.x | Styling | Already in project |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | 0.536.x | Icons for admin UI (Lock, Save, Check) | Already installed |
| framer-motion | 11.x | Optional subtle transitions on admin page | Already installed, use sparingly |

### No New Dependencies
This phase requires zero new packages. Everything needed is already installed.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── admin/
│   │   └── page.tsx           # Admin route (client component)
│   ├── page.tsx               # Game route (existing)
│   └── layout.tsx             # Existing layout
├── lib/
│   ├── holes.ts               # Existing: loads from markdown (server)
│   ├── par-overrides.ts       # NEW: localStorage read/write for par overrides
│   ├── game-store.ts          # Existing: game state
│   └── storage.ts             # Existing: sessionStorage for game
└── components/
    └── admin/                 # Optional: admin-specific components if needed
```

### Pattern 1: Par Override Merge
**What:** A client-side utility reads localStorage par overrides and merges them onto server-loaded `HoleData[]`.
**When to use:** Every time the game scoring screen needs par values.
**Why:** The server loads par from markdown (build-time defaults). Admin overrides live in localStorage (client-side). Merging at consumption time keeps the data flow clean.

```typescript
// src/lib/par-overrides.ts
const STORAGE_KEY = "playground-hb-par-overrides";

export interface ParOverrides {
  [holeNumber: number]: number; // hole number (1-9) -> par value
}

export function loadParOverrides(): ParOverrides {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveParOverrides(overrides: ParOverrides): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
  } catch {
    // localStorage may be full or unavailable
  }
}

export function applyParOverrides(holes: HoleData[]): HoleData[] {
  const overrides = loadParOverrides();
  return holes.map((hole) => ({
    ...hole,
    par: overrides[hole.number] ?? hole.par,
  }));
}
```

### Pattern 2: Client-Side Password Gate
**What:** Admin page checks password input against `NEXT_PUBLIC_ADMIN_PASSWORD` env var before showing the form.
**When to use:** On `/admin` route load.
**Why:** Per project decision, this is a casual discovery barrier, not real auth.

```typescript
// Inside admin page component
const [authenticated, setAuthenticated] = useState(false);
const [passwordInput, setPasswordInput] = useState("");

function handleLogin() {
  if (passwordInput === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
    setAuthenticated(true);
  }
}

if (!authenticated) {
  return <PasswordPrompt />;
}
return <AdminForm />;
```

### Pattern 3: Par Value Consumption in Scoring
**What:** The game page applies par overrides before passing holesData to AppShell.
**When to use:** In the main page component or AppShell.
**Key consideration:** `loadHoles()` runs server-side, but `applyParOverrides()` must run client-side. The merge must happen in a client component (e.g., AppShell) using `useState` + `useEffect`.

```typescript
// In AppShell or a wrapper component
const [mergedHoles, setMergedHoles] = useState(holesData);

useEffect(() => {
  setMergedHoles(applyParOverrides(holesData));
}, [holesData]);
```

### Anti-Patterns to Avoid
- **Do NOT put admin state in the Zustand game store.** Admin config is separate from game state. Game state uses sessionStorage and resets between games. Admin config uses localStorage and persists permanently.
- **Do NOT use server-side middleware for the password check.** The decision is explicitly client-side, and server middleware would add unnecessary complexity for a casual barrier.
- **Do NOT modify the markdown files from the admin page.** That would require a server API. Par overrides in localStorage are the decided approach.
- **Do NOT create an API route for saving par values.** Everything stays client-side per project decisions.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Number input with constraints | Custom keyboard handler | HTML `<input type="number" min={1} max={10}>` + existing Button components | Browser handles validation edge cases |
| Password visibility toggle | Custom eye icon logic | Simple password input, no toggle needed | Admin is venue staff on their own device, minimal UI is fine |

**Key insight:** This is a very simple CRUD form. Resist over-engineering it. Nine number inputs, a save button, and a password prompt is all that is needed.

## Common Pitfalls

### Pitfall 1: Hydration Mismatch on Par Values
**What goes wrong:** Server renders hole data with markdown par values, client merges localStorage overrides, React throws hydration error.
**Why it happens:** Server and client render different HTML on first paint.
**How to avoid:** Apply par overrides in a `useEffect` after mount, not during initial render. Or use a loading guard similar to the existing `hydrated` pattern in game-store.
**Warning signs:** Console warnings about hydration mismatches, par values flickering on page load.

### Pitfall 2: localStorage Unavailable
**What goes wrong:** In private browsing or when storage is full, `localStorage.setItem` throws.
**Why it happens:** Browser storage restrictions.
**How to avoid:** Wrap all localStorage calls in try/catch (same pattern as existing `storage.ts`).
**Warning signs:** Admin saves appear to work but values don't persist.

### Pitfall 3: NEXT_PUBLIC_ Prefix Forgotten
**What goes wrong:** Env var is undefined at runtime because Next.js only exposes `NEXT_PUBLIC_` prefixed vars to client code.
**Why it happens:** Next.js security model -- server env vars are not bundled into client code.
**How to avoid:** Name the env var `NEXT_PUBLIC_ADMIN_PASSWORD`. Document in `.env.example`.
**Warning signs:** Password check always fails because `process.env.ADMIN_PASSWORD` is `undefined`.

### Pitfall 4: Stale Par Overrides After Admin Change
**What goes wrong:** Venue staff updates par in admin, but an already-open game tab still uses old values.
**Why it happens:** The game page read localStorage on mount, cached the result.
**How to avoid:** This is acceptable for v1 -- a page refresh picks up new values. Document as known limitation.
**Warning signs:** Not a bug, just expected behavior.

### Pitfall 5: Admin Route Conflicts with State Machine
**What goes wrong:** Navigating to `/admin` triggers back-button interception or state machine logic.
**Why it happens:** The game's `popstate` handler is in AppShell, which only renders on `/`.
**How to avoid:** `/admin` is a completely separate route with its own page component. No AppShell, no game store interaction. This is naturally isolated by Next.js routing.
**Warning signs:** None expected -- this is already the correct architecture.

## Code Examples

### Admin Page Structure
```typescript
// src/app/admin/page.tsx
"use client";

import { useState, useEffect } from "react";
import { loadParOverrides, saveParOverrides } from "@/lib/par-overrides";

// holesData loaded server-side is NOT available here.
// Admin just needs hole numbers 1-9 and current par overrides from localStorage.
// Default par values can be hardcoded or passed from a server component wrapper.

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [pars, setPars] = useState<number[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load current overrides on mount
    const overrides = loadParOverrides();
    const defaults = [3, 3, 4, 3, 3, 4, 3, 3, 3]; // fallback defaults
    setPars(defaults.map((d, i) => overrides[i + 1] ?? d));
  }, []);

  // ... password gate, form, save handler
}
```

### Merging Par Overrides in Game Flow
```typescript
// In AppShell, after hydration
const [effectiveHoles, setEffectiveHoles] = useState(holesData);

useEffect(() => {
  setEffectiveHoles(applyParOverrides(holesData));
}, [holesData]);

// Pass effectiveHoles to ScoringScreen instead of holesData
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Next.js Pages Router | App Router (used in project) | Next.js 13+ | Admin page uses `app/admin/page.tsx` |
| `getServerSideProps` for env vars | `NEXT_PUBLIC_` prefix for client env | Next.js 13+ | Password must use NEXT_PUBLIC_ prefix |

**Deprecated/outdated:**
- Pages Router (`pages/admin.tsx`) -- project uses App Router, stay consistent

## Open Questions

1. **What should the default admin password be?**
   - What we know: It's set via `NEXT_PUBLIC_ADMIN_PASSWORD` env var
   - What's unclear: What value should be used in development vs production
   - Recommendation: Use a sensible default in `.env.local` (e.g., `playground`), document that production should set a different value. Add `.env.example` with the variable name.

2. **Should admin show current markdown-default par values?**
   - What we know: Admin page can't easily call `loadHoles()` (server-only, uses `fs`)
   - What's unclear: Whether to pass defaults via a server component wrapper or hardcode
   - Recommendation: Use a hybrid approach -- make the admin page a client component that receives default pars from a thin server component wrapper that calls `loadHoles()`. This keeps the source of truth in markdown files.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None currently installed |
| Config file | None |
| Quick run command | N/A |
| Full suite command | N/A |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ADM-01 | Password gate blocks access, form shows after auth | manual-only | Manual: navigate to /admin, enter wrong password, verify blocked; enter correct password, verify form appears | N/A |
| ADM-01 | Par values for all 9 holes are configurable | manual-only | Manual: change par values, verify they save | N/A |
| ADM-02 | Par overrides persist in localStorage | manual-only | Manual: set pars in admin, close tab, reopen admin, verify values retained | N/A |
| ADM-02 | Game scoring uses admin-set par values | manual-only | Manual: set par in admin, start game, verify scoring screen shows updated par | N/A |

**Justification for manual-only:** This phase is a simple form with localStorage. The app has no test framework installed. Adding one for 4 straightforward UI behaviors would be over-engineering. The behaviors are easily verified by manual testing in < 2 minutes.

### Sampling Rate
- **Per task commit:** Manual verification (open /admin, set pars, verify in game)
- **Per wave merge:** Full manual walkthrough of admin + game flow
- **Phase gate:** `npm run build` passes + manual verification

### Wave 0 Gaps
- No test framework needed for this phase (all manual verification)
- Ensure `npm run build` succeeds with the new route

## Sources

### Primary (HIGH confidence)
- Project codebase analysis: `src/lib/holes.ts`, `src/lib/storage.ts`, `src/lib/game-store.ts`, `src/components/scoring-screen.tsx`
- Project decisions in `.planning/STATE.md` and `.planning/ROADMAP.md`

### Secondary (MEDIUM confidence)
- Next.js App Router conventions (env var prefixing, route structure) -- well-established patterns consistent with project's existing Next.js 15.4.5 setup

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - no new dependencies, everything already installed
- Architecture: HIGH - straightforward route + localStorage pattern, matches existing codebase conventions
- Pitfalls: HIGH - hydration mismatch and env var prefix are well-known Next.js gotchas

**Research date:** 2026-03-10
**Valid until:** 2026-04-10 (stable domain, no fast-moving dependencies)

# Pitfalls Research

**Domain:** Mobile-first web scorecard app (mini golf, browser-only state, QR code entry)
**Researched:** 2026-02-24
**Confidence:** MEDIUM — Core pitfalls drawn from official docs and multiple corroborating sources. Some UX pitfalls based on domain reasoning from adjacent research.

---

## Critical Pitfalls

### Pitfall 1: In-Memory State Is Silently Lost on Browser Refresh

**What goes wrong:**
React Context state — the entire game session (players, scores, current hole) — is wiped on any browser refresh, tab duplicate, or navigation to an external URL and back. Players mid-round scan the QR again or accidentally refresh and lose everything with no warning.

**Why it happens:**
React Context exists only in the running JavaScript process. Next.js rehydrates on refresh, but Context providers start empty. Developers prototype with hot reload (which preserves state) and never discover this until testing on a real device mid-session.

**How to avoid:**
On every state change, sync the entire game session to `sessionStorage` (not `localStorage` — session scoped is intentional). On app mount, check `sessionStorage` for an existing session and rehydrate. Use a `useGameSession` hook that wraps Context + sessionStorage writes so components never touch storage directly.

```typescript
// Pattern: write-through to sessionStorage on every update
function useGameSession() {
  const [session, setSession] = useState<GameSession>(() => {
    const stored = sessionStorage.getItem('game-session')
    return stored ? JSON.parse(stored) : null
  })

  const updateSession = (updates: Partial<GameSession>) => {
    const next = { ...session, ...updates }
    setSession(next)
    sessionStorage.setItem('game-session', JSON.stringify(next))
  }
  return { session, updateSession }
}
```

**Warning signs:**
- State not backed by sessionStorage before first milestone is done
- Tests only run in dev with hot reload active
- No "resume game" check on app mount

**Phase to address:** Foundation phase (state architecture) — get this right before building any game flow screens.

---

### Pitfall 2: Browser Back Button Destroys Game State Mid-Round

**What goes wrong:**
A player on hole 4 hits the browser back button. Next.js navigates to the previous URL (e.g., `/`). The hole state is gone. There is no confirmation. The group has to start over.

**Why it happens:**
Multi-step flows implemented as separate routes (e.g., `/hole/1`, `/hole/2`) use real browser history. Mobile browsers surface a hardware back button or swipe-back gesture. Players accidentally invoke it. Next.js handles the navigation before any application code can intercept it.

**How to avoid:**
Do not implement the hole-by-hole flow as separate URL routes. Implement it as a single-page state machine at a fixed URL (e.g., `/play`). The "current hole" is state, not a URL segment. This eliminates accidental back-navigation completely. If URL-based routing is needed for deep links, use `beforeunload` guard with a confirmation prompt — but only while a session is active, never unconditionally (unconditional `beforeunload` degrades browser performance).

**Warning signs:**
- Routes like `/hole/[id]` in the Next.js app directory
- No back-navigation guard designed before milestone ends
- No test of what happens when Android back button is tapped mid-round

**Phase to address:** Game flow architecture phase — lock the routing approach before building scoring screens.

---

### Pitfall 3: AnimatePresence Exit Animations Silently Do Nothing

**What goes wrong:**
Transitions between holes look fine going forward but have no exit animation. Or: the exit animation briefly flickers. Or: layout animations and exit animations conflict — neither works correctly.

**Why it happens:**
Three separate AnimatePresence failure modes exist:

1. **Fragment children**: Wrapping `<AnimatePresence>` children in `<>...</>` breaks exit detection silently.
2. **Missing or unstable keys**: Using array index as key on `motion` children causes React to reuse DOM nodes instead of mounting/unmounting — exit never fires.
3. **layout + AnimatePresence conflict**: Children with the `layout` prop do not reliably trigger exit animations when removed. This is a documented open bug in the Motion library.

**How to avoid:**
- Never wrap AnimatePresence direct children in fragments. Use a single `motion.div` or an array.
- Always assign stable, meaningful keys (e.g., hole number, not array index).
- Do not combine `layout` with `AnimatePresence` exit on the same element. Separate layout-animated containers from exit-animated content.
- Test exit animations explicitly: render the animation, trigger removal, verify the exit variant plays to completion before unmount.

**Warning signs:**
- Exit animations work in isolation but break when combined with layout shifts
- Keys on animated list items use index: `key={i}`
- AnimatePresence wraps a fragment: `<AnimatePresence><>{...}</></AnimatePresence>`

**Phase to address:** Animation implementation phase — establish an AnimatePresence test pattern early so it propagates consistently.

---

### Pitfall 4: iOS Safari Viewport / Keyboard Layout Breaks Score Entry UI

**What goes wrong:**
When the numeric keyboard opens for score entry on iOS Safari, it pushes the UI up or overlaps the input. Elements positioned at the bottom of the screen disappear behind the keyboard. The `100vh` layout breaks because iOS Safari calculates `100vh` using the full viewport height (browser chrome hidden), not the actual visible height.

**Why it happens:**
iOS Safari does not resize the viewport when the virtual keyboard opens (unlike Android Chrome). This causes `position: fixed` and `height: 100vh` elements to compute dimensions against the wrong reference. `100dvh` partially solves the static case but keyboard overlap requires additional handling.

**How to avoid:**
- Use `100dvh` (dynamic viewport height) instead of `100vh` for full-screen layouts.
- Avoid `position: fixed` bottom elements near inputs. Place score inputs in the center/upper portion of the screen where keyboard overlap is less likely.
- Test score entry on a real iPhone in Safari — simulators do not accurately replicate keyboard behavior.
- If bottom CTA buttons are required near inputs, use `env(safe-area-inset-bottom)` and `visualViewport` resize listener.

**Warning signs:**
- Layout uses `h-screen` (Tailwind, maps to `100vh`) as a full-page container
- Score input + confirm button are in a bottom-pinned layout
- Only tested on desktop Chrome or iOS simulator

**Phase to address:** Mobile layout phase — test on real iPhone early, before all animations are layered on top of a broken layout.

---

## Moderate Pitfalls

### Pitfall 5: Framer Motion Bundle Size Inflates Mobile Initial Load

**What goes wrong:**
The default `motion` import from `framer-motion` adds ~32KB gzipped to the bundle. For players on a slow cell connection in a venue with spotty WiFi, a large bundle causes a perceptible loading delay before the app is interactive.

**Why it happens:**
The default `motion` component includes the full feature set (drag, gestures, layout, 3D, scroll, etc.). Most of these are unused in a scorecard app.

**How to avoid:**
Use `LazyMotion` with `domAnimation` (subset) or `domMax` (full) loaded dynamically. Replace `motion.div` with `m.div` inside `LazyMotion`. This reduces the initial animation bundle from ~25KB to ~5KB. Only load extra features (drag, layout) if actually used.

```tsx
import { LazyMotion, domAnimation, m } from 'framer-motion'

// Wrap app once at root:
<LazyMotion features={domAnimation}>
  <m.div animate={{ opacity: 1 }}>...</m.div>
</LazyMotion>
```

**Warning signs:**
- `import { motion } from 'framer-motion'` used without LazyMotion
- Bundle analysis not run before shipping
- Lighthouse score on mobile throttling is below 90

**Phase to address:** Foundation/infrastructure phase — set LazyMotion as the default before any animated components are built.

---

### Pitfall 6: Score Input Fields Have Wrong Mobile Keyboard and Autocorrect Behavior

**What goes wrong:**
Player enters a score, iOS autocapitalizes the first digit or autocorrects the number. The input shows as text keyboard on some Android devices instead of numeric pad. Players have to dismiss suggestions or switch keyboard modes, adding friction at exactly the wrong moment.

**Why it happens:**
Using `<input type="text">` for scores gives iOS autocorrect and autocapitalize. Using `<input type="number">` shows numeric on Android but causes spinner UI on desktop and returns string values requiring manual parsing. `inputMode="numeric"` on a text input is the correct approach but is not default in any UI library.

**How to avoid:**
Use `<input type="text" inputMode="numeric" pattern="[0-9]*" autoCorrect="off" autoCapitalize="none">` for all score fields. shadcn's `Input` component accepts these props. Parse the value as an integer with validation before accepting it as a score. Reject non-numeric characters at input time, not at submit time.

**Warning signs:**
- `type="number"` used for score inputs (desktop spinners, string value gotcha)
- No `inputMode` or `autoCorrect` props on player name or score inputs
- Score parsing happens without explicit `parseInt` or `Number()` conversion

**Phase to address:** Score entry component phase.

---

### Pitfall 7: Hardcoded Content Survives Into Production

**What goes wrong:**
Placeholder hole names, placeholder par values, or example player names get shipped. The venue has to file a bug to change hole content because it's embedded in JSX, not markdown.

**Why it happens:**
During prototyping, it's faster to hardcode "Hole 1: The Windmill" in JSX than wire up the markdown pipeline. The hardcode gets committed, tests pass against it, and it gets shipped.

**How to avoid:**
Never hardcode hole names, par values, hole instructions, or theme colors in component code. On day one of development, create the data contract: a `holes.config.ts` and markdown files directory. All components read from these sources. Treat hardcoded content as a failing test.

**Warning signs:**
- Hole names or instructions appear in JSX strings
- Par values are array literals in component code
- Theme colors use hex values in Tailwind classes rather than CSS variables

**Phase to address:** Foundation phase — establish the config and markdown loading pattern before any hole content is displayed.

---

### Pitfall 8: No Score Validation Allows Impossible Game States

**What goes wrong:**
A player enters a negative score, a letter, or leaves a score blank before advancing. The totals screen shows NaN or a negative total. Rankings are wrong. The celebration animation fires for the wrong winner.

**Why it happens:**
Scorecard apps feel simple so validation is skipped. Score inputs are not validated at entry and the issue surfaces at the totals calculation.

**How to avoid:**
Scores must be positive integers (≥ 1 for mini golf). Validate at input — block advancing to the next hole if any player has an invalid score. Show inline error state on invalid scores, not a submit-time alert. Use a score schema (e.g., with Zod) that enforces `z.number().int().min(1).max(20)`.

**Warning signs:**
- Advancing to next hole does not check all player scores are valid numbers
- Score totals use arithmetic without checking for NaN
- Rankings computed with `Array.sort()` without type safety on the score values

**Phase to address:** Score entry + game flow phase.

---

### Pitfall 9: Admin Page is Publicly Accessible

**What goes wrong:**
`/admin` is deployed to `score.playgroundhp.com/admin` with no authentication. A curious player or competitor can change par values mid-session, breaking everyone's active game.

**Why it happens:**
"No backend for v1" is interpreted as "no auth complexity," so the admin page gets no protection. It's deprioritized until launch and then forgotten.

**How to avoid:**
For v1 (no backend), protect `/admin` with a simple password stored as an environment variable, checked via a middleware or a client-side gate. A hardcoded password in an env var is not secure against determined attackers but prevents accidental access and venue staff stumbling issues. Make this a minimum requirement before any deployment.

**Warning signs:**
- `/admin` route exists without any access check
- Admin route is added as a feature without a "how is this protected?" acceptance criterion

**Phase to address:** Admin feature phase — authentication before the admin UI is built.

---

## Minor Pitfalls

### Pitfall 10: Framer Motion `motion.create()` Called Inside Render

**What goes wrong:**
Using `motion.create(SomeComponent)` inside a component's render body creates a new motion component every render, breaking React's reconciliation. Animations stutter or reset on every re-render.

**Why it happens:**
Developers create custom animated wrappers inline because it feels natural with React component composition patterns.

**How to avoid:**
Always call `motion.create()` at module level, outside the component, so the motion component is stable across renders.

**Warning signs:**
- `const MotionCard = motion.create(Card)` inside a function component body
- Animations reset unexpectedly when parent state changes

**Phase to address:** Any phase building animated components.

---

### Pitfall 11: Layout State Stickiness in Next.js App Router

**What goes wrong:**
When navigating between routes that share a Layout, the Layout does not remount. State inside the Layout persists across navigations unexpectedly. For example, a scoring progress indicator in a Layout remembers the previous game's hole number when a new game starts.

**Why it happens:**
Next.js App Router's Layout caching is a deliberate performance feature. Developers expect Layout to reset like Pages Router did.

**How to avoid:**
Do not store game session state in Layout components. All game state lives in a Context Provider below the Layout. Use `usePathname()` as a reset signal if needed.

**Warning signs:**
- Game state initialized inside a `layout.tsx` component
- Navigation to `/play` from `/` shows stale state from a previous visit

**Phase to address:** Architecture / routing phase.

---

### Pitfall 12: Markdown Rendering Allows XSS if rehype-raw is Added Later

**What goes wrong:**
Initially, hole markdown content is safe static text. A developer later adds `rehype-raw` to support images or HTML in markdown. This silently opens XSS vectors if hole markdown files are ever editable by a web UI.

**Why it happens:**
`react-markdown` is XSS-safe by default — it doesn't render raw HTML. But `rehype-raw` is commonly added "just to support images" and the security implication is missed.

**How to avoid:**
For v1 (static markdown files, no user input), do not add `rehype-raw`. For v2 (admin content editor), if `rehype-raw` is required, also add `rehype-sanitize`. Document this requirement as an architecture decision now so it's not missed later.

**Warning signs:**
- `rehype-raw` added without `rehype-sanitize`
- Markdown rendering change not reviewed for security implications

**Phase to address:** Hole content phase (document the rehype-raw rule), v2 admin content phase (enforce rehype-sanitize).

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| `type="number"` for score inputs | Quick to implement | Desktop spinners, string values cause NaN bugs, no inputMode control | Never — use `type="text" inputMode="numeric"` instead |
| `motion` without LazyMotion | No extra setup | ~25KB extra JS on every mobile load | Never for production — set up LazyMotion from day 1 |
| Hardcoded par values in component | Fast prototype | Par changes require code deploys, admin page is useless | Never — put in config file from day 1 |
| Array index as animation key | Quick to write | Exit animations silently break, list reorder causes wrong transitions | Never — use stable IDs |
| Skip sessionStorage backup | Simpler state | Refresh destroys mid-game session | Only in prototype, never in production |
| No `/admin` auth | Faster to build | Course staff or curious players can change par values | Only in local dev |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Framer Motion + shadcn UI | Animating shadcn Dialog/Sheet without `AnimatePresence` — modal closes instantly | Wrap the conditional render inside `AnimatePresence`, not the trigger |
| Framer Motion + Next.js App Router | Wrapping Server Components in `motion` — causes hydration errors | `motion` components must be in Client Components (`"use client"`) |
| react-markdown + Tailwind | Markdown renders unstyled — no headings, no lists | Add `@tailwindcss/typography` plugin and wrap with `prose` class, or supply custom components to react-markdown |
| sessionStorage + Next.js SSR | Accessing `sessionStorage` during Server Component render throws ReferenceError | Only access browser storage inside `useEffect` or event handlers, never at module scope |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Animating all 9 hole cards simultaneously | Janky scroll, dropped frames on mid-range Android | Stagger children animations, use `useInView` to trigger only visible elements | Any device below ~Snapdragon 720 |
| Layout animations on score list during re-render | Score list jitters on every keystroke | Remove `layout` from elements that update on every character typed | Whenever >3 players are scoring simultaneously |
| Framer Motion without `will-change: transform` | CSS compositor not engaged, animations use main thread | Use `transform`-based animations (x, y, scale) not position-based (top, left) | Any device, degrades on mobile first |
| Unguarded `beforeunload` event listener | Visible browser "Leave site?" on every navigation, including internal Next.js links | Only add `beforeunload` when session is active; remove on game end | From first navigation click |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| `/admin` route with no access control | Anyone can change par values, breaking active games | Password gate via env var (v1) or proper auth (v2) |
| `rehype-raw` without `rehype-sanitize` | XSS if markdown files become user-editable | Never add rehype-raw without rehype-sanitize; document this constraint |
| Storing game state in `localStorage` indefinitely | Old game sessions from months ago rehydrate unexpectedly | Use `sessionStorage` (cleared on tab close) or include a game session timestamp and expire after 4 hours |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No confirmation before resetting / starting new game | Players accidentally wipe a round-in-progress | Require explicit "Start New Game" confirmation if a session already exists in sessionStorage |
| Score entry requires too many taps (tap field, type number, tap next) | Friction compounds across 9 holes x N players | Auto-focus first player input when hole screen loads; auto-advance to next player input after valid digit entered |
| Hole content shown before score entry area | Players read instructions, dismiss, then must scroll to find scores | Score entry is the primary action — show it prominently; make hole instructions collapsible/secondary |
| Player name field gets autocapitalized weirdly | "aLICE" becomes "Alice" but "alicE" stays | `autocapitalize="words"` on name field to get title case; `autocapitalize="none"` for username-style inputs |
| No over/under display during scoring | Players don't know if they're doing well until the end screen | Show per-player running over/under on every hole screen, not just the final results |
| Celebrating the wrong winner due to NaN | Final screen shows wrong ranking | Score validation + NaN guard before computing totals |
| Back button exits game on iOS swipe | Players lose progress on accidental swipe-back | Implement hole flow as in-page state (no URL change), not multi-route navigation |

---

## "Looks Done But Isn't" Checklist

- [ ] **Score entry:** Verify `inputMode="numeric"` is set — test on a real iPhone, not simulator
- [ ] **State persistence:** Verify refresh mid-round restores the session from sessionStorage, not an empty state
- [ ] **Exit animations:** Verify hole-transition exit animation plays to completion before next hole appears — test on throttled mobile
- [ ] **Admin auth:** Verify `/admin` is not accessible without password — check with a fresh incognito session
- [ ] **Par config:** Verify changing par values in admin updates the per-hole display immediately, not after cache clear
- [ ] **Rankings:** Verify the final screen rankings are correct when two players are tied (sort stability)
- [ ] **Over/under:** Verify over/under shows correctly at hole 1 (no previous score yet) and when score equals par exactly
- [ ] **Reduced motion:** Verify the app is usable with `prefers-reduced-motion: reduce` — animations should be skipped, not broken
- [ ] **Markdown rendering:** Verify hole markdown content renders styled (not raw text) with the `prose` class from Tailwind typography
- [ ] **New game:** Verify starting a new game clears all previous session data completely

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| State lost on refresh (no sessionStorage) | HIGH | Retrofit sessionStorage throughout state layer; risk of subtle bugs from partial hydration |
| Wrong routing architecture (multi-route game flow) | HIGH | Refactor entire game flow to single-route state machine; all previous route logic is throwaway |
| LazyMotion not set up, performance complaints | MEDIUM | Wrap app in LazyMotion, replace `motion.*` with `m.*` — mechanical but touches every animated file |
| `/admin` shipped without auth | MEDIUM | Add middleware auth gate; deploy immediately; no data loss but venue trust is impacted |
| Hardcoded par values discovered after launch | MEDIUM | Extract to config file, wire admin to config; requires redeploy |
| AnimatePresence exit bugs | LOW | Debug key stability and fragment usage; localized fix per component |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| In-memory state lost on refresh | Foundation — state architecture | Manually refresh mid-session, verify session restored |
| Back button destroys game | Foundation — routing decision | Test Android hardware back + iOS swipe back on real devices |
| AnimatePresence exit failures | Animation implementation phase | Test each transition with DevTools throttled to slow-3G |
| iOS Safari viewport/keyboard layout | Mobile layout phase (early) | Test on real iPhone with score entry field focused |
| Framer Motion bundle size | Foundation — library setup | Run `next build` and check bundle analyzer output |
| Wrong score input type | Score entry component phase | Test inputMode on real iPhone and Android |
| Hardcoded content | Foundation — data contract | Grep for hardcoded hole names/pars before milestone complete |
| No score validation | Score entry + game flow phase | Enter blank, negative, and non-numeric values in all score fields |
| Admin page publicly accessible | Admin feature phase | Open `/admin` in incognito; it must not load without auth |
| Markdown XSS via rehype-raw | Hole content phase | Code review: reject rehype-raw without rehype-sanitize in PR |
| motion.create() inside render | Any animated component phase | Lint rule or code review check for motion.create inside function bodies |
| Layout state stickiness | Architecture / routing phase | Navigate away and back to `/play`; verify state resets for new game |

---

## Sources

- [Window: sessionStorage property - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage) — HIGH confidence
- [AnimatePresence — React exit animations - Motion docs](https://motion.dev/docs/react-animate-presence) — HIGH confidence
- [Motion: Reduce bundle size - motion.dev](https://motion.dev/docs/react-reduce-bundle-size) — HIGH confidence (referenced via search, could not fetch page directly)
- [Why Framer Motion Exit Animations Fail - Medium/JS Decoded](https://medium.com/javascript-decoded-in-plain-english/understanding-animatepresence-in-framer-motion-attributes-usage-and-a-common-bug-914538b9f1d3) — MEDIUM confidence
- [AnimatePresence not working with layout animations - GitHub Issue #1983](https://github.com/framer/motion/issues/1983) — HIGH confidence (first-party issue tracker)
- [Common mistakes with the Next.js App Router - Vercel](https://vercel.com/blog/common-mistakes-with-the-next-js-app-router-and-how-to-fix-them) — HIGH confidence
- [Next.js App Router Gotchas - tevpro.com](https://tevpro.com/next-js-gotchas/) — MEDIUM confidence
- [100vh problem with iOS Safari - DEV Community](https://dev.to/maciejtrzcinski/100vh-problem-with-ios-safari-3ge9) — MEDIUM confidence (multiple corroborating sources)
- [Control the Viewport Resize Behavior - HTMHell](https://www.htmhell.dev/adventcalendar/2024/4/) — MEDIUM confidence
- [React Markdown Complete Guide 2025: Security & Styling Tips - Strapi](https://strapi.io/blog/react-markdown-complete-guide-security-styling) — MEDIUM confidence
- [React Context state loss on refresh - Next.js Discussion #54821](https://github.com/vercel/next.js/discussions/54821) — HIGH confidence (first-party issue tracker)
- [Framer Motion vs Motion One: Mobile Animation Performance - reactlibraries.com](https://reactlibraries.com/blog/framer-motion-vs-motion-one-mobile-animation-performance-in-2025) — LOW confidence (single source, verify bundle numbers)
- [Turn off HTML Input Auto Fixups for Mobile Devices - Rick Strahl](https://weblog.west-wind.com/posts/2015/jun/15/turn-off-html-input-auto-fixups-for-mobile-devices) — MEDIUM confidence (older article, behavior confirmed stable)
- [QR Code Usability Guidelines - NN/G](https://www.nngroup.com/articles/qr-code-guidelines/) — HIGH confidence

---
*Pitfalls research for: Mobile-first mini golf scoring web app (Unicolf Score)*
*Researched: 2026-02-24*

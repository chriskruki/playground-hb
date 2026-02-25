# Feature Research

**Domain:** Mini golf scoring web app (venue-specific, QR-code entry, no backend)
**Researched:** 2026-02-24
**Confidence:** MEDIUM — competitive landscape well-documented, venue-specific nuances inferred from project context

## Feature Landscape

### Table Stakes (Users Expect These)

Features players assume exist. Missing these = product feels broken or incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| QR code → instant play (no download, no signup) | Industry standard. PlayThru, PuttScores all advertise "no download required" as headline. 73% of players abandon when asked to download an app. | LOW | Already the model — QR at front desk, opens web app |
| Add player names before starting | Every mini golf app starts this way. Players expect to name their group immediately. | LOW | No limit per PROJECT.md. Input validation needed (empty names, duplicates) |
| Hole-by-hole score entry | Core mechanic. All competitors implement this. Players expect to enter per-hole, not all at once at the end. | MEDIUM | One hole at a time; all players score same hole together before advancing |
| Par value displayed per hole | Players need context — knowing "this hole is par 3" is part of the game. All surveyed apps show par. | LOW | Par config stored separately from hole content (admin-configurable) |
| Running total visible per player | Players constantly compare scores. Hiding totals until the end creates confusion. | LOW | Show cumulative strokes, not just current hole |
| Over/under par display | Golfers think in +/- not raw strokes. Every golf scoring app shows this. Missing it makes scoring feel amateurish. | LOW | Green = under, red = over, neutral = even. Conventional colors. |
| Final rankings screen | Players want to know who won. This is the social payoff. Every app has it. | MEDIUM | Sorted by total strokes (lowest wins). Needs clear winner callout. |
| Mobile-first touch targets | Players are walking, one-handed, outdoors (or indoors with distractions). Tiny buttons = frustration. | LOW | 44px minimum tap targets, large score entry buttons |
| Hole progress indicator | Players need to know "we're on hole 4 of 9." Absence creates disorientation. | LOW | Simple "Hole 4 / 9" display or dot indicator |

### Differentiators (Competitive Advantage)

Features that set this product apart. Not required, but valuable. This is where the brand experience lives.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Per-hole illustrated content (name, theme, instructions) | Physical instruction posters ignored by players. In-app content solves this elegantly. No competitor does venue-specific hole storytelling. | MEDIUM | Markdown files per hole — name, illustration reference, instructions. Renders before or alongside scoring. |
| Animated winner celebration | The payoff moment. Framer Motion confetti/animation makes the end screen memorable and shareable. Competitors have static score screens. | MEDIUM | Use Framer Motion. Winning player highlighted with animation. |
| Polished branded experience | Most mini golf apps look generic. Theming system (colors, logo) makes this feel like Playground HP's product, not a third-party tool. | LOW | Theme config file. No hardcoded colors. Logo.svg swappable. |
| Smooth hole-to-hole transitions | Framer Motion transitions between holes reduce cognitive jarring. Feels like a game, not a form. | LOW | Page transition animations. Score entry animations (number counts up). |
| Smooth score entry UX (increment/decrement) | One-tap score adjustment rather than raw number input. Industry-confirmed best practice. | LOW | +/- buttons. Default to par value when first entering a hole. Large touch targets. |
| Admin par configuration without code change | Venue staff can update par values without a developer. Competitors either hardcode or require developer access. | LOW | /admin page. Writes to config. No backend needed — localStorage or JSON file. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create scope creep or UX problems for v1.

| Anti-Feature | Why Requested | Why Problematic | Alternative |
|--------------|---------------|-----------------|-------------|
| User accounts / login | "Save my scores for next time" | Adds auth complexity, creates friction at game start (antithetical to QR→play model), backend dependency | Defer to v2. Session state in browser is sufficient for v1. |
| Score history / game persistence | "I want to see past scores" | Requires backend or complex localStorage management. State loss on tab close is acceptable for v1 — games are short. | Show final screen clearly. Share-screen or screenshot is sufficient for v1. |
| Social sharing (share score to Instagram/X) | "Show my friends" | Web Share API is easy but creates expectation of persistent score URL (requires backend). Static share is misleading. | Celebrate in-app. Defer social to v2 when leaderboard/gallery exists. |
| Real-time multiplayer sync | "All our phones update at once" | Single-group QR flow doesn't need this. Over-engineering for a one-device-per-group flow. | One person enters scores for the group. Clear enough for mini golf context. |
| Leaderboard across groups / daily leaderboard | "See how we rank vs other players today" | Requires backend. PuttScores and PlayThru offer this as SaaS. Not v1 scope. | Defer to v2 with backend. Plan data model for it, don't build it. |
| GPS / map of course | "Navigate the course" | Physical venue — players can see the course. Adds complexity with zero benefit. | Hole illustrations (from content markdown) serve orientation needs. |
| Undo / edit previous hole score | "I entered the wrong score" | Expected by power users but complex to implement correctly with animations and state. | Provide back navigation to previous hole. Simple enough without separate undo UX. |
| Email capture / marketing opt-in | Revenue tool used by PlayThru, PuttScores | Creates friction, privacy concerns, not appropriate for v1 player-facing app | Venue handles this separately via their booking system |

## Feature Dependencies

```
[Player Setup]
    └──requires──> [Game State Model] (player list + hole count)
                       └──requires──> [Hole Config] (par values per hole)

[Hole-by-Hole Scoring]
    └──requires──> [Player Setup]
    └──requires──> [Game State Model]
    └──enhances──> [Hole Content Display] (instructions shown alongside scoring)

[Over/Under Par Display]
    └──requires──> [Par Values per Hole]
    └──requires──> [Score Entry]

[Final Rankings Screen]
    └──requires──> [Hole-by-Hole Scoring] (all 9 holes complete)
    └──requires──> [Running Total Calculation]

[Admin Par Config]
    └──enhances──> [Hole-by-Hole Scoring] (changes what par is displayed)
    └──independent of──> [Hole Content Display]

[Hole Content Display]
    └──requires──> [Markdown files per hole] (content source)
    └──independent of──> [Score Entry] (can render alongside or before)

[Animations / Transitions]
    └──enhances──> [Hole-by-Hole Scoring]
    └──enhances──> [Final Rankings Screen]
    └──no hard dependency on any feature]
```

### Dependency Notes

- **Game State Model must exist first:** Player list, current hole, and scores-per-player-per-hole must be modeled before any UI can be built. This is the foundation.
- **Hole Config (par values) feeds scoring:** Par must be loaded before the first hole is rendered. Admin page writes to the same config scoring reads.
- **Hole content is independent from scoring logic:** Markdown rendering and score entry can be built separately and composed on the hole screen. Don't couple them.
- **Animations are pure enhancement:** Framer Motion wraps existing components. Build logic first, animate second. Animations never gate functionality.
- **Admin page is independent:** Can be built last. Uses the same par config that scoring reads. No player-facing dependency.

## MVP Definition

### Launch With (v1)

Minimum viable product — covers all table stakes and the key differentiators that define the brand.

- [ ] Landing page with logo and "Start Game" CTA — first impression, sets tone
- [ ] Player setup screen (add names, no limit) — prerequisite for everything
- [ ] Hole-by-hole scoring (9 holes, one at a time, all players per hole) — core mechanic
- [ ] Par display per hole + over/under per player — table stakes for golf context
- [ ] Running total per player visible during play — players expect it
- [ ] Hole content display (name, illustration placeholder, instructions from markdown) — key differentiator vs generic apps
- [ ] Final rankings screen with winner callout and animations — social payoff moment
- [ ] Smooth Framer Motion transitions throughout — brand differentiator
- [ ] Admin page for par configuration — operational necessity for venue staff
- [ ] Theming system (colors, logo) — makes it feel like Playground HP's product
- [ ] Mobile-first responsive (rough desktop support acceptable)

### Add After Validation (v1.x)

Features to add once core game loop is proven working with real players.

- [ ] Back navigation to fix previous hole score — players will accidentally enter wrong scores; current flow forces forward-only
- [ ] Hole-in-one celebration (distinct animation for score of 1) — low effort delight moment
- [ ] Swipe gesture navigation between holes — natural mobile pattern once core works

### Future Consideration (v2+)

Defer until product-market fit established and backend available.

- [ ] Persistent leaderboard (requires backend) — validates if players want competition across groups
- [ ] User accounts and score history — validates if repeat customers want continuity
- [ ] Group photo capture at end of game — social/gallery feature per PROJECT.md
- [ ] Admin content editor (edit hole markdown in UI) — currently edit markdown files directly
- [ ] Admin leaderboard moderation — gates v2 gallery feature

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| QR → instant play (no friction) | HIGH | LOW (architectural choice, not a feature to build) | P1 |
| Player setup screen | HIGH | LOW | P1 |
| Hole-by-hole scoring (9 holes) | HIGH | MEDIUM | P1 |
| Par display + over/under | HIGH | LOW | P1 |
| Running total | HIGH | LOW | P1 |
| Final rankings + winner | HIGH | MEDIUM | P1 |
| Hole content (markdown, illustrations) | HIGH | MEDIUM | P1 |
| Framer Motion transitions | MEDIUM | LOW | P1 (brand requirement) |
| Theming system | MEDIUM | LOW | P1 (operational requirement) |
| Admin par config page | MEDIUM | LOW | P1 (operational requirement) |
| Winner celebration animation | MEDIUM | LOW | P1 |
| Back navigation / score correction | MEDIUM | MEDIUM | P2 |
| Hole-in-one special animation | LOW | LOW | P2 |
| Swipe navigation | LOW | LOW | P2 |
| Social sharing | LOW | HIGH | P3 |
| Score history | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | PlayThru Mini | PuttScores | MiniGolfScoreCard | Our Approach |
|---------|---------------|------------|-------------------|--------------|
| No download / browser-based | Yes (QR) | Yes (QR) | No (native app) | Yes — web app via QR |
| No account required | Yes | Yes | No | Yes — zero friction |
| Custom branding | Yes (venue logo) | Yes (venue logo) | Yes (custom app) | Yes — theme config + logo.svg |
| Per-hole content / instructions | No | No | No | Yes — key differentiator |
| Par tracking + over/under | Yes | Yes | Yes | Yes |
| Live leaderboard | Yes (real-time) | Yes (real-time, TV) | Yes | Final screen only (no backend for v1) |
| Winner celebration / animation | Basic | Basic | Basic | Polished — Framer Motion |
| Admin par config | Yes (dashboard) | Yes (dashboard) | Yes (per setup) | Yes — /admin page |
| Score history | Yes (backend) | Yes (backend) | Yes (device) | No (no backend for v1) |
| Food & beverage ordering | No | Yes | No | No (out of scope) |
| Email capture | Yes | Yes | No | No (anti-feature for v1) |

## Sources

- [PlayThru Mini — mini golf scoring platform](https://www.playthrumini.com/) — MEDIUM confidence (current product, live site)
- [PuttScores — #1 Digital Scorecard System for Mini Golf](https://puttscores.com/) — MEDIUM confidence (current product, live site)
- [Why Mini Golf Courses Should Use Online Scoring — GolfPlayThru blog](https://www.golfplaythru.com/blog/why-mini-golf-courses-should-use-online-scoring) — MEDIUM confidence
- [Mini Golf App UK — venue app platform](https://www.minigolfapp.co.uk/) — MEDIUM confidence
- [MiniGolfScoreCard — custom native app](https://yourminigolfscorecard.com/) — MEDIUM confidence
- [Mini Golf Scorecard — Google Play](https://play.google.com/store/apps/details?id=com.vanniktech.minigolf&hl=en_US) — LOW confidence (app store listing only)
- [Golf & Mini-Golf Scorecard App — App Store](https://apps.apple.com/us/app/golf-mini-golf-scorecard/id1484755764) — LOW confidence (app store listing only)
- [doodleblue golf app UI/UX case study](https://www.doodleblue.com/success-stories/golf/) — LOW confidence (single agency case study)

---
*Feature research for: Mini golf scoring web app (Unicolf Score / Playground HP)*
*Researched: 2026-02-24*

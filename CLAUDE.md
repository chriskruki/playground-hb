# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repo layout

Not a monorepo — independent folders with no root `package.json`. Run every command from inside the project folder.

- **`score/`** — the live product: mini golf scorecard at score.playgroundhb.com (Next.js 15, React 19, Tailwind v4, zustand). **Read `score/CLAUDE.md` before touching it**; it holds the architecture, invariants and commands.
- **`shopify-min/`** — static `golf-game.html` plus `html-to-liquid.js` (`node html-to-liquid.js`) that converts it into `golf-game.liquid`, a Shopify section. See `shopify-min/README-LIQUID-CONVERSION.md`. `server.js` and the README still reference a nonexistent `mini-golf-minimal.html`.

## Commands (score/)

```bash
cd score
npm run dev                                   # Turbopack dev server
npm run build                                 # typecheck + lint gate
npm run test:e2e                              # Playwright, auto-starts dev on :3001
npx playwright test -g "<test name>"          # single test
npx playwright test --project=mobile          # one device project (chromium | mobile)
```

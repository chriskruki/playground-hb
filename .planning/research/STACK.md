# Stack Research

**Domain:** Mobile-first web app / mini golf scoring PWA
**Researched:** 2026-02-24
**Confidence:** HIGH (core stack), MEDIUM (supporting libraries)

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 16.x (latest) | React framework with routing and SSG | App Router is now stable with Next.js 16; Turbopack is the default bundler; React 19.2 included. New projects should use `npx create-next-app@latest` which bootstraps v16. |
| React | 19.2 (bundled with Next.js 16) | UI rendering | Bundled with Next.js 16; includes View Transitions, `useEffectEvent`, and `<Activity />`. No separate React install needed for v16. |
| TypeScript | 5.x (min 5.1) | Type safety | Required by Next.js 16 (min v5.1). `create-next-app` enables it by default. |
| TailwindCSS | 4.2 | Utility-first CSS | Official Next.js integration guide is for v4.2. Uses `@import "tailwindcss"` in globals.css — no tailwind.config.js needed; auto-scans project. Theming via CSS variables in globals.css (no hardcoded colors). |
| shadcn/ui | latest (CLI-managed) | Accessible component library | Not a dependency — components are copied into `src/components/ui/`. Full ownership, Tailwind v4 supported, React 19 supported. npm users need `--legacy-peer-deps` flag during init. |
| Framer Motion / Motion | 12.34.x | Animation library | Rebranded from `framer-motion` to `motion`. Install package `motion`, import from `motion/react` (not `framer-motion`). Fully compatible with React 19. Required for the animated scoring UX. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Zustand | 5.0.x | Global game state (client-only) | Game state must span pages (players, scores, current hole) without a backend. Zustand is lightweight, App Router compatible, and supports `sessionStorage` persist middleware — state survives page refresh but not tab close. |
| gray-matter | 4.x | Parse YAML frontmatter from markdown files | Use to read hole metadata (name, par, illustration ref) from `.md` files at build time in Server Components. |
| remark / remark-html | latest | Parse and render markdown body content | Use to convert hole instruction markdown bodies to HTML in Server Components. Lighter than full MDX for simple instructional text. |
| clsx + tailwind-merge | latest | Conditional class merging | Already included via shadcn/ui's `cn()` utility. No separate install. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Turbopack | Default bundler (Next.js 16) | No configuration needed; replaces Webpack as default. Opt out with `--webpack` flag if needed. |
| ESLint (flat config) | Linting | `create-next-app` generates `eslint.config.mjs`. Run via `npm run lint`, not `next lint` (deprecated in v15.5, removed in v16). |
| TypeScript strict mode | Type checking | Enable `strict: true` in tsconfig. Use `next typegen` to generate route types without running dev server. |
| `typedRoutes: true` | Compile-time route safety | Now stable in Next.js 16. Catches broken `<Link href>` values at compile time. Add to `next.config.ts`. |

## Installation

```bash
# 1. Bootstrap project (includes Next.js 16, React 19, TypeScript, Tailwind v4, ESLint, App Router)
npx create-next-app@latest unicolf-score --typescript --eslint --app

cd unicolf-score

# 2. Install Tailwind PostCSS plugin (if not added by create-next-app)
npm install tailwindcss @tailwindcss/postcss postcss

# 3. Install Motion (animation)
npm install motion

# 4. Initialize shadcn/ui (npm requires --legacy-peer-deps flag)
npx shadcn@latest init --legacy-peer-deps

# 5. Add shadcn components as needed
npx shadcn@latest add button input card badge --legacy-peer-deps

# 6. Install Zustand (game state)
npm install zustand

# 7. Install markdown processing
npm install gray-matter remark remark-html

# Dev dependencies
npm install -D @types/node
```

**globals.css** — Import Tailwind v4 style:
```css
@import "tailwindcss";

/* Theme variables (no hardcoded colors — change here only) */
:root {
  --color-primary: #...;
  --color-secondary: #...;
  --color-accent: #...;
}
```

**next.config.ts** — Enable typed routes:
```ts
const nextConfig = {
  typedRoutes: true,
};
export default nextConfig;
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Next.js 16 | Next.js 15.x | If you have an existing v15 codebase and lack migration bandwidth. New projects should use v16. |
| TailwindCSS v4 | TailwindCSS v3 | If you need an existing `tailwind.config.js` plugin ecosystem. v4 removes the config file and many old plugins. |
| `motion` (Motion library) | `framer-motion` | Use `framer-motion` only if pinned to an older project. For new React 19 projects, use `motion` with `motion/react` imports. |
| Zustand with sessionStorage | React Context + useState | Context is fine for very simple single-page state but cannot span Next.js navigation (page transitions lose state). Zustand persists game state across hole-to-hole navigation without a backend. |
| `gray-matter` + `remark` | `@next/mdx` | Use `@next/mdx` when hole content needs embedded React components in markdown (MDX). For this app, plain markdown with frontmatter is sufficient and simpler — no MDX needed. |
| `gray-matter` + `remark` | `next-mdx-remote` | next-mdx-remote is not well maintained as of 2025. Avoid. |
| Zustand | Redux Toolkit | Redux is overkill for a client-only, browser-session-scoped game. No need for the ecosystem overhead. |
| shadcn/ui | Mantine / Chakra UI | shadcn gives full component ownership and deep Tailwind integration. Runtime CSS-in-JS libs add bundle overhead not needed here. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `framer-motion` package (old import) | Rebranded. Importing from `framer-motion` still works but `motion/react` is the current canonical path for React 19. Using old import causes peer dep warnings. | `import { motion } from "motion/react"` from `motion` package |
| `next-mdx-remote` | Poorly maintained as of 2025, no active support for App Router. | `gray-matter` + `remark` for plain markdown; `@next/mdx` if MDX needed |
| `localStorage` for game state | Survives tab close — means a player reopening their browser sees stale partial game data. Confusing UX. | `sessionStorage` via Zustand `persist` middleware — dies with the tab |
| Redux / Redux Toolkit | Massive overhead for a single-session, no-backend game state problem. | Zustand |
| Server Actions for state mutations | State is intentionally browser-only in v1. Server Actions add server round-trips where none are needed. | Zustand store mutations (pure client) |
| Global CSS overrides in component files | Breaks Tailwind v4's CSS variable system. | Theme via CSS variables in `globals.css` only |
| `next lint` CLI command | Removed in Next.js 16. | `eslint` directly via `package.json` scripts |
| `middleware.ts` | Deprecated in Next.js 16. Renamed to `proxy.ts`. | `proxy.ts` (but likely not needed for this app at all) |

## Stack Patterns by Variant

**If hole content needs embedded React components (e.g., interactive diagrams):**
- Use `@next/mdx` instead of `gray-matter` + `remark`
- Convert `.md` files to `.mdx` files
- Because `@next/mdx` compiles MDX to RSC-compatible components with no client JS shipped

**If v2 adds a backend:**
- Add Prisma (ORM) + Postgres (hosted on Neon or Supabase)
- Zustand store gains a persistence layer, sessionStorage persist middleware can be swapped for DB calls
- shadcn form components already exist in the library for login/registration flows

**If Vercel hosting is used (likely for score.playgroundhp.com):**
- No special configuration needed — Next.js 16 + Turbopack is Vercel-native
- Image optimization works out of the box via `next/image`

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| Next.js 16.x | React 19.2, TypeScript 5.1+, Node.js 20.9+ | Node.js 18 no longer supported in v16 |
| TailwindCSS 4.2 | Next.js 16, PostCSS | Uses `@tailwindcss/postcss` plugin, not `tailwindcss/nesting` |
| shadcn/ui (latest) | React 19, Tailwind v4, Next.js 16 | npm install requires `--legacy-peer-deps` flag |
| motion 12.34.x | React 19 | Import from `motion/react`, not `framer-motion` |
| Zustand 5.0.x | React 19, Next.js App Router | Server Components cannot use Zustand (correct — game state is client-only) |
| gray-matter 4.x | Node.js 20, Next.js Server Components | Used at build/request time in RSCs, never shipped to client |

## Sources

- [Next.js 16 Official Blog Post](https://nextjs.org/blog/next-16) — Verified: Turbopack stable, React 19.2, breaking changes — HIGH confidence
- [Next.js 16 Installation Docs](https://nextjs.org/docs/app/getting-started/installation) — Verified: `create-next-app@latest` bootstraps v16, TypeScript and Tailwind enabled by default — HIGH confidence
- [Next.js 15.5 Blog Post](https://nextjs.org/blog/next-15-5) — Verified: `typedRoutes` now stable, `next lint` deprecated — HIGH confidence
- [shadcn/ui React 19 Compatibility](https://ui.shadcn.com/docs/react-19) — Verified: React 19 supported, npm users need `--legacy-peer-deps` — HIGH confidence
- [shadcn/ui Next.js Installation](https://ui.shadcn.com/docs/installation/next) — Verified: CLI-first, `npx shadcn@latest init` — HIGH confidence
- [Tailwind CSS v4.2 Next.js Guide](https://tailwindcss.com/docs/guides/nextjs) — Verified: `@tailwindcss/postcss`, single `@import "tailwindcss"`, no config file — HIGH confidence
- [motion.dev (Motion library)](https://motion.dev) — Confirmed: `motion` package, import from `motion/react`, v12.34.x — MEDIUM confidence (page rendered mostly CSS, content partially inferred from WebSearch)
- [WebSearch: Framer Motion v12 Next.js 15](https://github.com/vercel/next.js/discussions/72228) — Confirmed: `motion/react` import path resolves React 19 compatibility — MEDIUM confidence
- [Zustand npm (v5.0.x)](https://zustand.docs.pmnd.rs/) — Confirmed: v5.0.11, sessionStorage persist middleware — MEDIUM confidence (403 on npm page; version from WebSearch result)
- [Zustand Setup with Next.js](https://zustand.docs.pmnd.rs/guides/nextjs) — Verified: store per request pattern for App Router, client-only — MEDIUM confidence
- [Next.js MDX Guide](https://nextjs.org/docs/app/guides/mdx) — Verified: `@next/mdx` recommended for local files, ships no client JS — HIGH confidence
- [WebSearch: react-markdown vs @next/mdx 2025](https://staticmania.com/blog/markdown-and-mdx-in-next.js-a-powerful-combination-for-content-management) — `@next/mdx` preferred; `next-mdx-remote` not well maintained in 2025 — MEDIUM confidence

---
*Stack research for: Unicolf Score — mini golf scoring web app*
*Researched: 2026-02-24*

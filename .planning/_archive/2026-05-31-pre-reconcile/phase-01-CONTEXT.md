# Phase 01 — CONTEXT: Foundation Setup

## What this phase produces

A working Astro 5 + Tailwind v4 site that builds locally, deploys to GitHub Pages via GitHub Actions on every push to `main`, and resolves on `https://boozeonhormuz.com` with placeholder content.

## Why this phase exists

Without a working build pipeline, every content addition becomes a one-off manual deploy. This phase establishes the **commit-and-forget** loop so all subsequent phases (and all future content drops) become single-commit operations.

## Inputs to this phase

- Existing repo `UsernameTron/boozeonhormuz.com` (empty except for `CNAME`)
- Existing DNS configuration (4 A records + www CNAME)
- Content concept brief — referenced for content collection schema design only, no copy in this phase
- Node 22+ installed locally
- Claude Code with filesystem + GitHub MCP access

## Outputs of this phase

- `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/content.config.ts`
- `src/layouts/BaseLayout.astro` — base layout with nav placeholder + meta tag scaffold
- `src/pages/index.astro` — single placeholder homepage
- `src/styles/global.css` — Tailwind v4 entrypoint with design-token `@theme` block
- `public/CNAME` — custom domain marker
- `.github/workflows/deploy.yml` — Astro deploy action
- First successful Pages deploy on the custom domain

## What this phase does NOT do

- Write actual page content (deferred to Checkpoint A → phase-02)
- Set final brand colors, typography, imagery (placeholder tokens only)
- Enable HTTPS enforcement, analytics, OG tags (deferred to phase-03)
- Add real episodes, products, quotes, or sponsors to content collections

## Decisions locked

- **Framework:** Astro 5.x
- **Styling:** Tailwind CSS v4 via `@tailwindcss/vite` (NOT the deprecated `@astrojs/tailwind` integration)
- **Content layer:** Astro content collections, schemas typed via Zod
- **Deploy:** `withastro/action@v3` in GitHub Actions
- **Branch model:** Single `main` branch with branch protection (added phase-03)
- **Package manager:** `npm` (no need for pnpm/yarn at this scale)

## Open assumptions

- Connor will run Phase 01 in a single ~75-minute session
- DNS propagation completes before the final verify step (Step 6); if not, deploy succeeds but `https://boozeonhormuz.com` lags by minutes-to-hours
- Astro 5.2+ is the installed version when `npm create astro@latest` runs (current as of 2026-05-30)

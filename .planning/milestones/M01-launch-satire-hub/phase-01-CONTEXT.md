# Phase 01 — CONTEXT: Foundation Setup

## What this phase produces

A working Astro 6 + Tailwind 4 site that builds locally, deploys to **GitHub Pages** via GitHub Actions on every push to `main`, and resolves on `https://boozeonhormuz.com` with a single placeholder homepage. Content-free. The pipe is the product.

## Why this phase exists

Without a working build-and-deploy loop, every future content drop is a manual one-off. This phase establishes the **commit-and-forget** loop so all subsequent content additions become a single `git push`. Every minute spent on infra now is a minute not spent on jokes later.

## Inputs

- Existing repo `UsernameTron/boozeonhormuz.com` (effectively empty except `CNAME`)
- Existing DNS (4 A records → GitHub IPs, `www` CNAME) — owner-confirmed live
- The 5-collection content model from `RESOLUTION.md` §2 (schema design only — no copy)
- Node 22+ locally; Claude Code with filesystem + GitHub MCP / `gh` CLI
- The build skill suite in `booze on hormuz/` — used as the execution method

## Outputs

- `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/content.config.ts`
- `src/layouts/BaseLayout.astro` — base layout with nav placeholder, meta scaffold, **global parody disclaimer in footer**
- `src/pages/index.astro` — single placeholder homepage
- `src/styles/global.css` — Tailwind 4 entrypoint + placeholder `@theme` token block
- Self-hosted Fraunces + Inter variable fonts wired via Fontsource
- `public/CNAME` — custom-domain marker (recreated; never lost)
- `.github/workflows/deploy.yml` — `withastro/action@v6`
- First successful Pages deploy on the custom domain over HTTPS-capable URL

## What this phase does NOT do

- Write real page content (Checkpoint A → phase-02)
- Set final brand tokens (Checkpoint B → gates phase-02; placeholder tokens only here)
- Build out routes/components (phase-02)
- Enable HTTPS enforcement, analytics, OG tags, sitemap, branch protection (phase-03)
- Add real episodes/products/quotes/sponsors/evidence

## Decisions locked

- **Framework:** Astro **6.4.2** static (`output: 'static'`, no adapter)
- **Styling:** Tailwind **4.3.0** via `@tailwindcss/vite` — NOT the deprecated `@astrojs/tailwind`
- **Content layer:** Astro content collections, Zod-typed, 5 collections (one polymorphic `evidence` discriminated union; `quotes` as YAML data)
- **Deploy:** `withastro/action@v6` to GitHub Pages, source = "GitHub Actions"
- **Package manager:** `npm`, exact pins, committed lockfile, `npm ci` in CI

## Open assumptions (flag if false)

- Node 22+ and `gh` (authed as UsernameTron, `repo` scope) are present on the execution machine
- DNS has propagated; if not, deploy still succeeds and the custom domain lags by minutes-to-hours — verify with `dig`
- `npm create astro@latest` resolves to the 6.x line at execution (6.4.2 as of 2026-05-31); the scaffold skill verifies current versions before pinning

## Legal pre-flight (Phase 0, parallel, non-blocking for scaffold)

Because Don Biggly is an explicit Trump persona, this is a real gate before *content* publishes (not before the content-free scaffold): USPTO/TESS sweep on "Booze on Hormuz", right-of-publicity sanity check, DMCA designated-agent + counter-notice posture, parody disclaimer text confirmed and rendered globally. Update `brand-pack.md` + `parody-safety-check` to the "is Trump" posture.

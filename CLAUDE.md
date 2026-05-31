# CLAUDE.md — boozeonhormuz.com

Project governance for the Booze on Hormuz satire hub. Read before making changes.

## What this is

A static Astro 6 site, deployed to GitHub Pages on the apex domain `boozeonhormuz.com`. Surface: satirical luxury brand. Underneath: the content archive for the *Who the Hell Is Don Biggly?* sketch series. **Currently content-free** — phase-01 built the deploy pipe only.

## Architecture

```
src/content.config.ts   5 Zod-typed collections (episodes, products, sponsors,
                         evidence [polymorphic], quotes [YAML data])
src/layouts/BaseLayout   global shell + parody disclaimer footer (never per-page)
src/pages/index.astro    placeholder homepage (no real copy)
src/styles/global.css    Tailwind 4 entry + placeholder @theme tokens (final = Checkpoint B)
public/CNAME             apex-domain marker — MUST ship in dist/
.github/workflows/        push to main → withastro/action@v6 → GitHub Pages
.nvmrc                    24 (matches CI runtime)
```

Push to `main` builds and deploys. Every future content drop is one `git push`.

## Stack (exact-pinned)

| Dep | Version | Note |
|---|---|---|
| astro | 6.4.2 | static output, no adapter; runs Vite 7.3.3 |
| tailwindcss / @tailwindcss/vite | 4.2.0 | **NOT 4.3.0** — 4.3 hard-deps Vite 8, incompatible with Astro's Vite 7 |
| @fontsource-variable/fraunces | 5.2.9 | display face |
| @fontsource-variable/inter | 5.2.8 | body face |
| @astrojs/check / typescript | 0.9.9 / 6.0.3 | dev — typecheck |

**Do not bump `@tailwindcss/vite` to 4.3.x** until Astro ships a Vite 8 line. It will break the build (`Missing field tsconfigPaths`).

## Commands

```bash
npm run dev       # localhost:4321
npm run build     # static build → dist/
npm run preview   # serve dist/
npx astro check   # typecheck (must exit 0 before commit)
```

## Conventions

- **Content-free until finished** (owner directive). No real episodes/products/quotes/sponsors/evidence.
- **Parody disclaimer** renders globally from `BaseLayout`, never per-page.
- New evidence artifact type = a new branch in the `evidence` discriminated union, not a new collection.
- Exact-pin every dependency; commit the lockfile; CI uses `npm ci`.
- `public/CNAME` is the source of truth for the custom domain.
- Branch for every change (`feat/`, `fix/`, `chore/`); never commit directly to `main`.

## Phase status

- **phase-01 Foundation** — DONE (this build). Content-free site + deploy pipe live.
- **Checkpoint B (brand tokens)** — owner-owned; gates phase-02. Placeholder tokens in `global.css` until then.
- **Checkpoint A (content concept)** — owner-owned; gates phase-02 content.
- **phase-02 Page Shells / phase-03 Production Polish** — not started. HTTPS enforcement, OG/sitemap/robots/analytics, branch protection, legal pre-flight live in later phases.

Planning lives in `.planning/`. Stack rationale in `.planning/RESOLUTION.md` and `RUNBOOK.md`.

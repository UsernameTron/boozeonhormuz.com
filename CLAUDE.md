# CLAUDE.md — boozeonhormuz.com

Project governance for the Booze on Hormuz satire hub. Read before making changes.

## What this is

A static Astro 6 site, deployed to GitHub Pages on the apex domain `boozeonhormuz.com`. Surface: satirical luxury brand. Underneath: the content archive for the *Who the Hell Is Don Biggly?* sketch series. **Currently content-free** — phase-01 built the deploy pipe only.

## Architecture

```
src/content.config.ts   5 Zod-typed collections (episodes, products, sponsors,
                         evidence [polymorphic], quotes [YAML data])
src/layouts/BaseLayout   global shell; renders <Nav/> + <Footer/> (disclaimer never per-page)
src/components/          Nav, Footer, PageHeader, YouTubeEmbed, EvidenceCard (polymorphic),
                         EpisodeCard, ProductCard, QuoteCard, SponsorRead
src/pages/               / · /evidence-lounge (spine) · /watch + /watch/[slug] ·
                         /products + /products/[slug] · /sponsor-reads · /quotes · /about
src/styles/global.css    Tailwind 4 entry + locked @theme brand tokens (Checkpoint B)
public/CNAME             apex-domain marker — MUST ship in dist/
.github/workflows/        push to main → withastro/action@v6 → GitHub Pages
.nvmrc                    24 (matches CI runtime)
```

**Content-free shells:** every route renders a deadpan empty state until content lands.
Collections empty ⇒ `getCollection` filters `!draft`; dynamic `[slug]` routes emit nothing.
**Local cache gotcha:** Astro 6's content store is `node_modules/.astro/data-store.json` —
clearing project `.astro/` is NOT enough; `rm -rf node_modules/.astro` for a clean local
content-free build. (CI is unaffected — `npm ci` wipes `node_modules`.)

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

- **phase-01 Foundation** — DONE. Content-free site + deploy pipe live.
- **Checkpoint B (brand tokens)** — DONE. Locked `@theme` (ivory/ink/gold + legal-stamp red), deadpan-luxury frame.
- **phase-02 Page Shells** — DONE (this build). Full 8-route IA, Evidence-Lounge-centric, content-free shells with deadpan empty states.
- **HTTPS enforcement** — DONE early (cert approved; `https_enforced:true`).
- **Checkpoint A (content concept)** — owner-owned; the IA exists, real content (songs/images/copy) is generated via the content factory and dropped in.
- **phase-03 Production Polish** — not started. OG/sitemap/robots/analytics, branch protection, Lighthouse, dedicated `/legal` route + LICENSE, view transitions.

Planning lives in `.planning/`. Stack rationale in `.planning/RESOLUTION.md` and `RUNBOOK.md`.

# CLAUDE.md — boozeonhormuz.com

Project governance for the Booze on Hormuz satire hub. Read before making changes.

## What this is

A static Astro 6 site, deployed to GitHub Pages on the apex domain `boozeonhormuz.com`. Surface: satirical luxury brand. Underneath: the content archive for the *Who the Hell Is Don Biggly?* sketch series. **Content rollout in progress** — the Evidence Lounge holds 7 live exhibits (4 `titlecard` + 3 `gallery`, all `draft: false`); the other four collections (episodes, products, sponsors, quotes) remain empty (deadpan empty states) until populated.

## Architecture

```
src/content.config.ts   5 Zod-typed collections (episodes, products, sponsors,
                         evidence [polymorphic], quotes [YAML data])
src/layouts/BaseLayout   global shell; renders <Nav/> + <Footer/> (disclaimer never per-page)
src/components/          Nav, Footer, PageHeader, YouTubeEmbed, EvidenceCard (polymorphic),
                         EpisodeCard, ProductCard, QuoteCard, SponsorRead
src/pages/               / · /evidence-lounge (spine) · /watch + /watch/[slug] ·
                         /products + /products/[slug] · /sponsor-reads · /quotes · /about · /legal ·
                         /tools (hub) + /tools/broadcast-room + /tools/evidence-lounge-studio + /tools/safety
src/pages/open-graph/    [...route].ts — generates per-page OG card images via astro-og-canvas
src/styles/global.css    Tailwind 4 entry + locked @theme brand tokens (Checkpoint B)
public/apps/             standalone visitor prompt-generator tools (broadcast-room.html,
                         evidence-lounge-studio.html); embedded via <iframe> by /tools pages
public/CNAME             apex-domain marker — MUST ship in dist/
astro.config.mjs         site=apex (NO base), output:static, sitemap() integration; tailwind
                         plugin cast to `any` to bridge @tailwindcss/vite↔Astro Vite type skew
.github/workflows/       deploy.yml (push main → withastro/action@v6 → Pages) +
                         lighthouse.yml (Lighthouse CI on PR/push, config in lighthouserc.json)
.nvmrc                    24 (matches CI runtime; note package.json engines says >=22.12.0)
```

**Content-free shells:** every route renders a deadpan empty state until content lands.
Collections empty ⇒ `getCollection` filters `!draft`; dynamic `[slug]` routes emit nothing.
**Local cache gotcha:** Astro 6's content store is `node_modules/.astro/data-store.json` —
clearing project `.astro/` is NOT enough; `rm -rf node_modules/.astro` for a clean local
content-free build. (CI is unaffected — `npm ci` wipes `node_modules`.)

**Creative Tools (`/tools`):** two standalone HTML prompt generators live in `public/apps/`
and are embedded via `<iframe>` inside BaseLayout-wrapped Astro pages. The iframe is a
deliberate isolation boundary — each tool ships a full `* { margin:0 }` reset and its own
`:root` token set that would collide with Tailwind `@theme` / `global.css` if inlined. This
keeps the tool sandboxed while Nav + Footer + the global disclaimer still wrap it. Native
port (shared CSS/JS, brand fonts) is deferred to a later phase. Tools are browser-only: no
backend, no API key, no localStorage. **Tool URL ≠ content URL:** `/evidence-lounge` is the
exhibit gallery; the *tool* is `/tools/evidence-lounge-studio`. Do not merge them.

Push to `main` builds and deploys. Every future content drop is one `git push`.

## Stack (exact-pinned)

| Dep | Version | Note |
|---|---|---|
| astro | 6.4.2 | static output, no adapter; runs Vite 7.3.3 |
| tailwindcss / @tailwindcss/vite | 4.2.0 | **NOT 4.3.0** — 4.3 hard-deps Vite 8, incompatible with Astro's Vite 7 |
| @astrojs/sitemap | 3.7.3 | sitemap integration (config in astro.config.mjs) |
| astro-og-canvas | 0.11.1 | OG card image generation (`src/pages/open-graph/`) |
| @astro-community/astro-embed-youtube | 0.5.10 | YouTube embed used by YouTubeEmbed.astro |
| @fontsource-variable/fraunces | 5.2.9 | display face |
| @fontsource-variable/inter | 5.2.8 | body face |
| @astrojs/check / typescript | 0.9.9 / 6.0.3 | dev — typecheck (`npx astro check`; no npm script) |

**Do not bump `@tailwindcss/vite` to 4.3.x** until Astro ships a Vite 8 line. It will break the build (`Missing field tsconfigPaths`).

## Commands

```bash
npm run dev       # localhost:4321
npm run build     # static build → dist/
npm run preview   # serve dist/
npx astro check   # typecheck (must exit 0 before commit)
```

## Conventions

- **Content rollout in progress** (owner-paced). Evidence Lounge has 7 live exhibits (titlecard + gallery); add content per collection by dropping entries (set `draft: false`). Source images live outside git (gitignored); ship optimized WebP under `public/`.
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
- **phase-03 Production Polish** — DONE (PR #10). OG/sitemap/robots/analytics, `/legal` route + LICENSE.
- **phase-04 Creative Tools (Phase 1 integration)** — DONE. `/tools` hub + two
  iframe-embedded prompt generators + `/tools/safety`; Tools added to nav; sitemap covers all
  four routes. Follow-ups shipped post-plan: Evidence Lounge JSON-import hardening (#17),
  shareable Broadcast Room prompt URLs (#18).
- **M01 (launch-satire-hub milestone)** — DONE (finalized PR #20). Still deferred to a later
  phase: Evidence Lounge responsive rebuild, a11y, shared CSS/JS extraction, font self-hosting —
  see `.planning/milestones/M01-launch-satire-hub/phase-04-creative-tools-PLAN.md`.

Planning lives in `.planning/`. Stack rationale in `.planning/RESOLUTION.md` and `RUNBOOK.md`.

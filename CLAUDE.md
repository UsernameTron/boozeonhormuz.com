# CLAUDE.md — boozeonhormuz.com

Project governance for the Booze on Hormuz satire hub. Read before making changes.

## What this is

A static Astro 6 site, deployed to GitHub Pages on the apex domain `boozeonhormuz.com`. **Media-first since the makeover:** the site is the permanent home of the whole project — the album, music videos, performances, shorts, artwork — plus one quiet commercial door (`/studio`). The original timeshare-trope landing page is preserved intact at `/experience` as part of the world. The media collections (albums/tracks/videos/images) are the publishing system: dropping one track file populates `/album`, `/listen`, `/archive`, the homepage, and its own page — no album-completion dependency anywhere (see `docs/CONTENT-MODEL.md`). **Content rollout in progress** — the Evidence Lounge holds 7 live exhibits (4 `titlecard` + 3 `gallery`, all `draft: false`) which also seed the homepage Visual Evidence grid and `/archive`; `/products` and `/sponsor-reads` render inline image-driven grids (data arrays in the page frontmatter, not collections); `/watch` shows a featured YouTube premiere embed as its empty state. The albums collection holds the live album shell; tracks/videos/images/episodes/quotes fill as work is finished.

## Deployment — Astro pipeline ONLY (critical)

The live site is built by `.github/workflows/deploy.yml` (`withastro/action@v6` → `astro build` → deploys `dist/`). **Files at the repo root never ship** — only `src/pages/` routes and `public/` assets. The deployed `CNAME` is `public/CNAME` (the root copy is vestigial). The untracked `DEPLOY.md` describes a plain push-the-HTML workflow that does NOT apply here; `extras/` (gitignored) holds v1/v2 reference copies of the standalone landing page — never deploy them.

**The Experience exception (was the homepage):** `src/pages/experience.html` — a raw HTML page (Astro serves `.html` pages verbatim: no scoped styles, no script bundling), NOT a BaseLayout page. It is the ported "v3 full-scam" standalone landing page (timeshare-trope satire: countdown bar, qualification quiz, financing calculator, Brigadier Dakota chat, exit-intent modal, sticky 1-800-BIG-BRINK bar), moved from the root during the media-first makeover and preserved as an artifact — **never delete or "modernize" it**. Its footer parody disclaimer + all-caps solicitation block are **load-bearing — keep both** (only-page exception to the "disclaimer renders from BaseLayout" rule, since it doesn't use BaseLayout). Its Don imagery ships as `public/don-biggly.webp` + `public/don-biggly-poster.webp` (extracted from the original's embedded base64). Future standalone-HTML drops must be ported the same way: externalize embedded images, swap dead-end anchors for real routes, keep head canonical/OG tags pointed at their own route. The homepage proper is now `src/pages/index.astro` — a BaseLayout media-first trailer for the archive.

## Architecture

```
src/content.config.ts   9 Zod-typed collections: episodes, products, sponsors,
                         evidence [polymorphic], quotes [YAML data] + the media library —
                         albums ← tracks ← videos/images (references; status-gated rollout)
src/lib/media.ts        media-library helpers: status filters, type labels, ISO durations
src/layouts/BaseLayout   global shell; renders <Nav/> + <Footer/> (disclaimer never per-page)
src/components/          Nav, Footer, PageHeader, YouTubeEmbed, EvidenceCard (polymorphic),
                         EpisodeCard, ProductCard, QuoteCard, SponsorRead + media-first set:
                         MediaThumb (img-or-placeholder), WatchCard, TrackRow, AudioTrack
src/pages/               / (index.astro — media-first trailer: hero → album → featured film →
                         performance → listen → visual evidence → experience door → studio strip) ·
                         /album + /album/[slug] (track pages) · /watch + /watch/[slug] (videos +
                         legacy episodes, client-side filters, VideoObject JSON-LD) · /listen ·
                         /archive (all media + evidence exhibits, filterable) ·
                         /experience (experience.html — the preserved v3 landing page) ·
                         /studio (real contact, mailto-composed) · /press ·
                         /evidence-lounge · /products + /products/[slug] · /sponsor-reads ·
                         /quotes · /about · /legal ·
                         /tools (hub) + /tools/broadcast-room + /tools/evidence-lounge-studio + /tools/safety
src/pages/open-graph/    [...route].ts — generates per-page OG card images via astro-og-canvas
src/styles/global.css    Tailwind 4 entry + locked @theme brand tokens (Checkpoint B)
public/apps/             standalone visitor prompt-generator tools (broadcast-room.html,
                         evidence-lounge-studio.html); embedded via <iframe> by /tools pages
public/audio|covers|stills|thumbs|video/  web-delivery media (masters live OUTSIDE git —
                          see docs/CONTENT-MODEL.md for the three-layer rule)
public/CNAME             apex-domain marker — MUST ship in dist/
docs/CONTENT-MODEL.md    the publishing procedure: add a track/video/image, status lifecycle
astro.config.mjs         site=apex (NO base), output:static, sitemap() integration; tailwind
                         plugin cast to `any` to bridge @tailwindcss/vite↔Astro Vite type skew
.github/workflows/       deploy.yml (push main → withastro/action@v6 → Pages) +
                         lighthouse.yml (Lighthouse CI on PR/push, config in lighthouserc.json)
.nvmrc                    24 (matches CI runtime; note package.json engines says >=22.12.0)
booze on hormuz/          tracked content-factory sources (brand pack, ingest/render/verify
                          scripts, skill specs) — NOT site code, never imported by the build
boozeonhormuz_don_biggly_knowledge_files (2)/  tracked Don Biggly knowledge files (lyric/hook/
                          visual-production guides) — content-factory inputs, not site code
```

**Content sourcing is split:** the media library (albums/tracks/videos/images) plus
evidence/episodes/quotes use the Zod-typed collections; products and sponsor-reads use
**inline typed arrays in the page frontmatter** (image-driven grids; `image` optional — a
missing/failed image renders a fixed-ratio placeholder so layout never breaks; `MediaThumb`
gives the media pages the same contract). To add a product/sponsor: drop an optimized WebP
into `public/products/` or `public/sponsors/` and add an array entry. To add a
track/video/image: follow `docs/CONTENT-MODEL.md` — track `status`
(`unreleased`/`preview`/`released`/`hidden`) gates rollout, so the album ships unfinished by
design. Empty collections ⇒ `getCollection` filters `!draft`; dynamic `[slug]` routes emit
nothing; routes render deadpan empty states. **Interface rule (makeover):** the content can
be deranged, the interface cannot — nav, playback, filters, and the /studio contact form
behave totally normally; the only fake sales mechanics live inside `/experience`.
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

- **Content rollout in progress** (owner-paced). Evidence Lounge has 7 live exhibits (titlecard + gallery); add collection content by dropping entries (set `draft: false`); add products/sponsors via the inline arrays in their pages. Source images live outside git (gitignored `design-sources/`); ship optimized WebP under `public/`.
- **Parody disclaimer** renders globally from `BaseLayout`, never per-page.
- New evidence artifact type = a new branch in the `evidence` discriminated union, not a new collection.
- Exact-pin every dependency; commit the lockfile; CI uses `npm ci`.
- `public/CNAME` is the source of truth for the custom domain.
- Branch for every change (`feat/`, `fix/`, `chore/`); never commit directly to `main`.

## Status

> Last verified: 2026-07-17 <!-- refresh via /gsd:sync-docs; guarded by ~/.claude/hooks/claude-md-staleness.js (warns >14d at SessionStart) -->

- **Now:** M01 shipped — site live at https://boozeonhormuz.com over HTTPS; M02 (pipeline) not started.
- **Live state:** [.planning/STATE.md](.planning/STATE.md) · **Roadmap:** [.planning/ROADMAP.md](.planning/ROADMAP.md) · **Stack rationale:** [.planning/RESOLUTION.md](.planning/RESOLUTION.md)
- Phase-by-phase history lives in STATE.md, not here.

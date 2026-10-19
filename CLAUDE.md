# CLAUDE.md — boozeonhormuz.com

Project governance for the Booze on Hormuz satire hub. Read before making changes.

> These documents describe this repository revision. Confirm the deployed SHA and Actions run before treating a change as live. Publishing requires explicit owner approval. Use [README.md](README.md) and [docs/DEVOPS-HANDOFF.md](docs/DEVOPS-HANDOFF.md) for current commands, release checks and approval boundaries. The checked-in workflows and package lockfile define the implementation; old runbooks and planning milestones are historical references.

## What this is

A static Astro 6 site targeting GitHub Pages on `boozeonhormuz.com`. The local catalogue includes a 27-song video album, 32 Deep Cuts Live performances, 113 Gallery images, seven music videos, nine sketches, fifteen shorts, seven McTrumps company videos, twelve quotes, five illustrated products, a portrait biography, and a news broadcast. The 97 videos include the album songs. Gallery includes seven additional Evidence Lounge exhibits, for 120 artworks. The media collections (albums/tracks/videos/images) drive the catalogue; `/listen` includes only tracks with separate audio. `/watch` opens with six collection choices and shows category videos after selection. `/gallery` reuses the archive artwork viewer and detail pages. Products use an inline typed array; McTrumps episodes come from `src/data/mctrumps.ts` and also have video records. Experience episode teasers were removed by owner request. This release adds The Evidence Is With Me and two McTrumps videos; verify the deployed SHA and successful Actions run before calling any revision live. The Studio reel remains deferred.

**Current handoff:** read `COWORK_HANDOFF.md`, `.planning/HANDOFF.json` and `.planning/STATE.md`. This is owner-directed local maintenance, not an active numbered phase. Connor approved staging, committing, pushing and GitHub Pages publication on October 19, 2026. Release `codex/evidence-feature-mctrumps` through the existing checks and PR flow. The three held attachments remain untouched.

McTrumps has its own primary navigation tab and compact `/mctrumps/` company hub: “Billions served. Books cooked.” Welcome is featured beside the introduction; the six other videos are grouped into Customer Relations (Birthday, Premium Costs), Corporate Leadership (Supervision, Appreciation, Jeff) and International Expansion (Tehran). The introduction makes McTrumps the resort's exclusive food supplier. Existing complaints, four related businesses and heading-only Resort Contracts/Company Records are inside a closed Company office drawer. Watch retains one McTrumps card opening this hub; `/sponsor-reads/` preserves old queries and clip anchors. All seven dedicated video pages preserve native playback, existing YouTube alternatives, notes and the supplied interview script. Deployment status is established by the matching successful Actions run.

Large video delivery: six full-quality MP4 copies are preserved under `media/` in Git and served from the [verified GitHub media release](https://github.com/UsernameTron/boozeonhormuz.com/releases/tag/site-media-2026-10-19). They stay outside `public/` so the complete site fits the GitHub Pages 1 GB limit. Catalogue URLs use those assets through the existing players and YouTube alternatives. Original source masters remain intact. `check:output` rejects packages larger than 1,000,000,000 bytes. See `media/README.md`.

## Deployment — Astro pipeline ONLY (critical)

The release workflow `.github/workflows/deploy.yml` installs the exact lockfile on Node 24, runs `npm run verify`, uploads the validated `dist/`, and audits that same artifact with Lighthouse. Main releases deploy only after **Release validation** succeeds, then run a read-only live smoke check. Pull requests cannot publish. **Files at the repo root never ship** — only `src/pages/` routes and `public/` assets. The deployed `CNAME` is `public/CNAME` (the root copy is vestigial). The untracked `DEPLOY.md` describes a plain push-the-HTML workflow that does NOT apply here; `extras/` (gitignored) holds v1/v2 reference copies of the standalone landing page — never deploy them.

**The Experience exception (was the homepage):** `src/pages/experience.html` is a raw HTML page, not a BaseLayout page. The approved resort presentation connects qualification, membership, amenities and financing to an exportable ownership record. Episode teasers were removed at the owner's request. Its dialogue is recorded in `docs/experience-script.md`. Preserve the approved design, footer disclaimer and solicitation block. Its Don imagery ships as `public/don-biggly.webp` and `public/don-biggly-poster.webp`. Future standalone HTML drops must externalize embedded images, use real routes and retain page-specific canonical/OG tags. The homepage is `src/pages/index.astro`, a BaseLayout media introduction.

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
src/pages/               / (index.astro: featured film, Watch/Album/Gallery gateways, gallery preview,
                         Products/Explore links and Studio strip) · /explore (world directory) ·
                         /album + /album/[slug] (track pages) · /deep-cuts (separate live collection) ·
                         /watch + /watch/[slug] (collection chooser, category pages, VideoObject JSON-LD) · /listen ·
                         /gallery (120 artworks, paginated by type) ·
                         /archive (search, populated filters and URL-driven artwork viewer) · /art/[id] ·
                         /experience (experience.html — the preserved v3 landing page) ·
                         /play (iframe-hosted browser game, see public/apps/) ·
                         /studio (real contact, mailto-composed) · /press ·
                         /evidence-lounge · /products + /products/[slug] · /mctrumps ·
                         /quotes · /about · /legal ·
                         /tools (hub) + /tools/broadcast-room + /tools/evidence-lounge-studio + /tools/safety
src/pages/open-graph/    [...route].ts — generates per-page OG card images via astro-og-canvas
src/styles/global.css    Tailwind 4 entry + locked @theme brand tokens (Checkpoint B)
public/apps/             standalone visitor apps: prompt-generator tools (broadcast-room.html,
                         evidence-lounge-studio.html; iframed by /tools pages) + the browser
                         game (exit-strategy.html; iframed by /play) — all browser-only,
                         no backend/API key; optional explicit device storage
public/audio|covers|stills|thumbs|video/  web-delivery media (masters live OUTSIDE git —
                          see docs/CONTENT-MODEL.md for the three-layer rule)
public/CNAME             apex-domain marker — MUST ship in dist/
docs/CONTENT-MODEL.md    the publishing procedure: add a track/video/image, status lifecycle
astro.config.mjs         site=apex (NO base), output:static, sitemap() integration; tailwind
                         plugin cast to `any` to bridge @tailwindcss/vite↔Astro Vite type skew
.github/workflows/       deploy.yml (source/browser checks → exact artifact → gated Pages → smoke) +
                         lighthouse.yml (reusable audit, config in lighthouserc.json)
.nvmrc                    24 (matches CI runtime; note package.json engines says >=22.12.0)
booze on hormuz/          tracked content-factory sources (brand pack, ingest/render/verify
                          scripts, skill specs) — NOT site code, never imported by the build
boozeonhormuz_don_biggly_knowledge_files (2)/  tracked Don Biggly knowledge files (lyric/hook/
                          visual-production guides) — content-factory inputs, not site code
```

**Content sourcing is split:** the media library (albums/tracks/videos/images) plus
evidence/episodes/quotes use the Zod-typed collections; products and sponsor-reads use
**an inline typed array for Products and `src/data/mctrumps.ts` for Sponsor Reads** (image-driven grids; `image` optional, a
missing/failed image renders a fixed-ratio placeholder so layout never breaks; `MediaThumb`
gives the media pages the same contract). Add product entries in `src/pages/products/index.astro`.
Add McTrumps episodes in `src/data/mctrumps.ts`, their video records and `public/mctrumps/` assets together.
To add a track/video/image, follow `docs/CONTENT-MODEL.md`. Track `status`
(`unreleased`/`preview`/`released`/`hidden`) gates rollout; all 27 current album tracks are released.
Empty collections ⇒ `getCollection` filters `!draft`; dynamic `[slug]` routes emit
nothing; routes render deadpan empty states. **Interface rule (makeover):** the content can
be deranged, the interface cannot — nav, playback, filters, and the /studio contact form
behave totally normally; the only fake sales mechanics live inside `/experience`.
**Local cache gotcha:** Astro 6's default content store is `node_modules/.astro/data-store.json`.
Disposable fixture builds use their own dependencies, `.astro` types and explicit `.astro-cache`
directory. Never share those caches with production; `npm run verify` rebuilds production after
fixtures and rejects leaked fixture labels. Use the isolated harness for synthetic content.

**Creative Tools (`/tools`):** two standalone HTML prompt generators live in `public/apps/`
and are embedded via `<iframe>` inside BaseLayout-wrapped Astro pages. The iframe is a
deliberate isolation boundary — each tool ships a full `* { margin:0 }` reset and its own
`:root` token set that would collide with Tailwind `@theme` / `global.css` if inlined. This
keeps the tool sandboxed while Nav + Footer + the global disclaimer still wrap it. Native
port is deferred to a later phase. Both apps use a small shared portable-project module and
responsive step navigation while retaining their own styles. Tools are browser-only: no
backend or API key; explicit opt-in device saving, reviewed restore/import and portable exports
are described in `docs/CREATIVE-PROJECTS.md`. **Tool URL ≠ content URL:** `/evidence-lounge` is the
exhibit gallery; the *tool* is `/tools/evidence-lounge-studio`. Do not merge them.

Content changes follow a reviewed branch and approved release. Do not push or publish without
explicit owner approval, and do not bypass failed validation. Listening resume and game report
saving are also opt-in and local; the current empty audio catalog remains a valid public state.

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
| @astrojs/check / typescript | 0.9.9 / 6.0.3 | dev — typecheck (`npm run check`) |
| sharp | 0.34.5 | additive responsive-media generation; originals remain unchanged |
| @playwright/test / @lhci/cli | 1.63.0 / 0.15.1 | browser regression suite and mobile audit |

**Do not bump `@tailwindcss/vite` to 4.3.x** until Astro ships a Vite 8 line. It will break the build (`Missing field tsconfigPaths`).

## Commands

```bash
npm run dev       # localhost:4321
npm run build     # static build → dist/
npm run preview   # serve dist/
npx astro check   # typecheck (must exit 0 before commit)
npm run verify   # source, isolated fixtures, production media/output and browser gates
npm run test:lighthouse # audit the frozen verified production output
```

## Conventions

- **Content rollout is owner-paced.** Add collection content through entries with `draft: false`; Products uses page data and McTrumps uses `src/data/mctrumps.ts`. Source masters remain outside Git. Ship optimized WebP and playback copies under `public/`; regenerate `src/lib/generated-media.json` when image assets change. Local additions are not remotely backed up until a later verified push.
- **Parody disclaimer** renders globally from `BaseLayout`, never per-page.
- New evidence artifact type = a new branch in the `evidence` discriminated union, not a new collection.
- Exact-pin every dependency; commit the lockfile; CI uses `npm ci`.
- `public/CNAME` is the source of truth for the custom domain.
- Branch for every change (`feat/`, `fix/`, `chore/`); never commit directly to `main`.

## Status

- This revision includes media optimization, archive artwork pages, portable creative projects,
  a listening queue with optional resume, and game result artifacts. Run the release checks
  against the revision being published; live state is the deployed SHA in Actions.
- [.planning/STATE.md](.planning/STATE.md), [.planning/ROADMAP.md](.planning/ROADMAP.md) and
  [.planning/RESOLUTION.md](.planning/RESOLUTION.md) preserve earlier milestone history.

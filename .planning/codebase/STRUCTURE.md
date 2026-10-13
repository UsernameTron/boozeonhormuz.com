# Codebase Structure

**Analysis Date:** 2026-10-13

## Directory Layout

```text
boh-implementation/
├── src/
│   ├── assets/og-fonts/     # Fonts for static social-card generation
│   ├── components/          # Shared Astro presentation and interaction markup
│   ├── content/             # Markdown catalog entries
│   ├── content.config.ts    # Collection loaders, schemas and validation
│   ├── data/                # Quote YAML and typed McTrumps data
│   ├── layouts/             # Shared page shell
│   ├── lib/                 # Catalog helpers, browser initializers and media manifest
│   ├── pages/               # Static Astro routes and standalone Experience HTML
│   ├── scripts/             # Listening controller browser module
│   └── styles/              # Global theme and dedicated McTrumps styles
├── public/                  # URL-addressable web delivery assets
│   ├── _media/              # Ignored build-generated responsive derivatives
│   ├── apps/                # Standalone tools, game and Experience support code
│   ├── covers/              # Album artwork
│   ├── evidence/            # Evidence Lounge artwork
│   ├── fonts/               # Public font assets
│   ├── mctrumps/            # McTrumps-specific delivery media
│   ├── posters/             # Poster assets
│   ├── press/               # News-broadcast delivery media
│   ├── products/            # Product artwork
│   ├── sponsors/            # Sponsor asset directory
│   ├── stills/              # Full Gallery images and other still artwork
│   ├── thumbs/              # Card/video thumbnails and Gallery grid images
│   └── video/               # Album, Watch and Deep Cuts MP4 files
├── scripts/                 # Build-output, media, fixture and deployment validators
├── tests/
│   ├── unit/                # Node test runner suites
│   ├── e2e/                 # Playwright browser suites
│   └── fixtures/            # Synthetic media, projects and listening fixture support
├── docs/                    # Publishing, production, performance and release guides
├── .github/workflows/       # Validation, Lighthouse and Pages delivery
├── .planning/               # Planning state, archives and codebase reference documents
├── astro.config.mjs         # Static build, site origin and integrations
├── package.json             # Exact dependencies and script chain
├── playwright.config.ts     # Browser runner and static preview configuration
├── tsconfig.json            # Astro strict TypeScript configuration
└── .gitignore               # Generated/scratch/master-source exclusions
```

The directories above are present on disk. `docs/CONTENT-MODEL.md` documents optional `public/audio/` for future separate audio, but it is not a current public directory; create it only when delivering actual audio assets.

## Directory Purposes

**`src/content/`:**
- Purpose: Store editorial metadata and track bodies for the publishing system.
- Contains: `albums/`, `tracks/`, `videos/`, `images/`, `episodes/`, `evidence/`, `products/` and `sponsors/`.
- Key files: `src/content/albums/booze-on-hormuz.md`, `src/content/tracks/luxury-compliance.md`, `src/content/videos/album-05-luxury-compliance.md`, `src/content/videos/deep-cut-06-luxury-compliance-live-in-rotterdam.md`, `src/content/images/gallery-01-mctrumps-tehran-welcome.md`.
- The shared schema contract is `src/content.config.ts`. Track references point to collection IDs; image and video records can exist without a track reference.

**`src/pages/`:**
- Purpose: Bind routes to collections, helper transformations and components.
- Contains: Index pages, nested album/watch/product routes, artwork detail routes, tool wrappers and generated social-card route code.
- Key files: `src/pages/index.astro`, `src/pages/album/index.astro`, `src/pages/watch/index.astro`, `src/pages/deep-cuts.astro`, `src/pages/gallery.astro`, `src/pages/archive.astro`, `src/pages/art/[id].astro`.
- Keep the standalone HTML route in `src/pages/experience.html`; `CLAUDE.md` describes its distinct rendering contract.

**`src/components/` and `src/layouts/`:**
- Purpose: Share rendered markup, accessibility contracts and the global site shell.
- Contains: Cards, images, native/YouTube players, artwork viewer markup, audio controls, navigation and footer.
- Key files: `src/layouts/BaseLayout.astro`, `src/components/MediaThumb.astro`, `src/components/WatchCard.astro`, `src/components/LocalVideo.astro`, `src/components/ArtworkViewer.astro`, `src/components/ListeningController.astro`.

**`src/lib/` and `src/scripts/`:**
- Purpose: Separate reusable data transformations and browser behavior from page templates.
- Contains: Catalog/status helpers, artwork IDs, search/viewer initializers, responsive-image lookup, listening state/source handling and the listening controller.
- Key files: `src/lib/media.ts`, `src/lib/archive.ts`, `src/lib/archive-search.ts`, `src/lib/artwork-viewer.ts`, `src/lib/responsive-media.ts`, `src/lib/generated-media.json`, `src/lib/listening.ts`, `src/lib/listening-source.ts`, `src/scripts/listening-controller.ts`.
- Filesystem-aware responsive helpers belong in Astro build-time frontmatter. Browser behavior belongs in modules such as `src/lib/artwork-viewer.ts` or `src/scripts/listening-controller.ts`.

**`public/`:**
- Purpose: Hold directly addressable assets copied into the static site.
- Contains: Web delivery images/video, public domain marker `public/CNAME`, standalone applications and generated derivatives.
- Key locations: `public/video/`, `public/thumbs/`, `public/stills/`, `public/covers/`, `public/apps/`.
- `docs/CONTENT-MODEL.md` requires production masters to remain outside this delivery tree. Preserve source URLs and bytes when generating variants with `scripts/generate-media.mjs`.

**`tests/` and `scripts/`:**
- Purpose: Verify catalog rules, production output and visitor behavior.
- Contains: Node unit suites, Playwright suites, disposable catalog fixture checks, media validation and deployed-route smoke checks.
- Key files: `tests/unit/media.test.mjs`, `tests/e2e/content-packages.spec.ts`, `tests/e2e/album-catalog.spec.ts`, `scripts/verify-fixtures.mjs`, `scripts/verify-media.mjs`, `scripts/check-output.mjs`, `scripts/smoke-site.mjs`.
- `scripts/verify-fixtures.mjs` builds synthetic content in an OS temporary clone with its own dependencies/cache. Do not put synthetic catalog entries into production `src/content/`.

## Key File Locations

**Entry Points:**
- `src/pages/index.astro`: Media-first home page.
- `src/pages/album/index.astro`: Album cover and ordered setlist.
- `src/pages/album/[slug].astro`: Song detail pages with related video/audio/artwork.
- `src/pages/watch/index.astro`: Media-type selection and cards.
- `src/pages/watch/[slug].astro`: Shared video/legacy episode detail routes.
- `src/pages/deep-cuts.astro`: Separate Deep Cuts Live video collection.
- `src/pages/gallery.astro`: Thumbnail gallery and artwork dialog.
- `src/pages/art/[id].astro`: Static artwork detail and download pages.
- `src/pages/open-graph/[...route].ts`: Per-page social-card generation.

**Configuration:**
- `astro.config.mjs`: Apex origin, static output, sitemap and Tailwind integration.
- `src/content.config.ts`: Content loaders, schemas and published-video validation.
- `package.json`: Command chain; `package-lock.json` is referenced by `CLAUDE.md` and the lockfile-install workflow.
- `playwright.config.ts`: Browser suite root, Chromium settings and preview server.
- `tsconfig.json`: Strict Astro TypeScript configuration.
- `.github/workflows/deploy.yml`: Source/browser validation, audited artifact and deployment gate.
- `.gitignore`: Generated artifacts and scratch-source exclusions.

**Core Logic:**
- `src/lib/media.ts`: Visibility, ordering, labels and watch-slug invariants.
- `src/lib/archive.ts`: Shared cards, artwork IDs and archive filtering.
- `src/lib/responsive-media.ts`: Image presence and manifest lookup.
- `scripts/generate-media.mjs`: Additive responsive WebP generation.
- `src/data/mctrumps.ts`: McTrumps programme data imported by `src/pages/sponsor-reads.astro`.
- `src/pages/products/index.astro`: Inline product grid data rather than its namesake collection.

**Testing:**
- `tests/unit/media.test.mjs`: Publication lifecycle, ordering and slug collisions.
- `tests/unit/archive.test.mjs`: Archive transformation/filtering.
- `tests/e2e/content-packages.spec.ts`: Deep Cuts/album separation, selected Watch categories, Gallery viewer and ordinary detail links.
- `tests/fixtures/media/`: Tiny landscape, portrait and square MP4 files plus WebVTT captions.
- `tests/fixtures/creative/`: Serialized tool-project fixtures.

## Naming Conventions

**Files:**
- Use kebab-case route and helper filenames, such as `src/pages/deep-cuts.astro` and `src/lib/responsive-media.ts`.
- Use PascalCase for Astro components, such as `src/components/WatchCard.astro`.
- Keep the bracket parameter spelling for generated routes, such as `src/pages/watch/[slug].astro` and `src/pages/art/[id].astro`.
- Album videos use an ordered `album-NN-` prefix, as in `src/content/videos/album-05-luxury-compliance.md`; matching delivery assets use the same stem.
- Deep Cuts videos use `deep-cut-NN-` records and assets, as in `src/content/videos/deep-cut-06-luxury-compliance-live-in-rotterdam.md`.
- Gallery records use `gallery-NN-` IDs, as in `src/content/images/gallery-01-mctrumps-tehran-welcome.md`. Keep an existing file ID stable because `src/lib/archive.ts` derives artwork URLs from it.
- Unit tests use `*.test.mjs` under `tests/unit/`; browser tests use `*.spec.ts` under `tests/e2e/`.

**Directories:**
- Use plural nouns for content collection folders in `src/content/` and web media categories under `public/`.
- Put route index/detail pairs in one route directory, such as `src/pages/album/index.astro` and `src/pages/album/[slug].astro`.
- Keep standalone app support files together under `public/apps/` so their HTML entry points and relative dependencies ship together.

## Where to Add New Code

**New Feature:**
- Primary code: Add a route in `src/pages/`, shared view markup in `src/components/`, and reusable behavior/data transformations in `src/lib/` or browser-controller modules in `src/scripts/`.
- Tests: Add behavioral pure-function coverage in `tests/unit/`; add browser interaction coverage in `tests/e2e/` when the feature changes a visitor flow.
- Metadata: Register a matching social-card entry in `src/pages/open-graph/[...route].ts` and the recognized route set in `src/layouts/BaseLayout.astro` where appropriate.

**New Deep Cuts performance:**
- Metadata: Add a `src/content/videos/deep-cut-NN-title.md` record based on `src/content/videos/deep-cut-06-luxury-compliance-live-in-rotterdam.md`.
- Delivery: Place the MP4 in `public/video/` and the thumbnail/poster in `public/thumbs/`; set `src`, `thumbnail`, `poster`, native dimensions, duration and orientation to match those assets.
- Membership: Set `type: performance`, `collection.label: Deep Cuts Live`, `collection.href: /deep-cuts/`, `collectionOrder` and `draft: false`.
- Album boundary: Do not create a track record for a standalone Deep Cuts item. The existing Deep Cuts example has no `track` reference, keeping it outside `src/pages/album/index.astro` setlist construction.
- Consumers: `src/pages/deep-cuts.astro`, `src/pages/watch/index.astro`, `src/pages/watch/[slug].astro` and `src/lib/archive.ts` consume video records without a new collection definition.

**New Gallery artwork:**
- Metadata: Add `src/content/images/gallery-NN-title.md` based on `src/content/images/gallery-01-mctrumps-tehran-welcome.md`.
- Delivery: Place the full web image under `public/stills/` and its grid thumbnail under `public/thumbs/`; supply `image`, `thumb`, `alt`, `title`, `type` and `draft: false`.
- Consumers: `src/pages/gallery.astro`, `src/pages/archive.astro` and `src/pages/art/[id].astro` use the existing normalized artwork/viewer contract. No separate Gallery schema is required.
- Optional relationships: Set `track` only when the image belongs to an existing track; the schema in `src/content.config.ts` makes this relation optional.

**New Component/Module:**
- Implementation: Use `src/components/` for Astro rendering; `src/lib/` for shared pure logic or focused browser initializers; `src/scripts/` for larger page-controller behavior following `src/scripts/listening-controller.ts`.

**Utilities:**
- Shared helpers: Extend the appropriate existing module in `src/lib/` rather than copying lifecycle or archive-ID logic into another page.
- Build/validation utilities: Put Node tooling under `scripts/`, then expose its command through `package.json` if it is part of the normal workflow.

## Special Directories

**`public/_media/`:**
- Purpose: Hash-named responsive WebP derivatives emitted by `scripts/generate-media.mjs`.
- Generated: Yes, through `media:generate`, `predev` and `prebuild` in `package.json`.
- Committed: No; explicitly ignored by `.gitignore`. It remains public build input after generation and is copied into the delivery artifact.

**`src/lib/generated-media.json`:**
- Purpose: Source URL metadata, hashes, dimensions and candidate lists consumed by `src/lib/responsive-media.ts`.
- Generated: Yes, by `scripts/generate-media.mjs`.
- Committed: The publishing guide `docs/CONTENT-MODEL.md` requires regeneration and review of this manifest; unlike `public/_media/`, this path has no exclusion in the read `.gitignore`.
- Regenerate from delivery images rather than editing it by hand; derivative files and their manifest have different source-control treatment.

**`dist/`, `.astro/`, `node_modules/`, `.lighthouseci/`, `playwright-report/`, `test-results/` and `work/`:**
- Purpose: Build output, generated Astro types, installed dependencies, audit/browser reports and local scratch work.
- Generated: Yes or local scratch, according to the associated tools and `.gitignore`.
- Committed: No; each is excluded by `.gitignore`. Release output is the validated `dist/` artifact, as defined by `.github/workflows/deploy.yml`.

**`booze on hormuz/` and `boozeonhormuz_don_biggly_knowledge_files (2)/`:**
- Purpose: Content-factory inputs and production guidance documented in `CLAUDE.md`.
- Generated: No; these are reference/source collections separate from `src/pages/` and `public/` site delivery.
- Committed: `CLAUDE.md` describes them as tracked content-factory sources. They are not the location for visitor routes or generated web media.

**`.planning/`:**
- Purpose: Project/roadmap/state, milestone history and codebase reference documents.
- Generated: Planning outputs, separate from application runtime.
- Key paths: `.planning/PROJECT.md`, `.planning/ROADMAP.md`, `.planning/STATE.md`, `.planning/milestones/`, `.planning/_archive/` and `.planning/codebase/`.
- Site delivery: `.github/workflows/deploy.yml` uploads `dist/`, so planning documents are outside the published site artifact.

---

*Structure analysis: 2026-10-13*

# Architecture

**Analysis Date:** 2026-10-13

## Pattern Overview

**Overall:** Static Astro publishing system with build-time content joins and browser-side interaction.

**Key Characteristics:**
- `astro.config.mjs` sets `output: 'static'`, the apex site URL and sitemap integration. Page frontmatter runs during build; shipped pages and media are files rather than request-time application responses.
- `src/content.config.ts` defines nine typed collections. `src/lib/media.ts` owns visibility, ordering and labels; `src/lib/archive.ts` normalizes those records into cross-media cards.
- `src/layouts/BaseLayout.astro` supplies the shared navigation, footer, fonts, stylesheet, canonical URL and social metadata. `src/pages/experience.html` is the standalone HTML exception documented in `CLAUDE.md`.
- `src/pages/play.astro` and `src/pages/tools/broadcast-room.astro` embed standalone apps from `public/apps/` in iframes. Keep these documents isolated from the layout's CSS rather than importing their markup into the shell.
- `.github/workflows/deploy.yml` publishes the validated `dist/` artifact only for main-branch events after validation and Lighthouse checks. Pull-request checks have no deploy path.

## Layers

**Content and editorial data:**
- Purpose: Describe publishable items and relationships.
- Location: `src/content.config.ts`, `src/content/`, `src/data/`.
- Contains: Markdown collections for albums, tracks, videos, images, evidence, episodes, products and sponsors; YAML quotes loaded from `src/data/quotes.yaml`; structured McTrumps data imported by `src/pages/sponsor-reads.astro` from `src/data/mctrumps.ts`.
- Depends on: Astro content loaders, Zod schemas and references; public-file existence checks for published video sources and caption tracks in `src/content.config.ts`.
- Used by: Build-time page frontmatter and `getStaticPaths()` in `src/pages/`.
- Apply visibility through helpers in `src/lib/media.ts`. A record existing on disk does not itself make it public.

**Catalog transformation:**
- Purpose: Centralize publication rules and joins without coupling them to markup.
- Location: `src/lib/media.ts`, `src/lib/archive.ts`, `src/lib/listening.ts`.
- Contains: Track lifecycle filtering, video sorting, public watch-slug collision detection, artwork IDs, archive normalization, category/text filtering and audio queue construction.
- Depends on: Typed `CollectionEntry` records and explicit foreign-key references such as `video.data.track.id`.
- Used by: `src/pages/index.astro`, album and Watch routes, `src/pages/archive.astro`, `src/pages/gallery.astro`, `src/pages/art/[id].astro` and `src/pages/listen.astro`.

**Page composition:**
- Purpose: Resolve collections into route-specific models, metadata and rendered sections.
- Location: `src/pages/`, `src/layouts/BaseLayout.astro`.
- Contains: Static index pages; generated detail routes through `getStaticPaths()`; the open-graph image route in `src/pages/open-graph/[...route].ts`.
- Depends on: Collections, catalog helpers and `src/components/` presentation components.
- Used by: Astro's static build configured in `astro.config.mjs`.
- Keep build-time filesystem helpers such as `src/lib/responsive-media.ts` in frontmatter or server-rendered component logic, rather than importing them into browser initializers.

**Media presentation:**
- Purpose: Render stable cards, native video players, responsive images and optional audio.
- Location: `src/components/MediaThumb.astro`, `src/components/WatchCard.astro`, `src/components/LocalVideo.astro`, `src/components/ArtworkViewer.astro`.
- Contains: Image availability checks, srcset metadata, fixed/native aspect ratios, native controls and artwork dialog markup.
- Depends on: `src/lib/responsive-media.ts`, `src/lib/generated-media.json` and URLs under `public/`.
- Used by: Home, Album, Watch, Gallery and Archive routes; `src/pages/products/index.astro` uses `MediaThumb` for its inline product array.
- Use `videoWidth` and `videoHeight` together for differently proportioned sources. `LocalVideo.astro` uses these dimensions for frame ratio and a width cap derived from a 620px height.

**Browser enhancement:**
- Purpose: Add selection, searching, enlarged artwork viewing and optional persistent listening state to rendered HTML.
- Location: `src/lib/archive-search.ts`, `src/lib/artwork-viewer.ts`, `src/components/ListeningController.astro`, scripts in `src/pages/watch/index.astro` and `src/pages/play.astro`.
- Contains: DOM-bound event handlers, URL/history synchronization, dialog navigation, media-type selection and expanded game state.
- Depends on: Server-rendered element IDs, data attributes and serialized JSON supplied by corresponding pages/components.
- Used by: Browser scripts bundled by Astro, without a runtime catalog API.

**Asset generation and release:**
- Purpose: Produce responsive media, validate the static site and deliver an audited artifact.
- Location: `scripts/generate-media.mjs`, `package.json`, `.github/workflows/deploy.yml`.
- Contains: Additive Sharp generation, predev/prebuild hooks, the verify command chain, artifact upload and gated Pages deployment.
- Depends on: Files under `public/`, exact lockfile installation and build/test scripts.
- Used by: Local development/build and the GitHub Actions validation pipeline.

## Data Flow

**Album and song playback:**

1. `src/content.config.ts` loads album, track and video Markdown and resolves collection references.
2. `src/pages/album/index.astro` selects the first non-draft album, orders listed tracks with `listedTracks()` and counts non-draft performance videos related to those tracks.
3. `src/pages/album/[slug].astro` generates detail routes only for `playableTracks()` and joins videos/images by the track reference ID.
4. The song page chooses the first performance, then a music video fallback. It renders `YouTubeEmbed` or `LocalVideo` and optional separate audio, credits, transcript and related imagery only where those fields exist.
5. `src/pages/listen.astro` separately filters for actual `audio` sources through `src/lib/listening.ts`; a filmed performance does not become a standalone audio queue item.

**Watch and Deep Cuts Live:**

1. `src/pages/watch/index.astro` combines `liveVideos()` with non-draft legacy episodes and maps track titles for related-song labels.
2. Videos with `collection.href === '/deep-cuts/'` receive the distinct Deep Cuts filter; their underlying schema type remains a supported video type in `src/content.config.ts`.
3. Watch cards are hidden initially. Selecting a media-type button updates `aria-pressed`, card visibility and empty/choice messages in the page script.
4. `src/pages/deep-cuts.astro` selects the same collection href and renders a dedicated grid linked to `/watch/<slug>`.
5. `src/pages/watch/[slug].astro` validates shared episode/video slug uniqueness, generates both route branches, joins related tracks/stills and emits `VideoObject` metadata with local content URLs or YouTube embed URLs.
6. `src/pages/album/index.astro` links to the Deep Cuts collection independently of the setlist, so collection membership does not add album tracks.

**Gallery, Archive and artwork detail:**

1. `src/lib/archive.ts` converts published images and image-bearing evidence into a shared `Artwork` model with full image, thumbnail, alt text and stable detail URL.
2. `qualifiedId()` preserves collection IDs using reversible URL-safe encoding. `artHref()` supplies `/art/<qualified-id>` for `src/pages/art/[id].astro`.
3. `src/pages/gallery.astro` supplies image collection records only; `src/pages/archive.astro` supplies tracks, videos, images and evidence. Both use `ArtworkViewer.astro`.
4. `ArtworkViewer.astro` serializes the artwork models safely for a browser initializer, including responsive image metadata from `src/lib/responsive-media.ts`.
5. `src/lib/artwork-viewer.ts` enhances ordinary detail links with a dialog, visible-item previous/next traversal, arrow keys, focus containment/restoration and an `art` URL parameter. Ordinary detail navigation remains available if enhancement fails.
6. `src/lib/archive-search.ts` restores and updates `q` and `type` URL parameters, updates visible cards and dispatches `archive:filtered` so dialog traversal follows the selected archive subset.

**Responsive image delivery:**

1. The `predev` and `prebuild` hooks in `package.json` run `scripts/generate-media.mjs`.
2. That script scans supported public images, reads dimensions and source hashes, and creates WebP variants at bounded widths of 320, 640, 960 and 1280 without enlarging originals.
3. Generated files use content/settings hashes under `public/_media/`; `src/lib/generated-media.json` maps original URLs to dimensions, hashes, byte counts and candidates.
4. `src/lib/responsive-media.ts` exposes dimensions/srcset and rejects missing or escaping local paths. `MediaThumb.astro` renders those attributes while preserving the original public URL.
5. `LocalVideo.astro` reads a public video URL directly with native controls and metadata preload. The dedicated McTrumps page uses its own native players with `preload="none"` and local-media existence checks in `src/pages/sponsor-reads.astro`.

**Static release contract:**

1. `.github/workflows/deploy.yml` installs the lockfile on Node 24 and runs `npm run verify`.
2. `package.json` defines verification as Astro check, unit tests, isolated fixtures, production rebuild, media/output validation and browser tests.
3. The workflow retains the validated `dist/` artifact and runs the reusable Lighthouse workflow before its Release validation gate.
4. Main-branch events upload and deploy that validated artifact; the deployment then runs `scripts/smoke-site.mjs` against the reported deployed URL.
5. Use the workflow and deployed revision as release evidence. Source presence and local success are separate from live deployment, as required by `CLAUDE.md`.

**State Management:**
- Catalog state is build-time Markdown/YAML data in `src/content/` and `src/data/`; browser pages receive rendered HTML and serialized models, as shown in `src/pages/archive.astro` and `ArtworkViewer.astro`.
- Search/filter/dialog state uses DOM variables and URL parameters in `src/lib/archive-search.ts` and `src/lib/artwork-viewer.ts`. Watch selection is page-local DOM state in `src/pages/watch/index.astro`.
- Audio resume is explicit device storage with a versioned key and source-aware validation in `src/lib/listening.ts`; unreadable storage returns errors without preventing ordinary playback.
- The Studio inquiry form composes a mail draft in `src/pages/studio.astro`; it does not submit to a server contact endpoint.

## Key Abstractions

**Publication lifecycle:**
- Purpose: Separate catalog listing from playable detail routes and audio availability.
- Examples: `src/content.config.ts`, `src/lib/media.ts`, `src/lib/listening.ts`.
- Pattern: Draft exclusion; hidden tracks excluded; unreleased tracks listed but not playable; preview/released tracks get pages; audio requires a real source.

**Cross-media artwork model:**
- Purpose: Reuse one set of IDs, detail pages and viewer behavior across image and evidence collections.
- Examples: `src/lib/archive.ts`, `src/pages/art/[id].astro`, `src/components/ArtworkViewer.astro`.
- Pattern: Normalize records into `ArchiveItem`/`Artwork`, qualify IDs with collection names and preserve direct routes alongside dialog enhancement.

**Collection membership:**
- Purpose: Group videos without altering track records or adding another schema collection.
- Examples: `src/content.config.ts`, `src/pages/deep-cuts.astro`, `src/pages/watch/index.astro`, `src/pages/watch/[slug].astro`.
- Pattern: Optional `{ label, href }` plus collection order; collection-aware sorting/filtering and related-video links.

**Shared page shell:**
- Purpose: Keep site navigation, styles and crawler metadata consistent.
- Examples: `src/layouts/BaseLayout.astro`, `src/pages/open-graph/[...route].ts`.
- Pattern: Pages pass title/description/custom image props; the shell resolves absolute canonical/social URLs and renders Nav/Footer around the content slot.

## Entry Points

**Static site build:**
- Location: `astro.config.mjs`, `package.json`.
- Triggers: Development/build scripts and `.github/workflows/deploy.yml`.
- Responsibilities: Load typed content, generate static routes, build assets and output the public site.

**Collection detail expansion:**
- Location: `src/pages/album/[slug].astro`, `src/pages/watch/[slug].astro`, `src/pages/art/[id].astro`.
- Triggers: Astro calls `getStaticPaths()` at build time.
- Responsibilities: Choose public entries, resolve references and construct props for every generated detail page.

**Browser interaction initialization:**
- Location: `src/lib/archive-search.ts`, `src/lib/artwork-viewer.ts`, `src/pages/watch/index.astro`.
- Triggers: Page scripts run after the associated markup is present.
- Responsibilities: Bind controls to the rendered catalog and synchronize visible content with local interaction state.

## Error Handling

**Strategy:** Reject invalid published catalog data during build; use readable fallbacks and direct links for optional media or browser enhancement failures.

**Patterns:**
- `src/content.config.ts` rejects published videos with missing playback sources, malformed YouTube IDs, partial native dimensions, invalid caption assets or multiple default captions.
- `src/lib/media.ts` throws for duplicate public Watch slugs before generated routes can collide.
- `src/lib/responsive-media.ts` checks public-path containment/existence; `MediaThumb.astro` handles missing images at build time and failed loads in the browser.
- `src/lib/artwork-viewer.ts` and `src/lib/archive-search.ts` exit when required elements or valid JSON are absent. The viewer retains direct detail links and shows an unavailable-image message after load errors.
- `src/pages/sponsor-reads.astro` shows a script/summary fallback for missing local video and a direct-playback error link on player errors.
- `src/lib/listening.ts` returns actionable errors for invalid/unreadable device storage while keeping playback available.

## Cross-Cutting Concerns

**Logging:** `scripts/generate-media.mjs` reports asset-generation counts; `.github/workflows/deploy.yml` retains browser reports and validated artifacts for release evidence.
**Validation:** Centralize content validation in `src/content.config.ts`, catalog invariants in `src/lib/media.ts`, and release validation in the `package.json` verify chain. `ArtworkViewer.astro` and `src/pages/archive.astro` escape `<` in serialized JSON embedded in HTML.
**Authentication:** Public pages render static content through `src/layouts/BaseLayout.astro`; the Studio contact interaction in `src/pages/studio.astro` is a mail draft rather than an authenticated server operation. Release publishing permissions are assigned separately to the deploy job in `.github/workflows/deploy.yml`.

---

*Architecture analysis: 2026-10-13*

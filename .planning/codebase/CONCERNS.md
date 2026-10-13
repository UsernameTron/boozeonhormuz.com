# Codebase Concerns

**Analysis Date:** 2026-10-13

## Tech Debt

**Multiple product/sponsor publishing paths:**
- Issue: Collection schemas exist alongside page-specific data sources. The Products grid is an inline array; product detail generation reads the empty products collection. McTrumps renders from typed data while Watch discovery reads video records.
- Files: `src/content.config.ts`, `src/pages/products/index.astro`, `src/pages/products/[slug].astro`, `src/pages/sponsor-reads.astro`, `src/data/mctrumps.ts`, `src/content/products/`, `src/content/sponsors/`.
- Impact: Adding a product or commercial through only one path does not necessarily populate all related surfaces. The current empty collection folders are intentional and are not missing media uploads.
- Fix approach: Keep the current authoring distinction explicit in `docs/CONTENT-MODEL.md`; if these catalogs expand, consolidate shared data in a separately scoped migration with route/link regression checks.

**Large standalone tool implementations:**
- Issue: The two prompt-generator HTML documents contain substantial inline application logic and styling, alongside a shared project module.
- Files: `public/apps/broadcast-room.html` (1,190 lines at inspection), `public/apps/evidence-lounge-studio.html` (1,805 lines), `public/apps/project-kit.js`, `src/pages/tools/broadcast-room.astro`.
- Impact: Changes to import/export, navigation and rendering require coordinating standalone documents without colliding with the Astro shell.
- Fix approach: Keep the iframe boundary required by `CLAUDE.md`; extract cohesive shared behavior only where it actually reduces duplication, with the existing creative-project browser tests as acceptance evidence.

**Repeated responsive-image encoding:**
- Issue: `scripts/generate-media.mjs` reads and encodes every eligible source on every run; it writes content-hashed variants without skipping already valid output or removing obsolete derivative hashes.
- Files: `scripts/generate-media.mjs`, `package.json`, `public/_media/`, `src/lib/generated-media.json`.
- Impact: `predev` and `prebuild` do work proportional to the complete image catalog. Changed sources can leave unreferenced derivatives in the local public tree, and those files can be copied into `dist/`.
- Fix approach: Reuse candidates only after validating their settings/source hash and dimensions; prune unreferenced generated derivatives without changing original delivery assets. Preserve `scripts/verify-media.mjs` hash checks.

## Known Bugs

**Watch selection has no script-failure fallback:**
- Symptoms: With JavaScript unavailable, media-type buttons cannot reveal cards. The source renders both the entire grid and individual cards with `display: none` and shows a selection instruction.
- Files: `src/pages/watch/index.astro`, `tests/e2e/album-catalog.spec.ts`.
- Trigger: JavaScript disabled or the selection script failing to initialize. This is a source-confirmed failure path; no no-JavaScript Watch browser run is claimed here.
- Workaround: Visitors can use `/album/`, `/deep-cuts/` or `/archive/` links to reach playable detail pages.
- Fix approach: Preserve the approved explicit media-type selection and absence of an All option. Provide ordinary category navigation or a readable no-script route fallback rather than revealing the whole catalog by default.

## Security Considerations

**Audited build/dev dependency vulnerabilities:**
- Risk: The current dependency audit is BLOCK with 2 critical, 24 high, 11 moderate and 3 low vulnerable package entries; propagated package findings are not a count of unique exploits.
- Files: `.planning/dependencies/DEPENDENCIES-REPORT.md`, `package.json`, `astro.config.mjs`, `.github/workflows/deploy.yml`, `scripts/generate-media.mjs`.
- Current mitigation: `astro.config.mjs` builds static output with no server adapter. `.github/workflows/deploy.yml` deploys `dist/` to Pages. The public deployment does not run Astro, Vite, Express or Sharp as a request-serving Node application.
- Recommendations: Follow the precise audited fix ranges in `.planning/dependencies/DEPENDENCIES-REPORT.md`; remediate the Astro/Sharp and LHCI dependency trees in a tested source change. Avoid force audit fixes or audit-suggested major downgrades. This audit does not demonstrate live exploitation of the static website.

**Toolchain and media-decoder exposure remains distinct from public runtime:**
- Risk: `scripts/generate-media.mjs` invokes Sharp on local owner-delivered images. Dependency findings therefore matter to developer machines and CI even though there is no public image-processing API.
- Files: `scripts/generate-media.mjs`, `.planning/dependencies/DEPENDENCIES-REPORT.md`, `package.json`.
- Current mitigation: The generator selects WebP/JPEG/PNG by extension, excludes app/font and selected icon/social files, preserves input bytes and produces additive variants. The audit report distinguishes attacker-controlled AVIF and LHCI proxy configuration conditions from demonstrated site paths.
- Recommendations: Retain trusted media provenance and bounded generation behavior; upgrade to the fixed compatible decoder/toolchain versions identified in the audited report rather than treating static deployment as a dependency waiver.

**Public build policy validates references, not external-provider uptime:**
- Risk: `publicAssetExists()` accepts parseable HTTPS sources without network playback verification. YouTube metadata validates ID shape but cannot establish future provider availability.
- Files: `src/content.config.ts`, `src/components/YouTubeEmbed.astro`, `src/pages/watch/[slug].astro`, `tests/e2e/media-layout.spec.ts`.
- Current mitigation: Local published sources must exist; malformed YouTube IDs and invalid caption assets fail validation. The YouTube browser test intercepts provider traffic for deterministic facade checks.
- Recommendations: Keep source/schema checks and provider playback verification distinct in release reports. Check any newly published external-source media against the actual provider before claiming it plays publicly.

## Performance Bottlenecks

**Large static media artifact:**
- Problem: The inspected `dist/` contains 1,000,366,880 bytes. The public tree contains 93 MP4 files; 72 exceed 5 MiB and the largest is 50,913,521 bytes (about 48.6 MiB).
- Files: `dist/`, `public/video/`, `public/mctrumps/`, `public/press/`, `.github/workflows/deploy.yml`.
- Cause: Approved playable video delivery files are copied into every full site build and release artifact. These are intentional content assets, not accidental secrets or unexplained generated files.
- Improvement path: Measure compressed/artifact size and actual deployment acceptance. Consider a separately approved media-delivery strategy if catalog growth makes full site transfer impractical; preserve current originals and references during any migration. The canonical confidence file-size rule treats files over 5 MiB as a failure, so do not silently waive that rule because the content is intentional.

**Full catalog DOM on Archive and Watch:**
- Problem: Both pages generate all cards up front; filtering only changes visibility. Archive also embeds a JSON search index and artwork viewer data.
- Files: `src/pages/archive.astro`, `src/pages/watch/index.astro`, `src/lib/archive-search.ts`, `src/components/ArtworkViewer.astro`.
- Cause: Static content is serialized and rendered for client-side filtering rather than fetched in pages. The inspected catalog has 94 video records and 47 image records before evidence and tracks are combined.
- Improvement path: Keep existing lazy image/loading and stable-card contracts. Benchmark page weight, filtering responsiveness and memory with the expanded catalog before introducing pagination or virtualized interaction.

## Fragile Areas

**Schema-to-page-to-browser data contracts:**
- Files: `src/content.config.ts`, `src/lib/archive.ts`, `src/components/ArtworkViewer.astro`, `src/lib/artwork-viewer.ts`, `src/lib/archive-search.ts`.
- Why fragile: Collection identifiers and data attributes connect build-time models to browser behavior. Dialog initialization exits on absent elements or malformed serialized data, so a markup change can disable enhancement while ordinary links continue working.
- Safe modification: Preserve IDs, `data-art-id`, JSON element IDs and the `archive:filtered` event contract together. Maintain qualified artwork IDs because file-based ID changes alter detail URLs.
- Test coverage: `tests/e2e/content-packages.spec.ts` covers Gallery navigation and ordinary no-script detail links; `tests/e2e/archive.spec.ts` covers archive behavior.

**Ordering and album/Deep Cuts separation:**
- Files: `src/lib/media.ts`, `src/pages/album/index.astro`, `src/pages/deep-cuts.astro`, `src/pages/watch/index.astro`, `src/content/videos/deep-cut-06-luxury-compliance-live-in-rotterdam.md`.
- Why fragile: Deep Cuts is collection metadata on performance videos, not a separate collection schema. Album membership depends on track records/references; Watch reclassifies Deep Cuts cards based on an exact collection href.
- Safe modification: Keep `/deep-cuts/` href spelling consistent and use video-only records for standalone Deep Cuts. Preserve native dimensions and collection order when importing additional media.
- Test coverage: `tests/e2e/content-packages.spec.ts` asserts 32 Deep Cuts versus 27 album performances and their filter separation; `tests/unit/media.test.mjs` covers lifecycle and ordering primitives.

**Global shell versus standalone app/Experience styling:**
- Files: `src/layouts/BaseLayout.astro`, `src/pages/experience.html`, `src/pages/play.astro`, `src/pages/tools/broadcast-room.astro`, `public/apps/experience.css`.
- Why fragile: Experience is raw standalone HTML; tools/game are separate iframe documents. Applying one shared layout/reset to every route would change styles and interaction assumptions.
- Safe modification: Preserve the documented standalone exceptions and the iframe boundaries. Check keyboard, expansion and mobile reflow when modifying wrapper/layout styles.
- Test coverage: `tests/e2e/experience.spec.ts`, `tests/e2e/game-artifacts.spec.ts`, `tests/e2e/tool-layout-stability.spec.ts` and `tests/e2e/creative-projects.spec.ts`.

## Scaling Limits

**Media in the site repository/artifact:**
- Current capacity: The measured `dist/` is approximately 954 MiB and 72 public MP4s exceed the confidence workflow's 5 MiB tracked-file threshold; the root audit independently reports those files as tracked.
- Files: `public/video/`, `public/mctrumps/`, `public/press/`, `.github/workflows/deploy.yml`.
- Limit: Large binaries increase clone/install-fixture copying, build artifact transfer and release time. This inspection establishes current byte counts, not an external hosting quota or a proven deployment rejection.
- Scaling path: Evaluate delivery-file bitrate/encoding and a dedicated media host as a separate reviewed change. Keep the content catalog portable through existing `src` HTTPS support in `src/content.config.ts`.

**Whole-site fixture clone:**
- Current capacity: `scripts/verify-fixtures.mjs` copies `src/`, `public/` and build tooling to a disposable directory and installs an independent dependency tree.
- Files: `scripts/verify-fixtures.mjs`, `public/video/`, `package.json`.
- Limit: The public video payload is copied for fixture validation even when a test only needs a small synthetic file, increasing local disk and CI transfer overhead.
- Scaling path: Make fixture selection explicit while preserving enough production catalog/reference integrity to exercise build behavior; retain isolated caches and production rebuild checks.

## Dependencies at Risk

**Astro/Sharp and the LHCI tooling tree:**
- Risk: `.planning/dependencies/DEPENDENCIES-REPORT.md` records current critical/high package advisories and validated fix ranges. `package.json` pins Astro 6.4.2, Sharp 0.34.5 and LHCI 0.15.1.
- Files: `.planning/dependencies/DEPENDENCIES-REPORT.md`, `package.json`, `astro.config.mjs`, `.github/workflows/lighthouse.yml`.
- Impact: These findings block the canonical dependency confidence gate and expose build/development tools under advisory-specific conditions; they do not prove an attacker-controlled Node server path on Pages.
- Migration plan: Apply the dependency auditor's tested-version recommendations, retain exact direct pins, and re-run full plus production-manifest audit and the complete verification/Lighthouse chain. Preserve the Tailwind/Vite compatibility warning in `CLAUDE.md` until an intentional validated framework migration resolves it.

## Missing Critical Features

**Expanded content is absent from live smoke/performance route coverage:**
- Problem: `scripts/smoke-site.mjs` omits `/gallery/` and `/deep-cuts/`; `scripts/check-output.mjs` critical routes and the 12 configured Lighthouse URLs omit both routes as well.
- Files: `scripts/smoke-site.mjs`, `scripts/check-output.mjs`, `lighthouserc.json`, `.github/workflows/deploy.yml`.
- Blocks: The current automated post-deploy check cannot substantiate that these two approved packages are present and playable on the public deployment. Local browser tests provide different evidence.
- Fix approach: Add route-specific deployed-content checks and appropriate performance budgets in a scoped validation update; retain the exact validated-artifact release contract.

**Timed captions and plain-text collection transcripts:**
- Problem: None of the 94 inspected video Markdown records has a `captions:` or `transcript:` field. The schema supports both. On-screen lyrics are delivered visually rather than as timed text tracks or searchable transcripts.
- Files: `src/content/videos/`, `src/content.config.ts`, `src/components/LocalVideo.astro`, `src/pages/album/[slug].astro`.
- Blocks: Visitors cannot select a supplied WebVTT caption track or use the optional collection transcript display. This is optional accessibility/editorial work, not a request for additional standalone audio or a missing playable-video blocker.
- Fix approach: Add reviewed transcripts and WebVTT assets when available, using existing schema/player support and caption validation tests.

## Test Coverage Gaps

**No-script Watch media selection:**
- What's not tested: Media-type selection/recovery when JavaScript is disabled or the filter script fails.
- Files: `src/pages/watch/index.astro`, `tests/e2e/album-catalog.spec.ts`, `tests/e2e/content-packages.spec.ts`.
- Risk: All Watch cards remain hidden despite actionable-looking filter buttons.
- Priority: Medium. Keep the approved category-selection behavior when adding a fallback.

**Decode coverage across the full long-video catalog:**
- What's not tested: A documented end-to-end decode/play check for every album and Deep Cuts source. The Deep Cuts suite plays the first/last items; the Album suite checks player attributes and a range request for its first source.
- Files: `tests/e2e/content-packages.spec.ts`, `tests/e2e/album-catalog.spec.ts`, `public/video/`.
- Risk: A mid-catalog file could be reachable with correct metadata yet fail decoding on a visitor's device.
- Priority: Medium. Use bounded media validation or representative platform playback coverage without representing HTTP existence as complete playback evidence.

**Real external-provider and public-media playback:**
- What's not tested: The deterministic YouTube facade test does not exercise a live provider stream, and the deployed smoke script reads HTML without playing local media or requesting every MP4.
- Files: `tests/e2e/media-layout.spec.ts`, `scripts/smoke-site.mjs`, `.github/workflows/deploy.yml`.
- Risk: Provider removal, live byte-range behavior or codec/platform differences can fail after local HTML/browser validation succeeds.
- Priority: Medium. Record representative live playback checks after deployment; distinguish browser/provider observations from local source tests.

---

*Concerns audit: 2026-10-13*

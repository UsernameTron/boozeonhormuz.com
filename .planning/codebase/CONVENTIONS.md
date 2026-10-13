# Coding Conventions

**Analysis Date:** 2026-10-13

## Naming Patterns

**Files:**
- Use PascalCase for Astro components, following `src/components/MediaThumb.astro`, `src/components/WatchCard.astro` and `src/components/LocalVideo.astro`.
- Use descriptive lowercase kebab-case for utility modules, scripts, content records and test suites: `src/lib/artwork-viewer.ts`, `scripts/generate-media.mjs`, `src/content/videos/deep-cut-16-hot-mic-big-mouth-live-hot-mic.md` and `tests/e2e/content-packages.spec.ts`.
- Astro routes follow file-based names and bracket parameters: `src/pages/watch/index.astro`, `src/pages/watch/[slug].astro` and `src/pages/open-graph/[...route].ts`.
- Follow `.test.mjs` for Node unit tests and `.spec.ts` for browser tests, matching `tests/unit/media.test.mjs` and `tests/e2e/content-packages.spec.ts`.

**Functions:**
- Use camelCase and intent-bearing verbs, matching `listedTracks`, `playableTracks`, `validateWatchSlugs` in `src/lib/media.ts`, `initializeArtworkViewer` in `src/lib/artwork-viewer.ts` and `readResume` in `src/lib/listening.ts`.

**Variables:**
- Local variables and content fields use camelCase, including `trackTitleById` in `src/pages/watch/index.astro` and `collectionOrder`, `videoWidth` and `publishDate` in `src/content.config.ts`.
- Stable exported constants use uppercase snake case, following `RESUME_KEY` and `RESUME_WRITE_INTERVAL` in `src/lib/listening.ts` and `MAX_FILE_BYTES` in `public/apps/project-kit.js`.
- Use descriptive `data-*` HTML attributes for browser behavior, as demonstrated by `data-art-id` in `src/lib/artwork-viewer.ts` and `data-filter` in `src/pages/watch/index.astro`.

**Types:**
- Use PascalCase type/interface names: `Track`, `VideoOrientation`, `ResponsiveAsset`, `ViewerItem` and `QueueTrack` in `src/lib/media.ts`, `src/lib/responsive-media.ts`, `src/lib/artwork-viewer.ts` and `src/lib/listening.ts`.
- Use Astro `CollectionEntry` aliases for content records and explicit `Props` interfaces for component inputs, following `src/lib/media.ts` and `src/components/WatchCard.astro`.

## Code Style

**Formatting:**
- No dedicated formatter configuration or formatter npm script is present in the inspected repository inventory and `package.json`.
- Match the local file: TypeScript/JavaScript samples use semicolons, predominantly single-quoted strings and two-space indentation; Astro templates combine multiline markup with compact frontmatter declarations. Examples are `src/lib/media.ts` and `src/components/MediaThumb.astro`.
- Preserve targeted changes rather than applying a repository-wide format pass; `src/lib/artwork-viewer.ts` and `src/lib/archive-search.ts` contain compact multi-statement lines, while component markup is expanded.
- Use existing Tailwind theme utilities and tokens from `src/styles/global.css`; `CLAUDE.md` identifies the brand token set as locked.

**Linting:**
- No ESLint, Prettier or Biome configuration was detected, and `package.json` defines no lint script. Do not claim a lint pass when reporting verification.
- `npm run check` runs Astro checking under the strict TypeScript preset in `tsconfig.json`. `npm run verify` adds unit, fixture, production build, media, output and browser checks; `.github/workflows/deploy.yml` uses that command as the source/browser gate.
- Exact dependency versions and retained lockfile installation are explicit project requirements in `CLAUDE.md`; `package.json` pins each direct dependency and CI installs with `npm ci`.

## Import Organization

**Order:**
1. Place framework or Node imports near the top, following `src/pages/watch/index.astro` and `scripts/generate-media.mjs`.
2. Import layouts/components and shared helpers explicitly by relative path, as in `src/pages/watch/[slug].astro`.
3. Use type-only imports where appropriate, following `import type { CollectionEntry } from 'astro:content'` in `src/lib/media.ts`.
- This order is an observed convention, not an enforced lint rule. `src/lib/archive-search.ts` declares its local type before the import, and `src/lib/responsive-media.ts` imports the generated JSON before Node modules.

**Path Aliases:**
- No custom path aliases are configured in `tsconfig.json`; application code uses relative paths and Astro virtual modules such as `astro:content` and `astro:schema` in `src/content.config.ts`.
- Import extension practice varies: `src/lib/listening.ts` uses both `./media` and `./media.ts`; match the surrounding module rather than assuming an enforced rule.

## Error Handling

**Patterns:**
- Fail invalid publication metadata at build time. `src/content.config.ts` validates public video sources, captions, native dimensions, collection links and YouTube identifiers through schema refinement. `validateWatchSlugs` in `src/lib/media.ts` throws on public slug collisions.
- Keep optional media failures recoverable. `src/lib/responsive-media.ts` rejects unavailable or escaping local paths; `src/components/MediaThumb.astro` switches failed images to a fixed-ratio fallback; `src/components/LocalVideo.astro` provides a direct video link as a native-player fallback.
- Return explicit status and user-readable errors for storage operations. `src/lib/listening.ts` uses `{ position, error }` and `{ ok, error }` results, validates saved data and catches inaccessible storage.
- DOM initializers guard missing elements or unsupported dialog APIs before attaching behavior. `src/lib/artwork-viewer.ts` and `src/lib/archive-search.ts` catch unreadable embedded JSON and decline enhancement rather than breaking page initialization.
- Preserve usable detail links when enhancement cannot open the artwork dialog, as implemented in `src/lib/artwork-viewer.ts` and verified without JavaScript by `tests/e2e/content-packages.spec.ts`.
- Preserve the explicit Watch category-selection behavior in `src/pages/watch/index.astro`; the initial hidden grid is intentional and covered by `tests/e2e/content-packages.spec.ts`.

## Logging

**Framework:**
- Native console output and assertion failures in validation scripts; no logging-service dependency is declared in `package.json`.

**Patterns:**
- Emit concise success totals for build tooling, following `scripts/generate-media.mjs`, `scripts/verify-media.mjs` and `scripts/check-output.mjs`.
- Use assertions and exceptions for invalid outputs instead of logging-and-continuing, following `scripts/check-output.mjs` and `validateWatchSlugs` in `src/lib/media.ts`.
- Use visible recovery messages for visitor storage failures instead of relying on console messages, following `src/lib/listening.ts`.

## Comments

**When to Comment:**
- Explain publication rules, compatibility constraints and fallback intent. `src/lib/media.ts` explains status eligibility; `astro.config.mjs` documents the Tailwind plugin type cast; `src/components/MediaThumb.astro` explains stable fallback sizing.
- Explain preservation and invalidation requirements in generation logic, following `scripts/generate-media.mjs`.
- Keep content-authoring instructions in `docs/CONTENT-MODEL.md`: source originals remain outside the repository, optimized delivery files live under `public/`, and metadata records provide references. Publication approval and reviewed branches are defined in `CLAUDE.md`.

**JSDoc/TSDoc:**
- The inspected helpers primarily use short line comments, TypeScript annotations and interfaces rather than extensive TSDoc. `astro.config.mjs` uses JSDoc casts for JavaScript type-check compatibility.

## Function Design

**Size:**
- No numeric function-length limit is configured in `package.json`. Shared media helpers are compact and focused in `src/lib/media.ts`; DOM initialization is a larger cohesive function in `src/lib/artwork-viewer.ts`.
- Extract reusable data rules into `src/lib/` and keep rendering in Astro components/pages, following the boundary between `src/lib/media.ts` and `src/pages/watch/index.astro`.

**Parameters:**
- Prefer typed content arrays and small shaped objects for utilities, following `src/lib/media.ts` and `src/lib/responsive-media.ts`.
- Inject storage and current time where behavior needs deterministic verification, following `readResume(storage, queue)`, `validateResume(value, queue, now)` and `writeResume(storage, track, position, now)` in `src/lib/listening.ts`.
- Components use explicit `Props` and defaults destructured from `Astro.props`, following `src/components/LocalVideo.astro` and `src/components/WatchCard.astro`.

**Return Values:**
- Pure filters return new arrays and preserve caller input. `listedTracks` filters before sorting, while `featuredFirst` explicitly copies its input in `src/lib/media.ts`; `tests/unit/media.test.mjs` checks nonmutation.
- Return `undefined` for unavailable optional media values and `null` for invalid saved state, matching `src/lib/responsive-media.ts`, `toISODuration` in `src/lib/media.ts` and `validateResume` in `src/lib/listening.ts`.
- Use structured success/failure results for recoverable operations instead of ambiguous booleans, following `src/lib/listening.ts`.

## Module Design

**Exports:**
- Use named function, type and constant exports for library code, matching `src/lib/media.ts`, `src/lib/listening.ts` and `public/apps/project-kit.js`.
- Astro routes export framework entry points such as `getStaticPaths` in `src/pages/watch/[slug].astro` and generated `GET`/`getStaticPaths` in `src/pages/open-graph/[...route].ts`.
- Keep collection schemas centralized in `src/content.config.ts`; pages consume publication helpers rather than redefining media eligibility. Album videos use `performance`, and separate audio eligibility is checked by `src/lib/listening.ts`, as described in `docs/CONTENT-MODEL.md`.
- Keep browser-only standalone tools isolated in `public/apps/`, with shared portable behavior in `public/apps/project-kit.js`; `CLAUDE.md` describes their iframe isolation boundary.

**Barrel Files:**
- No barrel-import convention appears in the inspected source. Consumers import the actual helper/component files directly, as in `src/pages/watch/index.astro`, `src/pages/watch/[slug].astro` and `src/lib/listening.ts`.

---

*Convention analysis: 2026-10-13*

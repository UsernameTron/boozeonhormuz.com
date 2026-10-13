# Testing Patterns

**Analysis Date:** 2026-10-13

## Test Framework

**Runner:**
- Node built-in `node:test` for `tests/unit/*.test.mjs`; exact Node requirements are declared in `package.json` and CI runs Node 24 in `.github/workflows/deploy.yml`.
- Playwright 1.63.0 for `tests/e2e/*.spec.ts`, configured in `playwright.config.ts`.
- Standalone Node assertion scripts for fixture, media and output validation under `scripts/`.
- Lighthouse CI 0.15.1 for frozen production output, configured in `lighthouserc.json`.

**Assertion Library:**
- `node:assert/strict` in unit tests and validation scripts.
- Playwright `expect`, locator assertions and `expect.poll` in browser tests.

**Run Commands:**

Run from the repository root:

```bash
npm run verify                  # Typecheck, units, fixtures, production build, media, output, browser checks
npm run check                   # Astro source/type checks
npm run test:unit               # All Node unit tests
node --test tests/unit/media.test.mjs
npm run test:fixtures           # Disposable content builds plus actual browser media decoding
npm run build                  # Regenerate additive responsive media and production dist
npm run check:media             # Original hashes and derivative metadata
npm run check:output            # Generated links, routes, canonicals, schema and fixture-leak checks
npm run test:e2e                # Built-output Chromium suite
npx playwright test tests/e2e/content-packages.spec.ts
npm run test:lighthouse         # Audit existing frozen dist; separate from npm run verify
npx playwright show-report      # Inspect browser report
```

`package.json` has no lint script and no configured percentage-coverage command. `npm run check` is source/type validation, not a separately claimed lint pass.

## Test File Organization

**Location:**
- Separate `tests/unit/`, `tests/e2e/` and `tests/fixtures/` directories.
- Production code remains in `src/lib/`, `src/components/`, `src/pages/` and `public/apps/`.
- Integration validation entry points are `scripts/verify-fixtures.mjs`, `scripts/verify-media.mjs` and `scripts/check-output.mjs`.

**Naming:**
- Unit modules: `*.test.mjs`.
- Browser suites: `*.spec.ts`.
- Test names describe observable behavior and failure recovery.

**Structure:**

```text
tests/
  unit/
    archive.test.mjs
    creative-projects.test.mjs
    experience.test.mjs
    game-artifacts.test.mjs
    game-story.test.mjs
    listening.test.mjs
    media.test.mjs
  e2e/
    album-catalog.spec.ts
    archive.spec.ts
    baseline.spec.ts
    content-packages.spec.ts
    creative-projects.spec.ts
    experience.spec.ts
    game-artifacts.spec.ts
    listening-room.spec.ts
    mctrumps-catalog.spec.ts
    media-layout.spec.ts
    press.spec.ts
    quotes.spec.ts
    tool-layout-stability.spec.ts
  fixtures/
    creative/
    media/
    listening-site.mjs
```

## Test Structure

**Suite Organization:**

`tests/unit/media.test.mjs` directly imports pure library functions and asserts public results:

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import { validateWatchSlugs } from '../../src/lib/media.ts';

test('public episode/video watch slugs cannot collide', () => {
  assert.throws(() => validateWatchSlugs([
    { id: 'episode', data: { slug: 'same' } },
    { id: 'video', data: { slug: 'same' } },
  ]), /Duplicate public watch slug/);
});
```

**Patterns:**
- Keep object factories close to the tests; `tests/unit/media.test.mjs` creates minimal track records and `tests/unit/archive.test.mjs` builds a mixed public/draft catalog.
- Clone input before pure transforms and assert it remains unchanged.
- Cover empty data, hidden/draft lifecycle, duplicate IDs, malformed portable files, finite positions and changed source hashes.
- Use explicit `browser.newContext({ javaScriptEnabled: false })` for progressive-enhancement checks and close the context after use.
- `tests/e2e/listening-room.spec.ts` starts its isolated fixture server in `beforeAll` and closes it in `afterAll`.
- `playwright.config.ts` serves real `dist/` through Astro preview and disallows reusing an unrelated local server.

## Mocking

**Framework:** handwritten boundary doubles and Playwright request interception; no Jest/Vitest mock framework is configured.

**Patterns:**

`tests/unit/listening.test.mjs` exercises storage failures through a deliberately denied boundary:

```javascript
const denied = {
  getItem() { throw Error(); },
  setItem() { throw Error(); },
  removeItem() { throw Error(); },
};
assert.equal(readResume(denied, queue).position, null);
assert.equal(writeResume(denied, queue[0], 10, stamp).ok, false);
assert.equal(clearResume(denied).ok, false);
```

`tests/e2e/media-layout.spec.ts` intercepts YouTube document loads with a minimal provider response and checks the facade's activation/source behavior. It also aborts `**/_media/**` to test readable image fallbacks.

**What to Mock:**
- External provider documents for deterministic facade checks.
- Storage denial, quota exhaustion and rejected browser capabilities when testing recovery.
- Image transport failure when testing the fallback state.

**What NOT to Mock:**
- Public route generation, actual file serving and generated HTML.
- Local image dimensions, image decode, MP4 playback time or native audio ended events.
- Catalog ordering/counts and links between Album, Watch, Deep Cuts and Gallery.
- Source-byte hashes and responsive-image metadata.

A YouTube facade test proves local activation and provider URL behavior; it does not prove authenticated provider availability or end-to-end external playback.

## Fixtures and Factories

**Test Data:**

`scripts/verify-fixtures.mjs` writes content frontmatter into a disposable cloned site:

```javascript
const content = (collection, id, data) => {
  const folder = join(fixture, 'src/content', collection);
  mkdirSync(folder, { recursive: true });
  writeFileSync(join(folder, id + '.md'),
    `---\n${Object.entries(data).map(([key, value]) =>
      `${key}: ${JSON.stringify(value)}`).join('\n')}\n---\n\nFixture creative note.\n`);
};
```

**Location:**
- Portable-project legacy examples: `tests/fixtures/creative/broadcast-v1.json` and `studio-v2.json`.
- Synthetic H.264 MP4 files: `tests/fixtures/media/landscape.mp4`, `portrait.mp4`, `square.mp4`; respective dimensions 160x90, 90x160 and 100x100.
- Timed text: `tests/fixtures/media/captions.vtt`.
- Synthetic audio-site generator: `tests/fixtures/listening-site.mjs`.

**Isolation:**
- `scripts/verify-fixtures.mjs` copies source/config/public assets into an OS temporary directory, installs its own exact lockfile and sets `cacheDir: './.astro-cache/'` only in that clone.
- Fixture builds do not share `node_modules`, generated types or content caches with the production checkout.
- `tests/fixtures/listening-site.mjs` omits the production video/gallery catalogs and unrelated heavy media, then creates silent PCM WAVs and focused track records.
- Logs and fixture outputs remain in the temporary directory for diagnosis.
- `npm run verify` rebuilds production after fixtures, and output validation rejects leaked synthetic fixture content.
- Never copy synthetic fixture tracks/videos into production `src/content/` or fixture MP4s into production `public/`.

## Coverage

**Requirements:** no statement/branch/function/line percentage threshold is enforced in `package.json` or `playwright.config.ts`.

**View Coverage:**
- No built-in coverage report is configured.
- Read individual behavioral suites under `tests/unit/` and `tests/e2e/`.
- Use `playwright-report/` and `test-results/` for browser results, failure screenshots and retained failure traces.

**Measured verification evidence:**
- `/tmp/boh-confidence-verify.log` records 45 Node tests passed, 0 failed, and 80 Chromium tests passed.
- The same run records fixture lifecycle checks, three actual decoded video orientations, WebVTT cues and rejected invalid public-video/duplicate-route builds.
- Production generation records 208 original image entries and 626 WebP derivatives.
- Output validation records 199 HTML files and 11,987 local references.
- Astro check summary is 0 errors, 0 warnings and 135 hints. Do not report those hints as zero diagnostic output.
- This log proves local validation of the checked-out revision; it does not establish deployment.

## Test Types

**Unit Tests:**
- `tests/unit/media.test.mjs`: lifecycle visibility, deterministic order, duration conversion and duplicate route rejection.
- `tests/unit/archive.test.mjs`: mixed collection adaptation, search, draft suppression, ID collision resistance and nonmutating transforms.
- `tests/unit/listening.test.mjs`: queue boundaries, resume validation, storage errors and same-URL replacement invalidation.
- `tests/unit/creative-projects.test.mjs`: legacy file support, complete schema validation, template collision handling, literal variables and UTF-8 size boundaries.

**Integration Tests:**
- `scripts/verify-fixtures.mjs`: isolated compiled content, invalid-build rejection and real Chromium media decoding/ending with captions.
- `scripts/verify-media.mjs`: SHA-256 source preservation, WebP decode/metadata, aspect ratios, file sizes and no upscaling.
- `scripts/check-output.mjs`: production asset/routes/metadata contract.
- `scripts/smoke-site.mjs`: read-only deployed-route, CNAME and content checks, separately from local validation.

**E2E Tests:**
- `playwright.config.ts`: Chromium only, two workers, 45-second default tests, one CI retry and no local retries; failure traces/screenshots retained.
- Baseline layout tests exercise 320, 390, 768 and 1440px viewports.
- `tests/e2e/content-packages.spec.ts`: all 32 Deep Cuts routes, first/last native playback, all 47 full gallery images, dialog navigation/focus, downloads and non-JavaScript detail links.
- Album, McTrumps, Press and Quotes suites check their concrete catalog/content behavior.
- Creative-tool, Experience and game suites test completed workflows and failure recovery.
- `tests/e2e/listening-room.spec.ts` tests real native audio state and ended advancement in a dedicated built fixture site while ensuring production honestly has no standalone audio catalog.
- `lighthouserc.json` defines 12 explicit mobile audit routes with three runs and median budgets; Lighthouse is a separate performance/accessibility/SEO gate.

## Common Patterns

**Async Testing:**

`tests/e2e/content-packages.spec.ts` polls actual native playback instead of a fixed delay:

```typescript
await player.evaluate(async (video: HTMLVideoElement) => {
  video.muted = true;
  await video.play();
});
await expect.poll(() =>
  player.evaluate((video: HTMLVideoElement) => video.currentTime)
).toBeGreaterThan(0.1);
await player.evaluate((video: HTMLVideoElement) => video.pause());
```

**Error Testing:**
- Use `assert.throws` against specific error messages for invalid public data.
- Assert a rejected fixture build exits nonzero and contains the intended validation reason, as in `scripts/verify-fixtures.mjs`; unrelated build failures are not accepted.
- Simulate storage/image failure, then assert original state and readable fallback remain usable.
- Keep native media decoding real and wait for `readyState`, caption cues, `currentTime` or `ended` rather than synthesizing success events.
- Test no-JavaScript routes and keyboard focus restoration alongside enhanced interactions.

---

*Testing analysis: 2026-10-13*


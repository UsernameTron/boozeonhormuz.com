# DevOps Handoff — boozeonhormuz.com

## Project summary

Static Astro 6.4.2 site targeting GitHub Pages on `boozeonhormuz.com`. The local library contains 97 videos: a 27-song video album, 32 Deep Cuts performances, seven music videos, nine sketches, fifteen shorts and seven McTrumps company videos. Gallery contains 113 images plus seven original exhibits, for 120 artworks. Products, Quotes, biography, Press, two creative apps and the game remain available. There is no server-side application runtime or database. Confirm the deployed SHA before treating branch content as live.

**Release authority, October 19, 2026:** Connor approved staging, committing, pushing and GitHub Pages publication of the reviewed batch on `codex/evidence-feature-mctrumps`. It includes the Evidence feature, McTrumps additions and department hub, navigation simplification and Gallery removal. Start with [the current handoff](../COWORK_HANDOFF.md). The existing PR, Release validation and Pages workflow govern publication; verify the final Actions revision and live playback. The three separately held attachments remain outside this release.

The prior release record reports PR [#69](https://github.com/UsernameTron/boozeonhormuz.com/pull/69), main merge `32d5d995e9c2ce405f0291731dc88b3185f7b463` and successful [Pages run 39157830029](https://github.com/UsernameTron/boozeonhormuz.com/actions/runs/39157830029). That is saved release evidence, not a fresh production check during this documentation sync. Recheck the deployed revision when publication is requested.

## Environment requirements

| Requirement | Value |
|---|---|
| Node (local) | >=22.12.0; Node 24 recommended |
| Node (CI) | 24 (`.nvmrc`, `actions/setup-node`) |
| Package manager | npm (lockfile committed; CI uses `npm ci`) |
| Hosting | GitHub Pages, source = "GitHub Actions" (`build_type: workflow`) |
| Repo | `github.com/UsernameTron/boozeonhormuz.com` (public) |

## How to run

```bash
npm ci
npm run dev       # http://localhost:4321
npm run build     # → dist/
npm run preview
npx astro check   # typecheck gate
npx playwright install chromium
npm run verify   # all deterministic source/content/build/browser checks
npm run test:lighthouse # three mobile runs on each explicit route
```

## Deployment flow

- **PRs:** validate source and production output only. No Pages deployment job can run for a pull-request event.
- **Release trigger:** push to `main`, or `workflow_dispatch` explicitly on `main`. Other manually selected branches can validate but cannot deploy.
- **Build job:** `npm ci` → install Chromium → `npm run verify`. Verification checks types, media-helper unit tests, a disposable catalog build, the production build, output contracts and real-browser flows.
- **Artifact identity:** the build job uploads the already verified `dist/` as `validated-site` and, only for release events, the Pages artifact. The reusable Lighthouse workflow downloads `validated-site`; it does not rebuild. Both validations must succeed before deployment consumes the previously uploaded Pages artifact.
- **Named gate:** `Release validation` fails if either build/browser or Lighthouse validation failed, was skipped, or was cancelled. Owner action after approval: require this check in the existing `main` protection/ruleset. This branch does not set repository rules.
- **Concurrency:** production uses the existing `pages` group with `cancel-in-progress: false`; PR validation uses a per-PR group.
- **Domain:** `public/CNAME` must remain exactly `boozeonhormuz.com`; it ships in `dist/` and is asserted. Check live DNS/TLS in the hosting dashboard when needed; historic certificate dates and old setup notes are not current status.
- **Permissions:** validation has `contents: read`. Only the deployment job receives `pages: write` and `id-token: write` in the `github-pages` environment.
- **Post-deployment smoke:** only after a successful main release, `scripts/smoke-site.mjs` reads the deployed Pages URL. It checks 18 routes including `/CNAME`, homepage canonical, premiere metadata, McTrumps entries, collection links, Gallery, Explore and the final custom-domain hostname. Up to three attempts use 10-second request timeouts and 5-second propagation delays. A failure marks the deployment job unsuccessful but does not undo the already completed deployment, rebuild output or mutate hosting. Inspect the release and live site before deciding on an owner-approved recovery. Verify this script locally with `node scripts/smoke-site.mjs --origin http://127.0.0.1:4334 --attempts 1`; local loopback skips only the final-hostname match. The current script expects the McTrumps hub and all seven company records.

The owner must explicitly approve push/publication. Once approved, use a reviewed feature-branch PR, verify the required checks and deployment status, then inspect the live premiere and important routes. Do not bypass failing checks to ship.

## Test and report contracts

Fresh documentation-sync measurements on October 18: package version `0.0.1`, nine typed collections, 22 primary pages, seven unit-test files and seventeen browser-test files. `npm run test:unit` passed 46 tests with zero failures, skips or cancellations. The Node test runner reports zero named suites because these are top-level tests; do not describe them as 46 suites or invent an assertion count. There is no `npm test`, coverage or lint script. GSD command, agent and plugin-skill directories are absent from this website repository and their counts are not product statistics.

Earlier local implementation validation on October 18 passed diagnostics, isolated fixtures, a 267-page build, the 270-HTML/13,596-reference output audit, the 355-source responsive-media audit and all 17 local smoke routes. Browser evidence is 104 passes plus one stale count expectation fixed and passed in a focused rerun against the same preview, accounting for 105 cases across runs. This is not a single clean full-suite run. All three new browser MP4 copies fully decoded; the featured film played for over 63 seconds and both square commercials played with pause coordination. These full checks were not repeated during this documentation-only pause; originals and screenshots are recorded in the external local-review folder linked from the current handoff. Fresh release validation remains necessary before a later publication.

`npm run test:unit` covers draft/hidden filtering, track ordering, page eligibility, video ordering, image visibility and duration conversion. `npm run test:fixtures` creates a temporary project with its own locked dependencies, `.astro` types and `.astro-cache/data-store.json`. It copies `scripts/` and runs `npm run build`, including hooks, against draft/hidden/unreleased/preview/released tracks, a silent WAV, local/YouTube video metadata in three orientations, and public/draft images. Missing audio and artwork are legitimate states. Three tiny synthetic H.264 MP4 fixtures exercise real Chromium metadata, landscape/portrait/square dimensions, paused initial state, inline playback, decoded completion and timed WebVTT cues. Temporary paths and logs are printed for debugging; no test content is written into the real catalog.

`npm run check:output` checks the domain, sitemap, canonicals, local HTML/CSS asset and page references, premiere source and structured data, all explicit audit routes, and absence of fixture titles after the production rebuild. Source-less public videos and duplicate episode/video watch slugs now fail the build, and disposable negative fixtures require those failures. `npm run check:media` verifies original source hashes and derivative dimensions after the production build.

`npm run test:e2e` starts its own production preview on `BOH_TEST_PORT` (default 4321), refuses a pre-existing server, and uses two Chromium workers. It captures all 12 critical routes at 320, 390, 768 and 1440 pixels, checks horizontal overflow and headings, navigates/filter/empty states, activates the premiere facade, round-trips creative JSON imports/exports, checks safe text rendering and modal Escape/focus, and starts/resets the game with reduced-motion Calm Seas enabled. Additional cases exercise artwork viewer history and focus, game completion/report artifacts, the real audio queue and optional resume, and portable projects including output snapshots, byte limits, merge/undo and storage failures. Provider requests are stubbed, so the suite does not claim that real external playback works. Manually activate the real premiere before publication.

Lighthouse audits `/`, `/album/`, `/watch/`, `/watch/the-premiere/`, `/listen/`, `/archive/`, `/play/`, both tool wrappers, and all three `/apps/*.html` files. Three mobile runs per route are retained, and every assertion entry explicitly uses their median. Performance floors of 90–95, route-specific LCP limits, CLS <=0.1 and TBT <=200 ms block regressions. Accessibility >=90 blocks; SEO >=90 blocks on site pages and warns on standalone apps. Best practices >=90 remains a warning. See [PERFORMANCE-BASELINE.md](PERFORMANCE-BASELINE.md) for all measured values, budget rationale and frozen-build provenance. LCP of 2.5 seconds remains the experience target; the larger release limits allow lab regression headroom. Hardware, network and external thumbnails can affect lab scores; investigate variance before a reviewed budget change.

Artifacts: `validated-site` and `lighthouse-reports` are retained for 30 days; `browser-reports` for 14. Local equivalents are ignored by Git: `dist/`, `.lighthouseci/`, `playwright-report/`, `test-results/`. No reports are uploaded to temporary public storage.

## Rollback

At each approved release record the commit SHA, successful Actions run URL and both the Pages/validated-site artifact IDs. Retained artifacts establish what was tested and provide short-term recovery evidence; keep any required long-term release record outside the 30-day retention window.

For a source rollback, create a feature branch reverting only the faulty product changes, preserve the validation workflow, and submit an approved PR. Rebuild and run every release check, compare CNAME and critical routes, then deploy through the same gated flow. Do not force-push, change DNS or rerun an obsolete deployment workflow that bypasses validation. If an incident requires direct artifact restoration, obtain explicit owner approval and confirm the archived artifact belongs to the known-good run before taking any hosting action.

## Configuration reference

| File | Purpose |
|---|---|
| `astro.config.mjs` | `site` = apex domain, `output: 'static'`, Tailwind Vite plugin |
| `src/content.config.ts` | 9 typed content collections |
| `.nvmrc` | CI/local Node parity (24) |
| `public/CNAME` | custom-domain marker |
| `.github/workflows/deploy.yml` | source/browser validation and gated artifact deployment |
| `.github/workflows/lighthouse.yml` | reusable audit of the downloaded validated artifact |
| `playwright.config.ts` | dedicated production browser server and retained failure reports |
| `lighthouserc.json` | explicit 12-route mobile audit and budgets |

No application environment variables or API credentials are required. `BOH_TEST_PORT`, `CI` and `CHROME_PATH` only configure local/CI verification.

## Security notes

- Repo is **public** by owner decision — includes planning docs and build tooling. A credential scan ran clean before first push; keep it clean (no tokens/keys in tracked files).
- Workflow consumes no untrusted `github.event.*` input → no injection surface.
- `permissions:` are scoped to the job that needs them. Do not add deployment credentials to PR validation.

## Historical foundation baseline

This table records checks before the earlier product implementation. Its placeholder and test counts do not describe the current catalogue.

| Aspect | State |
|---|---|
| Existing source install/typecheck/build | Passed before product edits |
| Existing browser routes | 10 tests passed; 48 responsive screenshots captured |
| Original local asset references | Nine intended placeholder images requested missing files; integrated media components now resolve these as placeholders without broken requests |
| Public video contracts | Source-less public video and duplicate watch slugs now fail the build, backed by negative fixtures |
| Release validation | Source workflow gates the validated artifact; confirm deployed SHA and configure the named required check with owner approval |

## Known tech debt / constraints

- **`@tailwindcss/vite` pinned to 4.2.0** — do NOT bump to 4.3.x until Astro ships a Vite 8 line; 4.3 hard-deps Vite 8 and breaks the build against Astro's Vite 7 (`Missing field tsconfigPaths`).
- The baseline `astro check` passes with existing schema deprecation warnings. No lint command exists.
- Historical dependency reports, including the October 13 confidence report, contain audit findings from older revisions. No fresh dependency audit was run during this documentation-only pause. Recheck the actual release revision before claiming those findings remain or are resolved. Handle remediation as a separately reviewed change, not `npm audit fix --force` during a visual release.
- Legacy `RUNBOOK.md` is historical scaffolding guidance. Do not follow its old framework/hosting choices against the existing project.

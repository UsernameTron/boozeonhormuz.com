# DevOps Handoff — boozeonhormuz.com

## Project summary

Static Astro 6.4.2 site deployed to GitHub Pages on the apex domain `boozeonhormuz.com`. The site has a public premiere, album shell, seven exhibits, two creative apps and a game. There is no server-side application runtime or database.

**Release state, September 6, 2026:** the workflow and verification changes described below are local implementation, pending owner approval to push/publish. No DNS, Pages environment, branch-protection or production settings were changed. The pre-change reference is `b906b87b0a18e0102d8a0afdc7c2190666e8474a`, which builds successfully locally; record the actual deployed SHA and Actions artifact IDs at release time.

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

## Prepared deployment flow

- **PRs:** validate source and production output only. No Pages deployment job can run for a pull-request event.
- **Release trigger:** push to `main`, or `workflow_dispatch` explicitly on `main`. Other manually selected branches can validate but cannot deploy.
- **Build job:** `npm ci` → install Chromium → `npm run verify`. Verification checks types, media-helper unit tests, a disposable catalog build, the production build, output contracts and real-browser flows.
- **Artifact identity:** the build job uploads the already verified `dist/` as `validated-site` and, only for release events, the Pages artifact. The reusable Lighthouse workflow downloads `validated-site`; it does not rebuild. Both validations must succeed before deployment consumes the previously uploaded Pages artifact.
- **Named gate:** `Release validation` fails if either build/browser or Lighthouse validation failed, was skipped, or was cancelled. Owner action after approval: require this check in the existing `main` protection/ruleset. This branch does not set repository rules.
- **Concurrency:** production uses the existing `pages` group with `cancel-in-progress: false`; PR validation uses a per-PR group.
- **Domain:** `public/CNAME` must remain exactly `boozeonhormuz.com`; it ships in `dist/` and is asserted. Check live DNS/TLS in the hosting dashboard when needed; historic certificate dates and old setup notes are not current status.
- **Permissions:** validation has `contents: read`. Only the deployment job receives `pages: write` and `id-token: write` in the `github-pages` environment.

The owner must explicitly approve push/publication. Once approved, use a reviewed feature-branch PR, verify the required checks and deployment status, then inspect the live premiere and important routes. Do not bypass failing checks to ship.

## Test and report contracts

`npm run test:unit` covers draft/hidden filtering, track ordering, page eligibility, video ordering, image visibility and duration conversion. `npm run test:fixtures` creates a temporary project with its own locked dependencies, `.astro` types and `.astro-cache/data-store.json`. It copies `scripts/` and runs `npm run build`, including hooks, against draft/hidden/unreleased/preview/released tracks, a silent WAV, local/YouTube video metadata in three orientations, and public/draft images. Missing audio and artwork are legitimate states. The local MP4 fixture checks markup and source selection only, not video decoding. Temporary paths and logs are printed for debugging; no test content is written into the real catalog.

`npm run check:output` checks the domain, sitemap, canonicals, local HTML/CSS asset and page references, premiere source and structured data, all explicit audit routes, and absence of fixture titles after the production rebuild. Invalid source-less public videos and duplicate episode/video watch slugs are identified content-contract gaps pending validation work; do not add tests treating them as desirable behavior.

`npm run test:e2e` starts its own production preview on `BOH_TEST_PORT` (default 4321), refuses a pre-existing server, and uses two Chromium workers. It captures all 12 critical routes at 320, 390, 768 and 1440 pixels, checks horizontal overflow and headings, navigates/filter/empty states, activates the premiere facade, round-trips creative JSON imports/exports, checks safe text rendering and modal Escape/focus, and starts/resets the game with reduced-motion Calm Seas enabled. Provider requests are stubbed, so the suite does not claim that real external playback works. Manually activate the real premiere before publication. Game completion and new features have additional tests as their implementation lands.

Lighthouse audits `/`, `/album/`, `/watch/`, `/watch/the-premiere/`, `/listen/`, `/archive/`, `/play/`, both tool wrappers, and all three `/apps/*.html` files. Three mobile runs per route are retained. Accessibility >=90 blocks; SEO >=90 blocks on site pages and warns on standalone apps. Performance >=90 and best practices >=90 warn. Do not turn the aspirational performance target into a blocking requirement until measurements establish attainable per-route budgets and the integrated changes meet them. Hardware, network and external thumbnails can affect lab scores.

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

## Baseline findings

| Aspect | State |
|---|---|
| Existing source install/typecheck/build | Passed before product edits |
| Existing browser routes | 10 tests passed; 48 responsive screenshots captured |
| Existing local asset references | Nine intended placeholder images still requested missing files on about/products/sponsor pages; output check stays failing until repaired |
| Content validation gaps | Source-less public video and duplicate watch slugs require rejection rules |
| Release validation in branch | Prepared; production activation and required-check settings await owner approval |

## Known tech debt / constraints

- **`@tailwindcss/vite` pinned to 4.2.0** — do NOT bump to 4.3.x until Astro ships a Vite 8 line; 4.3 hard-deps Vite 8 and breaks the build against Astro's Vite 7 (`Missing field tsconfigPaths`).
- The baseline `astro check` passes with existing schema deprecation warnings. No lint command exists.
- The original install reports 13 dependency audit findings; pinned test tooling adds transitive audit findings. No existing dependency major version was upgraded. Handle dependency remediation as a separately reviewed change, not `npm audit fix --force` during a visual release.
- Legacy `RUNBOOK.md` is historical scaffolding guidance. Do not follow its old framework/hosting choices against the existing project.

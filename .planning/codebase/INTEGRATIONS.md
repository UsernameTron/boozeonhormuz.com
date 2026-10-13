# External Integrations

**Analysis Date:** 2026-10-13

## APIs & External Services

**Video playback:**
- YouTube supplies the premiere identified by `Za2XII66eHQ` in `src/content/videos/the-premiere.md`. `src/pages/studio.astro` uses that premiere as the interim reel while its dedicated reel ID is empty.
  - SDK/Client: `@astro-community/astro-embed-youtube` 0.5.10 in `package.json`, used by `src/components/YouTubeEmbed.astro`.
  - Auth: no provider API token is configured or needed for public embeds in `src/components/YouTubeEmbed.astro`.
- Self-hosted MP4 media is declared in `src/content/videos/`, including `src/content/videos/album-05-luxury-compliance.md` and `src/content/videos/mctrumps-appreciation.md`; `src/pages/watch/[slug].astro` wires those records to `src/components/LocalVideo.astro`.

**Inquiries:**
- The Studio form composes a message in the visitor's mail application using `mailto:`; it does not submit to an email service or server. `src/pages/studio.astro` addresses inquiries to `imbeddedjournalist@gmail.com` and encodes the subject and body client-side.
- Legal contact is a direct `mailto:admin@boozeonhormuz.com` link in `src/pages/legal.astro`. Its existence does not establish mailbox delivery or monitoring.

**Optional analytics:**
- Cloudflare Web Analytics is an inactive integration stub in `src/layouts/BaseLayout.astro`: `CF_BEACON_TOKEN` is empty, so the conditional external beacon script is not rendered.
  - SDK/Client: conditional `https://static.cloudflareinsights.com/beacon.min.js` script in `src/layouts/BaseLayout.astro`.
  - Auth: the file's public beacon identifier constant is unset. Do not describe Cloudflare analytics as collecting site data until a configured beacon and deployed output are verified.

## Data Storage

**Databases:**
- No database or ORM dependency is declared in `package.json`; `astro.config.mjs` selects static output and `src/content.config.ts` loads Markdown/YAML content from repository files.

**File Storage:**
- Publication content is stored in repository-backed files and delivered with static assets: `src/content.config.ts` loads collections, and video records refer to `public/video/` or `public/mctrumps/` through root-relative URLs.
- `scripts/generate-media.mjs` generates responsive WebP variants in `public/_media/` and their manifest in `src/lib/generated-media.json`.
- Optional device-local creative saves and portable JSON export/import are implemented in `public/apps/project-kit.js`; no network persistence is used by that module.
- `src/lib/listening.ts` reads, validates, saves and clears optional resume positions through the supplied browser `Storage` object. `public/apps/exit-strategy-artifacts.js` similarly stores completed game reports through a supplied `Storage` object.

**Caching:**
- No shared application cache service is configured in `package.json` or `astro.config.mjs`.
- Dependency caching in CI uses the npm cache option of `actions/setup-node@v4` in both `.github/workflows/deploy.yml` and `.github/workflows/lighthouse.yml`.
- Image variant names include a hash of source bytes and encoding settings in `scripts/generate-media.mjs`; this supplies deterministic invalidation for changed images.

## Authentication & Identity

**Auth Provider:**
- No visitor authentication provider is declared in `package.json` or implemented as an API/auth route under `src/pages/`; the site is generated as public static output by `astro.config.mjs`.
- Deployment uses GitHub Actions permissions in `.github/workflows/deploy.yml`: default content access is read-only, while the deploy job requests `pages: write` and `id-token: write` within the `github-pages` environment.
- Keep publication subject to the explicit owner approval documented in `CLAUDE.md` and to the release-check dependency in `.github/workflows/deploy.yml`.

## Monitoring & Observability

**Error Tracking:**
- No external error-reporting SDK is declared in `package.json`; browser traces/screenshots and CI artifacts provide test diagnostics through `playwright.config.ts` and `.github/workflows/deploy.yml`.

**Logs:**
- Build-time scripts emit command output, including responsive asset totals in `scripts/generate-media.mjs` and media validation results in `scripts/verify-media.mjs`.
- `.github/workflows/deploy.yml` retains browser reports for 14 days and validated site output for 30 days. `.github/workflows/lighthouse.yml` retains Lighthouse reports for 30 days.
- Cloudflare beacon telemetry remains inactive because its constant in `src/layouts/BaseLayout.astro` is empty.

## CI/CD & Deployment

**Hosting:**
- GitHub Pages serves the static `dist/` artifact at `boozeonhormuz.com`; the domain is set by `public/CNAME` and the site origin in `astro.config.mjs`.
- `.github/workflows/deploy.yml` publishes through `actions/deploy-pages@v4` only for main-branch events that are not pull requests, after validation dependencies succeed.

**CI Pipeline:**
- `.github/workflows/deploy.yml` responds to pull requests, main pushes and manual dispatch. Node 24, `npm ci` and Playwright Chromium support `npm run verify` from `package.json`.
- The exact validated `dist/` is uploaded as `validated-site` and downloaded by the reusable `.github/workflows/lighthouse.yml`; Lighthouse audits the same output that passes source/media/browser checks.
- `Release validation` requires successful build and Lighthouse jobs before deployment in `.github/workflows/deploy.yml`; validation failures must not be bypassed.
- After Pages deployment, `.github/workflows/deploy.yml` runs `scripts/smoke-site.mjs` against the returned deployment URL to verify routes and custom-domain behavior.

## Environment Configuration

**Required env vars:**
- No third-party service credential is required by the npm command definitions in `package.json` or the static build config in `astro.config.mjs`.
- `BOH_TEST_PORT` optionally overrides the preview port in `playwright.config.ts`; `CI` controls focused-test rejection and retries.
- `CHROME_PATH` is derived from the installed Playwright Chromium executable by `.github/workflows/lighthouse.yml`.
- `DEPLOYED_URL` is populated from the Pages deployment action output by `.github/workflows/deploy.yml` and used for the smoke script.
- `BUILD_RESULT` and `LIGHTHOUSE_RESULT` in `.github/workflows/deploy.yml` are job-result strings for the release gate, not external service secrets.

**Secrets location:**
- The inspected deployment workflows do not reference named repository secret values. GitHub-managed Pages authorization is expressed through job permission declarations in `.github/workflows/deploy.yml`.
- No credential files or environment-file contents were inspected. The deploy permissions in `.github/workflows/deploy.yml` establish the configured authorization boundary without exposing credential values.

## Webhooks & Callbacks

**Incoming:**
- No application webhook endpoint exists among the inspected `src/pages/` route inventory; `astro.config.mjs` produces a static site.
- GitHub event triggers in `.github/workflows/deploy.yml` are CI events, not deployed application endpoints.

**Outgoing:**
- The Studio inquiry handler opens a local mail client using `mailto:` in `src/pages/studio.astro`; it is not a server-side submission or delivery callback.
- `scripts/smoke-site.mjs` performs read-only HTTP fetches after CI deployment, triggered by `.github/workflows/deploy.yml`.
- YouTube playback loads an external player on interaction through `src/components/YouTubeEmbed.astro`; the site has no associated provider API callback.

---

*Integration audit: 2026-10-13*

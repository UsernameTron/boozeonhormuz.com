# Booze on Hormuz

A static Astro 6 site at [boozeonhormuz.com](https://boozeonhormuz.com) — a satirical luxury brand on the surface, the content archive for the *Who the Hell Is Don Biggly?* sketch series underneath.

> **Parody.** Booze on Hormuz and "Don Biggly" are works of satire and fiction. No affiliation with or statement of fact about any real person is intended or implied.

## Status

The Astro site is live. Its catalog currently contains the premiere video, album shell and seven Evidence Lounge exhibits; the intentionally unfinished music catalog supports incremental releases. These documents describe this revision. Confirm the deployed commit and successful Actions run before treating any change as live. Publishing changes requires explicit owner approval.

## Stack

- **Astro 6.4.2** (static, no adapter)
- **Tailwind 4.2.0** via `@tailwindcss/vite`
- **Fraunces + Inter** variable fonts, self-hosted (Fontsource)
- **GitHub Pages** + GitHub Actions (build once, validate, publish the same artifact)
- **Playwright** browser checks and **Lighthouse CI** mobile audits

## Install & run

```bash
npm ci            # install from the committed lockfile
npm run dev       # dev server at http://localhost:4321
npm run build     # static build → dist/
npm run preview   # preview the production build
npx astro check   # typecheck
npx playwright install chromium # once, for browser checks
npm run verify   # typecheck, unit/fixture tests, build/output audit, browser checks
```

Requires Node >=22.12.0; use Node 24 for CI parity (see `.nvmrc`). Dependencies are exactly pinned. No lint command is configured.

## Structure

```
src/content.config.ts   9 content collections (albums, tracks, videos, images + legacy content)
src/layouts/            BaseLayout (global shell + parody disclaimer)
src/components/         Nav, Footer, PageHeader, YouTubeEmbed, EvidenceCard, + typed cards
src/pages/              / · /evidence-lounge · /watch[/slug] · /products[/slug] ·
                        /sponsor-reads · /quotes · /about · /legal ·
                        /tools (hub) + /tools/broadcast-room + /tools/evidence-lounge-studio + /tools/safety
src/styles/global.css   Tailwind entry + brand design tokens
public/apps/            standalone visitor prompt-generator tools (iframe-embedded by /tools)
public/fonts/           self-hosted tool fonts (Archivo/Inter/JetBrains Mono, vendored woff2)
public/                 static assets + CNAME (custom domain)
.github/workflows/      deploy pipeline + Lighthouse CI
scripts/               disposable-fixture builds and production-output validation
tests/                 media lifecycle unit tests + browser regression suite
.planning/              project planning (GSD)
```

The media routes are `/album`, `/album/<slug>`, `/listen`, `/watch`, `/watch/<slug>` and `/archive`. `/play` embeds the standalone game. The original standalone landing page remains at `/experience`.

## Creative Tools

`/tools` hosts two browser-only prompt generators for the *Don Biggly* satire — the **Biggly Broadcast Pack Generator** (one brief → a full content kit) and the **Evidence Lounge Prompt Generator** (a 20-template workbench). They produce copy-ready prompts for Suno / Sora / Veo / Gemini / ChatGPT / Claude — no login, no API key, no backend, nothing stored on a server.

This revision adds reviewed portable-project imports, merge/undo for custom templates, explicit opt-in device saving, a Broadcast-to-Studio file handoff, and a real 30-second vertical Shorts/Reels preset with a five-shot manifest. See [creative project files](docs/CREATIVE-PROJECTS.md) for compatibility, storage and output contracts. Confirm publication status as described above.

## Verification and deploy

Run `npm run verify` locally against a clean install. The fixture test creates a separate temporary copy with its own dependencies and Astro cache, so test content never enters the production catalog. `npm run check:output` checks critical routes, canonical tags, sitemap, custom domain and local asset references. Browser screenshots and failure traces are retained under `test-results/`; open the HTML report with `npx playwright show-report`.

`npm run test:lighthouse` runs three mobile audits on each of 12 explicit routes. Point `CHROME_PATH` at a Chrome installation if it is not auto-detected. Reports stay in `.lighthouseci/`; accessibility and site-page SEO are blocking, while performance remains a 90-point warning until measured release budgets are approved.

The workflow validates pull requests without publishing. Approved changes reaching `main` (or a manual run on `main`) must pass **Release validation** before Pages can deploy the exact validated build. Adding that named check to branch protection is an owner settings step, not a change this branch makes. See [DevOps handoff](docs/DEVOPS-HANDOFF.md) for release, approval and rollback details.

## Author

C. Pete Connor.

# Booze on Hormuz

A static Astro 6 site at [boozeonhormuz.com](https://boozeonhormuz.com) — a satirical luxury brand on the surface, the content archive for the *Who the Hell Is Don Biggly?* sketch series underneath.

> **Parody.** Booze on Hormuz and "Don Biggly" are works of satire and fiction. No affiliation with or statement of fact about any real person is intended or implied.

## Status

This local revision contains a 27-song video album by Don Biggly & The Indictments, 32 additional Deep Cuts Live performances, 113 Gallery images, seven music videos, nine sketches, fifteen shorts, seven McTrumps company videos, twelve quotes, five illustrated products, a portrait biography, and a news broadcast. The Evidence Is With Me is the homepage feature; Hush Money Is Philanthropy remains in Music Videos. Watch requires a media type selection. The seven original Evidence Lounge exhibits remain available, bringing Gallery to 120 artworks. These documents describe this revision; verify the deployed commit and successful Actions run to establish live status. Connor approved publication of this batch on October 19, 2026; the existing release checks and GitHub Pages workflow apply.

**Release approved October 19, 2026:** the reviewed batch is on `codex/evidence-feature-mctrumps`. Confirm its merged revision and successful deployment in GitHub Actions. Start a fresh session with [COWORK_HANDOFF.md](COWORK_HANDOFF.md), [.planning/HANDOFF.json](.planning/HANDOFF.json) and [.planning/STATE.md](.planning/STATE.md). The three additional files left for later are on hold. The current preview is http://127.0.0.1:4334/.

McTrumps has its own tab and compact `/mctrumps/` hub: “Billions served. Books cooked.” One Welcome player introduces the company; six videos are grouped into Customer Relations, Corporate Leadership and International Expansion. The closed Company office preserves complaints, related businesses and empty future records. Watch keeps one card opening this hub; `/sponsor-reads/` forwards legacy links. All seven video pages retain native playback and existing YouTube alternatives. The Album remains accessible through Watch. “The Red Tie” has been removed from Gallery; original media remain intact.

Large video delivery: six full-quality MP4 copies are preserved under `media/` in Git and served from the [verified GitHub media release](https://github.com/UsernameTron/boozeonhormuz.com/releases/tag/site-media-2026-10-19). They stay outside `public/` so the complete site fits the GitHub Pages 1 GB limit. Catalogue URLs use those assets through the existing players and YouTube alternatives. Original source masters remain intact. `check:output` rejects packages larger than 1,000,000,000 bytes. See `media/README.md`.

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
src/pages/              / · /album[/slug] · /deep-cuts · /watch[/slug] · /gallery · /art/[id] ·
                        /archive · /listen · /explore · /experience · /play · /studio · /press ·
                        /evidence-lounge · /products[/slug] · /mctrumps · /quotes · /about · /legal ·
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

The media routes are `/album`, `/album/<slug>`, `/deep-cuts`, `/gallery`, `/art/<id>`, `/listen`, `/watch`, `/watch/<slug>` and `/archive`. The album and Deep Cuts are video collections; separate audio is optional. Gallery images support enlargement, previous/next navigation, downloads, and ordinary detail links without JavaScript. `/play` embeds the standalone game. `/experience` is the fictional resort presentation, with connected qualification, membership, amenity and financing choices, plus an exportable ownership record. Episode teasers were removed at the owner's request. Its dialogue is in `docs/experience-script.md`.

## Creative Tools

`/tools` hosts two browser-only prompt generators for the *Don Biggly* satire — the **Biggly Broadcast Pack Generator** (one brief → a full content kit) and the **Evidence Lounge Prompt Generator** (a 20-template workbench). They produce copy-ready prompts for Suno / Sora / Veo / Gemini / ChatGPT / Claude — no login, no API key, no backend, nothing stored on a server.

This revision adds reviewed portable-project imports, merge/undo for custom templates, explicit opt-in device saving, a Broadcast-to-Studio file handoff, and a real 30-second vertical Shorts/Reels preset with a five-shot manifest. See [creative project files](docs/CREATIVE-PROJECTS.md) for compatibility, storage and output contracts. Confirm publication status as described above.

## Verification and deploy

Run `npm run verify` locally against a clean install. The fixture test creates a separate temporary copy with its own dependencies and Astro cache, so test content never enters the production catalog. `npm run check:output` checks critical routes, canonical tags, sitemap, custom domain and local asset references. Browser screenshots and failure traces are retained under `test-results/`; open the HTML report with `npx playwright show-report`.

The October 18 documentation sync freshly measured 97 video records, 121 artworks, 27 tracks, nine typed collections, 22 primary pages and 355 responsive-media source records. Its fresh `test:unit` run passed all 46 tests. No `test`, `test:coverage` or lint script is configured; coverage is unavailable. Full build and browser evidence from the earlier local review is recorded in the [DevOps handoff](docs/DEVOPS-HANDOFF.md); it was not rerun for this documentation-only pause.

`npm run test:lighthouse` runs three mobile audits on each of 12 explicit routes. Point `CHROME_PATH` at a Chrome installation if it is not auto-detected. Reports stay in `.lighthouseci/`. Explicit median gates cover performance (at least 90), LCP, CLS, TBT, accessibility and site-page SEO. See the [measured mobile baseline and budgets](docs/PERFORMANCE-BASELINE.md) for route-specific limits and environment details.

The workflow validates pull requests without publishing. Approved changes reaching `main` (or a manual run on `main`) must pass **Release validation** before Pages can deploy the exact validated build. Adding that named check to branch protection is an owner settings step, not a change this branch makes. See [DevOps handoff](docs/DEVOPS-HANDOFF.md) for release, approval and rollback details.

## Author

C. Pete Connor.

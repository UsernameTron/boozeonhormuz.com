# PROJECT: boozeonhormuz.com

| Field | Value |
|---|---|
| **Domain** | boozeonhormuz.com |
| **Repo** | github.com/UsernameTron/boozeonhormuz.com |
| **Owner** | C. Pete Connor |
| **Created** | 2026-05-30 · **Reconciled** | 2026-05-31 |
| **Status** | M01 shipped; content approved and backed up; confidence verification blocks finalization |
| **Classification** | MULTI-MILESTONE |

---

## What This Is

A satirical luxury-brand website that is, underneath the premium veneer, the content archive hub for the *Who the Hell Is Don Biggly?* sketch series. Premium aesthetic on the surface; comedy content underneath. Don Biggly is a Donald Trump persona — the site hosts episodes, fake products, sponsor reads, quotes, and a polymorphic "Evidence Lounge" of clips, title cards, AI prompts, commercials, lower-thirds, gallery images, and songs.

## Core Value

**Distribution surface** for original satirical content under one brand universe, able to absorb an arbitrary number of episodes and artifact types without re-platforming. **Foundation pattern** for a future reusable multi-site website pipeline (M02) — if this build is clean, the next domain takes minutes, not a full session.

## Requirements

- The approved 27-song album plays as videos with on-screen lyrics; separate audio remains optional.
- Deep Cuts Live provides 32 additional performances in its own collection and Watch category.
- Gallery provides 47 uploaded stills with thumbnails, enlargement, navigation, downloads, and ordinary image detail pages.
- Watch displays videos only after visitors choose a media type.
- The biography, portrait, five products, McTrumps commercials, twelve quotes, news broadcast, and Legal contact are populated.
- Original uploads stay outside Git; all website delivery files are committed and recoverable from the repository.
- Release validation checks the exact output before publishing through GitHub Pages.
- A dedicated Studio reel and pipeline generalization remain future work.

## Scope

**In scope (current site)**
- Static Astro 6 site, deployed to GitHub Pages on the custom domain
- Nine content collections (one polymorphic) typed with Zod
- CI/CD via GitHub Actions with verified output, Lighthouse validation, and gated Pages deployment
- Self-hosted variable fonts, optimized image pipeline, lite-YouTube video pattern
- SEO + OG baseline, sitemap, robots, analytics, branch protection, HTTPS, legal pre-flight

**Deferred scope**
- Dedicated Studio reel and additional commercial presentation
- E-commerce, accounts, comments, forums, any server-side functionality
- Reusable pipeline generalization (M02)

## Constraints

- **Minimum effective steps.** No over-engineering. GSD ceremony stays proportional to a 1–3 session build.
- **All hosting free-tier indefinitely.** No paid services.
- **Content publication:** the completed content batch is owner-approved; confidence verification determines whether finalization may proceed.
- **Content posture:** satirical content depicting/quoting the real public figure is authored by the owner via the Suno/Sora suite, gated by `parody-safety-check`; the build itself is content-neutral infrastructure.

## Locked decisions

Astro 6.4.2 static · GitHub Pages · validated-artifact deployment · Tailwind 4.2.0 via `@tailwindcss/vite` (exact-pinned, `npm ci`) · 9 typed content collections · Fraunces + Inter variable fonts (Fontsource) · lite-YouTube · `astro-og-canvas` build-time OG cards. Installed versions and workflow files define the current implementation; `RESOLUTION.md` and root `RUNBOOK.md` retain the earlier decisions.

## Milestones

- **M01 — Launch Satire Hub:** foundation shipped; historical finalization is in `.planning/milestones/M01-launch-satire-hub/FINALIZATION.md`. The current approved content batch is maintenance work on this site, not a completion of M02.
- **M02 — Generalize the Website Pipeline:** extract the 6 build skills into a repeatable multi-site pipeline; validate on a second domain. *(stub — see ROADMAP.md)*

## Reference documents

- `RESOLUTION.md` — what changed and why (read first)
- `RUNBOOK.md` (repo root) — richest execution narrative; still valid as reference
- `booze on hormuz/` — the 6-skill build suite + `brand-pack.md` voice module
- Multi-skill website pipeline architecture — owner memory #22

# PROJECT: boozeonhormuz.com

| Field | Value |
|---|---|
| **Domain** | boozeonhormuz.com |
| **Repo** | github.com/UsernameTron/boozeonhormuz.com |
| **Owner** | C. Pete Connor |
| **Created** | 2026-05-30 |
| **Reconciled** | 2026-10-19 |
| **Status** | M01 shipped; reviewed maintenance release approved October 19, 2026 |
| **Classification** | MULTI-MILESTONE |

---

## What This Is

A satirical luxury-brand website that is, underneath the premium veneer, the content archive hub for the *Who the Hell Is Don Biggly?* sketch series. Premium aesthetic on the surface; comedy content underneath. Don Biggly is a Donald Trump persona — the site hosts episodes, fake products, sponsor reads, quotes, and a polymorphic "Evidence Lounge" of clips, title cards, AI prompts, commercials, lower-thirds, gallery images, and songs.

## Core Value

**Distribution surface** for original satirical content under one brand universe, able to absorb an arbitrary number of episodes and artifact types without re-platforming. **Foundation pattern** for a future reusable multi-site website pipeline (M02) — if this build is clean, the next domain takes minutes, not a full session.

## Requirements

- The approved 27-song album plays as videos with on-screen lyrics; separate audio remains optional.
- Deep Cuts Live provides 32 additional performances in its own collection and Watch category.
- Gallery provides 113 uploaded stills and seven Evidence Lounge exhibits, for 120 artworks with thumbnails, enlargement, navigation, downloads, and ordinary image detail pages.
- Watch provides six collection choices and displays category videos only after visitors choose a media type. The local library contains 97 videos: 27 album songs, 32 Deep Cuts, seven music videos, nine sketches, fifteen shorts and seven McTrumps company videos.
- The biography, portrait, five products, McTrumps commercials, twelve quotes, news broadcast, and Legal contact are populated.
- Original uploads stay outside Git. Previously published delivery files remain in Git; the approved delivery additions are included in the October 19 release batch. Confirm the successful push before claiming remote backup.
- The Evidence Is With Me is the local homepage feature. Hush Money Is Philanthropy retains its original page and Music Videos listing.
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
- **Content publication:** Connor approved staging, committing, pushing and GitHub Pages publication of the reviewed batch on October 19, 2026. Use the existing PR and validation gates. Keep the three additional held files untouched until the owner explains their use.
- **Content posture:** satirical content depicting/quoting the real public figure is authored by the owner via the Suno/Sora suite, gated by `parody-safety-check`; the build itself is content-neutral infrastructure.

## Locked decisions

Astro 6.4.2 static · GitHub Pages · validated-artifact deployment · Tailwind 4.2.0 via `@tailwindcss/vite` (exact-pinned, `npm ci`) · 9 typed content collections · Fraunces + Inter variable fonts (Fontsource) · lite-YouTube · `astro-og-canvas` build-time OG cards. Installed versions and workflow files define the current implementation; `RESOLUTION.md` and root `RUNBOOK.md` retain the earlier decisions.

## Milestones

- **M01 — Launch Satire Hub:** foundation shipped; historical finalization is in `.planning/milestones/M01-launch-satire-hub/FINALIZATION.md`. The current local content batch is unphased maintenance work, not a completion of M02. There are no active phase directories or plan summaries in `.planning/phases/`.
- **M02 — Generalize the Website Pipeline:** extract the 6 build skills into a repeatable multi-site pipeline; validate on a second domain. *(stub — see ROADMAP.md)*

## Reference documents

- `COWORK_HANDOFF.md`, `.planning/HANDOFF.json` and `.planning/STATE.md`: current pause and resume instructions
- `RESOLUTION.md`: historical foundation decisions
- `RUNBOOK.md` (repo root): historical scaffolding narrative; its framework/hosting instructions do not govern the current site
- `booze on hormuz/` — the 6-skill build suite + `brand-pack.md` voice module
- Multi-skill website pipeline architecture — owner memory #22

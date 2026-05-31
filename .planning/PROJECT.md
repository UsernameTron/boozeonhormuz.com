# PROJECT: boozeonhormuz.com

| Field | Value |
|---|---|
| **Domain** | boozeonhormuz.com |
| **Repo** | github.com/UsernameTron/boozeonhormuz.com |
| **Owner** | C. Pete Connor |
| **Created** | 2026-05-30 · **Reconciled** | 2026-05-31 |
| **Status** | NEW_PROJECT — M01 planned, ready for `/gsd:review` |
| **Classification** | MULTI-MILESTONE |

---

## What you're building

A satirical luxury-brand website that is, underneath the premium veneer, the content archive hub for the *Who the Hell Is Don Biggly?* sketch series. Premium aesthetic on the surface; comedy content underneath. Don Biggly is a Donald Trump persona — the site hosts episodes, fake products, sponsor reads, quotes, and a polymorphic "Evidence Lounge" of clips, title cards, AI prompts, commercials, lower-thirds, gallery images, and songs.

## Why it matters

**Distribution surface** for original satirical content under one brand universe, able to absorb an arbitrary number of episodes and artifact types without re-platforming. **Foundation pattern** for a future reusable multi-site website pipeline (M02) — if this build is clean, the next domain takes minutes, not a full session.

## Scope

**In scope (M01)**
- Static Astro 6 site, deployed to GitHub Pages on the custom domain
- Five content collections (one polymorphic) typed with Zod
- CI/CD via GitHub Actions (`withastro/action@v6`)
- Self-hosted variable fonts, optimized image pipeline, lite-YouTube video pattern
- SEO + OG baseline, sitemap, robots, analytics, branch protection, HTTPS, legal pre-flight

**Out of scope (M01)**
- Published content (deferred to Checkpoint A — site is content-free at launch)
- Final brand visual tokens (deferred to Checkpoint B — gates phase-02)
- E-commerce, accounts, comments, forums, any server-side functionality
- The reusable pipeline generalization (that's M02)

## Constraints

- **Minimum effective steps.** No over-engineering. GSD ceremony stays proportional to a 1–3 session build.
- **All hosting free-tier indefinitely.** No paid services.
- **Content-free until finished** — the foundation is intentionally copy-free (owner directive).
- **Content posture:** satirical content depicting/quoting the real public figure is authored by the owner via the Suno/Sora suite, gated by `parody-safety-check`; the build itself is content-neutral infrastructure.

## Locked decisions

Astro 6.4.2 static · GitHub Pages · `withastro/action@v6` · Tailwind 4.3.0 via `@tailwindcss/vite` (exact-pinned, `npm ci`) · 5-collection polymorphic content model · Fraunces + Inter variable fonts (Fontsource) · `astro-embed` lite-YouTube · `astro-og-canvas` build-time OG cards. Full rationale in `RESOLUTION.md` and root `RUNBOOK.md`.

## Milestones

- **M01 — Launch Satire Hub:** site live at boozeonhormuz.com, all infrastructure production-grade, content-free, ready to receive content at Checkpoint A. *(fully planned below)*
- **M02 — Generalize the Website Pipeline:** extract the 6 build skills into a repeatable multi-site pipeline; validate on a second domain. *(stub — see ROADMAP.md)*

## Reference documents

- `RESOLUTION.md` — what changed and why (read first)
- `RUNBOOK.md` (repo root) — richest execution narrative; still valid as reference
- `booze on hormuz/` — the 6-skill build suite + `brand-pack.md` voice module
- Multi-skill website pipeline architecture — owner memory #22

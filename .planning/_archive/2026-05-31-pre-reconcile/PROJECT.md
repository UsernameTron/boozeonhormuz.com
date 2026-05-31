# PROJECT: boozeonhormuz.com

**Domain:** boozeonhormuz.com
**Repo:** github.com/UsernameTron/boozeonhormuz.com
**Owner:** C. Pete Connor
**Created:** 2026-05-30
**Status:** PHASE_PLANNED
**Classification:** SINGLE-MILESTONE

---

## What you're building

A satirical fake-luxury-brand website that functions as a comedy archive hub for the *Who the Hell Is Don Biggly?* sketch series. Premium aesthetic on the surface, sketch content underneath.

## Why it matters

**Distribution surface** for original satirical content under a single brand universe. Hosts an arbitrary number of episodes, fake products, quotes, and sponsor reads without re-platforming. **Foundation pattern** for the future multi-skill website pipeline — if this build is clean, the next domain takes 30 minutes instead of 148 agent steps.

## Scope

**In scope**
- Static Astro 5 site deployed to GitHub Pages on custom domain
- Content collection schemas: episodes, products, quotes, sponsors
- CI/CD via GitHub Actions (official `withastro/action@v3`)
- SEO + OG baseline, analytics, sitemap, robots
- Branch protection on `main`, HTTPS enforcement

**Out of scope**
- Final brand visual identity → deferred to design checkpoint
- Actual content writing → deferred to Checkpoint A per Connor
- E-commerce, user accounts, comments, forums
- Server-side functionality of any kind

## Constraints

- **Minimum effective steps.** No over-engineering.
- **All hosting free-tier indefinitely.** No paid services.
- **Live within one focused session.** ~3 hours total across all three phases.

## Milestones

- **M01 — Launch Satire Hub:** Site live at boozeonhormuz.com with all routes scaffolded, ready to receive content at Checkpoint A.

## Reference documents

- `~/projects/boozeonhormuz-com/content-brief.md` — premium luxury satire framing (uploaded 2026-05-30)
- Multi-skill website pipeline architecture — Connor's memory #22

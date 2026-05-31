# boozeonhormuz.com — Project Context

**One line:** Satirical fake-luxury-brand site that's actually the content archive hub for the *Who the Hell Is Don Biggly?* sketch series.

**Owner:** C. Pete Connor · **Repo:** `UsernameTron/boozeonhormuz.com` · **Started:** 2026-05-30

---

## Why this revision exists

The first plan (GSD-heavy, 9 files) had a wrong content model, an unjustified host choice, an unpinned volatile dependency, and deferred four decisions that belong upstream. This version fixes those and collapses the ceremony to 3 files because the project is a one-to-three-session build, not a multi-week program. GSD's full apparatus returns if this becomes a multi-site content platform.

## What's already wired (pre-existing)

- Domain registered on Namecheap (active through 2027-05-30)
- DNS currently points to GitHub Pages IPs (4 A records + www CNAME)
- Repo exists, public, with a root `CNAME` file
- GitHub Pages enabled from `main`

> **Note:** If you choose Cloudflare Pages (recommended, see RUNBOOK Decision 2), the GitHub Pages DNS gets replaced. That's expected.

## The five locked decisions (full rationale in RUNBOOK)

1. **Framework: Astro 5, static output.** Chosen for component composition (the polymorphic Evidence Lounge needs it), typed content collections, and best-in-class image optimization. 11ty/Hugo build faster but can't compose the heterogeneous archive rendering as cleanly.
2. **Host: Cloudflare Pages (primary) / GitHub Pages (already-wired alternative).** Cloudflare wins for a media archive: unlimited bandwidth, free privacy-preserving analytics, R2 media storage, edge CDN, per-branch previews.
3. **Content model: 5 collections, one polymorphic.** `episodes`, `products`, `sponsors` as typed page collections; `evidence` as a discriminated-union collection absorbing all Evidence Lounge artifact types; `quotes` as a YAML data file.
4. **Styling: Tailwind v4 pinned to an exact patch + committed lockfile + `npm ci` in CI.** v4 ships breaking changes in minor releases — pinning is mandatory, not optional.
5. **Fonts/images/video/legal: decided now, not deferred.** Self-hosted variable fonts (Fraunces + Inter), Astro-optimized images, lite-YouTube embeds, build-time OG cards, and a legal pre-flight checklist.

## Scope

**In:** static Astro site, correct content architecture, working deploy pipe, fonts, image/video pattern, SEO + analytics baseline, legal pre-flight.
**Out:** final published content (Checkpoint A), final visual brand tokens (Checkpoint B). Foundation is intentionally content-free.

## Files in this folder

- `RUNBOOK.md` — the execution script (replaces all GSD phase/PLAN/CONTEXT/STATE files)
- `SKILLS-AND-AGENTS.md` — which Claude skills apply where, supporting subagents, agent-team compositions
- `COWORK_HANDOFF.md` — paste-ready prompt for Cowork execution

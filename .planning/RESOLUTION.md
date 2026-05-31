# RESOLUTION — boozeonhormuz.com planning reconciliation

**Date:** 2026-05-31 · **Owner:** C. Pete Connor · **Author:** planning session
**Status:** Proposed — awaiting approval to install into the repo

This memo settles the conflicts found in `~/projects/boozeonhormuz-com` and records the decisions the regenerated GSD artifacts are built on. Read this first; the artifacts implement it.

---

## 1. The two-plan conflict — resolved

The folder carried two contradictory planning systems:

- **System A (newer):** `PROJECT-CONTEXT.md` + `RUNBOOK.md` + `SKILLS-AND-AGENTS.md` + `COWORK_HANDOFF.md`. Self-describes as the supersede of the older version. Correct content model, decisions locked, Cloudflare-leaning.
- **System B (older):** `PROJECT.md` + `STATE.md` + `todo.md` + six loose `phase-*.md` files. GitHub-Pages-leaning, weaker 4-collection model, GSD phase ceremony at repo root.

**Decision: System A's *technical decisions* win; System B's *GSD form* wins.** They were never really in opposition — A had the right engineering, B had the right structure for how you actually work (`/gsd:review` by peers needs GSD artifacts). The regenerated set takes A's locked decisions and re-expresses them in clean GSD structure under `.planning/`. Everything else gets archived, not deleted.

## 2. Decisions locked (reflecting your answers)

| # | Decision | Value | Source |
|---|---|---|---|
| 1 | Framework | **Astro 6.4.2** (static, `output: 'static'`, no SSR adapter) | Corrected — Astro 6 is current major as of today; RUNBOOK said 5 |
| 2 | Host | **GitHub Pages** (already DNS-wired, ship-ready) | Your answer #5 |
| 3 | Deploy action | **`withastro/action@v6`** | Corrected — RUNBOOK said v3; v6 is current |
| 4 | Styling | **Tailwind 4.3.0 via `@tailwindcss/vite`**, exact-pinned, `npm ci` in CI | RUNBOOK Decision 4 + version verify; `@astrojs/tailwind` is deprecated, do not use |
| 5 | Content model | **5 collections, one polymorphic** (`episodes`, `products`, `sponsors`, `evidence` discriminated-union on `kind`, `quotes` YAML) | RUNBOOK Decision 3 — the v1-mistake fix |
| 6 | Fonts | **Fraunces Variable (display) + Inter Variable (body)**, self-hosted via Fontsource | RUNBOOK Decision 5 |
| 7 | Video | **lite-YouTube embeds** via `astro-embed` — never raw `<iframe>` | RUNBOOK Decision 5 |
| 8 | Images / OG | Astro `<Image>` → AVIF/WebP; build-time OG via `astro-og-canvas`; hero art GPT-4o | RUNBOOK Decision 5 + your global design default |
| 9 | Content at launch | **Content-free** until the build is finished (Checkpoint A) | Your answer #9 |
| 10 | Design tokens | **Settled before page shells** — Checkpoint B gates phase-02 | Your answer #10 |
| 11 | Analytics | Deferred to phase-03; default **Cloudflare Web Analytics beacon** (free, host-agnostic, works on GH Pages) or Plausible | phase-03 open decision |

## 3. Why GitHub Pages is fine despite the bandwidth soft-cap

The RUNBOOK's only strong argument for Cloudflare was media bandwidth (GH Pages soft-caps ~100 GB/mo). That argument collapses here because **video lives on YouTube** (lite-embeds, not self-hosted) and **images are Astro-optimized** (AVIF/WebP, width descriptors). A satire archive driven by YouTube embeds stays well under the cap. GitHub Pages is already wired (DNS → GitHub IPs, `CNAME` in repo, Pages enabled), so we ship today with zero nameserver migration. **Cloudflare remains a clean future migration** if the archive ever self-hosts large media — noted in the ROADMAP, not built now.

## 4. Project shape — MULTI-MILESTONE

You called this "a major project," and the backlog already implies a second shipping unit (the reusable multi-skill website pipeline, your memory #22). So:

- **M01 — Launch Satire Hub** (this site, live, content-ready). Fully scaffolded below.
- **M02 — Generalize the Website Pipeline** (extract the 6 skills into a repeatable pipeline; validate on a second domain). Stub on the ROADMAP.

## 5. The existing skill suite — adopted as the execution method

The `booze on hormuz/` folder already holds 6 skill-forge skills + the brand pack. Rather than ignore or rebuild them, the phase plans **use them as the execution method**: `content-model-architect` → `astro-static-scaffold` → `domain-infra-provisioner` → `deploy-verify` map almost 1:1 onto phase-01. `episode-ingest` + `parody-safety-check` are post-launch. None are deleted. Two corrections needed before they run live (see §7).

## 6. Content posture (one boundary, stated once)

Don Biggly = Donald Trump, per your direction. The engineering work — scaffold, schemas, deploy, components, design system — is all clear and I'll do it. The satirical content that depicts or quotes Trump (copy, lyrics, image prompts) is yours to author via your Suno/Sora suite; I won't ghostwrite that part. The scaffold is content-free until Checkpoint A, so this boundary blocks nothing in M01.

## 7. Two corrections the skill suite needs (folded into the plan)

1. **`brand-pack.md` + `parody-safety-check` were built on "Don Biggly is a composite, NOT one identifiable person."** You've inverted that premise. Both need a one-line posture update, and the Phase 0 **legal pre-flight** (USPTO sweep, right-of-publicity, DMCA designated agent, parody disclaimer in global footer) moves from "nice to have" to a real gate before any content goes public. It does not gate the content-free scaffold.
2. **`domain-infra-provisioner` already exists** as a built skill, contradicting the "deferred until scaffolding exists" constraint. Reconciled: it's used in phase-01 Step 6 for the GitHub Pages deploy path. No rebuild.

## 8. What happens to the old files (on your approval — destructive, so gated)

Nothing is deleted. On your go:
- New GSD set installs to `~/projects/boozeonhormuz-com/.planning/`.
- Superseded root files (`PROJECT.md`, `STATE.md`, `todo.md`, the six `phase-*.md`) move to `.planning/_archive/2026-05-31-pre-reconcile/`.
- `RUNBOOK.md`, `PROJECT-CONTEXT.md`, `SKILLS-AND-AGENTS.md`, `COWORK_HANDOFF.md` stay at root as reference (RUNBOOK is still the richest execution narrative).
- The `boozeonhormuz_don_biggly_knowledge_files (2)/` folder is creative-content tooling, not site code — recommend it moves out of the site repo to a content-production location. Flagged, not touched.

## 9. Definition of done for this track (your #3)

Plan created in GSD form → you run `/gsd:review` in Claude Code so peer subagents validate it → then `/gsd:execute-phase` on phase-01. The artifacts in this folder are the input to `/gsd:review`.

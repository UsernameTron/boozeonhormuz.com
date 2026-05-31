# ROADMAP — boozeonhormuz.com

**Classification:** MULTI-MILESTONE · **Updated:** 2026-05-31

Two shipping units. M01 is the site itself. M02 is the reusable machinery the clean M01 build earns you.

---

## M01 — Launch Satire Hub `ACTIVE`

Live, correctly-architected, production-grade Astro 6 site on the custom domain, content-free, ready for Checkpoint A.

| Phase | Title | State | Est. | Gated by |
|---|---|---|---|---|
| phase-01 | Foundation Setup | PHASE_PLANNED | ~75 min | — |
| **Checkpoint B** | **Brand tokens finalized** | PENDING | — | owner approval (your #10: design before shells) |
| phase-02 | Page Shells | STUB | ~60 min | phase-01 ship + Checkpoint A + Checkpoint B |
| phase-03 | Production Polish | STUB | ~45 min | phase-02 ship |

**Checkpoints (owner-owned, not agent phases):**
- **Checkpoint A — Content concept** locked before any real copy is written. Site ships content-free without it.
- **Checkpoint B — Brand tokens** (`tokens.css` / Tailwind `@theme` block: Fraunces+Inter pairing, luxury-satire palette, spacing, OG card style) finalized before phase-02 page shells. Per owner directive, design is settled before shells, not deferred into them.

**M01 done when:** site resolves on `https://boozeonhormuz.com` over HTTPS, deploy is single-commit, Lighthouse ≥90 on all four scores, branch protection on `main`, legal pre-flight cleared, and every collection renders from a seeded placeholder that is then removed for a content-free launch.

---

## M02 — Generalize the Website Pipeline `STUB`

Turn the one-off M01 build into a repeatable multi-site pipeline. Triggered only after M01 ships clean.

Provisional shape (flesh out via `gsd-planner` when M01 ships):
- Extract `content-model-architect`, `astro-static-scaffold`, `domain-infra-provisioner`, `deploy-verify` into a documented, parameterized pipeline (site-brief in → live site out).
- Add the missing rungs from the original backlog: `site-brief-intake` (or reuse `new-project-intake`), `site-design-system-generator`, `content-architect`, `site-quality-reviewer` (assemble from `design:accessibility-review` + `engineering:code-review` + `searchfit-seo:seo-audit`), `site-iteration-loop`.
- Promote the 6 skills from Local draft → project-scoped → global after 2–3 clean live uses (per their own INDEX deployment rung).
- **Validation gate:** re-run the pipeline on a second domain and measure setup time. Target: minutes, not a full session.

**Future infra option (not M02 scope):** if the archive ever self-hosts large media, migrate host GitHub Pages → Cloudflare Pages (unlimited bandwidth, R2, edge analytics). The phase-01 build is host-agnostic except the deploy step, so this migration is clean.

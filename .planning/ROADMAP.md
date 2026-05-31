# ROADMAP — boozeonhormuz.com

**Classification:** MULTI-MILESTONE · **Updated:** 2026-05-31 (reconciled)

Two shipping units. M01 is the site itself (shipped). M02 is the reusable machinery the clean M01 build earns you.

---

## M01 — Launch Satire Hub `SHIPPED`

Live, correctly-architected, production-grade Astro 6 site on the custom domain. Shipped and in maintenance; content drops in owner-paced.

| Phase | Title | State | Shipped |
|---|---|---|---|
| phase-01 | Foundation Setup | ✅ DONE | PR #1 |
| **Checkpoint B** | **Brand tokens finalized** | ✅ RESOLVED | "Don Biggly grift" dark theme (PRs #7, #8) |
| phase-02 | Page Shells | ✅ DONE | full 8-route IA, content-free shells |
| phase-03 | Production Polish | ✅ DONE | PR #10 (OG/sitemap/robots/analytics, `/legal`, Lighthouse CI) |
| phase-04 | Creative Tools | ✅ DONE | PR #12 (integration) + PR #13 (UX/a11y polish) |

**Checkpoints (owner-owned):**
- **Checkpoint A — Content concept:** the IA exists; real content (songs/images/copy) is generated via the content factory and dropped in per collection. Evidence Lounge has its first title-card exhibits (PR #9).
- **Checkpoint B — Brand tokens:** ✅ resolved — locked `@theme` (black + gold "grift" palette, Fraunces+Inter, legal-stamp red) in `src/styles/global.css`.

**phase-04 — Creative Tools** (add-on, not in the original M01 plan):
- Phase 1: `/tools` hub + two iframe-embedded prompt generators (Broadcast Room, Evidence Lounge Studio) + `/tools/safety`; route-collision with `/evidence-lounge` content page avoided.
- Phase 2: Compare-mode removed, Evidence Lounge made responsive, `prompt()`→modal, both tools to **1.0 Lighthouse accessibility**, destination chips, data-loss notes; Lighthouse gate scopes `/apps/*` (iframe sources) appropriately.
- Deferred to a future phase: shared CSS/JS extraction, self-host tool fonts, JSON-import hardening, Melania→fictional-character rename, shareable prompt URLs, top-bar narrow-width polish.

**M01 done when (met):** site resolves on `https://boozeonhormuz.com` over HTTPS ✅, deploy is single-commit ✅, Lighthouse CI gate enforced ✅, legal pre-flight cleared (`/legal` + global disclaimer) ✅, every collection renders a deadpan empty state for a content-free launch ✅. (Branch-protection hardening on `main` remains an owner GitHub-settings task.)

---

## M02 — Generalize the Website Pipeline `STUB · UNBLOCKED`

Turn the one-off M01 build into a repeatable multi-site pipeline. M01 has shipped, so this milestone is now eligible to start when the owner chooses; flesh out via `/gsd:new-milestone` → `gsd-roadmapper`.

Provisional shape (flesh out via `gsd-planner` when M01 ships):
- Extract `content-model-architect`, `astro-static-scaffold`, `domain-infra-provisioner`, `deploy-verify` into a documented, parameterized pipeline (site-brief in → live site out).
- Add the missing rungs from the original backlog: `site-brief-intake` (or reuse `new-project-intake`), `site-design-system-generator`, `content-architect`, `site-quality-reviewer` (assemble from `design:accessibility-review` + `engineering:code-review` + `searchfit-seo:seo-audit`), `site-iteration-loop`.
- Promote the 6 skills from Local draft → project-scoped → global after 2–3 clean live uses (per their own INDEX deployment rung).
- **Validation gate:** re-run the pipeline on a second domain and measure setup time. Target: minutes, not a full session.

**Future infra option (not M02 scope):** if the archive ever self-hosts large media, migrate host GitHub Pages → Cloudflare Pages (unlimited bandwidth, R2, edge analytics). The phase-01 build is host-agnostic except the deploy step, so this migration is clean.

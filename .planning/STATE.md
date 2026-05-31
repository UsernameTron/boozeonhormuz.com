# STATE — boozeonhormuz.com

**Last updated:** 2026-05-31

## Current state

- **Project state:** M01 SHIPPED — site live, all phases (01–04) merged
- **Classification:** MULTI-MILESTONE
- **Active milestone:** M01 complete; M02 (pipeline) not started
- **Active phase:** phase-04 (Creative Tools) → SHIPPED (PRs #12, #13 merged to `main`)
- **Phase state:** site live at https://boozeonhormuz.com over HTTPS; deploy single-commit via `withastro/action@v6`; Lighthouse CI gate enforced and green. `/tools` hub + two prompt generators live; both tools at 1.0 Lighthouse accessibility.

## Milestone ledger

| Milestone | Title | State |
|---|---|---|
| M01 | Launch Satire Hub | ✅ SHIPPED — phases 01–04 merged; content drops owner-paced |
| M02 | Generalize the Website Pipeline | STUB · UNBLOCKED (start via `/gsd:new-milestone`) |

## Phase ledger (M01)

| Phase | Title | State | Shipped |
|---|---|---|---|
| phase-01 | Foundation Setup | ✅ DONE | PR #1 |
| phase-02 | Page Shells | ✅ DONE | full 8-route IA |
| phase-03 | Production Polish | ✅ DONE | PR #10 |
| phase-04 | Creative Tools (Phase 1 + Phase 2) | ✅ DONE | PR #12, PR #13 |

## Infrastructure baseline (pre-existing, owner-confirmed)

- ✅ Domain registered (Namecheap, active through 2027-05-30)
- ✅ DNS: 4 A records at apex → GitHub Pages IPs; `www` CNAME → `usernametron.github.io`
- ✅ Repo `UsernameTron/boozeonhormuz.com` exists, public
- ✅ GitHub Pages enabled; root `CNAME` file present
- ✅ Host decision locked: **GitHub Pages** (no Cloudflare migration in M01)

## Reconciliation note (2026-05-31)

Superseded files (`PROJECT.md`, `STATE.md`, `todo.md`, `phase-0{1,2,3}-{CONTEXT,PLAN}.md` at repo root) are slated to move to `.planning/_archive/2026-05-31-pre-reconcile/` on owner approval. `RUNBOOK.md` + `PROJECT-CONTEXT.md` retained at root as reference. Stack corrected to Astro 6.4.2 + `withastro/action@v6` (were 5 / v3).

## Next action

M01 is shipped. Open threads, owner's choice of priority:

1. **Content drops (owner-paced):** generate songs/images/copy via the content factory; set `draft: false` per collection entry. Each drop is one `git push`.
2. **Creative Tools — remaining future-phase items:** shared CSS/JS extraction across the two tools (sizable refactor); JSON-import hardening (validation + caps); shareable prompt URLs (feature design). _Done:_ top-bar polish (#14), Melania→"First Lady of the Lounge" rename (#15), self-hosted tool fonts (#15, no more Google CDN).
3. **M02 — Generalize the Website Pipeline:** start via `/gsd:new-milestone` when ready.
4. **Repo hardening (owner):** branch protection on `main` (GitHub settings).

## History

- **phase-01** (PR #1): foundation + deploy pipe; HTTPS enforcement enabled early. Codex review: MEDIUM, 7 findings all fixed; Tailwind/Vite pin corrected (`@tailwindcss/vite` 4.3.0→4.2.0).
- **phase-02 / Checkpoint B**: dark "grift" theme + full page-shell IA (PRs #7, #8).
- **phase-03** (PR #10): OG/sitemap/robots/analytics, `/legal` + LICENSE, Lighthouse CI.
- **phase-04** (PRs #12, #13): `/tools` hub + two iframe-embedded prompt generators; Phase 2 polish took both tools to 1.0 Lighthouse accessibility.

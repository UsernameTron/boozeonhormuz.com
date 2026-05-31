# M01 — Launch Satire Hub · Finalization Report

**Finalized:** 2026-05-31 · **Status:** SHIPPED · **Live:** https://boozeonhormuz.com

End-of-milestone close-out via `/gsd:finalize`. M01 is complete and deployed; M02
(pipeline generalization) is intentionally unstarted.

## Outcome

A live, production-grade static Astro 6 site on the apex domain over HTTPS, single-commit
deploy via GitHub Actions (`withastro/action@v6`), with a Lighthouse CI gate. Surface: a
deadpan-luxury satire brand. Underneath: the content archive for *Who the Hell Is Don
Biggly?*, plus a `/tools` suite of browser-only prompt generators.

## Phases shipped

| Phase | Title | PR(s) |
|---|---|---|
| phase-01 | Foundation Setup (build + deploy pipe, HTTPS) | #1 |
| Checkpoint B | Brand tokens — dark "grift" theme | #7, #8 |
| phase-02 | Page Shells — full 8-route IA, content-free | (IA build) |
| phase-03 | Production Polish — OG/sitemap/robots/analytics, `/legal`, Lighthouse CI | #10 |
| phase-04 | Creative Tools — `/tools` hub + two generators + safety | #12, #13 |

First content: Evidence Lounge title-card exhibits (#9).

## Creative Tools (phase-04) detail

- **Phase 1** (#12): `/tools` hub + Broadcast Room + Evidence Lounge Studio + `/tools/safety`,
  each tool iframe-embedded inside BaseLayout (Nav + Footer + global disclaimer). Resolved the
  `/evidence-lounge` content-vs-tool route collision.
- **Phase 2** (#13): removed Compare mode, made Evidence Lounge responsive, `prompt()`→modal,
  destination chips, data-loss notes, full a11y pass → **both tools 1.0 Lighthouse accessibility**.
- **Polish** (#14 top-bar; #15 First Lady rename + self-hosted fonts; #17 JSON-import hardening;
  #18 shareable prompt URLs). Bookkeeping: #16, #19.
- **Deferred (own scoped phase, owner-declined for now):** shared CSS/JS extraction across the
  two tools.

## Final verification (Gate 2)

| Check | Result |
|---|---|
| `npx astro check` | PASS — 0 errors, 0 warnings |
| `npm run build` | PASS — 12 pages |
| `public/CNAME` in `dist/` | PASS |
| sitemap generated | PASS |
| tool fonts vendored in `dist/fonts/` | PASS |
| Lighthouse CI (per-PR) | PASS — `/apps/*` accessibility `error@0.9`, both tools 1.0 |

## Metrics

- Git commits: ~21 · First commit: 2026-05-30 · Shipped: 2026-05-31
- PRs merged this milestone: #1, #5, #7–#19 (foundation through finalize)

## Open threads (not blocking)

1. Content drops (owner-paced) — set `draft: false` per collection entry.
2. Creative Tools: shared CSS/JS extraction (deferred refactor).
3. M02 — Generalize the Website Pipeline (`/gsd:new-milestone` when ready).
4. Repo hardening — branch protection on `main` (GitHub setting, owner).

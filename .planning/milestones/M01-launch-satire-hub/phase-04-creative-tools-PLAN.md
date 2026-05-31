# Phase 04 — Creative Tools Integration (Phase 1: Clean Integration)

**Created:** 2026-05-31
**Milestone:** M01 — Launch Satire Hub (add-on phase; not in original ROADMAP M01/M02)
**State:** PLANNED → IN_PROGRESS
**Branch:** `feat/creative-tools-integration`

> **Roadmap drift note:** ROADMAP.md / STATE.md still mark phase-02/03 as STUB, but git
> history (#9, #10, #11) shows both shipped. This phase is new scope not on either
> milestone. Full `/gsd:plan-phase` research→verify→nyquist orchestration was deliberately
> skipped — the work is a well-scoped, already-reviewed 6-file Astro integration. Plan
> derived from the approved review's Phase 1 checklist.

## Goal

Incorporate two existing standalone HTML tools into the site under a `/tools` hub:
brand-consistent, mobile-safe entry, global parody disclaimer wrapping each tool.

## Approach: iframe-in-BaseLayout

Each tool ships a full `* { margin:0 }` reset and its own `:root` token set that would
collide with Tailwind 4 `@theme` / `global.css` if inlined. Embed each via an isolated
`<iframe>` inside a BaseLayout Astro page → tool styling stays sandboxed, but `Nav` +
`Footer` + the global disclaimer render around it. Native port deferred to Phase 3.

## Tasks

1. **[done] Move raw files** → `public/apps/` with clean names:
   - `booze-on-hormuz-evidence-lounge-prompt-generator.html` → `public/apps/evidence-lounge-studio.html`
   - `preview (1).html` → `public/apps/broadcast-room.html`
2. **`/tools` hub** (`src/pages/tools/index.astro`): one-click promo, "No login / No API key /
   No backend" banner, "builds copy-ready prompts, not live AI generations" explainer,
   comparison card, two primary CTAs.
3. **`/tools/broadcast-room`** (featured): BaseLayout + PageHeader + iframe →
   `/apps/broadcast-room.html` + cross-tool nav + breadcrumb.
4. **`/tools/evidence-lounge-studio`** (advanced): same shape; site-branded "best on
   desktop" note above the iframe (the tool is desktop-gated internally; full responsive
   rebuild is Phase 2).
5. **`/tools/safety`**: satire/safety guardrails page; linked from tool pages.
6. **Nav**: add `Tools` link.
7. **Verify** (gates below).

## Route-collision guard

Existing `/evidence-lounge` is a CONTENT route (exhibit gallery) and MUST keep working.
Tool mounts at `/tools/evidence-lounge-studio`. Brand phrase shared; URLs disjoint.

## Verification gates

- [ ] `npm run build` succeeds
- [ ] `npx astro check` exits 0
- [ ] `/tools`, `/tools/broadcast-room`, `/tools/evidence-lounge-studio`, `/tools/safety`
      render with Nav + Footer + disclaimer
- [ ] both iframes load their tool from `/apps/`
- [ ] `/evidence-lounge` content route still renders (no collision)
- [ ] `public/CNAME` present in `dist/`
- [ ] new pages appear in `dist/sitemap-index.xml` / `sitemap-0.xml`

## Out of scope (Phase 2/3/4)

Evidence Lounge responsive rebuild, a11y pass, `prompt()` modal, Compare-mode finish,
shared CSS/JS extraction, font self-hosting, JSON-import hardening, Melania→fictional
rename, shareable prompt URLs.

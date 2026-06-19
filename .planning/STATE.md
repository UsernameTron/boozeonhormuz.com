# STATE — boozeonhormuz.com

**Last updated:** 2026-06-19

## Current state

- **Project state:** M01 SHIPPED — site live, all phases (01–04) merged
- **Classification:** MULTI-MILESTONE
- **Active milestone:** M01 complete; M02 (pipeline) not started
- **Active phase:** phase-04 (Creative Tools) → SHIPPED (PRs #12, #13 merged to `main`)
- **Phase state:** site live at https://boozeonhormuz.com over HTTPS; deploy single-commit via `withastro/action@v6`; Lighthouse CI gate enforced and green. `/tools` hub + two prompt generators live; both tools at 1.0 Lighthouse accessibility.

## Active session handoff — 2026-06-19 (post-launch: mobile nav + /about)

**Branch:** `feat/homepage-mobile-nav-and-about` (commit `bf5c5e2`) — NOT pushed, NO PR yet.
**Plan file:** `~/.claude/plans/reviewed-the-below-feedback-cheerful-floyd.md` (full context + the validation table).
**Trigger:** a 2026-06-18 full-site review. Most of its "misses" were validated as **empty-by-design** (working infra awaiting owner content), NOT defects — read the plan's validation table before re-chasing any of them.

### Done + verified (committed on the branch)
- **Homepage mobile nav (`src/pages/index.html`)** — the one genuine bug. Hamburger + slide-in drawer (≤920px) exposing in-page anchors AND real site routes; added Watch + Evidence Lounge to the desktop bar; full a11y (aria-expanded, Esc/backdrop/link close, focus trap, scroll-lock, reduced-motion) + a `.nav-drawer[hidden]` override so the closed drawer is truly `display:none` (not off-screen-tabbable).
- **`/about` (`src/pages/about.astro`)** — replaced the placeholder with a full in-character bio + a portrait `<figure>` using the products-grid `onerror` graceful-degrade pattern.
- **Verification:** `npx astro check` 0 errors · `npm run build` 12 pages · headless Playwright 18/18 assertions, 0 console errors (open/close/Esc/navigate @390px + desktop breakpoint).

### Open items (resume here)
1. **Owner assets — zero code, drop-in** (pages degrade gracefully until present):
   - `public/products/` (4:5, ~1200×1500, ≤200KB): `hormuz-decanter.webp`, `discovery-proof-briefcase.webp`, `premium-panic-cufflinks.webp`, `legal-disclaimer-cologne.webp`
   - `public/sponsors/` (16:9, ~1600×900, ≤200KB): `hormuz-yacht-fuel.webp`, `discovery-shredding.webp`, `panic-room-realty.webp`, `legal-ish-insurance.webp`
   - `public/don-biggly-portrait.webp` (4:5, ~1000×1250, implied-Don / no identifiable face)
   - Per-image subjects live in the `alt`/`note`/`blurb` fields of `products/index.astro` + `sponsor-reads.astro`; art direction in the plan file.
2. **Decision pending (owner):** keep the 2 added desktop-nav links (Watch, Evidence Lounge) or drop them for a cleaner desktop bar? Mobile drawer + footer already cover routes.
3. **Ship:** push branch + open PR (`/commit-push-pr` or `/gsd:ship`) when ready. CI runs Lighthouse on the PR.

### Notes
- Stray generated `Booze-on-Hormuz-Technical-Spec.docx` is locally ignored via `.git/info/exclude` (uncommitted); the permanent tracked-gitignore lives on the separate `chore/ignore-spec-docx` branch.
- Separate `docs/claude-md-init-header` branch holds unrelated CLAUDE.md edits (init header + EvidenceCard pointer) — also unpushed.
- **Out-of-scope per validation, do NOT re-chase:** video "buried" (refuted — it's mid-page), chat widget "orange clash" (refuted — it's brand-red `--flare`), populating episodes/quotes (intentional empty states).

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
2. **Creative Tools — one remaining future-phase item:** shared CSS/JS extraction across the two tools (sizable refactor — best as its own scoped phase). _Done:_ top-bar polish (#14), First Lady rename (#15), self-hosted fonts (#15), JSON-import hardening (#17), shareable prompt URLs (#18).
3. **M02 — Generalize the Website Pipeline:** start via `/gsd:new-milestone` when ready.
4. **Repo hardening (owner):** branch protection on `main` (GitHub settings).

## History

- **phase-01** (PR #1): foundation + deploy pipe; HTTPS enforcement enabled early. Codex review: MEDIUM, 7 findings all fixed; Tailwind/Vite pin corrected (`@tailwindcss/vite` 4.3.0→4.2.0).
- **phase-02 / Checkpoint B**: dark "grift" theme + full page-shell IA (PRs #7, #8).
- **phase-03** (PR #10): OG/sitemap/robots/analytics, `/legal` + LICENSE, Lighthouse CI.
- **phase-04** (PRs #12, #13): `/tools` hub + two iframe-embedded prompt generators; Phase 2 polish took both tools to 1.0 Lighthouse accessibility.

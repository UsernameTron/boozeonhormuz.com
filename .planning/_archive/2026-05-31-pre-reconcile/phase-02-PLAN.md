# Phase 02 — PLAN: Page Shells (STUB)

> **Status:** STUB. Do not execute. Flesh out when phase-01 is PHASE_AWAITING_SHIP and Checkpoints A (content concept) and B (visual direction) are complete.

## High-level shape

1. **Build shared components** — Nav, Footer, EpisodeCard, ProductCard, QuoteCard, Disclaimer
2. **Build static pages** — `/`, `/evidence-lounge`, `/about`
3. **Build dynamic routes** — `/watch/[slug]`, `/products/[slug]`
4. **Build collection-index pages** — `/watch`, `/products`, `/sponsor-reads`, `/quotes`
5. **Seed 1 placeholder entry per collection** to verify rendering
6. **Visual QA pass** on every route
7. **Commit + push** — single PR titled `phase-02: page shells`

## Estimated build

~60 minutes after both checkpoints clear.

## Open decisions

- Whether to use Astro view transitions for nav (yes if perf budget allows)
- Whether to add a `/legal/parody-disclaimer` route or inline it in `Footer.astro`
- Image strategy: external CDN vs `src/assets/` with Astro's `<Image>` optimization

## Next action

When phase-01 ships and Checkpoint A clears, re-run `gsd-planner` with the prompt: *"flesh out phase-02-PLAN.md for boozeonhormuz-com"*.

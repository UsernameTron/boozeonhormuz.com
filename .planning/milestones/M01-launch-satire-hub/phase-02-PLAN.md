# Phase 02 — PLAN: Page Shells (STUB)

> **Status:** STUB. Do not execute. Flesh out when phase-01 is PHASE_AWAITING_SHIP **and** Checkpoint A (content concept) **and** Checkpoint B (brand tokens) are both complete. Per owner directive, brand tokens are settled before shells — Checkpoint B is a hard gate, not an in-phase decision.

## What this phase produces

Empty page shells for every route the brief implies, each rendering from content collections with placeholder copy in the established satirical voice (from `brand-pack.md`). Real content still follows Checkpoint A.

## Routes to scaffold

- `/` — homepage (hero, latest-episode embed slot, fake-testimonial section)
- `/watch` — episode index · `/watch/[slug]` — single episode
- `/evidence-lounge` — polymorphic archive landing (renders by `evidence.kind`)
- `/products` — fake-products index · `/products/[slug]` — single product
- `/sponsor-reads` — sponsor-reads index
- `/quotes` — quote-card grid (from `quotes.yaml`)
- `/about` — About Don Biggly

## Shared components

`Nav.astro`, `Footer.astro` (already carries the disclaimer), `EpisodeCard.astro`, `ProductCard.astro`, `QuoteCard.astro`, `EvidenceCard.astro` (switches on `kind`), `Disclaimer.astro`, `YouTubeEmbed.astro` (wraps `astro-embed` lite pattern).

## Inputs

- All phase-01 outputs (Astro live, deploy pipe green)
- Final brand tokens from Checkpoint B (`tokens.css` / `@theme`)
- Content schemas (already defined in phase-01)

## Outputs

- ~10 `.astro` pages + the shared component set
- One seeded placeholder entry per collection to verify rendering, removed before any content-free re-launch
- `BaseLayout.astro` updated with finalized nav + footer

## What this phase will NOT do

- Write final published copy (Checkpoint A → content authoring, owner-led)
- Embed real video URLs (placeholder IDs only)
- Production image-asset generation
- Analytics / SEO meta / sitemap (phase-03)

## High-level shape

1. Shared components → 2. Static pages (`/`, `/evidence-lounge`, `/about`) → 3. Dynamic routes (`/watch/[slug]`, `/products/[slug]`) → 4. Collection-index pages → 5. Seed 1 placeholder per collection → 6. Visual QA every route → 7. Single PR `phase-02: page shells`.

## Open decisions

- Astro view transitions for nav (yes if perf budget allows)
- `/legal/parody-disclaimer` route vs inline in `Footer.astro`
- Evidence Lounge layout: unified masonry vs per-`kind` sections

## Next action

When phase-01 ships and Checkpoints A + B clear, re-run `gsd-planner`: *"flesh out phase-02-PLAN.md for boozeonhormuz-com"*.

**Est. build:** ~60 min after both checkpoints clear.

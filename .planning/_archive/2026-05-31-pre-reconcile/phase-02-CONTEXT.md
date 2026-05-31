# Phase 02 — CONTEXT: Page Shells (STUB)

> **Phase state:** STUB — flesh out when phase-01 reaches PHASE_AWAITING_SHIP, and after Checkpoint A confirms content direction.

## What this phase will produce

Empty page shells for every route the brief implies, each rendering from content collections with **placeholder copy that conforms to the established satirical voice**. No real content yet — that follows Checkpoint A.

## Routes to scaffold

- `/` — Homepage (hero, latest episode embed slot, fake testimonial section)
- `/watch` — Episode index (lists from `episodes` collection)
- `/watch/[slug]` — Single episode page (dynamic route)
- `/evidence-lounge` — Archive landing (clips, title cards, prompts, lower-thirds, gallery)
- `/products` — Fake products index
- `/products/[slug]` — Single product page
- `/sponsor-reads` — Sponsor reads index
- `/quotes` — Quote machine
- `/about` — About Don Biggly

## Inputs

- All of phase-01's outputs (Astro working, deploy pipe live)
- Content collection schemas (already defined)
- Final brand direction (from design-system checkpoint — Checkpoint B)

## Outputs

- ~10 `.astro` pages
- Shared components: `Nav.astro`, `Footer.astro`, `EpisodeCard.astro`, `ProductCard.astro`, `QuoteCard.astro`, `Disclaimer.astro`
- Updated `BaseLayout.astro` with finalized nav + footer

## What this phase will NOT do

- Write final published copy (that's Checkpoint A → content authoring)
- Embed real video URLs (placeholder embeds only)
- Image asset production
- Set up analytics (phase-03)

## Estimated build

~60 minutes after Checkpoint A clears.
